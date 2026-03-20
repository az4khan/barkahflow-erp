import Icon from "./Icon";

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide = false, size = "md" }) {
  const maxW = { sm: 420, md: 580, lg: 780, xl: 980 }[size] || 580;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: wide ? 780 : maxW }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── TOAST ITEM ───────────────────────────────────────────────────────────────
export function Toast({ message, type, onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon
          name={type === "success" ? "check" : type === "error" ? "alert" : "info"}
          size={15}
          color={type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb"}
        />
        <span>{message}</span>
      </div>
      <button onClick={onClose}>
        <Icon name="close" size={13} />
      </button>
    </div>
  );
}

// ─── TOAST CONTAINER ──────────────────────────────────────────────────────────
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ icon, iconColor, iconBg, label, value, sub, badge }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg }}>
          <Icon name={icon} size={20} color={iconColor} />
        </div>
        {badge && <span className="stat-badge">{badge}</span>}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    Active:      "badge-active",
    Completed:   "badge-completed",
    Success:     "badge-completed",
    "In Transit":"badge-transit",
    Inactive:    "badge-inactive",
    Pending:     "badge-pending",
    Failed:      "badge-failed",
    Locked:      "badge-transit",
    Scheduled:   "badge-scheduled",
  };
  return <span className={`status-badge ${map[status] || "badge-inactive"}`}>{status}</span>;
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
export function SectionCard({ title, children, action }) {
  return (
    <div className="section-card">
      {(title || action) && (
        <div className="section-card-header">
          {title && (
            <div className="chart-title">
              <span className="chart-title-bar" />
              {title}
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          style={{ flex: 1 }}
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button className="btn-outline" style={{ flex: 1 }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = "inbox", title = "No data found", message = "", action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={32} color="#d1d5db" />
      </div>
      <div className="empty-state-title">{title}</div>
      {message && <div className="empty-state-msg">{message}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        {label && <div className="toggle-label">{label}</div>}
        {description && <div className="toggle-desc">{description}</div>}
      </div>
      <button
        className={`toggle-switch ${checked ? "toggle-on" : ""}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}

// ─── SEARCH BOX ───────────────────────────────────────────────────────────────
export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-box-lg">
      <Icon name="search" size={15} color="#9ca3af" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ color: "#9ca3af", display: "flex" }}>
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
  );
}
