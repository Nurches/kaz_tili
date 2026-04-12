import React from "react";
import { Search, BookOpen, Heart, History } from "lucide-react";

interface HeaderProps {
  onSearchClick: () => void;
  onHistoryClick: () => void;
  onFavoritesClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onHistoryClick,
  onFavoritesClick,
}) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="header-title">
          <BookOpen className="w-8 h-8" />
          <h1>Сөзім</h1>
        </div>

        <nav className="header-nav">
          <button onClick={onSearchClick} className="header-button">
            <Search className="w-5 h-5" />
            <span>Іздеу</span>
          </button>

          <button onClick={onHistoryClick} className="header-button">
            <History className="w-5 h-5" />
            <span>Тарих</span>
          </button>

          <button onClick={onFavoritesClick} className="header-button">
            <Heart className="w-5 h-5" />
            <span>Таңдаулылар</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
