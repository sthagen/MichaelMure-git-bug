// Commit history view: /$repo/commits/$ref

import { createFileRoute } from "@tanstack/react-router";

import { CommitList } from "@/components/code/CommitList";

export const Route = createFileRoute("/$repo/_code/commits/$ref")({
  component: CommitsView,
  beforeLoad: () => ({ viewMode: "commits" as const }),
});

function CommitsView() {
  const { ref: currentRef } = Route.useParams();
  const { ref: repoRef } = Route.useRouteContext();

  return <CommitList repo={repoRef} ref_={currentRef} />;
}
