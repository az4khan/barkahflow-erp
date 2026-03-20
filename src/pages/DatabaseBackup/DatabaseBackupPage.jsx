import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AppTopbar } from "../../components/common/Layout";
import { StatCard, Modal, StatusBadge, ConfirmDialog, Toggle } from "../../components/common/UI";
import Icon from "../../components/common/Icon";
import "./DatabaseBackup.css";

const SCHEDULE_OPTIONS = [
  { id: "daily",   label: "Daily",   desc: "Every day at specified time" },
  { id: "weekly",  label: "Weekly",  desc: "Once a week on selected day"  },
  { id: "monthly", label: "Monthly", desc: "Once a month on selected date" },
  { id: "none",    label: "Manual Only", desc: "No automatic backup"      },
];

export default function DatabaseBackupPage({ onHome }) {
  const { currentUser, logout, backups, createBackup, deleteBackup, toast } = useApp();

  const [tab, setTab]                   = useState("backups");
  const [showCreateModal, setShowCreate] = useState(false);
  const [showRestoreModal, setShowRestore] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [creating, setCreating]         = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState({
    enabled: true,
    frequency: "daily",
    time: "02:00",
    retention: 30,
    includeMedia: false,
    compress: true,
    encrypt: false,
  });

  // Backup form
  const [backupForm, setBackupForm] = useState({ type: "Full", name: "" });

  const totalSize = backups
    .filter((b) => b.status === "Success")
    .reduce((acc, b) => acc + parseFloat(b.size), 0)
    .toFixed(1);

  const successCount = backups.filter((b) => b.status === "Success").length;
  const lastBackup = backups[0];

  const handleCreate = () => {
    if (creating) return;
    setCreating(true);
    setTimeout(() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      createBackup({
        name: backupForm.name || (backupForm.type === "Full" ? "Manual Full Backup" : "Manual Incremental Backup"),
        type: backupForm.type,
        size: `${(Math.random() * 5 + 40).toFixed(1)} MB`,
        status: "Success",
        createdAt: ts,
        duration: `${Math.floor(Math.random() * 2 + 1)}m ${Math.floor(Math.random() * 59 + 1)}s`,
        by: currentUser?.username || "admin",
      });
      toast("Backup created successfully.", "success");
      setCreating(false);
      setShowCreate(false);
      setBackupForm({ type: "Full", name: "" });
    }, 1800);
  };

  const handleDelete = (id) => {
    deleteBackup(id);
    toast("Backup deleted.", "success");
    setConfirmDelete(null);
  };

  return (
    <div className="db-layout">
      <AppTopbar
        title="Database Backup"
        subtitle={tab === "backups" ? "Backup History" : "Schedule & Settings"}
        accentColor="#0ea5e9"
        currentUser={currentUser}
        onHome={onHome}
        onLogout={logout}
        onNavigate={(dest) => onHome && onHome(dest)}
      />

      <div className="db-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Database Backup</h1>
            <p className="page-sub">Manage backups, restore points and automated scheduling</p>
          </div>
          <div className="page-actions">
            <button className="btn-primary" style={{ background: "#10b981" }} onClick={() => setShowCreate(true)}>
              <Icon name="database" size={15} /> Create Backup Now
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="stats-row four-col">
          <StatCard icon="database" iconColor="#10b981" iconBg="#f0fdf4" label="Total Backups" value={backups.length} />
          <StatCard icon="check"    iconColor="#16a34a" iconBg="#f0fdf4" label="Successful"    value={successCount} />
          <StatCard icon="alert"    iconColor="#dc2626" iconBg="#fef2f2" label="Failed"        value={backups.filter((b) => b.status === "Failed").length} />
          <StatCard icon="download" iconColor="#3b82f6" iconBg="#eff6ff" label="Total Stored"  value={`${totalSize} MB`} />
        </div>

        {/* Last backup banner */}
        {lastBackup && (
          <div className={`last-backup-banner ${lastBackup.status === "Success" ? "banner-success" : "banner-error"}`}>
            <Icon
              name={lastBackup.status === "Success" ? "check" : "alert"}
              size={16}
              color={lastBackup.status === "Success" ? "#16a34a" : "#dc2626"}
            />
            <span>
              <strong>Last backup:</strong> {lastBackup.name} — {lastBackup.createdAt} &nbsp;·&nbsp;
              {lastBackup.size} &nbsp;·&nbsp; {lastBackup.duration} &nbsp;·&nbsp; by {lastBackup.by}
            </span>
            <StatusBadge status={lastBackup.status} />
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          {[
            { id: "backups",  label: "Backup History",      icon: "📦" },
            { id: "schedule", label: "Schedule & Settings",  icon: "⏰" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "tab-active" : ""}`}
              style={tab === t.id ? { borderBottomColor: "#10b981", color: "#10b981" } : {}}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── BACKUP HISTORY TAB ── */}
        {tab === "backups" && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Backup ID</th><th>Name</th><th>Type</th><th>Size</th>
                  <th>Status</th><th>Created At</th><th>Duration</th><th>By</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id}>
                    <td><span style={{ color: "#10b981", fontWeight: 700, fontSize: 12 }}>{b.id}</span></td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{b.name}</td>
                    <td>
                      <span style={{
                        background: b.type === "Full" ? "#eff6ff" : "#f0fdf4",
                        color:      b.type === "Full" ? "#2563eb" : "#16a34a",
                        borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 700,
                      }}>
                        {b.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>{b.size}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td style={{ fontSize: 12.5, color: "#6b7280" }}>{b.createdAt}</td>
                    <td style={{ fontSize: 12.5, color: "#9ca3af" }}>{b.duration}</td>
                    <td style={{ fontSize: 12.5 }}>{b.by}</td>
                    <td>
                      <div className="action-btns">
                        {b.status === "Success" && (
                          <button
                            className="action-btn"
                            title="Restore"
                            onClick={() => setShowRestore(b)}
                          >
                            <Icon name="refresh" size={14} color="#10b981" />
                          </button>
                        )}
                        <button
                          className="action-btn"
                          title="Download"
                          onClick={() => toast(`Downloading ${b.name}...`, "success")}
                        >
                          <Icon name="download" size={14} color="#3b82f6" />
                        </button>
                        <button
                          className="action-btn action-btn-danger"
                          title="Delete"
                          onClick={() => setConfirmDelete(b)}
                        >
                          <Icon name="trash" size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "#f0fdf4" }}>
                  <Icon name="clock" size={18} color="#10b981" />
                </div>
                <div>
                  <div className="settings-section-title">Backup Schedule</div>
                  <div className="settings-section-sub">Configure automatic backup frequency and timing</div>
                </div>
              </div>

              <Toggle
                checked={schedule.enabled}
                onChange={(v) => setSchedule((s) => ({ ...s, enabled: v }))}
                label="Enable Automatic Backups"
                description="System will automatically create backups based on the schedule below"
              />

              {schedule.enabled && (
                <>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Frequency</div>
                    <div className="schedule-options">
                      {SCHEDULE_OPTIONS.filter((o) => o.id !== "none").map((opt) => (
                        <button
                          key={opt.id}
                          className={`schedule-opt ${schedule.frequency === opt.id ? "schedule-opt-active" : ""}`}
                          onClick={() => setSchedule((s) => ({ ...s, frequency: opt.id }))}
                        >
                          <div className="schedule-opt-label">{opt.label}</div>
                          <div className="schedule-opt-desc">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid two-col">
                    <div className="form-group">
                      <label>Backup Time</label>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule((s) => ({ ...s, time: e.target.value }))}
                      />
                      <p className="field-hint">Server local time</p>
                    </div>
                    <div className="form-group">
                      <label>Retention Period</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number" min={1} max={365}
                          value={schedule.retention}
                          onChange={(e) => setSchedule((s) => ({ ...s, retention: parseInt(e.target.value) || 30 }))}
                          style={{ width: 80, textAlign: "center" }}
                        />
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>days</span>
                      </div>
                      <p className="field-hint">Old backups deleted after this period</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon" style={{ background: "#fffbeb" }}>
                  <Icon name="settings" size={18} color="#d97706" />
                </div>
                <div>
                  <div className="settings-section-title">Backup Options</div>
                  <div className="settings-section-sub">Configure what is included and how it is stored</div>
                </div>
              </div>

              <Toggle
                checked={schedule.compress}
                onChange={(v) => setSchedule((s) => ({ ...s, compress: v }))}
                label="Compress Backups"
                description="Use compression to reduce backup file size"
              />
              <Toggle
                checked={schedule.encrypt}
                onChange={(v) => setSchedule((s) => ({ ...s, encrypt: v }))}
                label="Encrypt Backups"
                description="AES-256 encryption for backup files"
              />
              <Toggle
                checked={schedule.includeMedia}
                onChange={(v) => setSchedule((s) => ({ ...s, includeMedia: v }))}
                label="Include Media Files"
                description="Include uploaded documents and images in backup"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-primary"
                style={{ background: "#10b981" }}
                onClick={() => toast("Schedule settings saved.", "success")}
              >
                <Icon name="save" size={15} /> Save Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <Modal title="Create New Backup" onClose={() => setShowCreate(false)} size="sm">
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Backup Name (optional)</label>
            <input
              value={backupForm.name}
              onChange={(e) => setBackupForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pre-upgrade backup"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Backup Type</label>
            <select
              value={backupForm.type}
              onChange={(e) => setBackupForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="Full">Full Backup (entire database)</option>
              <option value="Incremental">Incremental (changes only)</option>
            </select>
          </div>
          <div style={{
            padding: "10px 14px", background: "#f0fdf4", border: "1px solid #a7f3d0",
            borderRadius: 8, fontSize: 12.5, color: "#065f46", marginBottom: 16,
          }}>
            <strong>Full backup</strong> will include all tables, records and configuration.
            Estimated time: 1–3 minutes.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary"
              style={{ flex: 1, background: "#10b981" }}
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? <span className="login-spinner" /> : "Start Backup"}
            </button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Restore Confirm Modal */}
      {showRestoreModal && (
        <Modal title="Restore Database" onClose={() => setShowRestore(null)} size="sm">
          <div style={{ padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Icon name="alert" size={16} color="#dc2626" />
              <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.6 }}>
                <strong>Warning:</strong> Restoring will overwrite all current data with the backup from <strong>{showRestoreModal.createdAt}</strong>. This cannot be undone.
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#374151", marginBottom: 20 }}>
            Backup: <strong>{showRestoreModal.name}</strong> &nbsp;·&nbsp; Size: <strong>{showRestoreModal.size}</strong>
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-danger" style={{ flex: 1 }} onClick={() => { toast("Database restore initiated.", "success"); setShowRestore(null); }}>
              Restore Now
            </button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowRestore(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Backup"
          message={`Delete backup "${confirmDelete.name}" from ${confirmDelete.createdAt}? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          danger
        />
      )}
    </div>
  );
}
