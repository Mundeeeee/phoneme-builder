import WordSearchBuilder from "@/components/WordSearchBuilder";

export default function WordSearchPage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">Activity 2</span>
      <h1>Phoneme Word Search Builder</h1>
      <p>
        Choose the phoneme words and grid size, preview the puzzle, and generate a downloadable
        HTML file for classroom use.
      </p>
      <WordSearchBuilder />
    </div>
  );
}
