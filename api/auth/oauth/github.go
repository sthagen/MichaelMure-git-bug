package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

var _ Provider = &GitHub{}

// GitHub implements Provider for GitHub OAuth2.
// It uses the standard authorization-code flow (not the device flow used by
// the bridge) because the webui has a browser redirect available.
type GitHub struct {
	clientID     string
	clientSecret string
}

func NewGitHub(clientID, clientSecret string) *GitHub {
	return &GitHub{clientID: clientID, clientSecret: clientSecret}
}

func (g *GitHub) Name() string      { return "github" }
func (g *GitHub) HumanName() string { return "GitHub" }

func (g *GitHub) config(callbackURL string) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     g.clientID,
		ClientSecret: g.clientSecret,
		Endpoint:     github.Endpoint,
		RedirectURL:  callbackURL,
		// read:user for profile; user:email to get the primary email even when
		// the user's email is set to private on their GitHub profile.
		Scopes: []string{"read:user", "user:email"},
	}
}

func (g *GitHub) AuthURL(state, callbackURL string) string {
	return g.config(callbackURL).AuthCodeURL(state, oauth2.AccessTypeOnline)
}

func (g *GitHub) Exchange(ctx context.Context, code, callbackURL string) (*UserInfo, error) {
	token, err := g.config(callbackURL).Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("github: token exchange: %w", err)
	}

	client := g.config(callbackURL).Client(ctx, token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, fmt.Errorf("github: fetch profile: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github: unexpected status %d from /user", resp.StatusCode)
	}

	var u struct {
		Login     string `json:"login"`
		Email     string `json:"email"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&u); err != nil {
		return nil, fmt.Errorf("github: decode profile: %w", err)
	}

	return &UserInfo{
		Login:     u.Login,
		Email:     u.Email,
		Name:      u.Name,
		AvatarURL: u.AvatarURL,
	}, nil
}
