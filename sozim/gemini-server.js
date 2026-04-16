const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const PORT = process.env.AI_SERVER_PORT
  ? Number(process.env.AI_SERVER_PORT)
  : process.env.GEMINI_SERVER_PORT
    ? Number(process.env.GEMINI_SERVER_PORT)
  : 5001;

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_MAX_TOKENS = 100;
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:3001";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "Sozim";

if (!openRouterApiKey) {
  console.error(
    "Missing OPENROUTER_API_KEY. Add it to .env.local or .env.",
  );
}

const app = express();
app.use(cors());

app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        console.error("Invalid JSON received:", buf.toString());
        throw e;
      }
    },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

function extractJsonObject(rawText) {
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

async function explainViaOpenRouter(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterApiKey}`,
      "HTTP-Referer": OPENROUTER_SITE_URL,
      "X-Title": OPENROUTER_APP_NAME,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: OPENROUTER_MAX_TOKENS,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(
      `OpenRouter request failed: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`,
    );
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "");
}

async function handleExplain(req, res) {
  try {
    if (!openRouterApiKey) {
      return res
        .status(500)
        .json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    const word = String(req.body?.word || "").trim();
    const sourceDefinition = String(req.body?.definition || "").trim();

    if (!word) {
      return res.status(400).json({ error: "word is required" });
    }

    const prompt = buildPrompt(word, sourceDefinition);
    const text = await explainViaOpenRouter(prompt);

    const parsed = extractJsonObject(text);
    if (!parsed || typeof parsed !== "object") {
      return res.json({
        kk: "",
        ru: "",
        examples: [],
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
    const status =
      Number(error?.status) ||
      Number(error?.response?.status) ||
      Number(error?.cause?.status) ||
      500;
    const details =
      error?.message ||
      error?.response?.data?.error?.message ||
      error?.cause?.message ||
      "AI request failed";

    console.error("AI error:", {
      status,
      message: details,
      raw: error,
    });

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: "AI request failed",
      details,
      status,
    });
  }
}

app.post("/api/ai/explain", handleExplain);
app.post("/api/gemini/explain", handleExplain);
app.post("/ai/explain", handleExplain);

app.listen(PORT, () => {
  console.log(`AI server listening on http://localhost:${PORT}`);
});
