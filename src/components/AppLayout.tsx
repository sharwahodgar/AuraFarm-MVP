import { NavLink, Outlet } from "react-router-dom";

const tabStyle = ({ isActive }: any) => ({
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  background: isActive ? "#e6f4ea" : "#f5f5f5",
  color: isActive ? "#1b5e20" : "#333",
});

export default function AppLayout() {
  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 16 }}>
      <h2 style={{ textAlign: "center" }}>🌱 AuraFarm</h2>

      {/* Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <NavLink to="/feed" style={tabStyle}>🌱 Feed</NavLink>
        <NavLink to="/beejmitra" style={tabStyle}>🌾 BeejMitra</NavLink>
        <NavLink to="/krishisathi" style={tabStyle}>🤖 AI</NavLink>
        <NavLink to="/profile" style={tabStyle}>👤 Profile</NavLink>
      </div>

      {/* Page Content */}
      <div style={{ paddingTop: 8 }}>
        <Outlet />
      </div>
    </div>
  );
}
