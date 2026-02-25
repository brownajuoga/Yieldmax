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
        <div className="action-card" onClick={() => onNavigate("qa")}>
          <div className="action-card-icon">🧑‍🌾</div>
          <div className="action-card-title">Farming Help Centre</div>
          <div className="action-card-desc">Get answers to common farming issues — works offline too. Covers soil health, manure, pests & more.</div>
        </div>
        <div className="action-card">
          <div className="action-card-icon">📦</div>
          <div className="action-card-title">Submit Collection Request</div>
          <div className="action-card-desc">Log available manure for pickup. Specify type, volume, and location.</div>
        </div>
        <div className="action-card">
          <div className="action-card-icon">📊</div>
          <div className="action-card-title">Nutrient Calculator</div>
          <div className="action-card-desc">Estimate the NPK value of your manure before it's collected and processed.</div>
        </div>
      </div>
    </div>
  );
}
