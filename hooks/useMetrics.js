"use client";

import { useCallback, useEffect, useState } from "react";

// Fetches the aggregated dashboard metrics from GET /api/metrics.
export function useMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch("/api/metrics", { cache: "no-store" }),
        fetch("/health", { cache: "no-store" }),
      ]);
      if (!metricsRes.ok) throw new Error("Failed to load metrics.");
      setMetrics(await metricsRes.json());
      setHealth(healthRes.ok ? await healthRes.json() : { status: "error" });
    } catch (err) {
      setError(err.message || "Something went wrong loading metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, health, loading, error, refresh };
}
