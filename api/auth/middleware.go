package auth

import (
	"net/http"

	"github.com/git-bug/git-bug/entity"
)

// Middleware injects a fixed identity into every request context.
// Used in local single-user mode where auth is implicit (identity comes from
// git config at server startup rather than per-request login).
func Middleware(fixedUserId entity.Id) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := CtxWithUser(r.Context(), fixedUserId)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// SessionMiddleware reads the session cookie on every request and, when a
// valid session exists, injects the corresponding identity ID into the context.
//
// Requests without a valid session are served as unauthenticated rather than
// rejected: GraphQL's userIdentity field returns null and mutations fail with
// ErrNotAuthenticated. This allows the frontend to gracefully degrade rather
// than receiving hard HTTP errors for every unauthenticated page load.
func SessionMiddleware(store *SessionStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cookie, err := r.Cookie(SessionCookie); err == nil {
				if id, ok := store.Get(cookie.Value); ok {
					r = r.WithContext(CtxWithUser(r.Context(), id))
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
