import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import MyFarm from "./components/MyFarm";
import CropAdvisory from "./components/CropAdvisory";
import "./index.css";
import { getKnowledgeByCrop, syncPendingChanges, isLoggedIn, getCurrentUser } from './services/api';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => {
    // Check persistent login first
    if (isLoggedIn()) {
      return getCurrentUser();
    }
    // Fallback to sessionStorage for backward compatibility
    const s = sessionStorage.getItem("activeUser");
    return s ? JSON.parse(s) : null;
  });
  const [page, setPage] = useState("dashboard");

  // --- LOCAL-FIRST LOGIC START --- 
  useEffect(() => {
    /**
     * Pre-caches essential data immediately so the app works 
     * even if the user never clicks these crops while online. 
     */
const seedOfflineData = async () => {
  const essentialCrops = ['maize', 'pepper', 'tomatoes', 'beans', 'cabbage'];
  essentialCrops.forEach(async (crop) => {
    try {
      await getKnowledgeByCrop(crop);
      // If we reach here, it's either from Network OR Cache
    } catch (err) {
      console.log(`Still no data for ${crop} even in cache.`);
    }
  });
};

    /**
     * Automatically syncs changes made while offline (like farm reports)
     * as soon as the connection is restored. 
     */
    const handleConnectivityChange = () => {
      if (navigator.onLine) {
        console.log("🌐 Back online! Attempting to sync pending changes...");
        syncPendingChanges();
      }
    };

    // Initial seed and sync check
    seedOfflineData();
    if (navigator.onLine) syncPendingChanges();

    window.addEventListener('online', handleConnectivityChange);
    return () => window.removeEventListener('online', handleConnectivityChange);
  }, []);
  // --- LOCAL-FIRST LOGIC END ---

  const handleLogin = (u) => {
    sessionStorage.setItem("activeUser", JSON.stringify(u));
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("activeUser");
    // Clear persistent login state
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
              Get personalized guidance on crop care, manure selection, and application timing for healthier soils and better yields. 
            </p>
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