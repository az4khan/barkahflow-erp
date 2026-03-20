import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal, StatusBadge, ConfirmDialog } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

const TYPES = ["Parent", "Subsidiary", "Branch", "Representative Office"];

export default function SubsidiaryManagement() {
  const { subsidiaries, createSubsidiary, updateSubsidiary, deleteSubsidiary, toast } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const blank = { name: "", type: "Subsidiary", location: "", gst: "", status: "Active" };
  const [form, setForm] = useState(blank);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(blank); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.location) { toast("Name and location are required.", "error"); return; }
    if (editItem) {
      updateSubsidiary(editItem.id, form);
      toast("Subsidiary updated.", "success");
    } else {
      createSubsidiary(form);
      toast("Subsidiary created.", "success");
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (id === "SUB-001") { toast("Cannot delete the parent company.", "error"); setConfirmDelete(null); return; }
    deleteSubsidiary(id);
    toast("Subsidiary deleted.", "success");
    setConfirmDelete(null);
  };

  const TYPE_COLORS = {
    Parent:                 { color: "#8b5cf6", bg: "#f5f3ff" },
    Subsidiary:             { color: "#3b82f6", bg: "#eff6ff" },
    Branch:                 { color: "#10b981", bg: "#f0fdf4" },
    "Representative Office":{ color: "#f97316", bg: "#fff7ed" },
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#111827" }}>Subsidiaries & Branches</div>
          <div style={{ fontSize: 12.5, color: "#9ca3af" }}>{subsidiaries.length} entities registered</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Icon name="plus" size={15} /> Add Subsidiary
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Type</th><th>Location</th><th>GST Number</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subsidiaries.map((s) => {
              const tc = TYPE_COLORS[s.type] || { color: "#6b7280", bg: "#f3f4f6" };
              return (
                <tr key={s.id}>
                  <td><span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 12 }}>{s.id}</span></td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{s.name}</td>
                  <td>
                    <span style={{ background: tc.bg, color: tc.color, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>
                      {s.type}
                    </span>
                  </td>
                  <td style={{ color: "#6b7280" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Icon name="building" size={13} color="#9ca3af" />
                      {s.location}
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12.5, color: "#374151" }}>{s.gst || "—"}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Edit" onClick={() => openEdit(s)}>
                        <Icon name="edit" size={14} color="#3b82f6" />
                      </button>
                      {s.id !== "SUB-001" && (
                        <button className="action-btn action-btn-danger" title="Delete" onClick={() => setConfirmDelete(s)}>
                          <Icon name="trash" size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editItem ? "Edit Subsidiary" : "Add New Subsidiary"} onClose={() => setShowForm(false)}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Entity Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full legal name" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location / City *</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input value={form.gst} onChange={(e) => set("gst", e.target.value)} placeholder="GST registration" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              {editItem ? "Update" : "Create Subsidiary"}
            </button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Subsidiary"
          message={`Delete "${confirmDelete.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          danger
        />
      )}
    </>
  );
}
