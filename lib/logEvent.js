// Fire-and-forget event logging for the observability dashboard.
// Never throws - a logging failure should never break the user's action.
export function logGenerationEvent({ type, outcome, errorReason, wordListId }) {
  fetch("/api/events/generation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, outcome, errorReason, wordListId }),
  }).catch(() => {});
}
