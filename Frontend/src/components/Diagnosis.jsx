import { useState } from "react";
import { diagnose, getAdvisory } from "../services/api";

const SYMPTOM_OPTIONS = [
  "Yellowing leaves",
  "Wilting",
  "Stunted growth",
  "Leaf spots",
  "Root rot",
  "Poor flowering",
  "Leaf curling",
  "Chlorosis",
  "Necrosis",
  "Poor fruit set",
];

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
  "Other",
];

export default function Diagnosis() {
  const [formData, setFormData] = useState({
    crop: "",
    symptoms: [],
    soil_ph: "",
    soil_condition: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("diagnosis"); // "diagnosis" or "advisory"

  const toggleSymptom = (symptom) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.crop || formData.symptoms.length === 0) {
      setError("Please select a crop and at least one symptom");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        crop: formData.crop,
        symptoms: formData.symptoms,
        soil_conditions: {
          ph: formData.soil_ph || undefined,
          condition: formData.soil_condition || undefined,
        },
      };

      const data = mode === "advisory" 
        ? await getAdvisory(payload)
        : await diagnose(payload);
      
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to get diagnosis. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="section-title">Crop Diagnosis</div>
      <div className="section-sub">
        Select your crop and symptoms to get a diagnosis from the backend AI.
      </div>

      <div className="custom-question-box" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            className={`cq-btn ${mode === "diagnosis" ? "" : "cq-btn"}`}
            onClick={() => setMode("diagnosis")}
            style={{ background: mode === "diagnosis" ? "var(--moss)" : "transparent", border: "1.5px solid var(--moss)" }}
          >
            Diagnosis Only
          </button>
          <button
            className="cq-btn"
            onClick={() => setMode("advisory")}
            style={{ background: mode === "advisory" ? "var(--moss)" : "transparent", border: "1.5px solid var(--moss)" }}
          >
            Full Advisory
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Crop</label>
            <select
              className="form-select"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            >
              <option value="">Select crop...</option>
              {CROP_OPTIONS.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Symptoms (select all that apply)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.5rem" }}>
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label key={symptom} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Soil pH (optional)</label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="3"
                max="10"
                placeholder="6.5"
                value={formData.soil_ph}
                onChange={(e) => setFormData({ ...formData, soil_ph: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Soil Condition</label>
              <select
                className="form-select"
                value={formData.soil_condition}
                onChange={(e) => setFormData({ ...formData, soil_condition: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="normal">Normal</option>
                <option value="compacted">Compacted</option>
                <option value="waterlogged">Waterlogged</option>
                <option value="dry">Dry</option>
                <option value="sandy">Sandy</option>
                <option value="clay">Clay</option>
              </select>
            </div>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <button className="btn-full" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : mode === "advisory" ? "Get Full Advisory" : "Diagnose"}
          </button>
        </form>
      </div>

      {result && (
        <div className="custom-question-box">
          <div className="cq-title" style={{ marginBottom: "1rem" }}>
            {mode === "advisory" ? "📋 Advisory Report" : "🔍 Diagnosis Result"}
          </div>
          
          {mode === "advisory" ? (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Diagnosis:</strong>
                <div style={{ background: "white", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
                  <p><strong>Nutrient:</strong> {result.diagnosis?.nutrient || "N/A"}</p>
                  <p><strong>Confidence:</strong> {result.diagnosis?.confidence ? `${(result.diagnosis.confidence * 100).toFixed(0)}%` : "N/A"}</p>
                  <p><strong>Recommendation:</strong> {result.diagnosis?.recommendation || "N/A"}</p>
                </div>
              </div>
              <div>
                <strong>Guidance:</strong>
                {result.guidance?.map((g, i) => (
                  <div key={i} style={{ background: "white", padding: "1rem", borderRadius: "8px", marginTop: "0.5rem" }}>
                    <p><strong>{g.title}</strong></p>
                    {g.description && <p style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>{g.description}</p>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
              <p><strong>Nutrient Deficiency:</strong> {result.nutrient || "N/A"}</p>
              <p><strong>Confidence:</strong> {result.confidence ? `${(result.confidence * 100).toFixed(0)}%` : "N/A"}</p>
              <p><strong>Recommendation:</strong> {result.recommendation || "N/A"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
