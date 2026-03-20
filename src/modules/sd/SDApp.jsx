// ─── BarkahFlow ERP — Sales & Distribution Module ────────────────────────────
// Route: /sd/*  —  SO → DO → Invoice with tier pricing, commission, credit ctrl

import { Suspense, lazy, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import { SD_NAV, PAGE_TITLE }        from './sdConstants';
import '../../styles/globals.css';
import '../purchase/Purchase.css';

export const ACCENT = '#10b981';

const SDDashboard     = lazy(() => import('./pages/SDDashboard'));
const SDPartyMaster   = lazy(() => import('./pages/SDPartyMaster'));
const SDSalesOrders   = lazy(() => import('./pages/SDSalesOrders'));
const SDDeliveryOrders= lazy(() => import('./pages/SDDeliveryOrders'));
const SDSalesInvoices = lazy(() => import('./pages/SDSalesInvoices'));
const SDPriceLists    = lazy(() => import('./pages/SDPriceLists'));
const SDDiscounts     = lazy(() => import('./pages/SDDiscounts'));
const SDIntercompany  = lazy(() => import('./pages/SDIntercompany'));
const SDReturns       = lazy(() => import('./pages/SDReturns'));
const SDClaims        = lazy(() => import('./pages/SDClaims'));
const SDPartyLedger   = lazy(() => import('./pages/SDPartyLedger'));
const SDCollections   = lazy(() => import('./pages/SDCollections'));
const SDReps          = lazy(() => import('./pages/SDReps'));
const SDCommission    = lazy(() => import('./pages/SDCommission'));
const SDSalesReports  = lazy(() => import('./pages/SDSalesReports'));
const SDCreditControl = lazy(() => import('./pages/SDCreditControl'));

export default function SDApp() {
  const { currentUser, logout, salesOrders, sdParties } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const activeSeg = pathname.replace(/^\/sd\/?/, '').split('/')[0] || '';

  // Badge: open SOs needing action
  const pendingAction = (salesOrders||[]).filter(s=>['draft','approved'].includes(s.status)).length;

  function renderPage() {
    switch(activeSeg) {
      case '':             return <SDDashboard />;
      case 'parties':      return <SDPartyMaster />;
      case 'pricelists':   return <SDPriceLists />;
      case 'discounts':    return <SDDiscounts />;
      case 'orders':       return <SDSalesOrders />;
      case 'delivery':     return <SDDeliveryOrders />;
      case 'invoices':     return <SDSalesInvoices />;
      case 'interco':      return <SDIntercompany />;
      case 'returns':      return <SDReturns />;
      case 'claims':       return <SDClaims />;
      case 'ledger':       return <SDPartyLedger />;
      case 'collections':  return <SDCollections />;
      case 'reps':         return <SDReps />;
      case 'commission':   return <SDCommission />;
      case 'salesreports': return <SDSalesReports />;
      case 'creditctrl':   return <SDCreditControl />;
      default:             return <SDDashboard />;
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',overflow:'hidden',background:'#f8fafc'}}>
      <ModuleSidebar
        accent="#10b981"
        moduleLabel="Sales & Distribution"
        moduleIcon="trending"
        nav={SD_NAV}
        activeSeg={activeSeg}
        basePath="/sd"
      />

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <UniversalTopbar variant="light" moduleTitle="Sales & Distribution" pageTitle={PAGE_TITLE[activeSeg]||'S&D'} accentColor={ACCENT}/>
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
          <Suspense fallback={<LoadingScreen/>}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}
