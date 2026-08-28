import WordListManager from "@/components/WordListManager";

export default function WordListsPage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">Backend &amp; database</span>
      <h1>Word Lists</h1>
      <p>
        Create and manage phoneme-based word lists here. Everything on this page reads from and
        writes to the database through the API routes under <code>/api</code> &mdash; the Wordle
        and Word Search builders read the same stored data.
      </p>
      <WordListManager />
    </div>
  );
}
