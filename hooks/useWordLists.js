"use client";

import { useCallback, useEffect, useState } from "react";

// Fetches every word list (with its words and phonemes) from the backend.
// Used by both builder pages so they read live database content instead
// of the fixed, hard-coded lists from Assessment 1.
export function useWordLists() {
  const [wordLists, setWordLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/word-lists", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load word lists from the server.");
      const data = await res.json();
      setWordLists(data);
    } catch (err) {
      setError(err.message || "Something went wrong loading word lists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { wordLists, loading, error, refresh };
}
