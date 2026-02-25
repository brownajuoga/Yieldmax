export default function Dashboard({ user, onNavigate }) {
  return (
    <div className="dashboard">
      <div className="section-title">Your Dashboard</div>
      <div className="section-sub">Manage your farm's organic waste and get support.</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">🚛</div>
          <div className="stat-label">Pending Pickups</div>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌿</div>
          <div className="stat-label">Nutrients Saved (kg)</div>
          <div className="stat-value">0</div>
        </div>
      </div>
      <div className="action-cards">
        <div className="action-card" onClick={() => onNavigate("diagnosis")}>
          <div className="action-card-icon">🔍</div>
          <div className="action-card-title">Crop Diagnosis</div>
          <div className="action-card-desc">AI-powered diagnosis of crop issues based on symptoms and soil conditions.</div>
        </div>
        <div className="action-card" onClick={() => onNavigate("qa")}>
          <div className="action-card-icon">🧑‍🌾</div>
          <div className="action-card-title">Farming Help Centre</div>
          <div className="action-card-desc">Get answers to common farming issues — works offline too. Covers soil health, manure, pests & more.</div>
        </div>
        <div className="action-card" onClick={() => onNavigate("compost")}>
          <div className="action-card-icon">📦</div>
          <div className="action-card-title">Compost Calculator</div>
          <div className="action-card-desc">Get customized composting plans based on your organic waste inputs.</div>
        </div>
        <div className="action-card" onClick={() => onNavigate("reports")}>
          <div className="action-card-icon">📊</div>
          <div className="action-card-title">Field Reports</div>
          <div className="action-card-desc">Submit and track field reports for your farming activities.</div>
        </div>
      </div>
    </div>
  );
}
