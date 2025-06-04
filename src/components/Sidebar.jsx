import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ onSelectMenu }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleMenuClick = (menu) => {
    if (onSelectMenu) onSelectMenu(menu);
    setIsOpen(false);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="menu-btn" onClick={toggleSidebar}>
        <div className={`burger-lines ${isOpen ? "expanded" : ""}`}>
          <span></span><span></span><span></span>
        </div>
      </button>

      {isOpen && (
        <nav className="menu">
          <ul>
            <li onClick={() => handleMenuClick("main")}>✈️ Маршруты</li>
            <li onClick={() => handleMenuClick("data")}>🛰️ Данные</li>
            <li onClick={() => handleMenuClick("files")}>📂 Файлы</li>
            <li onClick={() => handleMenuClick("settings")}>⚙️ Настройки</li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
