// /$repo index — redirects to the tree view with the default ref.

import { gql } from "@apollo/client";
import { createFileRoute, redirect } from "@tanstack/react-router";

import type { GitRef } from "@/__generated__/graphql";
import { client } from "@/lib/apollo";

const REFS_QUERY = gql`
  query RepoDefaultRef($repo: String) {
    repository(ref: $repo) {
      refs {
        nodes {
          shortName
          isDefault
        }
      }
    }
  }
`;

interface DefaultRefQueryData {
  repository: { refs: { nodes: Pick<GitRef, "shortName" | "isDefault">[] } | null } | null;
}

export const Route = createFileRoute("/$repo/")({
  beforeLoad: async ({ context: { ref }, params: { repo } }) => {
    const { data } = await client.query<DefaultRefQueryData>({
      query: REFS_QUERY,
      variables: { repo: ref },
    });
    const refs = data?.repository?.refs?.nodes ?? [];
    const defaultRef = refs.find((r) => r.isDefault) ?? refs[0];
    const refName = defaultRef?.shortName ?? "master";

    throw redirect({
      to: "/$repo/tree/$ref/$",
      params: { repo, ref: refName, _splat: "" },
    });
  },
});
