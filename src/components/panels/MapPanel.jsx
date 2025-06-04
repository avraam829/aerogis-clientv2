import React, { useState } from "react";
import { FaMapMarkerAlt, FaDrawPolygon, FaUpload, FaSave } from "react-icons/fa"; 
import "./MapPanel.css";


const MapPanel = ({
  selectedStyle, 
  setSelectedStyle,
  isTerrainOn,
  setIsTerrainOn,
  isWaypointMode,
  setIsWaypointMode,
  setWaypoints,
  waypoints,
  isPolygonMode, 
  setIsPolygonMode, 
  setCurrentPolygon
  }) => {
  // Храним ID активной кнопки
  const [activeTool, setActiveTool] = useState(null);

  // Функция переключения активной кнопки
  const toggleTool = (tool) => {
  if (tool === "point") {
    const isActive = activeTool === "point";
    setActiveTool(isActive ? null : "point");
    setIsWaypointMode(!isActive);
    setIsPolygonMode(false);
  } else if (tool === "polygon") {
    const isActive = activeTool === "polygon";
    setActiveTool(isActive ? null : "polygon");
    setIsWaypointMode(false);
    setIsPolygonMode(!isActive);
    if (!isActive) {
      setCurrentPolygon([]); // ← заменить
    }
  }
};


  return (
    
    <div className="map-panel">
      <h2>Настройки карты</h2>

      {/* Выбор подложки */}
      <label htmlFor="map-style">Подложка:</label>
      <select
        id="map-style"
        value={selectedStyle}
        onChange={(e) => setSelectedStyle(e.target.value)}
      >
        <option value="mapbox://styles/mapbox/streets-v12">Улицы</option>
        <option value="mapbox://styles/mapbox/satellite-v9">Спутник</option>
        <option value="mapbox://styles/mapbox/outdoors-v11">Топографическая</option>
        <option value="mapbox://styles/mapbox/dark-v11">Тёмная</option>
        <option value="mapbox://styles/mapbox/light-v11">Светлая</option>
      </select>

      {/* Переключатель 3D-рельефа */}
      <div className="toggle-container">
        <input
          type="checkbox"
          id="terrain-toggle"
          checked={isTerrainOn}
          onChange={(e) => setIsTerrainOn(e.target.checked)}
        />
        <label htmlFor="terrain-toggle">Включить 3D-рельеф</label>
      </div>

      {/* Раздел маршрутов */}
      <h2>Построение маршрута</h2>
      <div className="map-tools">
        {/* Кнопка "Поставить точку" */}
        <button
          className={`map-tool ${activeTool === "point" ? "active" : ""}`}
          onClick={() => toggleTool("point")}
          title="Построить точку"
        >
          <FaMapMarkerAlt />
        </button>

        {/* Кнопка "Построить полигон" */}
        <button
          className={`map-tool ${activeTool === "polygon" ? "active" : ""}`}
          onClick={() => toggleTool("polygon")}
          title="Построить полигон"
        >
          <FaDrawPolygon />
        </button>
      </div>

      {/* Раздел загрузки и сохранения маршрута */}
      <h2>Управление маршрутами</h2>
        <div className="map-tools">
          <button className="map-tool" title="Загрузить маршрут">
            <FaUpload />
          </button>

                    <button
            className="map-tool"
            title="Сохранить маршрут"
            onClick={async () => {
              try {
                const result = await window.electron.saveWaypoints(waypoints);
                if (result.success) {
                  console.log("Файл сохранён:", result.filePath);
                } else {
                  console.log("Сохранение отменено");
                }
              } catch (err) {
                console.error("Ошибка при сохранении:", err);
              }
            }}
          >
            <FaSave />
          </button>

          <button
            className="map-tool"
            title="Очистить маршрут"
            onClick={() => { setWaypoints([]); }}
>
  🗑️
</button>
        </div>
        
          
      </div>
    
  );
};

export default MapPanel;
