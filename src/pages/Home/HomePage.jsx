import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./HomePage.css";

// ─── Product identity ─────────────────────────────────────────────────────────
const PRODUCT_NAME = "BarkahPrime";
const PRODUCT_SUB  = "Cloud ERP";

// ─── Tile registry ────────────────────────────────────────────────────────────
const ALL_TILES = {
  purchase:        { id:"purchase",        nav:"/purchase",         title:"Purchase",              subtitle:"Procurement & Supplier Management",     icon:"purchase",   color:"#f97316", bg:"#fff7ed", tag:"Procurement",   category:"Operations" , active:true  },
  wholesale:       { id:"wholesale",       nav:"/sd",               title:"Sales & Distribution",  subtitle:"B2B Wholesale & Channel Sales",          icon:"trending",   color:"#10b981", bg:"#f0fdf4", tag:"Sales",          category:"Sales",       active:true  },
  retail:          { id:"retail",          nav:"/pos",              title:"Point of Sale",         subtitle:"Retail Counter & Cash Sales",            icon:"store",      color:"#3b82f6", bg:"#eff6ff", tag:"POS",            category:"Sales",       active:true  },
  inventory:       { id:"inventory",       nav:"/inventory",        title:"Inventory",             subtitle:"Stock, Warehouses & Valuation",          icon:"box",        color:"#f59e0b", bg:"#fffbeb", tag:"Supply Chain",   category:"Operations",  active:true  },
  distribution:    { id:"distribution",    nav:"/dist",             title:"Distribution",          subtitle:"Fleet, Trips & Delivery Management",     icon:"truck",      color:"#ef4444", bg:"#fef2f2", tag:"Logistics",      category:"Operations",  active:true  },
  hr:              { id:"hr",              nav:"/hr",               title:"Human Resources",       subtitle:"Payroll, Attendance & Leave",            icon:"users",      color:"#8b5cf6", bg:"#f5f3ff", tag:"HR & Payroll",   category:"People",      active:true  },
  accounting:      { id:"accounting",      nav:"/accounting",       title:"Accounting",            subtitle:"Ledger, AR/AP & Financial Reports",      icon:"briefcase",  color:"#0d9488", bg:"#f0fdfa", tag:"Finance",        category:"Finance",     active:true  },
  inbox:           { id:"inbox",           nav:"/inbox",            title:"Approvals Inbox",       subtitle:"Pending Requests & Workflow Actions",    icon:"invoice",    color:"#6366f1", bg:"#eef2ff", tag:"Workflow",       category:"Productivity",active:true  },
  userMgmt:        { id:"userMgmt",        nav:"/user-management",  title:"User Management",       subtitle:"Users, Roles & Access Control",          icon:"users",      color:"#0ea5e9", bg:"#f0f9ff", tag:"Administration", category:"System",      active:true  },
  companySettings: { id:"companySettings", nav:"/company-settings", title:"Company Settings",      subtitle:"Organisation Profile & Subsidiaries",    icon:"building",   color:"#6366f1", bg:"#eef2ff", tag:"Configuration",  category:"System",      active:true  },
  dbBackup:        { id:"dbBackup",        nav:"/db-backup",        title:"Database Backup",       subtitle:"Backup, Restore & Data Export",          icon:"briefcase",  color:"#64748b", bg:"#f8fafc", tag:"System",         category:"System",      active:true  },
};

// ─── Space → section layout ───────────────────────────────────────────────────
const SPACE_SECTIONS = {
  home:       [
    { id:"pinned", title:"My Pinned Apps",         icon:"pin",      tileIds:"__PINNED__"                                },
    { id:"all",    title:"All Applications",        icon:"grid",     tileIds:Object.keys(ALL_TILES)                      },
  ],
  operations: [
    { id:"proc",   title:"Procurement",             icon:"purchase", tileIds:["purchase"]                                },
    { id:"sales",  title:"Sales & Distribution",    icon:"trending", tileIds:["wholesale","retail"]                      },
    { id:"supply", title:"Inventory & Logistics",   icon:"box",      tileIds:["inventory","distribution"]                },
  ],
  finance:    [
    { id:"fin",    title:"Finance & Accounting",    icon:"briefcase",tileIds:["accounting"]                             },
  ],
  people:     [
    { id:"hr",     title:"HR & People",             icon:"users",    tileIds:["hr"]                                      },
    { id:"wf",     title:"Workflow & Approvals",    icon:"invoice",  tileIds:["inbox"]                                   },
  ],
  system:     [
    { id:"adm",    title:"User Administration",     icon:"users",    tileIds:["userMgmt"]                               },
    { id:"cfg",    title:"System Configuration",    icon:"building", tileIds:["companySettings","dbBackup"]              },
  ],
};

const SPACE_LABELS = { home:"Home", operations:"Operations", finance:"Finance", people:"People", system:"System" };

// ─── Banner gradients ─────────────────────────────────────────────────────────
const BANNERS = [
  { bg:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",         dot:"rgba(255,255,255,0.04)" },
  { bg:"linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#5b21b6 100%)",         dot:"rgba(255,255,255,0.06)" },
  { bg:"linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)",         dot:"rgba(255,255,255,0.05)" },
  { bg:"linear-gradient(135deg,#042f2e 0%,#134e4a 50%,#0f766e 100%)",         dot:"rgba(255,255,255,0.05)" },
  { bg:"linear-gradient(135deg,#7c2d12 0%,#c2410c 50%,#9a3412 100%)",         dot:"rgba(255,255,255,0.05)" },
  { bg:"linear-gradient(135deg,#111827 0%,#1f2937 40%,#374151 100%)",         dot:"rgba(255,255,255,0.04)" },
];

// ─── SVG icons inline ─────────────────────────────────────────────────────────
function TileIcon({ name, size = 24, color = "#6b7280" }) {
  const s = { width:size, height:size };
  const p = { stroke:color, strokeWidth:"1.8", strokeLinecap:"round", strokeLinejoin:"round", fill:"none" };
  const icons = {
    purchase:  <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" {...p}/><line x1="3" y1="6" x2="21" y2="6" {...p}/><path d="M16 10a4 4 0 01-8 0" {...p}/></svg>,
    trending:  <svg {...s} viewBox="0 0 24 24" fill="none"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" {...p}/><polyline points="16 7 22 7 22 13" {...p}/></svg>,
    store:     <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...p}/><polyline points="9 22 9 12 15 12 15 22" {...p}/></svg>,
    box:       <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" {...p}/><polyline points="3.27 6.96 12 12.01 20.73 6.96" {...p}/><line x1="12" y1="22.08" x2="12" y2="12" {...p}/></svg>,
    truck:     <svg {...s} viewBox="0 0 24 24" fill="none"><rect x="1" y="3" width="15" height="13" {...p}/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" {...p}/><circle cx="5.5" cy="18.5" r="2.5" {...p}/><circle cx="18.5" cy="18.5" r="2.5" {...p}/></svg>,
    users:     <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" {...p}/><circle cx="9" cy="7" r="4" {...p}/><path d="M23 21v-2a4 4 0 00-3-3.87" {...p}/><path d="M16 3.13a4 4 0 010 7.75" {...p}/></svg>,
    briefcase: <svg {...s} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" {...p}/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" {...p}/></svg>,
    invoice:   <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" {...p}/><polyline points="14 2 14 8 20 8" {...p}/><line x1="16" y1="13" x2="8" y2="13" {...p}/><line x1="16" y1="17" x2="8" y2="17" {...p}/><polyline points="10 9 9 9 8 9" {...p}/></svg>,
    building:  <svg {...s} viewBox="0 0 24 24" fill="none"><path d="M3 21V7l9-4 9 4v14" {...p}/><path d="M9 21V13h6v8" {...p}/></svg>,
  };
  return icons[name] || icons.briefcase;
}

function PinSVG({ pinned, color }) {
  // Modern bookmark-style pin icon
  return pinned ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" strokeWidth="2"/>
    </svg>
  );
}

// ─── App Tile ─────────────────────────────────────────────────────────────────
function AppTile({ tile, onNavigate, badge, pinned, onTogglePin }) {
  const [hovered, setHovered] = useState(false);
  const canClick = tile.active && tile.nav;
  return (
    <div className="hp-tile-wrap" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        className={`hp-tile ${!tile.active ? "hp-tile-dim" : ""}`}
        onClick={() => canClick && onNavigate(tile.nav)}
        title={tile.active ? tile.title : "Coming soon"}
      >
        <div className="hp-tile-bar" style={{ background: tile.color }} />
        <span className="hp-tile-tag" style={{ background: tile.color + "15", color: tile.color }}>{tile.tag}</span>
        <div className="hp-tile-icon-wrap" style={{ background: tile.bg }}>
          <TileIcon name={tile.icon} size={26} color={tile.active ? tile.color : "#9ca3af"} />
          {badge > 0 && (
            <span className="hp-tile-badge">{badge > 99 ? "99+" : badge}</span>
          )}
        </div>
        <div className="hp-tile-nm">{tile.title}</div>
        <div className="hp-tile-sb">{tile.subtitle}</div>
        {!tile.active && <span className="hp-soon-tag">Coming Soon</span>}
      </button>

      {/* Pin button */}
      {tile.active && (
        <button
          className="hp-pin-btn"
          style={{ opacity: hovered || pinned ? 1 : 0 }}
          onClick={e => { e.stopPropagation(); onTogglePin(tile.id); }}
          title={pinned ? "Unpin" : "Pin to My Apps"}
        >
          <PinSVG pinned={pinned} color={pinned ? "#f97316" : "#94a3b8"} />
        </button>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ section, pendingCount, pinnedIds, onTogglePin, onNavigate, search }) {
  const [open, setOpen] = useState(true);

  // Resolve tile list — pinned section reads live pinnedIds
  const resolvedIds = section.tileIds === "__PINNED__" ? pinnedIds : section.tileIds;

  const tiles = resolvedIds
    .map(id => ALL_TILES[id])
    .filter(Boolean)
    .filter(t => {
      if (!search) return true;
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    });

  // Pinned section: show empty hint when nothing is pinned
  if (section.id === "pinned" && tiles.length === 0) {
    if (search) return null;
    return (
      <div className="hp-section">
        <div className="hp-sec-hd">
          <div className="hp-sec-hd-l">
            <PinSVG pinned={true} color="#cbd5e1" />
            <span className="hp-sec-title" style={{ marginLeft:6 }}>{section.title}</span>
          </div>
        </div>
        <div className="hp-pinned-empty">
          <PinSVG pinned={false} color="#cbd5e1" />
          <span>Hover any tile and click the pin icon to add favourites here</span>
        </div>
      </div>
    );
  }

  if (tiles.length === 0) return null;

  return (
    <div className="hp-section">
      <div className="hp-sec-hd" onClick={() => setOpen(o => !o)}>
        <div className="hp-sec-hd-l">
          {section.id === "pinned"
            ? <PinSVG pinned={true} color="#6b7280" />
            : <SecIcon name={section.icon} />
          }
          <span className="hp-sec-title">{section.title}</span>
          <span className="hp-sec-ct">{tiles.length}</span>
        </div>
        <ChevronIcon open={open} />
      </div>
      {open && (
        <div className="hp-tiles-row">
          {tiles.map(t => (
            <AppTile key={t.id} tile={t} onNavigate={onNavigate}
              badge={t.id === "inbox" ? pendingCount : 0}
              pinned={pinnedIds.includes(t.id)}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SecIcon({ name }) {
  const icons = {
    grid:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    purchase: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>,
    trending: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    box:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
    briefcase:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    users:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    invoice:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    building: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M3 21V7l9-4 9 4v14"/><path d="M9 21V13h6v8"/></svg>,
  };
  return icons[name] || icons.grid;
}

function ChevronIcon({ open }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ─── Bell Dropdown ────────────────────────────────────────────────────────────
function BellDropdown({ items, count }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const TYPE_COLOR = { PR_APPROVAL:"#f97316", PO_APPROVAL:"#3b82f6", GRN_APPROVAL:"#10b981" };
  const TYPE_LABEL = { PR_APPROVAL:"PR", PO_APPROVAL:"PO", GRN_APPROVAL:"GRN" };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button className="hp-bell-btn" onClick={() => setOpen(o => !o)} title="Notifications">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={count > 0 ? "#f97316" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={count > 0 ? "#f97316" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {count > 0 && <span className="hp-bell-pip">{count > 9 ? "9+" : count}</span>}
      </button>

      {open && (
        <div className="hp-bell-drop">
          <div className="hp-bell-hdr">
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Inbox</div>
              <div style={{ fontSize:11.5, color: count > 0 ? "#f97316" : "#94a3b8", fontWeight:600, marginTop:1 }}>
                {count > 0 ? `${count} pending approval${count > 1 ? "s" : ""}` : "All clear"}
              </div>
            </div>
            {count > 0 && (
              <button className="hp-bell-viewall" onClick={() => { navigate("/inbox"); setOpen(false); }}>
                View all →
              </button>
            )}
          </div>

          <div className="hp-bell-body">
            {items.length === 0 ? (
              <div style={{ padding:"40px 16px", textAlign:"center" }}>
                <div style={{ fontSize:34, marginBottom:10 }}>✅</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>All caught up!</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>No pending approvals</div>
              </div>
            ) : items.map((item, i) => {
              const tc = TYPE_COLOR[item.type] || "#8b5cf6";
              const tl = TYPE_LABEL[item.type] || "Task";
              return (
                <div key={item.id} className="hp-bell-item"
                  onClick={() => { navigate("/inbox"); setOpen(false); }}
                  style={{ borderBottom: i < items.length - 1 ? "1px solid #f8fafc" : "none" }}
                >
                  <div className="hp-bell-item-ico" style={{ background: tc + "15" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2" strokeLinecap="round">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                    <div style={{ fontSize:11.5, color:"#64748b", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.message}</div>
                    <div style={{ display:"flex", gap:5, marginTop:5, alignItems:"center" }}>
                      <span style={{ fontSize:10.5, color:"#94a3b8" }}>{item.createdByName}</span>
                      <span style={{ fontSize:10, background:tc+"15", color:tc, padding:"1px 7px", borderRadius:20, fontWeight:700 }}>{tl}</span>
                      <span style={{ fontSize:10, background:"#fef3c7", color:"#92400e", padding:"1px 7px", borderRadius:20, fontWeight:600 }}>Awaiting</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { currentUser, inboxItems, salesOrders, employees, users, company, logout, updateUser, resetPassword } = useApp();
  const navigate = useNavigate();

  const [space,     setSpace]     = useState("home");
  const [search,    setSearch]    = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef();
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bf_pinned") || "[]"); }
    catch { return []; }
  });

  const banner = useMemo(() => BANNERS[Math.floor(Math.random() * BANNERS.length)], []);

  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("bf_pinned", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  function togglePin(id) {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const greeting  = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetIcon = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";
  const today     = new Date().toLocaleDateString("en-PK", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const firstName = currentUser?.firstName || currentUser?.username || "User";

  // Dynamic metrics
  const companyName  = company?.name || "Al-Raza LPG (Pvt.) Ltd.";
  const pendingItems = (inboxItems||[]).filter(i => i.status === "pending");
  const pendingCount = pendingItems.length;
  const activeModules= Object.values(ALL_TILES).filter(t => t.active).length;
  const openOrders   = (salesOrders||[]).filter(s => ["draft","approved"].includes(s.status)).length;
  const activeEmps   = (employees||[]).filter(e => e.status === "active").length;

  const sections = SPACE_SECTIONS[space] || [];

  // Search: if active, build a flat results section
  const searchTiles = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return Object.values(ALL_TILES).filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="hp-root">

      {/* ── Topbar ── */}
      <header className="hp-topbar">
        <div className="hp-topbar-l">

          {/* Product brand */}
          <div className="hp-brand">
            <div className="hp-brand-logo">
              {/* BarkahPrime logomark — stylised B with upward flow lines */}
              <svg viewBox="0 0 36 36" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Rounded background */}
                <rect width="36" height="36" rx="9" fill="white" fillOpacity="0.15"/>
                {/* Left vertical stem */}
                <rect x="8" y="8" width="3.5" height="20" rx="1.75" fill="white"/>
                {/* Top bowl */}
                <path d="M11.5 8 H19 C22.3 8 25 10.7 25 14 C25 17.3 22.3 20 19 20 H11.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                {/* Bottom bowl — slightly wider = Prime */}
                <path d="M11.5 20 H20 C23.6 20 26.5 22.9 26.5 26.5 C26.5 26.5 26.5 28 25 28 H11.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                {/* Upward accent dot — the "prime" mark */}
                <circle cx="28" cy="8.5" r="2.5" fill="#f97316"/>
              </svg>
            </div>
            <div>
              <div className="hp-brand-name">{PRODUCT_NAME}</div>
              <div className="hp-brand-sub">{PRODUCT_SUB}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="hp-divider" />

          {/* Company name from settings */}
          <div className="hp-company">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 21V7l9-4 9 4v14"/><path d="M9 21V13h6v8"/>
            </svg>
            <span className="hp-company-name">{companyName}</span>
          </div>

        </div>

        <div className="hp-topbar-r">

          {/* ── Desktop search (hidden on mobile via CSS) ── */}
          <div className="hp-search-wrap hp-desktop-only">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2"/>
              <path d="m21 21-4.3-4.3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input className="hp-search-inp" placeholder="Search apps…"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="hp-search-x" onClick={() => setSearch("")}>×</button>}
          </div>

          {/* ── Mobile search icon button (hidden on desktop) ── */}
          <button
            className="hp-icon-btn hp-mobile-only"
            onClick={() => setMobileSearchOpen(o => !o)}
            title="Search"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.65)" strokeWidth="2"/>
              <path d="m21 21-4.3-4.3" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Bell */}
          <BellDropdown items={pendingItems.slice(0, 8)} count={pendingCount} />

          {/* User — full pill on desktop, avatar-only on mobile */}
          <UserPill currentUser={currentUser} logout={logout} navigate={navigate}
            users={users} updateUser={updateUser} resetPassword={resetPassword} />
        </div>
      </header>

      {/* ── Mobile search bar (full width strip below topbar) ── */}
      {mobileSearchOpen && (
        <div className="hp-mobile-searchbar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
            <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/>
            <path d="m21 21-4.3-4.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="hp-mobile-searchbar-inp"
            placeholder="Search apps, modules…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <button
            className="hp-mobile-searchbar-x"
            onClick={() => { setSearch(""); setMobileSearchOpen(false); }}
          >×</button>
        </div>
      )}

      {/* ── Space tabs (below topbar) ── */}
      <nav className="hp-spacebar">
        {Object.keys(SPACE_SECTIONS).map(sp => (
          <button key={sp}
            className={`hp-space-tab ${space === sp ? "hp-space-active" : ""}`}
            onClick={() => { setSpace(sp); setSearch(""); }}>
            {SPACE_LABELS[sp]}
          </button>
        ))}
      </nav>

      {/* ── Body ── */}
      <div className="hp-body">

        {/* Welcome banner */}
        <div className="hp-banner" style={{ background: banner.bg }}>
          <div className="hp-banner-dots" style={{ backgroundImage:`radial-gradient(${banner.dot} 1px, transparent 1px)`, backgroundSize:"28px 28px" }} />
          <div className="hp-banner-blob b1" />
          <div className="hp-banner-blob b2" />
          <div className="hp-banner-content">
            <div className="hp-banner-left">
              <span className="hp-greet-icon">{greetIcon}</span>
              <div>
                <h1 className="hp-greet">{greeting}, <span className="hp-greet-name">{firstName.split(" ")[0]}!</span></h1>
                <p className="hp-greet-dt">{today}</p>
              </div>
            </div>
            <div className="hp-kpis">
              {[
                { v: activeModules,  l: "Active Modules",    s: "in this instance"     },
                { v: pendingCount,   l: "Pending Approvals", s: "awaiting your action"  },
                { v: openOrders,     l: "Open Sales Orders", s: "in progress"           },
                { v: activeEmps,     l: "Active Employees",  s: "on payroll"            },
              ].map(({ v, l, s }) => (
                <div key={l} className="hp-kpi">
                  <span className="hp-kpi-v">{v}</span>
                  <span className="hp-kpi-l">{l}</span>
                  <span className="hp-kpi-s">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search results */}
        {search ? (
          <div className="hp-search-res">
            <div className="hp-search-res-hd">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2"/><path d="m21 21-4.3-4.3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/></svg>
              <span><strong>{searchTiles.length}</strong> result{searchTiles.length !== 1 ? "s" : ""} for "{search}"</span>
              <button className="hp-clear-btn" onClick={() => setSearch("")}>✕ Clear</button>
            </div>
            {searchTiles.length === 0
              ? <p style={{ color:"#94a3b8", fontSize:13, padding:"20px 0" }}>No apps match your search.</p>
              : <div className="hp-tiles-row">
                  {searchTiles.map(t => (
                    <AppTile key={t.id} tile={t} onNavigate={p => { navigate(p); setSearch(""); }}
                      badge={t.id === "inbox" ? pendingCount : 0}
                      pinned={pinnedIds.includes(t.id)} onTogglePin={togglePin} />
                  ))}
                </div>
            }
          </div>
        ) : (
          /* Sections */
          <div className="hp-secs">
            {sections.map(sec => (
              <Section key={sec.id} section={sec}
                onNavigate={p => navigate(p)}
                search=""
                pendingCount={pendingCount}
                pinnedIds={pinnedIds}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        )}

        <footer className="hp-footer">
          <span className="hp-footer-brand">{PRODUCT_NAME}</span>
          <span className="hp-dot">·</span>
          <span>{companyName}</span>
          <span className="hp-dot">·</span>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}

// ─── User pill & dropdown ─────────────────────────────────────────────────────
function UserPill({ currentUser, logout, navigate, users, updateUser, resetPassword }) {
  const [open, setOpen]   = useState(false);
  const [prof, setProf]   = useState(false);
  const [pwd,  setPwd]    = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const name  = currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : currentUser?.username || "User";
  const role  = currentUser?.role?.name || currentUser?.role || "";
  const init  = name[0]?.toUpperCase() || "U";
  return (
    <>
      <div ref={ref} className="hp-ud">
        <button className="hp-user-pill" onClick={() => setOpen(o => !o)}>
          <div className="hp-av">{currentUser?.photo ? <img src={currentUser.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/> : init}</div>
          <div className="hp-u-txt hp-desktop-only"><span className="hp-u-nm">{name}</span><span className="hp-u-rl">{role}</span></div>
          <svg className="hp-desktop-only" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {open && (
          <div className="hp-ud-menu">
            <div className="hp-ud-hdr">
              <div className="hp-ud-av">{currentUser?.photo ? <img src={currentUser.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : init}</div>
              <div><div className="hp-ud-name">{name}</div><div className="hp-ud-role">{role}</div></div>
            </div>
            <hr className="hp-ud-hr"/>
            <button className="hp-ud-item" onClick={() => { setOpen(false); setTimeout(() => setProf(true), 0); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </button>
            <button className="hp-ud-item" onClick={() => { setOpen(false); setTimeout(() => setPwd(true), 0); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Change Password
            </button>
            <hr className="hp-ud-hr"/>
            <button className="hp-ud-item hp-ud-logout" onClick={() => { logout(); navigate("/login"); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
      {prof && <ProfileModal user={currentUser} onClose={() => setProf(false)} onSave={d => { if(currentUser?.id) updateUser(currentUser.id,d); setProf(false); }} />}
      {pwd  && <PasswordModal user={currentUser} users={users} onClose={() => setPwd(false)} onSave={(id,p) => { resetPassword(id,p); setPwd(false); }} />}
    </>
  );
}

function ProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ firstName:user?.firstName||"", lastName:user?.lastName||"", email:user?.email||"", phone:user?.phone||"", department:user?.department||"", photo:user?.photo||null });
  const fileRef = useRef();
  return (
    <div className="hp-modal-bg">
      <div className="hp-modal">
        <div className="hp-modal-hdr"><span>My Profile</span><button onClick={onClose} className="hp-modal-x">×</button></div>
        <div className="hp-modal-body">
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:16}}>
            <div onClick={() => fileRef.current?.click()} style={{width:72,height:72,borderRadius:"50%",background:"#f97316",overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"#fff"}}>
              {form.photo ? <img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (form.firstName[0]||"U").toUpperCase()}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => { const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setForm(p=>({...p,photo:ev.target.result})); r.readAsDataURL(f); }}/>
            <span style={{fontSize:12,color:"#94a3b8"}}>Click to change photo</span>
          </div>
          <div className="hp-form-grid">
            {[["First Name","firstName","text"],["Last Name","lastName","text"],["Email","email","email"],["Phone","phone","tel"],["Department","department","text"]].map(([l,k,t])=>(
              <div key={k} className="hp-fg"><label>{l}</label><input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l}/></div>
            ))}
          </div>
        </div>
        <div className="hp-modal-ftr">
          <button className="hp-btn-sec" onClick={onClose}>Cancel</button>
          <button className="hp-btn-pri" onClick={() => onSave(form)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ user, users, onClose, onSave }) {
  const [form, setForm] = useState({ current:"", newPwd:"", confirm:"" });
  const [msg,  setMsg]  = useState(null);
  function submit() {
    const full = (users||[]).find(u => u.id === user?.id);
    if (!form.current)                          { setMsg({e:true,m:"Enter current password."}); return; }
    if (full && full.password !== form.current) { setMsg({e:true,m:"Current password incorrect."}); return; }
    if (form.newPwd.length < 6)                 { setMsg({e:true,m:"New password ≥ 6 characters."}); return; }
    if (form.newPwd !== form.confirm)           { setMsg({e:true,m:"Passwords do not match."}); return; }
    onSave(user?.id, form.newPwd);
    setMsg({e:false,m:"Password changed!"});
    setTimeout(onClose, 1200);
  }
  return (
    <div className="hp-modal-bg">
      <div className="hp-modal" style={{maxWidth:380}}>
        <div className="hp-modal-hdr"><span>Change Password</span><button onClick={onClose} className="hp-modal-x">×</button></div>
        <div className="hp-modal-body">
          {[["Current Password","current"],["New Password","newPwd"],["Confirm Password","confirm"]].map(([l,k])=>(
            <div key={k} className="hp-fg" style={{marginBottom:12}}><label>{l}</label>
              <input type="password" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l}
                style={{padding:"9px 12px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
          ))}
          {msg && <div style={{padding:"9px 12px",borderRadius:8,fontSize:13,background:msg.e?"#fef2f2":"#f0fdf4",color:msg.e?"#dc2626":"#16a34a"}}>{msg.m}</div>}
        </div>
        <div className="hp-modal-ftr">
          <button className="hp-btn-sec" onClick={onClose}>Cancel</button>
          <button className="hp-btn-pri" onClick={submit}>Change Password</button>
        </div>
      </div>
    </div>
  );
}
