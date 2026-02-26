import { useState, useEffect } from "react";
import { getFarmsList, createFarm } from "../services/api";

const CROP_OPTIONS = [
  "Maize",
  "Tomatoes",
  "Cabbage",
  "Beans",
  "Wheat",
  "Sorghum",
  "Kale",
  "Carrots",
  "Onions",
  "Potatoes",
  "Spinach",
  "Peppers",
  "Other",
];

const SOIL_TYPES = [
  "Loamy",
  "Clay",
  "Sandy",
  "Silt",
  "Peaty",
  "Chalky",
];

export default function MyFarm({ onBack }) {
  const [formData, setFormData] = useState({
    farm_name: "",
    location: "",
    county: "",
    farm_size: "",
    size_unit: "acres",
    soil_type: "",
    crops: [],
  });
  const [savedFarms, setSavedFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await getFarmsList();
      setSavedFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCrop = (crop) => {
    setFormData((prev) => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter((c) => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farm_name || !formData.location || formData.crops.length === 0) {
      setError("Please fill in farm name, location, and select at least one crop");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createFarm({
        name: formData.farm_name,
        type: formData.crops.join(", "),
        location: `${formData.location}${formData.county ? `, ${formData.county}` : ""}`,
        size: parseFloat(formData.farm_size) || 0,
        size_unit: formData.size_unit,
        soil_type: formData.soil_type,
        crops: formData.crops,
      });
      setSuccess("Farm information saved successfully!");
      setFormData({
        farm_name: "",
        location: "",
        county: "",
        farm_size: "",
        size_unit: "acres",
        soil_type: "",
        crops: [],
      });
      loadFarms();
    } catch (err) {
      setError(err.message || "Failed to save farm information. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <button onClick={onBack} className="btn-outline" style={{ marginBottom: "1rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
        ← Back to Dashboard
      </button>
      <div className="section-title">My Farm</div>
      <div className="section-sub">
        Register your farm details to get personalized crop advice and manure recommendations.
      </div>

      <div className="custom-question-box" style={{ marginBottom: "1.5rem" }}>
        <div className="cq-title" style={{ marginBottom: "1rem" }}>📋 Farm Registration</div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Farm Name *</label>
              <input
                className="form-input"
                placeholder="Green Valley Farm"
                value={formData.farm_name}
                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                className="form-input"
                placeholder="e.g. Nakuru Town"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">County</label>
              <input
                className="form-input"
                placeholder="e.g. Nakuru"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Farm Size</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="form-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="5"
                  value={formData.farm_size}
                  onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
                />
                <select
                  className="form-select"
                  style={{ width: "100px" }}
                  value={formData.size_unit}
                  onChange={(e) => setFormData({ ...formData, size_unit: e.target.value })}
                >
                  <option value="acres">acres</option>
                  <option value="hectares">hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Soil Type</label>
            <select
              className="form-select"
              value={formData.soil_type}
              onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
            >
              <option value="">Select soil type...</option>
              {SOIL_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Crops Growing *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
              {CROP_OPTIONS.map((crop) => (
                <label key={crop} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.crops.includes(crop)}
                    onChange={() => toggleCrop(crop)}
                  />
                  {crop}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}
          {success && (
            <div className="success-box" style={{ marginBottom: "1rem" }}>
              <div className="success-icon">✓</div>
              <div className="success-title">{success}</div>
            </div>
          )}

          <button className="btn-full" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Farm Information"}
          </button>
        </form>
      </div>

      {savedFarms.length > 0 && (
        <div className="custom-question-box">
          <div className="cq-title" style={{ marginBottom: "1rem" }}>
            📄 Registered Farms
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {savedFarms.map((farm, i) => (
              <div
                key={i}
                className="stat-card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "var(--soil)", fontSize: "1.1rem" }}>{farm.name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--bark)", background: "var(--mist)", padding: "0.2rem 0.6rem", borderRadius: "100px" }}>
                    {new Date(farm.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--bark)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <p><strong>Location:</strong> {farm.location}</p>
                  <p><strong>Type:</strong> {farm.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
