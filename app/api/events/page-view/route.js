import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, withErrorHandling } from "@/lib/api-helpers";
import { validatePageViewInput } from "@/lib/validation";

// POST /api/events/page-view - records how long a visitor spent on a
// page. Called by PageViewTracker when a visitor navigates away.
export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  const result = validatePageViewInput(body);
  if (!result.valid) return jsonError("Invalid page-view event.", 400, result.errors);

  const event = await prisma.pageViewEvent.create({
    data: { page: body.page, durationMs: Math.round(body.durationMs) },
  });
  return jsonOk(event, 201);
});
