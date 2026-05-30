// Interaction tests for query-input.tsx.
// Covers autocomplete trigger, suggestion selection, Enter/Tab dispatch,
// async loading state, stale-request cancellation, and submit on Enter.

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";

import type { CompletionProvider, Suggestion } from "./query-input";
import * as QueryInput from "./query-input";

// ── Test harness ──────────────────────────────────────────────────────────────

function Harness({
  providers = [] as CompletionProvider[],
  onSubmit = vi.fn<() => void>(),
}: {
  providers?: CompletionProvider[];
  onSubmit?: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <QueryInput.Root value={value} onChange={setValue} onSubmit={onSubmit} providers={providers}>
      <QueryInput.Input placeholder="Search…" />
      <QueryInput.Completions />
    </QueryInput.Root>
  );
}

function getInput() {
  return screen.getByRole("combobox");
}

function typeValue(text: string) {
  fireEvent.change(getInput(), { target: { value: text } });
}

// ── Basic input behavior ──────────────────────────────────────────────────────

describe("QueryInput — basic input", () => {
  it("renders an input with placeholder", () => {
    render(<Harness />);
    expect(getInput()).toHaveAttribute("placeholder", "Search…");
  });

  it("calls onSubmit on Enter when no dropdown is open", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.keyDown(getInput(), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does NOT call onSubmit on Enter when a suggestion is active", async () => {
    const onSubmit = vi.fn();
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} onSubmit={onSubmit} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.keyDown(getInput(), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ── Autocomplete trigger ──────────────────────────────────────────────────────

describe("QueryInput — autocomplete trigger", () => {
  it("shows suggestions when a provider prefix is typed", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [
        { value: "bug", label: "bug" },
        { value: "feature", label: "feature" },
      ],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    expect(screen.getByRole("option", { name: /feature/ })).toBeInTheDocument();
  });

  it("passes the partial value after the prefix to getSuggestions", async () => {
    const getSuggestions = vi.fn(() => [{ value: "bug", label: "bug" }]);
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions,
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:bug");
    await waitFor(() => expect(getSuggestions).toHaveBeenCalledWith("bug"));
  });

  it("hides the dropdown when the provider returns no suggestions", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:zzz");
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("dismisses the dropdown on Escape", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.keyDown(getInput(), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("option")).toBeNull());
  });
});

// ── Async completions ─────────────────────────────────────────────────────────

describe("QueryInput — async completions", () => {
  it("shows a loading indicator while the provider promise is pending", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => new Promise<Suggestion[]>(() => {}), // never resolves
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());
  });

  it("shows suggestions once the provider promise resolves", async () => {
    let resolve!: (s: Suggestion[]) => void;
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () =>
        new Promise<Suggestion[]>((r) => {
          resolve = r;
        }),
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());
    await act(async () => {
      resolve([{ value: "bug", label: "bug" }]);
    });
    expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument();
  });

  it("discards stale async results when the query changes before the first resolves", async () => {
    let resolveFirst!: (s: Suggestion[]) => void;
    let callCount = 0;
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: (q) => {
        callCount++;
        if (callCount === 1) {
          // First call: returns a slow promise we control
          return new Promise<Suggestion[]>((r) => {
            resolveFirst = r;
          });
        }
        // Second call: returns immediately with different results
        return [{ value: "feature", label: q === "f" ? "feature" : "other" }];
      },
    };
    render(<Harness providers={[provider]} />);

    typeValue("label:b"); // call 1 — pending promise
    await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());

    typeValue("label:f"); // call 2 — cancels call 1, resolves immediately
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /feature/ })).toBeInTheDocument(),
    );

    // Resolving the stale promise must NOT inject "bug" into the UI
    await act(async () => {
      resolveFirst([{ value: "bug", label: "bug" }]);
    });
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByRole("option", { name: /bug/ })).toBeNull();
  });
});

// ── Suggestion selection ──────────────────────────────────────────────────────

describe("QueryInput — suggestion selection", () => {
  it("inserts the suggestion on click and appends a trailing space", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:b");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByRole("option", { name: /bug/ }));
    expect(getInput()).toHaveValue("label:bug ");
  });

  it("replaces only the active token and preserves surrounding tokens", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("status:open label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByRole("option", { name: /bug/ }));
    expect(getInput()).toHaveValue("status:open label:bug ");
  });

  it("selects the first suggestion on Enter", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.keyDown(getInput(), { key: "Enter" });
    expect(getInput()).toHaveValue("label:bug ");
  });

  it("selects the first suggestion on Tab", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.keyDown(getInput(), { key: "Tab" });
    expect(getInput()).toHaveValue("label:bug ");
  });

  it("closes the dropdown after selection", async () => {
    const provider: CompletionProvider = {
      prefix: "label:",
      highlightClass: "text-blue-500",
      getSuggestions: () => [{ value: "bug", label: "bug" }],
    };
    render(<Harness providers={[provider]} />);
    typeValue("label:");
    await waitFor(() => expect(screen.getByRole("option", { name: /bug/ })).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByRole("option", { name: /bug/ }));
    expect(screen.queryByRole("option")).toBeNull();
  });
});
