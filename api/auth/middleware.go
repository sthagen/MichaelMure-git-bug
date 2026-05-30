package auth

import (
	"net/http"

	"github.com/git-bug/git-bug/entity"
)

func Middleware(fixedUserId entity.Id) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := CtxWithUser(r.Context(), fixedUserId)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth rejects requests that carry no identity in context with 403.
// Use it to guard write endpoints so that when the auth middleware is replaced
// with session-based auth, unauthenticated requests are blocked at the route level.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value(identityCtxKey).(entity.Id)
		if !ok {
			http.Error(w, "not authenticated", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
