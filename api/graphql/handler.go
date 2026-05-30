//go:generate go tool gqlgen generate

// Package graphql contains the root GraphQL http handler
package graphql

import (
	"io"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/gorilla/websocket"
	"github.com/vektah/gqlparser/v2/ast"

	"github.com/git-bug/git-bug/api/graphql/graph"
	"github.com/git-bug/git-bug/api/graphql/resolvers"
	"github.com/git-bug/git-bug/cache"
)

func NewHandler(mrc *cache.MultiRepoCache, errorOut io.Writer, devMode bool) http.Handler {
	rootResolver := resolvers.NewRootResolver(mrc)
	config := graph.Config{Resolvers: rootResolver}

	h := handler.New(graph.NewExecutableSchema(config))

	wsUpgrader := websocket.Upgrader{}
	if devMode {
		// In dev mode the Vite proxy sits on a different port than the backend,
		// so we compare hostnames only rather than the full host:port.
		wsUpgrader.CheckOrigin = func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			if origin == "" {
				return true
			}
			u, err := url.Parse(origin)
			if err != nil {
				return false
			}
			requestHost, _, err := net.SplitHostPort(r.Host)
			if err != nil {
				requestHost = r.Host
			}
			return u.Hostname() == requestHost
		}
	}
	h.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader:              wsUpgrader,
	})
	h.AddTransport(transport.Options{})
	h.AddTransport(transport.GET{})
	h.AddTransport(transport.POST{})
	h.AddTransport(transport.MultipartForm{})

	h.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	h.Use(extension.Introspection{})
	h.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	if errorOut != nil {
		h.Use(&Tracer{Out: errorOut})
	}

	return h
}
