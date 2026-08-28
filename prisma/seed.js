// Seeds the database with starter word lists and default activity
// configurations, so the app has real data to show the moment the
// container starts (rather than an empty database). Written as plain
// CommonJS so it can be run directly with `node prisma/seed.js`
// regardless of the app's ES module setup.
//
// Data intentionally duplicated (not imported) from lib/wordLists.js:
// that file is an ES module meant for the Next.js frontend bundle, while
// this script runs standalone under plain Node during `npm run db:seed`.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const wordListSeeds = [
  {
    name: "3-Phoneme Starters",
    description: "Short CVC-style words for early Wordle rounds.",
    words: [
      { englishWord: "BED", phonemes: ["b", "e", "d"] },
      { englishWord: "BID", phonemes: ["b", "ɪ", "d"] },
      { englishWord: "BAD", phonemes: ["b", "æ", "d"] },
      { englishWord: "THIN", phonemes: ["θ", "ɪ", "n"] },
      { englishWord: "SHIP", phonemes: ["ʃ", "ɪ", "p"] },
      { englishWord: "CHIN", phonemes: ["tʃ", "ɪ", "n"] },
      { englishWord: "JAM", phonemes: ["dʒ", "æ", "m"] },
      { englishWord: "RING", phonemes: ["ɹ", "ɪ", "ŋ"] },
    ],
  },
  {
    name: "4-Phoneme Starters",
    description: "Blend and cluster words for a medium Wordle difficulty.",
    words: [
      { englishWord: "STOP", phonemes: ["s", "t", "ɔ", "p"] },
      { englishWord: "FROG", phonemes: ["f", "ɹ", "ɔ", "ɡ"] },
      { englishWord: "CLAP", phonemes: ["k", "l", "æ", "p"] },
      { englishWord: "HAND", phonemes: ["h", "æ", "n", "d"] },
      { englishWord: "DESK", phonemes: ["d", "e", "s", "k"] },
      { englishWord: "QUIZ", phonemes: ["k", "w", "ɪ", "z"] },
    ],
  },
  {
    name: "5-Phoneme Starters",
    description: "Longer consonant-cluster words for advanced students.",
    words: [
      { englishWord: "STAMP", phonemes: ["s", "t", "æ", "m", "p"] },
      { englishWord: "PLANT", phonemes: ["p", "l", "æ", "n", "t"] },
      { englishWord: "TWIST", phonemes: ["t", "w", "ɪ", "s", "t"] },
      { englishWord: "SHRIMP", phonemes: ["ʃ", "ɹ", "ɪ", "m", "p"] },
      { englishWord: "STREET", phonemes: ["s", "t", "ɹ", "iː", "t"] },
      { englishWord: "BLEND", phonemes: ["b", "l", "e", "n", "d"] },
    ],
  },
  {
    name: "Word Search Starters",
    description: "The default five-word set for the Word Search activity.",
    words: [
      { englishWord: "THIN", phonemes: ["θ", "ɪ", "n"] },
      { englishWord: "SHIP", phonemes: ["ʃ", "ɪ", "p"] },
      { englishWord: "CHIN", phonemes: ["tʃ", "ɪ", "n"] },
      { englishWord: "JAM", phonemes: ["dʒ", "æ", "m"] },
      { englishWord: "RING", phonemes: ["ɹ", "ɪ", "ŋ"] },
    ],
  },
];

async function main() {
  const existing = await prisma.wordList.count();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} word list(s) already exist.`);
    return;
  }

  const createdLists = {};
  for (const list of wordListSeeds) {
    const created = await prisma.wordList.create({
      data: {
        name: list.name,
        description: list.description,
        words: {
          create: list.words.map((w) => ({
            englishWord: w.englishWord,
            phonemes: {
              create: w.phonemes.map((symbol, position) => ({ symbol, position })),
            },
          })),
        },
      },
    });
    createdLists[list.name] = created;
    console.log(`Created word list "${created.name}" with ${list.words.length} words.`);
  }

  await prisma.activityConfig.create({
    data: {
      type: "WORDLE",
      title: "Phoneme'le",
      difficulty: "EASY",
      showHints: true,
      maxGuesses: 6,
      wordListId: createdLists["3-Phoneme Starters"].id,
    },
  });

  await prisma.activityConfig.create({
    data: {
      type: "WORD_SEARCH",
      title: "Phoneme Word Search",
      difficulty: "MEDIUM",
      showHints: true,
      gridRows: 10,
      gridCols: 10,
      wordListId: createdLists["Word Search Starters"].id,
    },
  });

  console.log("Created default Wordle and Word Search activity configurations.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
