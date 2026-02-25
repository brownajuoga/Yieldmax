import { useState } from "react";

const getUsers = () => JSON.parse(localStorage.getItem("farmUsers") || "[]");
const saveUser = (u) => {
  const users = getUsers();
  users.push(u);
  localStorage.setItem("farmUsers", JSON.stringify(users));
};

export default function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    name: "", email: "", password: "", farm: "", farmType: "", location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password || !form.farm) {
      setError("Please fill in all required fields.");
      return;
    }
    const users = getUsers();
    if (users.find((u) => u.email === form.email)) {
      setError("An account with this email already exists.");
      return;
    }
    saveUser(form);
    setError("");
    setSuccess(true);
    setTimeout(() => { onLogin(form); }, 1800);
  };

  const handleLogin = () => {
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    const users = getUsers();
    const user = users.find(
      (u) => u.email === form.email && u.password === form.password
    );
    if (!user) {
      setError("Incorrect email or password.");
      return;
    }
    onLogin(user);
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{tab === "login" ? "Welcome Back" : "Join the Platform"}</div>
        <div className="modal-sub">
          {tab === "login"
            ? "Log in to your farmer account"
            : "Register to manage manure collection & get farming help"}
        </div>
        <div className="tab-row">
          <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(false); }}>Login</button>
          <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); setSuccess(false); }}>Create Account</button>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        {success ? (
          <div className="success-box">
            <div className="success-icon">🌱</div>
            <div className="success-title">Account Created!</div>
            <div className="success-text">Welcome to the platform. Signing you in…</div>
          </div>
        ) : tab === "login" ? (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="farmer@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <button className="btn-full" onClick={handleLogin}>Login →</button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="John Kamau" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="farmer@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Create a password" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Farm Name *</label>
              <input className="form-input" placeholder="Green Valley Farm" value={form.farm} onChange={(e) => set("farm", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Farm Type</label>
              <select className="form-select" value={form.farmType} onChange={(e) => set("farmType", e.target.value)}>
                <option value="">Select type...</option>
                <option>Dairy / Cattle</option>
                <option>Poultry</option>
                <option>Mixed Livestock</option>
                <option>Crop Farming</option>
                <option>Horticulture</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location / County</label>
              <input className="form-input" placeholder="e.g. Nakuru, Rift Valley" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <button className="btn-full" onClick={handleRegister}>Create Account →</button>
          </>
        )}
      </div>
    </div>
  );
}
