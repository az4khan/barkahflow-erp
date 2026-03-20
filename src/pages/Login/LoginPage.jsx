import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./LoginPage.css";

const DEMO = [
  { label:"Admin",    username:"admin",  password:"admin123",  color:"#8b5cf6" },
  { label:"Purchase", username:"hassan", password:"hassan123", color:"#f97316" },
  { label:"Sales",    username:"bilal",  password:"bilal123",  color:"#10b981" },
];

const FEATURES = [
  "International Purchase Management",
  "Wholesale & Retail Sales Control",
  "User, Role & Permission Management",
  "Financial Analytics & Reporting",
  "Automated Database Backup",
];

export default function LoginPage() {
  const { login, users } = useApp();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username:"", password:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  function fill(d) { setForm({ username:d.username, password:d.password }); setError(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const user = (users||[]).find(u => u.username === form.username.trim() && u.password === form.password);
    if (!user) { setError("Invalid username or password."); setLoading(false); return; }
    if (user.status === "inactive") { setError("Your account is inactive. Contact administrator."); setLoading(false); return; }
    login(user);
    navigate("/");
    setLoading(false);
  }

  return (
    <div className="login-bg">
      {/* ── Left panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo-icon">🔥</div>
          <div>
            <div className="login-brand-name">BarkahFlow</div>
            <div className="login-brand-sub">ENTERPRISE RESOURCE PLANNING</div>
          </div>
        </div>

        <div className="login-hero">
          <h1>Streamline Your<br/><span>Energy Operations</span></h1>
          <p>Complete enterprise management for energy procurement, wholesale, retail and distribution — all in one powerful platform.</p>
          <div className="login-features">
            {FEATURES.map(f => (
              <div className="login-feature" key={f}>
                <div className="login-feature-dot">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">BarkahFlow ERP v2.0 © 2026</div>
      </div>

      {/* ── Right panel ── */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-logo">🔥</div>
          <h2>Welcome Back</h2>
          <p className="login-card-sub">Sign in to your account to continue</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label>Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm(p => ({...p, username: e.target.value}))}
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="login-remember-row">
              <label>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                Remember me
              </label>
              <button type="button" className="login-forgot">Forgot password?</button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="login-divider">Quick demo login</div>
          <div className="login-demo-row">
            {DEMO.map(d => (
              <button key={d.label} className="login-demo-pill" style={{background:d.color}} onClick={() => fill(d)} type="button">
                {d.label}
              </button>
            ))}
          </div>

          <div className="login-card-footer">BarkahFlow Management ERP v2.0 · © 2026 Al-Raza LPG</div>
        </div>
      </div>
    </div>
  );
}
