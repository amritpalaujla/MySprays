// One-time: move the shared spray description into ca.description and
// fill us.description from sprayDataUS.json (US units).
// Usage: node scripts/backfillRegionDescriptions.js [--dry-run]
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Crop = require("../models/Crop");
const Issue = require("../models/Issue");
const Spray = require("../models/Spray");

const dryRun = process.argv.includes("--dry-run");

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB${dryRun ? " (dry run)" : ""}`);

  const usData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../vite-project/src/assets/sprayDataUS.json"),
      "utf8",
    ),
  );

  let updated = 0;
  let usFromJson = 0;
  let skipped = 0;

  for (const crop of await Crop.find().lean()) {
    for (const issue of await Issue.find({ cropId: crop._id }).lean()) {
      const usSprays = usData[crop.name]?.[issue.name] || [];
      const sprays = await Spray.find({ issueId: issue._id })
        .sort({ _id: 1 })
        .lean();

      for (let i = 0; i < sprays.length; i++) {
        const spray = sprays[i];

        // Already migrated
        if (spray.ca?.description !== undefined && spray.us?.description !== undefined) {
          skipped++;
          continue;
        }

        const shared = spray.description || "";
        // Match by position first (migration order), then by name
        const usMatch =
          usSprays[i]?.name === spray.name
            ? usSprays[i]
            : usSprays.find((s) => s.name === spray.name);
        const usDescription = usMatch ? usMatch.description || "" : shared;
        if (usMatch) usFromJson++;

        if (usDescription !== shared) {
          console.log(`  ${crop.name} / ${issue.name} / ${spray.name}`);
          console.log(`     CA: ${shared}`);
          console.log(`     US: ${usDescription}`);
        }

        if (!dryRun) {
          await Spray.updateOne(
            { _id: spray._id },
            {
              $set: {
                "ca.description": shared,
                "us.description": usDescription,
              },
              $unset: { description: "" },
            },
          );
        }
        updated++;
      }
    }
  }

  console.log(`\n${dryRun ? "Would update" : "Updated"}: ${updated} sprays`);
  console.log(`   US description from JSON: ${usFromJson}`);
  console.log(`   Copied shared description to US: ${updated - usFromJson}`);
  console.log(`   Already migrated, skipped: ${skipped}`);

  await mongoose.disconnect();
}

backfill().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
