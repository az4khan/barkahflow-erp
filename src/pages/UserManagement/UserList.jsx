import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal, StatusBadge, ConfirmDialog, SearchBox } from "../../components/common/UI";
import Icon from "../../components/common/Icon";
import { SEED_EMPLOYEES, SEED_POSITIONS } from "../HR/hrConstants";

// F4 Employee Lookup popup
function EmployeeF4({ onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = SEED_EMPLOYEES.filter(e =>
    `${e.firstName} ${e.lastName} ${e.empNo}`.toLowerCase().includes(q.toLowerCase())
  );
  const getPos = (id) => SEED_POSITIONS.find(p => p.id === id);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, width:520, maxHeight:"65vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>F4 — Select Employee</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Link a hired employee to this user account</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4 }}>
              <Icon name="close" size={15} color="#94a3b8" />
            </button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, padding:"7px 12px" }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input autoFocus placeholder="Search by name or employee no…" value={q} onChange={e=>setQ(e.target.value)}
              style={{ border:"none", background:"transparent", fontSize:13, outline:"none", flex:1 }} />
          </div>
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.map(emp => {
            const pos = getPos(emp.positionId);
            const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
            return (
              <div key={emp.id} onClick={() => onSelect(emp)}
                style={{ padding:"11px 20px", borderBottom:"1px solid #f8fafc", cursor:"pointer", display:"flex", gap:12, alignItems:"center" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <div style={{ width:36, height:36, borderRadius:9, background:"#8b5cf620", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#8b5cf6", flexShrink:0 }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize:11.5, color:"#94a3b8" }}>{emp.empNo} · {pos?.title || "No Position"}</div>
                </div>
                <span style={{ fontSize:10.5, background: emp.linkedUserId ? "#fef9c3" : "#f0fdf4", color: emp.linkedUserId ? "#854d0e" : "#166534", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>
                  {emp.linkedUserId ? "Already Linked" : "Available"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ padding:"10px 20px", borderTop:"1px solid #f1f5f9", fontSize:11.5, color:"#94a3b8" }}>
          {filtered.length} employee{filtered.length!==1?"s":""} · Click to select
        </div>
      </div>
    </div>
  );
}

export default function UserList() {
  const { users, roles, createUser, updateUser, deleteUser, resetPassword, toggleUserStatus, toast } = useApp();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showF4, setShowF4] = useState(false);
  const [linkedEmployee, setLinkedEmployee] = useState(null);

  const blank = { name: "", username: "", email: "", phone: "", dept: "", role: "ROLE-002", status: "Active", password: "" };
  const [form, setForm] = useState(blank);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const getRoleById = (id) => roles.find((r) => r.id === id);

  const filtered = users.filter((u) => {
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.dept?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openAdd  = () => { setForm(blank); setEditUser(null); setLinkedEmployee(null); setShowForm(true); };
  const openEdit = (u) => {
    setForm({ ...u });
    setEditUser(u);
    const emp = u.linkedEmpId ? SEED_EMPLOYEES.find(e=>e.id===u.linkedEmpId) : null;
    setLinkedEmployee(emp || null);
    setShowForm(true);
  };

  const handleF4Select = (emp) => {
    setLinkedEmployee(emp);
    const pos = SEED_POSITIONS.find(p => p.id === emp.positionId);
    setForm(f => ({
      ...f,
      name:  f.name  || `${emp.firstName} ${emp.lastName}`,
      email: f.email || emp.email,
      phone: f.phone || emp.phone,
      dept:  pos ? pos.title : f.dept,
      linkedEmpId: emp.id,
    }));
    setShowF4(false);
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.email) { toast("Name, username and email are required.", "error"); return; }
    if (editUser) {
      updateUser(editUser.id, form);
      toast("User updated successfully.", "success");
    } else {
      if (!form.password) { toast("Password is required for new users.", "error"); return; }
      createUser(form);
      toast("User created successfully.", "success");
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (id === "USR-001") { toast("Cannot delete the system administrator.", "error"); return; }
    deleteUser(id);
    toast("User deleted.", "success");
    setShowConfirmDelete(null);
  };

  const handleReset = () => {
    if (!newPwd || newPwd.length < 6) { toast("Password must be at least 6 characters.", "error"); return; }
    resetPassword(showReset.id, newPwd);
    toast(`Password reset for ${showReset.name}.`, "success");
    setShowReset(null);
  };

  return (
    <>
      {/* Controls */}
      <div className="list-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search users..." />
        <div className="filter-tabs">
          {["All", "Active", "Inactive", "Locked"].map((f) => (
            <button key={f} className={`filter-tab ${filterStatus === f ? "filter-active" : ""}`} onClick={() => setFilterStatus(f)}>{f}</button>
          ))}
        </div>
        <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={openAdd}>
          <Icon name="plus" size={15} /> New User
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Username</th><th>Email</th>
              <th>Department</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const role = getRoleById(u.role);
              return (
                <tr key={u.id}>
                  <td><span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 12 }}>{u.id}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: (role?.color || "#6b7280") + "20", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: role?.color || "#6b7280", flexShrink: 0 }}>
                        {u.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13, color: "#374151" }}>{u.username}</td>
                  <td style={{ color: "#6b7280" }}>{u.email}</td>
                  <td>{u.dept}</td>
                  <td>
                    {role && (
                      <span style={{ background: role.color + "18", color: role.color, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>
                        {role.name}
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={u.status} /></td>
                  <td style={{ fontSize: 12, color: "#9ca3af" }}>{u.lastLogin}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Edit" onClick={() => openEdit(u)}><Icon name="edit" size={14} color="#3b82f6" /></button>
                      <button className="action-btn" title="Reset Password" onClick={() => { setShowReset(u); setNewPwd(""); setShowNewPwd(false); }}><Icon name="key" size={14} color="#f97316" /></button>
                      <button className="action-btn" title={u.status === "Active" ? "Deactivate" : "Activate"} onClick={() => { toggleUserStatus(u.id); toast(`User ${u.status === "Active" ? "deactivated" : "activated"}.`, "success"); }}>
                        <Icon name={u.status === "Active" ? "lock" : "unlock"} size={14} color={u.status === "Active" ? "#6b7280" : "#16a34a"} />
                      </button>
                      <button className="action-btn action-btn-danger" title="Delete" onClick={() => setShowConfirmDelete(u)}><Icon name="trash" size={14} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <Modal title={editUser ? `Edit User — ${editUser.name}` : "Create New User"} onClose={() => setShowForm(false)}>
          {/* F4 Employee Link */}
          <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:16, border:"1px solid #f1f5f9" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Link to HR Employee (Optional)</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ flex:1, padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, background:"#fff", minHeight:36, display:"flex", alignItems:"center", color: linkedEmployee ? "#0f172a" : "#94a3b8" }}>
                {linkedEmployee
                  ? <><span style={{ fontWeight:700 }}>{linkedEmployee.firstName} {linkedEmployee.lastName}</span>&nbsp;<span style={{ color:"#94a3b8" }}>· {linkedEmployee.empNo}</span></>
                  : "No employee linked — use F4 to search"}
              </div>
              <button onClick={() => setShowF4(true)}
                style={{ padding:"8px 14px", borderRadius:8, background:"#8b5cf6", border:"none", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer", flexShrink:0 }}>
                F4
              </button>
              {linkedEmployee && (
                <button onClick={() => { setLinkedEmployee(null); setForm(f=>({...f,linkedEmpId:null})); }}
                  style={{ padding:"8px 10px", borderRadius:8, background:"#fee2e2", border:"none", color:"#dc2626", cursor:"pointer", flexShrink:0 }}>
                  ✕
                </button>
              )}
            </div>
            {linkedEmployee && (
              <div style={{ marginTop:6, fontSize:12, color:"#16a34a", fontWeight:600 }}>
                ✓ Name, email, phone & designation auto-filled from employee record
              </div>
            )}
          </div>

          <div className="form-grid">
            {[["Full Name *", "name", "text"], ["Username *", "username", "text"], ["Email Address *", "email", "email"], ["Phone Number", "phone", "tel"], ["Department", "dept", "text"]].map(([l, k, t]) => (
              <div key={k} className="form-group">
                <label>{l}</label>
                <input type={t} value={form[k] || ""} onChange={(e) => set(k, e.target.value)} placeholder={l.replace(" *", "")} />
              </div>
            ))}
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option>Active</option><option>Inactive</option><option>Locked</option>
              </select>
            </div>
            {!editUser && (
              <div className="form-group">
                <label>Initial Password *</label>
                <input type="password" value={form.password || ""} onChange={(e) => set("password", e.target.value)} placeholder="Minimum 6 characters" />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editUser ? "Update User" : "Create User"}</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showF4 && <EmployeeF4 onSelect={handleF4Select} onClose={() => setShowF4(false)} />}
      {showReset && (
        <Modal title={`Reset Password — ${showReset.name}`} onClose={() => setShowReset(null)} size="sm">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>New Password</label>
            <div style={{ position: "relative" }}>
              <input type={showNewPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Enter new password" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowNewPwd((s) => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                <Icon name={showNewPwd ? "eyeOff" : "eye"} size={15} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "#9ca3af", marginBottom: 16 }}>Password must be at least 6 characters.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleReset}>Reset Password</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowReset(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {showConfirmDelete && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${showConfirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(showConfirmDelete.id)}
          onCancel={() => setShowConfirmDelete(null)}
          danger
        />
      )}
    </>
  );
}
