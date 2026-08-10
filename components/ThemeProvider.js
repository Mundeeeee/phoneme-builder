"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [compact, setCompactState] = useState(false);

  // On first mount in the browser, restore any saved preferences and make
  // sure the <html> element actually reflects them straight away.
  useEffect(() => {
    const savedTheme = getCookie("hce-theme");
    const savedCompact = getCookie("hce-compact");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";

    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    if (savedCompact === "true") {
      setCompactState(true);
      document.documentElement.setAttribute("data-compact", "true");
    }
  }, []);

  function setTheme(next) {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    setCookie("hce-theme", next);
  }

  function setCompact(next) {
    setCompactState(next);
    document.documentElement.setAttribute("data-compact", String(next));
    setCookie("hce-compact", String(next));
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, compact, setCompact }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
