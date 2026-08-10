// HCE (broad transcription) phoneme inventory.
// Each entry maps an IPA symbol to the English digraph/letter a teacher
// would say aloud, plus a short example word for the mouse-over hint,
// e.g. hovering /th/ shows "TH (as in thin)".

export const CONSONANTS = [
  ["p", "P", "pig"],
  ["t", "T", "top"],
  ["k", "K", "cat"],
  ["b", "B", "bed"],
  ["d", "D", "dog"],
  ["ɡ", "G", "go"],
  ["n", "N", "net"],
  ["m", "M", "map"],
  ["ŋ", "NG", "ring"],
  ["f", "F", "fan"],
  ["s", "S", "sun"],
  ["θ", "TH", "thin"],
  ["ʃ", "SH", "ship"],
  ["v", "V", "van"],
  ["z", "Z", "zip"],
  ["ð", "TH", "then"],
  ["ʒ", "ZH", "measure"],
  ["l", "L", "log"],
  ["ɹ", "R", "run"],
  ["w", "W", "win"],
  ["j", "Y", "yes"],
  ["h", "H", "hat"],
  ["tʃ", "CH", "chin"],
  ["dʒ", "J", "jam"],
];

export const VOWELS = [
  ["iː", "EE", "bee"],
  ["ɪ", "I", "bid"],
  ["e", "E", "bed"],
  ["eː", "AIR", "hair"],
  ["æ", "A", "bad"],
  ["ɐ", "U", "bud"],
  ["ɐː", "AR", "bark"],
  ["ɜː", "ER", "bird"],
  ["ʉː", "OO", "boot"],
  ["ɔ", "O", "log"],
  ["oː", "OR", "fork"],
  ["ʊ", "OO", "book"],
  ["æɪ", "AY", "bait"],
  ["ɑe", "IGH", "bike"],
  ["oɪ", "OY", "boil"],
  ["əʉ", "OA", "boat"],
  ["æɔ", "OW", "cloud"],
  ["ɪə", "EAR", "beard"],
  ["ə", "UH", "sofa"],
];

export const PHONEME_KEY = [...CONSONANTS, ...VOWELS];

// Row groupings exactly matching the corpus phoneme table (used to render
// the keyboard as a table with the same row/column shape, 4 columns wide).
export const KEY_ROWS = [
  ["p", "t", "k"],
  ["b", "d", "ɡ"],
  ["n", "m", "ŋ"],
  ["f", "s", "θ", "ʃ"],
  ["v", "z", "ð", "ʒ"],
  ["l", "ɹ", "w", "j"],
  ["h", "tʃ", "dʒ"],
  ["iː", "ɪ", "e", "eː"],
  ["æ", "ɐ", "ɐː", "ɜː"],
  ["ʉː", "ɔ", "oː", "ʊ"],
  ["æɪ", "ɑe", "oɪ", "əʉ"],
  ["æɔ", "ɪə", "ə"],
];
export const KEY_ROWS_COLUMNS = 4;

// Fast lookup: "θ" -> { label: "TH", example: "thin" }
export const PHONEME_MAP = PHONEME_KEY.reduce((acc, [symbol, label, example]) => {
  acc[symbol] = { label, example };
  return acc;
}, {});

export function englishFor(symbol) {
  return PHONEME_MAP[symbol]?.label || symbol.toUpperCase();
}

export function hintFor(symbol) {
  const entry = PHONEME_MAP[symbol];
  if (!entry) return symbol;
  return `${entry.label} (as in ${entry.example})`;
}

// Build the plain-English spelling of a phoneme sequence, e.g.
// ["b","æ","d"] -> "B A D" (approximate, for the "correct answer" reveal)
export function englishSpelling(units) {
  return units.map((u) => englishFor(u)).join("");
}
