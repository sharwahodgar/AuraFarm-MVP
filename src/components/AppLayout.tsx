import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-layout-container">
      <div className="app-header">
        <h2>🌾 AuraFarm</h2>
        <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "14px" }}>
          Your farming community platform
        </p>
      </div>

      {/* Tabs */}
      <div className="app-tabs">
        <NavLink to="/feed">
          🌱 Feed
        </NavLink>
        <NavLink to="/beejmitra">
          🌾 BeejMitra
        </NavLink>
        <NavLink to="/krishisathi">
          🤖 AI Assistant
        </NavLink>
        <NavLink to="/profile">
          👤 Profile
        </NavLink>
      </div>

      {/* Page Content */}
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}
