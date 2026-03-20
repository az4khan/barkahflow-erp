import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../../components/common/Icon";
import UniversalTopbar from "../../components/common/UniversalTopbar";

const ACCENT = "#8b5cf6";

function fmtDate(iso) { if (!iso) return "—"; return new Date(iso).toLocaleString("en-PK", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:false }); }

/* ── User Form Modal ── */
function UserModal({ existing, roles, onClose, onSave }) {
  const [form, setForm] = useState(existing || { firstName:"", lastName:"", username:"", email:"", phone:"", department:"", roleId:"", status:"active", password:"" });
  const depts = ["Administration","Procurement","Sales","Finance","Operations","Warehouse","IT","HR"];
  function save() {
    if (!form.firstName || !form.username || !form.email || !form.roleId) { alert("Fill all required fields."); return; }
    if (!existing && !form.password) { alert("Password is required for new users."); return; }
    onSave(form);
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{existing?"Edit User":"New User"}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["First Name*","firstName","text"],["Last Name","lastName","text"],["Username*","username","text"],["Email*","email","email"],["Phone","phone","tel"],["Department","department","select"]].map(([l,k,t])=>(
              <div key={k} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{l}</label>
                {t==="select" ? (
                  <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }}>
                    <option value="">-- Select --</option>
                    {depts.map(d=><option key={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={l.replace("*","")}
                    style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, color:"#111827", outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                )}
              </div>
            ))}
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Role*</label>
              <select value={form.roleId} onChange={e=>setForm(f=>({...f,roleId:e.target.value}))}
                style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }}>
                <option value="">-- Select Role --</option>
                {(roles||[]).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {!existing && (
              <div style={{ display:"flex", flexDirection:"column", gap:5, gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Password*</label>
                <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters"
                  style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, color:"#111827", outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
              </div>
            )}
          </div>
        </div>
        <div style={{ padding:"14px 24px", borderTop:"1px solid #f3f4f6", display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={save} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:ACCENT, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            {existing ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Role Modal ── */
function RoleModal({ existing, onClose, onSave }) {
  const ALL_PERMS = ["user.view","user.create","user.edit","user.delete","role.view","role.manage","purchase.view","purchase.create","purchase.edit","purchase.delete","suppliers.view","suppliers.manage","products.view","products.manage","reports.view","settings.view","settings.edit","backup.manage"];
  const [form, setForm] = useState({ name: existing?.name||"", description: existing?.description||"", permissions: existing?.permissions||[] });
  function togglePerm(p) { setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x=>x!==p) : [...f.permissions, p] })); }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h3 style={{ fontSize:16, fontWeight:700 }}>{existing?"Edit Role":"New Role"}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Role Name*</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Procurement Manager"
              style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>Description</label>
            <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description of this role"
              style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:8 }}>Permissions</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {ALL_PERMS.map(p=>(
                <button key={p} onClick={()=>togglePerm(p)}
                  style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid", transition:"all 0.12s",
                    background: form.permissions.includes(p)?ACCENT:"#fff",
                    color: form.permissions.includes(p)?"#fff":"#6b7280",
                    borderColor: form.permissions.includes(p)?ACCENT:"#e5e7eb" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:"14px 24px", borderTop:"1px solid #f3f4f6", display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={()=>{ if(!form.name){alert("Name required.");return;} onSave(form); }}
            style={{ padding:"8px 18px", borderRadius:8, border:"none", background:ACCENT, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            {existing?"Save Changes":"Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { users, roles, activityLog, createUser, updateUser, deleteUser, toggleUserStatus, resetPassword, createRole, updateRole, deleteRole } = useApp();
  const [tab, setTab]       = useState("users");
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [logModF, setLogModF] = useState("all");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editRole, setEditRole]         = useState(null);
  const [resetUserId, setResetUserId]   = useState(null);
  const [newPwd, setNewPwd]             = useState("");

  const filteredUsers = useMemo(()=>(users||[]).filter(u=>{
    const q=search.toLowerCase();
    const mQ=!q||u.firstName?.toLowerCase().includes(q)||u.username?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q);
    const mS=statusF==="all"||u.status===statusF;
    return mQ&&mS;
  }),[users,search,statusF]);

  const filteredLog = useMemo(()=>(activityLog||[]).filter(l=>{
    const mM=logModF==="all"||l.module?.toLowerCase().includes(logModF.toLowerCase());
    const q=search.toLowerCase();
    const mQ=!q||l.user?.toLowerCase().includes(q)||l.action?.toLowerCase().includes(q)||l.detail?.toLowerCase().includes(q);
    return mM&&mQ;
  }),[activityLog,logModF,search]);

  const stats = {
    total:    (users||[]).length,
    active:   (users||[]).filter(u=>u.status==="active").length,
    roles:    (roles||[]).length,
    inactive: (users||[]).filter(u=>u.status!=="active").length,
  };

  const STAT_CARDS = [
    { label:"Total Users",      value:stats.total,    icon:"users",    bg:"#eff6ff", color:"#3b82f6" },
    { label:"Active Users",     value:stats.active,   icon:"check",    bg:"#f0fdf4", color:"#10b981" },
    { label:"Roles Defined",    value:stats.roles,    icon:"shield",   bg:"#f5f3ff", color:"#8b5cf6" },
    { label:"Inactive / Locked",value:stats.inactive, icon:"close",    bg:"#f8fafc", color:"#64748b" },
  ];

  const ROLE_COLORS = ["#f97316","#8b5cf6","#10b981","#3b82f6","#ef4444","#f59e0b"];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <UniversalTopbar moduleTitle="User Management" pageTitle={tab==="users"?"User List":tab==="roles"?"Role Management":"Audit Log"} accentColor={ACCENT} />
      <div style={{ flex:1, overflowY:"auto", background:"#f9fafb" }}>
        <div style={{ padding:"28px 32px", maxWidth:1400, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Header */}
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", margin:0 }}>User Management</h2>
            <p style={{ fontSize:12.5, color:"#94a3b8", margin:"3px 0 0" }}>Manage users, define roles and assign authorizations</p>
          </div>

          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {STAT_CARDS.map(s=>(
              <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                  <Icon name={s.icon} size={17} color={s.color} />
                </div>
                <div style={{ fontSize:13, color:"#94a3b8", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:24, fontWeight:700, color:"#0f172a" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e9ecef", overflow:"hidden" }}>
            <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 4px" }}>
              {[["users","👤 User List"],["roles","🛡 Role Management"],["log","📋 Audit Log"]].map(([id,label])=>(
                <button key={id} onClick={()=>setTab(id)}
                  style={{ padding:"12px 18px", fontSize:13.5, fontWeight:tab===id?700:500, color:tab===id?"#fff":"#6b7280", background:tab===id?ACCENT:"transparent", border:"none", borderRadius:tab===id?8:0, cursor:"pointer", margin:"4px 2px", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── User List tab ── */}
            {tab === "users" && (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid #f8fafc", flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 12px", flex:1, maxWidth:260 }}>
                    <Icon name="search" size={14} color="#94a3b8" />
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"
                      style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", flex:1, color:"#374151" }} />
                  </div>
                  <div className="filter-tabs">
                    {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([v,l])=>(
                      <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>setStatusF(v)}>{l}</button>
                    ))}
                  </div>
                  <button onClick={()=>{setEditUser(null);setShowUserForm(true);}} style={{ marginLeft:"auto", padding:"8px 16px", background:ACCENT, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="plus" size={14} color="#fff" /> New User
                  </button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["ID","Name","Username","Email","Department","Role","Status","Last Login","Actions"].map(h=>(
                          <th key={h} style={{ padding:"9px 16px", fontSize:11, fontWeight:600, color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1px solid #f1f5f9", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u=>{
                        const role = (roles||[]).find(r=>r.id===u.role?.id||r.id===u.roleId);
                        const initials = `${u.firstName?.[0]||""}${u.lastName?.[0]||""}`.toUpperCase()||u.username?.[0]?.toUpperCase()||"U";
                        const colors = ["#f97316","#8b5cf6","#10b981","#3b82f6","#ef4444","#f59e0b"];
                        const clr = colors[u.id?.charCodeAt(4)%colors.length]||"#8b5cf6";
                        return (
                          <tr key={u.id} style={{ borderBottom:"1px solid #f8fafc" }} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                            <td style={{ padding:"11px 16px", fontSize:12, fontWeight:600, color:ACCENT }}>{u.id}</td>
                            <td style={{ padding:"11px 16px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                <div style={{ width:30, height:30, borderRadius:"50%", background:clr, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>
                                  {u.photo ? <img src={u.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} /> : initials}
                                </div>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{u.firstName} {u.lastName}</div>
                                  <div style={{ fontSize:11, color:"#94a3b8" }}>{u.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{u.username}</td>
                            <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{u.email}</td>
                            <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{u.department||"—"}</td>
                            <td style={{ padding:"11px 16px" }}>
                              <span style={{ fontSize:11.5, fontWeight:700, background:ACCENT+"15", color:ACCENT, padding:"2px 9px", borderRadius:20 }}>{role?.name||u.role?.name||"—"}</span>
                            </td>
                            <td style={{ padding:"11px 16px" }}>
                              <span style={{ fontSize:11.5, fontWeight:600, background:u.status==="active"?"#f0fdf4":"#f8fafc", color:u.status==="active"?"#16a34a":"#64748b", padding:"2px 9px", borderRadius:20 }}>{u.status}</span>
                            </td>
                            <td style={{ padding:"11px 16px", fontSize:12, color:"#94a3b8" }}>{fmtDate(u.lastLogin)}</td>
                            <td style={{ padding:"11px 16px" }}>
                              <div style={{ display:"flex", gap:4 }}>
                                <button title="Edit" onClick={()=>{setEditUser(u);setShowUserForm(true);}} style={{ width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <Icon name="edit" size={13} color="#6b7280" />
                                </button>
                                <button title="Reset Password" onClick={()=>{setResetUserId(u.id);setNewPwd("");}} style={{ width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <Icon name="shield" size={13} color="#6b7280" />
                                </button>
                                <button title={u.status==="active"?"Lock":"Unlock"} onClick={()=>toggleUserStatus(u.id)} style={{ width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <Icon name={u.status==="active"?"close":"check"} size={13} color={u.status==="active"?"#f59e0b":"#10b981"} />
                                </button>
                                <button title="Delete" onClick={()=>{if(window.confirm("Delete this user?"))deleteUser(u.id);}} style={{ width:28, height:28, borderRadius:7, border:"1px solid #fecaca", background:"#fef2f2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <Icon name="close" size={13} color="#ef4444" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!filteredUsers.length && <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"#94a3b8" }}>No users found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Roles tab ── */}
            {tab === "roles" && (
              <div style={{ padding:20 }}>
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
                  <button onClick={()=>{setEditRole(null);setShowRoleForm(true);}} style={{ padding:"8px 16px", background:ACCENT, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="plus" size={14} color="#fff" /> New Role
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14 }}>
                  {(roles||[]).map((role,idx)=>(
                    <div key={role.id} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"18px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:ROLE_COLORS[idx%ROLE_COLORS.length] }} />
                          <span style={{ fontSize:14.5, fontWeight:700, color:"#0f172a" }}>{role.name}</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:ACCENT, background:ACCENT+"15", padding:"2px 8px", borderRadius:20 }}>{role.id}</span>
                      </div>
                      <p style={{ fontSize:12.5, color:"#64748b", marginBottom:12 }}>{role.description||"—"}</p>
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
                          AUTHORIZATIONS ({(role.permissions||[]).length})
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {(role.permissions||[]).slice(0,6).map(p=>(
                            <span key={p} style={{ fontSize:11, background:"#f8fafc", color:"#64748b", border:"1px solid #e2e8f0", padding:"2px 8px", borderRadius:6 }}>{p}</span>
                          ))}
                          {(role.permissions||[]).length > 6 && (
                            <span style={{ fontSize:11, color:"#94a3b8" }}>+{(role.permissions||[]).length-6} more</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8, borderTop:"1px solid #f8fafc", paddingTop:12 }}>
                        <button onClick={()=>{setEditRole(role);setShowRoleForm(true);}} style={{ flex:1, padding:"6px", background:"#f8fafc", color:"#374151", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:12.5, fontWeight:600 }}>Edit</button>
                        <button onClick={()=>{if(window.confirm("Delete role?"))deleteRole(role.id);}} style={{ flex:1, padding:"6px", background:"#fef2f2", color:"#ef4444", border:"1px solid #fecaca", borderRadius:8, cursor:"pointer", fontSize:12.5, fontWeight:600 }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Audit Log tab ── */}
            {tab === "log" && (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid #f8fafc", flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 12px", flex:1, maxWidth:260 }}>
                    <Icon name="search" size={14} color="#94a3b8" />
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs…"
                      style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", flex:1, color:"#374151" }} />
                  </div>
                  <div className="filter-tabs">
                    {[["all","All"],["auth","Auth"],["user","User Mgmt"],["purchase","Purchase"],["settings","Settings"],["backup","Backup"]].map(([v,l])=>(
                      <button key={v} className={`filter-tab ${logModF===v?"filter-active":""}`} onClick={()=>setLogModF(v)} >{l}</button>
                    ))}
                  </div>
                  <button style={{ marginLeft:"auto", padding:"7px 14px", background:"#fff", color:"#374151", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <Icon name="download" size={13} color="#6b7280" /> Export Log
                  </button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["#","Timestamp","User","Action","Module","Details"].map(h=>(
                          <th key={h} style={{ padding:"9px 16px", fontSize:11, fontWeight:600, color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.slice(0,50).map((log,i)=>(
                        <tr key={i} style={{ borderBottom:"1px solid #f8fafc" }}>
                          <td style={{ padding:"10px 16px", fontSize:12, color:"#94a3b8" }}>{i+1}</td>
                          <td style={{ padding:"10px 16px", fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <Icon name="eye" size={12} color="#cbd5e1" />
                              {fmtDate(log.timestamp)}
                            </div>
                          </td>
                          <td style={{ padding:"10px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                              <div style={{ width:24, height:24, borderRadius:"50%", background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff" }}>{log.user?.[0]?.toUpperCase()||"?"}</div>
                              <span style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>{log.user||"—"}</span>
                            </div>
                          </td>
                          <td style={{ padding:"10px 16px" }}>
                            <span style={{ fontSize:12, fontWeight:700, background:log.action?.toLowerCase().includes("login")?"#eff6ff":log.action?.toLowerCase().includes("create")?"#f0fdf4":log.action?.toLowerCase().includes("delete")?"#fef2f2":"#f8fafc",
                              color:log.action?.toLowerCase().includes("login")?"#2563eb":log.action?.toLowerCase().includes("create")?"#16a34a":log.action?.toLowerCase().includes("delete")?"#dc2626":"#64748b",
                              padding:"2px 9px", borderRadius:20 }}>{log.action||"—"}</span>
                          </td>
                          <td style={{ padding:"10px 16px", fontSize:12.5, color:"#374151" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <Icon name="user" size={12} color="#cbd5e1" />
                              {log.module||"—"}
                            </div>
                          </td>
                          <td style={{ padding:"10px 16px", fontSize:12.5, color:"#64748b" }}>{log.detail||"—"}</td>
                        </tr>
                      ))}
                      {!filteredLog.length && <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#94a3b8" }}>No log entries found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUserForm && <UserModal existing={editUser} roles={roles||[]} onClose={()=>{setShowUserForm(false);setEditUser(null);}} onSave={d=>{ editUser?updateUser(editUser.id,d):createUser(d); setShowUserForm(false);setEditUser(null); }} />}
      {showRoleForm && <RoleModal existing={editRole} onClose={()=>{setShowRoleForm(false);setEditRole(null);}} onSave={d=>{ editRole?updateRole(editRole.id,d):createRole(d); setShowRoleForm(false);setEditRole(null); }} />}

      {/* Reset Password */}
      {resetUserId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:380, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
            <div style={{ padding:"18px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:700 }}>Reset Password</span>
              <button onClick={()=>setResetUserId(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
            </div>
            <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:12 }}>
              <p style={{ fontSize:13, color:"#64748b" }}>Set a new password for this user account.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>New Password</label>
                <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Min 6 characters"
                  style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none" }} />
              </div>
            </div>
            <div style={{ padding:"14px 22px", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setResetUserId(null)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{ if(newPwd.length<6){alert("Min 6 chars");return;} resetPassword(resetUserId,newPwd); setResetUserId(null); }} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:ACCENT, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
