import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateWordInput } from "@/lib/validation";

// GET /api/words/:id - a single word with its ordered phoneme units.
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const word = await prisma.word.findUnique({
    where: { id },
    include: { phonemes: { orderBy: { position: "asc" } } },
  });
  if (!word) return jsonError("Word not found.", 404);
  return jsonOk(word);
});

// PUT /api/words/:id - update a word's English spelling and/or its full
// phoneme sequence (the old PhonemeUnit rows are replaced with new ones so
// ordering and multi-character symbols stay consistent).
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const result = validateWordInput(body);
  if (!result.valid) return jsonError("Invalid word data.", 400, result.errors);

  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) return jsonError("Word not found.", 404);

  await prisma.phonemeUnit.deleteMany({ where: { wordId: id } });
  const word = await prisma.word.update({
    where: { id },
    data: {
      englishWord: body.englishWord.trim(),
      phonemes: {
        create: body.phonemes.map((symbol, position) => ({ symbol, position })),
      },
    },
    include: { phonemes: { orderBy: { position: "asc" } } },
  });
  return jsonOk(word);
});

// DELETE /api/words/:id - remove a word (its PhonemeUnit rows cascade).
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) return jsonError("Word not found.", 404);

  await prisma.word.delete({ where: { id } });
  return jsonOk({ deleted: true, id });
});
