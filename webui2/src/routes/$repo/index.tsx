// /$repo index — redirects to the tree view with the default ref.
// The refs are already being preloaded by $repo.tsx beforeLoad, so we
// use client.query() which will hit the Apollo cache.

import { createFileRoute, redirect } from "@tanstack/react-router";

import { client } from "@/lib/apollo";
import { REFS_QUERY, type RefsQueryData } from "@/routes/$repo";

export const Route = createFileRoute("/$repo/")({
  beforeLoad: async ({ context: { ref }, params: { repo } }) => {
    const { data } = await client.query<RefsQueryData>({
      query: REFS_QUERY,
      variables: { repo: ref },
    });
    const refs = data?.repository?.refs?.nodes ?? [];
    const headHash = data?.repository?.head?.hash;
    const defaultRef = headHash ? refs.find((r) => r.hash === headHash) : undefined;
    const refName = defaultRef?.shortName ?? refs[0]?.shortName ?? "master";

    throw redirect({
      to: "/$repo/tree/$ref/$",
      params: { repo, ref: refName, _splat: "" },
    });
  },
});
