import { useState } from "react";
import { ACCENT, fmtPKR } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal } from "../../components/common/UI";

const MOCK_RFQs = [
  { id:"RFQ-001", prId:"PR-001", item:"LPG Cylinders 45kg",  qty:2000, unit:"Cylinders", deadline:"2026-03-15", status:"Open",   sentTo:["Saudi Aramco","ADNOC","Shell Gas"],   responses:2 },
  { id:"RFQ-002", prId:"PR-004", item:"LPG Cylinders 11.8kg",qty:5000, unit:"Cylinders", deadline:"2026-03-18", status:"Open",   sentTo:["Saudi Aramco","TotalEnergies"],        responses:1 },
  { id:"RFQ-003", prId:"PR-006", item:"LPG Bulk MT",         qty:300,  unit:"Metric Ton",deadline:"2026-03-10", status:"Closed", sentTo:["ADNOC","Shell Gas","TotalEnergies"],   responses:3 },
];

const MOCK_QUOTES = [
  { id:"Q-001", rfqId:"RFQ-001", supplier:"Saudi Aramco",   unitPrice:8500,  leadDays:14, validity:"2026-03-30", payTerms:"30 days", notes:"FOB Karachi",   status:"Received" },
  { id:"Q-002", rfqId:"RFQ-001", supplier:"ADNOC",          unitPrice:8200,  leadDays:18, validity:"2026-03-28", payTerms:"45 days", notes:"CIF Karachi",   status:"Received" },
  { id:"Q-003", rfqId:"RFQ-001", supplier:"Shell Gas",      unitPrice:0,     leadDays:0,  validity:"",           payTerms:"",        notes:"",              status:"Pending"  },
  { id:"Q-004", rfqId:"RFQ-002", supplier:"Saudi Aramco",   unitPrice:3150,  leadDays:12, validity:"2026-04-01", payTerms:"30 days", notes:"Ex-Works",      status:"Received" },
  { id:"Q-005", rfqId:"RFQ-002", supplier:"TotalEnergies",  unitPrice:0,     leadDays:0,  validity:"",           payTerms:"",        notes:"",              status:"Pending"  },
  { id:"Q-006", rfqId:"RFQ-003", supplier:"ADNOC",          unitPrice:7800,  leadDays:10, validity:"2026-03-20", payTerms:"60 days", notes:"FOB Abu Dhabi", status:"Received" },
  { id:"Q-007", rfqId:"RFQ-003", supplier:"Shell Gas",      unitPrice:7950,  leadDays:14, validity:"2026-03-22", payTerms:"30 days", notes:"CIF Karachi",   status:"Received" },
  { id:"Q-008", rfqId:"RFQ-003", supplier:"TotalEnergies",  unitPrice:7720,  leadDays:16, validity:"2026-03-25", payTerms:"45 days", notes:"FOB Rotterdam", status:"Received" },
];

const STATUS_COLORS = { Open:["#dcfce7","#166534"], Closed:["#f1f5f9","#64748b"], Draft:["#fef9c3","#854d0e"] };
const Q_STATUS_COLORS = { Received:["#dcfce7","#166534"], Pending:["#fef9c3","#854d0e"] };

function Badge({ label, colors }) {
  return <span style={{ background:colors[0], color:colors[1], padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>{label}</span>;
}

const EMPTY_RFQ = { prId:"", item:"", qty:"", unit:"Cylinders", deadline:"", suppliers:[] };
const ALL_SUPPLIERS = ["Saudi Aramco","ADNOC","Shell Gas","TotalEnergies","PSO"];

export default function SupplierQuotation({ onNav }) {
  const [rfqs, setRfqs]           = useState(MOCK_RFQs);
  const [quotes, setQuotes]       = useState(MOCK_QUOTES);
  const [selectedRfq, setSelectedRfq] = useState(MOCK_RFQs[0]);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [rfqForm, setRfqForm]     = useState(EMPTY_RFQ);
  const [quoteForm, setQuoteForm] = useState({ supplier:"", unitPrice:"", leadDays:"", payTerms:"30 days", validity:"", notes:"" });

  const rfqQuotes = quotes.filter(q => q.rfqId === selectedRfq?.id);

  const createRfq = () => {
    if (!rfqForm.item || !rfqForm.qty) return;
    const id = `RFQ-00${rfqs.length+1}`;
    setRfqs(r => [...r, { ...rfqForm, id, status:"Open", qty:Number(rfqForm.qty), responses:0, sentTo: rfqForm.suppliers?.length ? rfqForm.suppliers : [] }]);
    setShowRfqModal(false); setRfqForm(EMPTY_RFQ);
  };

  const addQuote = () => {
    if (!quoteForm.supplier || !quoteForm.unitPrice) return;
    const newQ = { id:`Q-0${quotes.length+10}`, rfqId:selectedRfq.id, ...quoteForm, unitPrice:Number(quoteForm.unitPrice), leadDays:Number(quoteForm.leadDays), status:"Received" };
    setQuotes(q => [...q, newQ]);
    setShowQuoteModal(false); setQuoteForm({ supplier:"", unitPrice:"", leadDays:"", payTerms:"30 days", validity:"", notes:"" });
  };

  const lowestPrice = rfqQuotes.filter(q=>q.unitPrice>0).reduce((min,q)=>q.unitPrice<min?q.unitPrice:min, Infinity);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Supplier Quotation</h1>
          <p className="pm-page-sub">Request for Quotation (RFQ) management & supplier responses</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("quotation-comparison")}>
            Compare Quotes →
          </button>
          <button className="pm-btn pm-btn-primary" onClick={() => setShowRfqModal(true)}>
            + New RFQ
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16 }}>
        {/* RFQ List */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
            RFQ List ({rfqs.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {rfqs.map(rfq => (
              <div key={rfq.id} onClick={() => setSelectedRfq(rfq)}
                style={{ background: selectedRfq?.id===rfq.id ? "#fff7ed" : "#fff", border:`1px solid ${selectedRfq?.id===rfq.id ? "#fed7aa" : "#f1f5f9"}`, borderRadius:10, padding:14, cursor:"pointer", transition:"all 0.15s" }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:ACCENT }}>{rfq.id}</span>
                  <Badge label={rfq.status} colors={STATUS_COLORS[rfq.status]} />
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:4 }}>{rfq.item}</div>
                <div style={{ fontSize:11.5, color:"#94a3b8" }}>{rfq.qty.toLocaleString()} {rfq.unit}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"#94a3b8" }}>
                  <span>Deadline: {rfq.deadline}</span>
                  <span style={{ color: rfq.responses > 0 ? "#16a34a" : "#d97706", fontWeight:600 }}>
                    {rfq.responses}/{rfq.sentTo?.length || 0} replied
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quotes for selected RFQ */}
        <div>
          {selectedRfq && <>
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{selectedRfq.item}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{selectedRfq.id} · {selectedRfq.qty.toLocaleString()} {selectedRfq.unit} · Due {selectedRfq.deadline}</div>
                </div>
                <button className="pm-btn pm-btn-outline" onClick={() => setShowQuoteModal(true)} style={{ fontSize:12 }}>
                  + Add Quote
                </button>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {(selectedRfq.sentTo || []).map(s => (
                  <span key={s} style={{ background:"#f1f5f9", color:"#374151", padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:500 }}>{s}</span>
                ))}
              </div>
            </div>

            <div className="pm-table-wrap">
              <div className="pm-table-header">
                <span className="pm-table-title">Quotations Received</span>
              </div>
              <table className="pm-table">
                <thead>
                  <tr><th>Supplier</th><th>Unit Price</th><th>Total Value</th><th>Lead Time</th><th>Payment</th><th>Validity</th><th>Status</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {rfqQuotes.map(q => (
                    <tr key={q.id}>
                      <td style={{ fontWeight:600, color:"#0f172a" }}>{q.supplier}</td>
                      <td>
                        {q.unitPrice > 0 ? (
                          <span style={{ fontWeight:700, color: q.unitPrice===lowestPrice ? "#16a34a" : "#0f172a" }}>
                            {fmtPKR(q.unitPrice)}
                            {q.unitPrice===lowestPrice && <span style={{ fontSize:10, marginLeft:6, background:"#dcfce7", color:"#166534", padding:"1px 6px", borderRadius:20, fontWeight:700 }}>Lowest</span>}
                          </span>
                        ) : <span style={{ color:"#cbd5e1" }}>—</span>}
                      </td>
                      <td style={{ fontWeight:600 }}>{q.unitPrice > 0 ? fmtPKR(q.unitPrice * selectedRfq.qty) : "—"}</td>
                      <td style={{ color:"#64748b" }}>{q.leadDays > 0 ? `${q.leadDays} days` : "—"}</td>
                      <td style={{ color:"#64748b" }}>{q.payTerms || "—"}</td>
                      <td style={{ color:"#94a3b8", fontSize:12 }}>{q.validity || "—"}</td>
                      <td><Badge label={q.status} colors={Q_STATUS_COLORS[q.status]} /></td>
                      <td style={{ color:"#64748b", fontSize:12, fontStyle: q.notes ? "normal" : "italic" }}>{q.notes || "Awaiting response"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}
        </div>
      </div>

      {/* New RFQ Modal */}
      {showRfqModal && (
        <Modal title="Create New RFQ" onClose={() => setShowRfqModal(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Item / Material</label>
              <input value={rfqForm.item} onChange={e=>setRfqForm(f=>({...f,item:e.target.value}))} placeholder="e.g. LPG Cylinders 45kg" />
            </div>
            <div className="pm-form-group">
              <label>Quantity</label>
              <input type="number" value={rfqForm.qty} onChange={e=>setRfqForm(f=>({...f,qty:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Unit</label>
              <select value={rfqForm.unit} onChange={e=>setRfqForm(f=>({...f,unit:e.target.value}))}>
                {["Cylinders","Metric Ton","Pieces","Liters","Units"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Response Deadline</label>
              <input type="date" value={rfqForm.deadline} onChange={e=>setRfqForm(f=>({...f,deadline:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Linked PR ID</label>
              <input value={rfqForm.prId} onChange={e=>setRfqForm(f=>({...f,prId:e.target.value}))} placeholder="PR-001" />
            </div>
            <div className="pm-form-group" style={{ gridColumn:"1/-1" }}>
              <label>Send To Suppliers</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                {ALL_SUPPLIERS.map(s => {
                  const sel = rfqForm.suppliers.includes(s);
                  return (
                    <button key={s} type="button"
                      onClick={() => setRfqForm(f => ({ ...f, suppliers: sel ? f.suppliers.filter(x=>x!==s) : [...f.suppliers, s] }))}
                      style={{ padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", background: sel ? ACCENT : "#f1f5f9", color: sel ? "#fff" : "#374151", border:"none" }}
                    >{s}</button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={createRfq}>Send RFQ</button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setShowRfqModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Add Quote Modal */}
      {showQuoteModal && (
        <Modal title="Add Supplier Quote" onClose={() => setShowQuoteModal(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Supplier</label>
              <select value={quoteForm.supplier} onChange={e=>setQuoteForm(f=>({...f,supplier:e.target.value}))}>
                <option value="">Select supplier…</option>
                {ALL_SUPPLIERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Unit Price (PKR)</label>
              <input type="number" value={quoteForm.unitPrice} onChange={e=>setQuoteForm(f=>({...f,unitPrice:e.target.value}))} placeholder="0" />
            </div>
            <div className="pm-form-group">
              <label>Lead Time (days)</label>
              <input type="number" value={quoteForm.leadDays} onChange={e=>setQuoteForm(f=>({...f,leadDays:e.target.value}))} placeholder="0" />
            </div>
            <div className="pm-form-group">
              <label>Payment Terms</label>
              <select value={quoteForm.payTerms} onChange={e=>setQuoteForm(f=>({...f,payTerms:e.target.value}))}>
                {["Advance","30 days","45 days","60 days","90 days","LC"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Quote Validity Date</label>
              <input type="date" value={quoteForm.validity} onChange={e=>setQuoteForm(f=>({...f,validity:e.target.value}))} />
            </div>
            <div className="pm-form-group">
              <label>Notes</label>
              <input value={quoteForm.notes} onChange={e=>setQuoteForm(f=>({...f,notes:e.target.value}))} placeholder="FOB, CIF, etc." />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="pm-btn pm-btn-primary" style={{ flex:1 }} onClick={addQuote}>Save Quote</button>
            <button className="pm-btn pm-btn-outline" style={{ flex:1 }} onClick={() => setShowQuoteModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
