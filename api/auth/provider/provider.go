// Package provider defines the Provider interface and UserInfo type used for
// external authentication in the webui.
//
// Each concrete provider (GitHub, GitLab, OIDC, …) implements Provider and is
// registered by passing it to the auth handler at server startup.
// The generic authorization-code flow (state, cookie) is handled by the auth
// handler; providers only need to supply endpoints and profile fetching.
//
// The Provider interface is deliberately protocol-agnostic: it works for both
// OAuth 2.0 providers (GitHub, legacy systems) and OpenID Connect providers
// (GitLab, Gitea, Keycloak, Google). OIDC is simply OAuth 2.0 + a standard
// identity layer; the same AuthURL/Exchange flow applies to both.
package provider

import "context"

// Provider represents an external identity provider.
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
// successful authorization-code exchange. Fields may be empty when the
// provider does not supply them.
type UserInfo struct {
	Login      string
	Email      string
	Name       string
	AvatarURL  string
	// PublicKeys holds SSH or GPG public keys associated with the account,
	// if the provider exposes them. Used to pre-populate identity key data.
	PublicKeys []string
}
