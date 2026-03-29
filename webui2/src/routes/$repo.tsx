import { createFileRoute } from "@tanstack/react-router";

import {
  type ValidLabelsQuery,
  ValidLabelsDocument,
  type AllIdentitiesQuery,
  AllIdentitiesDocument,
} from "@/__generated__/graphql";

export const Route = createFileRoute("/$repo")({
  beforeLoad: ({ params: { repo }, context: { preloadQuery } }) => {
    // Normalize the repo slug: "_" means the default (null) repo
    const ref = repo === "_" ? null : repo;

    // Preload labels and identities shared by all child routes (issue list,
    // bug detail, etc.). These are stable across filter/page changes.
    const labelsRef = preloadQuery<ValidLabelsQuery>(ValidLabelsDocument, {
      variables: { ref },
    });
    const identitiesRef = preloadQuery<AllIdentitiesQuery>(AllIdentitiesDocument, {
      variables: { ref },
    });

    return { ref, labelsRef, identitiesRef };
  },
});
