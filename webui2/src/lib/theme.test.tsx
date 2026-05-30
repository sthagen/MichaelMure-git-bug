// Unit tests for theme.tsx.
// Covers getInitialTheme (via ThemeProvider initialization), class management on
// document.documentElement, localStorage persistence, and theme switching.

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ThemeProvider, useTheme } from "./theme";

// ── Helpers ───────────────────────────────────────────────────────────────────

function stubMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

const THEME_CLASSES = ["light-soft", "dark-soft", "dark"] as const;

function Consumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("light-soft")}>light-soft</button>
      <button onClick={() => setTheme("dark-soft")}>dark-soft</button>
      <button onClick={() => setTheme("dark")}>dark</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Consumer />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove(...THEME_CLASSES);
  stubMatchMedia(false); // default: system prefers light
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Initial theme selection (getInitialTheme) ─────────────────────────────────

describe("ThemeProvider — initial theme", () => {
  it("uses the theme stored in localStorage when valid", () => {
    localStorage.setItem("theme", "dark");
    renderProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("ignores an invalid localStorage value and falls back to system preference", () => {
    localStorage.setItem("theme", "neon-pink");
    stubMatchMedia(false);
    renderProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("defaults to dark-soft when no stored preference and system prefers dark", () => {
    stubMatchMedia(true);
    renderProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark-soft");
  });

  it("defaults to light when no stored preference and system prefers light", () => {
    stubMatchMedia(false);
    renderProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });
});

// ── CSS class management ──────────────────────────────────────────────────────

describe("ThemeProvider — CSS classes on <html>", () => {
  it("adds the theme class to document.documentElement on mount", async () => {
    localStorage.setItem("theme", "dark");
    renderProvider();
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
  });

  it("does NOT add a class for the 'light' theme", async () => {
    localStorage.setItem("theme", "light");
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("theme")).toHaveTextContent("light"),
    );
    THEME_CLASSES.forEach((cls) =>
      expect(document.documentElement.classList.contains(cls)).toBe(false),
    );
  });

  it("removes the old class when the theme changes", async () => {
    localStorage.setItem("theme", "dark");
    renderProvider();
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    fireEvent.click(screen.getByRole("button", { name: "light-soft" }));
    await waitFor(() =>
      expect(document.documentElement.classList.contains("light-soft")).toBe(true),
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("removes all theme classes when switching to 'light'", async () => {
    localStorage.setItem("theme", "dark-soft");
    renderProvider();
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark-soft")).toBe(true),
    );
    fireEvent.click(screen.getByRole("button", { name: "light" }));
    await waitFor(() =>
      expect(screen.getByTestId("theme")).toHaveTextContent("light"),
    );
    THEME_CLASSES.forEach((cls) =>
      expect(document.documentElement.classList.contains(cls)).toBe(false),
    );
  });
});

// ── localStorage persistence ──────────────────────────────────────────────────

describe("ThemeProvider — localStorage persistence", () => {
  it("writes the selected theme to localStorage on change", async () => {
    renderProvider();
    fireEvent.click(screen.getByRole("button", { name: "dark" }));
    await waitFor(() => expect(localStorage.getItem("theme")).toBe("dark"));
  });

  it("overwrites a previous localStorage value when the theme changes", async () => {
    localStorage.setItem("theme", "light");
    renderProvider();
    fireEvent.click(screen.getByRole("button", { name: "dark-soft" }));
    await waitFor(() => expect(localStorage.getItem("theme")).toBe("dark-soft"));
  });
});
