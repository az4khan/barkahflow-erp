import { useState } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../../components/common/Icon";
import UniversalTopbar from "../../components/common/UniversalTopbar";

const ACCENT = "#6366f1";

const TAB_LIST = [
  { id:"profile",       label:"🏢 Company Profile" },
  { id:"subsidiaries",  label:"🌐 Subsidiaries"    },
  { id:"security",      label:"🔒 Security"        },
  { id:"notifications", label:"🔔 Notifications"   },
];

/* ── Toggle switch ── */
function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{ width:42, height:24, borderRadius:12, background:on?"#6366f1":"#d1d5db", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?20:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ icon, iconBg, iconColor, title, sub, children }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #f3f4f6", borderRadius:14, padding:24, display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14, paddingBottom:16, borderBottom:"1px solid #f3f4f6" }}>
        <div style={{ width:40, height:40, borderRadius:10, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon name={icon} size={20} color={iconColor} />
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{title}</div>
          <div style={{ fontSize:12.5, color:"#9ca3af", marginTop:2 }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Form field ── */
function Field({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", readOnly }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ padding:"9px 12px", border:`1.5px solid ${focused?"#6366f1":"#e5e7eb"}`, borderRadius:8, fontSize:13.5, color:"#111827", background: readOnly?"#f9fafb":"#fff", outline:"none", transition:"border-color 0.15s", width:"100%", boxSizing:"border-box" }}
      onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
  );
}

/* ── Toggle row ── */
function ToggleRow({ label, sub, on, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f9fafb" }}>
      <div>
        <div style={{ fontSize:13.5, fontWeight:600, color:"#111827" }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"#9ca3af", marginTop:1 }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export default function CompanySettingsPage() {
  const { company, setCompany, subsidiaries, createSubsidiary, updateSubsidiary, deleteSubsidiary } = useApp();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({
    name:     company?.name     || "Al-Raza LPG (Pvt.) Ltd.",
    legalName:company?.legalName||company?.name|| "Al-Raza LPG (Pvt.) Ltd.",
    taxId:    company?.taxId||company?.taxNumber|| "NTN-1234567-8",
    regNo:    company?.regNo    || "REG-001",
    industry: company?.industry || "Energy & Utilities",
    email:    company?.email    || "info@alrazalpg.com",
    phone:    company?.phone    || "+92-21-1234567",
    website:  company?.website  || "www.alrazalpg.com",
    address:  company?.address  || "123 Industrial Area, Karachi",
    city:     company?.city     || "Karachi",
    country:  company?.country  || "Pakistan",
    currency: company?.currency || "PKR",
    timezone: company?.timezone || "Asia/Karachi",
    fiscalYear:company?.fiscalYear||"July–June",
  });
  const [security, setSecurity] = useState({
    maxLogin:  company?.maxLogin  || 5,
    sessionTimeout: company?.sessionTimeout || 60,
    twoFactor: company?.twoFactor || false,
    ipWhitelist: company?.ipWhitelist || false,
    passwordExpiry: company?.passwordExpiry || false,
    auditLog:  company?.auditLog  ?? true,
  });
  const [notifs, setNotifs] = useState({
    emailApproval:    company?.notifs?.emailApproval    ?? true,
    emailRejection:   company?.notifs?.emailRejection   ?? true,
    emailNewUser:     company?.notifs?.emailNewUser     ?? true,
    emailBackup:      company?.notifs?.emailBackup      ?? false,
    systemAlerts:     company?.notifs?.systemAlerts     ?? true,
    weeklyReport:     company?.notifs?.weeklyReport     ?? false,
  });
  const [showSubForm, setShowSubForm] = useState(false);
  const [editSub, setEditSub]         = useState(null);
  const [subForm, setSubForm]         = useState({ name:"", country:"", currency:"PKR", status:"active" });
  const [saved, setSaved]             = useState(false);

  function saveProfile() {
    setCompany({ ...company, ...profile, notifs, maxLogin:security.maxLogin, sessionTimeout:security.sessionTimeout, twoFactor:security.twoFactor });
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }

  const STATS = [
    { label:"Company",            value:profile.name,          icon:"building", bg:"#eef2ff", color:ACCENT, small: profile.name.length > 12 },
    { label:"Subsidiaries",       value:(subsidiaries||[]).length, hint:`${(subsidiaries||[]).filter(s=>s.status==="active").length} active`, icon:"store", bg:"#f0fdf4", color:"#10b981" },
    { label:"Max Login Attempts", value:security.maxLogin,     hint:`${security.sessionTimeout}m session timeout`, icon:"shield", bg:"#fef2f2", color:"#ef4444" },
    { label:"Currency",           value:profile.currency,      hint:`Symbol: Rs`, icon:"star", bg:"#fffbeb", color:"#f59e0b" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <UniversalTopbar moduleTitle="Company Settings" pageTitle={TAB_LIST.find(t=>t.id===tab)?.label.replace(/^\S+\s/,"")} accentColor={ACCENT} />
      <div style={{ flex:1, overflowY:"auto", background:"#f9fafb" }}>
        <div style={{ padding:"20px max(16px, min(32px, 4vw))", maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", margin:0 }}>Company Settings</h2>
            <p style={{ fontSize:12.5, color:"#94a3b8", margin:"3px 0 0" }}>Configure your company profile, subsidiaries, security and notifications</p>
          </div>

          {/* Stat cards — responsive grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12 }}>
            {STATS.map(s=>(
              <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                  <Icon name={s.icon} size={18} color={s.color} />
                </div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize: s.small ? 14 : 22, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em", lineHeight:1.2, wordBreak:"break-word" }}>{s.value}</div>
                {s.hint && <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{s.hint}</div>}
              </div>
            ))}
          </div>

          {/* Tab buttons */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {TAB_LIST.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{ padding:"9px 18px", borderRadius:8, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                  background: tab===t.id ? ACCENT : "#fff",
                  color:      tab===t.id ? "#fff"  : "#6b7280",
                  boxShadow:  tab===t.id ? "none"  : "0 1px 3px rgba(0,0,0,0.06)" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Company Profile ── */}
          {tab === "profile" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <Section icon="building" iconBg="#eef2ff" iconColor={ACCENT} title="Company Information" sub="Basic company details and identity">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
                  <Field label="Company Name *"><Input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Company name" /></Field>
                  <Field label="Legal Name"><Input value={profile.legalName} onChange={e=>setProfile(p=>({...p,legalName:e.target.value}))} placeholder="Legal entity name" /></Field>
                  <Field label="Tax ID / NTN"><Input value={profile.taxId} onChange={e=>setProfile(p=>({...p,taxId:e.target.value}))} placeholder="e.g. 1234567-8" /></Field>
                  <Field label="Registration No."><Input value={profile.regNo} onChange={e=>setProfile(p=>({...p,regNo:e.target.value}))} placeholder="Company reg number" /></Field>
                  <Field label="Industry"><Input value={profile.industry} onChange={e=>setProfile(p=>({...p,industry:e.target.value}))} placeholder="e.g. Energy & Utilities" /></Field>
                  <Field label="Website"><Input value={profile.website} onChange={e=>setProfile(p=>({...p,website:e.target.value}))} placeholder="www.example.com" /></Field>
                </div>
              </Section>

              <Section icon="user" iconBg="#f0fdf4" iconColor="#10b981" title="Contact Information" sub="Primary contact details">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
                  <Field label="Email"><Input type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} /></Field>
                  <Field label="Phone"><Input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} /></Field>
                  <Field label="Address" ><Input value={profile.address} onChange={e=>setProfile(p=>({...p,address:e.target.value}))} /></Field>
                  <Field label="City"><Input value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} /></Field>
                  <Field label="Country"><Input value={profile.country} onChange={e=>setProfile(p=>({...p,country:e.target.value}))} /></Field>
                </div>
              </Section>

              <Section icon="calculator" iconBg="#fffbeb" iconColor="#f59e0b" title="Financial & Regional" sub="Currency, timezone and fiscal settings">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:12 }}>
                  <Field label="Currency">
                    <select value={profile.currency} onChange={e=>setProfile(p=>({...p,currency:e.target.value}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {["PKR","USD","EUR","GBP","AED","SAR"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Timezone">
                    <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {["Asia/Karachi","Asia/Dubai","Asia/Riyadh","Europe/London","America/New_York"].map(z=><option key={z}>{z}</option>)}
                    </select>
                  </Field>
                  <Field label="Fiscal Year">
                    <select value={profile.fiscalYear} onChange={e=>setProfile(p=>({...p,fiscalYear:e.target.value}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {["January–December","April–March","July–June","October–September"].map(f=><option key={f}>{f}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                {saved && <div style={{ display:"flex", alignItems:"center", gap:6, color:"#16a34a", fontSize:13, fontWeight:600 }}>✓ Saved successfully</div>}
                <button onClick={saveProfile} style={{ padding:"10px 24px", background:ACCENT, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>Save Changes</button>
              </div>
            </div>
          )}

          {/* ── Subsidiaries ── */}
          {tab === "subsidiaries" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={()=>{setEditSub(null);setSubForm({name:"",country:"",currency:"PKR",status:"active"});setShowSubForm(true);}}
                  style={{ padding:"9px 18px", background:ACCENT, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <Icon name="plus" size={14} color="#fff" /> Add Subsidiary
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {(subsidiaries||[]).map(sub=>(
                  <div key={sub.id} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"18px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14.5, fontWeight:700, color:"#0f172a" }}>{sub.name}</div>
                        <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{sub.city||sub.country||"—"}</div>
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 10px", borderRadius:20, background: sub.status==="active"?"#f0fdf4":"#f8fafc", color: sub.status==="active"?"#16a34a":"#64748b" }}>{sub.status}</span>
                    </div>
                    <div style={{ display:"flex", gap:8, borderTop:"1px solid #f8fafc", paddingTop:12 }}>
                      <button onClick={()=>{setEditSub(sub);setSubForm({name:sub.name,country:sub.country,currency:sub.currency,status:sub.status});setShowSubForm(true);}}
                        style={{ flex:1, padding:"6px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, cursor:"pointer", fontSize:12.5, fontWeight:600, color:"#374151" }}>Edit</button>
                      <button onClick={()=>{if(window.confirm("Delete this subsidiary?"))deleteSubsidiary(sub.id);}}
                        style={{ flex:1, padding:"6px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:7, cursor:"pointer", fontSize:12.5, fontWeight:600, color:"#ef4444" }}>Delete</button>
                    </div>
                  </div>
                ))}
                {!(subsidiaries||[]).length && (
                  <div style={{ gridColumn:"1/-1", padding:40, textAlign:"center", color:"#94a3b8" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>🌐</div>
                    <div style={{ fontSize:14, fontWeight:600 }}>No subsidiaries yet</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {tab === "security" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <Section icon="shield" iconBg="#fef2f2" iconColor="#ef4444" title="Login & Session" sub="Control login attempts and session duration">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:12 }}>
                  <Field label="Max Login Attempts">
                    <select value={security.maxLogin} onChange={e=>setSecurity(s=>({...s,maxLogin:Number(e.target.value)}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {[3,5,10].map(n=><option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  <Field label="Session Timeout (minutes)">
                    <select value={security.sessionTimeout} onChange={e=>setSecurity(s=>({...s,sessionTimeout:Number(e.target.value)}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {[15,30,60,120,480].map(n=><option key={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>
                <ToggleRow label="Two-Factor Authentication" sub="Require 2FA for all user logins" on={security.twoFactor} onChange={()=>setSecurity(s=>({...s,twoFactor:!s.twoFactor}))} />
                <ToggleRow label="IP Whitelist" sub="Only allow logins from approved IP addresses" on={security.ipWhitelist} onChange={()=>setSecurity(s=>({...s,ipWhitelist:!s.ipWhitelist}))} />
                <ToggleRow label="Password Expiry" sub="Force password change every 90 days" on={security.passwordExpiry} onChange={()=>setSecurity(s=>({...s,passwordExpiry:!s.passwordExpiry}))} />
                <ToggleRow label="Audit Logging" sub="Record all user actions for compliance" on={security.auditLog} onChange={()=>setSecurity(s=>({...s,auditLog:!s.auditLog}))} />
              </Section>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                {saved && <div style={{ display:"flex", alignItems:"center", gap:6, color:"#16a34a", fontSize:13, fontWeight:600, marginRight:12 }}>✓ Saved</div>}
                <button onClick={saveProfile} style={{ padding:"10px 24px", background:ACCENT, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>Save Security Settings</button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <Section icon="bell" iconBg="#eef2ff" iconColor={ACCENT} title="Email Notifications" sub="Choose which events trigger email alerts">
                <ToggleRow label="Approval Requests" sub="Email when a document is submitted for approval" on={notifs.emailApproval} onChange={()=>setNotifs(n=>({...n,emailApproval:!n.emailApproval}))} />
                <ToggleRow label="Rejection Notifications" sub="Email when a request is rejected" on={notifs.emailRejection} onChange={()=>setNotifs(n=>({...n,emailRejection:!n.emailRejection}))} />
                <ToggleRow label="New User Created" sub="Email admins when a new user account is created" on={notifs.emailNewUser} onChange={()=>setNotifs(n=>({...n,emailNewUser:!n.emailNewUser}))} />
                <ToggleRow label="Backup Completion" sub="Email when scheduled backup completes or fails" on={notifs.emailBackup} onChange={()=>setNotifs(n=>({...n,emailBackup:!n.emailBackup}))} />
              </Section>
              <Section icon="eye" iconBg="#f8fafc" iconColor="#64748b" title="System Notifications" sub="In-app and system-level alerts">
                <ToggleRow label="System Alerts" sub="Critical system warnings shown in the app" on={notifs.systemAlerts} onChange={()=>setNotifs(n=>({...n,systemAlerts:!n.systemAlerts}))} />
                <ToggleRow label="Weekly Summary Report" sub="Receive a weekly activity digest every Monday" on={notifs.weeklyReport} onChange={()=>setNotifs(n=>({...n,weeklyReport:!n.weeklyReport}))} />
              </Section>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                {saved && <div style={{ display:"flex", alignItems:"center", gap:6, color:"#16a34a", fontSize:13, fontWeight:600, marginRight:12 }}>✓ Saved</div>}
                <button onClick={saveProfile} style={{ padding:"10px 24px", background:ACCENT, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subsidiary form modal */}
      {showSubForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
            <div style={{ padding:"18px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:15, fontWeight:700 }}>{editSub?"Edit":"Add"} Subsidiary</span>
              <button onClick={()=>setShowSubForm(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#9ca3af" }}>×</button>
            </div>
            <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:12 }}>
              {[["Name","name","text"],["Country","country","text"],["Currency","currency","text"]].map(([l,k,t])=>(
                <Field key={k} label={l}><Input type={t} value={subForm[k]} onChange={e=>setSubForm(f=>({...f,[k]:e.target.value}))} placeholder={l} /></Field>
              ))}
              <Field label="Status">
                <select value={subForm.status} onChange={e=>setSubForm(f=>({...f,status:e.target.value}))}
                  style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <div style={{ padding:"14px 22px", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowSubForm(false)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{ if(!subForm.name){alert("Name required");return;} editSub?updateSubsidiary(editSub.id,subForm):createSubsidiary(subForm); setShowSubForm(false); }}
                style={{ padding:"8px 18px", borderRadius:8, border:"none", background:ACCENT, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
                {editSub?"Save Changes":"Add Subsidiary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
