import { getServerEnv } from "@/lib/env";

export function verifyCronRequest(request: Request) {
  const expected = getServerEnv().CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}` || request.headers.get("x-cron-secret") === expected;
}
