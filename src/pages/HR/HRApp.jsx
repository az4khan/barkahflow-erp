import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AppTopbar } from "../../components/common/Layout";
import Icon from "../../components/common/Icon";
import { HR_NAV, HR_COLOR } from "./hrConstants";
import OrgManagement    from "./OrgManagement";
import PositionManagement from "./PositionManagement";
import HireEmployee     from "./HireEmployee";
import "../../styles/globals.css";

const C = HR_COLOR;

export default function HRApp({ onHome }) {
  const { currentUser, logout } = useApp();
  const [nav, setNav]           = useState("org-management");
  const [collapsed, setCollapsed] = useState(false);
  const SW = collapsed ? 56 : 220;

  const currentLabel = HR_NAV.find(n => !n.divider && n.id === nav)?.label || "HR";

  const renderPage = () => {
    switch (nav) {
      case "org-management": return <OrgManagement />;
      case "positions":      return <PositionManagement />;
      case "hire-employee":  return <HireEmployee />;
      case "employees":      return <HireEmployee />;
      default:               return <OrgManagement />;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"row", height:"100vh", width:"100%", overflow:"hidden", background:"#f8fafc" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:SW, minWidth:SW, flexShrink:0, height:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Logo row */}
        <div style={{ padding:"0 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, height:64, overflow:"hidden", flexShrink:0 }}>
          {collapsed ? (
            <button onClick={() => setCollapsed(false)} title="Expand sidebar"
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"8px 0", borderRadius:8, color:"rgba(255,255,255,0.6)", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ) : (
            <>
              <div style={{ width:32, height:32, borderRadius:9, background:C, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="users" size={16} color="#fff" />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13.5, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>BarkahFlow</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>Human Resources</div>
              </div>
              <button onClick={() => setCollapsed(true)} title="Collapse sidebar"
                style={{ background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"5px 6px", borderRadius:7, color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* User chip */}
        {!collapsed ? (
          <div style={{ padding:"10px 14px 8px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C, flexShrink:0 }} />
            <span style={{ fontSize:12.5, fontWeight:600, color:C, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {currentUser?.name}
            </span>
          </div>
        ) : <div style={{ height:6 }} />}

        {/* Nav */}
        <nav style={{ flex:1, padding:"4px 8px", overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", gap:1 }}>
          {HR_NAV.map((item, idx) => {
            if (item.divider) {
              if (collapsed) return <div key={idx} style={{ margin:"5px 4px", borderTop:"1px solid rgba(255,255,255,0.08)" }} />;
              return <div key={idx} style={{ padding:"10px 10px 4px", fontSize:9.5, fontWeight:700, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{item.label}</div>;
            }
            const isActive = nav === item.id;
            return (
              <button key={item.id} onClick={() => setNav(item.id)} title={collapsed ? item.label : undefined}
                style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-start", gap:collapsed?0:9, padding:collapsed?"9px 0":"8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, fontWeight:isActive?600:400, color:isActive?"#fff":"rgba(255,255,255,0.45)", background:isActive?C:"transparent", transition:"all 0.15s ease", width:"100%" }}
                onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.75)";} }}
                onMouseLeave={e=>{ e.currentTarget.style.background=isActive?C:"transparent";e.currentTarget.style.color=isActive?"#fff":"rgba(255,255,255,0.45)"; }}
              >
                <Icon name={item.icon} size={15} color={isActive?"#fff":"rgba(255,255,255,0.4)"} />
                {!collapsed && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"8px 8px 12px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onHome} title={collapsed?"Home":undefined}
            style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-start", gap:collapsed?0:9, padding:collapsed?"9px 0":"8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, color:"rgba(255,255,255,0.4)", background:"transparent", width:"100%" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}
          >
            <Icon name="home" size={14} color="rgba(255,255,255,0.4)" />
            {!collapsed && <span>Home</span>}
          </button>
          <button onClick={logout} title={collapsed?"Sign Out":undefined}
            style={{ display:"flex", alignItems:"center", justifyContent:collapsed?"center":"flex-start", gap:collapsed?0:9, padding:collapsed?"9px 0":"8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, color:"rgba(255,255,255,0.4)", background:"transparent", width:"100%" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.12)";e.currentTarget.style.color="#f87171";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}
          >
            <Icon name="logout" size={14} color="rgba(255,255,255,0.4)" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        <AppTopbar
          title="Human Resources"
          subtitle={currentLabel}
          accentColor={C}
          currentUser={currentUser}
          onHome={onHome}
          onLogout={logout}
          onNavigate={(dest, sub) => {
            if (dest === "hr" && sub) { setNav(sub); }
            else if (onHome) { onHome(dest); }
          }}
        />

        {/* Page */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
