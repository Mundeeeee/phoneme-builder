import WordleBuilder from "@/components/WordleBuilder";

export default function WordlePage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">Activity 1</span>
      <h1>Phoneme Wordle Builder</h1>
      <p>
        Configure a phoneme-based Wordle activity and preview it live before generating a
        downloadable HTML file for classroom use.
      </p>
      <WordleBuilder />
    </div>
  );
}
