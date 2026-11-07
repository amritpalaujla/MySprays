require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Crop = require("../models/Crop");
const Issue = require("../models/Issue");
const Spray = require("../models/Spray");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existingCrops = await Crop.countDocuments();
  if (existingCrops > 0 && !process.argv.includes("--force")) {
    console.log(
      `❌ Database already has ${existingCrops} crop(s). Run with --force to wipe and re-migrate.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (process.argv.includes("--force")) {
    console.log("⚠️  --force: wiping existing catalog data (spraycatalog, issues, crops)...");
    await Spray.deleteMany({});   // hits spraycatalog collection only
    await Issue.deleteMany({});
    await Crop.deleteMany({});
    console.log("✅ Cleared");
  }

  const caData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../vite-project/src/assets/sprayDataCA.json"),
      "utf8"
    )
  );
  const usData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../vite-project/src/assets/sprayDataUS.json"),
      "utf8"
    )
  );

  let cropCount = 0;
  let issueCount = 0;
  let sprayCount = 0;

  for (const cropName of Object.keys(caData)) {
    const crop = await Crop.create({ name: cropName });
    cropCount++;
    console.log(`\n🌱 Crop: ${cropName}`);

    for (const issueName of Object.keys(caData[cropName])) {
      const issue = await Issue.create({ name: issueName, cropId: crop._id });
      issueCount++;

      const caSprays = caData[cropName][issueName];
      const usSprays = usData[cropName][issueName];

      for (let i = 0; i < caSprays.length; i++) {
        const ca = caSprays[i];
        const us = usSprays[i];

        await Spray.create({
          name: ca.name,
          issueId: issue._id,
          phi: ca.phi,
          pcp: ca.pcp,
          stage: ca.stage,
          ca: {
            rate: String(ca.rate),
            unit: ca.unit,
            description: ca.description || "",
          },
          us: {
            rate: String(us.rate),
            unit: us.unit,
            description: us.description || "",
          },
        });
        sprayCount++;
      }

      console.log(`   ✅ ${issueName} — ${caSprays.length} sprays`);
    }
  }

  console.log("\n🎉 Migration complete!");
  console.log(`   Crops:  ${cropCount}`);
  console.log(`   Issues: ${issueCount}`);
  console.log(`   Sprays: ${sprayCount}`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
