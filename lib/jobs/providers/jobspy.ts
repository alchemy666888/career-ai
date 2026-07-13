import { getServerEnv } from "@/lib/env";
import type { JobProvider } from "./types";

export const jobSpyProvider: JobProvider = {
  name: "jobspy",
  async search() {
    if (!getServerEnv().LIVE_JOB_INGESTION_ENABLED) return [];
    const timeout = AbortSignal.timeout(5000);
    if (timeout.aborted) return [];
    try {
      const providerModule = "jobspy";
      const mod = await import(/* webpackIgnore: true */ providerModule);
      const search = (mod as { scrape_jobs?: unknown }).scrape_jobs;
      if (typeof search !== "function") return [];
      return [];
    } catch {
      return [];
    }
  }
};
