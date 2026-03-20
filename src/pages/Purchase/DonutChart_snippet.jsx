// ─── Donut Chart JSX Pattern ─────────────────────────────────────────
// Each segment needs: className="donut-segment", stroke-dasharray, stroke-dashoffset
// and style={{ '--dash-offset': finalOffset }}

const RADIUS = 90;
const CIRC = 2 * Math.PI * RADIUS; // ≈ 565.5

const segments = [
  { label: 'Product Cost',   pct: 62, color: '#f97316' },
  { label: 'Transportation', pct: 14, color: '#3b82f6' },
  { label: 'Customs Duty',   pct: 12, color: '#22c55e' },
  { label: 'Port Handling',  pct:  7, color: '#a855f7' },
  { label: 'Other',          pct:  5, color: '#ef4444' },
];

function DonutChart() {
  let offset = 0; // tracks rotation around the circle

  return (
    <div className="donut-wrap">
      <svg className="donut-svg" width="200" height="200" viewBox="0 0 200 200">
        {/* Background track */}
        <circle cx="100" cy="100" r={RADIUS}
          fill="none" stroke="#f3f4f6" strokeWidth="28" />

        {segments.map((seg, i) => {
          const dash     = (seg.pct / 100) * CIRC;   // filled arc length
          const gap      = CIRC - dash;               // empty arc length
          const rotation = -90 + (offset / 100) * 360; // start angle
          const dashOffset = 0; // already handled by dasharray position via rotation

          // The "final" stroke-dashoffset after animation = gap
          // So we animate from CIRC (fully hidden) → gap (correct segment shown)
          const finalDashOffset = CIRC - dash;

          offset += seg.pct;

          return (
            <circle
              key={i}
              className="donut-segment"
              cx="100" cy="100" r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth="28"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={finalDashOffset}  // ← set this as attribute too
              style={{
                '--dash-offset': finalDashOffset, // ← used by CSS @keyframes `to`
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '100px 100px',
              }}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div className="legend-row" key={i}>
            <span className="legend-dot" style={{ background: seg.color }} />
            <span className="legend-name">{seg.label}</span>
            <span className="legend-pct">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
