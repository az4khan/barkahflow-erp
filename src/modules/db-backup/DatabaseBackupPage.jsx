import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../../components/common/Icon";
import UniversalTopbar from "../../components/common/UniversalTopbar";

const ACCENT = "#0ea5e9";

function fmtDate(iso){ if(!iso)return"—"; return new Date(iso).toLocaleString("en-PK",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}); }
function fmtSize(mb){ if(!mb)return"—"; if(typeof mb==="string")return mb; return mb>=1000?`${(mb/1000).toFixed(1)} GB`:`${mb} MB`; }

export default function DatabaseBackupPage() {
  const { backups, createBackup, deleteBackup, currentUser } = useApp();
  const [tab, setTab]         = useState("history");
  const [creating, setCreating] = useState(false);
  const [schedule, setSchedule] = useState({ frequency:"daily", time:"02:00", retention:30, enabled:true });
  const [notifEmail, setNotifEmail] = useState("admin@barkahflow.com");

  const sortedBackups = useMemo(()=>[...(backups||[])].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),[backups]);
  const lastBackup    = sortedBackups[0];
  const successCount  = (backups||[]).filter(b=>b.status==="success"||b.status==="completed").length;
  const failedCount   = (backups||[]).filter(b=>b.status==="failed").length;
  const totalMB       = (backups||[]).reduce((s,b)=>s+(b.sizeMB||0),0);

  async function handleCreate() {
    setCreating(true);
    await new Promise(r=>setTimeout(r,1800));
    const sizeMB=Math.floor(40+Math.random()*20); createBackup({ name:"Manual Backup", type:"full", sizeMB, size:`${sizeMB} MB`, status:"success", duration:"1m 12s", createdBy:currentUser?.username||"admin" });
    setCreating(false);
  }

  const STATS = [
    { label:"Total Backups",  value:(backups||[]).length, icon:"database", bg:"#f0f9ff", color:ACCENT },
    { label:"Successful",     value:successCount,          icon:"check",   bg:"#f0fdf4", color:"#10b981" },
    { label:"Failed",         value:failedCount,           icon:"close",   bg:"#fef2f2", color:"#ef4444" },
    { label:"Total Stored",   value:fmtSize(totalMB),      icon:"download",bg:"#f5f3ff", color:"#8b5cf6" },
  ];

  const SCHEDULES = [
    { id:"hourly",  label:"Hourly",  sub:"Every hour"     },
    { id:"daily",   label:"Daily",   sub:"Once per day"   },
    { id:"weekly",  label:"Weekly",  sub:"Once per week"  },
    { id:"monthly", label:"Monthly", sub:"Once per month" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <UniversalTopbar moduleTitle="Database Backup" pageTitle={tab==="history"?"Backup History":"Schedule & Settings"} accentColor={ACCENT} />
      <div style={{ flex:1, overflowY:"auto", background:"#f9fafb" }}>
        <div style={{ padding:"28px 32px", maxWidth:1400, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", margin:0 }}>Database Backup</h2>
              <p style={{ fontSize:12.5, color:"#94a3b8", margin:"3px 0 0" }}>Manage backups, restore points and automated scheduling</p>
            </div>
            <button onClick={handleCreate} disabled={creating}
              style={{ padding:"10px 20px", background:"#10b981", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, opacity: creating?0.7:1, transition:"all 0.15s" }}>
              <Icon name="database" size={16} color="#fff" />
              {creating ? "Creating…" : "Create Backup Now"}
            </button>
          </div>

          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {STATS.map(s=>(
              <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                  <Icon name={s.icon} size={17} color={s.color} />
                </div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Last backup banner */}
          {lastBackup && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:10, fontSize:13, flexWrap:"wrap", background: lastBackup.status==="success"||lastBackup.status==="completed"?"#f0fdf4":"#fef2f2", border:`1px solid ${lastBackup.status==="success"||lastBackup.status==="completed"?"#bbf7d0":"#fecaca"}`, color: lastBackup.status==="success"||lastBackup.status==="completed"?"#166534":"#991b1b" }}>
              <Icon name={lastBackup.status==="success"||lastBackup.status==="completed"?"check":"close"} size={15} color={lastBackup.status==="success"||lastBackup.status==="completed"?"#16a34a":"#ef4444"} />
              <span><strong>Last backup:</strong> {lastBackup.name} — {fmtDate(lastBackup.createdAt)} · {fmtSize(lastBackup.sizeMB)} · {lastBackup.duration||"—"} · by {lastBackup.createdBy||"System"}</span>
              <span style={{ marginLeft:"auto", fontWeight:700 }}>{lastBackup.status==="success"?"Success":"Failed"}</span>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", gap:6 }}>
            {[["history","💾 Backup History"],["schedule","⚙ Schedule & Settings"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{ padding:"9px 18px", borderRadius:8, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
                  background: tab===id?ACCENT:"#fff", color: tab===id?"#fff":"#6b7280",
                  boxShadow: tab===id?"none":"0 1px 3px rgba(0,0,0,0.06)" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Backup History ── */}
          {tab === "history" && (
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Backup ID","Name","Type","Size","Status","Created At","Duration","By","Actions"].map(h=>(
                        <th key={h} style={{ padding:"9px 16px", fontSize:11, fontWeight:600, color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1px solid #f1f5f9", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBackups.map(b=>(
                      <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <td style={{ padding:"11px 16px", fontSize:12, fontWeight:700, color:ACCENT }}>{b.id}</td>
                        <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600, color:"#0f172a" }}>{b.name}</td>
                        <td style={{ padding:"11px 16px" }}>
                          <span style={{ fontSize:11.5, fontWeight:700, background: (b.type==="Full"||b.type==="full")?"#eff6ff":"#f0fdf4", color: (b.type==="Full"||b.type==="full")?"#2563eb":"#16a34a", padding:"2px 9px", borderRadius:20 }}>{b.type?b.type.charAt(0).toUpperCase()+b.type.slice(1):"Full"}</span>
                        </td>
                        <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{fmtSize(b.sizeMB||b.size)}</td>
                        <td style={{ padding:"11px 16px" }}>
                          <span style={{ fontSize:11.5, fontWeight:700, background: b.status==="success"||b.status==="completed"?"#f0fdf4":"#fef2f2", color: b.status==="success"||b.status==="completed"||b.status==="completed"?"#16a34a":"#ef4444", padding:"2px 9px", borderRadius:20 }}>
                            {b.status==="success"||b.status==="completed"?"Success":"Failed"}
                          </span>
                        </td>
                        <td style={{ padding:"11px 16px", fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>{fmtDate(b.createdAt)}</td>
                        <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{b.duration||"—"}</td>
                        <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{b.createdBy||"System"}</td>
                        <td style={{ padding:"11px 16px" }}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button title="Restore" style={{ width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                              onClick={()=>alert(`Restore from ${b.id}?`)}>
                              <Icon name="forward" size={13} color="#6b7280" />
                            </button>
                            <button title="Download" style={{ width:28, height:28, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Icon name="download" size={13} color="#6b7280" />
                            </button>
                            <button title="Delete" onClick={()=>{if(window.confirm("Delete this backup?"))deleteBackup(b.id);}}
                              style={{ width:28, height:28, borderRadius:7, border:"1px solid #fecaca", background:"#fef2f2", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Icon name="close" size={13} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!sortedBackups.length && (
                      <tr><td colSpan={9} style={{ padding:48, textAlign:"center", color:"#94a3b8" }}>
                        <div style={{ fontSize:32, marginBottom:10 }}>💾</div>
                        <div style={{ fontSize:14, fontWeight:600 }}>No backups yet</div>
                        <div style={{ fontSize:12.5, marginTop:4 }}>Click "Create Backup Now" to start</div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Schedule & Settings ── */}
          {tab === "schedule" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Schedule frequency */}
              <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:16, borderBottom:"1px solid #f3f4f6" }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:"#f0f9ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="eye" size={20} color={ACCENT} />
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700 }}>Backup Schedule</div>
                    <div style={{ fontSize:12.5, color:"#9ca3af" }}>Automated backup frequency and timing</div>
                  </div>
                  {/* Enable toggle */}
                  <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:13, color:"#374151", fontWeight:600 }}>{schedule.enabled?"Enabled":"Disabled"}</span>
                    <div onClick={()=>setSchedule(s=>({...s,enabled:!s.enabled}))}
                      style={{ width:42, height:24, borderRadius:12, background:schedule.enabled?ACCENT:"#d1d5db", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                      <div style={{ position:"absolute", top:3, left:schedule.enabled?20:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                    </div>
                  </div>
                </div>
                {/* Frequency tiles */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
                  {SCHEDULES.map(opt=>(
                    <button key={opt.id} onClick={()=>setSchedule(s=>({...s,frequency:opt.id}))}
                      style={{ padding:14, border:`1.5px solid ${schedule.frequency===opt.id?ACCENT:"#e5e7eb"}`, borderRadius:10, textAlign:"left", cursor:"pointer", background: schedule.frequency===opt.id?"#f0f9ff":"#fff", transition:"all 0.12s" }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color: schedule.frequency===opt.id?ACCENT:"#111827" }}>{opt.label}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Backup Time</label>
                    <input type="time" value={schedule.time} onChange={e=>setSchedule(s=>({...s,time:e.target.value}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }} />
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <label style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Retain Backups (days)</label>
                    <select value={schedule.retention} onChange={e=>setSchedule(s=>({...s,retention:Number(e.target.value)}))}
                      style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none" }}>
                      {[7,14,30,60,90].map(n=><option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:24 }}>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Notification Settings</div>
                <div style={{ fontSize:12.5, color:"#9ca3af", marginBottom:16 }}>Email alerts for backup events</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>Notify Email</label>
                  <input value={notifEmail} onChange={e=>setNotifEmail(e.target.value)}
                    style={{ padding:"9px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13.5, outline:"none", maxWidth:360 }} />
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={()=>alert("Schedule saved!")}
                  style={{ padding:"10px 24px", background:ACCENT, color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
                  Save Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
