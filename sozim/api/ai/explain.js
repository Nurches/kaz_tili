function extractJsonObject(rawText) {
  if (!rawText) return null;

  const direct = String(rawText).trim();
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

function buildPrompt(word, sourceDefinition = "") {
  return (
    "You are a bilingual Kazakh/Russian dictionary assistant. " +
    "Analyze the given Kazakh word and consider multiple possible meanings, including proper name/person-name usage if relevant. " +
    "Return ONLY valid JSON with this exact schema: " +
    '{"kk":string,"ru":string,"examples":string[],"interpretations":string[],"synonyms":string[],"homonyms":string[]} . ' +
    "Rules: 'kk' must be a short Kazakh explanation/definition. " +
    "'ru' must be only a Russian translation or close equivalent of the word/meaning. " +
    "examples must be 2-3 short Kazakh sentences using the word naturally. " +
    "'interpretations' should list alternative senses/usages (for example: common noun, proper name, place, etc.) when applicable. " +
    "'synonyms' should include close Kazakh synonyms if known, else empty array. " +
    "'homonyms' should include homonym forms/meanings if known, else empty array. " +
    "No markdown. No extra keys.\n\n" +
    `Word: ${word}\n` +
    (sourceDefinition
      ? `Wiktionary definition (may be noisy): ${sourceDefinition}\n`
      : "")
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const OPENAI_MAX_TOKENS = 100;

    if (!openAiApiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const body =
      typeof req.body === "string" && req.body
        ? JSON.parse(req.body)
        : req.body || {};

    const word = String(body.word || "").trim();
    const sourceDefinition = String(body.definition || "").trim();

    if (!word) {
      return res.status(400).json({ error: "word is required" });
    }

    const prompt = buildPrompt(word, sourceDefinition);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: OPENAI_MAX_TOKENS,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({
        error: "AI request failed",
        details: `OpenAI request failed: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`,
        status: response.status,
      });
    }

    const data = await response.json();
    const text = String(data?.choices?.[0]?.message?.content || "");
    const parsed = extractJsonObject(text);

    if (!parsed || typeof parsed !== "object") {
      return res.json({
        kk: "",
        ru: "",
        examples: [],
        interpretations: [],
        synonyms: [],
        homonyms: [],
        raw: text,
      });
    }

    const kk = typeof parsed.kk === "string" ? parsed.kk : "";
    const ru = typeof parsed.ru === "string" ? parsed.ru : "";
    const examples = Array.isArray(parsed.examples)
      ? parsed.examples.filter((x) => typeof x === "string")
      : [];
    const interpretations = Array.isArray(parsed.interpretations)
      ? parsed.interpretations.filter((x) => typeof x === "string")
      : [];
    const synonyms = Array.isArray(parsed.synonyms)
      ? parsed.synonyms.filter((x) => typeof x === "string")
      : [];
    const homonyms = Array.isArray(parsed.homonyms)
      ? parsed.homonyms.filter((x) => typeof x === "string")
      : [];

    return res.json({ kk, ru, examples, interpretations, synonyms, homonyms });
  } catch (error) {
    return res.status(500).json({
      error: "AI request failed",
      details: error?.message || "Unknown server error",
      status: 500,
    });
  }
};
