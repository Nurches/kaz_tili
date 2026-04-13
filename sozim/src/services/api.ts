import { WiktionaryResponse, WordDefinition } from "../types";

const WIKTIONARY_API_URL = "https://kk.wiktionary.org/w/api.php";

export class WiktionaryService {
  static async searchWord(word: string): Promise<WordDefinition | null> {
    try {
      // Try both original case and lowercase version
      const searchTerms = [
        word,
        word.toLowerCase(),
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      ];

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
      const trimmedLine = line.trim();

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

      // Check for definition markers
      if (
        currentSection === "definition" &&
        (line.includes("Анықтамасы:") ||
          line.includes("Анықтама:") ||
          line.includes("Анықтамасы") ||
          line.includes("Анықтама"))
      ) {
        // Start collecting definition after the marker
        definition = trimmedLine
          .replace(/Анықтамасы\s*:\s*/i, "")
          .replace(/Анықтама\s*:\s*/i, "")
          .trim();
      } else if (
        currentSection === "definition" &&
        !definition &&
        trimmedLine &&
        /^\d+\.|^#|^\*/.test(trimmedLine)
      ) {
        definition = trimmedLine
          .replace(/^\d+\.\s*/, "")
          .replace(/^([#*])\s*/, "")
          .trim();
      } else if (
        currentSection === "definition" &&
        definition &&
        trimmedLine &&
        !trimmedLine.startsWith("===") &&
        !line.includes("Аудармалары:") &&
        !line.includes("Анықтамасы:") &&
        !line.includes("Анықтама:")
      ) {
        // Continue adding to definition
        definition += " " + trimmedLine;
      } else if (
        currentSection === "translations" &&
        trimmedLine &&
        !line.includes("Аудармалары:")
      ) {
        const match = trimmedLine.match(/^([^:]+):\s*(.+)$/);
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
        examples.push(trimmedLine);
      }
    }

    const result = {
      word,
      definition: definition || "Анықтама табылмады",
      translations,
      examples,
      source: "wiktionary" as const,
    };

    console.log("Final parsed result:", result);
    return result;
  }
}
