import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";

import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import CoordinatesDisplay from './components/CoordinatesDisplay';
import RightPanelContainer from './components/RightPanelContainer';
import SettingsPanel from "./components/SettingsPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import WaypointSettingsPanel from "./components/WaypointSettingsPanel";
import PolygonSettingsPanel from "./components/PolygonSettingsPanel";
import PolygonContextMenu from "./components/PolygonContextMenu";
import { generateFlightLinesInsidePolygon } from './utils/flightPlanner';
import './App.css';


function App() {
  const [selectedStyle, setSelectedStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [isTerrainOn, setIsTerrainOn] = useState(false);
  const [cursorCoordinates, setCursorCoordinates] = useState({ lng: 0, lat: 0 });
  const [uiMode, setUIMode] = useState('main');
  const [telemetry, setTelemetry] = useState({});
  const [isWaypointMode, setIsWaypointMode] = useState(false);
  const [waypointHeight, setWaypointHeight] = useState(50);
  const [followTerrain, setFollowTerrain] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const mapRef = useRef();
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(null);
  const [polygonSettings, setPolygonSettings] = useState({ altitude: 50, spacing: 50, crossCount: 2 });


  const [polygons, setPolygons] = useState([]); // массив [{ points: [...] }]
  const [currentPolygon, setCurrentPolygon] = useState([]); // временный, рисуемый
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  
  useEffect(() => {
    if (window.mavlinkAPI) {
      window.mavlinkAPI.onMessage((msg) => {
        setTelemetry((prev) => ({
          ...prev,
          [msg.type]: msg.data,
        }));
      });
    }
  }, []);

  return (
    <div className="app-container">
      <Sidebar onSelectMenu={setUIMode} />

      {uiMode === 'main' && (
        <>
          <div className="map-wrapper">
            <MapComponent
              ref={mapRef}
              onMouseMoveСord={setCursorCoordinates}
              selectedStyle={selectedStyle}
              isTerrainOn={isTerrainOn}
              telemetry={telemetry}
              isWaypointMode={isWaypointMode}
              waypoints={waypoints}
              setWaypoints={setWaypoints}
              waypointHeight={waypointHeight}
              followTerrain={followTerrain}
              isPolygonMode={isPolygonMode}
            
           
             
              polygons={polygons}
              setPolygons={setPolygons}
              currentPolygon={currentPolygon}
              setCurrentPolygon={setCurrentPolygon}
              setSelectedPolygonIndex={setSelectedPolygonIndex}
              setIsPolygonMode={setIsPolygonMode}
          
          
            
            />
            <CoordinatesDisplay coordinates={cursorCoordinates} />
          </div>

          <RightPanelContainer
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            isTerrainOn={isTerrainOn}
            setIsTerrainOn={setIsTerrainOn}
            telemetry={telemetry}
            isWaypointMode={isWaypointMode}
            setIsWaypointMode={setIsWaypointMode}
            setWaypoints={setWaypoints}
            waypoints={waypoints}
            isPolygonMode={isPolygonMode} // ✅ Добавить
            setIsPolygonMode={setIsPolygonMode} // ✅ Добавить

            setCurrentPolygon={setCurrentPolygon}
          />
          {isWaypointMode && (
          <WaypointSettingsPanel
            height={waypointHeight}
            setHeight={setWaypointHeight}
            followTerrain={followTerrain}
            setFollowTerrain={setFollowTerrain}/>
          )}

          {isPolygonMode && currentPolygon.length > 0 && (
          <PolygonSettingsPanel onFinish={() => {
            if (currentPolygon.length >= 3) {
              setPolygons((prev) => [...prev, currentPolygon]);
              setCurrentPolygon([]);
              }
          }} />
        )}
        {selectedPolygonIndex !== null && (
          <>
          
  <PolygonContextMenu
    index={selectedPolygonIndex}
    settings={polygonSettings}
    onChange={setPolygonSettings}
    onClose={() => setSelectedPolygonIndex(null)}
    onBuild={() => {
      const polygon = polygons[selectedPolygonIndex];
      const newWps = generateFlightLinesInsidePolygon(polygon, polygonSettings.spacing, polygonSettings);
      setWaypoints(newWps);
      console.log("✅ Построен маршрут:", newWps);
      console.log("🔧 Построение маршрута по полигону", polygonSettings);
    }}
    onDelete={() => {
      setPolygons(polygons.filter((_, i) => i !== selectedPolygonIndex));
      setSelectedPolygonIndex(null);
    }}
  />
    </> 
)}
        </>
      )}

      {uiMode === 'settings' && <SettingsPanel />}

      {uiMode === 'data' && <TelemetryPanel telemetry={telemetry} />}
    </div>
  );
}

export default App;
