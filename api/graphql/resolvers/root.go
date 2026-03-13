// Package resolvers contains the various GraphQL resolvers
package resolvers

import (
	"github.com/git-bug/git-bug/api/graphql/graph"
	"github.com/git-bug/git-bug/cache"
)

var _ graph.ResolverRoot = &RootResolver{}

type RootResolver struct {
	*cache.MultiRepoCache
	bugRootSubResolver

	authMode       string
	oauthProviders []string
}

func NewRootResolver(mrc *cache.MultiRepoCache, authMode string, oauthProviders []string) *RootResolver {
	return &RootResolver{
		MultiRepoCache: mrc,
		authMode:       authMode,
		oauthProviders: oauthProviders,
	}
}

func (r RootResolver) Query() graph.QueryResolver {
	return &rootQueryResolver{
		cache:          r.MultiRepoCache,
		authMode:       r.authMode,
		oauthProviders: r.oauthProviders,
	}
}

func (r RootResolver) Mutation() graph.MutationResolver {
	return &mutationResolver{
		cache: r.MultiRepoCache,
	}
}

func (r RootResolver) Subscription() graph.SubscriptionResolver {
	return &subscriptionResolver{
		cache: r.MultiRepoCache,
	}
}

func (RootResolver) Color() graph.ColorResolver {
	return &colorResolver{}
}

func (r RootResolver) Identity() graph.IdentityResolver {
	return &identityResolver{}
}

func (RootResolver) Label() graph.LabelResolver {
	return &labelResolver{}
}

func (RootResolver) Repository() graph.RepositoryResolver {
	return &repoResolver{}
}

func (RootResolver) Bug() graph.BugResolver {
	return &bugResolver{}
}
