import { useState, useRef } from "react";
import "./KrishiSaathi.css";

// Spray Guidance - Dosage data (ml per acre for common pesticides)
const sprayDosageData: {
  [crop: string]: {
    [pesticide: string]: {
      mlPerAcre: number;
      mlPerHectare: number;
      waterPerAcre: number; // in liters
      waterPerHectare: number;
      notes?: string;
    };
  };
} = {
  rice: {
    "cypermethrin": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 200, waterPerHectare: 500 },
    "monocrotophos": { mlPerAcre: 400, mlPerHectare: 1000, waterPerAcre: 200, waterPerHectare: 500 },
    "chlorpyriphos": { mlPerAcre: 500, mlPerHectare: 1250, waterPerAcre: 200, waterPerHectare: 500 },
    "carbendazim": { mlPerAcre: 250, mlPerHectare: 625, waterPerAcre: 200, waterPerHectare: 500 },
    "mancozeb": { mlPerAcre: 500, mlPerHectare: 1250, waterPerAcre: 200, waterPerHectare: 500 },
  },
  wheat: {
    "cypermethrin": { mlPerAcre: 150, mlPerHectare: 375, waterPerAcre: 150, waterPerHectare: 375 },
    "deltamethrin": { mlPerAcre: 100, mlPerHectare: 250, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
    "mancozeb": { mlPerAcre: 400, mlPerHectare: 1000, waterPerAcre: 150, waterPerHectare: 375 },
  },
  cotton: {
    "monocrotophos": { mlPerAcre: 500, mlPerHectare: 1250, waterPerAcre: 200, waterPerHectare: 500 },
    "cypermethrin": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 200, waterPerHectare: 500 },
    "imidacloprid": { mlPerAcre: 100, mlPerHectare: 250, waterPerAcre: 200, waterPerHectare: 500 },
    "chlorpyriphos": { mlPerAcre: 600, mlPerHectare: 1500, waterPerAcre: 200, waterPerHectare: 500 },
  },
  sugarcane: {
    "monocrotophos": { mlPerAcre: 400, mlPerHectare: 1000, waterPerAcre: 200, waterPerHectare: 500 },
    "chlorpyriphos": { mlPerAcre: 500, mlPerHectare: 1250, waterPerAcre: 200, waterPerHectare: 500 },
    "carbendazim": { mlPerAcre: 300, mlPerHectare: 750, waterPerAcre: 200, waterPerHectare: 500 },
  },
  tomato: {
    "cypermethrin": { mlPerAcre: 150, mlPerHectare: 375, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
    "mancozeb": { mlPerAcre: 300, mlPerHectare: 750, waterPerAcre: 150, waterPerHectare: 375 },
  },
  "brinjal/eggplant": {
    "cypermethrin": { mlPerAcre: 150, mlPerHectare: 375, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
  },
  "chilli/pepper": {
    "cypermethrin": { mlPerAcre: 150, mlPerHectare: 375, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
  },
  maize: {
    "cypermethrin": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 250, mlPerHectare: 625, waterPerAcre: 150, waterPerHectare: 375 },
  },
  "pulses/beans": {
    "cypermethrin": { mlPerAcre: 150, mlPerHectare: 375, waterPerAcre: 150, waterPerHectare: 375 },
    "carbendazim": { mlPerAcre: 200, mlPerHectare: 500, waterPerAcre: 150, waterPerHectare: 375 },
  },
};

const commonCrops = [
  { value: "rice", label: "🌾 Rice", icon: "🌾" },
  { value: "wheat", label: "🌾 Wheat", icon: "🌾" },
  { value: "cotton", label: "🧵 Cotton", icon: "🧵" },
  { value: "sugarcane", label: "🪴 Sugarcane", icon: "🪴" },
  { value: "tomato", label: "🍅 Tomato", icon: "🍅" },
  { value: "brinjal/eggplant", label: "🍆 Brinjal/Eggplant", icon: "🍆" },
  { value: "chilli/pepper", label: "🌶️ Chilli/Pepper", icon: "🌶️" },
  { value: "maize", label: "🌽 Maize", icon: "🌽" },
  { value: "pulses/beans", label: "🫘 Pulses/Beans", icon: "🫘" },
];

export default function KrishiSaathi() {
  const [issue, setIssue] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Spray Guidance states
  const [activeFeature, setActiveFeature] = useState<"none" | "detection" | "spray">("none");
  const [sprayCrop, setSprayCrop] = useState("");
  const [sprayFieldSize, setSprayFieldSize] = useState("");
  const [sprayUnit, setSprayUnit] = useState<"acre" | "hectare">("acre");
  const [sprayPesticide, setSprayPesticide] = useState("");
  const [sprayResult, setSprayResult] = useState<{
    medicineMl: number;
    waterLiters: number;
    pesticide: string;
  } | null>(null);

  const month = new Date().getMonth(); // 0–11
  const currentDate = new Date();

  let season = "Zaid";
  let seasonIcon = "☀️";
  let advisory = "Ensure adequate irrigation and protect crops from heat stress.";
  let seasonColor = "#f59e0b";

  if (month >= 5 && month <= 8) {
    season = "Kharif";
    seasonIcon = "🌧️";
    advisory = "High risk of fungal diseases. Monitor leaves regularly. Keep fields well-drained.";
    seasonColor = "#22c55e";
  } else if (month >= 9 || month <= 2) {
    season = "Rabi";
    seasonIcon = "❄️";
    advisory = "Avoid over-irrigation. Watch for pest infestation. Protect crops from cold.";
    seasonColor = "#3b82f6";
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate image processing (in real app, this would call an AI service)
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      // Simulated recommendation based on image
      const recommendations: { [key: string]: string } = {
        leaf: "Leaf spots detected. Apply organic fungicide spray. Ensure proper spacing for air circulation.",
        pest: "Pest activity visible. Use neem oil solution or consult local Krishi Seva Kendra for appropriate pesticide.",
        yellow: "Yellowing observed. Check soil pH and nutrient levels. May need nitrogen supplementation.",
      };
      setRecommendation(
        recommendations[issue] ||
          "Image processed. Please describe the issue for better recommendations."
      );
    }, 2000);
  };

  const handleIssueChange = (selectedIssue: string) => {
    setIssue(selectedIssue);
    setRecommendation("");

    const recommendations: { [key: string]: string } = {
      leaf: "Leaf spots/discoloration detected. Apply organic fungicide spray. Remove affected leaves. Ensure proper spacing for air circulation. Monitor daily.",
      pest: "Pest holes/insects detected. Use neem oil solution (5ml per liter) or consult local Krishi Seva Kendra for appropriate pesticide. Set up traps if needed.",
      yellow: "Yellowing of crop observed. Check soil pH and nutrient levels. May need nitrogen supplementation. Ensure proper irrigation schedule.",
      wilting: "Wilting detected. Check irrigation system. May indicate root rot - avoid over-watering. Ensure good drainage.",
      growth: "Stunted growth observed. Check soil fertility. Consider adding compost or organic manure. Verify seed quality.",
    };

    if (selectedIssue) {
      setRecommendation(recommendations[selectedIssue] || "Please describe the issue in detail for specific recommendations.");
    }
  };

  // Calculate spray dosage
  const calculateSprayDosage = () => {
    if (!sprayCrop || !sprayFieldSize || !sprayPesticide) {
      alert("Please fill all fields to calculate dosage");
      return;
    }

    const fieldSize = parseFloat(sprayFieldSize);
    if (isNaN(fieldSize) || fieldSize <= 0) {
      alert("Please enter a valid field size");
      return;
    }

    const cropData = sprayDosageData[sprayCrop];
    if (!cropData) {
      alert("Dosage data not available for this crop. Please consult local Krishi Seva Kendra.");
      return;
    }

    const pesticideLower = sprayPesticide.toLowerCase();
    let dosage = null;

    // Try to find matching pesticide (case-insensitive partial match)
    for (const [pesticideName, dosageInfo] of Object.entries(cropData)) {
      if (pesticideName.toLowerCase().includes(pesticideLower) || 
          pesticideLower.includes(pesticideName.toLowerCase())) {
        dosage = dosageInfo;
        break;
      }
    }

    if (!dosage) {
      // Use default safe dosage if pesticide not found
      const firstPesticide = Object.values(cropData)[0];
      dosage = firstPesticide;
      alert(`Exact dosage for "${sprayPesticide}" not found. Showing default dosage for ${sprayCrop}. Please verify with Krishi Seva Kendra.`);
    }

    let medicineMl: number;
    let waterLiters: number;

    if (sprayUnit === "acre") {
      medicineMl = Math.round(dosage.mlPerAcre * fieldSize);
      waterLiters = Math.round(dosage.waterPerAcre * fieldSize);
    } else {
      medicineMl = Math.round(dosage.mlPerHectare * fieldSize);
      waterLiters = Math.round(dosage.waterPerHectare * fieldSize);
    }

    setSprayResult({
      medicineMl,
      waterLiters,
      pesticide: sprayPesticide,
    });
  };

  // Get available pesticides for selected crop
  const getAvailablePesticides = () => {
    if (!sprayCrop) return [];
    const cropData = sprayDosageData[sprayCrop];
    return cropData ? Object.keys(cropData) : [];
  };

  return (
    <div className="krishisaathi-container">
      <div className="krishisaathi-header">
        <h2>🤖 KhetiSaathi - AI Guidance</h2>
        <p className="header-subtitle">
          Get instant guidance for crop issues and spray dosage calculations
        </p>
      </div>

      {/* Weather & Seasonal Advisory */}
      <div className="weather-section">
        <div className="weather-card">
          <div className="weather-header">
            <div className="weather-info">
              <div className="weather-icon">{seasonIcon}</div>
              <div>
                <h3 className="weather-title">Current Season</h3>
                <p className="weather-date">
                  {currentDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="season-badge" style={{ backgroundColor: `${seasonColor}20`, color: seasonColor }}>
              <span className="season-icon">{seasonIcon}</span>
              <span className="season-name">{season}</span>
            </div>
          </div>
          <div className="advisory-content">
            <h4>📋 Seasonal Advisory</h4>
            <p>{advisory}</p>
          </div>
        </div>
      </div>

      {/* Main Feature Cards - Side by Side */}
      {activeFeature === "none" && (
        <div className="feature-cards-grid">
          {/* Left Card - Crop Issue Detection */}
          <div 
            className="feature-card detection-feature-card"
            onClick={() => setActiveFeature("detection")}
          >
            <div className="feature-card-icon">📷</div>
            <h3 className="feature-card-title">Crop Issue Detection</h3>
            <p className="feature-card-description">
              Upload crop images to detect diseases and pests
            </p>
            <div className="feature-card-hint">
              <span>Tap to open →</span>
            </div>
          </div>

          {/* Right Card - Spray Guidance */}
          <div 
            className="feature-card spray-feature-card"
            onClick={() => setActiveFeature("spray")}
          >
            <div className="feature-card-icon">💧</div>
            <h3 className="feature-card-title">Spray Guidance</h3>
            <p className="feature-card-description">
              Calculate correct medicine and water dosage for your field
            </p>
            <div className="feature-card-hint">
              <span>Tap to open →</span>
            </div>
          </div>
        </div>
      )}

      {/* Crop Issue Detection Detail Screen */}
      {activeFeature === "detection" && (
        <div className="detail-screen">
          <button 
            className="back-button"
            onClick={() => {
              setActiveFeature("none");
              setIssue("");
              setRecommendation("");
              setImagePreview(null);
            }}
          >
            ← Back
          </button>
          <div className="detection-card">
            <h3 className="card-title">
              <span className="card-icon">📷</span>
              Crop Issue Detection
            </h3>
            <p className="card-subtitle">
              Upload an image of your crop or land to get AI-powered recommendations
            </p>

          <div className="upload-section">
            {!imagePreview ? (
              <div className="upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="file-input"
                  id="crop-image-upload"
                />
                <label htmlFor="crop-image-upload" className="upload-label">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">
                    {uploading ? "Processing..." : "Click to upload crop image"}
                  </span>
                  <span className="upload-hint">JPG, PNG (Max 5MB)</span>
                </label>
              </div>
            ) : (
              <div className="image-preview-section">
                <div className="preview-wrapper">
                  <img src={imagePreview} alt="Crop preview" className="preview-image" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setRecommendation("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
                {uploading && (
                  <div className="processing-indicator">
                    <div className="spinner"></div>
                    <span>Analyzing image...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="issue-selection">
            <label htmlFor="issue-select" className="select-label">
              Or select the issue you're observing:
            </label>
            <select
              id="issue-select"
              value={issue}
              onChange={(e) => handleIssueChange(e.target.value)}
              className="issue-select"
            >
              <option value="">Select observed issue</option>
              <option value="leaf">🌿 Leaf spots / discoloration</option>
              <option value="pest">🐛 Pest holes / insects</option>
              <option value="yellow">🌾 Yellowing of crop</option>
              <option value="wilting">🥀 Wilting / drooping</option>
              <option value="growth">📏 Stunted growth</option>
            </select>
          </div>

          {recommendation && (
            <div className="recommendation-card">
              <div className="recommendation-header">
                <span className="recommendation-icon">💡</span>
                <h4>Recommendations</h4>
              </div>
              <div className="recommendation-content">
                <p>{recommendation}</p>
                <div className="recommendation-footer">
                  <span className="footer-icon">ℹ️</span>
                  <span>
                    For severe issues, consult your local Krishi Seva Kendra or agricultural expert
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Spray Guidance Detail Screen */}
      {activeFeature === "spray" && (
        <div className="detail-screen">
          <button 
            className="back-button"
            onClick={() => {
              setActiveFeature("none");
              setSprayResult(null);
              setSprayCrop("");
              setSprayFieldSize("");
              setSprayPesticide("");
            }}
          >
            ← Back
          </button>
          <div className="spray-guidance-card">
            <h3 className="card-title">
              <span className="card-icon">💧</span>
              Spray Guidance
            </h3>
            <p className="card-subtitle">
              Calculate the correct dosage of medicine and water for your field size
            </p>

            <div className="spray-guidance-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="spray-crop" className="form-label">
                    <span className="form-icon">🌾</span>
                    Select Crop Type
                  </label>
          <select
                    id="spray-crop"
                    value={sprayCrop}
                    onChange={(e) => {
                      setSprayCrop(e.target.value);
                      setSprayPesticide("");
                      setSprayResult(null);
                    }}
                    className="form-select"
                  >
                    <option value="">Choose your crop</option>
                    {commonCrops.map((crop) => (
                      <option key={crop.value} value={crop.value}>
                        {crop.label}
                      </option>
                    ))}
          </select>
                </div>

                <div className="form-group">
                  <label htmlFor="spray-unit" className="form-label">
                    <span className="form-icon">📏</span>
                    Field Size Unit
                  </label>
                  <div className="unit-selector">
                    <button
                      type="button"
                      className={`unit-btn ${sprayUnit === "acre" ? "active" : ""}`}
                      onClick={() => setSprayUnit("acre")}
                    >
                      Acre
                    </button>
                    <button
                      type="button"
                      className={`unit-btn ${sprayUnit === "hectare" ? "active" : ""}`}
                      onClick={() => setSprayUnit("hectare")}
                    >
                      Hectare
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="spray-size" className="form-label">
                  <span className="form-icon">📐</span>
                  Field Size ({sprayUnit === "acre" ? "Acre" : "Hectare"})
                </label>
                <input
                  id="spray-size"
                  type="number"
                  value={sprayFieldSize}
                  onChange={(e) => {
                    setSprayFieldSize(e.target.value);
                    setSprayResult(null);
                  }}
                  placeholder={`Enter field size in ${sprayUnit === "acre" ? "acres" : "hectares"}`}
                  className="form-input"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="spray-pesticide" className="form-label">
                  <span className="form-icon">🧪</span>
                  Medicine / Pesticide Name
                </label>
                <input
                  id="spray-pesticide"
                  type="text"
                  value={sprayPesticide}
                  onChange={(e) => {
                    setSprayPesticide(e.target.value);
                    setSprayResult(null);
                  }}
                  placeholder="e.g., Cypermethrin, Carbendazim, Monocrotophos..."
                  className="form-input"
                  list="pesticide-suggestions"
                />
                <datalist id="pesticide-suggestions">
                  {sprayCrop && getAvailablePesticides().map((pesticide) => (
                    <option key={pesticide} value={pesticide} />
                  ))}
                </datalist>
                {sprayCrop && (
                  <p className="input-hint">
                    💡 Suggestions: {getAvailablePesticides().slice(0, 3).join(", ")}
                    {getAvailablePesticides().length > 3 && "..."}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={calculateSprayDosage}
                className="calculate-btn"
                disabled={!sprayCrop || !sprayFieldSize || !sprayPesticide}
              >
                <span>🧮</span>
                Calculate Dosage
              </button>

              {sprayResult && (
                <div className="spray-result-card">
                  <div className="result-header">
                    <span className="result-icon">✅</span>
                    <h4>Recommended Dosage</h4>
                  </div>
                  <div className="result-content">
                    <div className="result-item medicine-result">
                      <div className="result-label">
                        <span className="result-item-icon">💊</span>
                        Medicine Required
                      </div>
                      <div className="result-value">
                        <span className="result-number">{sprayResult.medicineMl}</span>
                        <span className="result-unit">ml</span>
                      </div>
                    </div>
                    <div className="result-item water-result">
                      <div className="result-label">
                        <span className="result-item-icon">💧</span>
                        Water for Mixing
                      </div>
                      <div className="result-value">
                        <span className="result-number">{sprayResult.waterLiters}</span>
                        <span className="result-unit">liters</span>
                      </div>
                    </div>
                    <div className="result-summary">
                      <p>
                        <strong>Mix {sprayResult.medicineMl} ml of {sprayResult.pesticide}</strong> with{" "}
                        <strong>{sprayResult.waterLiters} liters of water</strong> for your{" "}
                        {sprayFieldSize} {sprayUnit === "acre" ? "acre" : "hectare"} field.
                      </p>
                    </div>
                    <div className="result-warning">
                      <span className="warning-icon">⚠️</span>
                      <p>
                        Always follow safety guidelines. Wear protective gear while spraying.
                        Consult local Krishi Seva Kendra if unsure.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}