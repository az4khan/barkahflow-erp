// ─── BarkahFlow ERP — Purchase Module ────────────────────────────────────────
// Route: /purchase/*

import { useState, Suspense, lazy } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import '../../styles/globals.css';
import './Purchase.css';

export const ACCENT = '#f97316';

const PM_NAV = [
  { divider:true,  label:'PROCUREMENT FLOW' },
  { id:'dashboard', path:'',         icon:'dashboard', label:'Dashboard'            },
  { id:'pr',        path:'pr',       icon:'list',      label:'Purchase Requisition' },
  { id:'rfq',       path:'rfq',      icon:'invoice',   label:'Supplier Quotation'   },
  { id:'qc',        path:'qc',       icon:'comparison',label:'Quotation Comparison' },
  { id:'po',        path:'po',       icon:'purchase',  label:'Purchase Order'       },
  { id:'grn',       path:'grn',      icon:'box',       label:'Goods Receipt'        },
  { id:'approval',  path:'approval', icon:'shield',    label:'Approval Strategy'    },
  { divider:true,  label:'MANAGEMENT' },
  { id:'direct',    path:'direct',   icon:'cart',      label:'Direct Purchase'      },
  { id:'list',      path:'list',     icon:'file',      label:'Purchase List'        },
  { id:'suppliers', path:'suppliers',icon:'building',  label:'Suppliers'            },
  { id:'materials', path:'materials',icon:'products',  label:'Materials'            },
  { id:'reports',   path:'reports',  icon:'reports',   label:'Purchase Reports'     },
];

const PAGE_TITLE = {
  '':          'Dashboard',           'pr':        'Purchase Requisition',
  'rfq':       'Supplier Quotation',  'qc':        'Quotation Comparison',
  'po':        'Purchase Order',      'grn':       'Goods Receipt',
  'direct':    'Direct Purchase',     'list':      'Purchase List',
  'suppliers': 'Suppliers',           'materials': 'Materials',
  'approval':  'Approval Strategy',   'reports':   'Purchase Reports',
};

// ── Lazy pages ────────────────────────────────────────────────────────────────
const PMDashboard          = lazy(() => import('./pages/PMDashboard'));
const PRPage               = lazy(() => import('./pages/PRPage'));
const RFQPage              = lazy(() => import('./pages/RFQPage'));
const QCPage               = lazy(() => import('./pages/QCPage'));
const POPage               = lazy(() => import('./pages/POPage'));
const GRNPage              = lazy(() => import('./pages/GRNPage'));
const DirectPurchasePage   = lazy(() => import('./pages/DirectPurchasePage'));
const PurchaseListPage     = lazy(() => import('./pages/PurchaseListPage'));
const SuppliersPage        = lazy(() => import('./pages/SuppliersPage'));
const MaterialsPage        = lazy(() => import('./pages/MaterialsPage'));
const ApprovalStrategyPage = lazy(() => import('./pages/ApprovalStrategyPage'));
const PMReports            = lazy(() => import('./pages/PMReports'));

export default function PurchaseApp() {
  const { currentUser, logout, inboxItems } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  // Derive active segment from URL: /purchase/pr → 'pr', /purchase → ''
  const activeSeg = pathname.replace(/^\/purchase\/?/, '').split('/')[0] || '';

  function renderPage() {
    switch (activeSeg) {
      case '':          return <PMDashboard />;
      case 'pr':        return <PRPage />;
      case 'rfq':       return <RFQPage />;
      case 'qc':        return <QCPage />;
      case 'po':        return <POPage />;
      case 'grn':       return <GRNPage />;
      case 'direct':    return <DirectPurchasePage />;
      case 'list':      return <PurchaseListPage />;
      case 'suppliers': return <SuppliersPage />;
      case 'materials': return <MaterialsPage />;
      case 'approval':  return <ApprovalStrategyPage />;
      case 'reports':   return <PMReports />;
      default:          return <PMDashboard />;
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',overflow:'hidden',background:'#f8fafc'}}>

      <ModuleSidebar
        accent={ACCENT}
        moduleLabel="Purchase"
        moduleIcon="purchase"
        nav={PM_NAV}
        activeSeg={activeSeg}
        basePath="/purchase"
        badges={{ pr:(inboxItems||[]).filter(i=>i.status==='pending'&&i.type==='PR_APPROVAL').length, po:(inboxItems||[]).filter(i=>i.status==='pending'&&i.type==='PO_APPROVAL').length }}
      />

      {/* ── Main ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <UniversalTopbar variant="light" moduleTitle="Purchase" pageTitle={PAGE_TITLE[activeSeg]||'Dashboard'} accentColor={ACCENT}/>
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
          <Suspense fallback={<LoadingScreen/>}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}
