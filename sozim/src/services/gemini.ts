export type GeminiExplainResponse = {
  kk: string;
  ru: string;
  examples: string[];
  raw?: string;
};

const DIRECT_GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCK6dunQidXCjuxbp8pTZc86dMRBRYY35E";

function extractJsonObject(rawText: string): Record<string, unknown> | null {
  if (!rawText) return null;

  const direct = rawText.trim();
  try {
    return JSON.parse(direct);
  } catch (_err) {}

  const codeFenceMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch?.[1]) {
    try {
      return JSON.parse(codeFenceMatch[1].trim());
    } catch (_err) {}
  }

  const firstBrace = direct.indexOf("{");
  const lastBrace = direct.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(direct.slice(firstBrace, lastBrace + 1));
    } catch (_err) {}
  }

  return null;
}

function normalizeParsedResponse(parsed: Record<string, unknown>, raw = ""): GeminiExplainResponse {
  const kk = typeof parsed.kk === "string" ? parsed.kk : "";
  const ru = typeof parsed.ru === "string" ? parsed.ru : "";
  const examples = Array.isArray(parsed.examples)
    ? parsed.examples.filter((x): x is string => typeof x === "string")
    : [];

  return { kk, ru, examples, ...(raw ? { raw } : {}) };
}

export class GeminiService {
  private static buildPrompt(word: string, definition?: string): string {
    return (
      "You are a bilingual Kazakh/Russian dictionary assistant. " +
      "Explain the given Kazakh word in simple language. " +
      "Return ONLY valid JSON with this exact schema: " +
      '{"kk":string,"ru":string,"examples":string[]} . ' +
      "Rules: examples must be 2-3 short Kazakh sentences using the word naturally. " +
      "No markdown. No extra keys.\n\n" +
      `Word: ${word}\n` +
      (definition ? `Wiktionary definition (may be noisy): ${definition}\n` : "")
    );
  }

  private static async explainViaBrowserDirect(params: {
    word: string;
    definition?: string;
  }): Promise<GeminiExplainResponse> {
    const prompt = this.buildPrompt(params.word, params.definition);
    const response = await fetch(DIRECT_GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Direct Gemini failed: ${response.status}${errorText ? ` - ${errorText}` : ""}`,
      );
    }

    const data = await response.json();
    const parts = Array.isArray(data?.candidates?.[0]?.content?.parts)
      ? data.candidates[0].content.parts
      : [];
    const textPart = parts.find(
      (p: unknown): p is { text: string } =>
        typeof p === "object" &&
        p !== null &&
        "text" in p &&
        typeof (p as { text?: unknown }).text === "string",
    );
    const text = textPart?.text || "";

    const parsed = extractJsonObject(text);
    if (!parsed) {
      return { kk: "", ru: "", examples: [], raw: text };
    }

    return normalizeParsedResponse(parsed, text);
  }

  static async explainWord(params: {
    word: string;
    definition?: string;
  }): Promise<GeminiExplainResponse> {
    return this.explainViaBrowserDirect(params);
  }
}
