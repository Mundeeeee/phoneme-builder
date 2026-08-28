import { NextResponse } from "next/server";

export function jsonOk(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message, status = 400, errors = null) {
  return NextResponse.json(
    { error: message, ...(errors ? { details: errors } : {}) },
    { status }
  );
}

// Wraps a route handler so unexpected exceptions (bad JSON body, Prisma
// errors, etc.) become a clean 500 response instead of a crashed request.
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("API error:", err);
      if (err instanceof SyntaxError) {
        return jsonError("Request body must be valid JSON.", 400);
      }
      // Prisma "record not found" style errors
      if (err?.code === "P2025") {
        return jsonError("Record not found.", 404);
      }
      return jsonError("Internal server error.", 500);
    }
  };
}
