import React from "react";
import { Heart, Volume2, ExternalLink } from "lucide-react";
import { WordDefinition } from "../types";
import "./WordCard.css";

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
              title="Айту"
            >
              <Volume2 className="w-5 h-5" />
              <span>Айту</span>
            </button>

            <a
              href={`https://kk.wiktionary.org/wiki/${encodeURIComponent(word.word)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="word-action-button"
              title="Wiktionary-да ашу"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Wiktionary</span>
            </a>
          </div>
        </div>

        <button
          onClick={() => onFavorite(word.word)}
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          title={isFavorite ? "Таңдаулылардан алу" : "Таңдаулыларға қосу"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div>
        <div className="word-section">
          <h3 className="word-section-title">Анықтама</h3>
          <p className="word-definition">{word.definition}</p>
        </div>

        {word.translations && word.translations.length > 0 && (
          <div className="word-section">
            <h3 className="word-section-title">Аудармалары</h3>
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
            <h3 className="word-section-title">Мысалдар</h3>
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
