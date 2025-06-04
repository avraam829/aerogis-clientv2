import React, { useState } from "react";
import MapPanel from "./panels/MapPanel";
import HudPanel from "./panels/HudPanel";
import CustomPanel from "./panels/CustomPanel";
import "./RightPanelContainer.css";

const RightPanelContainer = ({
  selectedStyle,
  setSelectedStyle,
  isTerrainOn,
  setIsTerrainOn,
  isWaypointMode,
  setIsWaypointMode,
  setWaypoints,
  waypoints, 
  isPolygonMode, setIsPolygonMode, setPolygonPoints, setPolygonFinalized, setCurrentPolygon 
}) => {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="right-panel-container">
      <div className="tab-header">
        <button onClick={() => setActiveTab("map")}>🗺️ Карта</button>
        <button onClick={() => setActiveTab("hud")}>🎯 HUD</button>
        <button onClick={() => setActiveTab("custom")}>🛠️ Загрузка файлов</button>
      </div>

      <div className="panel-body">
        <div style={{ display: activeTab === "map" ? "block" : "none" }}>
          <MapPanel
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            isTerrainOn={isTerrainOn}
            setIsTerrainOn={setIsTerrainOn}
            isWaypointMode={isWaypointMode}
            setIsWaypointMode={setIsWaypointMode}
            setWaypoints={setWaypoints}
            waypoints={waypoints}
            isPolygonMode={isPolygonMode}
            setIsPolygonMode={setIsPolygonMode}
            setPolygonPoints={setPolygonPoints}
            setPolygonFinalized={setPolygonFinalized}
            setCurrentPolygon={setCurrentPolygon}
            
          />
        </div>
        <div style={{ display: activeTab === "hud" ? "block" : "none" }}>
          <HudPanel />
        </div>
        <div style={{ display: activeTab === "custom" ? "block" : "none" }}>
          <CustomPanel />
        </div>
      </div>
    </div>
  );
};

export default RightPanelContainer;
