import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Toggle } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

export default function SecuritySettings() {
  const { security, setSecurity, toast } = useApp();
  const [form, setForm] = useState({ ...security });
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  const handleSave = () => {
    setSecurity(form);
    setDirty(false);
    toast("Security settings saved.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Login Security */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#fef2f2" }}>
            <Icon name="shield" size={18} color="#dc2626" />
          </div>
          <div>
            <div className="settings-section-title">Login Security</div>
            <div className="settings-section-sub">Control login attempts and lockout behavior</div>
          </div>
        </div>

        <div className="form-grid three-col">
          <div className="form-group">
            <label>Max Login Attempts</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={1} max={20}
                value={form.maxLoginAttempts}
                onChange={(e) => set("maxLoginAttempts", parseInt(e.target.value) || 5)}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>attempts</span>
            </div>
            <p className="field-hint">Account locks after this many failed attempts</p>
          </div>

          <div className="form-group">
            <label>Lockout Duration</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={1} max={1440}
                value={form.lockoutDuration}
                onChange={(e) => set("lockoutDuration", parseInt(e.target.value) || 30)}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>minutes</span>
            </div>
            <p className="field-hint">How long account stays locked</p>
          </div>

          <div className="form-group">
            <label>Session Timeout</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={5} max={480}
                value={form.sessionTimeout}
                onChange={(e) => set("sessionTimeout", parseInt(e.target.value) || 60)}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>minutes</span>
            </div>
            <p className="field-hint">Auto-logout after inactivity</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Toggle
            checked={form.allowMultipleSessions}
            onChange={(v) => set("allowMultipleSessions", v)}
            label="Allow Multiple Sessions"
            description="Users can log in from multiple browsers or devices simultaneously"
          />
          <Toggle
            checked={form.require2FA}
            onChange={(v) => set("require2FA", v)}
            label="Require Two-Factor Authentication"
            description="Users must verify their identity with a second factor on every login"
          />
        </div>
      </div>

      {/* Password Policy */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#fff7ed" }}>
            <Icon name="key" size={18} color="#ea580c" />
          </div>
          <div>
            <div className="settings-section-title">Password Policy</div>
            <div className="settings-section-sub">Define password strength and expiry requirements</div>
          </div>
        </div>

        <div className="form-grid three-col">
          <div className="form-group">
            <label>Minimum Password Length</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={6} max={32}
                value={form.passwordMinLength}
                onChange={(e) => set("passwordMinLength", parseInt(e.target.value) || 8)}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>characters</span>
            </div>
          </div>

          <div className="form-group">
            <label>Password Expiry</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={0} max={365}
                value={form.passwordExpiry}
                onChange={(e) => set("passwordExpiry", parseInt(e.target.value) || 90)}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>days (0 = never)</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Toggle
            checked={form.requireUppercase}
            onChange={(v) => set("requireUppercase", v)}
            label="Require Uppercase Letter"
            description="Password must contain at least one uppercase character"
          />
          <Toggle
            checked={form.requireNumbers}
            onChange={(v) => set("requireNumbers", v)}
            label="Require Numbers"
            description="Password must contain at least one numeric digit"
          />
          <Toggle
            checked={form.requireSpecialChars}
            onChange={(v) => set("requireSpecialChars", v)}
            label="Require Special Characters"
            description="Password must contain at least one special character (!@#$...)"
          />
        </div>

        {/* Password strength preview */}
        <div className="pwd-strength-preview">
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
            Current Policy Preview
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: `Min ${form.passwordMinLength} chars`, active: true },
              { label: "Uppercase", active: form.requireUppercase },
              { label: "Numbers", active: form.requireNumbers },
              { label: "Special chars", active: form.requireSpecialChars },
              { label: `Expires ${form.passwordExpiry === 0 ? "never" : `in ${form.passwordExpiry}d`}`, active: true },
            ].map((r) => (
              <span
                key={r.label}
                style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: r.active ? "#f0fdf4" : "#f9fafb",
                  color: r.active ? "#16a34a" : "#9ca3af",
                  border: `1px solid ${r.active ? "#bbf7d0" : "#e5e7eb"}`,
                }}
              >
                {r.active ? "✓ " : "○ "}{r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {dirty && <button className="btn-outline" onClick={() => { setForm({ ...security }); setDirty(false); }}>Discard</button>}
        <button className="btn-primary" onClick={handleSave}>
          <Icon name="save" size={15} />
          Save Security Settings
        </button>
      </div>
    </div>
  );
}
