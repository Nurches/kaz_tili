import React from "react";
import { Heart, Trash2 } from "lucide-react";
import "./WordList.css";

interface WordListProps {
  words: string[];
  title: string;
  icon: React.ReactNode;
  onWordClick: (word: string) => void;
  onFavorite?: (word: string) => void;
  onRemove?: (word: string) => void;
  favorites?: string[];
}

const WordList: React.FC<WordListProps> = ({
  words,
  title,
  icon,
  onWordClick,
  onFavorite,
  onRemove,
  favorites = [],
}) => {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-text">Әлі ешбір сөз жоқ</p>
      </div>
    );
  }

  return (
    <div className="word-list-container">
      <h2 className="word-list-header">
        {icon}
        <span>{title}</span>
        <span className="word-list-count">({words.length})</span>
      </h2>

      <div className="word-list-items">
        {words.map((word, index) => (
          <div key={index} className="word-list-item">
            <div className="word-list-item-content">
              <button
                onClick={() => onWordClick(word)}
                className="word-list-item-text"
              >
                {word}
              </button>

              <div className="word-list-item-actions">
                {onFavorite && (
                  <button
                    onClick={() => onFavorite(word)}
                    className={`favorite-button ${favorites.includes(word) ? "active" : ""}`}
                    title={
                      favorites.includes(word)
                        ? "Таңдаулылардан алу"
                        : "Таңдаулыларға қосу"
                    }
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.includes(word) ? "fill-current" : ""}`}
                    />
                  </button>
                )}

                {onRemove && (
                  <button
                    onClick={() => onRemove(word)}
                    className="favorite-button"
                    title="Жою"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordList;
