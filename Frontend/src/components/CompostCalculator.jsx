import { useState } from "react";
import { getCompostPlan } from "../services/api";

const WASTE_TYPES = [
  "Cattle manure",
  "Poultry manure",
  "Goat/sheep manure",
  "Crop residues",
  "Kitchen waste",
  "Grass clippings",
  "Leaves",
  "Sawdust",
];

const ADDITIVE_OPTIONS = [
  "Lime",
  "Wood ash",
  "Rock phosphate",
  "Compost starter",
  "Molasses",
];

export default function CompostCalculator() {
  const [formData, setFormData] = useState({
    waste_type: "",
    quantity: "",
    quantity_unit: "kg",
    additives: [],
    moisture_level: "medium",
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAdditive = (additive) => {
    setFormData((prev) => ({
      ...prev,
      additives: prev.additives.includes(additive)
        ? prev.additives.filter((a) => a !== additive)
        : [...prev.additives, additive],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.waste_type || !formData.quantity) {
      setError("Please select waste type and enter quantity");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const payload = {
        waste_type: formData.waste_type,
        quantity: parseFloat(formData.quantity),
        quantity_unit: formData.quantity_unit,
        additives: formData.additives,
        moisture_level: formData.moisture_level,
      };

      const data = await getCompostPlan(payload);
      setPlan(data);
    } catch (err) {
      setError(err.message || "Failed to get compost plan. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="section-title">Compost Calculator</div>
      <div className="section-sub">
        Get a customized composting plan based on your organic waste inputs.
      </div>

      <div className="custom-question-box" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Waste Type</label>
              <select
                className="form-select"
                value={formData.waste_type}
                onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
              >
                <option value="">Select type...</option>
                {WASTE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                <select
                  className="form-select"
                  style={{ width: "100px" }}
                  value={formData.quantity_unit}
                  onChange={(e) => setFormData({ ...formData, quantity_unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="wheelbarrow">wheelbarrows</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additives (optional)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
              {ADDITIVE_OPTIONS.map((additive) => (
                <label key={additive} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.additives.includes(additive)}
                    onChange={() => toggleAdditive(additive)}
                  />
                  {additive}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Moisture Level</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              {[
                { value: "low", label: "Low (Dry)" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High (Wet)" },
              ].map((opt) => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    name="moisture"
                    checked={formData.moisture_level === opt.value}
                    onChange={() => setFormData({ ...formData, moisture_level: opt.value })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <button className="btn-full" type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Get Compost Plan"}
          </button>
        </form>
      </div>

      {plan && (
        <div className="custom-question-box">
          <div className="cq-title" style={{ marginBottom: "1rem" }}>
            📋 Your Composting Plan
          </div>
          
          <div style={{ display: "grid", gap: "1rem" }}>
            {plan.steps && Array.isArray(plan.steps) ? (
              plan.steps.map((step, i) => (
                <div key={i} style={{ background: "white", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--moss)" }}>
                  <strong>Step {i + 1}:</strong> {step}
                </div>
              ))
            ) : (
              <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.9rem" }}>
                  {JSON.stringify(plan, null, 2)}
                </pre>
              </div>
            )}
            
            {plan.duration && (
              <div style={{ background: "var(--mist)", padding: "1rem", borderRadius: "8px" }}>
                <strong>⏱️ Estimated Duration:</strong> {plan.duration}
              </div>
            )}
            
            {plan.npk_value && (
              <div style={{ background: "var(--mist)", padding: "1rem", borderRadius: "8px" }}>
                <strong>🧪 Expected NPK Value:</strong> {plan.npk_value}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
