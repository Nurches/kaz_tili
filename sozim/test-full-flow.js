// Test the complete flow from API to final result
// Import the compiled API service
const fs = require("fs");
const path = require("path");

// Read the compiled JavaScript version
const apiPath = path.join(__dirname, "src", "services", "api.js");
const apiCode = fs.readFileSync(apiPath, "utf8");

// Execute the API service code
eval(apiCode);

async function testFullFlow() {
  console.log("=== TESTING FULL FLOW ===");

  try {
    const result = await WiktionaryService.searchWord("адам");
    console.log("API Result:", JSON.stringify(result, null, 2));

    if (result) {
      console.log("✅ Success:");
      console.log("Word:", result.word);
      console.log("Definition:", result.definition);
      console.log("Definition length:", result.definition.length);
      console.log("Translations:", result.translations);
      console.log("Examples:", result.examples);
    } else {
      console.log("❌ Failed: No result returned");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testFullFlow();
