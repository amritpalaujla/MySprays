// Import your issue images here
import blankImage from "./blank.jpg";
import cherryFruitFly from "../assets/cherryFruitFly.jpg";
import cherryBrownRot from "../assets/cherryBrownRot.jpg";

import peachLeafCurl from "../assets/peachLeafCurl.jpg";

// TODO: Replace with actual crop-specific issue images
// Example structure:
// import cherriesAphids from "./cherries-aphids.jpg";
// import applesAphids from "./apples-aphids.jpg";
// import cherriesPowderyMildew from "./cherries-powdery-mildew.jpg";

// Crop-specific issue images
// Format: "CropName-IssueName"
export const issuesList = {
  // Cherries
  "Cherries-Fruit Flies": { name: "Fruit Flies", image: cherryFruitFly },
  "Cherries-Powdery Mildew": { name: "Powdery Mildew", image: blankImage },
  "Cherries-Brown Rot": { name: "Brown Rot", image: cherryBrownRot },
  "Cherries-Western Cherry Fruit Fly": {
    name: "Western Cherry Fruit Fly",
    image: blankImage,
  },
  "Cherries-Bacterial Canker": { name: "Bacterial Canker", image: blankImage },
  "Cherries-Cherry Leaf Spot": { name: "Cherry Leaf Spot", image: blankImage },

  // Apples
  "Apples-Aphids": { name: "Aphids", image: blankImage },
  "Apples-Powdery Mildew": { name: "Powdery Mildew", image: blankImage },
  "Apples-Codling Moth": { name: "Codling Moth", image: blankImage },
  "Apples-Apple Scab": { name: "Apple Scab", image: blankImage },
  "Apples-Fire Blight": { name: "Fire Blight", image: blankImage },

  // Grapes
  "Grapes-Aphids": { name: "Aphids", image: blankImage },
  "Grapes-Powdery Mildew": { name: "Powdery Mildew", image: blankImage },
  "Grapes-Downy Mildew": { name: "Downy Mildew", image: blankImage },
  "Grapes-Botrytis": { name: "Botrytis", image: blankImage },
  "Grapes-Spider Mites": { name: "Spider Mites", image: blankImage },

  // Peaches
  "Peaches-Aphids": { name: "Aphids", image: blankImage },
  "Peaches-Brown Rot": { name: "Brown Rot", image: blankImage },
  "Peaches-Leaf Curl": { name: "Leaf Curl", image: peachLeafCurl },
  "Peaches-Spider Mites": { name: "Spider Mites", image: blankImage },

  // Apricots
  "Apricots-Aphids": { name: "Aphids", image: blankImage },
  "Apricots-Brown Rot": { name: "Brown Rot", image: blankImage },
  "Apricots-Bacterial Canker": { name: "Bacterial Canker", image: blankImage },

  // Plums
  "Plums-Aphids": { name: "Aphids", image: blankImage },
  "Plums-Brown Rot": { name: "Brown Rot", image: blankImage },
  "Plums-Bacterial Canker": { name: "Bacterial Canker", image: blankImage },

  // Nectarines
  "Nectarines-Aphids": { name: "Aphids", image: blankImage },
  "Nectarines-Brown Rot": { name: "Brown Rot", image: blankImage },
  "Nectarines-Spider Mites": { name: "Spider Mites", image: blankImage },

  // Add more crop-issue combinations as needed...
};

// Helper function to get crop-specific issue image
// Takes crop name and issue name, returns the appropriate image
export const getIssueImage = (cropName, issueName) => {
  const key = `${cropName}-${issueName}`;
  return issuesList[key]?.image || blankImage;
};
