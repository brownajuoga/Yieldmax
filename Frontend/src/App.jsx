import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import MyFarm from "./components/MyFarm";
import CropAdvisory from "./components/CropAdvisory";
import Marketplace from "./components/Marketplace"; // New Import
import "./index.css";
import { 
  getKnowledgeByCrop, 
  syncPendingChanges, 
  isLoggedIn, 
  getCurrentUser,
  getMarketListings 
} from './services/api';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => {
    if (isLoggedIn()) return getCurrentUser();
    const s = sessionStorage.getItem("activeUser");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState("dashboard");

  // --- LOCAL-FIRST & SEEDING LOGIC --- 
  useEffect(() => {
    const seedOfflineData = async () => {
      console.log("⚡ Seeding local database...");
      const essentialCrops = ['maize', 'pepper', 'tomatoes', 'beans', 'cabbage'];
      
      // Seed Crops & Marketplace
      essentialCrops.forEach(async (crop) => {
        try { await getKnowledgeByCrop(crop); } catch (err) {}
      });
      
      try { await getMarketListings(); } catch (err) {}
    };

    const handleConnectivityChange = () => {
      if (navigator.onLine) {
        console.log("🌐 Back online! Syncing changes...");
        syncPendingChanges();
      }
    };

    seedOfflineData();
    if (navigator.onLine) syncPendingChanges();

    window.addEventListener('online', handleConnectivityChange);
    return () => window.removeEventListener('online', handleConnectivityChange);
  }, []);

  const handleLogin = (u) => {
    sessionStorage.setItem("activeUser", JSON.stringify(u));
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("activeUser");
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('user_logged_in');
    setUser(null);
    setPage("dashboard");
  };

  const renderPage = () => {
    switch (page) {
      case "farm":
        return <MyFarm onBack={() => setPage("dashboard")} />;
      case "advisory":
        return <CropAdvisory onBack={() => setPage("dashboard")} />;
      case "market":
        return <Marketplace onBack={() => setPage("dashboard")} />; // New Case
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

          <div className="hero">
            <div className="badge">🇰🇪 Smart Farming Assistant</div>
            <h1 className="hero-title">
              Turning Wastes <span style={{ display: "block" }}>Into</span> <span style={{ display: "block", color: "inherit" }}>Nutrients</span>
            </h1>
            <p className="hero-sub">
              Get personalized guidance on crop care, manure selection, and exchange organic waste with other farmers. 
            </p>
          </div>

          <div className="footer-bar">© 2026 YieldMax · Agricultural Advisory Platform</div>

          {showAuth && <AuthModal initialTab={authMode} onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
        </div>
      ) : (
        <div className="app-shell">
          <nav className="app-nav">
            <div className="app-logo"><span>🌿</span> YieldMax</div>
            <div className="app-nav-links">
              <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>Home</button>
              <button className={`nav-btn ${page === "market" ? "active" : ""}`} onClick={() => setPage("market")}>Exchange</button>
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