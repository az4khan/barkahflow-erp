import { useState, useEffect } from "react";
import { ACCENT, fmtPKR, calcLanded } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal, StatCard } from "../../components/common/UI";

const MOCK_POs = [
  { id:"PO-001", supplier:"Saudi Aramco",  item:"LPG Cylinders 45kg",  qty:5000, unitPrice:8500, transportation:2500000, customs:1800000, brokerage:500000, loading:200000, port:400000, misc:150000, payTerms:"30 days", incoterm:"FOB Karachi",   deliveryDate:"2026-04-10", status:"Confirmed", prId:"PR-001", rfqId:"RFQ-001", issuedDate:"2026-03-08" },
  { id:"PO-002", supplier:"ADNOC",         item:"LPG Bulk (MT)",        qty:3200, unitPrice:7800, transportation:1900000, customs:1500000, brokerage:420000, loading:180000, port:310000, misc:110000, payTerms:"60 days", incoterm:"FOB Abu Dhabi", deliveryDate:"2026-04-05", status:"Sent",      prId:"PR-006", rfqId:"RFQ-003", issuedDate:"2026-03-07" },
  { id:"PO-003", supplier:"Shell Gas",     item:"LPG Cylinders 11.8kg", qty:8000, unitPrice:3200, transportation:1500000, customs:1200000, brokerage:350000, loading:150000, port:280000, misc:95000,  payTerms:"30 days", incoterm:"CIF Karachi",   deliveryDate:"2026-04-18", status:"Draft",     prId:"PR-004", rfqId:"RFQ-002", issuedDate:"2026-03-09" },
  { id:"PO-004", supplier:"TotalEnergies", item:"LPG Bulk (MT)",        qty:4500, unitPrice:7600, transportation:2200000, customs:1700000, brokerage:480000, loading:190000, port:360000, misc:130000, payTerms:"45 days", incoterm:"FOB Rotterdam", deliveryDate:"2026-04-22", status:"Pending",   prId:"",       rfqId:"",       issuedDate:"2026-03-06" },
];

const STATUS_COLORS = {
  Draft:     ["#f8fafc","#64748b"],
  Pending:   ["#fef9c3","#854d0e"],
  Sent:      ["#dbeafe","#1e40af"],
  Confirmed: ["#dcfce7","#166534"],
  Cancelled: ["#fee2e2","#991b1b"],
};

function Badge({ label }) {
  const [bg,cl] = STATUS_COLORS[label] || ["#f1f5f9","#374151"];
  return <span style={{ background:bg, color:cl, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>;
}

const EMPTY = { supplier:"", item:"", qty:"", unitPrice:"", transportation:"", customs:"", brokerage:"", loading:"", port:"", misc:"", payTerms:"30 days", incoterm:"FOB Karachi", deliveryDate:"", prId:"", rfqId:"" };
const ALL_SUPPLIERS = ["Saudi Aramco","ADNOC","Shell Gas","TotalEnergies","PSO"];

export default function PurchaseOrder({ onNav }) {
  const [pos, setPos]           = useState(MOCK_POs);
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [viewing, setViewing]   = useState(null);
  const [printMode, setPrintMode] = useState(false);

  const filtered = pos.filter(p =>
    (filter === "All" || p.status === filter) &&
    (p.id.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase()) || p.item.toLowerCase().includes(search.toLowerCase()))
  );

  const f = (k) => Number(form[k]) || 0;
  const formTotal = f("qty") * f("unitPrice") + f("transportation") + f("customs") + f("brokerage") + f("loading") + f("port") + f("misc");

  const createPO = () => {
    if (!form.supplier || !form.item || !form.qty) return;
    const newPO = { ...form, id:`PO-0${pos.length+10}`, status:"Draft", issuedDate:new Date().toISOString().slice(0,10), qty:Number(form.qty), unitPrice:Number(form.unitPrice), transportation:f("transportation"), customs:f("customs"), brokerage:f("brokerage"), loading:f("loading"), port:f("port"), misc:f("misc") };
    setPos(p => [newPO, ...p]);
    setShowModal(false); setForm(EMPTY);
  };

  const updateStatus = (id, status) => setPos(ps => ps.map(p => p.id===id ? {...p, status} : p));

  const stats = {
    total:     pos.length,
    confirmed: pos.filter(p=>p.status==="Confirmed").length,
    pending:   pos.filter(p=>p.status==="Pending" || p.status==="Sent").length,
    value:     pos.reduce((s,p)=>s+calcLanded(p),0),
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Purchase Orders</h1>
          <p className="pm-page-sub">Issue & manage official purchase orders to suppliers</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("goods-receipt")}>
            Goods Receipt →
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => setShowModal(true)}>
            + New PO
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <StatCard icon="list"    iconColor="#0ea5e9" iconBg="#f0f9ff" label="Total POs"    value={stats.total}           />
        <StatCard icon="check"   iconColor="#16a34a" iconBg="#f0fdf4" label="Confirmed"    value={stats.confirmed}        />
        <StatCard icon="truck"   iconColor="#d97706" iconBg="#fffbeb" label="In Progress"  value={stats.pending}          />
        <StatCard icon="invoice" iconColor="#f97316" iconBg="#fff7ed" label="Total Value"  value={fmtPKR(stats.value)}   />
      </div>

      {/* Table */}
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <span className="pm-table-title">All Purchase Orders</span>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {["All","Draft","Pending","Sent","Confirmed","Cancelled"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"4px 11px", borderRadius:20, border:"1px solid", fontSize:11.5, fontWeight:500, cursor:"pointer",
                  background: filter===f ? ACCENT : "#fff", color: filter===f ? "#fff" : "#64748b", borderColor: filter===f ? ACCENT : "#e2e8f0" }}
              >{f}</button>
            ))}
            <div className="pm-search-bar">
              <Icon name="search" size={13} color="#94a3b8" />
              <input placeholder="Search PO…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <table className="pm-table">
          <thead>
            <tr><th>PO ID</th><th>Supplier</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total Landed</th><th>Delivery</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(po => (
              <tr key={po.id}>
                <td><span style={{ fontWeight:700, color:ACCENT }}>{po.id}</span></td>
                <td style={{ fontWeight:600, color:"#0f172a" }}>{po.supplier}</td>
                <td>
                  <div style={{ fontWeight:500 }}>{po.item}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{po.issuedDate}</div>
                </td>
                <td style={{ fontWeight:600 }}>{po.qty.toLocaleString()}</td>
                <td>{fmtPKR(po.unitPrice)}</td>
                <td style={{ fontWeight:700, color:"#0f172a" }}>{fmtPKR(calcLanded(po))}</td>
                <td style={{ color:"#64748b", fontSize:12 }}>{po.deliveryDate}</td>
                <td><Badge label={po.status} /></td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="pm-btn pm-btn-ghost" style={{ fontSize:11 }} onClick={() => setViewing(po)}>View</button>
                    {po.status === "Draft"   && <button className="pm-btn pm-btn-outline" style={{ fontSize:11 }} onClick={() => updateStatus(po.id,"Sent")}>Send</button>}
                    {po.status === "Sent"    && <button className="pm-btn pm-btn-outline" style={{ fontSize:11 }} onClick={() => updateStatus(po.id,"Confirmed")}>Confirm</button>}
                    {(po.status==="Draft"||po.status==="Pending") && <button style={{ padding:"4px 8px", borderRadius:8, border:"1px solid #fecaca", background:"#fef2f2", color:"#dc2626", fontSize:11, fontWeight:500, cursor:"pointer" }} onClick={() => updateStatus(po.id,"Cancelled")}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New PO Modal */}
      {showModal && (
        <Modal title="New Purchase Order" onClose={() => setShowModal(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Supplier *</label>
              <select value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))}>
                <option value="">Select…</option>
                {ALL_SUPPLIERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Payment Terms</label>
              <select value={form.payTerms} onChange={e=>setForm(f=>({...f,payTerms:e.target.value}))}>
                {["Advance","30 days","45 days","60 days","90 days","LC"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Item / Material *</label>
              <input value={form.item} onChange={e=>setForm(f=>({...f,item:e.target.value}))} placeholder="e.g. LPG Cylinders 45kg" />
            </div>
            <div className="pm-form-group">
              <label>Quantity *</label>
              <input type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Unit Price (PKR)</label>
              <input type="number" value={form.unitPrice} onChange={e=>setForm(f=>({...f,unitPrice:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Incoterm</label>
              <select value={form.incoterm} onChange={e=>setForm(f=>({...f,incoterm:e.target.value}))}>
                {["FOB Karachi","CIF Karachi","FOB Abu Dhabi","FOB Rotterdam","Ex-Works","DAP"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Expected Delivery</label>
              <input type="date" value={form.deliveryDate} onChange={e=>setForm(f=>({...f,deliveryDate:e.target.value}))} />
            </div>
            {/* Landed cost fields */}
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", margin:"8px 0 10px" }}>Landed Cost Components</div>
            </div>
            {[["transportation","Transportation"],["customs","Customs Duty"],["brokerage","Brokerage"],["loading","Loading"],["port","Port Charges"],["misc","Miscellaneous"]].map(([k,l])=>(
              <div key={k} className="pm-form-group">
                <label>{l} (PKR)</label>
                <input type="number" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder="0" />
              </div>
            ))}
            <div style={{ gridColumn:"1/-1", background:"#f8fafc", borderRadius:10, padding:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Estimated Total Landed Cost</span>
              <span style={{ fontSize:18, fontWeight:800, color:ACCENT }}>{fmtPKR(formTotal)}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={createPO}>Create PO</button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* View PO Modal */}
      {viewing && (
        <Modal title={`Purchase Order — ${viewing.id}`} onClose={() => setViewing(null)}>
          <div style={{ background: "#f8fafc", borderRadius:10, padding:14, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>{viewing.supplier}</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{viewing.item} · Issued {viewing.issuedDate}</div>
              </div>
              <Badge label={viewing.status} />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {[["Quantity",`${viewing.qty.toLocaleString()} units`],["Unit Price",fmtPKR(viewing.unitPrice)],["Payment Terms",viewing.payTerms],["Incoterm",viewing.incoterm],["Expected Delivery",viewing.deliveryDate],["Linked PR",viewing.prId||"—"]].map(([l,v])=>(
              <div key={l} style={{ padding:"8px 10px", background:"#f8fafc", borderRadius:8 }}>
                <div style={{ fontSize:10.5, color:"#94a3b8", fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:11.5, fontWeight:700, color:"#374151", marginBottom:10 }}>Landed Cost Breakdown</div>
            {[["Product Cost",viewing.qty*viewing.unitPrice,"#f97316"],["Transportation",viewing.transportation,"#3b82f6"],["Customs Duty",viewing.customs,"#22c55e"],["Brokerage",viewing.brokerage,"#8b5cf6"],["Loading",viewing.loading,"#f59e0b"],["Port Charges",viewing.port,"#ef4444"],["Miscellaneous",viewing.misc,"#94a3b8"]].map(([l,v,c])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #f1f5f9", fontSize:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }} />
                  <span style={{ color:"#64748b" }}>{l}</span>
                </div>
                <span style={{ fontWeight:600, color:"#0f172a" }}>{fmtPKR(v)}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0", fontSize:14, fontWeight:800, color:ACCENT }}>
              <span>Total Landed Cost</span>
              <span>{fmtPKR(calcLanded(viewing))}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {viewing.status==="Draft" && <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={() => { updateStatus(viewing.id,"Sent"); setViewing(null); }}>Send to Supplier</button>}
            {viewing.status==="Sent"  && <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={() => { updateStatus(viewing.id,"Confirmed"); setViewing(null); }}>Mark Confirmed</button>}
            <button className="pm-btn pm-btn-outline" onClick={() => setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
