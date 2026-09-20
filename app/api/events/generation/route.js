import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validateGenerationEventInput } from "@/lib/validation";

// POST /api/events/generation - records one Generate-button click,
// success or failure. Called by the Wordle/Word Search builders.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const result = validateGenerationEventInput(body);
  if (!result.valid) return jsonError("Invalid generation event.", 400, result.errors);

  const event = await prisma.generationEvent.create({
    data: {
      type: body.type,
      outcome: body.outcome,
      errorReason: body.outcome === "FAILURE" ? body.errorReason || "Unknown error" : null,
      wordListId: body.wordListId || null,
    },
  });
  return jsonOk(event, 201);
});
