// auth_handler.go implements the HTTP endpoints for the OAuth2 login flow:
//
//	GET  /auth/login?provider=<name>  — redirect browser to provider
//	GET  /auth/callback               — receive code, match identity, set session
//	GET  /auth/user                   — return current user as JSON
//	POST /auth/logout                 — clear session cookie
//	GET  /auth/identities             — list identities available for adoption
//	POST /auth/adopt                  — link/create identity and start session
//
// The flow for a returning user (identity already has provider metadata):
//
//	browser → /auth/login → provider → /auth/callback → set cookie → /
//
// The flow for a first-time user:
//
//	browser → /auth/login → provider → /auth/callback
//	       → store pending → /auth/select-identity
//	       → POST /auth/adopt → set cookie → /
package http

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	apiauth "github.com/git-bug/git-bug/api/auth"
	"github.com/git-bug/git-bug/api/auth/provider"
	"github.com/git-bug/git-bug/cache"
	"github.com/git-bug/git-bug/entity"
)

const (
	authStateCookie    = "git-bug-auth-state"
	oauthPendingCookie = "git-bug-pending"
)

// providerMetaKey returns the immutable-metadata key used to link a git-bug
// identity to an external OAuth provider account. This follows the same
// convention as the GitHub bridge (metaKeyGithubLogin = "github-login") so
// that identities imported via the bridge are automatically recognised on
// first webui login.
func providerMetaKey(providerName string) string {
	return providerName + "-login"
}

// authState is JSON-encoded as the OAuth2/OIDC state parameter.
// It carries both a CSRF nonce and the provider name, so the callback can
// verify the request and dispatch to the right provider without extra cookies.
type authState struct {
	Nonce    string `json:"nonce"`
	Provider string `json:"provider"`
}

// pendingAuth holds the provider profile for a user who has authenticated
// but has not yet been linked to a git-bug identity.
// It expires after 10 minutes to limit the window for token reuse.
type pendingAuth struct {
	UserInfo  *provider.UserInfo
	Provider  string
	ExpiresAt time.Time
}

// AuthHandler handles the external login flow (OAuth 2.0 or OIDC).
// It is protocol-agnostic: concrete providers implement provider.Provider and
// are passed in at construction time.
type AuthHandler struct {
	mrc       *cache.MultiRepoCache
	sessions  *apiauth.SessionStore
	providers map[string]provider.Provider // provider name → implementation
	baseURL   string                       // e.g. "http://localhost:3000"

	// pending maps a short-lived random token (stored in a cookie) to an
	// OAuth profile that needs identity selection before a real session is
	// created.
	pendingMu sync.Mutex
	pending   map[string]*pendingAuth
}

func NewAuthHandler(mrc *cache.MultiRepoCache, sessions *apiauth.SessionStore, providers []provider.Provider, baseURL string) *AuthHandler {
	pm := make(map[string]provider.Provider, len(providers))
	for _, p := range providers {
		pm[p.Name()] = p
	}
	return &AuthHandler{
		mrc:       mrc,
		sessions:  sessions,
		providers: pm,
		baseURL:   baseURL,
		pending:   make(map[string]*pendingAuth),
	}
}

// callbackURL builds the absolute URL the provider should redirect to.
// It must match the URL registered in the provider's OAuth app settings.
func (h *AuthHandler) callbackURL() string {
	return h.baseURL + "/auth/callback"
}

// randToken generates a URL-safe random token of n bytes.
func randToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// HandleLogin initiates the OAuth2 authorization-code flow.
// GET /auth/login?provider=<name>
func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	providerName := r.URL.Query().Get("provider")
	p, ok := h.providers[providerName]
	if !ok {
		http.Error(w, fmt.Sprintf("unknown provider %q", providerName), http.StatusBadRequest)
		return
	}

	nonce, err := randToken(16)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	stateData, _ := json.Marshal(authState{Nonce: nonce, Provider: providerName})
	stateEncoded := base64.RawURLEncoding.EncodeToString(stateData)

	// Store the state in a short-lived cookie for CSRF verification on callback.
	http.SetCookie(w, &http.Cookie{
		Name:     authStateCookie,
		Value:    stateEncoded,
		MaxAge:   300, // 5 minutes — enough time to complete the login redirect
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	http.Redirect(w, r, p.AuthURL(stateEncoded, h.callbackURL()), http.StatusFound)
}

// HandleCallback receives the authorization code from the provider.
// GET /auth/callback?code=...&state=...
func (h *AuthHandler) HandleCallback(w http.ResponseWriter, r *http.Request) {
	// CSRF: verify that the state parameter matches the cookie we set.
	stateCookie, err := r.Cookie(authStateCookie)
	if err != nil || stateCookie.Value != r.URL.Query().Get("state") {
		http.Error(w, "invalid auth state", http.StatusBadRequest)
		return
	}
	http.SetCookie(w, &http.Cookie{Name: authStateCookie, MaxAge: -1, Path: "/"})

	stateBytes, err := base64.RawURLEncoding.DecodeString(stateCookie.Value)
	if err != nil {
		http.Error(w, "malformed state", http.StatusBadRequest)
		return
	}
	var state authState
	if err := json.Unmarshal(stateBytes, &state); err != nil {
		http.Error(w, "malformed state", http.StatusBadRequest)
		return
	}

	p, ok := h.providers[state.Provider]
	if !ok {
		http.Error(w, fmt.Sprintf("unknown provider %q", state.Provider), http.StatusBadRequest)
		return
	}

	info, err := p.Exchange(r.Context(), r.URL.Query().Get("code"), h.callbackURL())
	if err != nil {
		http.Error(w, "OAuth exchange failed: "+err.Error(), http.StatusBadGateway)
		return
	}

	// Try to match to an existing git-bug identity via provider metadata.
	// This reuses the same metadata key as the GitHub bridge
	// ("github-login"), so bridge-imported identities are recognised
	// automatically on first login.
	metaKey := providerMetaKey(state.Provider)
	for _, repo := range h.mrc.AllRepos() {
		id, err := repo.Identities().ResolveIdentityImmutableMetadata(metaKey, info.Login)
		if err == nil {
			h.startSession(w, id.Id())
			http.Redirect(w, r, "/", http.StatusFound)
			return
		}
	}

	// No matching identity — store the OAuth profile temporarily and send
	// the user to the identity selection page.
	pendingToken, err := randToken(16)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	h.pendingMu.Lock()
	h.pending[pendingToken] = &pendingAuth{
		UserInfo:  info,
		Provider:  state.Provider,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	h.pendingMu.Unlock()

	http.SetCookie(w, &http.Cookie{
		Name:     oauthPendingCookie,
		Value:    pendingToken,
		MaxAge:   600,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
	http.Redirect(w, r, "/auth/select-identity", http.StatusFound)
}

// HandleUser returns the current authenticated user as JSON.
// GET /auth/user — used by the frontend in oauth mode to poll auth state.
func (h *AuthHandler) HandleUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(apiauth.SessionCookie)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	userId, ok := h.sessions.Get(cookie.Value)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	for _, repo := range h.mrc.AllRepos() {
		id, err := repo.Identities().Resolve(userId)
		if err != nil {
			continue
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"id":          id.Id().String(),
			"humanId":     id.Id().Human(),
			"name":        id.Name(),
			"displayName": id.DisplayName(),
			"login":       id.Login(),
			"email":       id.Email(),
			"avatarUrl":   id.AvatarUrl(),
		})
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
}

// HandleLogout clears the session and redirects to the root.
// POST /auth/logout
func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(apiauth.SessionCookie); err == nil {
		h.sessions.Delete(cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: apiauth.SessionCookie, MaxAge: -1, Path: "/"})
	http.Redirect(w, r, "/", http.StatusFound)
}

// HandleIdentities returns all identities across all repos for the adoption UI.
// GET /auth/identities — only valid while a pending auth cookie is present.
func (h *AuthHandler) HandleIdentities(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.getPending(r); !ok {
		http.Error(w, "no pending authentication", http.StatusForbidden)
		return
	}

	type identityJSON struct {
		RepoSlug    string `json:"repoSlug"`
		Id          string `json:"id"`
		HumanId     string `json:"humanId"`
		DisplayName string `json:"displayName"`
		Login       string `json:"login,omitempty"`
		AvatarUrl   string `json:"avatarUrl,omitempty"`
	}

	var identities []identityJSON
	for _, repo := range h.mrc.AllRepos() {
		for _, id := range repo.Identities().AllIds() {
			i, err := repo.Identities().Resolve(id)
			if err != nil {
				continue
			}
			identities = append(identities, identityJSON{
				RepoSlug:    repo.Name(),
				Id:          i.Id().String(),
				HumanId:     i.Id().Human(),
				DisplayName: i.DisplayName(),
				Login:       i.Login(),
				AvatarUrl:   i.AvatarUrl(),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(identities)
}

// HandleAdopt links the pending OAuth profile to a git-bug identity (existing
// or newly created) and starts a real session.
// POST /auth/adopt  body: {"identityId": "<id>"}  or  {"create": true}
func (h *AuthHandler) HandleAdopt(w http.ResponseWriter, r *http.Request) {
	pa, ok := h.getPending(r)
	if !ok {
		http.Error(w, "no pending authentication", http.StatusForbidden)
		return
	}

	var body struct {
		IdentityId string `json:"identityId"` // empty string → create new
	}
	json.NewDecoder(r.Body).Decode(&body)

	metaKey := providerMetaKey(pa.Provider)
	var userId entity.Id

	if body.IdentityId == "" {
		// Create a new git-bug identity from the OAuth profile, tagging it
		// with the provider metadata so future logins match automatically.
		repos := h.mrc.AllRepos()
		if len(repos) == 0 {
			http.Error(w, "no repositories available", http.StatusInternalServerError)
			return
		}
		created, err := repos[0].Identities().NewRaw(
			pa.UserInfo.Name,
			pa.UserInfo.Email,
			pa.UserInfo.Login,
			pa.UserInfo.AvatarURL,
			nil,
			map[string]string{metaKey: pa.UserInfo.Login},
		)
		if err != nil {
			http.Error(w, "failed to create identity: "+err.Error(), http.StatusInternalServerError)
			return
		}
		userId = created.Id()
	} else {
		// Adopt an existing identity by adding the provider metadata to it.
		// This links the identity to the OAuth account for future logins.
		id := entity.Id(body.IdentityId)
		for _, repo := range h.mrc.AllRepos() {
			cached, err := repo.Identities().Resolve(id)
			if err != nil {
				continue
			}
			cached.SetMetadata(metaKey, pa.UserInfo.Login)
			if err := cached.Commit(); err != nil {
				http.Error(w, "failed to update identity: "+err.Error(), http.StatusInternalServerError)
				return
			}
			userId = cached.Id()
			break
		}
		if userId == "" {
			http.Error(w, "identity not found", http.StatusNotFound)
			return
		}
	}

	h.clearPending(r, w)
	h.startSession(w, userId)
	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) startSession(w http.ResponseWriter, userId entity.Id) {
	token, err := h.sessions.Create(userId)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     apiauth.SessionCookie,
		Value:    token,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
}

func (h *AuthHandler) getPending(r *http.Request) (*pendingAuth, bool) {
	cookie, err := r.Cookie(oauthPendingCookie)
	if err != nil {
		return nil, false
	}
	h.pendingMu.Lock()
	pa, ok := h.pending[cookie.Value]
	h.pendingMu.Unlock()
	if !ok || time.Now().After(pa.ExpiresAt) {
		return nil, false
	}
	return pa, true
}

func (h *AuthHandler) clearPending(r *http.Request, w http.ResponseWriter) {
	if cookie, err := r.Cookie(oauthPendingCookie); err == nil {
		h.pendingMu.Lock()
		delete(h.pending, cookie.Value)
		h.pendingMu.Unlock()
	}
	http.SetCookie(w, &http.Cookie{Name: oauthPendingCookie, MaxAge: -1, Path: "/"})
}
