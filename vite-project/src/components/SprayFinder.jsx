import { useState } from "react";
import { cropList } from "../assets/cropList";
import "./SprayFinder.css";
import IssueDropDown from "./IssueDropDown";
function SprayFinder({ setTab }) {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  if (!selectedCrop || isSpinning) {
    return (
      <div className="crop-grid">
        {cropList.map((crop) => {
          return (
            <div
              key={crop.name}
              onClick={() => {
                console.log("you just clicked", crop.name);
                setSelectedCrop(crop.name);
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
  //console.log("selected crop goint to dropdown: ", selectedCrop);
  return <IssueDropDown setTab={setTab} crop={selectedCrop} />;
}

export default SprayFinder;
