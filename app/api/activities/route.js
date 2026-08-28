import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateActivityConfigInput } from "@/lib/validation";

// GET /api/activities?type=WORDLE|WORD_SEARCH - list saved activity
// configurations (optionally filtered by type), each with its word list.
export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const activities = await prisma.activityConfig.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      wordList: {
        include: { words: { include: { phonemes: { orderBy: { position: "asc" } } } } },
      },
    },
  });
  return jsonOk(activities);
});

// POST /api/activities - save a new Wordle or Word Search configuration
// pointing at an existing word list.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const result = validateActivityConfigInput(body);
  if (!result.valid) return jsonError("Invalid activity configuration.", 400, result.errors);

  const wordList = await prisma.wordList.findUnique({ where: { id: body.wordListId } });
  if (!wordList) return jsonError("wordListId does not reference an existing word list.", 400);

  const activity = await prisma.activityConfig.create({
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
  return jsonOk(activity, 201);
});
