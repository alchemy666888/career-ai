import { GET as runGet, POST as runPost } from "@/app/api/ingestion/jobs/run/route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return runGet(request);
}

export async function POST(request: Request) {
  return runPost(request);
}
