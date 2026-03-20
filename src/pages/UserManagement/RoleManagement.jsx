import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal, ConfirmDialog } from "../../components/common/UI";
import { ALL_AUTHORIZATIONS } from "../../data/mockData";
import Icon from "../../components/common/Icon";

export default function RoleManagement() {
  const { roles, users, createRole, updateRole, deleteRole, toast } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showAssign, setShowAssign] = useState(null);

  const blank = { name: "", description: "", color: "#3b82f6", authorizations: [] };
  const [form, setForm] = useState(blank);

  const toggleAuth = (auth) =>
    setForm((f) => ({
      ...f,
      authorizations: f.authorizations.includes(auth)
        ? f.authorizations.filter((a) => a !== auth)
        : [...f.authorizations, auth],
    }));

  const toggleGroup = (group) => {
    const allItems = group.items;
    const allChecked = allItems.every((a) => form.authorizations.includes(a));
    setForm((f) => ({
      ...f,
      authorizations: allChecked
        ? f.authorizations.filter((a) => !allItems.includes(a))
        : [...new Set([...f.authorizations, ...allItems])],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast("Role name is required.", "error"); return; }
    if (editRole) {
      updateRole(editRole.id, form);
      toast("Role updated.", "success");
    } else {
      createRole(form);
      toast("Role created successfully.", "success");
    }
    setShowForm(false);
    setEditRole(null);
  };

  const handleDelete = (id) => {
    const inUse = users.some((u) => u.role === id);
    if (inUse) { toast("Cannot delete a role that is assigned to users.", "error"); setShowConfirmDelete(null); return; }
    deleteRole(id);
    toast("Role deleted.", "success");
    setShowConfirmDelete(null);
  };

  const getUsersForRole = (roleId) => users.filter((u) => u.role === roleId);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => { setForm(blank); setEditRole(null); setShowForm(true); }}>
          <Icon name="plus" size={15} /> New Role
        </button>
      </div>

      <div className="card-grid">
        {roles.map((role) => {
          const assigned = getUsersForRole(role.id);
          return (
            <div key={role.id} className="supplier-card">
              {/* Header */}
              <div className="supplier-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                  <div>
                    <div className="supplier-name">{role.name}</div>
                    <div className="supplier-country">{role.description}</div>
                  </div>
                </div>
                <span className="supplier-id-badge">{role.id}</span>
              </div>

              {/* Authorizations */}
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Authorizations ({role.authorizations.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {role.authorizations.slice(0, 8).map((a) => (
                    <span key={a} style={{ background: role.color + "15", color: role.color, borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{a}</span>
                  ))}
                  {role.authorizations.length > 8 && (
                    <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>+{role.authorizations.length - 8} more</span>
                  )}
                </div>
              </div>

              {/* Assigned users */}
              <div className="supplier-orders-row">
                <span>Assigned Users</span>
                <span className="orders-count" style={{ color: role.color }}>{assigned.length} user{assigned.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Actions */}
              <div className="supplier-actions">
                <button className="btn-edit" onClick={() => { setForm({ ...role }); setEditRole(role); setShowForm(true); }}>Edit</button>
                <button className="btn-view-hist" onClick={() => setShowAssign(role)}>View Users</button>
                {role.id !== "ROLE-001" && (
                  <button className="action-btn action-btn-danger" onClick={() => setShowConfirmDelete(role)} style={{ marginLeft: 4 }}>
                    <Icon name="trash" size={14} color="#ef4444" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Form Modal */}
      {showForm && (
        <Modal title={editRole ? `Edit Role — ${editRole.name}` : "Create New Role"} onClose={() => setShowForm(false)} size="lg">
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label>Role Name *</label>
              <input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Purchase Manager" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label>Role Color</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={form.color || "#3b82f6"} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 40, padding: 4, border: "1.5px solid #e5e7eb", borderRadius: 8 }} />
                <span style={{ fontSize: 13, color: "#6b7280" }}>Pick a colour for this role</span>
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 14 }}>
            Authorizations
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400, marginLeft: 8 }}>
              {(form.authorizations || []).length} selected
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ALL_AUTHORIZATIONS.map((group) => {
              const allChecked = group.items.every((a) => (form.authorizations || []).includes(a));
              const someChecked = group.items.some((a) => (form.authorizations || []).includes(a));
              return (
                <div key={group.group} style={{ border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151" }}>{group.group}</span>
                    <button
                      style={{ fontSize: 12, fontWeight: 600, color: allChecked ? "#ef4444" : "#3b82f6", background: "none", border: "none", cursor: "pointer" }}
                      onClick={() => toggleGroup(group)}
                    >
                      {allChecked ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {group.items.map((auth) => {
                      const checked = (form.authorizations || []).includes(auth);
                      return (
                        <button
                          key={auth}
                          onClick={() => toggleAuth(auth)}
                          style={{
                            padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            border: `1.5px solid ${checked ? form.color : "#e5e7eb"}`,
                            background: checked ? (form.color + "15") : "#fff",
                            color: checked ? form.color : "#6b7280",
                            transition: "all 0.12s",
                          }}
                        >
                          {checked && <span style={{ marginRight: 4 }}>✓</span>}{auth}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editRole ? "Update Role" : "Create Role"}</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Assigned Users Modal */}
      {showAssign && (
        <Modal title={`Users with role: ${showAssign.name}`} onClose={() => setShowAssign(null)} size="sm">
          {getUsersForRole(showAssign.id).length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No users assigned to this role.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {getUsersForRole(showAssign.id).map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: showAssign.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: showAssign.color }}>{u.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: 13.5 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirm */}
      {showConfirmDelete && (
        <ConfirmDialog
          title="Delete Role"
          message={`Are you sure you want to delete the role "${showConfirmDelete.name}"?`}
          onConfirm={() => handleDelete(showConfirmDelete.id)}
          onCancel={() => setShowConfirmDelete(null)}
          danger
        />
      )}
    </>
  );
}
