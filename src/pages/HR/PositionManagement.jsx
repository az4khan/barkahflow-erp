import { useState } from "react";
import { HR_COLOR, SEED_POSITIONS, SEED_ORG, GRADES, POSITION_TYPES } from "./hrConstants";
import Icon from "../../components/common/Icon";
import { Modal } from "../../components/common/UI";

const C = HR_COLOR;

function Input(props) {
  return <input {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box" }} />;
}
function Select({ children, ...props }) {
  return <select {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box", background:"#fff" }}>{children}</select>;
}
function Label({ children }) {
  return <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>{children}</label>;
}

const TYPE_COLORS = { Executive:["#fff7ed","#ea580c"], Management:["#eff6ff","#2563eb"], Staff:["#f0fdf4","#16a34a"], Contractual:["#f5f3ff","#7c3aed"] };

export default function PositionManagement() {
  const [positions, setPositions] = useState(SEED_POSITIONS);
  const [search, setSearch]       = useState("");
  const [filterType, setFilter]   = useState("All");
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({});
  const [viewTree, setViewTree]   = useState(false);

  const depts = SEED_ORG.departments;
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const EMPTY = { title:"", code:"", deptId:"", grade:"G-5", reportsTo:"", type:"Staff", status:"Active" };

  const filtered = positions.filter(p =>
    (filterType === "All" || p.type === filterType) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  const save = () => {
    if (!form.title || !form.code) return;
    if (form.id) {
      setPositions(ps => ps.map(p => p.id === form.id ? { ...form } : p));
    } else {
      const id = `POS-${String(positions.length + 1).padStart(3,"0")}`;
      setPositions(ps => [...ps, { ...form, id, filled:false }]);
    }
    setModal(null);
  };

  const getDeptName = (id) => depts.find(d => d.id === id)?.name || "—";
  const getPos = (id) => positions.find(p => p.id === id);

  // Build org tree for a position
  const getReportees = (posId) => positions.filter(p => p.reportsTo === posId);

  function OrgNode({ pos, depth=0 }) {
    const [open, setOpen] = useState(depth < 2);
    const children = getReportees(pos.id);
    return (
      <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:8, background: depth===0 ? C+"12" : "#f8fafc", marginBottom:4, border:`1px solid ${depth===0 ? C+"30" : "#f1f5f9"}` }}>
          {children.length > 0 && (
            <button onClick={() => setOpen(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", color:"#94a3b8" }}>
              <Icon name={open?"chevronDown":"chevron"} size={13} color="#94a3b8" />
            </button>
          )}
          {children.length === 0 && <div style={{ width:13 }} />}
          <div style={{ width:28, height:28, borderRadius:8, background: depth===0 ? C : "#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="user" size={13} color={depth===0 ? "#fff" : "#64748b"} />
          </div>
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#0f172a" }}>{pos.title}</div>
            <div style={{ fontSize:10.5, color:"#94a3b8" }}>{pos.code} · {pos.grade} · {getDeptName(pos.deptId)}</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:10, background: pos.filled ? "#dcfce7" : "#fef9c3", color: pos.filled ? "#166534" : "#854d0e", padding:"1px 8px", borderRadius:20, fontWeight:700 }}>
              {pos.filled ? "Filled" : "Vacant"}
            </span>
          </div>
        </div>
        {open && children.map(c => <OrgNode key={c.id} pos={c} depth={depth+1} />)}
      </div>
    );
  }

  const topLevelPositions = positions.filter(p => !p.reportsTo);

  const stats = {
    total:  positions.length,
    filled: positions.filter(p=>p.filled).length,
    vacant: positions.filter(p=>!p.filled).length,
  };

  return (
    <div style={{ padding:"24px 28px", maxWidth:1200, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Position Management</h1>
          <p style={{ fontSize:13, color:"#94a3b8", margin:"4px 0 0" }}>Define positions, grades & reporting lines</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setViewTree(t=>!t)}
            style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${viewTree ? C : "#e2e8f0"}`, background: viewTree ? C+"10" : "#fff", color: viewTree ? C : "#64748b", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="sitemap" size={14} color={viewTree ? C : "#64748b"} />
            {viewTree ? "Table View" : "Org Chart"}
          </button>
          <button onClick={() => { setForm(EMPTY); setModal("form"); }}
            style={{ padding:"8px 16px", borderRadius:9, background:C, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="plus" size={14} color="#fff" /> New Position
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Positions", value:stats.total,  color:"#3b82f6", bg:"#eff6ff" },
          { label:"Filled",          value:stats.filled, color:"#16a34a", bg:"#f0fdf4" },
          { label:"Vacant",          value:stats.vacant, color:"#d97706", bg:"#fffbeb" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="briefcase" size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {viewTree ? (
        /* Org Chart View */
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:16 }}>Reporting Structure</div>
          {topLevelPositions.map(p => <OrgNode key={p.id} pos={p} />)}
        </div>
      ) : (
        /* Table View */
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, overflow:"hidden" }}>
          {/* Filters */}
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f8fafc", display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 11px", flex:1, maxWidth:260 }}>
              <Icon name="search" size={13} color="#94a3b8" />
              <input placeholder="Search positions…" value={search} onChange={e=>setSearch(e.target.value)} style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", width:"100%" }} />
            </div>
            {["All","Executive","Management","Staff","Contractual"].map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding:"5px 12px", borderRadius:20, border:"1px solid", fontSize:11.5, fontWeight:500, cursor:"pointer",
                  background: filterType===t ? C : "#fff", color: filterType===t ? "#fff" : "#64748b", borderColor: filterType===t ? C : "#e2e8f0" }}>
                {t}
              </button>
            ))}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Position","Code","Department","Grade","Reports To","Type","Status",""].map(h => (
                  <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(pos => {
                const [bg,cl] = TYPE_COLORS[pos.type] || ["#f1f5f9","#374151"];
                const reportsTo = getPos(pos.reportsTo);
                return (
                  <tr key={pos.id} style={{ borderBottom:"1px solid #f8fafc" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ fontWeight:700, color:"#0f172a", fontSize:13 }}>{pos.title}</div>
                      <div style={{ fontSize:11, color: pos.filled ? "#16a34a" : "#d97706", fontWeight:600 }}>{pos.filled ? "● Filled" : "○ Vacant"}</div>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ background:"#f1f5f9", color:"#374151", padding:"2px 8px", borderRadius:6, fontSize:12, fontWeight:700, fontFamily:"monospace" }}>{pos.code}</span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12.5, color:"#64748b" }}>{getDeptName(pos.deptId)}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ background:C+"15", color:C, padding:"2px 9px", borderRadius:20, fontSize:11.5, fontWeight:700 }}>{pos.grade}</span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12.5, color:"#64748b" }}>{reportsTo?.title || "—"}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ background:bg, color:cl, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{pos.type}</span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ background: pos.status==="Active" ? "#f0fdf4" : "#fef2f2", color: pos.status==="Active" ? "#16a34a" : "#dc2626", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                        {pos.status}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <button onClick={() => { setForm({...pos}); setModal("form"); }}
                        style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:11.5, cursor:"pointer", fontWeight:500 }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {modal === "form" && (
        <Modal title={form.id ? "Edit Position" : "New Position"} onClose={() => setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <Label>Position Title *</Label>
              <Input value={form.title||""} onChange={f("title")} placeholder="e.g. Purchase Manager" />
            </div>
            <div>
              <Label>Position Code *</Label>
              <Input value={form.code||""} onChange={f("code")} placeholder="e.g. PM" />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={form.grade||"G-5"} onChange={f("grade")}>
                {GRADES.map(g=><option key={g}>{g}</option>)}
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type||"Staff"} onChange={f("type")}>
                {POSITION_TYPES.map(t=><option key={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.deptId||""} onChange={f("deptId")}>
                <option value="">— None —</option>
                {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <Label>Reports To</Label>
              <Select value={form.reportsTo||""} onChange={f("reportsTo")}>
                <option value="">— No Reporting (Top Level) —</option>
                {positions.filter(p=>p.id!==form.id).map(p=><option key={p.id} value={p.id}>{p.title} ({p.code})</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status||"Active"} onChange={f("status")}>
                <option>Active</option><option>Inactive</option>
              </Select>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button style={{ flex:1, padding:"9px 0", background:C, color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer" }} onClick={save}>
              {form.id ? "Save Changes" : "Create Position"}
            </button>
            <button style={{ flex:1, padding:"9px 0", background:"#f8fafc", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
