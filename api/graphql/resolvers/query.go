package resolvers

import (
	"context"

	"github.com/git-bug/git-bug/api/graphql/connections"
	"github.com/git-bug/git-bug/api/graphql/graph"
	"github.com/git-bug/git-bug/api/graphql/models"
	"github.com/git-bug/git-bug/cache"
)

var _ graph.QueryResolver = &rootQueryResolver{}

type rootQueryResolver struct {
	cache          *cache.MultiRepoCache
	authMode       string
	oauthProviders []string
}

// ServerConfig returns static server configuration including the auth mode.
// The frontend uses this to decide whether to show a login button, show "Read only",
// or operate silently in single-user local mode.
func (r rootQueryResolver) ServerConfig(_ context.Context) (*models.ServerConfig, error) {
	providers := r.oauthProviders
	if providers == nil {
		providers = []string{}
	}
	return &models.ServerConfig{
		AuthMode:       r.authMode,
		OauthProviders: providers,
	}, nil
}

func (r rootQueryResolver) Repository(_ context.Context, ref *string) (*models.Repository, error) {
	var repo *cache.RepoCache
	var err error

	if ref == nil {
		repo, err = r.cache.DefaultRepo()
	} else {
		repo, err = r.cache.ResolveRepo(*ref)
	}

	if err != nil {
		return nil, err
	}

	return &models.Repository{
		Cache: r.cache,
		Repo:  repo,
	}, nil
}

// Repositories returns all registered repositories as a relay connection.
// Used by the repo picker UI.
func (r rootQueryResolver) Repositories(_ context.Context, after *string, before *string, first *int, last *int) (*models.RepositoryConnection, error) {
	input := models.ConnectionInput{
		After:  after,
		Before: before,
		First:  first,
		Last:   last,
	}

	source := r.cache.AllRepos()

	edger := func(repo *cache.RepoCache, offset int) connections.Edge {
		return models.RepositoryEdge{
			Node:   &models.Repository{Cache: r.cache, Repo: repo},
			Cursor: connections.OffsetToCursor(offset),
		}
	}

	// NodeType is *cache.RepoCache (the source slice element), but the connection
	// nodes field wants []*models.Repository. Extract them from the edges, which
	// already hold the wrapped Repository built by the edger above.
	conMaker := func(edges []*models.RepositoryEdge, _ []*cache.RepoCache, info *models.PageInfo, totalCount int) (*models.RepositoryConnection, error) {
		nodes := make([]*models.Repository, len(edges))
		for i, e := range edges {
			nodes[i] = e.Node
		}
		return &models.RepositoryConnection{
			Edges:      edges,
			Nodes:      nodes,
			PageInfo:   info,
			TotalCount: totalCount,
		}, nil
	}

	return connections.Connection(source, edger, conMaker, input)
}
