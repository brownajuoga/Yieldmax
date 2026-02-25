import { useState, useEffect } from "react";
import { submitReport, getReports } from "../services/api";

export default function Reports() {
  const [formData, setFormData] = useState({
    farm_name: "",
    location: "",
    crop_type: "",
    area_size: "",
    area_unit: "acres",
    issue_description: "",
    actions_taken: "",
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farm_name || !formData.crop_type) {
      setError("Please fill in farm name and crop type");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await submitReport(formData);
      setSuccess("Report submitted successfully!");
      setFormData({
        farm_name: "",
        location: "",
        crop_type: "",
        area_size: "",
        area_unit: "acres",
        issue_description: "",
        actions_taken: "",
      });
      loadReports();
    } catch (err) {
      setError(err.message || "Failed to submit report. Ensure backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="section-title">Field Reports</div>
      <div className="section-sub">
        Submit and view field reports to track farming activities and issues.
      </div>

      <div className="custom-question-box" style={{ marginBottom: "1.5rem" }}>
        <div className="cq-title" style={{ marginBottom: "1rem" }}>Submit New Report</div>
        
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
              <label className="form-label">Location</label>
              <input
                className="form-input"
                placeholder="Nakuru, Rift Valley"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <input
                className="form-input"
                placeholder="Maize"
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area Size</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  className="form-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="5"
                  value={formData.area_size}
                  onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                />
                <select
                  className="form-select"
                  style={{ width: "100px" }}
                  value={formData.area_unit}
                  onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                >
                  <option value="acres">acres</option>
                  <option value="hectares">hectares</option>
                  <option value="sqm">sq meters</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Description</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Describe any issues or observations..."
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Actions Taken</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="What actions have you taken so far?"
              value={formData.actions_taken}
              onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}
          {success && (
            <div className="success-box" style={{ marginBottom: "1rem" }}>
              <div className="success-icon">✓</div>
              <div className="success-title">{success}</div>
            </div>
          )}

          <button className="btn-full" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      <div className="custom-question-box">
        <div className="cq-title" style={{ marginBottom: "1rem" }}>
          📄 Submitted Reports
        </div>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--bark)" }}>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--bark)", opacity: 0.7 }}>
            No reports yet. Submit your first report above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {reports.map((report, i) => (
              <div
                key={i}
                className="qa-item"
                style={{ padding: "1rem", background: "white", borderRadius: "8px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "var(--soil)" }}>{report.farm_name || report.farm_name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--bark)", background: "var(--mist)", padding: "0.2rem 0.6rem", borderRadius: "100px" }}>
                    {new Date(report.timestamp || report.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--bark)" }}>
                  {report.crop_type && <p><strong>Crop:</strong> {report.crop_type}</p>}
                  {report.location && <p><strong>Location:</strong> {report.location}</p>}
                  {report.area_size && <p><strong>Area:</strong> {report.area_size} {report.area_unit}</p>}
                  {report.issue_description && <p style={{ marginTop: "0.5rem" }}>{report.issue_description}</p>}
                  {report.actions_taken && <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}><strong>Actions:</strong> {report.actions_taken}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
