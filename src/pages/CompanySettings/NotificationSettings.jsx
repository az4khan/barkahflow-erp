import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Toggle } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

export default function NotificationSettings() {
  const { notifications, setNotifications, toast } = useApp();
  const [form, setForm] = useState({ ...notifications });
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  const handleSave = () => {
    setNotifications(form);
    setDirty(false);
    toast("Notification settings saved.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Email Notifications */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#eff6ff" }}>
            <Icon name="mail" size={18} color="#2563eb" />
          </div>
          <div>
            <div className="settings-section-title">Email Notifications</div>
            <div className="settings-section-sub">Control which events trigger email alerts</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Toggle
            checked={form.emailOnLogin}
            onChange={(v) => set("emailOnLogin", v)}
            label="Notify on Successful Login"
            description="Send email when a user logs in successfully"
          />
          <Toggle
            checked={form.emailOnFailedLogin}
            onChange={(v) => set("emailOnFailedLogin", v)}
            label="Notify on Failed Login Attempt"
            description="Send alert when a login attempt fails"
          />
          <Toggle
            checked={form.emailOnPurchaseCreate}
            onChange={(v) => set("emailOnPurchaseCreate", v)}
            label="New Purchase Order Created"
            description="Send email when a new PO is created"
          />
          <Toggle
            checked={form.emailOnPurchaseApprove}
            onChange={(v) => set("emailOnPurchaseApprove", v)}
            label="Purchase Order Approved / Status Changed"
            description="Notify stakeholders when a PO status changes"
          />
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#f0fdf4" }}>
            <Icon name="phone" size={18} color="#16a34a" />
          </div>
          <div>
            <div className="settings-section-title">SMS Notifications</div>
            <div className="settings-section-sub">Text message alerts for critical events</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Toggle
            checked={form.smsOnLogin}
            onChange={(v) => set("smsOnLogin", v)}
            label="SMS on Login"
            description="Send SMS verification or alert on every login"
          />
          <Toggle
            checked={form.smsAlerts}
            onChange={(v) => set("smsAlerts", v)}
            label="Critical System Alerts via SMS"
            description="Backup failures, security breaches, and critical errors"
          />
        </div>
      </div>

      {/* Report Scheduling */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#fff7ed" }}>
            <Icon name="reports" size={18} color="#ea580c" />
          </div>
          <div>
            <div className="settings-section-title">Scheduled Reports</div>
            <div className="settings-section-sub">Automatic report delivery via email</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Toggle
            checked={form.dailyReport}
            onChange={(v) => set("dailyReport", v)}
            label="Daily Summary Report"
            description="Receive a daily summary of purchases, sales and activities"
          />
          <Toggle
            checked={form.weeklyReport}
            onChange={(v) => set("weeklyReport", v)}
            label="Weekly Analytics Report"
            description="Weekly consolidated report with charts and KPIs"
          />
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#fef2f2" }}>
            <Icon name="alert" size={18} color="#dc2626" />
          </div>
          <div>
            <div className="settings-section-title">Inventory Alerts</div>
            <div className="settings-section-sub">Alerts when stock reaches critical levels</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Toggle
            checked={form.lowStockAlert}
            onChange={(v) => set("lowStockAlert", v)}
            label="Low Stock Alert"
            description="Send notification when product stock falls below threshold"
          />
        </div>

        {form.lowStockAlert && (
          <div className="form-group" style={{ maxWidth: 280, marginTop: 12 }}>
            <label>Low Stock Threshold (units)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={0}
                value={form.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", parseInt(e.target.value) || 500)}
                style={{ width: 100, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "#9ca3af" }}>units</span>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        {dirty && (
          <button className="btn-outline" onClick={() => { setForm({ ...notifications }); setDirty(false); }}>
            Discard
          </button>
        )}
        <button className="btn-primary" onClick={handleSave}>
          <Icon name="save" size={15} />
          Save Notification Settings
        </button>
      </div>
    </div>
  );
}
