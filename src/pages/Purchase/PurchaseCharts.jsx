import { useState, useEffect, useRef } from "react";
import { MONTHS, MONTHLY_DATA, DONUT_COLORS, DONUT_LABELS, DONUT_VALS, ACCENT } from "../purchaseConstants";

/*
 * useAnimateOnMount — fires `go = true` after `delay` ms, every time the
 * component mounts. Works even if the element is already in the viewport.
 */
function useAnimateOnMount(delay = 100) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), delay);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line
  return go;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAR CHART — bars grow up from 0 on mount
═══════════════════════════════════════════════════════════════════════════ */
export function BarChart({ data = MONTHLY_DATA, labels = MONTHS }) {
  const go    = useAnimateOnMount(80);
  const [hov, setHov] = useState(null);
  const max   = Math.max(...data);
  const yTick = ["80M", "60M", "40M", "20M", "0"];

  return (
    <div style={{ display:"flex", height:180, gap:0, width:"100%" }}>
      {/* Y-axis */}
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between", paddingBottom:22, width:30, flexShrink:0 }}>
        {yTick.map(v => (
          <span key={v} style={{ fontSize:9, color:"#cbd5e1", textAlign:"right", display:"block", fontVariantNumeric:"tabular-nums" }}>{v}</span>
        ))}
      </div>

      {/* Bars */}
      <div style={{ flex:1, display:"flex", alignItems:"flex-end", gap:5, paddingBottom:22 }}>
        {data.map((v, i) => {
          const pct   = (v / max) * 100;
          const isHov = hov === i;
          return (
            <div key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", position:"relative", cursor:"pointer" }}
            >
              {/* Tooltip */}
              {isHov && (
                <div style={{
                  position:"absolute", bottom:"calc(100% + 4px)",
                  left:"50%", transform:"translateX(-50%)",
                  background:"#0f172a", borderRadius:8, padding:"7px 10px",
                  zIndex:10, whiteSpace:"nowrap", pointerEvents:"none",
                  boxShadow:"0 4px 14px rgba(0,0,0,0.18)"
                }}>
                  <div style={{ fontSize:9.5, fontWeight:700, color:"#94a3b8", marginBottom:3 }}>{labels[i]}</div>
                  <div style={{ fontSize:11, color:"#e2e8f0" }}>
                    <span style={{ color:"#f97316", fontWeight:700 }}>Rs {(v/1e6).toFixed(1)}M</span>
                  </div>
                </div>
              )}

              {/* Bar container */}
              <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                <div style={{
                  width:"100%",
                  height: go ? `${pct}%` : "0%",
                  minHeight: go ? 2 : 0,
                  borderRadius:"4px 4px 0 0",
                  background: isHov ? "#ea6c0c" : ACCENT,
                  opacity: hov !== null && !isHov ? 0.45 : 1,
                  transition: `height 0.55s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.055}s,
                               opacity 0.15s ease, background 0.12s ease`,
                }} />
              </div>

              {/* Label */}
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

/* ═══════════════════════════════════════════════════════════════════════════
   DONUT CHART — segments sweep in sequentially on mount
═══════════════════════════════════════════════════════════════════════════ */
export function DonutChart() {
  const go  = useAnimateOnMount(120);
  const [hov, setHov] = useState(null);

  const r    = 58;
  const cx   = 72;
  const cy   = 72;
  const sw   = 20;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segs = DONUT_VALS.map((v, i) => {
    const len = (v / 100) * circ;
    const s   = { v, i, offset, len };
    offset   += len;
    return s;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      {/* SVG donut */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <svg width={144} height={144} viewBox="0 0 144 144">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />

          {segs.map(s => (
            <circle key={s.i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={DONUT_COLORS[s.i]}
              strokeWidth={hov === s.i ? sw + 4 : sw}
              strokeDasharray={go ? `${s.len} ${circ - s.len}` : `0 ${circ}`}
              strokeDashoffset={-s.offset + circ / 4}
              style={{
                cursor:"pointer",
                transition: `stroke-dasharray 0.6s cubic-bezier(0.34,1.15,0.64,1) ${s.i * 0.08}s,
                             stroke-width 0.15s ease`,
              }}
              onMouseEnter={() => setHov(s.i)}
              onMouseLeave={() => setHov(null)}
            />
          ))}

          {/* Centre label */}
          {hov !== null ? (
            <>
              <text x={cx} y={cy - 4} textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">
                {DONUT_VALS[hov]}%
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">
                {DONUT_LABELS[hov].split(" ")[0]}
              </text>
            </>
          ) : (
            <text x={cx} y={cy + 4} textAnchor="middle" fill="#cbd5e1" fontSize="10">
              hover
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
        {DONUT_LABELS.map((l, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", opacity: hov !== null && hov !== i ? 0.35 : 1, transition:"opacity 0.15s" }}
          >
            <span style={{ width:8, height:8, borderRadius:"50%", background:DONUT_COLORS[i], flexShrink:0 }} />
            <span style={{ flex:1, fontSize:11.5, color:"#374151", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l}</span>
            <span style={{ fontSize:11.5, fontWeight:700, color:"#0f172a", fontVariantNumeric:"tabular-nums" }}>{DONUT_VALS[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HORIZONTAL BAR CHART — bars grow right on mount
═══════════════════════════════════════════════════════════════════════════ */
export function HorizChart({ rows }) {
  const go  = useAnimateOnMount(80);
  const max = rows?.length ? Math.max(...rows.map(r => r.value)) : 1;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {(rows || []).map((row, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:82, fontSize:11.5, color:"#64748b", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flexShrink:0 }}>
            {row.label}
          </span>
          <div style={{ flex:1, height:7, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width: go ? `${(row.value / max) * 100}%` : "0%",
              background: row.color || ACCENT,
              borderRadius:4,
              transition: `width 0.65s cubic-bezier(0.34,1.15,0.64,1) ${i * 0.07}s`,
            }} />
          </div>
          <span style={{ fontSize:11, color:"#94a3b8", minWidth:50, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>
            {row.pct ? `${row.pct}%` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
