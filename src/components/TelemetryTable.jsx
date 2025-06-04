import React from "react";
import "./TelemetryTable.css";

const TelemetryTable = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>Нет данных</p>;
  }

  return (
    <div className="telemetry-table">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="telemetry-row">
          <span className="telemetry-key">{key}</span>
          <span className="telemetry-value">{value?.toString?.()}</span>
        </div>
      ))}
    </div>
  );
};

export default TelemetryTable;
