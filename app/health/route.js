import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /health - liveness/readiness check, used by Docker (see Dockerfile
// HEALTHCHECK) and demonstrated directly in the video. Route lives at the
// bare /health path as specified in the assessment brief (not /api/health).
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "connected", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: "error", database: "unreachable", message: String(err?.message || err) },
      { status: 503 }
    );
  }
}
