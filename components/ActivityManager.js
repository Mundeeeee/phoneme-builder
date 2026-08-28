"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/useActivities";

const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

// Full read/update/delete UI for saved ActivityConfig rows. Creating a new
// one happens from the Wordle/Word Search builder pages ("Save activity"),
// but every saved configuration can be reviewed, edited, or removed here -
// closing the CRUD loop for activity settings, not just words.
export default function ActivityManager() {
  const { activities, loading, error, refresh } = useActivities();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(activity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      difficulty: activity.difficulty,
      showHints: activity.showHints,
      maxGuesses: activity.maxGuesses ?? 6,
      gridRows: activity.gridRows ?? 10,
      gridCols: activity.gridCols ?? 10,
      type: activity.type,
      wordListId: activity.wordListId,
    });
    setFormError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
    setFormError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      const res = await fetch(`/api/activities/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.details || [data.error]).join(" "));
      cancelEdit();
      await refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this saved activity configuration?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete activity.");
      if (editingId === id) cancelEdit();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card"><p>Loading saved activities...</p></div>;
  if (error) return <div className="card"><p style={{ color: "var(--bad)" }}>{error}</p></div>;

  return (
    <div className="card">
      <span className="eyebrow">Saved activities</span>
      <h2>Manage activity settings</h2>
      <p style={{ color: "var(--muted)" }}>
        Every configuration a teacher has saved from the Wordle or Word Search builder pages.
        Update or delete them here.
      </p>

      {activities.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No saved activities yet. Use the &ldquo;Save activity&rdquo; button on the{" "}
          <a href="/wordle">Wordle</a> or <a href="/word-search">Word Search</a> builder pages.
        </p>
      )}

      {activities.map((activity) => (
        <div key={activity.id} className="card" style={{ padding: "0.9rem 1rem", marginTop: "0.6rem" }}>
          {editingId === activity.id ? (
            <form onSubmit={handleSave}>
              <label htmlFor={`title-${activity.id}`}>Title</label>
              <input
                id={`title-${activity.id}`}
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />

              <label htmlFor={`difficulty-${activity.id}`}>Difficulty</label>
              <select
                id={`difficulty-${activity.id}`}
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
              >
                {DIFFICULTY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id={`hints-${activity.id}`}
                  checked={form.showHints}
                  onChange={(e) => setForm((f) => ({ ...f, showHints: e.target.checked }))}
                />
                <label htmlFor={`hints-${activity.id}`}>Show hints</label>
              </div>

              {activity.type === "WORDLE" && (
                <>
                  <label htmlFor={`guesses-${activity.id}`}>Max guesses</label>
                  <input
                    id={`guesses-${activity.id}`}
                    type="number"
                    min={3}
                    max={10}
                    value={form.maxGuesses}
                    onChange={(e) => setForm((f) => ({ ...f, maxGuesses: Number(e.target.value) }))}
                  />
                </>
              )}

              {activity.type === "WORD_SEARCH" && (
                <div className="field-row">
                  <div>
                    <label htmlFor={`rows-${activity.id}`}>Rows</label>
                    <input
                      id={`rows-${activity.id}`}
                      type="number"
                      min={6}
                      max={16}
                      value={form.gridRows}
                      onChange={(e) => setForm((f) => ({ ...f, gridRows: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label htmlFor={`cols-${activity.id}`}>Columns</label>
                    <input
                      id={`cols-${activity.id}`}
                      type="number"
                      min={6}
                      max={16}
                      value={form.gridCols}
                      onChange={(e) => setForm((f) => ({ ...f, gridCols: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              {formError && <p style={{ color: "var(--bad)", fontSize: "0.85rem" }}>{formError}</p>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={busy}>
                  Save changes
                </button>
                <button type="button" className="btn btn-quiet" style={{ width: "auto" }} onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <strong>{activity.title}</strong>{" "}
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                ({activity.type === "WORDLE" ? "Wordle" : "Word Search"} &middot; {activity.difficulty} &middot;{" "}
                hints {activity.showHints ? "on" : "off"} &middot; list: {activity.wordList?.name})
              </span>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-quiet"
                  style={{ width: "auto", padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                  onClick={() => startEdit(activity)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-quiet"
                  style={{ width: "auto", padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                  onClick={() => handleDelete(activity.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
