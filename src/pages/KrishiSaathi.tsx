import { useState, useRef } from "react";
import "./KrishiSaathi.css";

export default function KrishiSaathi() {
  const [issue, setIssue] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="krishisaathi-container">
      <div className="krishisaathi-header">
        <h2>🤖 KhetiSaathi - AI Guidance</h2>
        <p className="header-subtitle">
          Get instant guidance for crop issues, weather updates, and seasonal farming advice
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

      {/* Crop Issue Detection */}
      <div className="detection-section">
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
    </div>
  );
}