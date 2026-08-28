import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateWordInput } from "@/lib/validation";

// POST /api/word-lists/:id/words - add a new phoneme-based word to a list.
export const POST = withErrorHandling(async (request, { params }) => {
  const { id: wordListId } = await params;
  const body = await request.json();
  const result = validateWordInput(body);
  if (!result.valid) return jsonError("Invalid word data.", 400, result.errors);

  const wordList = await prisma.wordList.findUnique({ where: { id: wordListId } });
  if (!wordList) return jsonError("Word list not found.", 404);

  const word = await prisma.word.create({
    data: {
      englishWord: body.englishWord.trim(),
      wordListId,
      phonemes: {
        create: body.phonemes.map((symbol, position) => ({ symbol, position })),
      },
    },
    include: { phonemes: { orderBy: { position: "asc" } } },
  });
  return jsonOk(word, 201);
});
