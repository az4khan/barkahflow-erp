import { useState } from "react";
import { fmtPKR } from "./purchaseConstants";
import { DONUT_COLORS } from "./purchaseConstants";

const COST_ROWS = [
  { label:"Product Cost",        key:null,            color:"#f97316" },
  { label:"Transportation Cost", key:"transportation", color:"#3b82f6" },
  { label:"Customs Duty",        key:"customs",        color:"#22c55e" },
  { label:"Brokerage Fee",       key:"brokerage",      color:"#8b5cf6" },
  { label:"Loading/Unloading",   key:"loading",        color:"#f59e0b" },
  { label:"Port Charges",        key:"port",           color:"#ef4444" },
  { label:"Miscellaneous",       key:"misc",           color:"#f97316" },
];

const HORIZ_LABELS = ["Product","Transport","Customs","Brokerage","Loading","Port","Misc"];
const AXIS_LABELS  = ["0M","15M","30M","45M","60M"];

export default function LandedCost({ purchases }) {
  const [selected, setSelected] = useState(purchases[0]?.id);
  const po = purchases.find(p=>p.id===selected) || purchases[0];

  const costs = po ? COST_ROWS.map(c => ({
    ...c,
    value: c.key === null ? po.qty * po.unitPrice : (po[c.key] || 0)
  })) : [];

  const total  = costs.reduce((s,c)=>s+c.value, 0);
  const maxVal = Math.max(...costs.map(c=>c.value), 1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="pm-page-title">Landed Cost Calculator</h1>
          <p className="pm-page-sub">Full cost breakdown including all import charges</p>
        </div>
        <div style={{width:340}}>
          <select
            value={selected}
            onChange={e=>setSelected(e.target.value)}
            style={{width:"100%",height:42,borderRadius:10,border:"1.5px solid #e5e7eb",padding:"0 14px",fontSize:13.5,color:"#374151",background:"#fff",outline:"none"}}
          >
            {purchases.map(p=>(
              <option key={p.id} value={p.id}>{p.id} — {p.supplier} — {p.product}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-row">
        {/* Left: Cost Components */}
        <div className="chart-card" style={{flex:1.2}}>
          <div style={{fontSize:15,fontWeight:700,color:"#374151",marginBottom:22}}>
            <span style={{color:"#f97316",fontWeight:800}}>{po?.id}</span>
            {po ? ` — ${po.supplier} — ${po.product}` : ""}
          </div>
          <div className="cost-components-list">
            {costs.map((c,i)=>(
              <div key={i} className="cost-comp-row">
                <span className="cost-comp-label">{c.label}</span>
                <div className="cost-comp-track">
                  <div className="cost-comp-fill" style={{
                    width: `${(c.value/maxVal)*100}%`,
                    background: c.color,
                    minWidth: c.value > 0 ? 6 : 0
                  }}/>
                </div>
                <span className="cost-comp-val">{fmtPKR(c.value)}</span>
              </div>
            ))}
          </div>
          <div className="total-cost-line" style={{marginTop:22}}>
            <span>Total Landed Cost</span>
            <span className="total-cost-val">{fmtPKR(total)}</span>
          </div>
        </div>

        {/* Right: Horizontal bar chart */}
        <div className="chart-card" style={{flex:0.9}}>
          <div className="chart-title"><span className="chart-title-bar"/>Cost Visualization</div>
          <div className="horiz-chart" style={{marginTop:12}}>
            {costs.map((c,i)=>(
              <div key={i} className="horiz-row">
                <span className="horiz-label">{HORIZ_LABELS[i]}</span>
                <div className="horiz-track">
                  <div className="horiz-fill" style={{
                    width: `${Math.min((c.value/maxVal)*100,100)}%`,
                    background: c.color,
                    minWidth: c.value > 0 ? 8 : 0
                  }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="horiz-axis">
            {AXIS_LABELS.map(l=><span key={l}>{l}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
