// Package oauth defines the Provider interface and UserInfo type used for
// external OAuth2 authentication in the webui.
//
// Each concrete provider (GitHub, GitLab, …) implements Provider and is
// registered by passing it to the auth handler at server startup.
// The generic oauth2 flow (PKCE, state, cookie) is handled by the auth
// handler; providers only need to supply endpoints and profile fetching.
package oauth

import "context"

// Provider represents an external OAuth2 identity provider.
type Provider interface {
	// Name returns the machine-readable identifier, e.g. "github".
	Name() string

	// HumanName returns a user-facing display label, e.g. "GitHub".
	HumanName() string

	// AuthURL returns the URL the browser should be redirected to in order
	// to begin the authorization-code flow.
	AuthURL(state, callbackURL string) string

	// Exchange converts an authorization code into a normalised UserInfo.
	// The callbackURL must match the one used in AuthURL.
	Exchange(ctx context.Context, code, callbackURL string) (*UserInfo, error)
}

// UserInfo holds the normalised user profile returned by a provider after a
// successful OAuth2 exchange. Fields may be empty when the provider does not
// supply them.
type UserInfo struct {
	Login     string
	Email     string
	Name      string
	AvatarURL string
}
