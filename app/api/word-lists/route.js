import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateWordListInput } from "@/lib/validation";

// GET /api/word-lists - list every word list, with its words + phonemes,
// for the builder pages to populate their dropdowns/checkboxes.
export const GET = withErrorHandling(async () => {
  const wordLists = await prisma.wordList.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      words: {
        orderBy: { createdAt: "asc" },
        include: { phonemes: { orderBy: { position: "asc" } } },
      },
      _count: { select: { activities: true } },
    },
  });
  return jsonOk(wordLists);
});

// POST /api/word-lists - create a new (initially empty) word list.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const result = validateWordListInput(body);
  if (!result.valid) return jsonError("Invalid word list data.", 400, result.errors);

  const wordList = await prisma.wordList.create({
    data: { name: body.name.trim(), description: body.description?.trim() || null },
  });
  return jsonOk(wordList, 201);
});
