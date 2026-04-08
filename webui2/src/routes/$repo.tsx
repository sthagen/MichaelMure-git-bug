import { gql } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";

import type { GitRef } from "@/__generated__/graphql";

export const REFS_QUERY = gql`
  query CodePageRefs($repo: String) {
    repository(ref: $repo) {
      name
      head {
        shortName
      }
      refs {
        nodes {
          name
          shortName
          type
          hash
        }
      }
    }
  }
`;

export interface RefsQueryData {
  repository: {
    name: string;
    head: { shortName: string } | null;
    refs: { nodes: GitRef[] } | null;
  } | null;
}

export const Route = createFileRoute("/$repo")({
  beforeLoad: ({ params: { repo }, context: { preloadQuery } }) => {
    // Normalize the repo slug: "_" means the default (null) repo
    const ref = repo === "_" ? null : repo;

    // Preload refs once for the entire repo — shared by code browser,
    // and used for the /$repo → tree redirect.
    const refsRef = preloadQuery<RefsQueryData>(REFS_QUERY, {
      variables: { repo: ref },
    });

    return { ref, refsRef };
  },
});
