package webui

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/stretchr/testify/require"
)

func gz(s string) []byte {
	var buf bytes.Buffer
	w := gzip.NewWriter(&buf)
	_, _ = io.WriteString(w, s)
	_ = w.Close()
	return buf.Bytes()
}

// newTestHandler builds a spaHandler over an in-memory filesystem that mimics
// a typical dist/ layout: large files compressed-only, small files plain.
func newTestHandler() *spaHandler {
	mfs := fstest.MapFS{
		"index.html.gz":    {Data: gz("<html>index</html>")},
		"assets/app.js.gz": {Data: gz("console.log('app')")},
		"assets/small.js":  {Data: []byte("console.log('small')")},
	}
	return &spaHandler{http.FS(mfs)}
}

func TestSpaHandler(t *testing.T) {
	h := newTestHandler()

	tests := []struct {
		name         string
		path         string
		acceptGzip   bool
		wantStatus   int
		wantEncoding string // expected Content-Encoding (empty = skip check)
		wantCTPrefix string // expected Content-Type prefix (empty = skip check)
		wantBody     string // expected body (empty = skip check)
	}{
		{
			name:         "root redirects to index.html (gzip)",
			path:         "/",
			acceptGzip:   true,
			wantStatus:   200,
			wantEncoding: "gzip",
			wantCTPrefix: "text/html",
		},
		{
			name:         "SPA route falls back to index.html",
			path:         "/issues/123",
			acceptGzip:   true,
			wantStatus:   200,
			wantEncoding: "gzip",
			wantCTPrefix: "text/html",
		},
		{
			name:         "asset served pre-compressed",
			path:         "/assets/app.js",
			acceptGzip:   true,
			wantStatus:   200,
			wantEncoding: "gzip",
			wantCTPrefix: "text/javascript",
		},
		{
			name:         "asset decompressed on the fly when gzip not accepted",
			path:         "/assets/app.js",
			acceptGzip:   false,
			wantStatus:   200,
			wantCTPrefix: "text/javascript",
			wantBody:     "console.log('app')",
		},
		{
			name:       "small plain file served as-is",
			path:       "/assets/small.js",
			acceptGzip: false,
			wantStatus: 200,
			wantBody:   "console.log('small')",
		},
		{
			name:       "small plain file served as-is even when gzip accepted",
			path:       "/assets/small.js",
			acceptGzip: true,
			wantStatus: 200,
			wantBody:   "console.log('small')",
		},
		{
			name:       "missing asset with extension returns 404",
			path:       "/assets/missing.js",
			acceptGzip: true,
			wantStatus: 404,
		},
		{
			name:       "extension-less missing path falls back to index.html",
			path:       "/no/such/route",
			acceptGzip: false,
			wantStatus: 200,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.path, nil)
			if tc.acceptGzip {
				req.Header.Set("Accept-Encoding", "gzip")
			}
			w := httptest.NewRecorder()
			h.ServeHTTP(w, req)

			resp := w.Result()

			require.Equal(t, tc.wantStatus, resp.StatusCode)

			if tc.wantEncoding != "" {
				require.Equal(t, tc.wantEncoding, resp.Header.Get("Content-Encoding"))
			}
			if tc.wantCTPrefix != "" {
				require.True(t, strings.HasPrefix(resp.Header.Get("Content-Type"), tc.wantCTPrefix),
					"Content-Type %q should have prefix %q", resp.Header.Get("Content-Type"), tc.wantCTPrefix)
			}
			if tc.wantBody != "" {
				body, err := io.ReadAll(resp.Body)
				require.NoError(t, err)
				require.Equal(t, tc.wantBody, string(body))
			}
		})
	}
}
