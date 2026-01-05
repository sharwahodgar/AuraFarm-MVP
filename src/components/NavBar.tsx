import { Link, useLocation } from "react-router-dom";

const navStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  padding: "10px",
  borderTop: "1px solid #ddd",
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#fff",
};

const linkStyle = (active: boolean): React.CSSProperties => ({
  textDecoration: "none",
  color: active ? "green" : "black",
  fontWeight: active ? "bold" : "normal",
});

export default function NavBar() {
  const location = useLocation();

  return (
    <div style={navStyle}>
      <Link to="/feed" style={linkStyle(location.pathname === "/feed")}>
        🌱 Feed
      </Link>
      <Link to="/beejmitra" style={linkStyle(location.pathname === "/beejmitra")}>
        🌾 BeejMitra
      </Link>
      <Link to="/krishisathi" style={linkStyle(location.pathname === "/krishisathi")}>
        🤖 KrishiSaathi
      </Link>
      <Link to="/profile" style={linkStyle(location.pathname === "/profile")}>
        👤 Profile
      </Link>
    </div>
  );
}
