import React, { useState } from "react";
import "./CoordinatesDisplay.css";

const CoordinatesDisplay = ({ coordinates }) => {
  return (
    <div className="coordinates-display">
      Долгота: {coordinates.lng} | Широта: {coordinates.lat}
    </div>
  );
};

export default CoordinatesDisplay;
