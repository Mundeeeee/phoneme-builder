import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateActivityConfigInput } from "@/lib/validation";

// GET /api/activities/:id
export const GET = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const activity = await prisma.activityConfig.findUnique({
    where: { id },
    include: {
      wordList: {
        include: { words: { include: { phonemes: { orderBy: { position: "asc" } } } } },
      },
    },
  });
  if (!activity) return jsonError("Activity configuration not found.", 404);
  return jsonOk(activity);
});

// PUT /api/activities/:id - update a saved configuration's settings.
export const PUT = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const result = validateActivityConfigInput(body);
  if (!result.valid) return jsonError("Invalid activity configuration.", 400, result.errors);

  const existing = await prisma.activityConfig.findUnique({ where: { id } });
  if (!existing) return jsonError("Activity configuration not found.", 404);

  const wordList = await prisma.wordList.findUnique({ where: { id: body.wordListId } });
  if (!wordList) return jsonError("wordListId does not reference an existing word list.", 400);

  const activity = await prisma.activityConfig.update({
    where: { id },
    data: {
      type: body.type,
      title: body.title.trim(),
      difficulty: body.difficulty || "MEDIUM",
      showHints: body.showHints ?? true,
      maxGuesses: body.type === "WORDLE" ? body.maxGuesses ?? 6 : null,
      gridRows: body.type === "WORD_SEARCH" ? body.gridRows ?? 10 : null,
      gridCols: body.type === "WORD_SEARCH" ? body.gridCols ?? 10 : null,
      wordListId: body.wordListId,
    },
    include: {
      wordList: {
        include: { words: { include: { phonemes: { orderBy: { position: "asc" } } } } },
      },
    },
  });
  return jsonOk(activity);
});

// DELETE /api/activities/:id
export const DELETE = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const existing = await prisma.activityConfig.findUnique({ where: { id } });
  if (!existing) return jsonError("Activity configuration not found.", 404);

  await prisma.activityConfig.delete({ where: { id } });
  return jsonOk({ deleted: true, id });
});
