import type { MockedResponse } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { CommitListDocument } from "@/__generated__/graphql";

import { CommitList } from "./commit-list";

// Link uses TanStack Router — replace with a plain anchor for these tests.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...mod,
    Link: ({
      children,
      className,
      to,
    }: {
      children: React.ReactNode;
      className?: string;
      to: string;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

const PAGE_SIZE = 30;

function makeCommit(i: number) {
  return {
    hash: `hash${i}`,
    shortHash: `h${i}`,
    message: `Commit message ${i}`,
    authorName: "Alice",
    date: "2024-06-01T10:00:00Z",
  };
}

function makeQueryMock(
  commits: ReturnType<typeof makeCommit>[],
  hasNextPage: boolean,
  endCursor: string | null,
  variablesMatcher = vi.fn().mockReturnValue(true),
) {
  return {
    variablesMatcher,
    mock: {
      request: { query: CommitListDocument, variables: variablesMatcher },
      result: {
        data: {
          repository: {
            commits: {
              nodes: commits,
              pageInfo: { hasNextPage, endCursor },
            },
          },
        },
      },
    },
  };
}

function renderList(
  props: { repo?: string | null; ref_?: string; path?: string } = {},
  mocks: MockedResponse<any, any>[] = [],
) {
  return render(
    <MockedProvider mocks={mocks} showWarnings={false}>
      <CommitList repo={props.repo ?? "myrepo"} ref_={props.ref_ ?? "main"} path={props.path} />
    </MockedProvider>,
  );
}

// ── Loading / error states ────────────────────────────────────────────────────

describe("CommitList — loading", () => {
  it("renders a skeleton while the query is in flight", async () => {
    const { mock } = makeQueryMock([], false, null);
    renderList({}, [mock]);
    // Skeleton elements are present while loading
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    // Wait for skeleton to disappear (query resolved) so cleanup doesn't throw
    await waitFor(() => expect(document.querySelectorAll(".animate-pulse").length).toBe(0));
  });
});

describe("CommitList — error", () => {
  it("shows the error message on query failure", async () => {
    const mock = {
      request: { query: CommitListDocument, variables: vi.fn().mockReturnValue(true) },
      error: new Error("connection refused"),
    };
    renderList({}, [mock]);
    await waitFor(() => expect(screen.getByText(/connection refused/i)).toBeInTheDocument());
  });
});

// ── Commit rendering ──────────────────────────────────────────────────────────

describe("CommitList — commits", () => {
  it("renders commit messages", async () => {
    const { mock } = makeQueryMock([makeCommit(1), makeCommit(2)], false, null);
    renderList({}, [mock]);
    await waitFor(() => expect(screen.getByText("Commit message 1")).toBeInTheDocument());
    expect(screen.getByText("Commit message 2")).toBeInTheDocument();
  });

  it("groups commits under a date heading", async () => {
    const { mock } = makeQueryMock([makeCommit(1)], false, null);
    renderList({}, [mock]);
    await waitFor(() => expect(screen.getByText(/Commits on/i)).toBeInTheDocument());
  });

  it("renders short hashes as links", async () => {
    const { mock } = makeQueryMock([makeCommit(1)], false, null);
    renderList({}, [mock]);
    await waitFor(() => expect(screen.getByText("h1")).toBeInTheDocument());
  });
});

// ── Pagination ────────────────────────────────────────────────────────────────

describe("CommitList — pagination", () => {
  it("shows 'Load more commits' button when a full page is returned with a cursor", async () => {
    const commits = Array.from({ length: PAGE_SIZE }, (_, i) => makeCommit(i));
    const { mock } = makeQueryMock(commits, true, "cursor-1");
    renderList({}, [mock]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /load more commits/i })).toBeInTheDocument(),
    );
  });

  it("hides 'Load more commits' when fewer than a full page returned", async () => {
    const { mock } = makeQueryMock([makeCommit(1), makeCommit(2)], false, null);
    renderList({}, [mock]);
    await waitFor(() => expect(screen.getByText("Commit message 1")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /load more commits/i })).toBeNull();
  });

  it("fires fetchMore with the cursor when 'Load more' is clicked", async () => {
    const commits = Array.from({ length: PAGE_SIZE }, (_, i) => makeCommit(i));
    const { mock: firstMock } = makeQueryMock(commits, true, "cursor-1");
    const { variablesMatcher, mock: moreMock } = makeQueryMock([makeCommit(99)], false, null);

    renderList({}, [firstMock, moreMock]);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /load more commits/i })).toBeInTheDocument(),
    );
    // Wrap click in act so React flushes setLoadingMore(true) before we drain
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /load more commits/i }));
    });

    await waitFor(() => expect(variablesMatcher).toHaveBeenCalled());
    expect(variablesMatcher).toHaveBeenCalledWith(expect.objectContaining({ after: "cursor-1" }));
    // Drain: wait for fetchMore to fully settle (response delivered + React flushed)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  });
});
