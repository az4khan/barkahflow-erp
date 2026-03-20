/**
 * ModuleSidebar — shared sidebar for all modules
 * Props:
 *   accent       — accent color e.g. "#f97316"
 *   moduleLabel  — subtitle e.g. "Purchase"
 *   moduleIcon   — icon name e.g. "purchase"
 *   nav          — array of nav items (same shape as HR_NAV etc.)
 *   activeSeg    — current active URL segment
 *   basePath     — e.g. "/purchase"
 *   badges       — { [id]: count } optional badge counts
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Icon from "./Icon";

export default function ModuleSidebar({ accent, moduleLabel, moduleIcon = "briefcase", nav, activeSeg, basePath, badges = {} }) {
  const { currentUser, logout, company } = useApp();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const SW = collapsed ? 56 : 234;
  // Live from context — updates the moment company settings are saved
  const companyName = company?.name || "BarkahPrime";

  return (
    <aside style={{
      width:SW, minWidth:SW, height:"100vh",
      background:"#0f172a", display:"flex", flexDirection:"column",
      overflow:"hidden", flexShrink:0,
      transition:"width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)",
    }}>

      {/* ── Header ── */}
      <div style={{ padding:"0 12px", height:64, display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid rgba(255,255,255,0.06)", overflow:"hidden", flexShrink:0 }}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"8px 0", borderRadius:8, color:"rgba(255,255,255,0.6)" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ) : (
          <>
            {/* Module icon badge */}
            <div style={{ width:32, height:32, borderRadius:9, background:accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon name={moduleIcon} size={16} color="#fff"/>
            </div>
            {/* Company name (from settings) + module label */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:800, color:"#fff", letterSpacing:"-0.01em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {companyName}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:500, marginTop:1 }}>
                {moduleLabel}
              </div>
            </div>
            {/* Collapse button */}
            <button onClick={() => setCollapsed(true)}
              style={{ background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"5px 6px", borderRadius:7, color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"4px 8px 8px" }}>
        {(nav||[]).map((item, idx) => {
          if (item.divider) {
            return collapsed
              ? <div key={idx} style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"6px 4px" }}/>
              : <div key={idx} style={{ fontSize:10, fontWeight:700, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.08em", padding:"10px 8px 4px" }}>{item.label}</div>;
          }
          const isActive = activeSeg === item.path;
          const badge    = badges[item.id] || 0;
          const dest     = `${basePath}${item.path ? `/${item.path}` : ""}`;
          return (
            <button key={item.id} onClick={() => navigate(dest)} title={collapsed ? item.label : undefined}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:collapsed?0:10, justifyContent:collapsed?"center":"flex-start", padding:collapsed?"10px 0":"9px 10px", borderRadius:8, border:"none", cursor:"pointer", background:isActive?accent:"transparent", color:isActive?"#fff":"rgba(255,255,255,0.55)", fontSize:13, fontWeight:isActive?600:400, marginBottom:1, transition:"all 0.12s" }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              <Icon name={item.icon} size={15} color={isActive ? "#fff" : "#6b7280"}/>
              {!collapsed && <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textAlign:"left" }}>{item.label}</span>}
              {!collapsed && badge > 0 && <span style={{ fontSize:10, fontWeight:700, background:"#ef4444", color:"#fff", borderRadius:10, padding:"1px 6px", flexShrink:0 }}>{badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Footer: Sign Out only ── */}
      <div style={{ padding:"8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={logout} title={collapsed ? "Sign Out" : undefined}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:collapsed?0:10, justifyContent:collapsed?"center":"flex-start", padding:collapsed?"10px 0":"9px 10px", borderRadius:8, border:"none", cursor:"pointer", background:"transparent", color:"rgba(255,255,255,0.45)", fontSize:13, transition:"background 0.12s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(220,38,38,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
