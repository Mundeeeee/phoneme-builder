"use client";

import { useCallback, useEffect, useState } from "react";

// Fetches every saved ActivityConfig (Wordle/Word Search settings a
// teacher has saved) from the backend.
export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load saved activities.");
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      setError(err.message || "Something went wrong loading activities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activities, loading, error, refresh };
}
