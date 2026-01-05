import NavBar from "../components/NavBar";
import { useState } from "react";

export default function KrishiSaathi() {
  const [issue, setIssue] = useState("");

  const month = new Date().getMonth(); // 0–11

  let season = "Zaid";
  let advisory = "Ensure adequate irrigation and protect crops from heat stress.";

  if (month >= 5 && month <= 8) {
    season = "Kharif";
    advisory = "High risk of fungal diseases. Monitor leaves regularly.";
  } else if (month >= 9 || month <= 0) {
    season = "Rabi";
    advisory = "Avoid over-irrigation. Watch for pest infestation.";
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>🤖 KrishiSaathi</h2>

      {/* GRID LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* LEFT: SEASONAL ADVISORY */}
        <div
          style={{
            border: "1px solid #444",
            borderRadius: 12,
            padding: 16,
            background: "#1e1e1e",
          }}
        >
          <h3>🌦️ Seasonal Advisory</h3>
          <p>
            <b>Current Season:</b> {season}
          </p>
          <p>{advisory}</p>
        </div>

        {/* RIGHT: CROP ISSUE DETECTION */}
        <div
          style={{
            border: "1px solid #444",
            borderRadius: 12,
            padding: 16,
            background: "#1e1e1e",
          }}
        >
          <h3>📷 Crop Issue Detection</h3>

          <input type="file" disabled />
          <p style={{ fontSize: 13, color: "#aaa" }}>
            (Image upload enabled in next version)
          </p>

          <select
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Select observed issue</option>
            <option value="leaf">Leaf spots / discoloration</option>
            <option value="pest">Pest holes / insects</option>
            <option value="yellow">Yellowing of crop</option>
          </select>

          {issue && (
            <p style={{ marginTop: 12 }}>
              Possible cause detected. Recommended to consult Krushi Seva Kendra
              or apply basic organic treatment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
<NavBar />