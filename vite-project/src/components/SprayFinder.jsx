import { useState } from "react";
import { cropList } from "../assets/cropList";
import "./SprayFinder.css";
function SprayFinder() {
  const [selectedCrop, setSelectedCrop] = useState(null);

  return (
    <div className="crop-grid">
      {cropList.map((crop) => {
        return (
          <div
            key={crop.name}
            onClick={() => {
              console.log("you just clicked", crop.name);
              setSelectedCrop(crop.name);
            }}
            className="crop-card"
          >
            <img src={crop.image} alt={crop.name}></img>
            <p>{crop.name}</p>
          </div>
        );
      })}
    </div>
  );
}

export default SprayFinder;
