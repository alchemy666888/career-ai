import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { enqueueScheduledIngestion } from "@/lib/jobs/ingestion/service";
import { verifyCronRequest } from "@/lib/server/cron";

export const runtime = "nodejs";

async function handleExternalIngestionRequest(request: Request) {
  if (!verifyCronRequest(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const result = await enqueueScheduledIngestion(getDb(), "cron");
  return NextResponse.json({ ok: true, trigger: "external_cron", ...result });
}

export async function GET(request: Request) {
  return handleExternalIngestionRequest(request);
}

export async function POST(request: Request) {
  return handleExternalIngestionRequest(request);
}
