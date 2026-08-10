export default function AboutPage() {
  return (
    <div className="page-shell">
      <span className="eyebrow">About</span>
      <h1>About this project</h1>
      <p>
        The HCE Phoneme Activity Builder is a frontend tool for Speech Pathology teachers.
        It lets a teacher configure two phoneme-based classroom activities &mdash; a Wordle-style
        guessing game and a Word Search &mdash; preview them live, and generate a single,
        standalone HTML file that plays in any web browser without any further setup.
      </p>

      <div className="card">
        <h3>Wordle tool</h3>
        <p>
          Teachers pick a phoneme length (3, 4 or 5 phonemes), a target word, and the number of
          guesses allowed. Students build each guess from a phoneme keyboard, where every key
          shows the IPA symbol with its English letter equivalence on hover (for example /θ/
          shows &ldquo;TH (as in thin)&rdquo;).
        </p>
      </div>

      <div className="card">
        <h3>Word Search tool</h3>
        <p>
          Teachers choose which phoneme words to include and the grid size, then generate a
          puzzle where each cell holds one phoneme unit. Students click-and-drag to find words,
          with hover hints and a live word list showing which words have been found.
        </p>
      </div>

      <div className="card">
        <h3>Submission details</h3>
        <p>Lachlan Broadbent &middot; Student Number: 22451393</p>
        <p style={{ marginBottom: 0 }}>Video walkthrough:</p>
        <video controls style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}>
          <source src="/guide.mkv" type="video/mkv" />
        </video>
      </div>
    </div>
  );
}
