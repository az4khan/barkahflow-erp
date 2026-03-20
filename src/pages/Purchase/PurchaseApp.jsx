import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AppTopbar } from "../../components/common/Layout";
import Icon from "../../components/common/Icon";
import { PM_NAV, ACCENT } from "./purchaseConstants";

import PMDashboard        from "./PMDashboard";
import NewPurchase        from "./NewPurchase";
import PurchaseList       from "./PurchaseList";
import PMSuppliers        from "./PMSuppliers";
import PMProducts         from "./PMProducts";
import LandedCost         from "./LandedCost";
import CostBreakdown      from "./CostBreakdown";
import PMReports          from "./PMReports";
import PRRequisition      from "./PRRequisition";
import PRApproval         from "./PRApproval";
import SupplierQuotation  from "./SupplierQuotation";
import QuotationComparison from "./QuotationComparison";
import PurchaseOrderPage  from "./PurchaseOrderPage";
import GoodsReceipt       from "./GoodsReceipt";
import ApprovalStrategy   from "./ApprovalStrategy";

import "../../styles/globals.css";
import "./Purchase.css";

export default function PurchaseApp({ onHome }) {
  const { currentUser, logout, purchases: ctxP, suppliers: ctxS, products: ctxPr, toast } = useApp();

  const [nav, setNav]             = useState("pm-dashboard");
  const [purchases, setPurchases] = useState(ctxP);
  const [suppliers, setSuppliers] = useState(ctxS);
  const [products,  setProducts]  = useState(ctxPr);
  const [editPO,    setEditPO]    = useState(null);

  const handleEditPO = (po) => { setEditPO(po); setNav("new-purchase"); };
  const handleSavePO = (form) => {
    const parsed = {
      ...form,
      qty:            Number(form.qty),
      unitPrice:      Number(form.unitPrice),
      transportation: Number(form.transportation) || 0,
      customs:        Number(form.customs)        || 0,
      brokerage:      Number(form.brokerage)      || 0,
      loading:        Number(form.loading)        || 0,
      port:           Number(form.port)           || 0,
      misc:           Number(form.misc)           || 0,
    };
    if (editPO) setPurchases(ps => ps.map(p => p.id === editPO.id ? { ...p, ...parsed } : p));
    else        setPurchases(ps => [...ps, { ...parsed, id: `PO-00${ps.length + 1}` }]);
    setEditPO(null);
    setNav("purchase-list");
  };

  const currentPageLabel = PM_NAV.find(n => !n.divider && n.id === nav)?.label || "Dashboard";

  const [collapsed, setCollapsed] = useState(false);
  const SW = collapsed ? 56 : 216; // sidebar width

  const renderPage = () => {
    switch (nav) {
      case "pm-dashboard":         return <PMDashboard        purchases={purchases} onNav={setNav} />;
      case "pr-requisition":       return <PRRequisition      onNav={setNav} />;
      case "pr-approval":          return <PRApproval         onNav={setNav} />;
      case "supplier-quotation":   return <SupplierQuotation  onNav={setNav} />;
      case "quotation-comparison": return <QuotationComparison onNav={setNav} />;
      case "purchase-order":       return <PurchaseOrderPage  onNav={setNav} />;
      case "goods-receipt":        return <GoodsReceipt       onNav={setNav} />;
      case "approval-strategy":    return <ApprovalStrategy />;
      case "new-purchase":         return <NewPurchase        suppliers={suppliers} products={products} onSave={handleSavePO} editData={editPO} onCancel={() => { setEditPO(null); setNav("purchase-list"); }} toastFn={(m,t) => toast(m,t)} />;
      case "purchase-list":        return <PurchaseList       purchases={purchases} onEdit={handleEditPO} onDelete={id => setPurchases(ps => ps.filter(p => p.id !== id))} onNav={setNav} toastFn={(m,t) => toast(m,t)} />;
      case "pm-suppliers":         return <PMSuppliers        suppliers={suppliers} setSuppliers={setSuppliers} toastFn={(m,t) => toast(m,t)} />;
      case "pm-products":          return <PMProducts         products={products}   setProducts={setProducts}   toastFn={(m,t) => toast(m,t)} />;
      case "landed-cost":          return <LandedCost         purchases={purchases} />;
      case "cost-breakdown":       return <CostBreakdown      purchases={purchases} />;
      case "pm-reports":           return <PMReports          purchases={purchases} />;
      default: return null;
    }
  };

  // ── Shell uses INLINE styles so layout can never be broken by CSS cascade ──
  return (
    <div style={{ display:"flex", flexDirection:"row", height:"100vh", width:"100%", overflow:"hidden", background:"#f8fafc" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:SW, minWidth:SW, flexShrink:0, height:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", overflow:"hidden", transition:"width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Logo row */}
        <div style={{ padding:"0 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, height:64, overflow:"hidden", flexShrink:0 }}>
          {collapsed ? (
            /* Collapsed: just the toggle button centered */
            <button onClick={() => setCollapsed(false)} title="Expand sidebar"
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"8px 0", borderRadius:8, color:"rgba(255,255,255,0.6)", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            /* Expanded: logo + text + collapse button */
            <>
              <div style={{ width:32, height:32, borderRadius:9, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="fire" size={17} color="#fff" />
              </div>
              <div style={{ flex:1, minWidth:0, overflow:"hidden" }}>
                <div style={{ fontSize:13.5, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>BarkahFlow</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:500, marginTop:1 }}>Management ERP</div>
              </div>
              <button onClick={() => setCollapsed(true)} title="Collapse sidebar"
                style={{ background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", padding:"5px 6px", borderRadius:7, color:"rgba(255,255,255,0.45)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* User chip */}
        {!collapsed ? (
          <div style={{ padding:"10px 14px 8px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:ACCENT, flexShrink:0 }} />
            <span style={{ fontSize:12.5, fontWeight:600, color:ACCENT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {currentUser?.name}
            </span>
          </div>
        ) : <div style={{ height:6 }} />}

        {/* Nav */}
        <nav style={{ flex:1, padding:"4px 8px", overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", gap:1 }}>
          {PM_NAV.map((item, idx) => {
            if (item.divider) {
              if (collapsed) return <div key={idx} style={{ margin:"5px 4px", borderTop:"1px solid rgba(255,255,255,0.08)" }} />;
              return <div key={idx} style={{ padding:"10px 10px 4px", fontSize:9.5, fontWeight:700, color:"rgba(255,255,255,0.2)", textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{item.label}</div>;
            }
            const isActive = nav === item.id;
            return (
              <button key={item.id} onClick={() => setNav(item.id)} title={collapsed ? item.label : undefined}
                style={{ display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 9, padding: collapsed ? "9px 0" : "8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.45)", background: isActive ? ACCENT : "transparent", transition:"all 0.15s ease", width:"100%" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.75)"; }}}
                onMouseLeave={e => { e.currentTarget.style.background=isActive?ACCENT:"transparent"; e.currentTarget.style.color=isActive?"#fff":"rgba(255,255,255,0.45)"; }}
              >
                <Icon name={item.icon} size={15} color={isActive ? "#fff" : "rgba(255,255,255,0.4)"} />
                {!collapsed && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding:"8px 8px 12px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onHome} title={collapsed ? "Home" : undefined}
            style={{ display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 9, padding: collapsed ? "9px 0" : "8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, color:"rgba(255,255,255,0.4)", background:"transparent", width:"100%" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
          >
            <Icon name="home" size={14} color="rgba(255,255,255,0.4)" />
            {!collapsed && <span>Home</span>}
          </button>
          <button onClick={logout} title={collapsed ? "Sign Out" : undefined}
            style={{ display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 9, padding: collapsed ? "9px 0" : "8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12.5, color:"rgba(255,255,255,0.4)", background:"transparent", width:"100%" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(220,38,38,0.12)"; e.currentTarget.style.color="#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
          >
            <Icon name="logout" size={14} color="rgba(255,255,255,0.4)" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        <AppTopbar
          title="Purchase Management"
          subtitle={currentPageLabel}
          accentColor={ACCENT}
          currentUser={currentUser}
          onHome={onHome}
          onLogout={logout}
          onNav={setNav}
          onNavigate={(dest, sub) => {
            if (dest === "purchase" && sub) { setNav(sub); }
            else if (onHome) { onHome(dest); }
          }}
        />

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
