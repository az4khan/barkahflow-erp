import { useState } from "react";
import { ACCENT, fmtPKR } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal } from "../../components/common/UI";

const MOCK_PENDING = [
  { id:"PR-001", title:"LPG Cylinders 45kg",  dept:"Procurement", qty:2000, unit:"Cylinders", estCost:17000000, priority:"High",   requestedBy:"Hassan Raza", date:"2026-03-01", notes:"Urgent — Q1 stock low",    approvalLevel:"L1" },
  { id:"PR-004", title:"LPG Cylinders 11.8kg",dept:"Procurement", qty:5000, unit:"Cylinders", estCost:16000000, priority:"High",   requestedBy:"Hassan Raza", date:"2026-03-03", notes:"Distribution order",        approvalLevel:"L2" },
  { id:"PR-005", title:"Safety Valves",        dept:"Maintenance", qty:80,  unit:"Pieces",    estCost:240000,   priority:"Medium", requestedBy:"Omar Farooq", date:"2026-03-05", notes:"Annual maintenance kit",    approvalLevel:"L1" },
  { id:"PR-006", title:"LPG Bulk MT",          dept:"Operations",  qty:300, unit:"Metric Ton",estCost:2340000,  priority:"Medium", requestedBy:"Ali Shah",    date:"2026-03-06", notes:"Buffer stock replenishment",approvalLevel:"L1" },
];

const PRIORITY_COLORS = { High:["#fef2f2","#dc2626"], Medium:["#fffbeb","#d97706"], Low:["#f0fdf4","#16a34a"] };
const LEVEL_COLORS    = { L1:["#eff6ff","#2563eb"], L2:["#f5f3ff","#7c3aed"], L3:["#fff7ed","#ea580c"] };

function Badge({ label, colors }) {
  return <span style={{ background:colors[0], color:colors[1], padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>;
}

export default function PRApproval({ onNav }) {
  const [prs, setPrs]           = useState(MOCK_PENDING);
  const [selected, setSelected] = useState([]);
  const [viewing, setViewing]   = useState(null);
  const [remark, setRemark]     = useState("");
  const [history, setHistory]   = useState([
    { id:"PR-002", title:"LPG Bulk MT",         action:"Approved", by:"Admin",      date:"2026-02-26", remark:"Stock within budget" },
    { id:"PR-003", title:"Pressure Regulators", action:"Rejected", by:"Admin",      date:"2026-02-21", remark:"Postponed to Q2" },
  ]);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const selectAll    = () => setSelected(prs.map(p=>p.id));
  const clearAll     = () => setSelected([]);

  const approve = (ids, rem) => {
    const items = prs.filter(p => ids.includes(p.id));
    setHistory(h => [...items.map(p => ({ id:p.id, title:p.title, action:"Approved", by:"Admin", date:new Date().toISOString().slice(0,10), remark:rem||"Approved" })), ...h]);
    setPrs(p => p.filter(x => !ids.includes(x.id)));
    setSelected([]); setViewing(null); setRemark("");
  };

  const reject = (ids, rem) => {
    const items = prs.filter(p => ids.includes(p.id));
    setHistory(h => [...items.map(p => ({ id:p.id, title:p.title, action:"Rejected", by:"Admin", date:new Date().toISOString().slice(0,10), remark:rem||"Rejected" })), ...h]);
    setPrs(p => p.filter(x => !ids.includes(x.id)));
    setSelected([]); setViewing(null); setRemark("");
  };

  return (
    <div className="pm-page">
      {/* Header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">PR Approval</h1>
          <p className="pm-page-sub">{prs.length} requisition{prs.length !== 1 ? "s" : ""} awaiting your approval</p>
        </div>
        <div className="pm-page-actions">
          {selected.length > 0 && <>
            <button className="pm-btn" style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0" }} onClick={() => approve(selected, "Bulk approved")}>
              ✓ Approve ({selected.length})
            </button>
            <button className="pm-btn" style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }} onClick={() => reject(selected, "Bulk rejected")}>
              ✕ Reject ({selected.length})
            </button>
            <button className="pm-btn pm-btn-ghost" onClick={clearAll}>Clear</button>
          </>}
        </div>
      </div>

      {/* Pending approvals */}
      <div className="pm-table-wrap" style={{ marginBottom:20 }}>
        <div className="pm-table-header">
          <span className="pm-table-title">Pending Approvals</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="pm-btn pm-btn-ghost" style={{ fontSize:11 }} onClick={selected.length===prs.length ? clearAll : selectAll}>
              {selected.length === prs.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>
        <table className="pm-table">
          <thead>
            <tr>
              <th style={{ width:36 }}></th>
              <th>PR ID</th><th>Title</th><th>Department</th>
              <th>Qty</th><th>Est. Cost</th><th>Priority</th><th>Level</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prs.length === 0 && (
              <tr><td colSpan={9}>
                <div className="pm-empty"><div className="pm-empty-icon">✅</div><div className="pm-empty-text">All requisitions have been processed</div></div>
              </td></tr>
            )}
            {prs.map(pr => (
              <tr key={pr.id} style={{ background: selected.includes(pr.id) ? "#fff7ed" : undefined }}>
                <td>
                  <input type="checkbox" checked={selected.includes(pr.id)} onChange={() => toggleSelect(pr.id)}
                    style={{ width:15, height:15, accentColor:ACCENT, cursor:"pointer" }} />
                </td>
                <td><span style={{ fontWeight:700, color:ACCENT }}>{pr.id}</span></td>
                <td>
                  <div style={{ fontWeight:600, color:"#0f172a" }}>{pr.title}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{pr.requestedBy} · {pr.date}</div>
                </td>
                <td style={{ color:"#64748b" }}>{pr.dept}</td>
                <td style={{ fontWeight:600 }}>{pr.qty.toLocaleString()} <span style={{ fontSize:11, color:"#94a3b8" }}>{pr.unit}</span></td>
                <td style={{ fontWeight:700, color:"#0f172a" }}>{fmtPKR(pr.estCost)}</td>
                <td><Badge label={pr.priority} colors={PRIORITY_COLORS[pr.priority]} /></td>
                <td><Badge label={pr.approvalLevel} colors={LEVEL_COLORS[pr.approvalLevel]} /></td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="pm-btn pm-btn-ghost" style={{ fontSize:11 }} onClick={() => { setViewing(pr); setRemark(""); }}>Review</button>
                    <button style={{ padding:"4px 10px", borderRadius:8, border:"1px solid #bbf7d0", background:"#f0fdf4", color:"#16a34a", fontSize:11, fontWeight:600, cursor:"pointer" }} onClick={() => approve([pr.id], "Approved")}>✓</button>
                    <button style={{ padding:"4px 10px", borderRadius:8, border:"1px solid #fecaca", background:"#fef2f2", color:"#dc2626", fontSize:11, fontWeight:600, cursor:"pointer" }} onClick={() => reject([pr.id], "Rejected")}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval History */}
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <span className="pm-table-title">Approval History</span>
        </div>
        <table className="pm-table">
          <thead><tr><th>PR ID</th><th>Title</th><th>Action</th><th>Approved By</th><th>Date</th><th>Remark</th></tr></thead>
          <tbody>
            {history.map((h,i) => (
              <tr key={i}>
                <td><span style={{ fontWeight:700, color:"#64748b" }}>{h.id}</span></td>
                <td style={{ fontWeight:500 }}>{h.title}</td>
                <td>
                  <span style={{ background: h.action==="Approved" ? "#dcfce7" : "#fee2e2", color: h.action==="Approved" ? "#166534" : "#991b1b", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                    {h.action}
                  </span>
                </td>
                <td style={{ color:"#64748b" }}>{h.by}</td>
                <td style={{ color:"#94a3b8", fontSize:12 }}>{h.date}</td>
                <td style={{ color:"#64748b", fontStyle:"italic", fontSize:12 }}>{h.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {viewing && (
        <Modal title={`Review — ${viewing.id}`} onClose={() => setViewing(null)}>
          <div style={{ background:"#f8fafc", borderRadius:10, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", marginBottom:4 }}>{viewing.title}</div>
            <div style={{ fontSize:12, color:"#64748b" }}>By {viewing.requestedBy} · {viewing.date}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {[["Department",viewing.dept],["Quantity",`${viewing.qty.toLocaleString()} ${viewing.unit}`],["Estimated Cost",fmtPKR(viewing.estCost)],["Priority",viewing.priority],["Approval Level",viewing.approvalLevel],["Notes",viewing.notes]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f1f5f9", fontSize:13 }}>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>{l}</span>
                <span style={{ color:"#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="pm-form-group" style={{ marginBottom:16 }}>
            <label>Remark (optional)</label>
            <input value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Add a comment…" />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="pm-btn" style={{ flex:1, background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", fontWeight:700 }} onClick={() => approve([viewing.id], remark)}>✓ Approve</button>
            <button className="pm-btn" style={{ flex:1, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", fontWeight:700 }} onClick={() => reject([viewing.id], remark)}>✕ Reject</button>
            <button className="pm-btn pm-btn-outline" onClick={() => setViewing(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
