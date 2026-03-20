import { useState } from "react";
import { ACCENT, fmtPKR } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal, StatusBadge, StatCard } from "../../components/common/UI";

const MOCK_PRS = [
  { id:"PR-001", title:"LPG Cylinders 45kg",    dept:"Procurement", qty:2000, unit:"Cylinders", estCost:17000000, priority:"High",   status:"Pending",   date:"2026-03-01", requestedBy:"Hassan Raza",  notes:"Urgent — Q1 stock low" },
  { id:"PR-002", title:"LPG Bulk MT",            dept:"Operations",  qty:500,  unit:"Metric Ton",estCost:3900000,  priority:"Medium", status:"Approved",  date:"2026-02-25", requestedBy:"Ali Shah",     notes:"Routine replenishment" },
  { id:"PR-003", title:"Pressure Regulators",    dept:"Maintenance", qty:150,  unit:"Pieces",    estCost:450000,   priority:"Low",    status:"Rejected",  date:"2026-02-20", requestedBy:"Sara Malik",   notes:"Replacement batch" },
  { id:"PR-004", title:"LPG Cylinders 11.8kg",   dept:"Procurement", qty:5000, unit:"Cylinders", estCost:16000000, priority:"High",   status:"Pending",   date:"2026-03-03", requestedBy:"Hassan Raza",  notes:"Distribution order" },
  { id:"PR-005", title:"Safety Valves",          dept:"Maintenance", qty:80,   unit:"Pieces",    estCost:240000,   priority:"Medium", status:"Forwarded", date:"2026-03-05", requestedBy:"Omar Farooq", notes:"Annual maintenance" },
];

const PRIORITY_COLORS = { High:["#fef2f2","#dc2626"], Medium:["#fffbeb","#d97706"], Low:["#f0fdf4","#16a34a"] };
const STATUS_COLORS   = { Pending:["#fef9c3","#854d0e"], Approved:["#dcfce7","#166534"], Rejected:["#fee2e2","#991b1b"], Forwarded:["#dbeafe","#1e40af"] };

function Badge({ label, colors }) {
  return <span style={{ background:colors[0], color:colors[1], padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>;
}

const EMPTY = { title:"", dept:"Procurement", qty:"", unit:"Cylinders", estCost:"", priority:"Medium", notes:"" };

export default function PRRequisition({ onNav }) {
  const [prs, setPrs]         = useState(MOCK_PRS);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [viewing, setViewing] = useState(null);

  const filtered = prs.filter(p =>
    (filter === "All" || p.status === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = () => {
    if (!form.title || !form.qty) return;
    const newPR = { ...form, id:`PR-00${prs.length+1}`, status:"Pending", date: new Date().toISOString().slice(0,10), requestedBy:"Hassan Raza", qty:Number(form.qty), estCost:Number(form.estCost) };
    setPrs(p => [newPR, ...p]);
    setShowModal(false);
    setForm(EMPTY);
  };

  const stats = {
    total: prs.length,
    pending: prs.filter(p=>p.status==="Pending").length,
    approved: prs.filter(p=>p.status==="Approved").length,
    totalValue: prs.reduce((s,p)=>s+p.estCost,0),
  };

  return (
    <div className="pm-page">
      {/* Header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Purchase Requisition</h1>
          <p className="pm-page-sub">Internal material requests — awaiting approval</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("pr-approval")}>
            PR Approval →
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => setShowModal(true)}>
            + New Requisition
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard icon="list"    iconColor="#0ea5e9" iconBg="#f0f9ff" label="Total PRs"       value={stats.total}              />
        <StatCard icon="clock"   iconColor="#d97706" iconBg="#fffbeb" label="Pending"          value={stats.pending}            />
        <StatCard icon="check"   iconColor="#16a34a" iconBg="#f0fdf4" label="Approved"         value={stats.approved}           />
        <StatCard icon="invoice" iconColor="#f97316" iconBg="#fff7ed" label="Est. Total Cost"  value={fmtPKR(stats.totalValue)} />
      </div>

      {/* Table */}
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <span className="pm-table-title">All Requisitions</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {["All","Pending","Approved","Rejected","Forwarded"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"4px 12px", borderRadius:20, border:"1px solid", fontSize:12, fontWeight:500, cursor:"pointer",
                  background: filter===f ? ACCENT : "#fff",
                  color: filter===f ? "#fff" : "#64748b",
                  borderColor: filter===f ? ACCENT : "#e2e8f0" }}
              >{f}</button>
            ))}
            <div className="pm-search-bar">
              <Icon name="search" size={13} color="#94a3b8" />
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="pm-table">
          <thead>
            <tr>
              <th>PR ID</th><th>Title</th><th>Department</th><th>Qty</th>
              <th>Est. Cost</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pr => (
              <tr key={pr.id}>
                <td><span style={{ fontWeight:700, color:ACCENT }}>{pr.id}</span></td>
                <td><div style={{ fontWeight:600, color:"#0f172a" }}>{pr.title}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{pr.requestedBy}</div></td>
                <td style={{ color:"#64748b" }}>{pr.dept}</td>
                <td style={{ fontWeight:600 }}>{pr.qty.toLocaleString()} <span style={{ fontSize:11, color:"#94a3b8" }}>{pr.unit}</span></td>
                <td style={{ fontWeight:600 }}>{fmtPKR(pr.estCost)}</td>
                <td><Badge label={pr.priority} colors={PRIORITY_COLORS[pr.priority]} /></td>
                <td><Badge label={pr.status}   colors={STATUS_COLORS[pr.status]}     /></td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{pr.date}</td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="pm-btn pm-btn-ghost" onClick={() => setViewing(pr)} style={{ padding:"4px 8px", fontSize:11 }}>View</button>
                    {pr.status === "Pending" && (
                      <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("pr-approval")} style={{ padding:"4px 8px", fontSize:11 }}>
                        Forward
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="pm-empty"><div className="pm-empty-icon">📋</div><div className="pm-empty-text">No requisitions found</div></div>}
      </div>

      {/* New PR Modal */}
      {showModal && (
        <Modal title="New Purchase Requisition" onClose={() => setShowModal(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Item / Material Title *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. LPG Cylinders 45kg" />
            </div>
            <div className="pm-form-group">
              <label>Department</label>
              <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}>
                {["Procurement","Operations","Maintenance","Logistics","Finance"].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Quantity *</label>
              <input type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0" />
            </div>
            <div className="pm-form-group">
              <label>Unit</label>
              <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
                {["Cylinders","Metric Ton","Pieces","Liters","Units"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Estimated Cost (PKR)</label>
              <input type="number" value={form.estCost} onChange={e=>setForm(f=>({...f,estCost:e.target.value}))} placeholder="0" />
            </div>
            <div className="pm-form-group">
              <label>Required By Date</label>
              <input type="date" value={form.requiredBy||""} onChange={e=>setForm(f=>({...f,requiredBy:e.target.value}))} />
            </div>
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Notes / Justification</label>
              <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reason for requisition…" style={{ resize:"vertical" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={handleSubmit}>Submit Requisition</button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* View PR Modal */}
      {viewing && (
        <Modal title={`Requisition — ${viewing.id}`} onClose={() => setViewing(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:16 }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:4 }}>{viewing.title}</div>
              <div style={{ fontSize:12.5, color:"#64748b" }}>Requested by {viewing.requestedBy} · {viewing.date}</div>
            </div>
            {[["Department",viewing.dept],["Quantity",`${viewing.qty.toLocaleString()} ${viewing.unit}`],["Estimated Cost",fmtPKR(viewing.estCost)],["Priority",viewing.priority],["Status",viewing.status],["Notes",viewing.notes]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f8fafc", fontSize:13 }}>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>{l}</span>
                <span style={{ color:"#0f172a", fontWeight:500, maxWidth:"60%", textAlign:"right" }}>{v||"—"}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, display:"flex", gap:8 }}>
            {viewing.status === "Pending" && <>
              <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={() => { setPrs(ps=>ps.map(p=>p.id===viewing.id?{...p,status:"Approved"}:p)); setViewing(null); }}>Approve</button>
              <button className="pm-btn" style={{ flex:1, background:"#fef2f2", color:"#dc2626", border:"none" }} onClick={() => { setPrs(ps=>ps.map(p=>p.id===viewing.id?{...p,status:"Rejected"}:p)); setViewing(null); }}>Reject</button>
            </>}
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
