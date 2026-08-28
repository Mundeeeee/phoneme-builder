import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateWordListInput } from "@/lib/validation";

// GET /api/word-lists/:id - a single word list with its words + phonemes.
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const wordList = await prisma.wordList.findUnique({
    where: { id },
    include: {
      words: {
        orderBy: { createdAt: "asc" },
        include: { phonemes: { orderBy: { position: "asc" } } },
      },
      activities: true,
    },
  });
  if (!wordList) return jsonError("Word list not found.", 404);
  return jsonOk(wordList);
});

// PUT /api/word-lists/:id - rename / update the description of a word list.
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const result = validateWordListInput(body);
  if (!result.valid) return jsonError("Invalid word list data.", 400, result.errors);

  const existing = await prisma.wordList.findUnique({ where: { id } });
  if (!existing) return jsonError("Word list not found.", 404);

  const wordList = await prisma.wordList.update({
    where: { id },
    data: { name: body.name.trim(), description: body.description?.trim() || null },
  });
  return jsonOk(wordList);
});

// DELETE /api/word-lists/:id - deletes the list and (via onDelete: Cascade
// in the schema) its words, their phonemes, and any activity configs that
// pointed at it.
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const existing = await prisma.wordList.findUnique({ where: { id } });
  if (!existing) return jsonError("Word list not found.", 404);

  await prisma.wordList.delete({ where: { id } });
  return jsonOk({ deleted: true, id });
});
