// ─── BarkahFlow ERP — Inventory Module ───────────────────────────────────────
// Route: /inventory/*  —  Moving Average Price (MAP) valuation, SAP-style

import { Suspense, lazy, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import { INV_NAV, PAGE_TITLE }       from './inventoryConstants';
import '../../styles/globals.css';
import '../purchase/Purchase.css';

export const ACCENT = '#0ea5e9';

// Sprint 1 pages
const INVDashboard    = lazy(() => import('./pages/INVDashboard'));
const INVMaterials    = lazy(() => import('./pages/INVMaterials'));
const INVWarehouses   = lazy(() => import('./pages/INVWarehouses'));
// Sprint 2 pages
const INVStockOverview   = lazy(() => import('./pages/INVStockOverview'));
const INVGoodsReceipt    = lazy(() => import('./pages/INVGoodsReceipt'));
const INVGoodsIssue      = lazy(() => import('./pages/INVGoodsIssue'));
const INVStockTransfer   = lazy(() => import('./pages/INVStockTransfer'));
const INVStockAdjustment = lazy(() => import('./pages/INVStockAdjustment'));
const INVOpeningStock    = lazy(() => import('./pages/INVOpeningStock'));

// Sprint 3 — Report pages
const INVStockLedger  = lazy(() => import('./pages/INVStockLedger'));
const INVValuation    = lazy(() => import('./pages/INVValuation'));
const INVReorder      = lazy(() => import('./pages/INVReorder'));

// No more placeholders
function ComingSoon({ page }) {
  return (
    <div className="pm-page">
      <div style={{ textAlign:'center', padding:'80px 40px', color:'#94a3b8' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:'#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Icon name="reports" size={28} color={ACCENT}/>
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:8 }}>{page}</div>
        <div style={{ fontSize:14 }}>Coming in Sprint 3</div>
      </div>
    </div>
  );
}

export default function InventoryApp() {
  const { currentUser, logout, invMaterials } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const activeSeg = pathname.replace(/^\/inventory\/?/, '').split('/')[0] || '';

  const lowStockCount = (invMaterials||[]).filter(m => (m.totalQty||0) <= (m.reorderPoint||0)).length;

  function renderPage() {
    switch (activeSeg) {
      case '':           return <INVDashboard />;
      case 'materials':  return <INVMaterials />;
      case 'warehouses': return <INVWarehouses />;
      case 'stock':      return <INVStockOverview />;
      case 'receipt':    return <INVGoodsReceipt />;
      case 'issue':      return <INVGoodsIssue />;
      case 'transfer':   return <INVStockTransfer />;
      case 'adjustment': return <INVStockAdjustment />;
      case 'opening':    return <INVOpeningStock />;
      case 'ledger':     return <INVStockLedger />;
      case 'valuation':  return <INVValuation />;
      case 'reorder':    return <INVReorder />;
      default:           return <INVDashboard />;
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden', background:'#f8fafc' }}>

      <ModuleSidebar
        accent="#f59e0b"
        moduleLabel="Inventory"
        moduleIcon="box"
        nav={INV_NAV}
        activeSeg={activeSeg}
        basePath="/inventory"
      />

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <UniversalTopbar variant="light" moduleTitle="Inventory" pageTitle={PAGE_TITLE[activeSeg]||'Inventory'} accentColor={ACCENT}/>
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          <Suspense fallback={<LoadingScreen/>}>
            {renderPage()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
