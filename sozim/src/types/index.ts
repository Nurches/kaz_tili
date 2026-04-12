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

export interface WordDefinition {
  word: string;
  definition: string;
  translations?: string[];
  examples?: string[];
  pronunciation?: string;
}

export interface SearchResult {
  word: string;
  preview: string;
}
