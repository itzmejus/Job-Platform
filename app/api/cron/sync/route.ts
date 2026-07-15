import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync/orchestrator";

export const maxDuration = 60;

/**
 * Vercel Cron Jobs invoke this route with GET and an
 * `Authorization: Bearer $CRON_SECRET` header (Vercel adds this
 * automatically once CRON_SECRET is set as an env var). POST is also
 * accepted so this can be called manually the same way during setup/testing.
 */
export async function GET(request: Request) {
  return handleSyncRequest(request);
}

export async function POST(request: Request) {
  return handleSyncRequest(request);
}

async function handleSyncRequest(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summaries = await runSync();
  return NextResponse.json({ summaries });
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(headerBuf, expectedBuf);
}
