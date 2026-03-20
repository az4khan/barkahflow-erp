import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../../components/common/Icon";
import UniversalTopbar from "../../components/common/UniversalTopbar";

const ACCENT = "#6366f1"; // Indigo — matches tile on home page

const TYPE_META = {
  PR_APPROVAL: { label:"PR", fullLabel:"Purchase Requisition", icon:"list",    color:"#6366f1", bg:"#eef2ff" },
  PO_APPROVAL: { label:"PO", fullLabel:"Purchase Order",       icon:"purchase",color:"#f97316", bg:"#fff7ed" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-PK",{day:"2-digit",month:"short",year:"numeric"}) + " " +
         d.toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit",hour12:false});
}
function fmtPKR(n){if(!n)return"—";if(n>=1e7)return`Rs ${(n/1e7).toFixed(2)}M`;if(n>=1e3)return`Rs ${Number(n).toLocaleString()}`;return`Rs ${n}`;}

/* ── Right detail panel ── */
function DetailPanel({ item, onClose, onApprove, onReject }) {
  const [note,   setNote]   = useState("");
  const [reason, setReason] = useState("");
  const [confirmTab, setConfirmTab] = useState(null); // "approve" | "reject"
  const meta = TYPE_META[item.type] || TYPE_META.PR_APPROVAL;

  function doApprove() { onApprove(item.id, note); setConfirmTab(null); }
  function doReject()  {
    if (!reason.trim()) { alert("Rejection reason is required."); return; }
    onReject(item.id, reason); setConfirmTab(null);
  }

  const rows = [
    ["Submitted By", item.createdByName],
    ["Module",       item.module || "—"],
    ["Priority",     item.priority   || "—"],
    ["Submitted At", fmtDate(item.createdAt)],
    ["Type",         meta.fullLabel],
    ["Ref No",       item.refNo],
    ["Current Level","1 of 2"],
    ["Status",       item.status],
    ["Notes",        item.message],
  ];

  return (
    <div style={{ width:380, minWidth:380, background:"#fff", borderLeft:"1px solid #e9ecef", display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Request Detail</div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, padding:"0 2px", lineHeight:1 }}>×</button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
        {/* Title block */}
        <div style={{ background:"#f8fafc", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", marginBottom:4 }}>{item.title}</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>{meta.fullLabel} · {item.refNo}</div>
          {item.totalAmount && <div style={{ fontSize:18, fontWeight:800, color:ACCENT }}>{fmtPKR(item.totalAmount)}</div>}
        </div>

        {/* Key-value rows */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
              <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:12.5, color:"#374151", fontWeight:500, textAlign:"right", maxWidth:200 }}>{val || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons — only for pending */}
      {item.status === "pending" && (
        <div style={{ padding:"14px 18px", borderTop:"1px solid #f1f5f9", display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
          {confirmTab === null && (<>
            <button onClick={() => setConfirmTab("approve")}
              style={{ padding:"10px", background:"#10b981", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
              ✓ Approve
            </button>
            <button onClick={() => setConfirmTab("reject")}
              style={{ padding:"10px", background:"#ef4444", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
              ✗ Reject
            </button>
            <button style={{ padding:"9px", background:"#fff", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              → Forward to Another User
            </button>
          </>)}

          {confirmTab === "approve" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:"#f0fdf4", borderRadius:8, padding:"10px 12px", fontSize:12.5, color:"#166534" }}>Approving <strong>{item.refNo}</strong></div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Add a note (optional)…"
                style={{ padding:"8px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:12.5, resize:"none", outline:"none" }} />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setConfirmTab(null)} style={{ flex:1, padding:"8px", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:12.5 }}>Cancel</button>
                <button onClick={doApprove} style={{ flex:2, padding:"8px", background:"#10b981", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:12.5 }}>✓ Confirm Approval</button>
              </div>
            </div>
          )}

          {confirmTab === "reject" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:"#fef2f2", borderRadius:8, padding:"10px 12px", fontSize:12.5, color:"#991b1b" }}>Rejecting <strong>{item.refNo}</strong></div>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2} placeholder="Rejection reason (required)…"
                style={{ padding:"8px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:12.5, resize:"none", outline:"none" }} />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setConfirmTab(null)} style={{ flex:1, padding:"8px", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontSize:12.5 }}>Cancel</button>
                <button onClick={doReject} style={{ flex:2, padding:"8px", background:"#ef4444", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:12.5 }}>✗ Confirm Rejection</button>
              </div>
            </div>
          )}
        </div>
      )}

      {item.status !== "pending" && (
        <div style={{ padding:"14px 18px", borderTop:"1px solid #f1f5f9", flexShrink:0 }}>
          <div style={{ padding:"10px 14px", borderRadius:9, textAlign:"center", fontSize:13, fontWeight:700,
            background: item.status==="approved"?"#f0fdf4":"#fef2f2",
            color: item.status==="approved"?"#166534":"#991b1b" }}>
            {item.status==="approved" ? "✓ Approved" : "✗ Rejected"}
          </div>
          {item.rejectionReason && <div style={{ marginTop:8, fontSize:12, color:"#64748b" }}>Reason: {item.rejectionReason}</div>}
        </div>
      )}
    </div>
  );
}

/* ── Inbox row item ── */
function InboxRow({ item, selected, onClick }) {
  const meta = TYPE_META[item.type] || TYPE_META.PR_APPROVAL;
  const isSelected = selected?.id === item.id;
  const PRIORITY_C = { high:"#ef4444", normal:"#3b82f6", low:"#94a3b8" };

  return (
    <div onClick={onClick}
      style={{ padding:"14px 18px", borderBottom:"1px solid #f8fafc", cursor:"pointer", borderLeft:`3px solid ${isSelected?ACCENT:"transparent"}`,
        background: isSelected?"#f5f3ff":"#fff", transition:"background 0.12s" }}
      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="#f8fafc"; }}
      onMouseLeave={e=>{ e.currentTarget.style.background = isSelected?"#f5f3ff":"#fff"; }}>

      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        {/* Type badge */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
          <span style={{ fontSize:10.5, fontWeight:800, background:meta.bg, color:meta.color, padding:"2px 8px", borderRadius:20 }}>{meta.label}</span>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Row 1: ref + priority + status */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <span style={{ fontSize:12, fontWeight:700, color:meta.color }}>{item.refNo}</span>
            {item.priority && <span style={{ fontSize:10.5, fontWeight:700, color:PRIORITY_C[item.priority]||"#94a3b8" }}>{item.priority.charAt(0).toUpperCase()+item.priority.slice(1)}</span>}
            <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20,
              background: item.status==="pending"?"#fef9c3": item.status==="approved"?"#f0fdf4":"#fef2f2",
              color:       item.status==="pending"?"#854d0e": item.status==="approved"?"#166534":"#991b1b" }}>
              {item.status.charAt(0).toUpperCase()+item.status.slice(1)}
            </span>
          </div>

          {/* Row 2: title */}
          <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>

          {/* Row 3: amount · submitter · date */}
          <div style={{ fontSize:11.5, color:"#64748b", marginTop:3, display:"flex", gap:8, alignItems:"center" }}>
            {item.totalAmount && <span style={{ fontWeight:600 }}>{fmtPKR(item.totalAmount)}</span>}
            <span>·</span>
            <span>{item.createdByName}</span>
            <span>·</span>
            <span>{fmtDate(item.createdAt)}</span>
          </div>

          {/* Row 4: level info + inline approve/reject for pending */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:11, color:"#94a3b8" }}>Level 1/2 · {item.type==="PR_APPROVAL"?"Medium PR":"Standard PO"}</span>
            {item.status==="pending" && (
              <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>onClick("approve")}
                  style={{ padding:"3px 12px", background:"#f0fdf4", color:"#166534", border:"1px solid #bbf7d0", borderRadius:6, fontSize:11.5, fontWeight:700, cursor:"pointer" }}>
                  ✓ Approve
                </button>
                <button onClick={()=>onClick("reject")}
                  style={{ padding:"3px 12px", background:"#fef2f2", color:"#991b1b", border:"1px solid #fecaca", borderRadius:6, fontSize:11.5, fontWeight:700, cursor:"pointer" }}>
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Email Log tab ── */
function EmailLog({ items }) {
  // Derive email log entries from resolved inbox items
  const logs = (items||[])
    .filter(i => i.status !== "pending")
    .map(i => ({
      id:      i.id,
      to:      `${i.createdByName?.toLowerCase().replace(/ /g,"")||"user"}@barkahflow.com`,
      subject: `${i.status==="approved"?"✓ Approved":"✗ Rejected"}: ${i.refNo} — ${i.title}`,
      sentAt:  i.updatedAt || i.createdAt,
      status:  "Delivered",
      type:    i.type,
    }));

  return (
    <div>
      {logs.length === 0 ? (
        <div style={{ padding:"60px 20px", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:14, fontWeight:600, color:"#374151" }}>No emails sent yet</div>
          <div style={{ fontSize:12.5, color:"#94a3b8", marginTop:4 }}>Email notifications will appear here when approvals are processed</div>
        </div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Recipient","Subject","Sent At","Status"].map(h=>(
                <th key={h} style={{ padding:"9px 16px", fontSize:11, fontWeight:600, color:"#94a3b8", textAlign:"left", textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log=>(
              <tr key={log.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{log.to}</td>
                <td style={{ padding:"11px 16px", fontSize:12.5, color:"#374151" }}>{log.subject}</td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#94a3b8" }}>{fmtDate(log.sentAt)}</td>
                <td style={{ padding:"11px 16px" }}><span style={{ fontSize:11, fontWeight:700, background:"#f0fdf4", color:"#166534", padding:"2px 9px", borderRadius:20 }}>{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN INBOX PAGE
══════════════════════════════════ */
export default function InboxPage() {
  const { inboxItems, approveInboxItem, rejectInboxItem } = useApp();
  const [mainTab,  setMainTab]  = useState("requests"); // "requests" | "email"
  const [statusF,  setStatusF]  = useState("pending");
  const [typeF,    setTypeF]    = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [quickAction, setQuickAction] = useState(null); // { itemId, type: "approve"|"reject" }

  const counts = {
    pending:  (inboxItems||[]).filter(i=>i.status==="pending").length,
    approved: (inboxItems||[]).filter(i=>i.status==="approved").length,
    rejected: (inboxItems||[]).filter(i=>i.status==="rejected").length,
  };

  const filtered = useMemo(()=>(inboxItems||[]).filter(i=>{
    const mS = statusF==="all" || i.status===statusF;
    const mT = typeF==="all"   || i.type===typeF;
    const q  = search.toLowerCase();
    const mQ = !q || i.title?.toLowerCase().includes(q) || i.refNo?.toLowerCase().includes(q);
    return mS && mT && mQ;
  }),[inboxItems,statusF,typeF,search]);

  function handleRowClick(item, action) {
    if (action === "approve") {
      setSelected(item);
      // open panel with approve tab preselected
    } else if (action === "reject") {
      setSelected(item);
    } else {
      setSelected(s => s?.id === item.id ? null : item);
    }
  }

  function handleApprove(id, note)   { approveInboxItem(id, note);   setSelected(null); }
  function handleReject(id, reason)  { rejectInboxItem(id, reason);  setSelected(null); }

  // Stat card config — matches pm-stat-card style from dashboard
  const STAT_CARDS = [
    { label:"Pending Action", value:counts.pending,  icon:"bell",  iconBg:"#fffbeb", iconColor:"#f59e0b", topBorder:"#f59e0b" },
    { label:"Approved",       value:counts.approved, icon:"check", iconBg:"#f0fdf4", iconColor:"#10b981", topBorder:"#10b981" },
    { label:"Rejected",       value:counts.rejected, icon:"close", iconBg:"#fef2f2", iconColor:"#ef4444", topBorder:"#ef4444" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <UniversalTopbar moduleTitle="Approvals Inbox" accentColor={ACCENT} />

      <div style={{ flex:1, overflowY:"auto", background:"#f8fafc" }}>
        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Page title */}
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", margin:0 }}>My Inbox</h2>
            <p style={{ fontSize:12.5, color:"#94a3b8", margin:"3px 0 0" }}>Approval requests assigned to you across all modules</p>
          </div>

          {/* Stat cards — 3 cards, same style as pm-stat-card */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {STAT_CARDS.map(s=>(
              <div key={s.label}
                onClick={()=>setStatusF(s.label==="Pending Action"?"pending":s.label.toLowerCase())}
                style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"box-shadow 0.15s, transform 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.06)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:s.iconBg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name={s.icon} size={17} color={s.iconColor} />
                  </div>
                </div>
                <div style={{ fontSize:24, fontWeight:700, color:"#0f172a", letterSpacing:"-0.025em", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Main tab bar */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e9ecef", overflow:"hidden" }}>
            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:"1px solid #f1f5f9", padding:"0 18px" }}>
              {[["requests","Approval Requests"],["email","Email Log"]].map(([id,label])=>(
                <button key={id} onClick={()=>setMainTab(id)}
                  style={{ padding:"12px 16px", fontSize:13.5, fontWeight: mainTab===id?700:500, color: mainTab===id?ACCENT:"#6b7280", background:"none", border:"none", borderBottom:`2px solid ${mainTab===id?ACCENT:"transparent"}`, cursor:"pointer", marginBottom:-1, transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>

            {mainTab === "email" ? (
              <EmailLog items={inboxItems} />
            ) : (
              <div style={{ display:"flex", minHeight:400 }}>
                {/* Left: list */}
                <div style={{ flex:1, minWidth:0 }}>
                  {/* Filters row */}
                  <div style={{ padding:"12px 18px", borderBottom:"1px solid #f8fafc", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 11px", width:200 }}>
                      <Icon name="search" size={13} color="#94a3b8" />
                      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                        style={{ border:"none", background:"transparent", fontSize:12.5, outline:"none", flex:1, color:"#374151" }} />
                    </div>
                    {/* Status filter — dark active pill like reference */}
                    <div style={{ display:"flex", gap:4 }}>
                      {[["all","All"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setStatusF(v)}
                          style={{ padding:"5px 13px", borderRadius:20, border:"none", fontSize:12.5, fontWeight:600, cursor:"pointer", background: statusF===v?ACCENT:"#fff", color: statusF===v?"#fff":"#6b7280", border: statusF===v?"none":"1px solid #e2e8f0", transition:"all 0.12s" }}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {/* Type filter */}
                    <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
                      {[["all","All"],["PR_APPROVAL","PR"],["PO_APPROVAL","PO"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setTypeF(v)}
                          style={{ padding:"5px 13px", borderRadius:20, border:"none", fontSize:12.5, fontWeight:600, cursor:"pointer", background: typeF===v?ACCENT:"#fff", color: typeF===v?"#fff":"#6b7280", border: typeF===v?"none":"1px solid #e2e8f0", transition:"all 0.12s" }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ overflowY:"auto" }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding:"48px 20px", textAlign:"center" }}>
                        <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#374151" }}>No items found</div>
                        <div style={{ fontSize:12.5, color:"#94a3b8", marginTop:4 }}>Try a different filter</div>
                      </div>
                    ) : filtered.map(item=>(
                      <InboxRow key={item.id} item={item} selected={selected} onClick={(action)=>handleRowClick(item, action)} />
                    ))}
                  </div>
                </div>

                {/* Right: detail panel */}
                {selected && (
                  <DetailPanel
                    item={selected}
                    onClose={()=>setSelected(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
