import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT = "#f97316";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtPKR(n){if(!n)return"Rs 0";if(n>=1e7)return`Rs ${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs ${(n/1e5).toFixed(1)}L`;return`Rs ${Number(n).toLocaleString()}`;}

// Animate a counter from 0 to target
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// Bar chart with animated grow-from-bottom
function AnimBar({ value, maxVal, label, accent, delay = 0 }) {
  const [height, setHeight] = useState(0);
  const [hov, setHov]       = useState(false);
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setHeight(pct), 80 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="pm-bar-col"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div className="pm-bar-inner">
        <div className="pm-bar-fill"
          style={{
            height: `${height}%`,
            background: hov ? "#ea6c0c" : accent,
            transition: `height 0.65s cubic-bezier(0.34,1.15,0.64,1) ${delay}ms`,
          }}
        />
      </div>
      <span className="pm-bar-lbl">{label}</span>
      {hov && (
        <div className="pm-bar-tip">
          <div className="pm-tip-month">{label}</div>
          <div className="pm-tip-val">Total: <span>{fmtPKR(value)}</span></div>
        </div>
      )}
    </div>
  );
}

// Animated donut segment
function DonutChart({ segments }) {
  const [progress, setProgress] = useState(0);
  const [hov, setHov]           = useState(null);
  const R = 60, CX = 70, CY = 70, SW = 22;
  const circ = 2 * Math.PI * R;

  useEffect(() => {
    const t = setTimeout(() => {
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1400, 1);   // 1400ms — smooth and readable
        const ease = 1 - Math.pow(1 - p, 3);           // cubic ease-out
        setProgress(ease);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);   // slight delay so page content renders first
    return () => clearTimeout(t);
  }, []);

  let off = 0;
  const arcs = segments.map(d => {
    const dash    = (d.pct / 100) * circ * progress;
    const gap     = circ - dash;
    const arc     = { ...d, dasharray: `${dash} ${circ - dash}`, dashoffset: -(off / 100) * circ * progress };
    off += d.pct;
    return arc;
  });

  const total = hov !== null ? segments[hov]?.pct : null;

  return (
    <div className="pm-donut-wrap">
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink:0, cursor:"default" }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW}/>
        {arcs.map((a, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none"
            stroke={a.color} strokeWidth={hov===i ? SW+3 : SW}
            strokeDasharray={a.dasharray} strokeDashoffset={a.dashoffset}
            style={{ transform:"rotate(-90deg)", transformOrigin:`${CX}px ${CY}px`, transition:"stroke-width 0.15s, stroke-dasharray 0.05s" }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
          />
        ))}
        {hov !== null ? (
          <>
            <text x={CX} y={CY-4} textAnchor="middle" fontSize={14} fontWeight="700" fill="#0f172a">{segments[hov]?.pct}%</text>
            <text x={CX} y={CY+11} textAnchor="middle" fontSize={8} fill="#94a3b8">{segments[hov]?.label}</text>
          </>
        ) : (
          <text x={CX} y={CY+4} textAnchor="middle" fontSize={9} fill="#94a3b8">hover</text>
        )}
      </svg>
      <div className="pm-donut-legend">
        {segments.map((d, i) => (
          <div className="pm-legend-row" key={d.label}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ opacity: hov !== null && hov !== i ? 0.4 : 1, transition:"opacity 0.15s" }}>
            <div className="pm-legend-dot" style={{ background:d.color }}/>
            <span className="pm-legend-name">{d.label}</span>
            <span className="pm-legend-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PMDashboard() {
  const { purchases, purchaseOrders, suppliers, materials, prs, grns } = useApp();
  const navigate = useNavigate();

  const totalSpend    = (purchases||[]).reduce((s,p) => s+(p.totalAmount||0), 0);
  const activePOs     = (purchaseOrders||[]).filter(p => ["initiated","pending","approved"].includes(p.status)).length;
  const completedGRNs = (grns||[]).filter(g => g.status==="completed").length;
  const totalUnits    = (materials||[]).reduce((s,m) => s+(m.stockQty||0), 0);

  // Animated counter values
  const animPOs   = useCountUp(activePOs);
  const animGRNs  = useCountUp(completedGRNs);
  const animUnits = useCountUp(totalUnits);

  // Monthly bar data
  const now = new Date();
  const monthlyData = Array.from({length:6}, (_,i) => {
    const d   = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const val = (purchases||[])
      .filter(p => { const pd=new Date(p.createdAt); return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear(); })
      .reduce((s,p) => s+(p.totalAmount||0), 0) || (30+i*10)*1e6;
    return { label:MONTHS[d.getMonth()], value:val };
  });
  const maxVal = Math.max(...monthlyData.map(d=>d.value), 1);

  const donutSegments = [
    { label:"Product Cost",   pct:62, color:"#f97316" },
    { label:"Transportation", pct:14, color:"#3b82f6" },
    { label:"Customs Duty",   pct:12, color:"#10b981" },
    { label:"Port Charges",   pct:6,  color:"#8b5cf6" },
    { label:"Brokerage",      pct:4,  color:"#f59e0b" },
    { label:"Misc",           pct:2,  color:"#ef4444" },
  ];

  const STATS = [
    { label:"Total Landed Cost",  value:fmtPKR(totalSpend), hint:"All purchases",  badge:"8.1%↑", icon:"briefcase",  bg:"#fff7ed", color:"#f97316" },
    { label:"Active Orders",      value:animPOs,             hint:"POs in progress",badge:null,    icon:"purchase",   bg:"#eff6ff", color:"#3b82f6" },
    { label:"Completed GRNs",     value:animGRNs,            hint:"This month",     badge:null,    icon:"check",      bg:"#f0fdf4", color:"#10b981" },
    { label:"Total Stock Units",  value:animUnits.toLocaleString(), hint:"All materials", badge:null, icon:"box",   bg:"#f5f3ff", color:"#8b5cf6" },
  ];

  return (
    <div className="pm-page">
      {/* Header */}
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Purchase Management</h2>
          <p className="pm-page-sub">International Energy Procurement — Module 1</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={() => {
            const csv=["ID,Supplier,Amount,Status,Date",...(purchases||[]).map(p=>`${p.id},${p.supplierName},${p.totalAmount},${p.status},${p.createdAt?.slice(0,10)}`)].join("\n");
            const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="purchases.csv";a.click();
          }}>↓ Export</button>
          <button className="pm-btn pm-btn-primary" onClick={() => navigate("/purchase/pr")}>+ New PR</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="pm-tab-bar">
        {[["Overview",""],["Purchase List","list"],["Suppliers","suppliers"],["Reports","reports"]].map(([label,path])=>(
          <button key={label} className={`pm-tab ${!path?"active":""}`}
            onClick={() => path && navigate(`/purchase/${path}`)}>
            {label}
          </button>
        ))}
      </div>

      {/* Stat cards — no border color, clean theme */}
      <div className="pm-stat-grid">
        {STATS.map(s => (
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top">
              <div className="pm-stat-icon" style={{ background:s.bg }}>
                <Icon name={s.icon} size={17} color={s.color}/>
              </div>
              {s.badge && <span className="pm-stat-badge">{s.badge}</span>}
            </div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value">{s.value}</div>
            <div className="pm-stat-hint">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="pm-charts-row">
        <div className="pm-chart-card">
          <div className="pm-chart-title">Monthly Purchase Trend (PKR)</div>
          <div className="pm-barchart-wrap">
            <div className="pm-barchart">
              <div className="pm-barchart-y">
                {["80M","60M","40M","20M","0M"].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="pm-barchart-cols">
                {monthlyData.map((d,i) => (
                  <AnimBar key={i} value={d.value} maxVal={maxVal} label={d.label} accent={ACCENT} delay={i*60}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pm-chart-card">
          <div className="pm-chart-title">Cost Breakdown by Category</div>
          <DonutChart segments={donutSegments}/>
        </div>
      </div>

      {/* Recent PRs */}
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <span className="pm-table-title">Recent Purchase Requisitions</span>
          <button className="pm-btn pm-btn-ghost" style={{fontSize:12}} onClick={() => navigate("/purchase/pr")}>View All →</button>
        </div>
        <table className="pm-table">
          <thead>
            <tr>
              <th>PR ID</th><th>Title</th><th>Department</th>
              <th>Priority</th><th>Est. Amount</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(prs||[]).slice(0,5).map(pr => (
              <tr key={pr.id}>
                <td style={{fontWeight:600,color:ACCENT}}>{pr.id}</td>
                <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr.title}</td>
                <td>{pr.department}</td>
                <td><span className={`pm-badge pm-badge-${pr.priority==="high"?"red":pr.priority==="normal"?"blue":"gray"}`}>{pr.priority}</span></td>
                <td style={{fontWeight:600}}>{fmtPKR(pr.totalEstimated)}</td>
                <td><span className={`pm-badge pm-badge-${{draft:"gray",initiated:"blue",pending:"orange",approved:"green",rejected:"red"}[pr.status]||"gray"}`}>{pr.status}</span></td>
                <td style={{color:"#94a3b8",fontSize:12}}>{pr.createdAt?.slice(0,10)}</td>
              </tr>
            ))}
            {!(prs||[]).length && (
              <tr><td colSpan={7} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>No PRs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
