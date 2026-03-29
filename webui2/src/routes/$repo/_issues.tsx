import { createFileRoute } from "@tanstack/react-router";

import {
  type ValidLabelsQuery,
  ValidLabelsDocument,
  type AllIdentitiesQuery,
  AllIdentitiesDocument,
} from "@/__generated__/graphql";

// Pathless layout route for all issue-related pages under /$repo.
// Preloads labels and identities shared by the issue list, detail,
// new issue form, and user profile pages.
export const Route = createFileRoute("/$repo/_issues")({
  beforeLoad: ({ context: { preloadQuery, ref } }) => {
    const labelsRef = preloadQuery<ValidLabelsQuery>(ValidLabelsDocument, {
      variables: { ref },
    });
    const identitiesRef = preloadQuery<AllIdentitiesQuery>(AllIdentitiesDocument, {
      variables: { ref },
    });
    return { labelsRef, identitiesRef };
  },
});
