import { useState } from "react";
import { BarChart } from "./components/PurchaseCharts";
import { DONUT_COLORS, DONUT_LABELS } from "./purchaseConstants";

export default function CostBreakdown({ purchases }) {
  const [hoverSeg, setHoverSeg] = useState(null);

  const totals = purchases.reduce((acc,p) => {
    acc[0] += p.qty * p.unitPrice;
    acc[1] += p.transportation;
    acc[2] += p.customs;
    acc[3] += p.port;
    acc[4] += p.brokerage;
    acc[5] += p.misc;
    return acc;
  }, [0,0,0,0,0,0]);

  const grandTotal = totals.reduce((a,b)=>a+b,0) || 1;
  const pcts = totals.map(v => Math.round((v/grandTotal)*100));

  // Donut
  const r=88, cx=108, cy=108, sw=34, circ=2*Math.PI*r;
  let offset=0;
  const segs = pcts.map((v,i) => {
    const len = (v/100)*circ;
    const s = { v, i, offset, len };
    offset += len;
    return s;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="pm-page-title">Cost Breakdown Analysis</h1>
          <p className="pm-page-sub">Purchase cost structure by category</p>
        </div>
      </div>

      <div className="charts-row">
        {/* Donut + legend */}
        <div className="chart-card" style={{flex:1}}>
          <div className="chart-title"><span className="chart-title-bar"/>Cost Distribution (%)</div>
          <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
            <svg width="216" height="216" viewBox="0 0 216 216">
              {segs.map(s=>(
                <circle key={s.i}
                  cx={cx} cy={cy} r={r} fill="none"
                  stroke={DONUT_COLORS[s.i]}
                  strokeWidth={hoverSeg===s.i ? sw+6 : sw}
                  strokeDasharray={`${s.len} ${circ-s.len}`}
                  strokeDashoffset={-s.offset + circ/4}
                  style={{cursor:"pointer",transition:"stroke-width 0.15s"}}
                  onMouseEnter={()=>setHoverSeg(s.i)}
                  onMouseLeave={()=>setHoverSeg(null)}
                />
              ))}
              {hoverSeg!==null && (
                <text x={cx} y={cy+7} textAnchor="middle" fill="#111827" fontSize="20" fontWeight="800">
                  {pcts[hoverSeg]}%
                </text>
              )}
            </svg>
          </div>
          {/* Inline legend — matches video */}
          <div className="cb-legend-row">
            {DONUT_LABELS.map((l,i)=>(
              <div key={i} className="cb-legend-item">
                <span className="cb-legend-dot" style={{background:DONUT_COLORS[i]}}/>
                <span style={{color:DONUT_COLORS[i],fontWeight:600}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="chart-card" style={{flex:1}}>
          <div className="chart-title"><span className="chart-title-bar"/>Monthly Purchase Trend</div>
          <BarChart/>
        </div>
      </div>

      {/* Cost Components Detail — full width */}
      <div className="chart-card" style={{marginTop:0}}>
        <div className="chart-title"><span className="chart-title-bar"/>Cost Components Detail</div>
        <div className="breakdown-detail-list">
          {DONUT_LABELS.map((l,i)=>(
            <div key={i} className="breakdown-detail-row">
              <span className="breakdown-dot" style={{background:DONUT_COLORS[i]}}/>
              <span className="breakdown-label">{l}</span>
              <div className="breakdown-track">
                <div className="breakdown-fill" style={{width:`${pcts[i]}%`,background:DONUT_COLORS[i]}}/>
              </div>
              <span className="breakdown-pct">{pcts[i]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
