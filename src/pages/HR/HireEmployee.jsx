import { useState } from "react";
import { HR_COLOR, SEED_EMPLOYEES, SEED_POSITIONS, SEED_ORG, GENDERS } from "./hrConstants";
import Icon from "../../components/common/Icon";

const C = HR_COLOR;

function Input(props) {
  return <input {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box", background: props.readOnly ? "#f8fafc" : "#fff", ...props.style }} />;
}
function Select({ children, ...props }) {
  return <select {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box", background:"#fff" }}>{children}</select>;
}
function Label({ children, required }) {
  return <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>{children}{required && <span style={{ color:C }}> *</span>}</label>;
}
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12, paddingBottom:8, borderBottom:"1px solid #f1f5f9" }}>{title}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>{children}</div>
    </div>
  );
}
function Col({ span, children }) {
  return <div style={{ gridColumn: span ? "1/-1" : undefined }}>{children}</div>;
}

// ── F4 Position Lookup ────────────────────────────────────────────────────────
function F4Lookup({ positions, depts, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = positions.filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    p.code.toLowerCase().includes(q.toLowerCase())
  );
  const getDept = (id) => depts.find(d=>d.id===id)?.name || "—";
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, width:580, maxHeight:"70vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>F4 — Select Position</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Search and select a position to assign</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#94a3b8", display:"flex" }}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:9, padding:"7px 12px" }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input autoFocus placeholder="Search by title or code…" value={q} onChange={e=>setQ(e.target.value)}
              style={{ border:"none", background:"transparent", fontSize:13, outline:"none", flex:1, color:"#0f172a" }} />
            {q && <button onClick={()=>setQ("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:0,display:"flex" }}><Icon name="close" size={13}/></button>}
          </div>
        </div>
        {/* Results */}
        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.length === 0 && (
            <div style={{ padding:"32px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>No positions found</div>
          )}
          {filtered.map(pos => (
            <div key={pos.id} onClick={() => onSelect(pos)}
              style={{ padding:"11px 20px", borderBottom:"1px solid #f8fafc", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"background 0.1s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >
              <div style={{ width:36, height:36, borderRadius:9, background:C+"15", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="briefcase" size={16} color={C} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{pos.title}</div>
                <div style={{ fontSize:11.5, color:"#94a3b8", marginTop:1 }}>
                  {pos.code} · {pos.grade} · {getDept(pos.deptId)}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <span style={{ fontSize:10.5, background: pos.filled?"#fef9c3":"#f0fdf4", color: pos.filled?"#854d0e":"#166534", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>
                  {pos.filled ? "Filled" : "Vacant"}
                </span>
                <span style={{ fontSize:10.5, background:"#f1f5f9", color:"#64748b", padding:"2px 8px", borderRadius:20 }}>{pos.type}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 20px", borderTop:"1px solid #f1f5f9", fontSize:11.5, color:"#94a3b8" }}>
          {filtered.length} position{filtered.length!==1?"s":""} found · Click to select
        </div>
      </div>
    </div>
  );
}

// ── Employee row in list ──────────────────────────────────────────────────────
function EmpRow({ emp, positions, depts, onView }) {
  const pos  = positions.find(p=>p.id===emp.positionId);
  const dept = depts.find(d=>d.id===emp.deptId);
  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
  const colors = ["#f97316","#3b82f6","#22c55e","#8b5cf6","#f59e0b","#ef4444",C];
  const color  = colors[emp.id.charCodeAt(emp.id.length-1) % colors.length];
  return (
    <tr style={{ borderBottom:"1px solid #f8fafc" }}
      onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
      onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
      <td style={{ padding:"11px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color, flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>{emp.firstName} {emp.lastName}</div>
            <div style={{ fontSize:11, color:"#94a3b8" }}>{emp.empNo}</div>
          </div>
        </div>
      </td>
      <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151", fontWeight:500 }}>{pos?.title || "—"}</td>
      <td style={{ padding:"11px 16px", fontSize:12.5, color:"#64748b" }}>{dept?.name || "—"}</td>
      <td style={{ padding:"11px 16px", fontSize:12, color:"#64748b" }}>{emp.joinDate}</td>
      <td style={{ padding:"11px 16px" }}>
        <span style={{ background: emp.linkedUserId ? "#f0fdf4" : "#f8fafc", color: emp.linkedUserId ? "#16a34a" : "#94a3b8", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>
          {emp.linkedUserId ? "Linked" : "Unlinked"}
        </span>
      </td>
      <td style={{ padding:"11px 16px" }}>
        <span style={{ background: emp.status==="Active"?"#f0fdf4":"#fef2f2", color: emp.status==="Active"?"#16a34a":"#dc2626", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>
          {emp.status}
        </span>
      </td>
      <td style={{ padding:"11px 16px" }}>
        <button onClick={() => onView(emp)}
          style={{ padding:"4px 12px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:11.5, cursor:"pointer", fontWeight:500 }}>
          View
        </button>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const EMPTY_EMP = { firstName:"", lastName:"", gender:"Male", dob:"", cnic:"", phone:"", email:"", joinDate:"", positionId:"", deptId:"", status:"Active" };

export default function HireEmployee() {
  const [employees, setEmployees] = useState(SEED_EMPLOYEES);
  const [positions] = useState(SEED_POSITIONS);
  const [showForm, setShowForm]   = useState(false);
  const [showF4,   setShowF4]     = useState(false);
  const [viewing,  setViewing]    = useState(null);
  const [form, setForm]           = useState(EMPTY_EMP);
  const [search, setSearch]       = useState("");

  const depts = SEED_ORG.departments;
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // When F4 selects a position — auto-fill dept
  const selectPosition = (pos) => {
    setForm(p => ({ ...p, positionId: pos.id, deptId: pos.deptId }));
    setShowF4(false);
  };

  const hire = () => {
    if (!form.firstName || !form.lastName || !form.positionId) return;
    const id    = `EMP-${String(employees.length+1).padStart(3,"0")}`;
    const empNo = `E-${String(employees.length+1).padStart(4,"0")}`;
    setEmployees(es => [...es, { ...form, id, empNo, linkedUserId:null }]);
    setShowForm(false);
    setForm(EMPTY_EMP);
  };

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.empNo}`.toLowerCase().includes(search.toLowerCase())
  );

  const selPos  = positions.find(p => p.id === form.positionId);
  const selDept = depts.find(d => d.id === form.deptId);

  return (
    <div style={{ padding:"24px 28px", maxWidth:1200, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Employee Management</h1>
          <p style={{ fontSize:13, color:"#94a3b8", margin:"4px 0 0" }}>Hire employees and assign to positions</p>
        </div>
        <button onClick={() => { setForm(EMPTY_EMP); setShowForm(true); }}
          style={{ padding:"9px 18px", borderRadius:9, background:C, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
          <Icon name="userplus" size={15} color="#fff" /> Hire Employee
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Employees", value:employees.length,                                      color:"#3b82f6", bg:"#eff6ff", icon:"users"    },
          { label:"Active",          value:employees.filter(e=>e.status==="Active").length,        color:"#16a34a", bg:"#f0fdf4", icon:"check"    },
          { label:"User Linked",     value:employees.filter(e=>e.linkedUserId).length,             color:C,         bg:C+"15",   icon:"link"     },
          { label:"Unlinked",        value:employees.filter(e=>!e.linkedUserId).length,            color:"#d97706", bg:"#fffbeb", icon:"userplus"  },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f8fafc", display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 11px", flex:1, maxWidth:280 }}>
            <Icon name="search" size={13} color="#94a3b8" />
            <input placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", width:"100%" }} />
          </div>
          <span style={{ fontSize:12, color:"#94a3b8" }}>{filtered.length} employee{filtered.length!==1?"s":""}</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Employee","Position","Department","Join Date","User Account","Status",""].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => <EmpRow key={emp.id} emp={emp} positions={positions} depts={depts} onView={setViewing} />)}
          </tbody>
        </table>
      </div>

      {/* ── Hire Form ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, width:600, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
            {/* Header */}
            <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>Hire New Employee</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Fill in employee details and assign position</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#94a3b8", display:"flex" }}>
                <Icon name="close" size={16} />
              </button>
            </div>

            <div style={{ padding:"20px 24px" }}>
              <Section title="Personal Information">
                <Col><Label required>First Name</Label><Input value={form.firstName} onChange={f("firstName")} placeholder="First name" /></Col>
                <Col><Label required>Last Name</Label><Input value={form.lastName} onChange={f("lastName")} placeholder="Last name" /></Col>
                <Col><Label>Gender</Label>
                  <Select value={form.gender} onChange={f("gender")}>
                    {GENDERS.map(g=><option key={g}>{g}</option>)}
                  </Select>
                </Col>
                <Col><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={f("dob")} /></Col>
                <Col span><Label>CNIC</Label><Input value={form.cnic} onChange={f("cnic")} placeholder="35201-XXXXXXX-X" /></Col>
              </Section>

              <Section title="Contact Details">
                <Col><Label>Phone</Label><Input value={form.phone} onChange={f("phone")} placeholder="+92-300-XXXXXXX" /></Col>
                <Col><Label>Email</Label><Input type="email" value={form.email} onChange={f("email")} placeholder="name@barkahflow.com" /></Col>
              </Section>

              <Section title="Employment Details">
                <Col span>
                  <Label required>Position</Label>
                  {/* F4 Lookup field */}
                  <div style={{ display:"flex", gap:8 }}>
                    <div style={{ flex:1, padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color: selPos ? "#0f172a" : "#94a3b8", background:"#f8fafc", display:"flex", alignItems:"center", gap:8 }}>
                      {selPos ? (
                        <><Icon name="briefcase" size={14} color={C} />
                        <span style={{ color:"#0f172a", fontWeight:600 }}>{selPos.title}</span>
                        <span style={{ color:"#94a3b8", fontSize:11.5 }}>({selPos.code} · {selPos.grade})</span></>
                      ) : (
                        <span>No position selected — use F4 to search</span>
                      )}
                    </div>
                    <button onClick={() => setShowF4(true)}
                      style={{ padding:"8px 14px", borderRadius:8, background:C, border:"none", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer", letterSpacing:"0.02em", flexShrink:0 }}>
                      F4
                    </button>
                  </div>
                </Col>
                <Col span>
                  <Label>Department (auto-filled from position)</Label>
                  <Input value={selDept?.name || ""} readOnly placeholder="Auto-filled when position is selected" />
                </Col>
                <Col><Label required>Join Date</Label><Input type="date" value={form.joinDate} onChange={f("joinDate")} /></Col>
                <Col><Label>Status</Label>
                  <Select value={form.status} onChange={f("status")}>
                    <option>Active</option><option>Inactive</option>
                  </Select>
                </Col>
              </Section>
            </div>

            <div style={{ padding:"0 24px 20px", display:"flex", gap:10 }}>
              <button style={{ flex:1, padding:"10px 0", background:C, color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer" }} onClick={hire}>
                Hire Employee
              </button>
              <button style={{ flex:1, padding:"10px 0", background:"#f8fafc", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── F4 Lookup ── */}
      {showF4 && <F4Lookup positions={positions} depts={depts} onSelect={selectPosition} onClose={() => setShowF4(false)} />}

      {/* ── View Employee ── */}
      {viewing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setViewing(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:480, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>Employee Profile</span>
              <button onClick={() => setViewing(null)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#94a3b8", display:"flex" }}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div style={{ padding:"20px" }}>
              {/* Avatar */}
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:"14px 16px", background:`${C}10`, borderRadius:12, border:`1px solid ${C}25` }}>
                <div style={{ width:52, height:52, borderRadius:14, background:C, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fff" }}>
                  {viewing.firstName[0]}{viewing.lastName[0]}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{viewing.firstName} {viewing.lastName}</div>
                  <div style={{ fontSize:12.5, color:"#64748b", marginTop:2 }}>{viewing.empNo}</div>
                  <div style={{ fontSize:12, color:C, fontWeight:600, marginTop:2 }}>
                    {positions.find(p=>p.id===viewing.positionId)?.title || "No Position"}
                  </div>
                </div>
              </div>
              {[
                ["Department", SEED_ORG.departments.find(d=>d.id===viewing.deptId)?.name || "—"],
                ["Gender",     viewing.gender],
                ["CNIC",       viewing.cnic || "—"],
                ["Phone",      viewing.phone || "—"],
                ["Email",      viewing.email || "—"],
                ["Join Date",  viewing.joinDate || "—"],
                ["User Account", viewing.linkedUserId ? "✓ Linked" : "Not linked yet"],
                ["Status",     viewing.status],
              ].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f8fafc", fontSize:13 }}>
                  <span style={{ color:"#94a3b8", fontWeight:600 }}>{l}</span>
                  <span style={{ color:"#0f172a", fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
