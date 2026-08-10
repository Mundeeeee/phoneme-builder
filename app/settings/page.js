"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme, compact, setCompact } = useTheme();

  return (
    <div className="page-shell">
      <span className="eyebrow">Settings</span>
      <h1>Preferences</h1>
      <p>
        These preferences are stored in your browser&rsquo;s cookies, so they will still be set
        the next time you open this app.
      </p>

      <div className="card">
        <h3>Theme</h3>
        <p style={{ color: "var(--muted)" }}>Choose how the builder interface looks.</p>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            type="button"
            className={`btn btn-toggle ${theme === "light" ? "btn-primary" : "btn-quiet"}`}
            onClick={() => setTheme("light")}
          >
            Light mode
          </button>
          <button
            type="button"
            className={`btn btn-toggle ${theme === "dark" ? "btn-primary" : "btn-quiet"}`}
            onClick={() => setTheme("dark")}
          >
            Dark mode
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Layout</h3>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="compact"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
          />
          <label htmlFor="compact">Use a narrower, compact reading width</label>
        </div>
      </div>
    </div>
  );
}
