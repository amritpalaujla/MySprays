// Import your spray product images here
import blankImage from "./blank.jpg";
import delegate from "../assets/delegate.png";

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
  Pristine: { name: "Pristine", image: blankImage },
  Rally: { name: "Rally", image: blankImage },
  Sovran: { name: "Sovran", image: blankImage },
  "Inspire Super": { name: "Inspire Super", image: blankImage },
  Fontelis: { name: "Fontelis", image: blankImage },
  Flint: { name: "Flint", image: blankImage },

  // Insecticides
  Assail: { name: "Assail", image: blankImage },
  Calypso: { name: "Calypso", image: blankImage },
  "Delegate WG": { name: "Delegate WG", image: delegate },
  Exirel: { name: "Exirel", image: blankImage },
  Imidan: { name: "Imidan", image: blankImage },
  Movento: { name: "Movento", image: blankImage },
  Rimon: { name: "Rimon", image: blankImage },
  Success: { name: "Success", image: blankImage },
  Warrior: { name: "Warrior", image: blankImage },
  Actara: { name: "Actara", image: blankImage },

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
  Roundup: { name: "Roundup", image: blankImage },
  Surflan: { name: "Surflan", image: blankImage },
  Treflан: { name: "Treflan", image: blankImage },

  // Add more spray products as needed...
  // Make sure the key matches EXACTLY what's in your sprayData.json
};

// Helper function to get spray product image
// Takes the spray name, returns the appropriate image
export const getSprayImage = (sprayName) => {
  return spraysList[sprayName]?.image || blankImage;
};
