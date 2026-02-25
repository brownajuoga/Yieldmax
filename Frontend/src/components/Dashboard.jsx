export default function Dashboard({ user, onNavigate }) {
  return (
    <div className="dashboard">
      <div className="section-title">Welcome to Your Farm Assistant</div>
      <div className="section-sub">
        Get personalized advice for your crops and learn about proper manure application.
      </div>
      
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-label">Growing Season</div>
          <div className="stat-value">2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💩</div>
          <div className="stat-label">Manure Guide</div>
          <div className="stat-value">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-label">Crop Advice</div>
          <div className="stat-value">Available</div>
        </div>
      </div>

      <div className="action-cards">
        <div className="action-card" onClick={() => onNavigate("advisory")}>
          <div className="action-card-icon">🌽</div>
          <div className="action-card-title">Get Crop Advisory</div>
          <div className="action-card-desc">Tell us about your crop and get personalized manure recommendations with application timing.</div>
        </div>
        <div className="action-card" onClick={() => onNavigate("farm")}>
          <div className="action-card-icon">📋</div>
          <div className="action-card-title">Register My Farm</div>
          <div className="action-card-desc">Input your farm details and crops to track your farming activities.</div>
        </div>
      </div>
    </div>
  );
}
