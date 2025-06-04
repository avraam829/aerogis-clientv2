import React, { useState } from "react";
import "./SettingsPanel.css";

const SettingsPanel = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [currentNetplan, setCurrentNetplan] = useState("");
  const [ipAddress, setIpAddress] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState("");

  const handleUnlock = async () => {
    setStatus("🔍 Проверка соединения с дроном...");
    try {
      const pingRes = await fetch("http://192.168.4.1:80/api/ping");
      if (!pingRes.ok) throw new Error("Ping failed");
      setStatus("✅ Дрон доступен. Загружаем netplan...");

      const res = await fetch("http://192.168.4.1:80/api/netplan");
      if (!res.ok) throw new Error("Netplan fetch failed");

      const text = await res.text();
      setCurrentNetplan(text);
      setIsUnlocked(true);
      setStatus("✅ Дрон доступен.");
    } catch (e) {
      setStatus("❌ Ошибка: " + e.message);
    }
  };

  const handleSave = async () => {
    setStatus("💾 Отправка настроек...");
    try {
      await fetch("http://192.168.4.1:80/api/netplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid, password }),
      });

      setStatus("🔄 Перезапуск сетевой конфигурации...");
      const res = await fetch("http://192.168.4.1:80/api/restart-network");
      const json = await res.json();
      setIpAddress(json.ip);
      setStatus(`✅ Подключено. Информация о IP: ${json.ip}`);
    } catch (e) {
      setStatus("❌ Ошибка при применении настроек");
    }
  };

  return (
    <div className="settings-panel">
      <h2>Подключение дрона к Wi-Fi</h2>

      {!isUnlocked && (
        <button onClick={handleUnlock}>🔐 Проверить соединение</button>
      )}

      {isUnlocked && (
        <>
          <div className="form-group">
            <label>Имя сети (SSID):</label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={handleSave}>💾 Сохранить и подключиться</button>

          <div className="form-group">
            <label>Текущий netplan:</label>
        </div>
        <div>
            <textarea
              readOnly
              value={currentNetplan}
              rows={8}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </div>

          {ipAddress && <p>📡 Новый IP: <b>{ipAddress}</b></p>}
        </>
      )}

      {status && <div className="status">{status}</div>}
    </div>
  );
};

export default SettingsPanel;
