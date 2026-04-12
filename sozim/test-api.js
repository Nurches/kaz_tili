// Test API directly
const WIKTIONARY_API_URL = "https://kk.wiktionary.org/w/api.php";

async function testApi(word) {
  try {
    const encodedWord = encodeURIComponent(word);
    const url = `${WIKTIONARY_API_URL}?action=query&titles=${encodedWord}&prop=extracts&format=json&explaintext=1&origin=*`;
    
    console.log("Testing URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("API Response:", JSON.stringify(data, null, 2));
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    console.log("Page ID:", pageId);
    console.log("Page exists:", pageId !== "-1");
    console.log("Has extract:", !!pages[pageId].extract);
    
    if (pages[pageId].extract) {
      console.log("Extract:", pages[pageId].extract);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Test with different words
testApi("кітап");
testApi("kitap"); 
testApi("адам");
testApi("үй");
