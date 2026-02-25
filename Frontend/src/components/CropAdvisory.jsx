import { useState } from "react";
import { getAdvisory, getKnowledgeByCrop } from "../services/api";

const CROP_OPTIONS = [
  "Tomato",
  "Lettuce",
  "Pepper",
  "Maize",
  "Cabbage",
  "Beans",
  "Kale",
  "Carrots",
  "Onions",
  "Potatoes",
  "Spinach",
  "Other",
];

const SYMPTOM_OPTIONS = [
  { label: "Yellowing lower leaves", value: "yellow_lower_leaves" },
  { label: "Yellow leaf edges", value: "yellow_leaf_edges" },
  { label: "Interveinal yellowing", value: "interveinal_yellowing" },
  { label: "Purple leaves", value: "purple_leaves" },
  { label: "Poor root growth", value: "poor_root_growth" },
  { label: "Blossom end rot", value: "blossom_end_rot" },
  { label: "Leaf edge browning", value: "leaf_edge_browning" },
  { label: "Weak stems", value: "weak_stems" },
  { label: "Stunted growth", value: "stunted_growth" },
  { label: "Leaf spots", value: "leaf_spots" },
  { label: "Poor flowering", value: "poor_flowering" },
  { label: "Leaf curling", value: "leaf_curling" },
  { label: "Pale green color", value: "pale_green_color" },
  { label: "Poor fruit set", value: "poor_fruit_set" },
  { label: "Wilting", value: "wilting" },
  { label: "Slow growth", value: "slow_growth" },
];

const MANURE_TYPES = [
  "Cattle manure",
  "Poultry manure",
  "Goat/sheep manure",
  "Compost",
  "Green manure",
  "Not sure",
];

export default function CropAdvisory({ onBack }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    crop: "",
    growth_stage: "",
    symptoms: [],
    soil_ph: "",
    soil_condition: "",
    current_manure: "",
    last_application: "",
  });
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSymptom = (symptomValue) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomValue)
        ? prev.symptoms.filter((s) => s !== symptomValue)
        : [...prev.symptoms, symptomValue],
    }));
  };

  const handleGetAdvisory = async () => {
    if (!formData.crop) {
      setError("Please select a crop");
      return;
    }

    setLoading(true);
    setError("");
    setAdvisory(null);

    try {
      // First get crop-specific knowledge (use lowercase for backend matching)
      const knowledgeData = await getKnowledgeByCrop(formData.crop.toLowerCase());

      // Then get diagnosis if symptoms provided
      let diagnosisData = null;
      if (formData.symptoms.length > 0) {
        const payload = {
          crop: formData.crop.toLowerCase(),
          symptom: formData.symptoms[0], // Backend expects single symptom
          soil_conditions: {
            ph: formData.soil_ph || undefined,
            condition: formData.soil_condition || undefined,
          },
        };
        diagnosisData = await getAdvisory(payload);
      }

      setAdvisory({
        crop: formData.crop,
        knowledge: knowledgeData,
        diagnosis: diagnosisData,
      });
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to get advisory. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      crop: "",
      growth_stage: "",
      symptoms: [],
      soil_ph: "",
      soil_condition: "",
      current_manure: "",
      last_application: "",
    });
    setAdvisory(null);
    setStep(1);
    setError("");
  };

  return (
    <div className="dashboard">
      <button onClick={onBack} className="btn-outline" style={{ marginBottom: "1rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
        ← Back to Dashboard
      </button>
      <div className="section-title">Crop Advisory</div>
      <div className="section-sub">
        Get personalized manure recommendations based on your crop type, growth stage, and current condition.
      </div>

      {/* Progress Steps */}
      <div style={{ display: "flex", marginBottom: "2rem", gap: "0.5rem" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: "4px",
              background: s <= step ? "var(--moss)" : "var(--parchment)",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>

      {error && (
        <div className="error-msg" style={{ marginBottom: "1rem" }}>
          ⚠ {error}
        </div>
      )}

      {/* Step 1: Crop & Growth Stage */}
      {step === 1 && (
        <div className="custom-question-box">
          <div className="cq-title" style={{ marginBottom: "1rem" }}>🌱 Step 1: Crop Information</div>
          
          <div className="form-group">
            <label className="form-label">Select Crop *</label>
            <select
              className="form-select"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            >
              <option value="">Choose your crop...</option>
              {CROP_OPTIONS.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Growth Stage</label>
            <select
              className="form-select"
              value={formData.growth_stage}
              onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
            >
              <option value="">Select stage...</option>
              <option value="planting">Planting/Seedling</option>
              <option value="vegetative">Vegetative Growth</option>
              <option value="flowering">Flowering</option>
              <option value="fruiting">Fruiting/Pod Development</option>
              <option value="maturing">Maturing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Current Manure/Fertilizer Use</label>
            <select
              className="form-select"
              value={formData.current_manure}
              onChange={(e) => setFormData({ ...formData, current_manure: e.target.value })}
            >
              <option value="">Select...</option>
              {MANURE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="chemical">Chemical Fertilizer</option>
              <option value="none">None</option>
            </select>
          </div>

          <button 
            className="btn-full" 
            onClick={() => setStep(2)}
            disabled={!formData.crop}
          >
            Next: Crop Condition →
          </button>
        </div>
      )}

      {/* Step 2: Symptoms & Soil */}
      {step === 2 && (
        <div className="custom-question-box">
          <div className="cq-title" style={{ marginBottom: "1rem" }}>🔍 Step 2: Crop Condition</div>
          
          <div className="form-group">
            <label className="form-label">Observed Symptoms (select all that apply)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label key={symptom.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom.value)}
                    onChange={() => toggleSymptom(symptom.value)}
                  />
                  {symptom.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Soil pH (if known)</label>
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
                <option value="normal">Normal/Healthy</option>
                <option value="compacted">Compacted/Hard</option>
                <option value="waterlogged">Waterlogged</option>
                <option value="dry">Very Dry</option>
                <option value="sandy">Sandy</option>
                <option value="clay">Heavy Clay</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button 
              className="btn-outline" 
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
            <button 
              className="btn-full" 
              onClick={handleGetAdvisory}
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? "Analyzing..." : "Get Advisory"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && advisory && (
        <>
          <div className="custom-question-box" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div className="cq-title">📋 Advisory for {advisory.crop}</div>
              <button className="cq-btn" onClick={resetForm} style={{ background: "var(--bark)" }}>
                Start Over
              </button>
            </div>

            {/* Crop Knowledge */}
            {advisory.knowledge && advisory.knowledge.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🌱</span>
                  <strong style={{ color: "var(--soil)" }}>General Crop Guidance</strong>
                </div>
                {advisory.knowledge.map((item, i) => (
                  <div key={i} style={{ background: "white", padding: "1rem", borderRadius: "8px", marginBottom: "0.5rem" }}>
                    <p style={{ fontWeight: "500", marginBottom: "0.3rem" }}>
                      {item.crop ? `Crop: ${item.crop}` : item.recommendation}
                    </p>
                    {item.nutrient && <p style={{ fontSize: "0.85rem", color: "var(--bark)" }}>Nutrient: {item.nutrient}</p>}
                    {item.sources && <p style={{ fontSize: "0.85rem", color: "var(--bark)" }}>Sources: {item.sources.join(", ")}</p>}
                    {item.preparation && <p style={{ fontSize: "0.85rem", color: "var(--bark)" }}>Preparation: {item.preparation}</p>}
                    {item.application && <p style={{ fontSize: "0.85rem", color: "var(--bark)" }}>Application: {item.application}</p>}
                    {item.notes && <p style={{ fontSize: "0.85rem", color: "var(--bark)" }}>Notes: {item.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Diagnosis Results */}
            {advisory.diagnosis && advisory.diagnosis.diagnosis && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🔍</span>
                  <strong style={{ color: "var(--soil)" }}>Diagnosis Results</strong>
                </div>
                <div style={{ background: "var(--mist)", padding: "1rem", borderRadius: "8px" }}>
                  <p><strong>Detected Issue:</strong> {advisory.diagnosis.diagnosis.nutrient || "Nutrient deficiency"}</p>
                  {advisory.diagnosis.diagnosis.actions && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <strong>Recommended Actions:</strong>
                      <ul style={{ margin: "0.5rem 0 0 1.2rem", fontSize: "0.9rem" }}>
                        {advisory.diagnosis.diagnosis.actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manure Recommendation Card */}
          <div className="custom-question-box" style={{ border: "2px solid var(--moss)" }}>
            <div className="cq-title" style={{ marginBottom: "1rem", color: "var(--moss)" }}>
              💩 Recommended Manure Application
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--bark)", marginBottom: "0.5rem" }}>Best Option</p>
                <p style={{ fontWeight: "600", fontSize: "1.1rem", color: "var(--soil)" }}>
                  {advisory.diagnosis?.diagnosis?.nutrient?.toLowerCase()?.includes("nitrogen")
                    ? "🐔 Poultry Manure or Leafy Compost (High Nitrogen)"
                    : advisory.diagnosis?.diagnosis?.nutrient?.toLowerCase()?.includes("potassium")
                    ? "🍌 Banana Peel Compost or Wood Ash (High Potassium)"
                    : advisory.diagnosis?.diagnosis?.nutrient?.toLowerCase()?.includes("calcium")
                    ? "🥚 Crushed Eggshells or Limestone (Calcium)"
                    : advisory.diagnosis?.diagnosis?.nutrient?.toLowerCase()?.includes("phosphorus")
                    ? "🦴 Bone Meal or Fish Waste (Phosphorus)"
                    : advisory.diagnosis?.diagnosis?.nutrient?.toLowerCase()?.includes("magnesium")
                    ? "🌿 Dolomite or Epsom Salt (Magnesium)"
                    : "🐄 Well-composted Cattle Manure"}
                </p>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--bark)", marginBottom: "0.5rem" }}>Application Rate</p>
                <p style={{ fontWeight: "500" }}>
                  {advisory.crop?.toLowerCase() === "maize" || advisory.crop?.toLowerCase() === "sorghum"
                    ? "8-10 tons per hectare (or 2 wheelbarrows per 10m²)"
                    : "5-8 tons per hectare (or 1-2 wheelbarrows per 10m²)"}
                </p>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--bark)", marginBottom: "0.5rem" }}>Best Time to Apply</p>
                <p style={{ fontWeight: "500" }}>
                  {formData.growth_stage === "planting"
                    ? "Apply 2-3 weeks before planting and incorporate into soil"
                    : formData.growth_stage === "flowering"
                    ? "Apply as side dressing around the plant base"
                    : "Apply during land preparation, at least 2 weeks before planting"}
                </p>
              </div>

              {advisory.diagnosis?.diagnosis?.actions && (
                <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--bark)", marginBottom: "0.5rem" }}>Recommended Actions</p>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
                    {advisory.diagnosis.diagnosis.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {step === 3 && !advisory && (
        <div className="custom-question-box">
          <p>No advisory available. Please try again with different inputs.</p>
          <button className="btn-full" onClick={resetForm} style={{ marginTop: "1rem" }}>
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
