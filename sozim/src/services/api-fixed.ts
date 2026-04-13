import { WiktionaryResponse, WordDefinition } from "../types";

const WIKTIONARY_API_URL = "https://kk.wiktionary.org/w/api.php";

export class WiktionaryService {
  static async searchWord(word: string): Promise<WordDefinition | null> {
    try {
      // Try both original case and lowercase version
      const searchTerms = [word, word.toLowerCase(), word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()];
      
      for (const searchTerm of searchTerms) {
        const encodedWord = encodeURIComponent(searchTerm);
        const url = `${WIKTIONARY_API_URL}?action=query&titles=${encodedWord}&prop=extracts&format=json&explaintext=1&origin=*`;

        const response = await fetch(url);
        const data: WiktionaryResponse = await response.json();

        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== "-1" && pages[pageId].extract) {
          const page = pages[pageId];
          return this.parseWordDefinition(page.title, page.extract || "");
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching word definition:", error);
      return null;
    }
  }

  private static parseWordDefinition(
    word: string,
    extract: string,
  ): WordDefinition {
    const lines = extract.split("\n").filter((line) => line.trim());

    let definition = "";
    const translations: string[] = [];
    const examples: string[] = [];

    let currentSection = "";

    for (const line of lines) {
      if (
        line.includes("=== Зат есім ===") ||
        line.includes("=== Сын есім ===") ||
        line.includes("=== Етістік ===") ||
        line.includes("=== Үстеу ===")
      ) {
        currentSection = "definition";
        continue;
      }

      if (line.includes("Аудармалары:")) {
        currentSection = "translations";
        continue;
      }

      if (line.includes("Мысалдар:") || line.includes("Мысалы:")) {
        currentSection = "examples";
        continue;
      }

      // Fixed: Look for both "Анықтамасы:" and "Анықтамасы:"
      if (currentSection === "definition" && (line.includes("Анықтамасы:") || line.includes("Анықтамасы:"))) {
        definition = line.replace(/Анықтамасы:\s*/, "").trim();
      } else if (
        currentSection === "definition" &&
        definition &&
        line.trim() &&
        !line.includes("Аудармалары:")
      ) {
        definition += " " + line.trim();
      } else if (
        currentSection === "translations" &&
        line.trim() &&
        !line.includes("Аудармалары:")
      ) {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const [, language, translation] = match;
          if (
            ![
              "Ағылшынша",
              "Орысша",
              "Полякша",
              "Немісше",
              "Французша",
              "Қазақша",
            ].includes(language)
          ) {
            translations.push(translation.trim());
          }
        }
      } else if (currentSection === "examples" && line.trim()) {
        examples.push(line.trim());
      }
    }

    return {
      word,
      definition: definition || "Анықтама табылмады",
      translations,
      examples,
    };
  }
}
