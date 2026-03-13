package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"

	"github.com/git-bug/git-bug/cache"
	"github.com/git-bug/git-bug/repository"
)

// ── shared helpers ────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// repoFromPath resolves the repository from the {owner} and {repo} mux path
// variables. "_" is the wildcard value: owner is always ignored (single-owner
// for now), and repo "_" resolves to the default repository.
func repoFromPath(mrc *cache.MultiRepoCache, r *http.Request) (*cache.RepoCache, error) {
	repoVar := mux.Vars(r)["repo"]
	if repoVar == "_" {
		return mrc.DefaultRepo()
	}
	return mrc.ResolveRepo(repoVar)
}

// browseRepo resolves the repository and asserts it implements RepoBrowse.
func browseRepo(mrc *cache.MultiRepoCache, r *http.Request) (repository.ClockedRepo, repository.RepoBrowse, error) {
	rc, err := repoFromPath(mrc, r)
	if err != nil {
		return nil, nil, err
	}
	underlying := rc.GetRepo()
	br, ok := underlying.(repository.RepoBrowse)
	if !ok {
		return nil, nil, fmt.Errorf("repository does not support code browsing")
	}
	return underlying, br, nil
}

// resolveRef tries refs/heads/<ref>, refs/tags/<ref>, then a raw hash.
func resolveRef(repo repository.ClockedRepo, ref string) (repository.Hash, error) {
	for _, prefix := range []string{"refs/heads/", "refs/tags/", ""} {
		h, err := repo.ResolveRef(prefix + ref)
		if err == nil {
			return h, nil
		}
	}
	return "", repository.ErrNotFound
}

// resolveTreeAtPath walks the git tree of a commit down to the given path.
func resolveTreeAtPath(repo repository.ClockedRepo, commitHash repository.Hash, path string) ([]repository.TreeEntry, error) {
	commit, err := repo.ReadCommit(commitHash)
	if err != nil {
		return nil, err
	}

	entries, err := repo.ReadTree(commit.TreeHash)
	if err != nil {
		return nil, err
	}

	if path == "" {
		return entries, nil
	}

	for _, segment := range strings.Split(path, "/") {
		if segment == "" {
			continue
		}
		entry, ok := repository.SearchTreeEntry(entries, segment)
		if !ok {
			return nil, repository.ErrNotFound
		}
		if entry.ObjectType != repository.Tree {
			return nil, repository.ErrNotFound
		}
		entries, err = repo.ReadTree(entry.Hash)
		if err != nil {
			return nil, err
		}
	}
	return entries, nil
}

// resolveBlobAtPath walks the tree to the given file path and returns its hash.
func resolveBlobAtPath(repo repository.ClockedRepo, commitHash repository.Hash, path string) (repository.Hash, error) {
	parts := strings.Split(path, "/")
	dirPath := strings.Join(parts[:len(parts)-1], "/")
	fileName := parts[len(parts)-1]

	entries, err := resolveTreeAtPath(repo, commitHash, dirPath)
	if err != nil {
		return "", err
	}

	entry, ok := repository.SearchTreeEntry(entries, fileName)
	if !ok {
		return "", repository.ErrNotFound
	}
	if entry.ObjectType != repository.Blob {
		return "", repository.ErrNotFound
	}
	return entry.Hash, nil
}

// isBinaryContent returns true if data contains a null byte (simple heuristic).
func isBinaryContent(data []byte) bool {
	for _, b := range data {
		if b == 0 {
			return true
		}
	}
	return false
}

// ── GET /api/repos/{owner}/{repo}/git/refs ────────────────────────────────────

type gitRefsHandler struct{ mrc *cache.MultiRepoCache }

func NewGitRefsHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitRefsHandler{mrc: mrc}
}

type refResponse struct {
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Type      string `json:"type"` // "branch" | "tag"
	Hash      string `json:"hash"`
	IsDefault bool   `json:"isDefault"`
}

func (h *gitRefsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	repo, br, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defaultBranch, _ := br.GetDefaultBranch()

	var refs []refResponse
	for _, prefix := range []string{"refs/heads/", "refs/tags/"} {
		names, err := repo.ListRefs(prefix)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for _, name := range names {
			hash, err := repo.ResolveRef(name)
			if err != nil {
				continue
			}
			refType := "branch"
			if prefix == "refs/tags/" {
				refType = "tag"
			}
			short := strings.TrimPrefix(name, prefix)
			refs = append(refs, refResponse{
				Name:      name,
				ShortName: short,
				Type:      refType,
				Hash:      hash.String(),
				IsDefault: short == defaultBranch,
			})
		}
	}

	writeJSON(w, refs)
}

// ── GET /api/repos/{owner}/{repo}/git/trees/{ref}?path= ──────────────────────

type gitTreeHandler struct{ mrc *cache.MultiRepoCache }

func NewGitTreeHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitTreeHandler{mrc: mrc}
}

type treeEntryResponse struct {
	Name       string              `json:"name"`
	Type       string              `json:"type"` // "tree" | "blob"
	Hash       string              `json:"hash"`
	Mode       string              `json:"mode"`
	LastCommit *commitMetaResponse `json:"lastCommit,omitempty"`
}

func (h *gitTreeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ref := mux.Vars(r)["ref"]
	path := r.URL.Query().Get("path")

	repo, br, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	commitHash, err := resolveRef(repo, ref)
	if err != nil {
		http.Error(w, "ref not found", http.StatusNotFound)
		return
	}

	entries, err := resolveTreeAtPath(repo, commitHash, path)
	if err == repository.ErrNotFound {
		http.Error(w, "path not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	names := make([]string, len(entries))
	for i, e := range entries {
		names[i] = e.Name
	}
	lastCommits, _ := br.LastCommitForEntries(ref, path, names)

	resp := make([]treeEntryResponse, 0, len(entries))
	for _, e := range entries {
		objType := "blob"
		mode := "100644"
		if e.ObjectType == repository.Tree {
			objType = "tree"
			mode = "040000"
		}
		item := treeEntryResponse{
			Name: e.Name,
			Type: objType,
			Hash: e.Hash.String(),
			Mode: mode,
		}
		if cm, ok := lastCommits[e.Name]; ok {
			item.LastCommit = toCommitMetaResponse(cm)
		}
		resp = append(resp, item)
	}

	writeJSON(w, resp)
}

// ── GET /api/repos/{owner}/{repo}/git/blobs/{ref}?path= ──────────────────────

type gitBlobHandler struct{ mrc *cache.MultiRepoCache }

func NewGitBlobHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitBlobHandler{mrc: mrc}
}

type blobResponse struct {
	Path     string `json:"path"`
	Content  string `json:"content"`
	Size     int    `json:"size"`
	IsBinary bool   `json:"isBinary"`
}

func (h *gitBlobHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ref := mux.Vars(r)["ref"]
	path := r.URL.Query().Get("path")

	if path == "" {
		http.Error(w, "missing path", http.StatusBadRequest)
		return
	}

	repo, _, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	commitHash, err := resolveRef(repo, ref)
	if err != nil {
		http.Error(w, "ref not found", http.StatusNotFound)
		return
	}

	blobHash, err := resolveBlobAtPath(repo, commitHash, path)
	if err == repository.ErrNotFound {
		http.Error(w, "path not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := repo.ReadData(blobHash)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	isBinary := isBinaryContent(data)
	content := ""
	if !isBinary {
		content = string(data)
	}

	writeJSON(w, blobResponse{
		Path:     path,
		Content:  content,
		Size:     len(data),
		IsBinary: isBinary,
	})
}

// ── GET /api/repos/{owner}/{repo}/git/raw/{ref}/{path} ───────────────────────
// Serves the raw file content for download. ref and path are both in the URL
// path, producing human-readable download URLs like:
//
//	/api/repos/_/_/git/raw/main/src/foo/bar.go

type gitRawHandler struct{ mrc *cache.MultiRepoCache }

func NewGitRawHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitRawHandler{mrc: mrc}
}

func (h *gitRawHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ref := mux.Vars(r)["ref"]
	path := mux.Vars(r)["path"]

	if path == "" {
		http.Error(w, "missing path", http.StatusBadRequest)
		return
	}

	repo, _, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	commitHash, err := resolveRef(repo, ref)
	if err != nil {
		http.Error(w, "ref not found", http.StatusNotFound)
		return
	}

	blobHash, err := resolveBlobAtPath(repo, commitHash, path)
	if err == repository.ErrNotFound {
		http.Error(w, "path not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := repo.ReadData(blobHash)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fileName := path[strings.LastIndex(path, "/")+1:]
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename=%q`, fileName))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Write(data)
}

// ── GET /api/repos/{owner}/{repo}/git/commits?ref=&path=&limit=&after= ───────

type gitCommitsHandler struct{ mrc *cache.MultiRepoCache }

func NewGitCommitsHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitCommitsHandler{mrc: mrc}
}

type commitMetaResponse struct {
	Hash        string   `json:"hash"`
	ShortHash   string   `json:"shortHash"`
	Message     string   `json:"message"`
	AuthorName  string   `json:"authorName"`
	AuthorEmail string   `json:"authorEmail"`
	Date        string   `json:"date"` // RFC3339
	Parents     []string `json:"parents"`
}

func toCommitMetaResponse(m repository.CommitMeta) *commitMetaResponse {
	parents := make([]string, len(m.Parents))
	for i, p := range m.Parents {
		parents[i] = p.String()
	}
	return &commitMetaResponse{
		Hash:        m.Hash.String(),
		ShortHash:   m.ShortHash,
		Message:     m.Message,
		AuthorName:  m.AuthorName,
		AuthorEmail: m.AuthorEmail,
		Date:        m.Date.UTC().Format("2006-01-02T15:04:05Z"),
		Parents:     parents,
	}
}

func (h *gitCommitsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ref := r.URL.Query().Get("ref")
	path := r.URL.Query().Get("path")
	after := repository.Hash(r.URL.Query().Get("after"))

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	if ref == "" {
		http.Error(w, "missing ref", http.StatusBadRequest)
		return
	}

	_, br, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	commits, err := br.CommitLog(ref, path, limit, after)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	resp := make([]*commitMetaResponse, len(commits))
	for i, c := range commits {
		resp[i] = toCommitMetaResponse(c)
	}
	writeJSON(w, resp)
}

// ── GET /api/repos/{owner}/{repo}/git/commits/{sha} ──────────────────────────

type gitCommitHandler struct{ mrc *cache.MultiRepoCache }

func NewGitCommitHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitCommitHandler{mrc: mrc}
}

// ── GET /api/repos/{owner}/{repo}/git/commits/{sha}/diff?path= ───────────────

type gitCommitDiffHandler struct{ mrc *cache.MultiRepoCache }

func NewGitCommitDiffHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitCommitDiffHandler{mrc: mrc}
}

func (h *gitCommitDiffHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	sha := mux.Vars(r)["sha"]
	filePath := r.URL.Query().Get("path")
	if filePath == "" {
		http.Error(w, "missing path", http.StatusBadRequest)
		return
	}

	_, br, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fd, err := br.CommitFileDiff(repository.Hash(sha), filePath)
	if err == repository.ErrNotFound {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	type diffLineResp struct {
		Type    string `json:"type"`
		Content string `json:"content"`
		OldLine int    `json:"oldLine,omitempty"`
		NewLine int    `json:"newLine,omitempty"`
	}
	type diffHunkResp struct {
		OldStart int            `json:"oldStart"`
		OldLines int            `json:"oldLines"`
		NewStart int            `json:"newStart"`
		NewLines int            `json:"newLines"`
		Lines    []diffLineResp `json:"lines"`
	}
	type fileDiffResp struct {
		Path     string         `json:"path"`
		OldPath  string         `json:"oldPath,omitempty"`
		IsBinary bool           `json:"isBinary"`
		IsNew    bool           `json:"isNew"`
		IsDelete bool           `json:"isDelete"`
		Hunks    []diffHunkResp `json:"hunks"`
	}

	hunks := make([]diffHunkResp, len(fd.Hunks))
	for i, h := range fd.Hunks {
		lines := make([]diffLineResp, len(h.Lines))
		for j, l := range h.Lines {
			lines[j] = diffLineResp{Type: l.Type, Content: l.Content, OldLine: l.OldLine, NewLine: l.NewLine}
		}
		hunks[i] = diffHunkResp{OldStart: h.OldStart, OldLines: h.OldLines, NewStart: h.NewStart, NewLines: h.NewLines, Lines: lines}
	}

	writeJSON(w, fileDiffResp{
		Path:     fd.Path,
		OldPath:  fd.OldPath,
		IsBinary: fd.IsBinary,
		IsNew:    fd.IsNew,
		IsDelete: fd.IsDelete,
		Hunks:    hunks,
	})
}

type changedFileResponse struct {
	Path    string `json:"path"`
	OldPath string `json:"oldPath,omitempty"`
	Status  string `json:"status"`
}

type commitDetailResponse struct {
	*commitMetaResponse
	FullMessage string                `json:"fullMessage"`
	Files       []changedFileResponse `json:"files"`
}

func (h *gitCommitHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	sha := mux.Vars(r)["sha"]

	_, br, err := browseRepo(h.mrc, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	detail, err := br.CommitDetail(repository.Hash(sha))
	if err == repository.ErrNotFound {
		http.Error(w, "commit not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	files := make([]changedFileResponse, len(detail.Files))
	for i, f := range detail.Files {
		files[i] = changedFileResponse{Path: f.Path, OldPath: f.OldPath, Status: f.Status}
	}

	writeJSON(w, commitDetailResponse{
		commitMetaResponse: toCommitMetaResponse(detail.CommitMeta),
		FullMessage:        detail.FullMessage,
		Files:              files,
	})
}
