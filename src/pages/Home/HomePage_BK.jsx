import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { useApprovals } from "../../context/ApprovalsContext";
import Icon from "../../components/common/Icon";
import "./HomePage.css";

/* ─── Brand name ─────────────────────────────────────────────────────── */
const BRAND = "BarkahFlow";

/* ─── Spaces ─────────────────────────────────────────────────────────── */
const SPACES = [
  { id:"my-home",    label:"My Home"        },
  { id:"operations", label:"Operations"     },
  { id:"admin",      label:"Administration" },
  { id:"analytics",  label:"Analytics"      },
];

/* ─── Tile catalog ───────────────────────────────────────────────────── */
const ALL_TILES = {
  purchase:        { id:"purchase",        nav:"purchase",         title:"Purchase Management",  subtitle:"International Procurement",  icon:"purchase",   color:"#f97316", bg:"#fff7ed", border:"#fed7aa", tag:"Module 1",    active:true  },
  wholesale:       { id:"wholesale",       nav:null,               title:"Wholesale Sales",      subtitle:"B2B Sales & Distribution",   icon:"trending",   color:"#10b981", bg:"#f0fdf4", border:"#a7f3d0", tag:"Module 2",    active:false },
  retail:          { id:"retail",          nav:null,               title:"Retail Sales",         subtitle:"Shop & Counter Sales",       icon:"store",      color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe", tag:"Module 3",    active:false },
  inventory:       { id:"inventory",       nav:null,               title:"Inventory",            subtitle:"Stock & Warehouse",          icon:"box",        color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", tag:"Module 4",    active:false },
  distribution:    { id:"distribution",    nav:null,               title:"Distribution",         subtitle:"Fleet & Delivery",           icon:"truck",      color:"#ef4444", bg:"#fef2f2", border:"#fecaca", tag:"Module 5",    active:false },
  userMgmt:        { id:"userMgmt",        nav:"user-management",  title:"User Management",      subtitle:"Users, Roles & Permissions", icon:"users",      color:"#8b5cf6", bg:"#f5f3ff", border:"#ddd6fe", tag:"Admin",       active:true  },
  companySettings: { id:"companySettings", nav:"company-settings", title:"Company Settings",     subtitle:"Profile & Subsidiaries",     icon:"building",   color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", tag:"Settings",    active:true  },
  dbBackup:        { id:"dbBackup",        nav:"db-backup",        title:"Database Backup",      subtitle:"Backup & Restore",           icon:"database",   color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd", tag:"System",      active:true  },
  hr:              { id:"hr",              nav:"hr",               title:"Human Resources",      subtitle:"People & Organization",      icon:"users",      color:"#FF0080", bg:"#fff0f8", border:"#ffb3e0", tag:"Module 6",    active:true  },
  inbox:           { id:"inbox",           nav:"inbox",            title:"Approvals Inbox",      subtitle:"Pending Requests & Actions", icon:"inbox",      color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", tag:"Workflow",    active:true  },
  landedCost:      { id:"landedCost",      nav:"purchase",         title:"Landed Cost Calc.",    subtitle:"Import Cost Calculator",     icon:"calculator", color:"#f97316", bg:"#fff7ed", border:"#fed7aa", tag:"Procurement", active:true  },
  purchaseReports: { id:"purchaseReports", nav:"purchase",         title:"Purchase Reports",     subtitle:"Procurement Analytics",      icon:"reports",    color:"#f97316", bg:"#fff7ed", border:"#fed7aa", tag:"Reports",     active:true  },
  salesReports:    { id:"salesReports",    nav:null,               title:"Sales Reports",        subtitle:"Revenue Analytics",          icon:"reports",    color:"#10b981", bg:"#f0fdf4", border:"#a7f3d0", tag:"Reports",     active:false },
};

/* ─── Sections per Space ─────────────────────────────────────────────── */
const SPACE_SECTIONS = {
  "my-home": [
    { id:"s1", title:"My Frequently Used", icon:"pin",      tiles:["purchase","hr","inbox","userMgmt","companySettings","dbBackup"] },
    { id:"s2", title:"All Applications",   icon:"grid",     tiles:["purchase","wholesale","retail","inventory","distribution","hr","inbox","userMgmt","companySettings","dbBackup"] },
  ],
  "operations": [
    { id:"s3", title:"Procurement",           icon:"purchase", tiles:["purchase","landedCost"] },
    { id:"s4", title:"Sales & Distribution",  icon:"trending", tiles:["wholesale","retail"] },
    { id:"s5", title:"Inventory & Logistics", icon:"box",      tiles:["inventory","distribution"] },
  ],
  "admin": [
    { id:"s6", title:"User Administration",  icon:"users",    tiles:["userMgmt"] },
    { id:"s7", title:"System Configuration", icon:"settings", tiles:["companySettings","dbBackup"] },
  ],
  "analytics": [
    { id:"s8", title:"Purchase Analytics", icon:"reports",  tiles:["purchaseReports","landedCost"] },
    { id:"s9", title:"Sales Analytics",    icon:"trending", tiles:["salesReports"] },
  ],
};

/* ─── Welcome banners (random on each load) ──────────────────────────── */
const BANNERS = [
  // Deep navy geometric
  { bg:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` },
  // Rich orange sunset
  { bg:"linear-gradient(135deg,#7c2d12 0%,#c2410c 40%,#ea580c 70%,#9a3412 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='40' cy='0' r='3'/%3E%3Ccircle cx='0' cy='40' r='3'/%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")` },
  // Forest green
  { bg:"linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-opacity='0.05' stroke-width='1' d='M26 0 L52 26 L26 52 L0 26 Z'/%3E%3C/svg%3E")` },
  // Deep purple
  { bg:"linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#5b21b6 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23ffffff' fill-opacity='0.07'/%3E%3C/svg%3E")` },
  // Teal ocean
  { bg:"linear-gradient(135deg,#042f2e 0%,#134e4a 50%,#0f766e 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpolygon points='22,0 44,22 22,44 0,22'/%3E%3C/g%3E%3C/svg%3E")` },
  // Dark charcoal diagonal
  { bg:"linear-gradient(135deg,#111827 0%,#1f2937 50%,#374151 100%)",
    pattern:`url("data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='30' x2='30' y2='0' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E")` },
];

/* ─── User Settings Modal ─────────────────────────────────────────────── */
function UserSettingsModal({ user, onClose, onSave, onResetPassword }) {
  const [tab, setTab]         = useState("profile");
  const [name, setName]       = useState(user?.name || "");
  const [email, setEmail]     = useState(user?.email || "");
  const [phone, setPhone]     = useState(user?.phone || "");
  const [dept, setDept]       = useState(user?.department || "");
  const [avatar, setAvatar]   = useState(user?.avatar || null);
  const [oldPw, setOldPw]     = useState("");
  const [newPw, setNewPw]     = useState("");
  const [confPw, setConfPw]   = useState("");
  const [pwMsg, setPwMsg]     = useState(null);
  const fileRef               = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onSave({ name, email, phone, department: dept, avatar });
    onClose();
  };

  const handleResetPw = () => {
    if (!oldPw)             { setPwMsg({ type:"error", text:"Enter your current password." }); return; }
    if (oldPw !== user?.password) { setPwMsg({ type:"error", text:"Current password incorrect." }); return; }
    if (newPw.length < 6)   { setPwMsg({ type:"error", text:"New password must be ≥ 6 characters." }); return; }
    if (newPw !== confPw)   { setPwMsg({ type:"error", text:"Passwords do not match." }); return; }
    onResetPassword(newPw);
    setPwMsg({ type:"success", text:"Password changed successfully!" });
    setOldPw(""); setNewPw(""); setConfPw("");
  };

  return (
    <div className="hp-modal-overlay" onClick={onClose}>
      <div className="hp-modal" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="hp-modal-hd">
          <h3 className="hp-modal-title">Account Settings</h3>
          <button className="hp-modal-close" onClick={onClose}>
            <Icon name="close" size={16} color="#6b7280" />
          </button>
        </div>

        {/* Tabs */}
        <div className="hp-modal-tabs">
          {[["profile","Profile"],["security","Password"]].map(([id,label])=>(
            <button key={id} className={`hp-modal-tab ${tab===id?"hp-modal-tab-active":""}`} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>

        <div className="hp-modal-body">
          {tab === "profile" && (
            <div className="hp-modal-form">
              {/* Avatar upload */}
              <div className="hp-avatar-section">
                <div className="hp-avatar-preview" onClick={()=>fileRef.current.click()}>
                  {avatar
                    ? <img src={avatar} alt="avatar" className="hp-avatar-img" />
                    : <div className="hp-avatar-placeholder" style={{background:"#f97316"}}>{user?.name?.[0]||"U"}</div>
                  }
                  <div className="hp-avatar-overlay">
                    <Icon name="edit" size={16} color="#fff" />
                    <span>Change Photo</span>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange} />
                {/* LOGO NOTE: To add the company logo, place your image at:
                    src/assets/logo.png  — then use <img src={logo} /> in hp-logo-orb */}
                <p className="hp-avatar-hint">Click to upload a profile photo<br/><small>PNG, JPG up to 2MB</small></p>
              </div>

              {/* Fields */}
              <div className="hp-form-grid">
                {[
                  ["Full Name", name, setName, "text"],
                  ["Email Address", email, setEmail, "email"],
                  ["Phone Number", phone, setPhone, "tel"],
                  ["Department", dept, setDept, "text"],
                ].map(([label, val, setter, type])=>(
                  <div key={label} className="hp-form-group">
                    <label>{label}</label>
                    <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={label} />
                  </div>
                ))}
              </div>

              <button className="hp-modal-save-btn" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          )}

          {tab === "security" && (
            <div className="hp-modal-form">
              <p className="hp-pw-hint">Enter your current password, then choose a new one.</p>
              {[
                ["Current Password", oldPw, setOldPw],
                ["New Password",     newPw, setNewPw],
                ["Confirm Password", confPw, setConfPw],
              ].map(([label, val, setter])=>(
                <div key={label} className="hp-form-group">
                  <label>{label}</label>
                  <input type="password" value={val} onChange={e=>setter(e.target.value)} placeholder={label} />
                </div>
              ))}
              {pwMsg && (
                <div className={`hp-pw-msg hp-pw-${pwMsg.type}`}>{pwMsg.text}</div>
              )}
              <button className="hp-modal-save-btn" onClick={handleResetPw}>Change Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── User Dropdown ───────────────────────────────────────────────────── */
function HomeUserDropdown({ user, onSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="hp-ud" ref={ref}>
      <div className="hp-user-pill" onClick={() => setOpen(o=>!o)}>
        <div className="hp-av" style={{ background:"#f97316", overflow:"hidden" }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
            : (user?.name?.[0] || "U")
          }
        </div>
        <div className="hp-u-txt">
          <span className="hp-u-nm">{user?.name}</span>
          <span className="hp-u-rl">{user?.role}</span>
        </div>
        <Icon name="chevronDown" size={12} color="rgba(255,255,255,0.4)" />
      </div>

      {open && (
        <div className="hp-ud-menu">
          <div className="hp-ud-header">
            <div className="hp-ud-av" style={{background:"#f97316", overflow:"hidden"}}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                : (user?.name?.[0]||"U")
              }
            </div>
            <div>
              <div className="hp-ud-name">{user?.name}</div>
              <div className="hp-ud-role">{user?.role}</div>
            </div>
          </div>
          <div className="hp-ud-divider" />
          <button className="hp-ud-item" onClick={()=>{onSettings();setOpen(false);}}>
            <Icon name="user" size={14} color="#6b7280" />
            <span>My Profile & Settings</span>
          </button>
          <button className="hp-ud-item" onClick={()=>{onSettings("security");setOpen(false);}}>
            <Icon name="shield" size={14} color="#6b7280" />
            <span>Change Password</span>
          </button>
          <div className="hp-ud-divider" />
          <button className="hp-ud-item hp-ud-logout" onClick={onLogout}>
            <Icon name="logout" size={14} color="#ef4444" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── App Tile ────────────────────────────────────────────────────────── */
function AppTile({ tile, onNavigate, badge }) {
  const [hov, setHov] = useState(false);
  const canClick = tile.active && tile.nav;
  return (
    <button
      className={`hp-tile ${!tile.active ? "hp-tile-dim" : ""}`}
      onClick={() => canClick && onNavigate(tile.nav)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={tile.active ? tile.title : "Coming soon"}
      style={{ position:"relative" }}
    >
      <div className="hp-tile-bar" style={{ background:tile.color, opacity: hov && canClick ? 1 : 0 }} />
      <span className="hp-tile-tag" style={{ background:tile.color+"18", color:tile.color }}>{tile.tag}</span>
      <div className="hp-tile-icon-wrap" style={{ background:tile.bg, border:`1.5px solid ${tile.border}` }}>
        <Icon name={tile.icon} size={24} color={tile.active ? tile.color : "#9ca3af"} />
        {badge > 0 && (
          <span style={{ position:"absolute", top:-5, right:-5, minWidth:18, height:18, borderRadius:10, background:"#ef4444",
            border:"2px solid #fff", fontSize:10, fontWeight:800, color:"#fff", display:"flex", alignItems:"center",
            justifyContent:"center", padding:"0 4px", lineHeight:1, zIndex:2 }}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <div className="hp-tile-nm">{tile.title}</div>
      <div className="hp-tile-sb">{tile.subtitle}</div>
      {!tile.active && <span className="hp-soon-tag">Soon</span>}
    </button>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────── */
function Section({ section, onNavigate, searchQuery, pendingCount = 0 }) {
  const [open, setOpen] = useState(true);
  const tiles = section.tiles.map(id => ALL_TILES[id]).filter(Boolean).filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q);
  });

  if (searchQuery && tiles.length === 0) return null;

  return (
    <div className="hp-section">
      <div className="hp-sec-hd" onClick={() => setOpen(o => !o)}>
        <div className="hp-sec-hd-l">
          <div className="hp-sec-ico"><Icon name={section.icon} size={13} color="#6b7280" /></div>
          <span className="hp-sec-title">{section.title}</span>
          <span className="hp-sec-ct">{tiles.length} apps</span>
        </div>
        <div className={`hp-sec-arr ${open ? "hp-arr-open" : ""}`}>
          <Icon name="chevronDown" size={15} color="#9ca3af" />
        </div>
      </div>
      {open && (
        <div className="hp-tiles-row">
          {tiles.map(t => <AppTile key={t.id} tile={t} onNavigate={onNavigate} badge={t.id === "inbox" ? pendingCount : 0} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Main HomePage ───────────────────────────────────────────────────── */
export default function HomePage({ onNavigate }) {
  const { currentUser, logout, updateUser, resetPassword, users } = useApp();
  const { pendingCount } = useApprovals();
  const [space, setSpace]           = useState("my-home");
  const [search, setSearch]         = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab]   = useState("profile");

  // Pick a random banner once per session
  const banner = useMemo(() => BANNERS[Math.floor(Math.random() * BANNERS.length)], []);

  // Live local time greeting
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(t);
  }, []);
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const greetIcon = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";

  const today = new Date().toLocaleDateString("en-PK", {
    weekday:"long", year:"numeric", month:"long", day:"numeric",
  });

  // Find full user object for password operations
  const fullUser = users?.find(u => u.id === currentUser?.id) || currentUser;

  const handleSaveProfile = (data) => {
    updateUser(currentUser.id, data);
  };

  const handleResetPassword = (newPw) => {
    resetPassword(currentUser.id, newPw);
  };

  const openSettings = (tab = "profile") => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  const sections = SPACE_SECTIONS[space] || [];

  return (
    <div className="hp-root">

      {/* ══ Shell Header ══════════════════════════════════════════════ */}
      <header className="hp-shell">
        <div className="hp-shell-l">
          {/* LOGO: Replace the fire icon div with your logo image here.
              Add your image to src/assets/logo.png and use:
              <img src={require("../../assets/logo.png")} className="hp-logo-img" alt="logo" />
              Place it inside the hp-logo-orb div below. */}
          <div className="hp-logo-orb">
            <Icon name="fire" size={16} color="#fff" />
          </div>
          <span className="hp-logo-nm">{BRAND}</span>
          <div className="hp-shell-div" />
          <span className="hp-logo-sub">Management ERP</span>
        </div>

        <div className="hp-shell-r">
          {/* 🔍 Search bar — filters tiles live */}
          <div className="hp-srch">
            <Icon name="search" size={14} color="#9ca3af" />
            <input
              placeholder="Search apps…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="hp-srch-clear" onClick={() => setSearch("")}>
                <Icon name="close" size={12} color="#9ca3af" />
              </button>
            )}
          </div>

          {/* Bell */}
          <button className="hp-sh-btn" title="Notifications">
            <Icon name="bell" size={16} color="#9ca3af" />
            <span className="hp-pip" />
          </button>

          {/* User dropdown with avatar + settings */}
          <HomeUserDropdown
            user={{...currentUser, avatar: fullUser?.avatar}}
            onSettings={openSettings}
            onLogout={logout}
          />
        </div>
      </header>

      {/* ══ Spaces tab bar ════════════════════════════════════════════ */}
      <nav className="hp-spaces">
        <div className="hp-spaces-scr">
          {SPACES.map(sp => (
            <button
              key={sp.id}
              className={`hp-sp-tab ${space === sp.id ? "hp-sp-active" : ""}`}
              onClick={() => setSpace(sp.id)}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ══ Page body ══════════════════════════════════════════════════ */}
      <div className="hp-body">

        {/* Welcome banner with random bg */}
        <div className="hp-welcome" style={{ background:banner.bg }}>
          {/* decorative pattern overlay */}
          <div className="hp-welcome-pattern" style={{ backgroundImage:banner.pattern }} />
          {/* decorative circles */}
          <div className="hp-welcome-blob hp-blob1" />
          <div className="hp-welcome-blob hp-blob2" />

          <div className="hp-welcome-content">
            <div className="hp-welcome-left">
              <div className="hp-greet-icon">{greetIcon}</div>
              <div>
                <h1 className="hp-greet">
                  {greeting}, <span className="hp-greet-hi">{currentUser?.name?.split(" ")[0]}!
                  </span>
                </h1>
                <p className="hp-greet-dt">{today}</p>
              </div>
            </div>
            <div className="hp-qs">
              {[["4","Modules"],["5","Active Orders"],["3","Users Online"]].map(([v,l]) => (
                <div key={l} className="hp-qs-item">
                  <span className="hp-qs-v">{v}</span>
                  <span className="hp-qs-l">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search results notice */}
        {search && (
          <div className="hp-search-notice">
            <Icon name="search" size={14} color="#6b7280" />
            <span>Showing results for "<strong>{search}</strong>"</span>
            <button className="hp-search-clear-btn" onClick={() => setSearch("")}>Clear</button>
          </div>
        )}

        {/* Sections */}
        <div className="hp-secs">
          {sections.map(sec => (
            <Section key={sec.id} section={sec} onNavigate={onNavigate} searchQuery={search} pendingCount={pendingCount} />
          ))}
        </div>
      </div>

      {/* ══ Footer ════════════════════════════════════════════════════ */}
      <footer className="hp-footer">
        <span>{BRAND} Management ERP v2.0</span>
        <span className="hp-dot">·</span>
        <span>© 2026 All rights reserved</span>
        <span className="hp-dot">·</span>
        <span>Powered by React</span>
      </footer>

      {/* ══ Settings Modal ════════════════════════════════════════════ */}
      {showSettings && (
        <UserSettingsModal
          user={{ ...fullUser, password: fullUser?.password }}
          initialTab={settingsTab}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveProfile}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
}
