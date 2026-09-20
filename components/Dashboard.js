"use client";

import { useMetrics } from "@/hooks/useMetrics";

function formatMs(ms) {
  if (!ms) return "0s";
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function Dashboard() {
  const { metrics, health, loading, error, refresh } = useMetrics();

  if (loading) return <div className="card"><p>Loading dashboard...</p></div>;
  if (error) return <div className="card"><p style={{ color: "var(--bad)" }}>{error}</p></div>;

  const { activityCounts, generation, mostUsedActivityType, averageTimeOnPageMs, alerts } = metrics;
  const successPct = generation.total === 0 ? 0 : Math.round(generation.successRate * 100);

  return (
    <div>
      {/* Health status banner */}
      <div
        className="result-banner"
        role="status"
        style={{ background: health?.status === "ok" ? undefined : "rgba(181,72,74,0.15)" }}
      >
        <strong>System health:</strong>{" "}
        {health?.status === "ok" ? (
          <span style={{ color: "var(--good)" }}>Healthy &mdash; database connected</span>
        ) : (
          <span style={{ color: "var(--bad)" }}>Unhealthy &mdash; check the database connection</span>
        )}
        <button type="button" className="btn btn-quiet" style={{ width: "auto", marginLeft: "1rem", padding: "0.3rem 0.7rem" }} onClick={refresh}>
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {(alerts.emptyWordLists.length > 0 || alerts.recentFailures.length > 0) && (
        <div className="card" role="alert" style={{ borderColor: "var(--bad)" }}>
          <span className="eyebrow" style={{ color: "var(--bad)" }}>Alerts</span>
          {alerts.emptyWordLists.length > 0 && (
            <p>
              <span aria-hidden="true">&#9888;</span> {alerts.emptyWordLists.length} word list(s) have no words:{" "}
              {alerts.emptyWordLists.map((l) => l.name).join(", ")}
            </p>
          )}
          {alerts.recentFailures.length > 0 && (
            <>
              <p style={{ marginBottom: "0.4rem" }}><span aria-hidden="true">&#9888;</span> Recent generation failures:</p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {alerts.recentFailures.map((f) => (
                  <li key={f.id} style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {f.type} &mdash; {f.errorReason} ({new Date(f.createdAt).toLocaleString()})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="card">
          <span className="eyebrow">Activities created</span>
          <h2>{activityCounts.total}</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {activityCounts.wordle} Wordle &middot; {activityCounts.wordSearch} Word Search
          </p>
        </div>

        <div className="card">
          <span className="eyebrow">Most-used activity type</span>
          <h2>{mostUsedActivityType ? (mostUsedActivityType === "WORDLE" ? "Wordle" : "Word Search") : "N/A"}</h2>
        </div>

        <div className="card">
          <span className="eyebrow">Generation success rate</span>
          <h2>{generation.total === 0 ? "N/A" : `${successPct}%`}</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {generation.success} succeeded &middot; {generation.failure} failed
          </p>
        </div>

        <div className="card">
          <span className="eyebrow">Average time on page</span>
          <h2>{formatMs(averageTimeOnPageMs)}</h2>
        </div>
      </div>

      {/* Simple success/failure bar */}
      {generation.total > 0 && (
        <div className="card">
          <span className="eyebrow">Generation outcomes</span>
          <div aria-hidden="true" style={{ display: "flex", height: "24px", borderRadius: "6px", overflow: "hidden", marginTop: "0.5rem" }}>
            <div style={{ width: `${successPct}%`, background: "var(--good)" }} title={`${generation.success} succeeded`} />
            <div style={{ width: `${100 - successPct}%`, background: "var(--bad)" }} title={`${generation.failure} failed`} />
          </div>
        </div>
      )}
    </div>
  );
}
