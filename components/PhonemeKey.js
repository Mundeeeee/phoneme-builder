import { hintFor, englishFor } from "@/lib/phonemeData";

export default function PhonemeKey({ symbol, state, onClick, disabled }) {
  return (
    <button
      type="button"
      className="keycap"
      data-state={state}
      data-hint={hintFor(symbol)}
      onClick={onClick ? () => onClick(symbol) : undefined}
      disabled={disabled}
      aria-label={`Phoneme ${symbol}, sounds like ${englishFor(symbol)} as in ${
        hintFor(symbol).split("as in ")[1]?.replace(")", "") || ""
      }`}
    >
      <span className="ipa">{symbol}</span>
      <span className="eng">{englishFor(symbol)}</span>
    </button>
  );
}
