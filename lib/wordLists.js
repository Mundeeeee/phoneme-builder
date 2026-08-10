// Phoneme-segmented word lists sourced from the HCE Wordle Phoneme Corpus.
// Each word is stored as an array of phoneme units so games never need to
// guess where symbols split (important for multi-character units like /tʃ/).

export const WORDS_3 = [
  ["b", "e", "d"], ["b", "ɪ", "d"], ["b", "æ", "d"], ["b", "ɐ", "d"],
  ["b", "ɜː", "d"], ["b", "ɐː", "k"], ["b", "ʊ", "k"], ["b", "ʉː", "t"],
  ["b", "əʉ", "t"], ["b", "ɑe", "k"], ["b", "æɪ", "t"], ["b", "oɪ", "l"],
  ["b", "ɪə", "d"], ["tʃ", "oɪ", "s"], ["θ", "ɪ", "n"], ["ð", "e", "n"],
  ["ʃ", "ɪ", "p"], ["tʃ", "ɪ", "n"], ["dʒ", "æ", "m"], ["j", "e", "s"],
  ["w", "ɪ", "n"], ["ɹ", "ɪ", "ŋ"], ["l", "ɔ", "ɡ"], ["f", "æ", "n"],
  ["v", "æ", "n"], ["s", "ɐ", "n"], ["z", "ɪ", "p"], ["ɡ", "ɐ", "m"],
  ["h", "æ", "t"], ["f", "oː", "k"],
];

export const WORDS_4 = [
  ["s", "t", "ɔ", "p"], ["f", "ɹ", "ɔ", "ɡ"], ["k", "l", "æ", "p"],
  ["s", "l", "ɪ", "p"], ["d", "ɹ", "ɐ", "m"], ["ɡ", "ɹ", "ɪ", "n"],
  ["t", "ɹ", "æɪ", "n"], ["k", "l", "æɔ", "d"], ["s", "n", "æɪ", "k"],
  ["s", "m", "ɑe", "l"], ["m", "ɪ", "l", "k"], ["h", "æ", "n", "d"],
  ["t", "e", "n", "t"], ["dʒ", "ɐ", "m", "p"], ["l", "æ", "m", "p"],
  ["b", "æ", "ŋ", "k"], ["f", "ɹ", "æɪ", "m"], ["k", "əʉ", "l", "d"],
  ["w", "ɪ", "n", "d"], ["s", "ɔ", "f", "t"], ["ɡ", "ɪ", "f", "t"],
  ["d", "e", "s", "k"], ["l", "e", "f", "t"], ["p", "ɔ", "n", "d"],
  ["ɡ", "ɔ", "l", "f"], ["s", "ɪ", "l", "k"], ["ɡ", "ɹ", "æɪ", "t"],
  ["k", "ɹ", "æ", "b"], ["p", "l", "ɐ", "ɡ"], ["k", "w", "ɪ", "z"],
];

export const WORDS_5 = [
  ["s", "t", "æ", "m", "p"], ["p", "l", "æ", "n", "t"], ["b", "l", "æ", "ŋ", "k"],
  ["ɡ", "ɹ", "æ", "n", "d"], ["k", "l", "æ", "m", "p"], ["t", "w", "ɪ", "s", "t"],
  ["t", "ɹ", "ɐ", "s", "t"], ["d", "ɹ", "ɪ", "ŋ", "k"], ["b", "ɹ", "ɪ", "s", "k"],
  ["ʃ", "ɹ", "ɪ", "m", "p"], ["s", "k", "ɹ", "æ", "p"], ["s", "k", "ɹ", "ɑe", "b"],
  ["s", "k", "ɹ", "iː", "m"], ["s", "p", "l", "æ", "ʃ"], ["s", "p", "ɹ", "ɪ", "ŋ"],
  ["s", "t", "ɹ", "æ", "p"], ["s", "t", "ɹ", "iː", "t"], ["s", "k", "ɹ", "ɐ", "b"],
  ["f", "l", "ɐː", "s", "k"], ["k", "l", "ɐː", "s", "p"], ["k", "l", "e", "f", "t"],
  ["ɡ", "l", "ɪ", "n", "t"], ["b", "l", "e", "n", "d"], ["s", "t", "ɹ", "æɪ", "n"],
  ["θ", "ɹ", "ɐ", "s", "t"], ["s", "p", "ɹ", "oː", "l"], ["s", "k", "ɹ", "oː", "l"],
  ["s", "p", "ɹ", "ɪ", "ɡ"], ["s", "p", "ɹ", "æɔ", "t"], ["s", "m", "əʉ", "k", "t"],
];

export const WORD_LISTS_BY_LENGTH = {
  3: WORDS_3,
  4: WORDS_4,
  5: WORDS_5,
};

// A fixed starter set of 5 phoneme-based words for the Word Search activity,
// as specified for Assessment 1 (fixed list; database-driven lists arrive
// in Assessment 2).
export const WORD_SEARCH_DEFAULT = [
  ["θ", "ɪ", "n"],   // thin
  ["ʃ", "ɪ", "p"],   // ship
  ["tʃ", "ɪ", "n"],  // chin
  ["dʒ", "æ", "m"],  // jam
  ["ɹ", "ɪ", "ŋ"],   // ring
];

export function unitsToKey(units) {
  return units.join("");
}
