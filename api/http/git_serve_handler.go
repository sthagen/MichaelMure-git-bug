// Git smart HTTP handler — serves git clone and push using native git
// subprocesses (git-upload-pack / git-receive-pack --stateless-rpc).
//
// Security notes:
//   - No shell is used; exec.Command receives explicit argument slices.
//   - The subprocess environment is sanitised: variables that could redirect
//     git's operations (GIT_DIR, GIT_EXEC_PATH, GIT_SSH, …) are stripped.
//   - The repository path is resolved from our internal config, never from
//     URL parameters or request body content.
//   - Client stderr is captured and discarded; it is never forwarded to the
//     HTTP response.
//
// Routes (registered on the /api/repos/{owner}/{repo} subrouter):
//
//	GET  /info/refs?service=git-{upload,receive}-pack  → capability advertisement
//	POST /git-upload-pack                               → fetch / clone
//	POST /git-receive-pack                              → push (blocked in read-only mode)

package http

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"

	pktline "github.com/go-git/go-git/v5/plumbing/format/pktline"

	"github.com/git-bug/git-bug/cache"
)

// GitServeHandler exposes the repository over git's smart HTTP protocol.
type GitServeHandler struct {
	mrc      *cache.MultiRepoCache
	readOnly bool
}

func NewGitServeHandler(mrc *cache.MultiRepoCache, readOnly bool) *GitServeHandler {
	return &GitServeHandler{mrc: mrc, readOnly: readOnly}
}

// ServeInfoRefs handles GET /info/refs — the capability advertisement step.
// Runs `git {upload,receive}-pack --stateless-rpc --advertise-refs` and
// prepends the required PKT-LINE service header.
// For upload-pack the advertised refs are filtered to heads and tags only so
// that cloners do not inadvertently fetch git-bug internal objects.
func (h *GitServeHandler) ServeInfoRefs(w http.ResponseWriter, r *http.Request) {
	service := r.URL.Query().Get("service")
	if service != "git-upload-pack" && service != "git-receive-pack" {
		http.Error(w, "unknown service", http.StatusForbidden)
		return
	}
	if service == "git-receive-pack" && h.readOnly {
		http.Error(w, "repository is read-only", http.StatusForbidden)
		return
	}

	repoPath, err := h.repoPathFor(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// "git-upload-pack" → "upload-pack", "git-receive-pack" → "receive-pack"
	subCmd := strings.TrimPrefix(service, "git-")

	cmd := exec.CommandContext(r.Context(),
		"git", subCmd, "--stateless-rpc", "--advertise-refs", repoPath)
	cmd.Env = safeGitEnv()

	out, err := cmd.Output()
	if err != nil {
		http.Error(w, "git advertisement failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Content-Type", fmt.Sprintf("application/x-%s-advertisement", service))

	// PKT-LINE service header required by the smart HTTP protocol.
	enc := pktline.NewEncoder(w)
	if err := enc.EncodeString(fmt.Sprintf("# service=%s\n", service)); err != nil {
		return
	}
	if err := enc.Flush(); err != nil {
		return
	}

	// For upload-pack, filter out internal git-bug refs (refs/bugs/,
	// refs/identities/, …) so cloners only receive source code objects.
	if service == "git-upload-pack" {
		_ = writeFilteredInfoRefs(w, out)
	} else {
		_, _ = w.Write(out)
	}
}

// ServeUploadPack handles POST /git-upload-pack — serves a fetch or clone.
// The request body is piped directly to `git upload-pack --stateless-rpc`.
func (h *GitServeHandler) ServeUploadPack(w http.ResponseWriter, r *http.Request) {
	repoPath, err := h.repoPathFor(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	body, err := requestBody(r)
	if err != nil {
		http.Error(w, "decompressing request: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer body.Close()

	cmd := exec.CommandContext(r.Context(),
		"git", "upload-pack", "--stateless-rpc", repoPath)
	cmd.Env = safeGitEnv()
	cmd.Stdin = body

	w.Header().Set("Content-Type", "application/x-git-upload-pack-result")
	w.Header().Set("Cache-Control", "no-cache")
	cmd.Stdout = w

	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	// Errors after this point can't change the HTTP status (headers already
	// committed on first write), so we just return silently.
	_ = cmd.Run()
}

// ServeReceivePack handles POST /git-receive-pack — accepts a push.
// Before running git, the PKT-LINE ref-update commands are parsed so that the
// git-bug cache can be synchronised for any git-bug namespaces that were
// updated.
func (h *GitServeHandler) ServeReceivePack(w http.ResponseWriter, r *http.Request) {
	if h.readOnly {
		http.Error(w, "repository is read-only", http.StatusForbidden)
		return
	}

	repoPath, err := h.repoPathFor(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	body, err := requestBody(r)
	if err != nil {
		http.Error(w, "decompressing request: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer body.Close()

	// Parse the PKT-LINE ref-update commands so we know which git-bug entities
	// to resync after the push completes.  The full request body is
	// reconstructed (commands + flush + packfile) for git's stdin.
	updatedRefs, fullBody, err := parseReceivePackCommands(body)
	if err != nil {
		http.Error(w, "parsing receive-pack request: "+err.Error(), http.StatusBadRequest)
		return
	}

	cmd := exec.CommandContext(r.Context(),
		"git", "receive-pack", "--stateless-rpc", repoPath)
	cmd.Env = safeGitEnv()
	cmd.Stdin = fullBody

	w.Header().Set("Content-Type", "application/x-git-receive-pack-result")
	w.Header().Set("Cache-Control", "no-cache")
	cmd.Stdout = w

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		// Headers may already be committed; best-effort return.
		return
	}

	h.syncAfterPush(r, updatedRefs)
}

// ── helpers ───────────────────────────────────────────────────────────────────

// repoPathFor returns the filesystem path of the repository referenced in the
// request URL variables.  The path is always resolved from our internal
// MultiRepoCache configuration — it is never derived from request content.
func (h *GitServeHandler) repoPathFor(r *http.Request) (string, error) {
	rc, err := repoFromPath(h.mrc, r)
	if err != nil {
		return "", err
	}
	return rc.GetPath(), nil
}

// syncAfterPush updates the git-bug in-memory cache for any refs that were
// updated by the push.
func (h *GitServeHandler) syncAfterPush(r *http.Request, refs []string) {
	if len(refs) == 0 {
		return
	}
	rc, err := repoFromPath(h.mrc, r)
	if err != nil {
		return
	}
	_ = rc.SyncLocalRefs(refs)
}

// writeFilteredInfoRefs re-encodes the raw PKT-LINE advertisement output from
// git, keeping only HEAD and refs/heads/* and refs/tags/*.  The first line is
// always forwarded unchanged because it carries the server capability list
// (appended after a NUL byte).
func writeFilteredInfoRefs(w io.Writer, raw []byte) error {
	scanner := pktline.NewScanner(bytes.NewReader(raw))
	enc := pktline.NewEncoder(w)
	first := true
	for scanner.Scan() {
		b := scanner.Bytes()
		if len(b) == 0 { // flush packet
			return enc.Flush()
		}
		if first {
			// First line always passes — it carries server capabilities.
			first = false
			if err := enc.Encode(b); err != nil {
				return err
			}
			continue
		}
		// Lines are "<sha> <refname>\n"; strip the newline to get the ref name.
		line := strings.TrimSuffix(string(b), "\n")
		parts := strings.SplitN(line, " ", 2)
		if len(parts) == 2 {
			ref := parts[1]
			if strings.HasPrefix(ref, "refs/heads/") || strings.HasPrefix(ref, "refs/tags/") {
				if err := enc.Encode(b); err != nil {
					return err
				}
			}
		}
	}
	return scanner.Err()
}

// parseReceivePackCommands reads the PKT-LINE ref-update command lines from the
// receive-pack request body (up to and including the flush packet), extracts
// the ref names, and returns an io.Reader that replays the full original body
// (commands + flush + packfile) for the git subprocess.
func parseReceivePackCommands(r io.Reader) (refs []string, full io.Reader, err error) {
	// TeeReader mirrors everything consumed by the scanner into cmds, so we
	// can replay it verbatim later.
	var cmds bytes.Buffer
	scanner := pktline.NewScanner(io.TeeReader(r, &cmds))
	for scanner.Scan() {
		b := scanner.Bytes()
		if len(b) == 0 { // flush — end of command list
			break
		}
		// Command format: "<old-sha> <new-sha> <refname>\0<caps>" (first line)
		//              or "<old-sha> <new-sha> <refname>"          (subsequent)
		line := strings.TrimSuffix(string(b), "\n")
		if i := strings.IndexByte(line, 0); i >= 0 {
			line = line[:i] // strip NUL + capability list
		}
		parts := strings.SplitN(line, " ", 3)
		if len(parts) == 3 {
			refs = append(refs, parts[2])
		}
	}
	if err = scanner.Err(); err != nil {
		return nil, nil, err
	}
	// cmds holds [commands + flush]; r holds the remaining packfile data.
	return refs, io.MultiReader(&cmds, r), nil
}

// requestBody returns the request body, transparently decompressing it when
// the client sent Content-Encoding: gzip (git does this by default).
func requestBody(r *http.Request) (io.ReadCloser, error) {
	if r.Header.Get("Content-Encoding") == "gzip" {
		gr, err := gzip.NewReader(r.Body)
		if err != nil {
			return nil, err
		}
		return gr, nil
	}
	return r.Body, nil
}

// safeGitEnv returns a sanitised copy of the process environment for use with
// git subprocesses.  Variables that could redirect git's operations to
// unintended paths or trigger credential prompts are removed.
func safeGitEnv() []string {
	// These variables could redirect git internals to attacker-controlled
	// paths or commands when the git-bug server process itself inherits a
	// tainted environment.
	blocked := map[string]bool{
		"GIT_DIR":                          true,
		"GIT_WORK_TREE":                    true,
		"GIT_INDEX_FILE":                   true,
		"GIT_OBJECT_DIRECTORY":             true,
		"GIT_ALTERNATE_OBJECT_DIRECTORIES": true,
		"GIT_EXEC_PATH":                    true,
		"GIT_SSH":                          true,
		"GIT_SSH_COMMAND":                  true,
		"GIT_PROXY_COMMAND":                true,
		"GIT_ASKPASS":                      true,
		"SSH_ASKPASS":                      true,
		"GIT_TRACE":                        true,
		"GIT_TRACE_PACKET":                 true,
		"GIT_TRACE_PERFORMANCE":            true,
	}
	parent := os.Environ()
	safe := make([]string, 0, len(parent)+1)
	for _, kv := range parent {
		key := kv
		if i := strings.IndexByte(kv, '='); i >= 0 {
			key = kv[:i]
		}
		if !blocked[key] {
			safe = append(safe, kv)
		}
	}
	// Prevent git from blocking on a credential/passphrase prompt, which
	// would hang the HTTP handler goroutine.
	safe = append(safe, "GIT_TERMINAL_PROMPT=0")
	return safe
}
