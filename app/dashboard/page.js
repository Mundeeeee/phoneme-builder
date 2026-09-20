import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">Observability</span>
      <h1>Dashboard</h1>
      <p>
        Live operational metrics: activity counts, generation success/failure, average time on
        page, and alerts for empty word lists or recent failures.
      </p>
      <Dashboard />
    </div>
  );
}
