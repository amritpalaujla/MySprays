import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import sprayDataCA from "../assets/sprayDataCA.json";
import sprayDataUS from "../assets/sprayDataUS.json";
import { cropList } from "../assets/cropList";
import { getIssueImage } from "../assets/issuesList";
import blankImage from "../assets/blank.jpg";

const CatalogContext = createContext();

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
};

// Converts the API catalog into the { crop: { issue: [sprays] } } shape
// the components were built around, picking the rate/unit for one region
const toRegionData = (catalog, regionKey) => {
  const data = {};
  for (const crop of catalog) {
    data[crop.name] = {};
    for (const issue of crop.issues) {
      data[crop.name][issue.name] = issue.sprays.map((spray) => ({
        name: spray.name,
        rate: spray[regionKey]?.rate || "",
        unit: spray[regionKey]?.unit || "",
        phi: spray.phi,
        pcp: spray.pcp,
        stage: spray.stage,
        description: spray[regionKey]?.description ?? spray.description ?? "",
      }));
    }
  }
  return data;
};

export const CatalogProvider = ({ children }) => {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/catalog`);
      if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
      setCatalog(await res.json());
    } catch (error) {
      // Fall back to the bundled spray data so the site still works
      console.error("Failed to load catalog, using bundled data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Memoized so components can safely use the data in effect dependencies
  const sprayData = useMemo(() => {
    if (!catalog) return { CA: sprayDataCA, US: sprayDataUS };
    return { CA: toRegionData(catalog, "ca"), US: toRegionData(catalog, "us") };
  }, [catalog]);

  const crops = useMemo(() => {
    const localImage = (name) =>
      cropList.find((c) => c.name === name)?.image || blankImage;
    if (!catalog) return cropList;
    return catalog.map((crop) => ({
      name: crop.name,
      image: crop.image || localImage(crop.name),
    }));
  }, [catalog]);

  const getSprayData = (region = "CA") =>
    region === "US" ? sprayData.US : sprayData.CA;

  const getIssueImages = (cropName, issueName) => {
    const crop = catalog?.find((c) => c.name === cropName);
    const issue = crop?.issues.find((i) => i.name === issueName);
    if (issue?.images?.length) return issue.images;
    return getIssueImage(cropName, issueName);
  };

  return (
    <CatalogContext.Provider
      value={{ crops, loading, getSprayData, getIssueImages, refreshCatalog }}
    >
      {children}
    </CatalogContext.Provider>
  );
};
