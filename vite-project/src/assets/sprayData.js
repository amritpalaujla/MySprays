// This file intelligently loads the correct dataset based on region

import sprayDataCA from "./sprayDataCA.json";
import sprayDataUS from "./sprayDataUS.json";

/**
 * Get spray data for a specific region
 * @param {string} region - 'CA' or 'US'
 * @returns {Object} Spray data for the specified region
 */
export const getSprayData = (region = "CA") => {
  return region === "US" ? sprayDataUS : sprayDataCA;
};

// Default export (Canada) for backwards compatibility
export default sprayDataCA;
