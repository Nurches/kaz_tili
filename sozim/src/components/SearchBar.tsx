import React, { useState } from "react";
import { Search } from "lucide-react";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (word: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Қазақ сөзін енгізіңіз..."
          className="search-input"
          disabled={isLoading}
        />
        <Search className="search-icon" />
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="search-button"
        >
          {isLoading ? "Іздеу..." : "Іздеу"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
