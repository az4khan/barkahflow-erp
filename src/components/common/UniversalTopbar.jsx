/**
 * UniversalTopbar — used on every module page
 * - Company name from settings
 * - Home icon → breadcrumb → module → page
 * - Mobile: icon-only for search/bell/user, same as HomePage
 * - Full bell dropdown with pending items
 * - User dropdown with profile/password
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { searchPages } from "../../data/pageRegistry";

export default function UniversalTopbar({ moduleTitle, pageTitle, accentColor = "#f97316" }) {
  const { currentUser, logout, inboxItems, users, resetPassword, updateUser, company } = useApp();
  const navigate = useNavigate();

  const [search,       setSearch]       = useState("");
  const [searchOpen,   setSearchOpen]   = useState(false); // mobile search strip
  const [dropOpen,     setDropOpen]     = useState(false);
  const [bellOpen,     setBellOpen]     = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showPwd,      setShowPwd]      = useState(false);
  const [showResults,  setShowResults]  = useState(false);
  const searchRef = useRef();

  const searchResults = search.trim().length >= 2 ? searchPages(search) : [];

  const dropRef = useRef();
  const bellRef = useRef();

  useEffect(() => {
    const fn = e => {
      if (dropRef.current   && !dropRef.current.contains(e.target))   setDropOpen(false);
      if (bellRef.current   && !bellRef.current.contains(e.target))   setBellOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const name     = currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : currentUser?.username || "User";
  const role     = currentUser?.role?.name || currentUser?.role || "";
  const initials = name[0]?.toUpperCase() || "U";
  const pending  = (inboxItems||[]).filter(i => i.status === "pending");
  const unread   = pending.length;
  const companyName = company?.name || "Al-Raza LPG";

  const TYPE_COLOR = { PR_APPROVAL:"#f97316", PO_APPROVAL:"#3b82f6", GRN_APPROVAL:"#10b981" };
  const TYPE_LABEL = { PR_APPROVAL:"PR", PO_APPROVAL:"PO", GRN_APPROVAL:"GRN" };

  return (
    <>
      {/* ── Main topbar ── */}
      <header style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", flexShrink:0, position:"sticky", top:0, zIndex:200 }}>
        <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", gap:10 }}>

          {/* ── Left: home icon + breadcrumb ── */}
          <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:0, overflow:"hidden", flex:1 }}>

            {/* Home icon button */}
            <button onClick={() => navigate("/")} title="Home"
              style={{ width:32, height:32, borderRadius:8, border:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
              onMouseLeave={e => e.currentTarget.style.background="#f8fafc"}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>

            {/* Breadcrumb */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>

            {moduleTitle && <>
              <span style={{ fontSize:12.5, fontWeight:700, color:accentColor, whiteSpace:"nowrap", flexShrink:0 }}>{moduleTitle}</span>
              {pageTitle && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>}
            </>}

            {pageTitle && (
              <span style={{ fontSize:12.5, fontWeight:500, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pageTitle}</span>
            )}
          </div>

          {/* ── Right: search + bell + user ── */}
          <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>

            {/* Desktop search with global results dropdown */}
            <div className="utb-desktop-only" ref={searchRef} style={{ position:"relative" }}>
              <div
                style={{ display:"flex", alignItems:"center", gap:8, background:"#f8fafc", border:`1.5px solid ${showResults && searchResults.length > 0 ? accentColor : "#e2e8f0"}`, borderRadius:8, padding:"5px 12px", width:240, transition:"border-color 0.15s" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/><path d="m21 21-4.3-4.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
                <input value={search}
                  onChange={e => { setSearch(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  onKeyDown={e => { if(e.key==="Escape"){ setSearch(""); setShowResults(false); } }}
                  placeholder="Search pages & modules…"
                  style={{ background:"none", border:"none", outline:"none", fontSize:12.5, color:"#374151", width:"100%" }}/>
                {search && <button onClick={() => { setSearch(""); setShowResults(false); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:16, lineHeight:1, padding:0 }}>×</button>}
              </div>

              {/* Results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, width:340, background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, boxShadow:"0 10px 30px rgba(0,0,0,0.12)", zIndex:9000, overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px 6px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Pages & Modules
                  </div>
                  {searchResults.map((page, i) => (
                    <button key={page.path} onClick={() => { navigate(page.path); setSearch(""); setShowResults(false); }}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", borderTop: i>0 ? "1px solid #f8fafc":"none", transition:"background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <div style={{ width:28, height:28, borderRadius:7, background:page.moduleAccent+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={page.moduleAccent} strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{page.title}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{page.module}</div>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showResults && search.trim().length >= 2 && searchResults.length === 0 && (
                <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, width:280, background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:9000, padding:"20px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:13, color:"#94a3b8" }}>No pages found for "<strong style={{color:"#374151"}}>{search}</strong>"</div>
                </div>
              )}
            </div>

            {/* Mobile search icon */}
            <button className="utb-mobile-only" onClick={() => setSearchOpen(o => !o)}
              style={{ width:34, height:34, borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2"/><path d="m21 21-4.3-4.3" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>

            {/* Bell */}
            <div ref={bellRef} style={{ position:"relative" }}>
              <button onClick={() => setBellOpen(o => !o)}
                style={{ width:34, height:34, borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", transition:"background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.background="#f8fafc"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={unread > 0 ? accentColor : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={unread > 0 ? accentColor : "#64748b"} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {unread > 0 && <span style={{ position:"absolute", top:6, right:6, width:8, height:8, borderRadius:"50%", background:"#ef4444", border:"1.5px solid #fff" }}/>}
              </button>

              {bellOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:360, background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, boxShadow:"0 12px 40px rgba(0,0,0,0.13)", zIndex:9000, overflow:"hidden" }}>
                  <div style={{ padding:"14px 18px 10px", borderBottom:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Inbox</div>
                      <div style={{ fontSize:11.5, color: unread>0 ? accentColor : "#94a3b8", fontWeight:600, marginTop:1 }}>
                        {unread > 0 ? `${unread} pending approval${unread>1?"s":""}` : "All clear"}
                      </div>
                    </div>
                    {unread > 0 && (
                      <button onClick={() => { navigate("/inbox"); setBellOpen(false); }}
                        style={{ fontSize:12, fontWeight:600, color:"#6366f1", background:"#eef2ff", border:"none", cursor:"pointer", padding:"5px 12px", borderRadius:20 }}>
                        View all →
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight:320, overflowY:"auto" }}>
                    {pending.length === 0 ? (
                      <div style={{ padding:"40px 16px", textAlign:"center" }}>
                        <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>All caught up!</div>
                        <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>No pending approvals</div>
                      </div>
                    ) : pending.map((item, i) => {
                      const tc = TYPE_COLOR[item.type] || "#8b5cf6";
                      const tl = TYPE_LABEL[item.type] || "Task";
                      return (
                        <div key={item.id} onClick={() => { navigate("/inbox"); setBellOpen(false); }}
                          style={{ padding:"11px 18px", borderBottom: i<pending.length-1 ? "1px solid #f8fafc":"none", cursor:"pointer", display:"flex", gap:11, alignItems:"flex-start", transition:"background 0.1s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                          onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                          <div style={{ width:34, height:34, borderRadius:9, background:tc+"15", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                            <div style={{ fontSize:11.5, color:"#64748b", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.message}</div>
                            <div style={{ display:"flex", gap:5, marginTop:4 }}>
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

            {/* User dropdown */}
            <div ref={dropRef} style={{ position:"relative" }}>
              {/* Desktop: full pill with name */}
              <button className="utb-desktop-only" onClick={() => setDropOpen(o => !o)}
                style={{ display:"flex", alignItems:"center", gap:8, background:"#f9fafb", border:"1px solid #f1f5f9", borderRadius:9, padding:"5px 10px 5px 5px", cursor:"pointer", transition:"background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background="#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.background="#f9fafb"}>
                <div style={{ width:26, height:26, borderRadius:7, background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", overflow:"hidden", flexShrink:0 }}>
                  {currentUser?.photo ? <img src={currentUser.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
                </div>
                <div style={{ display:"flex", flexDirection:"column", lineHeight:1.25, textAlign:"left" }}>
                  <span style={{ fontSize:12.5, fontWeight:700, color:"#111827", whiteSpace:"nowrap" }}>{name}</span>
                  <span style={{ fontSize:10.5, color:"#9ca3af", whiteSpace:"nowrap" }}>{role}</span>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {/* Mobile: avatar only */}
              <button className="utb-mobile-only" onClick={() => setDropOpen(o => !o)}
                style={{ width:34, height:34, borderRadius:"50%", border:"none", background:accentColor, display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:13, fontWeight:800, color:"#fff", overflow:"hidden" }}>
                {currentUser?.photo ? <img src={currentUser.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/> : initials}
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:230, background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,0.13)", zIndex:9000, overflow:"hidden" }}>
                  <div style={{ padding:"13px 15px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc", display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:accentColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0, overflow:"hidden" }}>
                      {currentUser?.photo ? <img src={currentUser.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
                    </div>
                    <div><div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a" }}>{name}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{role}</div></div>
                  </div>
                  {[
                    { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"My Profile", action:() => { setDropOpen(false); setTimeout(() => setShowProfile(true), 0); } },
                    { icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, label:"Change Password", action:() => { setDropOpen(false); setTimeout(() => setShowPwd(true), 0); } },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 15px", fontSize:13, color:"#374151", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", transition:"background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      {item.icon}{item.label}
                    </button>
                  ))}
                  <hr style={{ border:"none", borderTop:"1px solid #f1f5f9", margin:0 }}/>
                  <button onClick={() => { logout(); navigate("/login"); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 15px", fontSize:13, color:"#ef4444", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", transition:"background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile search strip with results ── */}
      {searchOpen && (
        <div style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", flexShrink:0 }}>
          <div style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/><path d="m21 21-4.3-4.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setShowResults(true); }}
              placeholder="Search pages & modules…" autoFocus
              style={{ flex:1, border:"none", outline:"none", fontSize:14, color:"#374151" }}/>
            <button onClick={() => { setSearch(""); setSearchOpen(false); setShowResults(false); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:20, lineHeight:1 }}>×</button>
          </div>
          {/* Mobile search results */}
          {searchResults.length > 0 && (
            <div style={{ borderTop:"1px solid #f8fafc", maxHeight:280, overflowY:"auto" }}>
              {searchResults.map((page, i) => (
                <button key={page.path} onClick={() => { navigate(page.path); setSearch(""); setSearchOpen(false); setShowResults(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", borderTop: i>0?"1px solid #f8fafc":"none" }}
                  onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{ width:26,height:26,borderRadius:7,background:page.moduleAccent+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={page.moduleAccent} strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{page.title}</div>
                    <div style={{ fontSize:11,color:"#94a3b8" }}>{page.module}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {search.trim().length >= 2 && searchResults.length === 0 && (
            <div style={{ padding:"14px 16px", fontSize:13, color:"#94a3b8", borderTop:"1px solid #f8fafc" }}>No pages found for "<strong style={{color:"#374151"}}>{search}</strong>"</div>
          )}
        </div>
      )}

      {/* Modals */}
      {showProfile && <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onSave={d => { if(currentUser?.id) updateUser(currentUser.id,d); setShowProfile(false); }} accentColor={accentColor}/>}
      {showPwd     && <PwdModal user={currentUser} users={users} onClose={() => setShowPwd(false)} onSave={(id,pwd) => { resetPassword(id,pwd); setShowPwd(false); }} accentColor={accentColor}/>}
    </>
  );
}

/* ── Profile Modal ── */
function ProfileModal({ user, onClose, onSave, accentColor }) {
  const [form, setForm] = useState({ firstName:user?.firstName||"", lastName:user?.lastName||"", email:user?.email||"", phone:user?.phone||"", department:user?.department||"", photo:user?.photo||null });
  const fileRef = useRef();
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:480, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:700 }}>My Profile</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
        </div>
        <div style={{ padding:"20px 22px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width:72, height:72, borderRadius:"50%", background:accentColor, overflow:"hidden", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"#fff" }}>
              {form.photo ? <img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (form.firstName[0]||"U").toUpperCase()}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setForm(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}}/>
            <span style={{ fontSize:12, color:"#9ca3af" }}>Click to change photo</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["First Name","firstName","text"],["Last Name","lastName","text"],["Email","email","email"],["Phone","phone","tel"],["Department","department","text"]].map(([l,k,t])=>(
              <div key={k} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l}
                  style={{ padding:"8px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, color:"#111827", outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=accentColor} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:"14px 22px", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:accentColor, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ── Password Modal ── */
function PwdModal({ user, users, onClose, onSave, accentColor }) {
  const [form, setForm] = useState({ current:"", newPwd:"", confirm:"" });
  const [msg,  setMsg]  = useState(null);
  function submit() {
    const full = (users||[]).find(u => u.id === user?.id);
    if (!form.current)                          { setMsg({e:true,m:"Enter current password."}); return; }
    if (full && full.password !== form.current) { setMsg({e:true,m:"Current password incorrect."}); return; }
    if (form.newPwd.length < 6)                 { setMsg({e:true,m:"Min 6 characters."}); return; }
    if (form.newPwd !== form.confirm)           { setMsg({e:true,m:"Passwords do not match."}); return; }
    onSave(user?.id, form.newPwd);
    setMsg({e:false,m:"Password changed!"}); setTimeout(onClose, 1200);
  }
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:16, fontWeight:700 }}>Change Password</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
        </div>
        <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          {[["Current Password","current"],["New Password","newPwd"],["Confirm Password","confirm"]].map(([l,k])=>(
            <div key={k} style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{l}</label>
              <input type="password" value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={l}
                style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, color:"#111827", outline:"none" }}
                onFocus={e=>e.target.style.borderColor=accentColor} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
          ))}
          {msg && <div style={{ padding:"9px 12px", borderRadius:8, fontSize:13, background:msg.e?"#fef2f2":"#f0fdf4", color:msg.e?"#dc2626":"#16a34a" }}>{msg.m}</div>}
        </div>
        <div style={{ padding:"14px 22px", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
          <button onClick={submit}  style={{ padding:"8px 16px", borderRadius:8, border:"none", background:accentColor, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>Change Password</button>
        </div>
      </div>
    </div>
  );
}
