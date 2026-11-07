import { useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import "./SprayFinder.css";
import IssueDropDown from "./IssueDropDown";

function SprayFinder({ selectedCrop, setSelectedCrop, selectedIssue, setSelectedIssue }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const { crops, loading } = useCatalog();

  const handleBackToCrops = () => {
    setSelectedCrop(null);
    setSelectedIssue("");
    setIsSpinning(false);
  };

  if (loading) {
    return <p className="text-center text-gray-600 mt-8">Loading crops...</p>;
  }

  if (!selectedCrop || isSpinning) {
    return (
      <div className="crop-grid">
        {crops.map((crop) => {
          return (
            <div
              key={crop.name}
              onClick={() => {
                console.log("you just clicked", crop.name);
                setSelectedCrop(crop.name);
                setSelectedIssue("");
                setIsSpinning(true);
                setTimeout(() => setIsSpinning(false), 700);
              }}
              className={`crop-card ${
                selectedCrop === crop.name ? "spin" : ""
              }`}
            >
              <img src={crop.image} alt={crop.name}></img>
              <p>{crop.name}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <IssueDropDown
      crop={selectedCrop}
      onBackToCrops={handleBackToCrops}
      selectedIssue={selectedIssue}
      setSelectedIssue={setSelectedIssue}
    />
  );
}

export default SprayFinder;
