import { getServerEnv } from "@/lib/env";
import { DeepSeekProvider } from "./deepseek";
import { FakeAiProvider } from "./fake";
export function getAiProvider() { return getServerEnv().AI_ENABLED ? new DeepSeekProvider() : new FakeAiProvider(); }
