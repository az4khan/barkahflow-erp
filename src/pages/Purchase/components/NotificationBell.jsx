import { useState, useRef, useEffect } from "react";
import Icon from "../../../components/common/Icon";
import { ACCENT } from "../purchaseConstants";
import { useApprovals } from "../../../context/ApprovalsContext";

// ── Static role-based purchase notifications ──────────────────────────────────
const ROLE_NOTIFICATIONS = {
  "Purchase Manager": [
    { id:1,  type:"quotation",  icon:"invoice",  color:"#3b82f6", bg:"#eff6ff", title:"Quotation received from ADNOC",         sub:"RFQ-001 · LPG Cylinders 45kg · Rs 8,200/unit",                time:"1 hr ago",   read:false, nav:"supplier-quotation"  },
    { id:2,  type:"quotation",  icon:"invoice",  color:"#3b82f6", bg:"#eff6ff", title:"Quotation received from Saudi Aramco",  sub:"RFQ-002 · LPG Cylinders 11.8kg · Rs 3,150/unit",             time:"3 hr ago",   read:true,  nav:"supplier-quotation"  },
    { id:3,  type:"po",         icon:"purchase", color:"#16a34a", bg:"#f0fdf4", title:"PO-002 confirmed by ADNOC",             sub:"LPG Bulk (MT) · 3,200 units · Delivery Apr 5",                time:"Yesterday",  read:true,  nav:"purchase-order"      },
    { id:4,  type:"grn",        icon:"box",      color:"#8b5cf6", bg:"#f5f3ff", title:"Shipment received — GRN-001 complete",  sub:"Saudi Aramco · 5,000 Cylinders 45kg · Main Warehouse",        time:"2 days ago", read:true,  nav:"goods-receipt"       },
  ],
  "Administrator": [
    { id:5,  type:"system",     icon:"dashboard",color:"#64748b", bg:"#f8fafc", title:"Monthly procurement report ready",      sub:"March 2026 · Total spend Rs 165.3M",                          time:"1 hr ago",   read:false, nav:"pm-reports"          },
    { id:6,  type:"grn",        icon:"box",      color:"#8b5cf6", bg:"#f5f3ff", title:"GRN-004 pending QC inspection",         sub:"TotalEnergies · 120 MT rejected · Needs review",              time:"3 hr ago",   read:false, nav:"goods-receipt"       },
    { id:7,  type:"po",         icon:"purchase", color:"#16a34a", bg:"#f0fdf4", title:"PO-003 draft not yet sent",             sub:"Shell Gas · LPG Cylinders 11.8kg · Action needed",            time:"Yesterday",  read:true,  nav:"purchase-order"      },
  ],
  "Wholesale Sales": [
    { id:8,  type:"system",     icon:"dashboard",color:"#64748b", bg:"#f8fafc", title:"Stock update: Cylinders 45kg received", sub:"5,000 units added · Main Warehouse",                          time:"2 hr ago",   read:false, nav:"pm-dashboard"        },
    { id:9,  type:"system",     icon:"dashboard",color:"#64748b", bg:"#f8fafc", title:"LPG Bulk stock replenished",            sub:"3,150 MT received from ADNOC",                                time:"Yesterday",  read:true,  nav:"pm-dashboard"        },
  ],
};

const TYPE_LABELS = {
  approval:  "Approval",
  quotation: "Quotation",
  po:        "Purchase Order",
  grn:       "Goods Receipt",
  system:    "System",
};

export default function NotificationBell({ currentUser, onNav, onGoInbox }) {
  const { inbox, pendingCount } = useApprovals();
  const roleKey = currentUser?.role === "ROLE-001" ? "Administrator"
                : currentUser?.role === "ROLE-002" ? "Purchase Manager"
                : "Wholesale Sales";

  const initNs = ROLE_NOTIFICATIONS[roleKey] || [];

  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState(initNs);
  const [filter, setFilter] = useState("all");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Build inbox approval notifications from ApprovalsContext
  const inboxNotifs = inbox
    .filter(i => i.status === "Pending")
    .map(i => ({
      id:    `inbox-${i.id}`,
      type:  "approval",
      icon:  "check",
      color: "#f97316",
      bg:    "#fff7ed",
      title: `${i.type} ${i.refId} awaiting your approval`,
      sub:   `${i.submittedBy} · ${i.title} · ${i.priority} priority`,
      time:  i.submittedAt,
      read:  false,
      nav:   "__inbox__",   // special nav token → go to global inbox
    }));

  const allNotifs  = [...inboxNotifs, ...notifs];
  const unread     = allNotifs.filter(n => !n.read).length + pendingCount;
  const filtered   = filter === "all" ? allNotifs : allNotifs.filter(n => n.type === filter);

  const markRead    = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read:true } : n));
  const markAllRead = ()   => setNotifs(ns => ns.map(n => ({ ...n, read:true })));
  const dismiss     = (id) => setNotifs(ns => ns.filter(n => n.id !== id));

  const handleClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.nav === "__inbox__") {
      onGoInbox && onGoInbox();
    } else if (onNav && notif.nav) {
      onNav(notif.nav);
    }
  };

  const totalUnread = allNotifs.filter(n => !n.read).length;

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:34, height:34, borderRadius:9, border:"1px solid #e2e8f0", background: open ? "#f8fafc" : "#fff",
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", transition:"all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background="#fff"; }}
      >
        <Icon name="bell" size={15} color={totalUnread > 0 ? ACCENT : "#94a3b8"} />
        {totalUnread > 0 && (
          <span style={{ position:"absolute", top:5, right:5, minWidth:15, height:15, borderRadius:10,
            background:"#ef4444", border:"2px solid #fff", fontSize:9, fontWeight:800, color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:380, background:"#fff",
          borderRadius:14, boxShadow:"0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          border:"1px solid #f1f5f9", zIndex:1000, overflow:"hidden" }}>

          {/* Header */}
          <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Notifications</div>
              {totalUnread > 0 && <div style={{ fontSize:11, color:ACCENT, fontWeight:600, marginTop:1 }}>{totalUnread} unread</div>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {totalUnread > 0 && (
                <button onClick={markAllRead}
                  style={{ fontSize:11.5, fontWeight:600, color:"#64748b", background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:6 }}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Pending approvals banner — if any */}
          {inboxNotifs.length > 0 && (
            <div onClick={() => { setOpen(false); onGoInbox && onGoInbox(); }}
              style={{ padding:"10px 16px", background:"#fff7ed", borderBottom:"1px solid #fed7aa", cursor:"pointer", display:"flex", gap:10, alignItems:"center" }}
              onMouseEnter={e => e.currentTarget.style.background="#fef3c7"}
              onMouseLeave={e => e.currentTarget.style.background="#fff7ed"}>
              <div style={{ width:28, height:28, borderRadius:7, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="check" size={13} color="#fff" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:800, color:"#9a3412" }}>
                  {inboxNotifs.length} approval{inboxNotifs.length !== 1 ? "s" : ""} waiting for your action
                </div>
                <div style={{ fontSize:11, color:"#c2410c", marginTop:1 }}>Click to open Approvals Inbox →</div>
              </div>
              <span style={{ background:"#ef4444", color:"#fff", fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>
                {inboxNotifs.length}
              </span>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display:"flex", gap:4, padding:"8px 12px", borderBottom:"1px solid #f8fafc", overflowX:"auto" }}>
            {[["all","All"], ["approval","Approvals"], ["quotation","Quotations"], ["po","Orders"], ["grn","Receipts"]].map(([k,l]) => (
              <button key={k} onClick={() => setFilter(k)}
                style={{ padding:"3px 10px", borderRadius:20, border:"none", fontSize:11, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap",
                  background: filter===k ? ACCENT : "#f1f5f9", color: filter===k ? "#fff" : "#64748b" }}>
                {l}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div style={{ maxHeight:300, overflowY:"auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding:"32px 16px", textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>🔔</div>
                <div style={{ fontSize:13, color:"#94a3b8" }}>No notifications</div>
              </div>
            ) : filtered.map((n, i) => (
              <div key={n.id}
                style={{ display:"flex", gap:10, padding:"11px 16px", borderBottom: i < filtered.length-1 ? "1px solid #f8fafc" : "none",
                  background: n.read ? "#fff" : "#fefcfb", cursor:"pointer", position:"relative" }}
                onClick={() => handleClick(n)}
                onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background=n.read ? "#fff" : "#fefcfb"}
              >
                {!n.read && <span style={{ position:"absolute", left:6, top:"50%", transform:"translateY(-50%)", width:5, height:5, borderRadius:"50%", background:ACCENT }} />}

                <div style={{ width:34, height:34, borderRadius:9, background:n.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  <Icon name={n.icon} size={15} color={n.color} />
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight: n.read ? 500 : 700, color:"#0f172a", marginBottom:2, lineHeight:1.3 }}>{n.title}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.sub}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                    <span style={{ fontSize:10.5, color:"#cbd5e1" }}>{n.time}</span>
                    <span style={{ fontSize:10, background:"#f1f5f9", color:"#64748b", padding:"1px 7px", borderRadius:20, fontWeight:500 }}>
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                    {n.nav === "__inbox__" && (
                      <span style={{ fontSize:10, background:"#fff7ed", color:ACCENT, padding:"1px 7px", borderRadius:20, fontWeight:700 }}>Inbox</span>
                    )}
                  </div>
                </div>

                {typeof n.id === "number" && (
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 4px", borderRadius:4, color:"#cbd5e1", flexShrink:0, alignSelf:"flex-start", marginTop:2 }}>
                    <Icon name="close" size={12} color="currentColor" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={() => { setOpen(false); onGoInbox && onGoInbox(); }}
              style={{ fontSize:12, fontWeight:700, color:ACCENT, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              Open Approvals Inbox →
            </button>
            <button onClick={() => setNotifs([])}
              style={{ fontSize:11, color:"#cbd5e1", background:"none", border:"none", cursor:"pointer" }}>
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
