package commands

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/phayes/freeport"
	"github.com/skratchdot/open-golang/open"
	"github.com/spf13/cobra"

	"github.com/git-bug/git-bug/api/auth"
	"github.com/git-bug/git-bug/api/auth/oauth"
	"github.com/git-bug/git-bug/api/graphql"
	httpapi "github.com/git-bug/git-bug/api/http"
	"github.com/git-bug/git-bug/cache"
	"github.com/git-bug/git-bug/commands/execenv"
	"github.com/git-bug/git-bug/entities/identity"
	"github.com/git-bug/git-bug/repository"
	"github.com/git-bug/git-bug/webui"
)

const webUIOpenConfigKey = "git-bug.webui.open"

type webUIOptions struct {
	host      string
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

	flags.StringVar(&options.host, "host", "127.0.0.1", "Network address or hostname to listen to (default to 127.0.0.1)")
	flags.BoolVar(&options.open, "open", false, "Automatically open the web UI in the default browser")
	flags.BoolVar(&options.noOpen, "no-open", false, "Prevent the automatic opening of the web UI in the default browser")
	flags.IntVarP(&options.port, "port", "p", 0, "Port to listen to (default to random available port)")
	flags.BoolVar(&options.readOnly, "read-only", false, "Whether to run the web UI in read-only mode")
	flags.BoolVar(&options.logErrors, "log-errors", false, "Whether to log errors")
	flags.StringVarP(&options.query, "query", "q", "", "The query to open in the web UI bug list")

	// GitHub OAuth: both flags must be provided together to enable GitHub login.
	flags.StringVar(&options.githubClientId, "github-client-id", "", "GitHub OAuth application client ID (enables GitHub login)")
	flags.StringVar(&options.githubClientSecret, "github-client-secret", "", "GitHub OAuth application client secret")
	cmd.MarkFlagsRequiredTogether("github-client-id", "github-client-secret")

	return cmd
}

func runWebUI(env *execenv.Env, opts webUIOptions) error {
	if opts.port == 0 {
		var err error
		opts.port, err = freeport.GetFreePort()
		if err != nil {
			return err
		}
	}

	addr := net.JoinHostPort(opts.host, strconv.Itoa(opts.port))
	baseURL := fmt.Sprintf("http://%s", addr)
	webUiAddr := baseURL
	toOpen := webUiAddr

	if len(opts.query) > 0 {
		// Explicitly set the query parameter instead of going with a default one.
		toOpen = fmt.Sprintf("%s/?q=%s", webUiAddr, url.QueryEscape(opts.query))
	}

	// Collect enabled OAuth providers.
	var providers []oauth.Provider
	if opts.githubClientId != "" {
		providers = append(providers, oauth.NewGitHub(opts.githubClientId, opts.githubClientSecret))
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
		authMode = "oauth"
		sessions = auth.NewSessionStore()
		router.Use(auth.SessionMiddleware(sessions))

	default:
		authMode = "local"
		// Single-user mode: inject the identity from git config for every request.
		author, err := identity.GetUserIdentity(env.Repo)
		if err != nil {
			return err
		}
		router.Use(auth.Middleware(author.Id()))
	}

	mrc := cache.NewMultiRepoCache()

	_, events := mrc.RegisterDefaultRepository(env.Repo)

	err := execenv.CacheBuildProgressBar(env, events)
	if err != nil {
		return err
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
		OAuthProviders: providerNames,
	}, errOut)

	// Register OAuth routes before the catch-all static handler.
	if authMode == "oauth" {
		ah := httpapi.NewAuthHandler(mrc, sessions, providers, baseURL)
		router.Path("/auth/login").Methods("GET").HandlerFunc(ah.HandleLogin)
		router.Path("/auth/callback").Methods("GET").HandlerFunc(ah.HandleCallback)
		router.Path("/auth/user").Methods("GET").HandlerFunc(ah.HandleUser)
		router.Path("/auth/logout").Methods("POST").HandlerFunc(ah.HandleLogout)
		router.Path("/auth/identities").Methods("GET").HandlerFunc(ah.HandleIdentities)
		router.Path("/auth/adopt").Methods("POST").HandlerFunc(ah.HandleAdopt)
	}

	// Top-level API routes
	router.Path("/playground").Handler(playground.Handler("git-bug", "/graphql"))
	router.Path("/graphql").Handler(graphqlHandler)

	// /api/repos/{owner}/{repo}/ subrouter.
	// owner is reserved for future use; "_" means "local".
	// repo "_" resolves to the default repository.
	//
	// In oauth mode all API endpoints require a valid session, making the
	// server safe to deploy publicly. In local and readonly modes the
	// middleware only injects identity without blocking.
	apiRepos := router.PathPrefix("/api/repos/{owner}/{repo}").Subrouter()
	if authMode == "oauth" {
		apiRepos.Use(auth.RequireAuth)
	}
	apiRepos.Path("/git/refs").Methods("GET").Handler(httpapi.NewGitRefsHandler(mrc))
	apiRepos.Path("/git/trees/{ref}").Methods("GET").Handler(httpapi.NewGitTreeHandler(mrc))
	apiRepos.Path("/git/blobs/{ref}").Methods("GET").Handler(httpapi.NewGitBlobHandler(mrc))
	apiRepos.Path("/git/raw/{ref}/{path:.*}").Methods("GET").Handler(httpapi.NewGitRawHandler(mrc))
	apiRepos.Path("/git/commits").Methods("GET").Handler(httpapi.NewGitCommitsHandler(mrc))
	apiRepos.Path("/git/commits/{sha}").Methods("GET").Handler(httpapi.NewGitCommitHandler(mrc))
	apiRepos.Path("/file/{hash}").Methods("GET").Handler(httpapi.NewGitFileHandler(mrc))
	apiRepos.Path("/upload").Methods("POST").Handler(httpapi.NewGitUploadFileHandler(mrc))

	router.PathPrefix("/").Handler(webui.NewHandler())

	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	done := make(chan bool)
	quit := make(chan os.Signal, 1)

	// register as handler of the interrupt signal to trigger the teardown
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)

	go func() {
		<-quit
		env.Out.Println("WebUI is shutting down...")

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		srv.SetKeepAlivesEnabled(false)
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatalf("Could not gracefully shutdown the WebUI: %v\n", err)
		}

		// Teardown
		err := graphqlHandler.Close()
		if err != nil {
			env.Out.Println(err)
		}

		err = mrc.Close()
		if err != nil {
			env.Out.Println(err)
		}

		close(done)
	}()

	env.Out.Printf("Web UI: %s\n", webUiAddr)
	env.Out.Printf("Graphql API: http://%s/graphql\n", addr)
	env.Out.Printf("Graphql Playground: http://%s/playground\n", addr)
	if authMode == "oauth" {
		env.Out.Printf("OAuth callback URL: %s/auth/callback\n", baseURL)
		env.Out.Println("  ↳ Register this URL in your OAuth application settings")
	}
	env.Out.Println("Press Ctrl+c to quit")

	configOpen, err := env.Repo.AnyConfig().ReadBool(webUIOpenConfigKey)
	if errors.Is(err, repository.ErrNoConfigEntry) {
		// default to true
		configOpen = true
	} else if err != nil {
		return err
	}

	shouldOpen := (configOpen && !opts.noOpen) || opts.open

	if shouldOpen {
		err = open.Run(toOpen)
		if err != nil {
			env.Out.Println(err)
		}
	}

	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return err
	}

	<-done

	env.Out.Println("WebUI stopped")
	return nil
}
