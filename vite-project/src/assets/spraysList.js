// Import your spray product images here
import blankImage from "./blank.jpg";
import delegate from "../assets/sprayImages/delegate.png";
import copperSpray from "../assets/sprayImages/copperSpray.PNG";
import guardsman from "../assets/sprayImages/guardsman.PNG";
import roundup from "../assets/sprayImages/roundup.PNG";
import success from "../assets/sprayImages/success.PNG";
import pristinewg from "../assets/sprayImages/pristinewg.PNG";
import mervion from "../assets/sprayImages/mervion.PNG";
import movento from "../assets/sprayImages/movento.PNG";
import sivanto from "../assets/sprayImages/sivanto.PNG";
import cevya from "../assets/sprayImages/cevya.PNG";
import nova from "../assets/sprayImages/nova.PNG";
import kumulusDF from "../assets/sprayImages/kumulusDF.PNG";
import pureSprayGreenOil from "../assets/sprayImages/pureSprayGreenOil.PNG";
import captanL from "../assets/sprayImages/captanL.PNG";
import maestro from "../assets/sprayImages/maestro.PNG";

// TODO: Replace with actual spray product images
// Example:
// import captan from "./captan.jpg";
// import indar from "./indar.jpg";
// import assail from "./assail.jpg";

// Spray product images
// Key is the exact spray name as it appears in sprayData.json
export const spraysList = {
  // Fungicides
  Captan: { name: "Captan", image: blankImage },
  Indar: { name: "Indar", image: blankImage },
  "Luna Sensation": { name: "Luna Sensation", image: blankImage },
  "Pristine WG": { name: "Pristine", image: pristinewg },
  Rally: { name: "Rally", image: blankImage },
  Sovran: { name: "Sovran", image: blankImage },
  "Inspire Super": { name: "Inspire Super", image: blankImage },
  Fontelis: { name: "Fontelis", image: blankImage },
  Flint: { name: "Flint", image: blankImage },
  Mervion: { name: "Mervion", image: mervion },
  Cevya: { name: "Cevya", image: cevya },
  Nova: { name: "Nova", image: nova },
  "Kumulus DF": { name: "Kumulus DF", image: kumulusDF },
  "PureSpray Green Oil": {
    name: "PureSpray Green Oil",
    image: pureSprayGreenOil,
  },
  CaptanL: { name: "CaptanL", image: captanL },
  Maestro: { name: "maestro", image: maestro },

  // Insecticides
  Assail: { name: "Assail", image: blankImage },
  Calypso: { name: "Calypso", image: blankImage },
  "Delegate WG": { name: "Delegate WG", image: delegate },
  Exirel: { name: "Exirel", image: blankImage },
  Imidan: { name: "Imidan", image: blankImage },
  Movento: { name: "Movento", image: movento },
  Rimon: { name: "Rimon", image: blankImage },
  Success: { name: "Success", image: success },
  Warrior: { name: "Warrior", image: blankImage },
  Actara: { name: "Actara", image: blankImage },
  Sivanto: { name: "Sivanto", image: sivanto },

  // Miticides
  Acramite: { name: "Acramite", image: blankImage },
  Apollo: { name: "Apollo", image: blankImage },
  Envidor: { name: "Envidor", image: blankImage },
  Kanemite: { name: "Kanemite", image: blankImage },
  Nexter: { name: "Nexter", image: blankImage },
  Portal: { name: "Portal", image: blankImage },
  Zeal: { name: "Zeal", image: blankImage },

  // Herbicides
  Chateau: { name: "Chateau", image: blankImage },
  Goal: { name: "Goal", image: blankImage },
  Prowl: { name: "Prowl", image: blankImage },
  Roundup: { name: "Roundup", image: roundup },
  Surflan: { name: "Surflan", image: blankImage },
  Treflан: { name: "Treflan", image: blankImage },

  // Add more spray products as needed...

  "Copper Spray": { name: "Copper Spray", image: copperSpray },
  Guardsman: { name: "Guardsman", image: guardsman },
  // Make sure the key matches EXACTLY what's in your sprayData.json
};

// Helper function to get spray product image
// Takes the spray name, returns the appropriate image
export const getSprayImage = (sprayName) => {
  return spraysList[sprayName]?.image || blankImage;
};
