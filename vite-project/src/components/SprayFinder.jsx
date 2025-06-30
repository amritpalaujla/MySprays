import { useState } from "react";
import { cropList } from "../assets/cropList";

function SprayFinder() {
  const [selectedCrop, setSelectedCrop] = useState(null);

  return (
    <div>
      {cropList.map((crop) => {
        return <div key={crop.name}>{crop.name}</div>;
      })}
    </div>
  );
}

export default SprayFinder;
