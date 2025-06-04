import React from "react";
import "./PolygonContextMenu.css";

const PolygonContextMenu = ({ index, settings, onChange, onClose, onBuild, onDelete }) => {
    return (
  <div className="polygon-menu">
    <h4>Полигон #{index + 1}</h4>
    <label>Высота облёта: <input type="number" value={settings.altitude} onChange={(e) => onChange({ ...settings, altitude: +e.target.value })} /></label>
    <label>Расстояние между пролетами: <input type="number" value={settings.spacing} onChange={(e) => onChange({ ...settings, spacing: +e.target.value })} /></label>
    <label>Кол-во проверочных трасс: <input type="number" value={settings.crossCount} onChange={(e) => onChange({ ...settings, crossCount: +e.target.value })} /></label>
    <button onClick={onBuild}>🚀 Построить маршрут</button>
    <button onClick={onDelete}>🗑️ Удалить</button>
    <button onClick={onClose}>✖ Закрыть</button>
  </div>
);
};
export default PolygonContextMenu;