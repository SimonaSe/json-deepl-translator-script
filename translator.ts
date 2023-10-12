import { translateService } from "./translate-api";
const fs = require("fs");
const path = require("path");  // Required for manipulating file paths

async function mirrorObject(obj, targetLang) {
  const mirroredObj = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object") {
      mirroredObj[key] = await mirrorObject(value, targetLang);
    } else if (typeof value === "string" && value.trim() !== "") {
      mirroredObj[key] = await translateService.translateText(value, targetLang);
    } else {
      mirroredObj[key] = value;  // Keep the original value if it's not a valid string for translation
    }
  }

  return mirroredObj;
}

async function mirrorJsonFileWithTranslation(inputFilename, outputFilename, targetLang) {
  try {
    // Read the JSON file
    const fileData = fs.readFileSync(inputFilename);
    const jsonData = JSON.parse(fileData);

    // Create a mirrored object structure
    const mirroredData = await mirrorObject(jsonData, targetLang);

    // Ensure the output directory exists
    const outputDir = path.dirname(outputFilename);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the mirrored data to a new file
    fs.writeFileSync(outputFilename, JSON.stringify(mirroredData, null, 2));

    console.log(`Mirroring for ${targetLang} complete!`);
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error);
  }
}

(async () => {
  const inputFileName = "/Users/simonasekerova/github/database-translations/json-deepl-translator-script/trainingland-analysis_en.json";
  const targetLangs = ["fr", "es"];

  for (const targetLang of targetLangs) {
    const outputFileName = path.join(path.dirname(inputFileName), `trainingland-analysis_${targetLang}.json`);
    await mirrorJsonFileWithTranslation(inputFileName, outputFileName, targetLang);
  }
})();
