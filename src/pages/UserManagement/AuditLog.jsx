import { useState } from "react";
import { AUDIT_LOG } from "../../data/mockData";
import { SearchBox } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

const ACTION_COLORS = {
  Login:         { bg: "#eff6ff", color: "#2563eb" },
  "Create User": { bg: "#f0fdf4", color: "#16a34a" },
  "Create Role": { bg: "#f0fdf4", color: "#16a34a" },
  "Create PO":   { bg: "#fff7ed", color: "#ea580c" },
  "Update PO":   { bg: "#fff7ed", color: "#ea580c" },
  "Role Update": { bg: "#f5f3ff", color: "#7c3aed" },
  "Company Edit":{ bg: "#fdf4ff", color: "#a21caf" },
  "Manual Backup":{ bg: "#ecfdf5", color: "#059669" },
};

const MODULE_ICONS = {
  Auth:       "lock",
  "User Mgmt":"users",
  Purchase:   "purchase",
  Settings:   "settings",
  Backup:     "database",
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("All");

  const modules = ["All", ...new Set(AUDIT_LOG.map((l) => l.module))];

  const filtered = AUDIT_LOG.filter((row) => {
    const matchMod = filterModule === "All" || row.module === filterModule;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      row.user.toLowerCase().includes(q) ||
      row.action.toLowerCase().includes(q) ||
      row.detail.toLowerCase().includes(q) ||
      row.ip.includes(q);
    return matchMod && matchSearch;
  });

  return (
    <>
      {/* Controls */}
      <div className="list-controls" style={{ marginBottom: 16 }}>
        <SearchBox value={search} onChange={setSearch} placeholder="Search logs..." />
        <div className="filter-tabs">
          {modules.map((m) => (
            <button
              key={m}
              className={`filter-tab ${filterModule === m ? "filter-active" : ""}`}
              onClick={() => setFilterModule(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          className="btn-outline btn-sm"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon name="download" size={14} />
          Export Log
        </button>
      </div>

      {/* Timeline / Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const actionStyle = ACTION_COLORS[row.action] || { bg: "#f3f4f6", color: "#6b7280" };
              const modIcon = MODULE_ICONS[row.module] || "info";
              return (
                <tr key={row.id}>
                  <td style={{ color: "#9ca3af", fontSize: 12 }}>{row.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="clock" size={13} color="#9ca3af" />
                      <span style={{ fontSize: 12.5, color: "#6b7280" }}>{row.time}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 11,
                          color: "#374151",
                        }}
                      >
                        {row.user[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>
                        {row.user}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: actionStyle.bg,
                        color: actionStyle.color,
                        borderRadius: 6,
                        padding: "3px 9px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name={modIcon} size={13} color="#9ca3af" />
                      <span style={{ fontSize: 13, color: "#374151" }}>{row.module}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: "#6b7280", maxWidth: 220 }}>{row.detail}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 5,
                        padding: "2px 8px",
                        color: "#374151",
                      }}
                    >
                      {row.ip}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#9ca3af",
          textAlign: "right",
        }}
      >
        Showing {filtered.length} of {AUDIT_LOG.length} entries
      </div>
    </>
  );
}
