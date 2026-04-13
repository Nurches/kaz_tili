export interface WiktionaryResponse {
  batchcomplete: string;
  query: {
    pages: {
      [key: string]: {
        pageid: number;
        ns: number;
        title: string;
        extract?: string;
      };
    };
  };
}

export interface AIWordInsights {
  kk: string;
  ru: string;
  examples: string[];
  interpretations?: string[];
  synonyms?: string[];
  homonyms?: string[];
  raw?: string;
}

export interface WordDefinition {
  word: string;
  definition: string;
  translations?: string[];
  examples?: string[];
  pronunciation?: string;
  source?: "wiktionary" | "ai";
  aiInsights?: AIWordInsights;
}

export interface SearchResult {
  word: string;
  preview: string;
}
