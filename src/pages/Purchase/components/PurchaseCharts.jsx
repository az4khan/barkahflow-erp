import { useState, useEffect } from "react";
import { MONTHS, MONTHLY_DATA, DONUT_COLORS, DONUT_LABELS, DONUT_VALS, ACCENT } from "../purchaseConstants";

export function BarChart({ data = MONTHLY_DATA, labels = MONTHS }) {
  const [go, setGo] = useState(false);
  const [hover, setHover] = useState(null);
  const max = Math.max(...data);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display:"flex", height:180, width:"100%", gap:0 }}>
      {/* Y axis */}
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between", paddingBottom:22, width:32, flexShrink:0 }}>
        {[80,60,40,20,0].map(v => (
          <span key={v} style={{ fontSize:9, color:"#cbd5e1", textAlign:"right", display:"block" }}>{v}M</span>
        ))}
      </div>

      {/* Bars */}
      <div style={{ flex:1, display:"flex", alignItems:"flex-end", gap:5, paddingBottom:22 }}>
        {data.map((v, i) => {
          const pct = (v / max) * 100;
          const isHov = hover === i;
          return (
            <div key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", position:"relative", cursor:"pointer" }}
            >
              {isHov && (
                <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#0f172a", borderRadius:8, padding:"6px 10px", zIndex:10, whiteSpace:"nowrap", pointerEvents:"none", boxShadow:"0 4px 14px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:"#94a3b8", marginBottom:2 }}>{labels[i]}</div>
                  <div style={{ fontSize:11, color:"#f97316", fontWeight:700 }}>Rs {(v/1e6).toFixed(1)}M</div>
                </div>
              )}
              <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                <div style={{
                  width: "100%",
                  height: go ? `${pct}%` : "0%",
                  minHeight: 2,
                  borderRadius: "4px 4px 0 0",
                  background: isHov ? "#ea6c0c" : ACCENT,
                  opacity: hover !== null && !isHov ? 0.4 : 1,
                  transition: `height 0.6s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.07}s, opacity 0.15s, background 0.12s`,
                }} />
              </div>
              <span style={{ position:"absolute", bottom:-18, fontSize:9, color:"#94a3b8", fontWeight:500, whiteSpace:"nowrap" }}>
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart() {
  const [go, setGo] = useState(false);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 150);
    return () => clearTimeout(t);
  }, []);

  const r = 58, cx = 72, cy = 72, sw = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = DONUT_VALS.map((v, i) => {
    const len = (v / 100) * circ;
    const s = { v, i, offset, len };
    offset += len;
    return s;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ flexShrink:0 }}>
        <svg width={144} height={144} viewBox="0 0 144 144">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
          {segs.map(s => (
            <circle key={s.i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={DONUT_COLORS[s.i]}
              strokeWidth={hover === s.i ? sw + 5 : sw}
              strokeDasharray={go ? `${s.len} ${circ - s.len}` : `0 ${circ}`}
              strokeDashoffset={-s.offset + circ / 4}
              style={{
                cursor: "pointer",
                transition: go
                  ? `stroke-dasharray 0.65s cubic-bezier(0.34,1.15,0.64,1) ${s.i * 0.09}s, stroke-width 0.15s`
                  : "none",
              }}
              onMouseEnter={() => setHover(s.i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
          {hover !== null ? (
            <>
              <text x={cx} y={cy - 3} textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">{DONUT_VALS[hover]}%</text>
              <text x={cx} y={cy + 13} textAnchor="middle" fill="#94a3b8" fontSize="9">{DONUT_LABELS[hover].split(" ")[0]}</text>
            </>
          ) : (
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#cbd5e1" fontSize="10">hover</text>
          )}
        </svg>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        {DONUT_LABELS.map((l, i) => (
          <div key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", opacity: hover !== null && hover !== i ? 0.3 : 1, transition:"opacity 0.15s" }}
          >
            <span style={{ width:8, height:8, borderRadius:"50%", background:DONUT_COLORS[i], flexShrink:0 }} />
            <span style={{ flex:1, fontSize:11.5, color:"#374151", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l}</span>
            <span style={{ fontSize:11.5, fontWeight:700, color:"#0f172a" }}>{DONUT_VALS[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizChart({ rows }) {
  const [go, setGo] = useState(false);
  const max = rows?.length ? Math.max(...rows.map(r => r.value)) : 1;

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {(rows || []).map((row, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:82, fontSize:11.5, color:"#64748b", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flexShrink:0 }}>{row.label}</span>
          <div style={{ flex:1, height:7, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
            <div style={{
              height: "100%",
              width: go ? `${(row.value / max) * 100}%` : "0%",
              background: row.color || ACCENT,
              borderRadius: 4,
              transition: `width 0.65s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.07}s`,
            }} />
          </div>
          {row.pct && <span style={{ fontSize:11, color:"#94a3b8", minWidth:34, textAlign:"right" }}>{row.pct}%</span>}
        </div>
      ))}
    </div>
  );
}
