const WIKTIONARY_API_URL = "https://kk.wiktionary.org/w/api.php";

async function testApi(word) {
  try {
    const encodedWord = encodeURIComponent(word);
    const url = `${WIKTIONARY_API_URL}?action=query&titles=${encodedWord}&prop=extracts&format=json&explaintext=1&origin=*`;
    
    console.log("Testing URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    console.log("Page ID:", pageId);
    console.log("Page exists:", pageId !== "-1");
    console.log("Has extract:", !!pages[pageId].extract);
    
    if (pages[pageId].extract) {
      console.log("Extract:");
      console.log(JSON.stringify(pages[pageId].extract, null, 2));
      
      // Check what patterns we're looking for
      const extract = pages[pageId].extract;
      console.log("Contains 'Анықтамасы:'", extract.includes("Анықтамасы:"));
      console.log("Contains 'Анықтамасы:'", extract.includes("Анықтамасы:"));
      
      const lines = extract.split("\n");
      console.log("Lines:", lines);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`Line ${i}: "${line}"`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Test with адам
testApi("адам");
