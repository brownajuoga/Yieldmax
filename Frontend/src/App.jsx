import { useState } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import FarmingQA from "./components/FarmingQA";
import Diagnosis from "./components/Diagnosis";
import CompostCalculator from "./components/CompostCalculator";
import Reports from "./components/Reports";
import "./index.css";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(() => {
    const s = sessionStorage.getItem("activeUser");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState("dashboard");

  const handleLogin = (u) => {
    sessionStorage.setItem("activeUser", JSON.stringify(u));
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("activeUser");
    setUser(null);
    setPage("dashboard");
  };

  const renderPage = () => {
    switch (page) {
      case "diagnosis":
        return <Diagnosis />;
      case "compost":
        return <CompostCalculator />;
      case "reports":
        return <Reports />;
      case "qa":
        return <FarmingQA />;
      default:
        return <Dashboard user={user} onNavigate={setPage} />;
    }
  };

  return (
    <>
      {!user ? (
        <div className="landing">
          <nav className="nav">
            <div className="logo"><span className="logo-icon">🌿</span> NutriManure</div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-outline" onClick={() => setShowAuth(true)}>Login</button>
              <button className="btn-primary" onClick={() => setShowAuth(true)}>Create Account</button>
            </div>
          </nav>

          <div className="hero">
            <div className="badge">🇰🇪 Sustainable Farming Platform</div>
            <h1 className="hero-title">
              Turn Manure Into <span>Nutrients</span>, Not Waste
            </h1>
            <p className="hero-sub">
              A centralized platform connecting farmers for organic manure collection — reducing fertilizer dependency and promoting sustainable soil health.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setShowAuth(true)}>Get Started Free →</button>
              <button className="btn-outline" onClick={() => setShowAuth(true)}>Farmer Login</button>
            </div>
            <div className="features">
              <div className="feature-pill">♻️ Organic Waste Reduction</div>
              <div className="feature-pill">🧪 NPK Nutrient Tracking</div>
              <div className="feature-pill">📶 Works Offline</div>
              <div className="feature-pill">🚜 Pickup Scheduling</div>
            </div>
          </div>

          <div className="footer-bar">© 2025 NutriManure · Sustainable Farming Initiative</div>

          {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
        </div>
      ) : (
        <div className="app-shell">
          <nav className="app-nav">
            <div className="app-logo"><span>🌿</span> NutriManure</div>
            <div className="app-nav-links">
              <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Dashboard</button>
              <button className={`nav-btn ${page === "diagnosis" ? "active" : ""}`} onClick={() => setPage("diagnosis")}>Diagnosis</button>
              <button className={`nav-btn ${page === "compost" ? "active" : ""}`} onClick={() => setPage("compost")}>Compost</button>
              <button className={`nav-btn ${page === "reports" ? "active" : ""}`} onClick={() => setPage("reports")}>Reports</button>
              <button className={`nav-btn ${page === "qa" ? "active" : ""}`} onClick={() => setPage("qa")}>Help</button>
              <button className="nav-btn logout" onClick={handleLogout}>Sign Out</button>
            </div>
          </nav>
          <div className="greeting-bar">
            👋 Hello, <strong>{user.name}</strong> — {user.farm}{user.location ? ` · ${user.location}` : ""}
          </div>
          {renderPage()}
        </div>
      )}
    </>
  );
}
