import React from "react";
import "./WaypointSettingsPanel.css";

const WaypointSettingsPanel = ({ height, setHeight, followTerrain, setFollowTerrain }) => {
  return (
    <div className="waypoint-settings-panel">
      <h3>Параметры точки</h3>

      <label>
        Высота, м:
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={followTerrain}
          onChange={(e) => setFollowTerrain(e.target.checked)}
        />
        Огибать рельеф
      </label>
    </div>
  );
};

export default WaypointSettingsPanel;
