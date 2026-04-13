import { AIWordInsights } from "../types";

export type GeminiExplainResponse = AIWordInsights;

const GEMINI_PROXY_ENDPOINT = "/api/gemini/explain";
const GEMINI_LOCAL_ENDPOINT = "http://localhost:5001/api/gemini/explain";

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
  const interpretations = Array.isArray(parsed.interpretations)
    ? parsed.interpretations.filter((x): x is string => typeof x === "string")
    : [];
  const synonyms = Array.isArray(parsed.synonyms)
    ? parsed.synonyms.filter((x): x is string => typeof x === "string")
    : [];
  const homonyms = Array.isArray(parsed.homonyms)
    ? parsed.homonyms.filter((x): x is string => typeof x === "string")
    : [];

  return {
    kk,
    ru,
    examples,
    interpretations,
    synonyms,
    homonyms,
    ...(raw ? { raw } : {}),
  };
}

export class GeminiService {
  private static async postExplain(
    endpoint: string,
    params: { word: string; definition?: string },
  ): Promise<Response> {
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word: params.word,
        definition: params.definition,
      }),
    });
  }

  private static async explainViaProxy(params: {
    word: string;
    definition?: string;
  }): Promise<GeminiExplainResponse> {
    let response: Response;
    try {
      response = await this.postExplain(GEMINI_PROXY_ENDPOINT, params);
    } catch (_err) {
      response = await this.postExplain(GEMINI_LOCAL_ENDPOINT, params);
    }

    if (response.status === 404) {
      response = await this.postExplain(GEMINI_LOCAL_ENDPOINT, params);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AI request failed: ${response.status}${errorText ? ` - ${errorText}` : ""}`,
      );
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      return { kk: "", ru: "", examples: [] };
    }

    const asRecord = data as Record<string, unknown>;
    if (
      "kk" in asRecord ||
      "ru" in asRecord ||
      "examples" in asRecord ||
      "interpretations" in asRecord ||
      "synonyms" in asRecord ||
      "homonyms" in asRecord
    ) {
      return normalizeParsedResponse(asRecord);
    }

    const raw =
      typeof asRecord.raw === "string"
        ? asRecord.raw
        : JSON.stringify(asRecord);
    const parsed = extractJsonObject(raw);
    if (!parsed) {
      return { kk: "", ru: "", examples: [], raw };
    }

    return normalizeParsedResponse(parsed, raw);
  }

  static async explainWord(params: {
    word: string;
    definition?: string;
  }): Promise<GeminiExplainResponse> {
    return this.explainViaProxy(params);
  }
}
