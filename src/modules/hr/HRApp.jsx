// ─── BarkahFlow ERP — HR Module ───────────────────────────────────────────────
// Route: /hr/*  — Employees, Payroll, Attendance, Leaves, Loans, Reports

import { Suspense, lazy, useState } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import { useApp }                    from '../../context/AppContext';
import Icon                          from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar               from '../../components/common/UniversalTopbar';
import LoadingScreen                 from '../../components/ui/LoadingScreen';
import { HR_NAV, PAGE_TITLE }        from './hrConstants';
import '../../styles/globals.css';
import '../purchase/Purchase.css';

export const ACCENT = '#8b5cf6';

const HRDashboard      = lazy(() => import('./pages/HRDashboard'));
const HREmployees      = lazy(() => import('./pages/HREmployees'));
const HRDepartments    = lazy(() => import('./pages/HRDepartments'));
const HRDesignations   = lazy(() => import('./pages/HRDesignations'));
const HRAttendance     = lazy(() => import('./pages/HRAttendance'));
const HRLeaves         = lazy(() => import('./pages/HRLeaves'));
const HRSalaryStructure= lazy(() => import('./pages/HRSalaryStructure'));
const HRPayrollPeriods = lazy(() => import('./pages/HRPayrollPeriods'));
const HRPayroll        = lazy(() => import('./pages/HRPayroll'));
const HRSalarySlips    = lazy(() => import('./pages/HRSalarySlips'));
const HRLoans          = lazy(() => import('./pages/HRLoans'));
const HREobi           = lazy(() => import('./pages/HREobi'));
const HRGratuity       = lazy(() => import('./pages/HRGratuity'));
const HRFinalSettlement= lazy(() => import('./pages/HRFinalSettlement'));
const HRPayReports     = lazy(() => import('./pages/HRPayReports'));
const HRHeadcount      = lazy(() => import('./pages/HRHeadcount'));

export default function HRApp() {
  const { currentUser, logout, leaves, payrollPeriods } = useApp();
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const activeSeg = pathname.replace(/^\/hr\/?/, '').split('/')[0] || '';

  const pendingLeaves = (leaves||[]).filter(l=>l.status==='pending').length;
  const openPeriods   = (payrollPeriods||[]).filter(p=>['open','processing'].includes(p.status)).length;

  function renderPage() {
    switch(activeSeg) {
      case '':               return <HRDashboard />;
      case 'employees':      return <HREmployees />;
      case 'departments':    return <HRDepartments />;
      case 'designations':   return <HRDesignations />;
      case 'attendance':     return <HRAttendance />;
      case 'leaves':         return <HRLeaves />;
      case 'salarystructure':return <HRSalaryStructure />;
      case 'periods':        return <HRPayrollPeriods />;
      case 'payroll':        return <HRPayroll />;
      case 'slips':          return <HRSalarySlips />;
      case 'loans':          return <HRLoans />;
      case 'eobi':           return <HREobi />;
      case 'gratuity':       return <HRGratuity />;
      case 'settlement':     return <HRFinalSettlement />;
      case 'payreports':     return <HRPayReports />;
      case 'headcount':      return <HRHeadcount />;
      default:               return <HRDashboard />;
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',width:'100%',overflow:'hidden',background:'#f8fafc'}}>
      <ModuleSidebar
        accent="#8b5cf6"
        moduleLabel="Human Resources"
        moduleIcon="users"
        nav={HR_NAV}
        activeSeg={activeSeg}
        basePath="/hr"
      />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <UniversalTopbar variant="light" moduleTitle="HR" pageTitle={PAGE_TITLE[activeSeg]||'HR'} accentColor={ACCENT}/>
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
          <Suspense fallback={<LoadingScreen/>}>{renderPage()}</Suspense>
        </div>
      </div>
    </div>
  );
}
