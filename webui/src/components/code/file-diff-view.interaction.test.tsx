import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing/react";
import { describe, it, expect, vi } from "vitest";

import { FileDiffDocument } from "@/__generated__/graphql";
import { FileDiffView } from "./file-diff-view";

const BASE = { repo: "myrepo", hash: "abc123", path: "src/foo.ts", status: "MODIFIED" };

const HUNK = {
  oldStart: 1, oldLines: 2, newStart: 1, newLines: 2,
  lines: [
    { type: "DELETED", content: "old line", oldLine: 1, newLine: 0 },
    { type: "ADDED",   content: "new line", oldLine: 0, newLine: 1 },
  ],
};

function makeDiffMock(diff: Record<string, unknown>) {
  const matchVars = vi.fn().mockReturnValue(true);
  return {
    matchVars,
    mock: {
      request: { query: FileDiffDocument, variables: matchVars },
      result: { data: { repository: { commit: { diff } } } },
    },
  };
}

function renderView(props: Partial<typeof BASE> = {}, mocks: object[] = []) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false} showWarnings={false}>
      <FileDiffView {...BASE} {...props} />
    </MockedProvider>,
  );
}

function expand() {
  fireEvent.click(screen.getByRole("button"));
}

// ── Initial state ─────────────────────────────────────────────────────────────

describe("FileDiffView — collapsed", () => {
  it("renders the file path", () => {
    renderView();
    expect(screen.getByText("src/foo.ts")).toBeInTheDocument();
  });

  it("shows the MODIFIED badge", () => {
    renderView({ status: "MODIFIED" });
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("shows the ADDED badge", () => {
    renderView({ status: "ADDED" });
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("shows renamed path as old → new", () => {
    renderView({ status: "RENAMED", path: "new.ts", oldPath: "old.ts" });
    expect(screen.getByText("old.ts")).toBeInTheDocument();
    expect(screen.getByText("new.ts")).toBeInTheDocument();
  });

  it("does NOT fire the query before expanding", () => {
    const { matchVars, mock } = makeDiffMock({ path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({}, [mock]);
    expect(matchVars).not.toHaveBeenCalled();
  });
});

// ── Lazy fetch ────────────────────────────────────────────────────────────────

describe("FileDiffView — lazy fetch", () => {
  it("fires the query on first expand with correct variables", async () => {
    const { matchVars, mock } = makeDiffMock({ path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({}, [mock]);

    expand();

    await waitFor(() => expect(matchVars).toHaveBeenCalled());
    expect(matchVars).toHaveBeenCalledWith({ repo: "myrepo", hash: "abc123", path: "src/foo.ts" });
  });

  it("does NOT fire the query again on collapse and re-expand", async () => {
    const { matchVars, mock } = makeDiffMock({ path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({}, [mock]);

    expand();
    await waitFor(() => expect(matchVars).toHaveBeenCalledTimes(1));

    expand(); // collapse
    expand(); // re-expand — should use cached data

    await new Promise((r) => setTimeout(r, 50));
    expect(matchVars).toHaveBeenCalledTimes(1);
  });

  it("passes null repoRef (default repo) when repo is null", async () => {
    const { matchVars, mock } = makeDiffMock({ path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({ repo: null }, [mock]);

    expand();

    await waitFor(() => expect(matchVars).toHaveBeenCalled());
    expect(matchVars).toHaveBeenCalledWith(expect.objectContaining({ repo: null }));
  });
});

// ── Render states ─────────────────────────────────────────────────────────────

describe("FileDiffView — render states", () => {
  it("shows loading indicator while query is in flight", () => {
    const { mock } = makeDiffMock({ path: "f", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({}, [mock]);
    expand();
    expect(screen.getByText("Loading diff…")).toBeInTheDocument();
  });

  it("shows error message on query failure", async () => {
    const mock = {
      request: { query: FileDiffDocument, variables: vi.fn().mockReturnValue(true) },
      error: new Error("network error"),
    };
    renderView({}, [mock]);
    expand();
    await waitFor(() => expect(screen.getByText(/failed to load diff/i)).toBeInTheDocument());
  });

  it("shows 'Binary file' for binary diffs", async () => {
    const { mock } = makeDiffMock({ path: "img.png", isBinary: true, isNew: false, isDelete: false, hunks: [] });
    renderView({ path: "img.png" }, [mock]);
    expand();
    await waitFor(() => expect(screen.getByText("Binary file")).toBeInTheDocument());
  });

  it("shows 'No changes' when hunks are empty and file is not binary", async () => {
    const { mock } = makeDiffMock({ path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false, hunks: [] });
    renderView({}, [mock]);
    expand();
    await waitFor(() => expect(screen.getByText("No changes")).toBeInTheDocument());
  });

  it("renders diff hunk lines", async () => {
    const { mock } = makeDiffMock({
      path: "src/foo.ts", isBinary: false, isNew: false, isDelete: false,
      hunks: [HUNK],
    });
    renderView({}, [mock]);
    expand();
    await waitFor(() => expect(screen.getByText("old line")).toBeInTheDocument());
    expect(screen.getByText("new line")).toBeInTheDocument();
  });
});
