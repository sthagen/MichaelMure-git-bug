import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$repo")({
  beforeLoad: ({ params: { repo } }) => {
    // Normalize the repo slug: "_" means the default (null) repo
    const ref = repo === "_" ? null : repo;
    return { ref };
  },
});
