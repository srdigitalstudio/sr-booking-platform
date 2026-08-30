"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<ThemeContextType | null>(null);

function getTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return localStorage.getItem("theme") === "dark"
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(
      "storage",
      callback
    );
  };
}

function getServerTheme(): Theme {
  return "light";
}

function saveTheme(theme: Theme) {
  localStorage.setItem("theme", theme);

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const theme = useSyncExternalStore(
    subscribe,
    getTheme,
    getServerTheme
  );

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    saveTheme(nextTheme);

    window.dispatchEvent(
      new StorageEvent("storage")
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}