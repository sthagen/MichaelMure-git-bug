package http

import (
	"bytes"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/git-bug/git-bug/cache"
)

// Serves raw blob content resolved by ref and path, e.g.
// /gitraw/{repo}/{ref}/{path:.*}
//
// This is used by the web UI to render images referenced in markdown
// files (READMEs etc.) without needing to know the blob hash upfront.
type gitRawHandler struct {
	mrc *cache.MultiRepoCache
}

func NewGitRawHandler(mrc *cache.MultiRepoCache) http.Handler {
	return &gitRawHandler{mrc: mrc}
}

func (h *gitRawHandler) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	var repo *cache.RepoCache
	var err error

	repoVar := mux.Vars(r)["repo"]
	if repoVar == "_" {
		repo, err = h.mrc.DefaultRepo()
	} else {
		repo, err = h.mrc.ResolveRepo(repoVar)
	}
	if err != nil {
		http.Error(rw, "invalid repo reference", http.StatusBadRequest)
		return
	}

	ref := mux.Vars(r)["ref"]
	path := mux.Vars(r)["path"]

	if ref == "" || path == "" {
		http.Error(rw, "ref and path are required", http.StatusBadRequest)
		return
	}

	rc, _, _, err := repo.BlobAtPath(ref, path)
	if err != nil {
		http.Error(rw, "file not found", http.StatusNotFound)
		return
	}
	defer rc.Close()

	data, err := io.ReadAll(rc)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}

	// ServeContent handles Content-Type detection from the file extension,
	// Range requests, and caching headers.
	http.ServeContent(rw, r, path, time.Now(), bytes.NewReader(data))
}
