import { prisma } from "@/lib/prisma";
import { jsonOk, withErrorHandling } from "@/lib/api-helpers";

// GET /api/metrics - aggregated stats for the dashboard: activity counts,
// generation success/failure, average time on page, most-used type, and
// data worth alerting on (empty word lists, recent failures).
export const GET = withErrorHandling(async () => {
  const [
    wordleCount,
    wordSearchCount,
    successCount,
    failureCount,
    recentFailures,
    avgPageView,
    wordListsWithCounts,
  ] = await Promise.all([
    prisma.activityConfig.count({ where: { type: "WORDLE" } }),
    prisma.activityConfig.count({ where: { type: "WORD_SEARCH" } }),
    prisma.generationEvent.count({ where: { outcome: "SUCCESS" } }),
    prisma.generationEvent.count({ where: { outcome: "FAILURE" } }),
    prisma.generationEvent.findMany({
      where: { outcome: "FAILURE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, type: true, errorReason: true, createdAt: true },
    }),
    prisma.pageViewEvent.aggregate({ _avg: { durationMs: true }, _count: true }),
    prisma.wordList.findMany({
      select: { id: true, name: true, _count: { select: { words: true } } },
    }),
  ]);

  const mostUsedActivityType =
    wordleCount === 0 && wordSearchCount === 0
      ? null
      : wordleCount >= wordSearchCount
      ? "WORDLE"
      : "WORD_SEARCH";

  const emptyWordLists = wordListsWithCounts.filter((l) => l._count.words === 0);

  return jsonOk({
    activityCounts: {
      wordle: wordleCount,
      wordSearch: wordSearchCount,
      total: wordleCount + wordSearchCount,
    },
    generation: {
      success: successCount,
      failure: failureCount,
      total: successCount + failureCount,
      successRate: successCount + failureCount === 0 ? null : successCount / (successCount + failureCount),
    },
    mostUsedActivityType,
    averageTimeOnPageMs: avgPageView._avg.durationMs || 0,
    pageViewSampleSize: avgPageView._count,
    alerts: {
      emptyWordLists: emptyWordLists.map((l) => ({ id: l.id, name: l.name })),
      recentFailures,
    },
  });
});
