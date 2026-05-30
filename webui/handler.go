package webui

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed all:dist
var assets embed.FS

// NewHandler returns an http.Handler that serves the webui SPA.
// Unknown paths fall back to index.html so that client-side routing works.
func NewHandler() http.Handler {
	dist, err := fs.Sub(assets, "dist")
	if err != nil {
		panic(err)
	}
	return http.FileServer(&spaFS{http.FS(dist)})
}

// spaFS wraps an http.FileSystem to serve index.html for any path that does
// not correspond to a real file, enabling client-side routing in the SPA.
type spaFS struct {
	http.FileSystem
}

func (s *spaFS) Open(name string) (http.File, error) {
	f, err := s.FileSystem.Open(name)
	if err != nil {
		return s.FileSystem.Open("/index.html")
	}
	return f, nil
}
