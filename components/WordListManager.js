"use client";

import { useState } from "react";
import { KEY_ROWS, KEY_ROWS_COLUMNS, hintFor } from "@/lib/phonemeData";
import { useWordLists } from "@/hooks/useWordLists";

function wordToUnits(word) {
  return word.phonemes.map((p) => p.symbol);
}

export default function WordListManager() {
  const { wordLists, loading, error, refresh } = useWordLists();

  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [listFormError, setListFormError] = useState("");

  const [selectedListId, setSelectedListId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [editingWordId, setEditingWordId] = useState(null);
  const [wordEnglish, setWordEnglish] = useState("");
  const [wordPhonemes, setWordPhonemes] = useState([]);
  const [wordFormError, setWordFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedList = wordLists.find((l) => l.id === selectedListId);

  async function handleCreateList(e) {
    e.preventDefault();
    setListFormError("");
    if (!newListName.trim()) {
      setListFormError("Name is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/word-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName, description: newListDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.details || [data.error]).join(" "));
      setNewListName("");
      setNewListDescription("");
      await refresh();
      setSelectedListId(data.id);
    } catch (err) {
      setListFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteList(id) {
    if (!confirm("Delete this word list and all of its words? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/word-lists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete word list.");
      if (selectedListId === id) setSelectedListId(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function selectList(list) {
    setSelectedListId(list.id);
    setRenameValue(list.name);
    resetWordForm();
  }

  async function handleRenameList(e) {
    e.preventDefault();
    if (!selectedList) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/word-lists/${selectedList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue, description: selectedList.description }),
      });
      if (!res.ok) throw new Error("Failed to rename word list.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function resetWordForm() {
    setEditingWordId(null);
    setWordEnglish("");
    setWordPhonemes([]);
    setWordFormError("");
  }

  function startEditWord(word) {
    setEditingWordId(word.id);
    setWordEnglish(word.englishWord);
    setWordPhonemes(wordToUnits(word));
    setWordFormError("");
  }

  function addPhonemeToForm(symbol) {
    setWordPhonemes((p) => [...p, symbol]);
  }

  function removePhonemeAt(index) {
    setWordPhonemes((p) => p.filter((_, i) => i !== index));
  }

  async function handleWordSubmit(e) {
    e.preventDefault();
    setWordFormError("");
    if (!selectedList) return;

    const payload = { englishWord: wordEnglish, phonemes: wordPhonemes };
    setBusy(true);
    try {
      const url = editingWordId
        ? `/api/words/${editingWordId}`
        : `/api/word-lists/${selectedList.id}/words`;
      const res = await fetch(url, {
        method: editingWordId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.details || [data.error]).join(" "));
      resetWordForm();
      await refresh();
    } catch (err) {
      setWordFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteWord(id) {
    if (!confirm("Delete this word?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete word.");
      if (editingWordId === id) resetWordForm();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card"><p>Loading...</p></div>;
  if (error) return <div className="card"><p style={{ color: "var(--bad)" }}>{error}</p></div>;

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Word lists</span>
        <h2>Create a word list</h2>
        <form onSubmit={handleCreateList}>
          <label htmlFor="listName">Name</label>
          <input
            id="listName"
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g. Term 2 CVC Words"
          />
          <label htmlFor="listDescription">Description (optional)</label>
          <input
            id="listDescription"
            type="text"
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            placeholder="What this list is for"
          />
          {listFormError && <p style={{ color: "var(--bad)", fontSize: "0.85rem" }}>{listFormError}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Create word list
          </button>
        </form>

        <h2 style={{ marginTop: "1.5rem" }}>Existing lists</h2>
        {wordLists.length === 0 && <p style={{ color: "var(--muted)" }}>No word lists yet.</p>}
        {wordLists.map((list) => (
          <div
            key={list.id}
            className="card"
            style={{
              padding: "0.85rem 1rem",
              marginTop: "0.6rem",
              borderColor: list.id === selectedListId ? "var(--primary)" : "var(--border)",
              cursor: "pointer",
            }}
            onClick={() => selectList(list)}
          >
            <strong>{list.name}</strong>
            <p style={{ margin: "0.2rem 0", color: "var(--muted)", fontSize: "0.85rem" }}>
              {list.words.length} word{list.words.length === 1 ? "" : "s"}
              {list.description ? ` \u2014 ${list.description}` : ""}
            </p>
            <button
              type="button"
              className="btn btn-quiet"
              style={{ width: "auto", padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteList(list.id);
              }}
              disabled={busy}
            >
              Delete list
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        {!selectedList ? (
          <p style={{ color: "var(--muted)" }}>Select a word list on the left to manage its words.</p>
        ) : (
          <>
            <span className="eyebrow">Managing</span>
            <form onSubmit={handleRenameList} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="renameList">List name</label>
                <input
                  id="renameList"
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-quiet" style={{ width: "auto", marginBottom: "1rem" }} disabled={busy}>
                Rename
              </button>
            </form>

            <h3>Words</h3>
            {selectedList.words.length === 0 && (
              <p style={{ color: "var(--muted)" }}>No words in this list yet.</p>
            )}
            {selectedList.words.map((w) => (
              <div key={w.id} className="checkbox-row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {w.englishWord} <span style={{ color: "var(--muted)" }}>({wordToUnits(w).join(" ")})</span>
                </span>
                <span style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                    onClick={() => startEditWord(w)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                    onClick={() => handleDeleteWord(w.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}

            <h3 style={{ marginTop: "1.25rem" }}>{editingWordId ? "Edit word" : "Add a word"}</h3>
            <form onSubmit={handleWordSubmit}>
              <label htmlFor="wordEnglish">English word</label>
              <input
                id="wordEnglish"
                type="text"
                value={wordEnglish}
                onChange={(e) => setWordEnglish(e.target.value)}
                placeholder="e.g. bed"
              />

              <label htmlFor="phonemeWord">Phoneme sequence</label>
              <input id="phonemeWord" type="text" value={wordPhonemes.join(" ")} readOnly />
              {wordPhonemes.length > 0 && (
                <div className="word-chip-list" style={{ marginBottom: "0.75rem" }}>
                  {wordPhonemes.map((symbol, i) => (
                    <button
                      type="button"
                      key={i}
                      className="word-chip"
                      title="Click to remove"
                      onClick={() => removePhonemeAt(i)}
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              )}

              <table className="phoneme-table" style={{ marginBottom: "1rem" }}>
                <tbody>
                  {KEY_ROWS.map((row, ri) => (
                    <tr key={ri}>
                      {Array.from({ length: KEY_ROWS_COLUMNS }).map((_, ci) => {
                        const symbol = row[ci];
                        if (!symbol) return <td key={ci} className="phoneme-table-empty" />;
                        return (
                          <td
                            key={ci}
                            className="phoneme-table-key"
                            data-hint={hintFor(symbol)}
                            onClick={() => addPhonemeToForm(symbol)}
                            role="button"
                            tabIndex={0}
                          >
                            {symbol}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {wordFormError && <p style={{ color: "var(--bad)", fontSize: "0.85rem" }}>{wordFormError}</p>}
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {editingWordId ? "Update word" : "Add word"}
                </button>
                {editingWordId && (
                  <button type="button" className="btn btn-quiet" onClick={resetWordForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
