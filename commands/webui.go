package commands

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/phayes/freeport"
	"github.com/skratchdot/open-golang/open"
	"github.com/spf13/cobra"

	"github.com/git-bug/git-bug/api/auth"
	"github.com/git-bug/git-bug/api/auth/provider"
	"github.com/git-bug/git-bug/api/graphql"
	httpapi "github.com/git-bug/git-bug/api/http"
	"github.com/git-bug/git-bug/cache"
	"github.com/git-bug/git-bug/commands/execenv"
	"github.com/git-bug/git-bug/entities/identity"
	"github.com/git-bug/git-bug/repository"
	"github.com/git-bug/git-bug/webui2"
)

const webUIOpenConfigKey = "git-bug.webui.open"

type webUIOptions struct {
	bind      string
	port      int
	open      bool
	noOpen    bool
	readOnly  bool
	logErrors bool
	query     string

	// OAuth provider credentials. A provider is enabled when both its
	// client-id and client-secret are non-empty. Multiple providers can be
	// active simultaneously.
	githubClientId     string
	githubClientSecret string
}

func newWebUICommand(env *execenv.Env) *cobra.Command {
	options := webUIOptions{}

	cmd := &cobra.Command{
		Use:   "webui",
		Short: "Launch the web UI",
		Long: `Launch the web UI.

Available git config:
  git-bug.webui.open [bool]: control the automatic opening of the web UI in the default browser
`,
		PreRunE: execenv.LoadRepo(env),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runWebUI(env, options)
		},
	}

	flags := cmd.Flags()
	flags.SortFlags = false

	flags.StringVar(&options.bind, "bind", "127.0.0.1", "Network address to bind to (default to 127.0.0.1)")
	flags.IntVarP(&options.port, "port", "p", 0, "Port to listen on (default to random available port)")
	flags.BoolVar(&options.open, "open", false, "Automatically open the web UI in the default browser")
	flags.BoolVar(&options.noOpen, "no-open", false, "Prevent the automatic opening of the web UI in the default browser")
	flags.BoolVar(&options.readOnly, "read-only", false, "Whether to run the web UI in read-only mode")
	flags.BoolVar(&options.logErrors, "log-errors", false, "Whether to log errors")
	flags.StringVarP(&options.query, "query", "q", "", "The query to open in the web UI bug list")

	// GitHub OAuth: both flags must be provided together to enable GitHub login.
	flags.StringVar(&options.githubClientId, "github-client-id", "", "GitHub OAuth application client ID (enables GitHub login)")
	flags.StringVar(&options.githubClientSecret, "github-client-secret", "", "GitHub OAuth application client secret")
	cmd.MarkFlagsRequiredTogether("github-client-id", "github-client-secret")

	return cmd
}

// setupRoutes builds the router and registers all API and UI routes.
func setupRoutes(env *execenv.Env, opts webUIOptions, baseURL string) (*mux.Router, func() error, error) {
	// Collect enabled login providers.
	var providers []provider.Provider
	if opts.githubClientId != "" {
		providers = append(providers, provider.NewGitHub(opts.githubClientId, opts.githubClientSecret))
	}

	// Determine auth mode and configure middleware accordingly.
	var authMode string
	var sessions *auth.SessionStore
	router := mux.NewRouter()

	switch {
	case opts.readOnly:
		authMode = "readonly"
		// No middleware: every request is unauthenticated.

	case len(providers) > 0:
		authMode = "external"
		sessions = auth.NewSessionStore()
		router.Use(auth.SessionMiddleware(sessions))

	default:
		authMode = "local"
		// Single-user mode: inject the identity from git config for every request.
		author, err := identity.GetUserIdentity(env.Repo)
		if err != nil {
			return nil, nil, err
		}
		router.Use(auth.Middleware(author.Id()))
	}

	mrc := cache.NewMultiRepoCache()
	_, events := mrc.RegisterDefaultRepository(env.Repo)
	if err := execenv.CacheBuildProgressBar(env, events); err != nil {
		return nil, nil, err
	}

	var errOut io.Writer
	if opts.logErrors {
		errOut = env.Err
	}

	// Collect provider names for GraphQL serverConfig.
	providerNames := make([]string, len(providers))
	for i, p := range providers {
		providerNames[i] = p.Name()
	}

	graphqlHandler := graphql.NewHandler(mrc, graphql.ServerConfig{
		AuthMode:       authMode,
		LoginProviders: providerNames,
	}, errOut)

	// Register OAuth routes before the catch-all static handler.
	if authMode == "external" {
		ah := httpapi.NewAuthHandler(mrc, sessions, providers, baseURL)
		router.Path("/auth/login").Methods("GET").HandlerFunc(ah.HandleLogin)
		router.Path("/auth/callback").Methods("GET").HandlerFunc(ah.HandleCallback)
		router.Path("/auth/user").Methods("GET").HandlerFunc(ah.HandleUser)
		router.Path("/auth/logout").Methods("POST").HandlerFunc(ah.HandleLogout)
		router.Path("/auth/identities").Methods("GET").HandlerFunc(ah.HandleIdentities)
		router.Path("/auth/adopt").Methods("POST").HandlerFunc(ah.HandleAdopt)
	}

	router.Path("/playground").Handler(playground.Handler("git-bug", "/graphql"))
	router.Path("/graphql").Handler(graphqlHandler)

	// File and upload routes for bug attachments.
	router.Path("/gitfile/{repo}/{hash}").Handler(httpapi.NewGitFileHandler(mrc))
	router.Path("/upload/{repo}").Methods("POST").Handler(httpapi.NewGitUploadFileHandler(mrc))

	router.PathPrefix("/").Handler(webui2.NewHandler())

	return router, mrc.Close, nil
}

func runWebUI(env *execenv.Env, opts webUIOptions) error {
	if opts.port == 0 {
		var err error
		opts.port, err = freeport.GetFreePort()
		if err != nil {
			return err
		}
	}

	addr := net.JoinHostPort(opts.bind, strconv.Itoa(opts.port))
	baseURL := "http://" + addr

	router, closeRoutes, err := setupRoutes(env, opts, baseURL)
	if err != nil {
		return err
	}
	defer func() {
		if err := closeRoutes(); err != nil {
			env.Err.Println(err)
		}
	}()

	server := &http.Server{Addr: addr, Handler: router}

	env.Out.Printf("Web UI: %s\n", baseURL)
	env.Out.Printf("Graphql API: %s/graphql\n", baseURL)
	env.Out.Printf("Graphql Playground: %s/playground\n", baseURL)
	if opts.githubClientId != "" {
		env.Out.Printf("Login callback URL: %s/auth/callback\n", baseURL)
		env.Out.Println("  ↳ Register this URL in your OAuth/OIDC application settings")
	}
	env.Out.Printf("\n[ Press Ctrl+c to quit ]\n\n")

	toOpen := baseURL
	if len(opts.query) > 0 {
		toOpen = fmt.Sprintf("%s/?q=%s", baseURL, url.QueryEscape(opts.query))
	}
	configOpen, err := env.Repo.AnyConfig().ReadBool(webUIOpenConfigKey)
	if errors.Is(err, repository.ErrNoConfigEntry) {
		// default to true
		configOpen = true
	} else if err != nil {
		return err
	}
	if (configOpen && !opts.noOpen) || opts.open {
		go openWhenUp(env, toOpen)
	}

	go func() {
		<-env.Ctx.Done()
		env.Out.Println("shutting down...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		server.SetKeepAlivesEnabled(false)
		if err := server.Shutdown(shutdownCtx); err != nil {
			env.Err.Printf("Could not gracefully shutdown the HTTP server: %v\n", err)
		}
	}()

	if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func openWhenUp(env *execenv.Env, toOpen string) {
	const maxAttempts = 3
	if isUp(toOpen, maxAttempts, 3*time.Second) {
		if err := open.Run(toOpen); err != nil {
			env.Err.Println(err)
			return
		}
		env.Out.Printf("opened your default browser to url: %s\n", toOpen)
		return
	}
	env.Err.Printf(
		"uh oh! it appears that the http server hasn't started.\n"+
			"we failed to reach %s after %d attempts.\n",
		toOpen, maxAttempts,
	)
}

func isUp(url string, maxRetries int, initialDelay time.Duration) bool {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	delay := initialDelay

	for attempt := 1; attempt <= maxRetries; attempt++ {
		resp, err := client.Head(url)
		if err == nil {
			_ = resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 400 {
				return true
			}
		}

		if attempt < maxRetries {
			time.Sleep(delay)
			delay *= 2
		}
	}

	return false
}
