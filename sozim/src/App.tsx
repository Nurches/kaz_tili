import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WordCard from "./components/WordCard";
import WordList from "./components/WordList";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./components/HomePage";
import { WiktionaryService } from "./services/api";
import { GeminiService } from "./services/gemini";
import { WordDefinition } from "./types";
import { Heart, Clock } from "lucide-react";

type View = "home" | "search" | "history" | "favorites";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("home");
  const [currentWord, setCurrentWord] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("sozim-history");
    const savedFavorites = localStorage.getItem("sozim-favorites");

    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sozim-history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem("sozim-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (word: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await WiktionaryService.searchWord(word);

      if (result) {
        setCurrentWord(result);
        setCurrentView("search");

        if (!searchHistory.includes(word)) {
          setSearchHistory((prev) => [word, ...prev.slice(0, 19)]);
        }
      } else {
        const aiFallback = await GeminiService.explainWord({ word });
        const hasAiContent =
          Boolean(aiFallback.kk.trim()) ||
          Boolean(aiFallback.ru.trim()) ||
          aiFallback.examples.length > 0;

        if (hasAiContent) {
          const aiWord: WordDefinition = {
            word,
            definition:
              aiFallback.kk.trim() ||
              "Wiktionary-ден табылмады. AI арқылы жасалған қысқаша түсіндірме.",
            translations: aiFallback.ru.trim() ? [aiFallback.ru.trim()] : [],
            examples: aiFallback.examples,
            source: "ai",
            aiInsights: aiFallback,
          };

          setCurrentWord(aiWord);
          setCurrentView("search");

          if (!searchHistory.includes(word)) {
            setSearchHistory((prev) => [word, ...prev.slice(0, 19)]);
          }
        } else {
          setError("«" + word + "» сөзі табылмады");
        }
      }
    } catch (err) {
      setError("Сөзді іздеу кезінде қате орын алды");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = (word: string) => {
    setFavorites((prev) => {
      if (prev.includes(word)) {
        return prev.filter((w) => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  const handleRemoveFromHistory = (word: string) => {
    setSearchHistory((prev) => prev.filter((w) => w !== word));
  };

  const handleRemoveFromFavorites = (word: string) => {
    setFavorites((prev) => prev.filter((w) => w !== word));
  };

  return (
    <div className="app">
      <Header
        onHomeClick={() => setCurrentView("home")}
        onSearchClick={() => setCurrentView("search")}
        onHistoryClick={() => setCurrentView("history")}
        onFavoritesClick={() => setCurrentView("favorites")}
      />

      <main className="container main-content">
        {currentView === "home" && (
          <HomePage onStartLearning={() => setCurrentView("search")} />
        )}

        {currentView === "search" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="page-title">Қазақ сөздерінің сөздігі</h1>
              <p className="page-subtitle">
                Күрделі қазақ сөздерінің мәнін табыңыз
              </p>

              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLoading && <LoadingSpinner />}

            {currentWord && !isLoading && (
              <div className="word-card">
                <WordCard
                  word={currentWord}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(currentWord.word)}
                />
              </div>
            )}

          </div>
        )}

        {currentView === "history" && (
          <div className="word-list">
            <WordList
              words={searchHistory}
              title="Іздеу тарихы"
              icon={<Clock className="w-6 h-6" style={{ color: "#9ca3af" }} />}
              onWordClick={handleSearch}
              onFavorite={handleFavorite}
              onRemove={handleRemoveFromHistory}
              favorites={favorites}
            />
          </div>
        )}

        {currentView === "favorites" && (
          <div className="word-list">
            <WordList
              words={favorites}
              title="Таңдаулылар"
              icon={<Heart className="w-6 h-6" style={{ color: "#9ca3af" }} />}
              onWordClick={handleSearch}
              onFavorite={handleFavorite}
              onRemove={handleRemoveFromFavorites}
              favorites={favorites}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
