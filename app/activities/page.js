import ActivityManager from "@/components/ActivityManager";

export default function ActivitiesPage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">Backend &amp; database</span>
      <h1>Saved Activities</h1>
      <p>
        Every Wordle or Word Search configuration saved from the builder pages lives here as an
        <code> ActivityConfig</code> row. Read, update, or delete them &mdash; this is the CRUD
        surface for activity settings, separate from the word list/word CRUD on the{" "}
        <a href="/word-lists">Word Lists</a> page.
      </p>
      <ActivityManager />
    </div>
  );
}
