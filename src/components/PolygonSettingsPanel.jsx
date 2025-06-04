import React from "react";
import "./WaypointSettingsPanel.css";

const PolygonSettingsPanel = ({ onFinish }) => {
  return (
    <div className="waypoint-settings-panel">
      <h3>Построение полигона</h3>
      <button onClick={onFinish}>Завершить ввод</button>
    </div>
  );
};

export default PolygonSettingsPanel;
