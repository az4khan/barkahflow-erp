// ─── BarkahFlow ERP — POS Module ─────────────────────────────────────────────
// Route: /pos/*

import { Suspense, lazy, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import { POS_NAV, PAGE_TITLE }       from './posConstants';
import '../../styles/globals.css';
import '../purchase/Purchase.css';

export const ACCENT = '#f97316';

const POSTerminal  = lazy(() => import('./pages/POSTerminal'));
const POSSessions  = lazy(() => import('./pages/POSSessions'));
const POSReceipts  = lazy(() => import('./pages/POSReceipts'));
const POSRefunds   = lazy(() => import('./pages/POSRefunds'));
const POSSummary   = lazy(() => import('./pages/POSSummary'));
const POSReports   = lazy(() => import('./pages/POSReports'));

export default function POSApp() {
  const { currentUser, logout, posSessions, posTerminals } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const activeSeg  = pathname.replace(/^\/pos\/?/, '').split('/')[0] || '';
  const openShifts = (posSessions||[]).filter(s=>s.status==='open').length;

  function renderPage() {
    switch(activeSeg) {
      case '':          return <POSTerminal />;
      case 'sessions':  return <POSSessions />;
      case 'receipts':  return <POSReceipts />;
      case 'refunds':   return <POSRefunds />;
      case 'summary':   return <POSSummary />;
      case 'posreports':return <POSReports />;
      default:          return <POSTerminal />;
    }
  }

  // POS terminal page needs full height (no topbar overflow)
  const isTerminal = activeSeg === '';

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',overflow:'hidden',background:'#f8fafc'}}>
      <ModuleSidebar
        accent="#3b82f6"
        moduleLabel="Point of Sale"
        moduleIcon="store"
        nav={POS_NAV}
        activeSeg={activeSeg}
        basePath="/pos"
      />

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <UniversalTopbar variant="light" moduleTitle="POS" pageTitle={PAGE_TITLE[activeSeg]||'POS'} accentColor={ACCENT}/>
        <div style={{flex:1,overflow:isTerminal?'hidden':'auto'}}>
          <Suspense fallback={<LoadingScreen/>}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}
