import { useState } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import MyFarm from "./components/MyFarm";
import CropAdvisory from "./components/CropAdvisory";
import "./index.css";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
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
      case "farm":
        return <MyFarm onBack={() => setPage("dashboard")} />;
      case "advisory":
        return <CropAdvisory onBack={() => setPage("dashboard")} />;
      default:
        return <Dashboard user={user} onNavigate={setPage} />;
    }
  };

  return (
    <>
      {!user ? (
        <div className="landing">
          <nav className="nav">
            <div className="logo"><span className="logo-icon">🌿</span> YieldMax</div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-outline" onClick={() => { setAuthMode("login"); setShowAuth(true); }}>Login</button>
              <button className="btn-primary" onClick={() => { setAuthMode("register"); setShowAuth(true); }}>Create Account</button>
            </div>
          </nav>

          <div className="hero" style={{ marginBottom: 0, paddingBottom: 0 }}>
            <div className="badge">🇰🇪 Smart Farming Assistant</div>
            <h1 className="hero-title">
              Turning Wastes <span style={{ display: "block" }}>Into</span> <span style={{ display: "block", color: "inherit" }}>Nutrients</span>
            </h1>
            <p className="hero-sub" style={{ marginBottom: "1rem" }}>
              Get personalized guidance on crop care, manure selection, and application timing for healthier soils and better yields.
            </p>
            <img src="/ivPhoto.png" alt="Farming" style={{ width: "calc(100% + 4rem)", maxWidth: "none", maxHeight: "250px", objectFit: "cover", display: "block", margin: "0 -2rem" }} />
          </div>

          <div className="footer-bar">© 2025 YieldMax · Agricultural Advisory Platform</div>

          {showAuth && <AuthModal initialTab={authMode} onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
        </div>
      ) : (
        <div className="app-shell">
          <nav className="app-nav">
            <div className="app-logo"><span>🌿</span> YieldMax</div>
            <div className="app-nav-links">
              <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Home</button>
              <button className="nav-btn logout" onClick={handleLogout}>Sign Out</button>
            </div>
          </nav>
          <div className="greeting-bar">
             Hello, <strong>{user.name}</strong> — {user.farm}{user.location ? ` · ${user.location}` : ""}
          </div>
          {renderPage()}
        </div>
      )}
    </>
  );
}
