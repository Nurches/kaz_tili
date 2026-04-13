// Test the parsing logic directly
const extract = "\n== Қазақша ==\n\n\n=== Зат есім ===\n\nАнықтамасы:\nАраб тілінен, آدم  - ойлау және сөйлеу қабілеті зор, еңбек құралдарын жасап, оларды өз игілік қажетіне жарата білетін қоғамның саналы мүшесі.\nАудармалары:\nАғылшынша: man\nОрысша: человек\nПалише: manussa\nТүрікше: adam (tr)";

const lines = extract.split("\n").filter((line) => line.trim());

let definition = "";
let currentSection = "";

for (const line of lines) {
  console.log(`Processing: "${line}" | Section: ${currentSection}`);
  
  if (
    line.includes("=== Зат есім ===") ||
    line.includes("=== Сын есім ===") ||
    line.includes("=== Етістік ===") ||
    line.includes("=== Үстеу ===")
  ) {
    currentSection = "definition";
    console.log("Switched to definition section");
    continue;
  }

  if (line.includes("Аудармалары:")) {
    currentSection = "translations";
    console.log("Switched to translations section");
    continue;
  }

  if (line.includes("Мысалдар:") || line.includes("Мысалы:")) {
    currentSection = "examples";
    console.log("Switched to examples section");
    continue;
  }

  // Fixed: Look for both "Анықтамасы:" and "Анықтамасы:"
  if (currentSection === "definition" && (line.includes("Анықтамасы:") || line.includes("Анықтамасы:"))) {
    definition = line.replace(/Анықтамасы:\s*/, "").trim();
    console.log(`Found definition: "${definition}"`);
  } else if (
    currentSection === "definition" &&
    definition &&
    line.trim() &&
    !line.includes("Аудармалары:")
  ) {
    definition += " " + line.trim();
    console.log(`Added to definition: "${definition}"`);
  }
}

console.log("Final result:");
console.log("Definition:", definition);
