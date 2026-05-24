import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "light-soft" | "dark-soft" | "dark";

/** Metadata for each theme, used by the theme picker in the header. */
export const THEMES: { value: Theme; label: string; bg: string; fg: string }[] = [
  { value: "light", label: "Light", bg: "#ffffff", fg: "#1a1a1e" },
  { value: "light-soft", label: "Light soft", bg: "#f2f3f7", fg: "#1a1a1e" },
  { value: "dark-soft", label: "Dark soft", bg: "#22272e", fg: "#adb9c7" },
  { value: "dark", label: "Dark", bg: "#0d1014", fg: "#fbfbfc" },
];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

// Classes that may be applied to <html>. "light" needs no class (:root handles it).
const THEME_CLASSES = ["light-soft", "dark-soft", "dark"] as const;

function isValidTheme(v: string | null): v is Theme {
  return v === "light" || v === "light-soft" || v === "dark-soft" || v === "dark";
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (isValidTheme(stored)) return stored;
  // No stored preference — pick based on system; default to the softer dark variant.
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark-soft" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSES);
    if (theme !== "light") root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
