// ─── BarkahFlow ERP — Distribution Module ────────────────────────────────────
// Route: /dist/*  —  Fleet, Load Orders, Trips, Settlement, Reports

import { Suspense, lazy, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import { DIST_NAV, PAGE_TITLE }      from './distConstants';
import '../../styles/globals.css';
import '../purchase/Purchase.css';

export const ACCENT = '#ef4444';

const DistDashboard    = lazy(() => import('./pages/DistDashboard'));
const DistRoutes       = lazy(() => import('./pages/DistRoutes'));
const DistVehicles     = lazy(() => import('./pages/DistVehicles'));
const DistDrivers      = lazy(() => import('./pages/DistDrivers'));
const DistLoadOrders   = lazy(() => import('./pages/DistLoadOrders'));
const DistTrips        = lazy(() => import('./pages/DistTrips'));
const DistDelivery     = lazy(() => import('./pages/DistDelivery'));
const DistEmpties      = lazy(() => import('./pages/DistEmpties'));
const DistTripSettlement = lazy(() => import('./pages/DistTripSettlement'));
const DistMaintenance  = lazy(() => import('./pages/DistMaintenance'));
const DistFuelLog      = lazy(() => import('./pages/DistFuelLog'));
const DistSchedule     = lazy(() => import('./pages/DistSchedule'));
const DistCapacity     = lazy(() => import('./pages/DistCapacity'));
const DistTripReports  = lazy(() => import('./pages/DistTripReports'));
const DistPerformance  = lazy(() => import('./pages/DistPerformance'));

export default function DistApp() {
  const { currentUser, logout, trips } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const activeSeg = pathname.replace(/^\/dist\/?/, '').split('/')[0] || '';

  const pendingSettle = (trips||[]).filter(t=>t.status==='returning').length;
  const inTransit     = (trips||[]).filter(t=>t.status==='in_transit').length;

  function renderPage() {
    switch(activeSeg) {
      case '':           return <DistDashboard />;
      case 'routes':     return <DistRoutes />;
      case 'vehicles':   return <DistVehicles />;
      case 'drivers':    return <DistDrivers />;
      case 'loadorders': return <DistLoadOrders />;
      case 'trips':      return <DistTrips />;
      case 'delivery':   return <DistDelivery />;
      case 'empties':    return <DistEmpties />;
      case 'settlement': return <DistTripSettlement />;
      case 'maintenance':return <DistMaintenance />;
      case 'fuel':       return <DistFuelLog />;
      case 'schedule':   return <DistSchedule />;
      case 'capacity':   return <DistCapacity />;
      case 'tripreports':return <DistTripReports />;
      case 'performance':return <DistPerformance />;
      default:           return <DistDashboard />;
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',overflow:'hidden',background:'#f8fafc'}}>
      <ModuleSidebar
        accent="#ef4444"
        moduleLabel="Distribution"
        moduleIcon="truck"
        nav={DIST_NAV}
        activeSeg={activeSeg}
        basePath="/dist"
      />

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <UniversalTopbar variant="light" moduleTitle="Distribution" pageTitle={PAGE_TITLE[activeSeg]||'Distribution'} accentColor={ACCENT}/>
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
          <Suspense fallback={<LoadingScreen/>}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}
