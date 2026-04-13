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
      setAiError("Не удалось получить объяснение от AI");
    } finally {
      setAiLoading(false);
    }
  }, [word.word, word.definition]);

  useEffect(() => {
    setAiResult(null);
    setAiError(null);
    void handleExplainWithAI();
  }, [handleExplainWithAI]);

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
              title="Произнести"
            >
              <Volume2 className="w-5 h-5" />
              <span>Произнести</span>
            </button>

            <button
              onClick={handleExplainWithAI}
              className="word-action-button"
              title="Объяснить через AI"
              disabled={aiLoading}
            >
              <span>{aiLoading ? "AI..." : "AI"}</span>
            </button>

            <a
              href={`https://kk.wiktionary.org/wiki/${encodeURIComponent(word.word)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="word-action-button"
              title="Открыть в Wiktionary"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Wiktionary</span>
            </a>
          </div>
        </div>

        <button
          onClick={() => onFavorite(word.word)}
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div>
        <div className="word-section">
          <h3 className="word-section-title">Определение</h3>
          <p className="word-definition">{word.definition}</p>
        </div>

        {(aiLoading || aiError || aiResult) && (
          <div className="word-section">
            <h3 className="word-section-title">Объяснение AI</h3>
            {aiLoading && (
              <p className="word-definition">AI формирует объяснение...</p>
            )}
            {aiError && <p className="word-definition">{aiError}</p>}
            {aiResult && (
              <div>
                {aiResult.kk && <p className="word-definition">{aiResult.kk}</p>}
                {aiResult.ru && <p className="word-definition">{aiResult.ru}</p>}

                {aiResult.examples && aiResult.examples.length > 0 && (
                  <div className="examples">
                    {aiResult.examples.map((example, index) => (
                      <div key={index} className="example">
                        <p className="example-text">{example}</p>
                      </div>
                    ))}
                  </div>
                )}

                {aiResult.raw && <p className="word-definition">{aiResult.raw}</p>}
              </div>
            )}
          </div>
        )}

        {word.translations && word.translations.length > 0 && (
          <div className="word-section">
            <h3 className="word-section-title">Переводы</h3>
            <div className="translations">
              {word.translations.map((translation, index) => (
                <span key={index} className="translation-badge">
                  {translation}
                </span>
              ))}
            </div>
          </div>
        )}

        {word.examples && word.examples.length > 0 && (
          <div className="word-section">
            <h3 className="word-section-title">Примеры</h3>
            <div className="examples">
              {word.examples.map((example, index) => (
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
