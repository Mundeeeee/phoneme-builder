export default function WaveformRule() {
  const heights = [4, 9, 14, 8, 18, 6, 12, 16, 5, 10, 14, 7, 18, 9, 4, 13, 8, 15, 6, 11];
  return (
    <div className="waveform-rule" aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}
