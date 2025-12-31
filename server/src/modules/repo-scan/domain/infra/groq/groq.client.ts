import Groq from "groq-sdk";

export type GroqChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type GroqChatOptions = {
  model: string;
  temperature?: number;
  maxCompletionTokens?: number;
};

export class GroqClient {
  private readonly client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async chatJSON<T>(
    messages: GroqChatMessage[],
    opts: GroqChatOptions
  ): Promise<{ json: T; rawText: string }> {
    const res = await this.client.chat.completions.create({
      model: opts.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_completion_tokens: opts.maxCompletionTokens ?? 900
    } as any);

    const rawText = res.choices?.[0]?.message?.content ?? "";
    const json = safeParseJSON<T>(rawText);
    if (!json) {
      throw new Error("AI returned non-JSON response");
    }

    return { json, rawText };
  }
}

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {}

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
