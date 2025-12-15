import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conversion factors
const conversions = {
  literToGallon: (l) => (l / 3.785411784).toFixed(2),
  mlToFlOz: (ml) => (ml / 29.5735296).toFixed(2),
  kgToLb: (kg) => (kg * 2.20462262).toFixed(2),
  gToOz: (g) => (g / 28.3495231).toFixed(2),
};

function convertRate(rate, unit) {
  const numericRate = parseFloat(rate);

  switch (unit) {
    case "L":
      return { rate: conversions.literToGallon(numericRate), unit: "gal" };
    case "mL":
      return { rate: conversions.mlToFlOz(numericRate), unit: "fl oz" };
    case "kg":
      return { rate: conversions.kgToLb(numericRate), unit: "lb" };
    case "g":
      return { rate: conversions.gToOz(numericRate), unit: "oz" };
    default:
      return { rate, unit };
  }
}

function convertSprayData(caData) {
  const usData = {};

  for (const crop in caData) {
    usData[crop] = {};

    for (const issue in caData[crop]) {
      usData[crop][issue] = caData[crop][issue].map((spray) => {
        const converted = convertRate(spray.rate, spray.unit);

        return {
          ...spray,
          rate: converted.rate,
          unit: converted.unit,
        };
      });
    }
  }

  return usData;
}

// Main execution
try {
  // Read Canadian data from the SAME folder
  const caDataPath = path.join(__dirname, "sprayDataCA.json");
  const caData = JSON.parse(fs.readFileSync(caDataPath, "utf8"));

  console.log("✅ Successfully read sprayDataCA.json");

  // Convert to US units
  const usData = convertSprayData(caData);

  // Write US data to the SAME folder
  const usDataPath = path.join(__dirname, "sprayDataUS.json");
  fs.writeFileSync(usDataPath, JSON.stringify(usData, null, 2));

  console.log("✅ Successfully created sprayDataUS.json");
  console.log("📊 Converted data for", Object.keys(usData).length, "crops");
  console.log(
    "⚠️  IMPORTANT: Review the converted rates and update PHI/PCP values for US regulations"
  );
} catch (error) {
  console.error("❌ Error converting data:", error.message);
}
