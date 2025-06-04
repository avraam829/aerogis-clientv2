import React, { useState } from "react";
import TelemetryTable from "./TelemetryTable";
import "./TelemetryPanel.css";

const TelemetryPanel = ({ telemetry }) => {
  const [isConnected, setIsConnected] = useState(false);

  const handleToggleConnection = async () => {
    if (!isConnected) {
      const result = await window.mavlinkAPI.connect();
      if (result.success) {
        alert("✅ Подключено к " + (result.port || result.message));
        setIsConnected(true);
      } else {
        alert("❌ Ошибка: " + result.error);
      }
    } else {
      const result = await window.mavlinkAPI.disconnect();
      if (result.success) {
        alert("🔌 Отключено");
        setIsConnected(false);
      } else {
        alert("❌ Ошибка: " + result.error);
      }
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📡 Телеметрия MAVLink</h2>
      <button onClick={handleToggleConnection}>
        {isConnected ? "🔌 Отключиться" : "🔌 Подключиться"}
      </button>

      <div className="telemetry-scroll-container">
        {Object.entries(telemetry).map(([type, data]) => (
          <div key={type} style={{ marginBottom: "1rem" }}>
            <h3>{type}</h3>
            <TelemetryTable data={data} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryPanel;
