import { useState, useEffect } from "react";
import { ACCENT, fmtPKR } from "./purchaseConstants";
import Icon from "../../components/common/Icon";

const COMPARISON_DATA = [
  {
    rfqId:"RFQ-001", item:"LPG Cylinders 45kg", qty:2000, unit:"Cylinders",
    quotes:[
      { supplier:"Saudi Aramco",  unitPrice:8500, leadDays:14, payTerms:"30 days", incoterm:"FOB Karachi",   warranty:"Yes", score:82 },
      { supplier:"ADNOC",         unitPrice:8200, leadDays:18, payTerms:"45 days", incoterm:"CIF Karachi",   warranty:"Yes", score:88 },
      { supplier:"Shell Gas",     unitPrice:8750, leadDays:10, payTerms:"30 days", incoterm:"Ex-Works",      warranty:"No",  score:76 },
    ]
  },
  {
    rfqId:"RFQ-003", item:"LPG Bulk MT", qty:300, unit:"Metric Ton",
    quotes:[
      { supplier:"ADNOC",         unitPrice:7800, leadDays:10, payTerms:"60 days", incoterm:"FOB Abu Dhabi", warranty:"Yes", score:91 },
      { supplier:"Shell Gas",     unitPrice:7950, leadDays:14, payTerms:"30 days", incoterm:"CIF Karachi",   warranty:"Yes", score:85 },
      { supplier:"TotalEnergies", unitPrice:7720, leadDays:16, payTerms:"45 days", incoterm:"FOB Rotterdam", warranty:"Yes", score:87 },
    ]
  },
];

const CRITERIA = [
  { key:"unitPrice", label:"Unit Price",   weight:40, lowerBetter:true  },
  { key:"leadDays",  label:"Lead Time",    weight:25, lowerBetter:true  },
  { key:"score",     label:"Vendor Score", weight:35, lowerBetter:false },
];

function ScoreBar({ value, max, color, go }) {
  return (
    <div style={{ flex:1, height:6, background:"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
      <div style={{ height:"100%", width: go ? `${(value/max)*100}%` : "0%", background:color, borderRadius:3, transition:"width 0.7s cubic-bezier(0.34,1.15,0.64,1)" }} />
    </div>
  );
}

export default function QuotationComparison({ onNav }) {
  const [selected, setSelected] = useState(COMPARISON_DATA[0]);
  const [awarded, setAwarded]   = useState({});
  const [go, setGo]             = useState(false);
  const [weights, setWeights]   = useState({ unitPrice:40, leadDays:25, score:35 });

  useEffect(() => { const t = setTimeout(() => setGo(true), 120); return () => clearTimeout(t); }, [selected]);

  const quotes = selected.quotes;
  const minPrice   = Math.min(...quotes.map(q=>q.unitPrice));
  const minLead    = Math.min(...quotes.map(q=>q.leadDays));
  const maxScore   = Math.max(...quotes.map(q=>q.score));
  const maxPrice   = Math.max(...quotes.map(q=>q.unitPrice));
  const maxLead    = Math.max(...quotes.map(q=>q.leadDays));

  // Weighted composite score
  const composite = (q) => {
    const pScore = ((maxPrice - q.unitPrice) / (maxPrice - minPrice || 1)) * weights.unitPrice;
    const lScore = ((maxLead  - q.leadDays)  / (maxLead  - minLead  || 1)) * weights.leadDays;
    const vScore = (q.score / 100) * weights.score;
    return Math.round(pScore + lScore + vScore);
  };

  const ranked = [...quotes].map(q => ({ ...q, composite: composite(q) })).sort((a,b) => b.composite - a.composite);
  const COLORS = ["#f97316","#3b82f6","#22c55e","#8b5cf6"];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Quotation Comparison</h1>
          <p className="pm-page-sub">Side-by-side supplier analysis with weighted scoring</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => onNav && onNav("purchase-order")}>
            Create PO →
          </button>
        </div>
      </div>

      {/* RFQ selector */}
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {COMPARISON_DATA.map(d => (
          <button key={d.rfqId} onClick={() => { setSelected(d); setGo(false); setTimeout(()=>setGo(true),120); }}
            style={{ padding:"8px 16px", borderRadius:10, border:`1px solid ${selected.rfqId===d.rfqId ? ACCENT : "#e2e8f0"}`,
              background: selected.rfqId===d.rfqId ? "#fff7ed" : "#fff",
              color: selected.rfqId===d.rfqId ? ACCENT : "#374151",
              fontSize:13, fontWeight:selected.rfqId===d.rfqId ? 700 : 500, cursor:"pointer" }}
          >
            {d.rfqId} — {d.item}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
        {/* Main comparison table */}
        <div>
          {/* Supplier cards */}
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${quotes.length},1fr)`, gap:12, marginBottom:16 }}>
            {ranked.map((q, i) => {
              const isTop   = i === 0;
              const isAwarded = awarded[selected.rfqId] === q.supplier;
              return (
                <div key={q.supplier} style={{ background: isTop ? "#fff7ed" : "#fff", border:`1.5px solid ${isTop ? "#fed7aa" : "#f1f5f9"}`, borderRadius:12, padding:16, position:"relative" }}>
                  {isTop && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#f97316", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 10px", borderRadius:20 }}>RECOMMENDED</div>}
                  {isAwarded && <div style={{ position:"absolute", top:-10, right:12, background:"#16a34a", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 10px", borderRadius:20 }}>AWARDED</div>}
                  <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:8 }}>{q.supplier}</div>

                  {/* Composite score ring */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background: isTop ? "#fff7ed" : "#f8fafc", border:`3px solid ${COLORS[i]}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:COLORS[i] }}>{q.composite}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:"#94a3b8", fontWeight:600 }}>Composite Score</div>
                      <div style={{ fontSize:11, color:"#374151", fontWeight:500 }}>Rank #{i+1}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {[
                    { label:"Unit Price", value:fmtPKR(q.unitPrice), highlight: q.unitPrice===minPrice, good:true },
                    { label:"Total Value",value:fmtPKR(q.unitPrice*selected.qty), highlight:false },
                    { label:"Lead Time",  value:`${q.leadDays} days`, highlight: q.leadDays===minLead, good:true },
                    { label:"Payment",    value:q.payTerms,           highlight:false },
                    { label:"Incoterm",   value:q.incoterm,           highlight:false },
                    { label:"Warranty",   value:q.warranty,           highlight: q.warranty==="Yes", good:true },
                  ].map(m => (
                    <div key={m.label} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #f8fafc", fontSize:12 }}>
                      <span style={{ color:"#94a3b8" }}>{m.label}</span>
                      <span style={{ fontWeight:600, color: m.highlight && m.good ? "#16a34a" : "#0f172a" }}>
                        {m.highlight && m.good ? "✓ " : ""}{m.value}
                      </span>
                    </div>
                  ))}

                  <button
                    className="pm-btn"
                    style={{ width:"100%", marginTop:12, background: isAwarded ? "#dcfce7" : isTop ? ACCENT : "#f8fafc", color: isAwarded ? "#166534" : isTop ? "#fff" : "#374151", border:"none", fontWeight:700, fontSize:12 }}
                    onClick={() => setAwarded(a => ({ ...a, [selected.rfqId]: isAwarded ? null : q.supplier }))}
                  >
                    {isAwarded ? "✓ Awarded" : isTop ? "Award Contract" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bar comparison */}
          <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:18 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#374151", marginBottom:14 }}>Score Comparison</div>
            {CRITERIA.map(c => {
              const vals = quotes.map(q => q[c.key]);
              const max  = c.lowerBetter ? Math.max(...vals) : Math.max(...vals);
              return (
                <div key={c.key} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{c.label}</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>Weight: {c.weight}%</span>
                  </div>
                  {quotes.map((q, qi) => (
                    <div key={q.supplier} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                      <span style={{ width:110, fontSize:11.5, color:"#64748b", fontWeight:500 }}>{q.supplier}</span>
                      <ScoreBar value={c.lowerBetter ? max - q[c.key] + 1 : q[c.key]} max={c.lowerBetter ? max : max} color={COLORS[qi]} go={go} />
                      <span style={{ width:60, fontSize:11, color:"#94a3b8", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>
                        {c.key==="unitPrice" ? fmtPKR(q[c.key]) : c.key==="leadDays" ? `${q[c.key]}d` : `${q[c.key]}pts`}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weight controls + summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:18 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#374151", marginBottom:14 }}>Scoring Weights</div>
            {CRITERIA.map(c => (
              <div key={c.key} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:"#374151" }}>{c.label}</label>
                  <span style={{ fontSize:12, fontWeight:700, color:ACCENT }}>{weights[c.key]}%</span>
                </div>
                <input type="range" min={5} max={70} value={weights[c.key]}
                  onChange={e => setWeights(w => ({ ...w, [c.key]: Number(e.target.value) }))}
                  style={{ width:"100%", accentColor:ACCENT }} />
              </div>
            ))}
          </div>

          <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:18 }}>
            <div style={{ fontSize:12.5, fontWeight:600, color:"#374151", marginBottom:12 }}>Award Summary</div>
            <div style={{ fontSize:12, color:"#0f172a", fontWeight:600, marginBottom:4 }}>{selected.item}</div>
            <div style={{ fontSize:11.5, color:"#94a3b8", marginBottom:12 }}>{selected.qty.toLocaleString()} {selected.unit}</div>
            {awarded[selected.rfqId] ? <>
              <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:12, marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#16a34a", fontWeight:700, marginBottom:4 }}>AWARDED TO</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>{awarded[selected.rfqId]}</div>
              </div>
              <button className="pm-btn pm-btn-primary" style={{ width:"100%" }} onClick={() => onNav && onNav("purchase-order")}>
                Generate PO →
              </button>
            </> : (
              <div style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>No contract awarded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
