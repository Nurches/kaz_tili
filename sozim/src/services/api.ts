import { WiktionaryResponse, WordDefinition } from "../types";

const WIKTIONARY_API_URL = "https://kk.wiktionary.org/w/api.php";

export class WiktionaryService {
  static async searchWord(word: string): Promise<WordDefinition | null> {
    try {
      const encodedWord = encodeURIComponent(word);
      const url = `${WIKTIONARY_API_URL}?action=query&titles=${encodedWord}&prop=extracts&format=json&explaintext=1&origin=*`;

      const response = await fetch(url);
      const data: WiktionaryResponse = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === "-1" || !pages[pageId].extract) {
        return null;
      }

      const page = pages[pageId];
      return this.parseWordDefinition(page.title, page.extract || "");
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

      if (currentSection === "definition" && line.includes("Анықтамасы:")) {
        definition = line.replace("Анықтамасы:", "").trim();
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
        // Extract language and translation
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const [, language, translation] = match;
          // Only include foreign translations, not Kazakh variants
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
