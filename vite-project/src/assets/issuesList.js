// Import your issue images here
import blankImage from "./blank.jpg";
import cherryFruitFly from "../assets/cherryFruitFly.jpg";
import cherryBrownRot from "../assets/cherryBrownRot.jpg";
import cherryBacterialCanker from "../assets/cherrybacterialcanker.jpg";
import peachLeafCurl from "../assets/peachLeafCurl.jpg";
import cherrySanJoseScale from "../assets/issueImages/cherrySanJoseScale.PNG";
import cherryFruitFly2 from "../assets/issueImages/cherryFruitFly2.PNG";
import cherryBrownRot2 from "../assets/issueImages/cherryBrownRot2.PNG";
import cherryAphids from "../assets/issueImages/cherryAphids.PNG";
import Weeds from "../assets/issueImages/weeds.PNG";
import cherryMildew from "../assets/issueImages/cherryMildew.PNG";
import cherryMildew2 from "../assets/issueImages/cherryMildew2.PNG";
import grapesMildew from "../assets/issueImages/grapesMildew.PNG";
import grapesMildew2 from "../assets/issueImages/grapesMildew2.PNG";
import grapesBlackRot from "../assets/issueImages/grapesBlackRot.PNG";
import grapesBunchRot from "../assets/issueImages/grapesBunchRot.PNG";
import grapesBunchRot2 from "../assets/issueImages/grapesBunchRot2.PNG";
import grapesThrips from "../assets/issueImages/grapesThrips.PNG";
import grapesThrips2 from "../assets/issueImages/grapesThrips2.PNG";
import peachesBrownRot from "../assets/issueImages/peachesBrownRot.PNG";
import peachesTwigBorer from "../assets/issueImages/peachesTwigBorer.PNG";
import peachesMildew from "../assets/issueImages/peachesMildew.PNG";
import applesScab from "../assets/issueImages/applesScab.PNG";
import applesCodlingMoth from "../assets/issueImages/applesCodlingMoth.PNG";
import applesPowderyMildew from "../assets/issueImages/applesPowderyMildew.PNG";
import applesFireBlight from "../assets/issueImages/applesFireBlight.PNG";
import europeanRedMite from "../assets/issueImages/peachesEuropeanRedMite.PNG";
import lecaniumScale from "../assets/issueImages/peachesLecaniumScale.PNG";
import sanjoseScale from "../assets/issueImages/peachesSanJoseScale.PNG";
import spiderMite from "../assets/issueImages/peachesSpiderMites.PNG";
import leafroller from "../assets/issueImages/peachesLeafroller.PNG";
import greenFruitWorm from "../assets/issueImages/peachesGreenFruitworm.PNG";
import obliquebandedLeafroller from "../assets/issueImages/peachesObliquebandedLeafroller.PNG";
import eyeSpottedBudMoth from "../assets/issueImages/peachesEyeSpottedBudMoth.PNG";
import westernFlowerThrip from "../assets/issueImages/peachesWesternFlowerThrips.PNG";
import CoryneumBlight from "../assets/issueImages/peachesCoryneumBlight.PNG";
import mealyBugs from "../assets/issueImages/peachesMealyBugs.PNG";
import peachAphids from "../assets/issueImages/peachesAphids.PNG";
import treeBorer from "../assets/issueImages/peachesTreeBorer.PNG";

// Crop-specific issue images
// Format: "CropName-IssueName"
export const issuesList = {
  // Cherries
  "Cherries-Fruit Flies": {
    name: "Fruit Flies",
    images: [cherryFruitFly, cherryFruitFly2],
  },
  "Cherries-Mildew": {
    name: "Powdery Mildew",
    images: [cherryMildew, cherryMildew2],
  },
  "Cherries-Brown Rot": {
    name: "Brown Rot",
    images: [cherryBrownRot, cherryBrownRot2],
  },
  "Cherries-Bacterial Canker": {
    name: "Bacterial Canker",
    images: [cherryBacterialCanker],
  },
  "Cherries-Cherry Leaf Spot": {
    name: "Cherry Leaf Spot",
    images: [blankImage, blankImage],
  },
  "Cherries-San Jose Scale": {
    name: "Cherry San Jose Scale",
    images: [cherrySanJoseScale],
  },
  "Cherries-Aphids": {
    name: "Aphids",
    images: [cherryAphids],
  },
  "Cherries-Weeds": {
    name: "Weeds",
    images: [Weeds],
  },

  // Apples
  "Apples-Aphids": {
    name: "Aphids",
    images: [blankImage, blankImage],
  },
  "Apples-Powdery Mildew": {
    name: "Powdery Mildew",
    images: [applesPowderyMildew],
  },
  "Apples-Codling Moth": {
    name: "Codling Moth",
    images: [applesCodlingMoth],
  },
  "Apples-Apple Scab": {
    name: "Apple Scab",
    images: [applesScab],
  },
  "Apples-Fire Blight": {
    name: "Fire Blight",
    images: [applesFireBlight],
  },

  // Grapes
  "Grapes-Aphids": {
    name: "Aphids",
    images: [blankImage, blankImage],
  },
  "Grapes-Mildew": {
    name: "Mildew",
    images: [grapesMildew, grapesMildew2],
  },
  "Grapes-Thrips": {
    name: "Thrips",
    images: [grapesThrips, grapesThrips2],
  },
  "Grapes-Bunch Rot": {
    name: "Bunch Rot",
    images: [grapesBunchRot, grapesBunchRot2],
  },
  "Grapes-Black Rot": {
    name: "Black Rot",
    images: [grapesBlackRot],
  },

  // Peaches
  "Peaches-Peach Twig Borer": {
    name: "Peach Twig Borer",
    images: [peachesTwigBorer],
  },
  "Peaches-Brown Rot": {
    name: "Brown Rot",
    images: [peachesBrownRot],
  },
  "Peaches-Peach Leaf Curl": {
    name: "Peach Leaf Curl",
    images: [peachLeafCurl],
  },
  "Peaches-Powdery Mildew": {
    name: "Powdery Mildew",
    images: [peachesMildew],
  },
  "Peaches-European Red Mite": {
    name: "European Red Mite",
    images: [europeanRedMite],
  },
  "Peaches-Lecanium Scale": {
    name: "Lecanium Scale",
    images: [lecaniumScale],
  },
  "Peaches-San Jose Scale": {
    name: "San Jose Scale",
    images: [sanjoseScale],
  },
  "Peaches-McDaniel, Twospotted Spider Mites": {
    name: "McDaniel, Twospotted Spider Mites",
    images: [spiderMite],
  },
  "Peaches-Fruittree and European Leafrollers": {
    name: "Fruittree and European Leafrollers",
    images: [leafroller],
  },
  "Peaches-Green Fruitworms": {
    name: "Green Fruitworms",
    images: [greenFruitWorm],
  },
  "Peaches-Obliquebanded and Threelined Leafrollers": {
    name: "Obliquebanded and Threelined Leafrollers",
    images: [obliquebandedLeafroller],
  },
  "Peaches-Eyespotted Bud Moth": {
    name: "Eyespotted Bud Moth",
    images: [eyeSpottedBudMoth],
  },
  "Peaches-Western Flower Thrips": {
    name: "Western Flower Thrips",
    images: [westernFlowerThrip],
  },
  "Peaches-Mealybugs": {
    name: "Mealybugs",
    images: [mealyBugs],
  },
  "Peaches-Green Peach Aphid and Black Peach Aphid": {
    name: "Green Peach Aphid and Black Peach Aphid",
    images: [peachAphids],
  },
  "Peaches-Peach Tree Borer": {
    name: "Peach Tree Borer",
    images: [treeBorer],
  },
  "Peaches-Coryneum blight": {
    name: "Coryneum blight",
    images: [CoryneumBlight],
  },

  // Apricots
  "Apricots-Aphids": {
    name: "Aphids",
    images: [blankImage, blankImage],
  },
  "Apricots-Brown Rot": {
    name: "Brown Rot",
    images: [blankImage, blankImage],
  },
  "Apricots-Bacterial Canker": {
    name: "Bacterial Canker",
    images: [blankImage, blankImage],
  },

  // Plums
  "Plums-Aphids": {
    name: "Aphids",
    images: [blankImage, blankImage],
  },
  "Plums-Brown Rot": {
    name: "Brown Rot",
    images: [blankImage, blankImage],
  },
  "Plums-Bacterial Canker": {
    name: "Bacterial Canker",
    images: [blankImage, blankImage],
  },

  // Nectarines
  "Nectarines-Aphids": {
    name: "Aphids",
    images: [blankImage, blankImage],
  },
  "Nectarines-Brown Rot": {
    name: "Brown Rot",
    images: [blankImage, blankImage],
  },
  "Nectarines-Spider Mites": {
    name: "Spider Mites",
    images: [blankImage, blankImage],
  },
};

// Helper function to get crop-specific issue images (returns array)
export const getIssueImage = (cropName, issueName) => {
  const key = `${cropName}-${issueName}`;
  return issuesList[key]?.images || [blankImage];
};
