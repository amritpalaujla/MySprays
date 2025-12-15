import { createContext, useContext, useState, useEffect } from "react";

const RegionContext = createContext();

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return context;
};

export const RegionProvider = ({ children, user }) => {
  // Priority: 1. User profile (if logged in), 2. localStorage, 3. Default to CA
  const [region, setRegionState] = useState(() => {
    if (user?.region) {
      return user.region;
    }
    return localStorage.getItem("region") || "CA";
  });

  // Sync with user profile when user logs in
  useEffect(() => {
    if (user?.region && user.region !== region) {
      setRegionState(user.region);
      localStorage.setItem("region", user.region);
    }
  }, [user]);

  const setRegion = async (newRegion) => {
    // Update local state
    setRegionState(newRegion);

    // Always save to localStorage (for logged-out users)
    localStorage.setItem("region", newRegion);

    // If user is logged in, also update their profile
    if (user) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/user/region`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ region: newRegion }),
        });
      } catch (error) {
        console.error("Failed to update user region:", error);
      }
    }
  };

  const getUnitLabels = () => {
    if (region === "US") {
      return {
        volume: "gal",
        smallVolume: "fl oz",
        weight: "lb",
        smallWeight: "oz",
        area: "acre",
      };
    }
    return {
      volume: "L",
      smallVolume: "mL",
      weight: "kg",
      smallWeight: "g",
      area: "acre",
    };
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, getUnitLabels }}>
      {children}
    </RegionContext.Provider>
  );
};
