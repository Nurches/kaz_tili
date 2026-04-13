const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const PORT = process.env.GEMINI_SERVER_PORT
  ? Number(process.env.GEMINI_SERVER_PORT)
  : 5001;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "Missing GEMINI_API_KEY. Add it to .env.local (recommended) or .env.",
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

app.post("/api/gemini/explain", async (req, res) => {
  try {
    if (!genAI) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY is not configured" });
    }

    const word = String(req.body?.word || "").trim();
    const sourceDefinition = String(req.body?.definition || "").trim();

    if (!word) {
      return res.status(400).json({ error: "word is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt =
      "You are a bilingual Kazakh/Russian dictionary assistant. " +
      "Explain the given Kazakh word in simple language. " +
      "Return ONLY valid JSON with this exact schema: " +
      '{"kk":string,"ru":string,"examples":string[]} . ' +
      "Rules: examples must be 2-3 short Kazakh sentences using the word naturally. " +
      "No markdown. No extra keys.\n\n" +
      `Word: ${word}\n` +
      (sourceDefinition
        ? `Wiktionary definition (may be noisy): ${sourceDefinition}\n`
        : "");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const text = result.response.text();

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

    return res.json({ kk, ru, examples });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini server listening on http://localhost:${PORT}`);
});
