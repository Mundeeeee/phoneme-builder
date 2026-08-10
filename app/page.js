import Link from "next/link";
import WaveformRule from "@/components/WaveformRule";

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="hero">
        <span className="eyebrow">HCE Phoneme Activity Builder</span>
        <h1>Build phoneme-based classroom activities in minutes.</h1>
        <p>
          This tool helps Speech Pathology teachers create a phoneme-based Wordle game and a
          phoneme Word Search, preview them instantly, and download a single HTML file that
          plays in any web browser &mdash; no server or install required for students.
        </p>
        <WaveformRule />
      </section>

      <div className="tile-links">
        <Link href="/wordle" className="tile-link">
          <span className="eyebrow">Activity 1</span>
          <h3>Wordle Builder</h3>
          <p>Choose a phoneme-based target word and generate a playable guessing game.</p>
        </Link>
        <Link href="/word-search" className="tile-link">
          <span className="eyebrow">Activity 2</span>
          <h3>Word Search Builder</h3>
          <p>Select phoneme words and grid size, then generate a printable-style puzzle.</p>
        </Link>
        <Link href="/about" className="tile-link">
          <span className="eyebrow">Project info</span>
          <h3>About this project</h3>
          <p>What this assessment covers, and how to use the builder.</p>
        </Link>
        <Link href="/settings" className="tile-link">
          <span className="eyebrow">Preferences</span>
          <h3>Settings</h3>
          <p>Switch between light and dark mode. Your choice is remembered.</p>
        </Link>
      </div>
    </div>
  );
}
