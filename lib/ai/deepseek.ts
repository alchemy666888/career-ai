import type { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { logEvent } from "@/lib/observability/logger";
import { AiProviderError, type AiProvider, type AiTextRequest } from "./contracts";

export class DeepSeekProvider implements AiProvider {
  name = "deepseek";
  model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  private baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  async generateText(request: AiTextRequest) {
    const env = getServerEnv();
    if (!env.AI_ENABLED) throw new AiProviderError("AI_DISABLED");
    if (!env.DEEPSEEK_API_KEY) throw new AiProviderError("AI_DISABLED");
    return this.call(request, false) as Promise<Awaited<ReturnType<AiProvider["generateText"]>>>;
  }
  async generateStructured<T>(request: AiTextRequest, schema: z.ZodSchema<T>) {
    const first = await this.call(request, true);
    try { return { data: schema.parse(JSON.parse(first.text)), usage: first.usage, repaired: false }; } catch {
      const repaired = await this.call({ ...request, user: "Repair the prior response into valid JSON for the required schema." }, true);
      try { return { data: schema.parse(JSON.parse(repaired.text)), usage: repaired.usage, repaired: true }; } catch { throw new AiProviderError("AI_INVALID_RESPONSE"); }
    }
  }
  private async call(request: AiTextRequest, jsonMode: boolean) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 15000);
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, { method: "POST", headers: { authorization: `Bearer ${getServerEnv().DEEPSEEK_API_KEY}`, "content-type": "application/json" }, signal: controller.signal, body: JSON.stringify({ model: this.model, messages: [{ role: "system", content: request.system }, { role: "user", content: request.user }], response_format: jsonMode ? { type: "json_object" } : undefined }) });
        if (response.ok) { const data = await response.json() as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } }; return { text: data.choices?.[0]?.message?.content ?? "", usage: { provider: this.name, model: this.model, inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 } }; }
      }
      throw new AiProviderError("AI_PROVIDER_FAILED");
    } catch (error) { logEvent({ severity: "warn", event: "ai_provider_failed", operation: request.operation, provider: this.name, model: this.model, code: error instanceof AiProviderError ? error.code : "AI_PROVIDER_FAILED" }); if (error instanceof DOMException && error.name === "AbortError") throw new AiProviderError("AI_TIMEOUT"); if (error instanceof AiProviderError) throw error; throw new AiProviderError("AI_PROVIDER_FAILED"); } finally { clearTimeout(timeout); }
  }
}
