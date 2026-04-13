import React, { useCallback, useEffect, useState } from "react";
import { Heart, Volume2, ExternalLink } from "lucide-react";
import { WordDefinition } from "../types";
import "./WordCard.css";
import { GeminiExplainResponse, GeminiService } from "../services/gemini";

interface WordCardProps {
  word: WordDefinition;
  onFavorite: (word: string) => void;
  isFavorite: boolean;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  onFavorite,
  isFavorite,
}) => {
  const [aiResult, setAiResult] = useState<GeminiExplainResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const normalizeText = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const uniqueByNormalized = (items: string[]) => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of items) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = normalizeText(trimmed);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }

    return result;
  };

  const handleExplainWithAI = useCallback(async () => {
    try {
      setAiLoading(true);
      setAiError(null);

      const result = await GeminiService.explainWord({
        word: word.word,
        definition: word.definition,
      });

      setAiResult(result);
    } catch (_e) {
      setAiError("AI арқылы түсіндірме алу мүмкін болмады");
    } finally {
      setAiLoading(false);
    }
  }, [word.word, word.definition]);

  useEffect(() => {
    setAiResult(word.aiInsights ?? null);
    setAiError(null);
    if (word.source === "ai" && word.aiInsights) {
      return;
    }
    void handleExplainWithAI();
  }, [handleExplainWithAI, word.aiInsights, word.source]);

  const mergedTranslations = uniqueByNormalized([
    ...(word.translations ?? []),
    aiResult?.ru ?? "",
  ]);
  const mergedExamples = uniqueByNormalized([
    ...(word.examples ?? []),
    ...(aiResult?.examples ?? []),
  ]);
  const interpretations = uniqueByNormalized(aiResult?.interpretations ?? []);
  const synonyms = uniqueByNormalized(aiResult?.synonyms ?? []);
  const homonyms = uniqueByNormalized(aiResult?.homonyms ?? []);
  const aiExtraDefinition =
    aiResult?.kk &&
    normalizeText(aiResult.kk) !== normalizeText(word.definition)
      ? aiResult.kk
      : "";
  const showAiSection =
    aiLoading ||
    Boolean(aiError) ||
    Boolean(aiExtraDefinition) ||
    interpretations.length > 0 ||
    synonyms.length > 0 ||
    homonyms.length > 0 ||
    Boolean(aiResult?.raw);

  const handlePronounce = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "kk-KZ";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="word-card-container">
      <div className="word-card-header">
        <div className="word-title-section">
          <h2 className="word-title">{word.word}</h2>
          <div className="word-actions">
            <button
              onClick={handlePronounce}
              className="word-action-button"
              title="Дыбыстау"
            >
              <Volume2 className="w-5 h-5" />
              <span>Дыбыстау</span>
            </button>

            <button
              onClick={handleExplainWithAI}
              className="word-action-button"
              title="AI арқылы түсіндіру"
              disabled={aiLoading}
            >
              <span>{aiLoading ? "AI..." : "AI"}</span>
            </button>

            <a
              href={`https://kk.wiktionary.org/wiki/${encodeURIComponent(word.word)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="word-action-button"
              title="Wiktionary-де ашу"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Wiktionary</span>
            </a>
          </div>
        </div>

        <button
          onClick={() => onFavorite(word.word)}
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          title={isFavorite ? "Таңдаулылардан алып тастау" : "Таңдаулыларға қосу"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div>
        <div className="word-section">
          <h3 className="word-section-title">
            {word.source === "ai" ? "Анықтама (AI)" : "Анықтама"}
          </h3>
          <p className="word-definition">{word.definition}</p>
        </div>

        {showAiSection && (
          <div className="word-section">
            <h3 className="word-section-title">AI талдауы</h3>
            {aiLoading && (
              <p className="word-definition">AI түсіндірме дайындап жатыр...</p>
            )}
            {aiError && <p className="word-definition">{aiError}</p>}
            {aiResult && (
              <div>
                {aiExtraDefinition && (
                  <p className="word-definition">{aiExtraDefinition}</p>
                )}

                {interpretations.length > 0 && (
                  <div className="word-section">
                    <h3 className="word-section-title">Басқа мағыналар</h3>
                    <div className="examples">
                      {interpretations.map((value, index) => (
                        <div key={index} className="example">
                          <p className="example-text">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {synonyms.length > 0 && (
                  <div className="word-section">
                    <h3 className="word-section-title">Синонимдер</h3>
                    <div className="translations">
                      {synonyms.map((value, index) => (
                        <span key={index} className="translation-badge">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {homonyms.length > 0 && (
                  <div className="word-section">
                    <h3 className="word-section-title">Омонимдер</h3>
                    <div className="translations">
                      {homonyms.map((value, index) => (
                        <span key={index} className="translation-badge">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.raw && <p className="word-definition">{aiResult.raw}</p>}
              </div>
            )}
          </div>
        )}

        {mergedTranslations.length > 0 && (
          <div className="word-section">
            <h3 className="word-section-title">Аудармалар</h3>
            <div className="translations">
              {mergedTranslations.map((translation, index) => (
                <span key={index} className="translation-badge">
                  {translation}
                </span>
              ))}
            </div>
          </div>
        )}

        {mergedExamples.length > 0 && (
          <div className="word-section">
            <h3 className="word-section-title">Мысалдар</h3>
            <div className="examples">
              {mergedExamples.map((example, index) => (
                <div key={index} className="example">
                  <p className="example-text">{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCard;
