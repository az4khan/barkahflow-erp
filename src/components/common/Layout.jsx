import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useApprovals } from "../../context/ApprovalsContext";
import { Modal } from "./UI";
import Icon from "./Icon";

const BRAND = "BarkahFlow";

// ─── USER DROPDOWN ────────────────────────────────────────────────────────────
export function UserDropdown({ currentUser, onHome, onLogout, accentColor = "#f97316" }) {
  const { users, resetPassword, updateUser, toast } = useApp();
  const [open, setOpen]               = useState(false);
  const [showPwd, setShowPwd]         = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pwdForm, setPwdForm]         = useState({ current: "", newPwd: "", confirm: "" });
  const [showCur, setShowCur]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [profileForm, setProfileForm] = useState(null);
  const fileRef = useRef(null);
  const ref     = useRef(null);

  const userFull = users?.find(u => u.username === currentUser?.username) || currentUser;

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const openProfile = () => {
    setProfileForm({
      name:       userFull?.name       || "",
      email:      userFull?.email      || "",
      phone:      userFull?.phone      || "",
      department: userFull?.department || userFull?.dept || "",
      avatar:     userFull?.avatar     || null,
    });
    setShowProfile(true);
    setOpen(false);
  };

  const handleSaveProfile = () => {
    if (userFull?.id) updateUser(userFull.id, profileForm);
    toast("Profile updated.", "success");
    setShowProfile(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfileForm(f => ({ ...f, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleChangePwd = () => {
    const user = users?.find(u => u.username === currentUser?.username);
    if (!pwdForm.current)                  { toast("Enter your current password.", "error"); return; }
    if (user && user.password !== pwdForm.current) { toast("Current password is incorrect.", "error"); return; }
    if (!pwdForm.newPwd || pwdForm.newPwd.length < 6) { toast("New password must be ≥ 6 characters.", "error"); return; }
    if (pwdForm.newPwd !== pwdForm.confirm)   { toast("Passwords do not match.", "error"); return; }
    resetPassword(user.id, pwdForm.newPwd);
    toast("Password changed successfully.", "success");
    setShowPwd(false);
    setPwdForm({ current: "", newPwd: "", confirm: "" });
  };

  // Avatar display helper
  const avatar = userFull?.avatar;
  const initials = currentUser?.name?.[0] || "U";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* ── Trigger pill ── */}
      <button
        className="user-pill"
        onClick={() => setOpen(o => !o)}
        style={{ borderColor: open ? accentColor + "60" : undefined }}
      >
        <div className="user-avatar" style={{ background: accentColor, overflow: "hidden" }}>
          {avatar
            ? <img src={avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : initials
          }
        </div>
        <div className="user-info">
          <div className="user-info-name">{currentUser?.name}</div>
          <div className="user-info-role">{currentUser?.role}</div>
        </div>
        <Icon name="chevronDown" size={13} color="#6b7280" />
      </button>

      {/* ── Dropdown menu ── */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0,
          width:230, background:"#fff", border:"1px solid #f3f4f6",
          borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.13)",
          zIndex:400, overflow:"hidden",
        }}>
          {/* Header */}
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #f3f4f6", background:"#f9fafb", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:accentColor, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0 }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : initials
              }
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:"#111827" }}>{currentUser?.name}</div>
              <div style={{ fontSize:11.5, color:"#9ca3af" }}>{currentUser?.role}</div>
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon:"user",   label:"My Profile & Settings", action: openProfile },
            { icon:"shield", label:"Change Password",       action: () => { setShowPwd(true); setOpen(false); } },
            { icon:"home",   label:"Back to Home",          action: () => { onHome(); setOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", fontSize:13, fontWeight:500, color:"#374151", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", transition:"background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Icon name={item.icon} size={15} color="#6b7280" />
              {item.label}
            </button>
          ))}

          <div style={{ borderTop:"1px solid #f3f4f6" }}>
            <button onClick={() => { onLogout(); setOpen(false); }}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", fontSize:13, fontWeight:600, color:"#dc2626", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", transition:"background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Icon name="logout" size={15} color="#dc2626" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPwd && (
        <Modal title="Change Password" onClose={() => setShowPwd(false)} size="sm">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { label:"Current Password",     key:"current", show:showCur, toggle:()=>setShowCur(s=>!s) },
              { label:"New Password",         key:"newPwd",  show:showNew, toggle:()=>setShowNew(s=>!s) },
              { label:"Confirm New Password", key:"confirm", show:showNew, toggle:()=>setShowNew(s=>!s) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={show ? "text" : "password"}
                    value={pwdForm[key]}
                    onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={label}
                    style={{ paddingRight:40 }}
                  />
                  <button type="button" onClick={toggle}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer" }}>
                    <Icon name={show ? "eyeOff" : "eye"} size={15} color="#9ca3af" />
                  </button>
                </div>
              </div>
            ))}
            <p style={{ fontSize:12, color:"#9ca3af" }}>Minimum 6 characters required.</p>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={handleChangePwd}>Change Password</button>
            <button className="btn-outline" style={{ flex:1 }} onClick={() => setShowPwd(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── My Profile & Settings Modal ── */}
      {showProfile && profileForm && (
        <Modal title="My Profile & Settings" onClose={() => setShowProfile(false)} size="sm">
          {/* Avatar upload */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, marginBottom:20 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width:80, height:80, borderRadius:"50%", background:accentColor, overflow:"hidden", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff", position:"relative", boxShadow:"0 4px 14px rgba(0,0,0,0.15)", flexShrink:0 }}
            >
              {profileForm.avatar
                ? <img src={profileForm.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : initials
              }
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s", gap:4, fontSize:11, color:"#fff", fontWeight:600 }}
                onMouseEnter={e => e.currentTarget.style.opacity=1}
                onMouseLeave={e => e.currentTarget.style.opacity=0}
              >
                <Icon name="edit" size={15} color="#fff" />
                <span>Change</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />
            <span style={{ fontSize:12, color:"#9ca3af" }}>Click photo to change · PNG or JPG</span>
          </div>

          {/* Form fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {[
              ["Full Name",   "name",       "text"],
              ["Email",       "email",      "email"],
              ["Phone",       "phone",      "tel"],
              ["Department",  "department", "text"],
            ].map(([label, key, type]) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  type={type}
                  value={profileForm[key]}
                  onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                />
              </div>
            ))}
          </div>

          {/* Read-only info */}
          <div style={{ marginTop:14, padding:"12px 14px", background:"#f9fafb", borderRadius:8, fontSize:12.5 }}>
            {[["Username", userFull?.username], ["Role", userFull?.role], ["User ID", userFull?.id]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #f3f4f6" }}>
                <span style={{ color:"#9ca3af", fontWeight:600 }}>{l}</span>
                <span style={{ color:"#374151" }}>{v || "—"}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={handleSaveProfile}>Save Changes</button>
            <button className="btn-outline" style={{ flex:1 }} onClick={() => setShowProfile(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── UNIVERSAL APP TOPBAR ─────────────────────────────────────────────────────
// Used by every module. Provides: breadcrumb, global search, bell, user dropdown.
// Props:
//   title        – module name, e.g. "Purchase Management"
//   subtitle     – current page within module, e.g. "Goods Receipt"
//   accentColor  – module brand colour
//   currentUser  – from AppContext
//   onHome(dest) – navigate home or to a specific module (dest optional)
//   onLogout     – from AppContext
//   onNav        – (optional) in-module navigation handler for bell clicks
//   leftExtra    – (optional) extra JSX to render after breadcrumb (e.g. collapsed toggle)

// ── Global search index (cross-module shortcuts) ──────────────────────────────
const GLOBAL_SEARCH_INDEX = [
  // Purchase
  { label:"Dashboard",            module:"Purchase",      icon:"dashboard",  dest:"purchase",        sub:"purchase" },
  { label:"Purchase Requisition", module:"Purchase",      icon:"list",       dest:"purchase",        sub:"pr-requisition" },
  { label:"PR Approval",          module:"Purchase",      icon:"check",      dest:"purchase",        sub:"pr-approval" },
  { label:"Supplier Quotation",   module:"Purchase",      icon:"invoice",    dest:"purchase",        sub:"supplier-quotation" },
  { label:"Purchase Order",       module:"Purchase",      icon:"purchase",   dest:"purchase",        sub:"purchase-order" },
  { label:"Goods Receipt",        module:"Purchase",      icon:"box",        dest:"purchase",        sub:"goods-receipt" },
  { label:"Approval Strategy",    module:"Purchase",      icon:"shield",     dest:"purchase",        sub:"approval-strategy" },
  { label:"Landed Cost",          module:"Purchase",      icon:"calculator", dest:"purchase",        sub:"landed-cost" },
  // HR
  { label:"Org Management",       module:"HR",            icon:"building",   dest:"hr",              sub:"org-management" },
  { label:"Position Management",  module:"HR",            icon:"briefcase",  dest:"hr",              sub:"positions" },
  { label:"Hire Employee",        module:"HR",            icon:"userplus",   dest:"hr",              sub:"hire-employee" },
  // Admin
  { label:"User Management",      module:"Admin",         icon:"users",      dest:"user-management", sub:null },
  { label:"Company Settings",     module:"Admin",         icon:"building",   dest:"company-settings",sub:null },
  { label:"Database Backup",      module:"Admin",         icon:"database",   dest:"db-backup",       sub:null },
  { label:"Approvals Inbox",      module:"Workflow",      icon:"inbox",      dest:"inbox",           sub:null },
];

const MODULE_COLORS = {
  Purchase:"#f97316", HR:"#FF0080", Admin:"#8b5cf6", Workflow:"#6366f1",
};

function GlobalSearch({ onNavigate, accentColor }) {
  const [q, setQ]           = useState("");
  const [open, setOpen]     = useState(false);
  const [focused, setFocused] = useState(-1);
  const ref   = useRef(null);
  const input = useRef(null);

  const results = q.trim().length > 0
    ? GLOBAL_SEARCH_INDEX.filter(r =>
        r.label.toLowerCase().includes(q.toLowerCase()) ||
        r.module.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(""); }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Keyboard: ↑↓ to move, Enter to go
  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(f => Math.min(f+1, results.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused(f => Math.max(f-1, 0)); }
    if (e.key === "Enter" && results[focused]) { go(results[focused]); }
    if (e.key === "Escape") { setOpen(false); setQ(""); input.current?.blur(); }
  };

  const go = (item) => {
    setOpen(false); setQ(""); setFocused(-1);
    if (onNavigate) onNavigate(item.dest, item.sub);
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:`1.5px solid ${open ? accentColor : "#e2e8f0"}`, borderRadius:9, padding:"6px 12px", width:220, transition:"border-color 0.15s, width 0.2s", ...(open ? {width:280} : {}) }}>
        <Icon name="search" size={14} color="#9ca3af" />
        <input
          ref={input}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); setFocused(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search pages & modules…"
          style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", flex:1, color:"#374151" }}
        />
        {q && (
          <button onClick={() => { setQ(""); setFocused(-1); input.current?.focus(); }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex" }}>
            <Icon name="close" size={12} color="#94a3b8" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#fff", borderRadius:11, boxShadow:"0 8px 28px rgba(0,0,0,0.12)", border:"1px solid #f1f5f9", zIndex:2000, overflow:"hidden" }}>
          {results.map((r, i) => {
            const mc = MODULE_COLORS[r.module] || "#94a3b8";
            return (
              <div key={i} onClick={() => go(r)}
                style={{ padding:"9px 14px", cursor:"pointer", display:"flex", gap:10, alignItems:"center",
                  background: i === focused ? "#f8fafc" : "#fff", borderBottom: i < results.length-1 ? "1px solid #f8fafc" : "none" }}
                onMouseEnter={() => setFocused(i)}>
                <div style={{ width:28, height:28, borderRadius:7, background:mc+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon name={r.icon} size={13} color={mc} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"#0f172a" }}>{r.label}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{r.module}</div>
                </div>
                <span style={{ fontSize:10, background:mc+"15", color:mc, padding:"2px 7px", borderRadius:20, fontWeight:700, flexShrink:0 }}>
                  {r.module}
                </span>
              </div>
            );
          })}
          <div style={{ padding:"8px 14px", background:"#f8fafc", borderTop:"1px solid #f1f5f9", fontSize:11, color:"#94a3b8", display:"flex", gap:12 }}>
            <span>↑↓ navigate</span><span>⏎ go</span><span>Esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Universal Bell — reads from ApprovalsContext ───────────────────────────────
function UniversalBell({ accentColor, onNav, onGoInbox, currentUser }) {
  const { inbox } = useApprovals();
  const [open, setOpen]     = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pending = inbox.filter(i => i.status === "Pending" && !dismissed.includes(i.id));
  const unread  = pending.length;

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:34, height:34, borderRadius:9, border:"1px solid #e2e8f0", background: open ? "#f8fafc" : "#fff",
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", transition:"all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
        onMouseLeave={e => { if(!open) e.currentTarget.style.background="#fff"; }}>
        <Icon name="bell" size={16} color={unread > 0 ? accentColor : "#94a3b8"} />
        {unread > 0 && (
          <span style={{ position:"absolute", top:5, right:5, minWidth:15, height:15, borderRadius:10,
            background:"#ef4444", border:"2px solid #fff", fontSize:9, fontWeight:800, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:360, background:"#fff",
          borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.12)", border:"1px solid #f1f5f9", zIndex:1000, overflow:"hidden" }}>

          <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Notifications</div>
              {unread > 0 && <div style={{ fontSize:11, color:accentColor, fontWeight:600, marginTop:1 }}>{unread} pending approval{unread!==1?"s":""}</div>}
            </div>
            {unread > 0 && (
              <button onClick={() => setDismissed(pending.map(i => i.id))}
                style={{ fontSize:11.5, fontWeight:600, color:"#64748b", background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:6 }}>
                Dismiss all
              </button>
            )}
          </div>

          <div style={{ maxHeight:320, overflowY:"auto" }}>
            {pending.length === 0 ? (
              <div style={{ padding:"36px 16px", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>All caught up!</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>No pending approvals</div>
              </div>
            ) : pending.map((item, i) => (
              <div key={item.id}
                style={{ padding:"12px 16px", borderBottom: i < pending.length-1 ? "1px solid #f8fafc" : "none",
                  cursor:"pointer", display:"flex", gap:10, alignItems:"flex-start" }}
                onClick={() => { setOpen(false); onGoInbox && onGoInbox(); }}
                onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background="#fff"}>
                <div style={{ width:34, height:34, borderRadius:9, background: item.type==="PR" ? "#eff6ff" : "#f5f3ff",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon name={item.type==="PR" ? "list" : "purchase"} size={15} color={item.type==="PR" ? "#3b82f6" : "#7c3aed"} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a", lineHeight:1.3 }}>
                    {item.type} {item.refId} — {item.priority} Priority
                  </div>
                  <div style={{ fontSize:11.5, color:"#64748b", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                  <div style={{ display:"flex", gap:8, marginTop:4, alignItems:"center" }}>
                    <span style={{ fontSize:10.5, color:"#94a3b8" }}>{item.submittedBy}</span>
                    <span style={{ fontSize:10, background:"#fef9c3", color:"#854d0e", padding:"1px 7px", borderRadius:20, fontWeight:700 }}>Awaiting</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setDismissed(d => [...d, item.id]); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", flexShrink:0, padding:2, display:"flex" }}>
                  <Icon name="close" size={12} color="#cbd5e1" />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding:"10px 16px", borderTop:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={() => { setOpen(false); onGoInbox && onGoInbox(); }}
              style={{ fontSize:12, fontWeight:700, color:accentColor, background:"none", border:"none", cursor:"pointer" }}>
              Open Approvals Inbox →
            </button>
            <span style={{ fontSize:11, color:"#94a3b8" }}>
              {inbox.filter(i=>i.status==="Approved").length} approved · {inbox.filter(i=>i.status==="Rejected").length} rejected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── THE UNIVERSAL TOPBAR ───────────────────────────────────────────────────────
export function AppTopbar({
  title,             // module name  e.g. "Purchase Management"
  subtitle,          // current page e.g. "Goods Receipt"
  accentColor = "#6366f1",
  currentUser,
  onHome,            // () => go home  OR  (dest) => go to dest
  onLogout,
  onNav,             // in-module nav (optional, passed through to bell)
  leftExtra,         // extra JSX after breadcrumb (e.g. sidebar collapse btn)
  onNavigate,        // global navigate: (dest, sub) => void
}) {
  const { logout } = useApp();
  const doLogout = onLogout || logout;

  const handleGlobalNav = (dest, sub) => {
    if (onNavigate) { onNavigate(dest, sub); return; }
    if (onHome)     { onHome(dest); }
  };

  const goInbox = () => {
    if (onNavigate) { onNavigate("inbox", null); return; }
    if (onHome)     { onHome("inbox"); }
  };

  return (
    <header style={{
      height: 52, background:"#fff", borderBottom:"1px solid #f1f5f9",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 20px", flexShrink:0, gap:12, position:"sticky", top:0, zIndex:100,
    }}>
      {/* Left: logo + breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
        <button onClick={() => onHome && onHome()}
          style={{ display:"flex", alignItems:"center", gap:7, background:"none", border:"none", cursor:"pointer", padding:0, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="fire" size={14} color="#fff" />
          </div>
          <span style={{ fontSize:13.5, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{BRAND}</span>
        </button>
        {title && <>
          <span style={{ color:"#cbd5e1", fontSize:14 }}>/</span>
          <span style={{ fontSize:12.5, fontWeight:600, color:accentColor, whiteSpace:"nowrap" }}>{title}</span>
        </>}
        {subtitle && <>
          <span style={{ color:"#cbd5e1", fontSize:14 }}>/</span>
          <span style={{ fontSize:12.5, fontWeight:500, color:"#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:180 }}>{subtitle}</span>
        </>}
        {leftExtra && <div style={{ marginLeft:4 }}>{leftExtra}</div>}
      </div>

      {/* Right: search + bell + user */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <GlobalSearch onNavigate={handleGlobalNav} accentColor={accentColor} />
        <UniversalBell accentColor={accentColor} onNav={onNav} onGoInbox={goInbox} currentUser={currentUser} />
        <UserDropdown currentUser={currentUser} onHome={() => onHome && onHome()} onLogout={doLogout} accentColor={accentColor} />
      </div>
    </header>
  );
}
