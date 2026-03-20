// ─── BarkahFlow ERP — Accounting Module ──────────────────────────────────────
// Route: /accounting/*  —  data lives in AppContext, pages use useApp()

import { Suspense, lazy }           from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp }                   from '../../context/AppContext';
import Icon                         from '../../components/common/Icon';
import ModuleSidebar            from '../../components/common/ModuleSidebar';
import UniversalTopbar              from '../../components/common/UniversalTopbar';
import LoadingScreen                from '../../components/ui/LoadingScreen';
import { useState }                 from 'react';
// Named-export pages (cannot be lazy without default export)
import { ACAccountsReceivable, ACAccountsPayable }                             from './pages/ACARandAP';
import { ACTrialBalance, ACProfitLoss, ACBalanceSheet, ACBankReconciliation }  from './pages/ACReports';
import { ACCostCenters, ACTaxManagement }                                       from './pages/ACMasterData';
import './Accounting.css';
import '../../styles/globals.css';

export const ACCENT = '#0d9488';

// Default-export pages — lazy loaded
const ACDashboard       = lazy(() => import('./pages/ACDashboard'));
const ACChartOfAccounts = lazy(() => import('./pages/ACChartOfAccounts'));
const ACJournalEntries  = lazy(() => import('./pages/ACJournalEntries'));
const ACVouchers        = lazy(() => import('./pages/ACVouchers'));

const AC_NAV = [
  { divider: true,  label: 'OVERVIEW' },
  { id: 'dashboard',    path: '',             icon: 'dashboard',  label: 'Dashboard'           },
  { divider: true,  label: 'MASTER DATA' },
  { id: 'coa',          path: 'coa',          icon: 'list',       label: 'Chart of Accounts'   },
  { id: 'cost-centers', path: 'cost-centers', icon: 'building',   label: 'Cost Centers'        },
  { id: 'tax',          path: 'tax',          icon: 'calculator', label: 'Tax Management'      },
  { divider: true,  label: 'TRANSACTIONS' },
  { id: 'journal',      path: 'journal',      icon: 'reports',    label: 'Journal Entries'     },
  { id: 'vouchers',     path: 'vouchers',     icon: 'invoice',    label: 'Vouchers'            },
  { id: 'ar',           path: 'ar',           icon: 'breakdown',  label: 'Accounts Receivable' },
  { id: 'ap',           path: 'ap',           icon: 'cart',       label: 'Accounts Payable'    },
  { divider: true,  label: 'REPORTS' },
  { id: 'trial',        path: 'trial',        icon: 'briefcase',  label: 'Trial Balance'       },
  { id: 'pl',           path: 'pl',           icon: 'trending',   label: 'Profit & Loss'       },
  { id: 'bs',           path: 'bs',           icon: 'box',        label: 'Balance Sheet'       },
  { id: 'bank',         path: 'bank',         icon: 'database',   label: 'Bank Reconciliation' },
];

const PAGE_TITLE = {
  '':             'Dashboard',          'coa':    'Chart of Accounts',
  'cost-centers': 'Cost Centers',       'tax':    'Tax Management',
  'journal':      'Journal Entries',    'vouchers':'Vouchers',
  'ar':           'Accounts Receivable','ap':     'Accounts Payable',
  'trial':        'Trial Balance',      'pl':     'Profit & Loss',
  'bs':           'Balance Sheet',      'bank':   'Bank Reconciliation',
};

export default function AccountingApp() {
  const { currentUser, logout } = useApp();
  const navigate      = useNavigate();
  const { pathname }  = useLocation();

  const activeSeg = pathname.replace(/^\/accounting\/?/, '').split('/')[0] || '';

  function renderPage() {
    switch (activeSeg) {
      case '':             return <ACDashboard />;
      case 'coa':          return <ACChartOfAccounts />;
      case 'journal':      return <ACJournalEntries />;
      case 'vouchers':     return <ACVouchers />;
      case 'ar':           return <ACAccountsReceivable />;
      case 'ap':           return <ACAccountsPayable />;
      case 'trial':        return <ACTrialBalance />;
      case 'pl':           return <ACProfitLoss />;
      case 'bs':           return <ACBalanceSheet />;
      case 'bank':         return <ACBankReconciliation />;
      case 'cost-centers': return <ACCostCenters />;
      case 'tax':          return <ACTaxManagement />;
      default:             return <ACDashboard />;
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden', background:'#f8fafc' }}>

      <ModuleSidebar
        accent="#0d9488"
        moduleLabel="Accounting"
        moduleIcon="briefcase"
        nav={AC_NAV}
        activeSeg={activeSeg}
        basePath="/accounting"
      />

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <UniversalTopbar variant="light" moduleTitle="Accounting" pageTitle={PAGE_TITLE[activeSeg]||'Accounting'} accentColor={ACCENT}/>
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          <Suspense fallback={<LoadingScreen/>}>
            {renderPage()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
