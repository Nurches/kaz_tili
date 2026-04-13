// Show exactly how parsing works step by step
const extract = "\n== Қазақша ==\n\n\n=== Зат есім ===\n\nАнықтамасы:\nАраб тілінен, آدم  - ойлау және сөйлеу қабілеті зор, еңбек құралдарын жасап, оларды өз игілік қажетіне жарата білетін қоғамның саналы мүшесі.\nАудармалары:\nАғылшынша: man\nОрысша: человек\nПалише: manussa\nТүрікше: adam (tr)";

console.log("=== PARSING DEMONSTRATION ===");
console.log("Extract:", JSON.stringify(extract, null, 2));

const lines = extract.split("\n").filter((line) => line.trim());
console.log("Filtered lines:", lines);

let definition = "";
let currentSection = "";

for (const line of lines) {
  console.log(`\n--- Processing line: "${line}"`);
  console.log(`Current section: "${currentSection}"`);
  
  if (
    line.includes("=== Зат есім ===") ||
    line.includes("=== Сын есім ===") ||
    line.includes("=== Етістік ===") ||
    line.includes("=== Үстеу ===")
  ) {
    currentSection = "definition";
    console.log("✓ Switched to definition section");
    continue;
  }

  if (line.includes("Аудармалары:")) {
    currentSection = "translations";
    console.log("✓ Switched to translations section");
    continue;
  }

  if (line.includes("Мысалдар:") || line.includes("Мысалы:")) {
    currentSection = "examples";
    console.log("✓ Switched to examples section");
    continue;
  }

  // Check for definition markers
  if (currentSection === "definition" && (line.includes("Анықтамасы:") || line.includes("Анықтамасы:"))) {
    definition = line.replace(/Анықтамасы:\s*/, "").trim();
    console.log(`✓ Found definition marker, extracted: "${definition}"`);
  } else if (
    currentSection === "definition" &&
    definition &&
    line.trim() &&
    !line.includes("Аудармалары:") &&
    !line.includes("Анықтамасы:") &&
    !line.includes("Анықтамасы:")
  ) {
    definition += " " + line.trim();
    console.log(`✓ Added to definition: "${definition}"`);
  }
}

console.log("\n=== FINAL RESULT ===");
console.log("Definition:", JSON.stringify(definition, null, 2));
console.log("Length:", definition.length);
