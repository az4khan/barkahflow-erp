import { useState, useEffect } from "react";
import { ACCENT, fmtPKR, calcLanded } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal, StatCard } from "../../components/common/UI";

const MOCK_POs = [
  { id:"PO-001", supplier:"Saudi Aramco",  item:"LPG Cylinders 45kg",  qty:5000, unit:"Cylinders" },
  { id:"PO-002", supplier:"ADNOC",         item:"LPG Bulk (MT)",        qty:3200, unit:"MT"        },
  { id:"PO-003", supplier:"Shell Gas",     item:"LPG Cylinders 11.8kg", qty:8000, unit:"Cylinders" },
  { id:"PO-004", supplier:"TotalEnergies", item:"LPG Bulk (MT)",        qty:4500, unit:"MT"        },
  { id:"PO-005", supplier:"Shell Gas",     item:"LPG Cylinders 5kg",    qty:3000, unit:"Cylinders" },
  { id:"PO-006", supplier:"Saudi Aramco",  item:"LPG Bulk (MT)",        qty:2000, unit:"MT"        },
];

const EMPTY_GRN_FORM = { poId:"", supplier:"", item:"", orderedQty:"", receivedQty:"", rejectedQty:"0", unit:"", warehouse:"Main Warehouse", invoiceNo:"", invoiceAmt:"", inspectedBy:"", notes:"", receivedDate: new Date().toISOString().slice(0,10) };

const MOCK_GRNs = [
  { id:"GRN-001", poId:"PO-001", supplier:"Saudi Aramco",  item:"LPG Cylinders 45kg",  orderedQty:5000, receivedQty:5000, rejectedQty:0,   unit:"Cylinders", receivedDate:"2026-03-20", warehouse:"Main Warehouse",  invoiceNo:"SA-2026-441", invoiceAmt:45250000, status:"Complete",  inspectedBy:"Hassan Raza", notes:"All in good condition" },
  { id:"GRN-002", poId:"PO-002", supplier:"ADNOC",         item:"LPG Bulk (MT)",        orderedQty:3200, receivedQty:3150, rejectedQty:50,   unit:"MT",        receivedDate:"2026-03-18", warehouse:"Bulk Storage",    invoiceNo:"AD-3318",     invoiceAmt:27300000, status:"Partial",  inspectedBy:"Ali Shah",    notes:"50 MT short — supplier to send balance" },
  { id:"GRN-003", poId:"PO-003", supplier:"Shell Gas",     item:"LPG Cylinders 11.8kg", orderedQty:8000, receivedQty:0,    rejectedQty:0,   unit:"Cylinders", receivedDate:"",           warehouse:"",                invoiceNo:"",            invoiceAmt:0,        status:"Pending",  inspectedBy:"",           notes:"" },
  { id:"GRN-004", poId:"PO-004", supplier:"TotalEnergies", item:"LPG Bulk (MT)",        orderedQty:4500, receivedQty:4500, rejectedQty:120, unit:"MT",        receivedDate:"2026-03-15", warehouse:"Bulk Storage",    invoiceNo:"TE-881-K",    invoiceAmt:36720000, status:"Inspection",inspectedBy:"Omar Farooq","notes":"120 MT pending quality check" },
];

const STATUS_COLORS = {
  Pending:    ["#fef9c3","#854d0e"],
  Partial:    ["#dbeafe","#1e40af"],
  Inspection: ["#f5f3ff","#7c3aed"],
  Complete:   ["#dcfce7","#166534"],
  Rejected:   ["#fee2e2","#991b1b"],
};

function Badge({ label }) {
  const [bg,cl] = STATUS_COLORS[label] || ["#f1f5f9","#374151"];
  return <span style={{ background:bg, color:cl, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>;
}

const WAREHOUSES = ["Main Warehouse","Bulk Storage","Secondary Store","Cold Storage"];

export default function GoodsReceipt({ onNav }) {
  const [grns, setGrns]           = useState(MOCK_GRNs);
  const [filter, setFilter]       = useState("All");
  const [viewing, setViewing]     = useState(null);
  const [receiving, setReceiving] = useState(null);
  const [recForm, setRecForm]     = useState({ receivedQty:"", rejectedQty:"0", warehouse:"Main Warehouse", invoiceNo:"", invoiceAmt:"", inspectedBy:"", notes:"" });
  const [newGrn, setNewGrn]       = useState(false);
  const [newForm, setNewForm]     = useState(EMPTY_GRN_FORM);
  const [go, setGo]               = useState(false);

  useEffect(() => { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t); }, []);

  const filtered = grns.filter(g => filter === "All" || g.status === filter);

  const submitReceipt = () => {
    if (!recForm.receivedQty || !receiving) return;
    setGrns(gs => gs.map(g => g.id === receiving.id ? {
      ...g,
      receivedQty: Number(recForm.receivedQty),
      rejectedQty: Number(recForm.rejectedQty),
      warehouse:   recForm.warehouse,
      invoiceNo:   recForm.invoiceNo,
      invoiceAmt:  Number(recForm.invoiceAmt),
      inspectedBy: recForm.inspectedBy,
      notes:       recForm.notes,
      receivedDate: new Date().toISOString().slice(0,10),
      status: Number(recForm.receivedQty) >= g.orderedQty ? "Complete" : Number(recForm.rejectedQty) > 0 ? "Inspection" : "Partial",
    } : g));
    setReceiving(null);
  };

  const submitNewGrn = () => {
    if (!newForm.supplier || !newForm.item || !newForm.receivedQty) return;
    const nextId = `GRN-${String(grns.length + 1).padStart(3,"0")}`;
    const rcvd = Number(newForm.receivedQty);
    const rjct = Number(newForm.rejectedQty) || 0;
    const ordQty = Number(newForm.orderedQty) || rcvd;
    const status = rcvd >= ordQty ? "Complete" : rjct > 0 ? "Inspection" : rcvd > 0 ? "Partial" : "Pending";
    setGrns(gs => [...gs, {
      id: nextId,
      poId: newForm.poId || "—",
      supplier: newForm.supplier,
      item: newForm.item,
      orderedQty: ordQty,
      receivedQty: rcvd,
      rejectedQty: rjct,
      unit: newForm.unit || "Units",
      receivedDate: newForm.receivedDate,
      warehouse: newForm.warehouse,
      invoiceNo: newForm.invoiceNo,
      invoiceAmt: Number(newForm.invoiceAmt) || 0,
      inspectedBy: newForm.inspectedBy,
      notes: newForm.notes,
      status,
    }]);
    setNewGrn(false);
    setNewForm(EMPTY_GRN_FORM);
  };

  // When PO is selected in new GRN form — auto-fill supplier, item, qty, unit
  const handlePoSelect = (poId) => {
    const po = MOCK_POs.find(p => p.id === poId);
    if (po) setNewForm(f => ({ ...f, poId, supplier: po.supplier, item: po.item, orderedQty: String(po.qty), unit: po.unit }));
    else setNewForm(f => ({ ...f, poId }));
  };

  const stats = {
    total:      grns.length,
    complete:   grns.filter(g=>g.status==="Complete").length,
    pending:    grns.filter(g=>g.status==="Pending").length,
    inspection: grns.filter(g=>g.status==="Inspection").length,
    totalReceived: grns.reduce((s,g)=>s+g.receivedQty,0),
  };

  // Quality chart data
  const qualityData = grns.filter(g=>g.receivedQty>0).map(g => ({
    label: g.supplier.split(" ")[0],
    accepted: g.receivedQty - g.rejectedQty,
    rejected: g.rejectedQty,
    total: g.receivedQty,
    pct: Math.round(((g.receivedQty - g.rejectedQty) / g.receivedQty) * 100),
  }));

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Goods Receipt</h1>
          <p className="pm-page-sub">Receive, inspect & confirm incoming shipments</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("pm-reports")}>
            View Reports →
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => { setNewForm(EMPTY_GRN_FORM); setNewGrn(true); }}>
            + New GRN
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard icon="list"  iconColor="#0ea5e9" iconBg="#f0f9ff" label="Total GRNs"    value={stats.total}      />
        <StatCard icon="check" iconColor="#16a34a" iconBg="#f0fdf4" label="Complete"       value={stats.complete}   />
        <StatCard icon="clock" iconColor="#d97706" iconBg="#fffbeb" label="Pending"        value={stats.pending}    />
        <StatCard icon="eye"   iconColor="#7c3aed" iconBg="#f5f3ff" label="In Inspection"  value={stats.inspection} />
      </div>

      {/* GRN Table — full width */}
      <div style={{ marginBottom:16 }}>
        <div className="pm-table-wrap">
            <div className="pm-table-header">
              <span className="pm-table-title">Goods Receipt Notes</span>
              <div style={{ display:"flex", gap:6 }}>
                {["All","Pending","Partial","Inspection","Complete"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding:"3px 10px", borderRadius:20, border:"1px solid", fontSize:11, fontWeight:500, cursor:"pointer",
                      background: filter===f ? ACCENT : "#fff", color: filter===f ? "#fff" : "#64748b", borderColor: filter===f ? ACCENT : "#e2e8f0" }}
                  >{f}</button>
                ))}
              </div>
            </div>
            <table className="pm-table">
              <thead>
                <tr><th>GRN</th><th>Supplier</th><th>Item</th><th>Ordered</th><th>Received</th><th>Rejected</th><th>Warehouse</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const fillPct = g.orderedQty > 0 ? (g.receivedQty / g.orderedQty) * 100 : 0;
                  return (
                    <tr key={g.id}>
                      <td>
                        <span style={{ fontWeight:700, color:ACCENT }}>{g.id}</span>
                        <div style={{ fontSize:10, color:"#94a3b8" }}>{g.poId}</div>
                      </td>
                      <td style={{ fontWeight:600, color:"#0f172a" }}>{g.supplier}</td>
                      <td style={{ fontSize:12.5 }}>{g.item}</td>
                      <td style={{ fontWeight:600 }}>{g.orderedQty.toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight:600, color: fillPct===100 ? "#16a34a" : fillPct>0 ? "#d97706" : "#94a3b8" }}>
                          {g.receivedQty.toLocaleString()}
                        </div>
                        <div style={{ width:60, height:4, background:"#f1f5f9", borderRadius:2, marginTop:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width: go ? `${fillPct}%` : "0%", background: fillPct===100 ? "#16a34a" : "#f97316", borderRadius:2, transition:"width 0.7s cubic-bezier(0.34,1.15,0.64,1)" }} />
                        </div>
                      </td>
                      <td style={{ color: g.rejectedQty>0 ? "#dc2626" : "#94a3b8", fontWeight: g.rejectedQty>0 ? 700 : 400 }}>
                        {g.rejectedQty > 0 ? g.rejectedQty.toLocaleString() : "—"}
                      </td>
                      <td style={{ fontSize:12, color:"#64748b" }}>{g.warehouse || "—"}</td>
                      <td><Badge label={g.status} /></td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="pm-btn pm-btn-ghost" style={{ fontSize:11 }} onClick={() => setViewing(g)}>View</button>
                          {g.status === "Pending" && (
                            <button className="pm-btn pm-btn-primary" style={{ fontSize:11 }} onClick={() => { setReceiving(g); setRecForm({ receivedQty:g.orderedQty, rejectedQty:"0", warehouse:"Main Warehouse", invoiceNo:"", invoiceAmt:"", inspectedBy:"", notes:"" }); }}>
                              Receive
                            </button>
                          )}
                          {g.status === "Inspection" && (
                            <button className="pm-btn" style={{ fontSize:11, background:"#f5f3ff", color:"#7c3aed", border:"1px solid #e9d5ff" }} onClick={() => setGrns(gs => gs.map(x => x.id===g.id ? {...x,status:"Complete"} : x))}>
                              Pass QC
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
      </div>

      {/* Quality + Summary — 2 columns below table */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Quality panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:18 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#374151", marginBottom:14 }}>Receipt Quality</div>
            {qualityData.map((d, i) => (
              <div key={i} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{d.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: d.pct >= 99 ? "#16a34a" : d.pct >= 95 ? "#d97706" : "#dc2626" }}>{d.pct}%</span>
                </div>
                {/* Stacked bar: accepted vs rejected */}
                <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden", display:"flex" }}>
                  <div style={{ width: go ? `${((d.accepted)/d.total)*100}%` : "0%", background:"#16a34a", transition:`width 0.7s cubic-bezier(0.34,1.15,0.64,1) ${i*0.1}s` }} />
                  <div style={{ width: go ? `${(d.rejected/d.total)*100}%` : "0%", background:"#ef4444", transition:`width 0.7s cubic-bezier(0.34,1.15,0.64,1) ${i*0.1+0.1}s` }} />
                </div>
                <div style={{ display:"flex", gap:12, marginTop:4, fontSize:10.5, color:"#94a3b8" }}>
                  <span style={{ color:"#16a34a" }}>✓ {d.accepted.toLocaleString()} accepted</span>
                  {d.rejected>0 && <span style={{ color:"#ef4444" }}>✕ {d.rejected.toLocaleString()} rejected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary panel — second column */}
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:18, alignSelf:"flex-start" }}>
          <div style={{ fontSize:12.5, fontWeight:600, color:"#374151", marginBottom:12 }}>Summary</div>
          {[
              ["Total Ordered", grns.reduce((s,g)=>s+g.orderedQty,0).toLocaleString() + " units"],
              ["Total Received",grns.reduce((s,g)=>s+g.receivedQty,0).toLocaleString() + " units"],
              ["Total Rejected",grns.reduce((s,g)=>s+g.rejectedQty,0).toLocaleString() + " units"],
              ["Invoice Total", fmtPKR(grns.reduce((s,g)=>s+g.invoiceAmt,0))],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f8fafc", fontSize:12.5 }}>
                <span style={{ color:"#94a3b8" }}>{l}</span>
                <span style={{ fontWeight:700, color:"#0f172a" }}>{v}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Receive Modal */}
      {receiving && (
        <Modal title={`Receive Goods — ${receiving.id}`} onClose={() => setReceiving(null)}>
          <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:16 }}>
            <div style={{ fontWeight:700, color:"#0f172a" }}>{receiving.item}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Supplier: {receiving.supplier} · PO: {receiving.poId}</div>
            <div style={{ fontSize:12, color:"#f97316", fontWeight:600, marginTop:4 }}>Ordered: {receiving.orderedQty.toLocaleString()} {receiving.unit}</div>
          </div>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Received Quantity *</label>
              <input type="number" value={recForm.receivedQty} onChange={e=>setRecForm(f=>({...f,receivedQty:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Rejected / Damaged Qty</label>
              <input type="number" value={recForm.rejectedQty} onChange={e=>setRecForm(f=>({...f,rejectedQty:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Warehouse / Location</label>
              <select value={recForm.warehouse} onChange={e=>setRecForm(f=>({...f,warehouse:e.target.value}))}>
                {WAREHOUSES.map(w=><option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Inspected By</label>
              <input value={recForm.inspectedBy} onChange={e=>setRecForm(f=>({...f,inspectedBy:e.target.value}))} placeholder="Name" />
            </div>
            <div className="pm-form-group">
              <label>Supplier Invoice No.</label>
              <input value={recForm.invoiceNo} onChange={e=>setRecForm(f=>({...f,invoiceNo:e.target.value}))} placeholder="INV-00001" />
            </div>
            <div className="pm-form-group">
              <label>Invoice Amount (PKR)</label>
              <input type="number" value={recForm.invoiceAmt} onChange={e=>setRecForm(f=>({...f,invoiceAmt:e.target.value}))} />
            </div>
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Inspection Notes</label>
              <textarea rows={2} value={recForm.notes} onChange={e=>setRecForm(f=>({...f,notes:e.target.value}))} placeholder="Any remarks about the delivery…" style={{ resize:"vertical" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={submitReceipt}>Confirm Receipt</button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setReceiving(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* View GRN Modal */}
      {viewing && (
        <Modal title={`GRN — ${viewing.id}`} onClose={() => setViewing(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{viewing.item}</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{viewing.supplier} · {viewing.poId}</div>
            </div>
            {[["Ordered Qty",`${viewing.orderedQty.toLocaleString()} ${viewing.unit}`],["Received Qty",`${viewing.receivedQty.toLocaleString()} ${viewing.unit}`],["Rejected Qty",`${viewing.rejectedQty.toLocaleString()} ${viewing.unit}`],["Received Date",viewing.receivedDate||"Not yet"],["Warehouse",viewing.warehouse||"—"],["Invoice No.",viewing.invoiceNo||"—"],["Invoice Amount",viewing.invoiceAmt ? fmtPKR(viewing.invoiceAmt):"—"],["Inspected By",viewing.inspectedBy||"—"],["Notes",viewing.notes||"—"]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #f8fafc", fontSize:13 }}>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>{l}</span>
                <span style={{ color:"#0f172a", fontWeight:500, maxWidth:"60%", textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <button className="pm-btn pm-btn-outline" style={{ width:"100%" }} onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* ── New GRN Modal ── */}
      {newGrn && (
        <Modal title="Create New GRN" onClose={() => setNewGrn(false)}>
          {/* PO Reference */}
          <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>PO Reference (Optional)</div>
            <div className="pm-form-group" style={{ marginBottom:0 }}>
              <label>Link to Purchase Order</label>
              <select value={newForm.poId} onChange={e => handlePoSelect(e.target.value)}
                style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, background:"#fff", outline:"none" }}>
                <option value="">— Manual Entry (no PO) —</option>
                {MOCK_POs.map(p => <option key={p.id} value={p.id}>{p.id} · {p.supplier} · {p.item}</option>)}
              </select>
            </div>
            {newForm.poId && (
              <div style={{ marginTop:8, fontSize:12, color:ACCENT, fontWeight:600 }}>
                ✓ Supplier, Item & Ordered Qty auto-filled from {newForm.poId}
              </div>
            )}
          </div>

          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Supplier *</label>
              <input value={newForm.supplier} onChange={e => setNewForm(f=>({...f,supplier:e.target.value}))} placeholder="Supplier name" />
            </div>
            <div className="pm-form-group">
              <label>Item / Product *</label>
              <input value={newForm.item} onChange={e => setNewForm(f=>({...f,item:e.target.value}))} placeholder="Item description" />
            </div>
            <div className="pm-form-group">
              <label>Ordered Qty</label>
              <input type="number" value={newForm.orderedQty} onChange={e => setNewForm(f=>({...f,orderedQty:e.target.value}))} placeholder="From PO" />
            </div>
            <div className="pm-form-group">
              <label>Unit</label>
              <select value={newForm.unit} onChange={e => setNewForm(f=>({...f,unit:e.target.value}))}
                style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, background:"#fff", outline:"none" }}>
                <option value="">Select unit</option>
                {["Cylinders","MT","Units","Kg","Liters"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Received Qty *</label>
              <input type="number" value={newForm.receivedQty} onChange={e => setNewForm(f=>({...f,receivedQty:e.target.value}))} placeholder="Actual qty received" />
            </div>
            <div className="pm-form-group">
              <label>Rejected / Damaged Qty</label>
              <input type="number" value={newForm.rejectedQty} onChange={e => setNewForm(f=>({...f,rejectedQty:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Warehouse *</label>
              <select value={newForm.warehouse} onChange={e => setNewForm(f=>({...f,warehouse:e.target.value}))}
                style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, background:"#fff", outline:"none" }}>
                {WAREHOUSES.map(w=><option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Received Date</label>
              <input type="date" value={newForm.receivedDate} onChange={e => setNewForm(f=>({...f,receivedDate:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Invoice No.</label>
              <input value={newForm.invoiceNo} onChange={e => setNewForm(f=>({...f,invoiceNo:e.target.value}))} placeholder="e.g. SA-2026-441" />
            </div>
            <div className="pm-form-group">
              <label>Invoice Amount (PKR)</label>
              <input type="number" value={newForm.invoiceAmt} onChange={e => setNewForm(f=>({...f,invoiceAmt:e.target.value}))} placeholder="0" />
            </div>
            <div className="pm-form-group">
              <label>Inspected By</label>
              <input value={newForm.inspectedBy} onChange={e => setNewForm(f=>({...f,inspectedBy:e.target.value}))} placeholder="Inspector name" />
            </div>
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Notes</label>
              <input value={newForm.notes} onChange={e => setNewForm(f=>({...f,notes:e.target.value}))} placeholder="Any remarks about the shipment" />
            </div>
          </div>

          {/* Auto-status preview */}
          {newForm.receivedQty && (
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"10px 14px", marginTop:8, fontSize:12.5, color:"#166534" }}>
              <strong>Auto Status: </strong>
              {Number(newForm.receivedQty) >= (Number(newForm.orderedQty)||Number(newForm.receivedQty)) ? "Complete ✓" :
               Number(newForm.rejectedQty) > 0 ? "Inspection (rejections found)" : "Partial (short shipment)"}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={submitNewGrn}>
              Create GRN
            </button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setNewGrn(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
