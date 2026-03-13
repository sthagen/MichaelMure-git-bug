package auth

import (
	"crypto/rand"
	"encoding/base64"
	"sync"

	"github.com/git-bug/git-bug/entity"
)

// SessionCookie is the name of the HTTP cookie that holds the session token.
const SessionCookie = "git-bug-session"

// SessionStore holds in-memory sessions mapping opaque tokens to identity IDs.
// Sessions are intentionally not persisted: users simply re-authenticate after
// a server restart. This keeps the implementation simple and dependency-free,
// which is appropriate for a locally-run webui.
type SessionStore struct {
	mu sync.RWMutex
	m  map[string]entity.Id
}

func NewSessionStore() *SessionStore {
	return &SessionStore{m: make(map[string]entity.Id)}
}

// Create generates a new session token for the given identity, stores it, and
// returns the token. The token is 32 bytes of crypto/rand encoded as base64url.
func (s *SessionStore) Create(userId entity.Id) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := base64.RawURLEncoding.EncodeToString(b)
	s.mu.Lock()
	s.m[token] = userId
	s.mu.Unlock()
	return token, nil
}

// Get retrieves the identity ID associated with a token.
func (s *SessionStore) Get(token string) (entity.Id, bool) {
	s.mu.RLock()
	id, ok := s.m[token]
	s.mu.RUnlock()
	return id, ok
}

// Delete removes a session token (logout).
func (s *SessionStore) Delete(token string) {
	s.mu.Lock()
	delete(s.m, token)
	s.mu.Unlock()
}
