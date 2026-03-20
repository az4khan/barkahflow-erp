// ─── BarkahFlow ERP — Accounting Module Shell ────────────────────────────────
// Imports: shared Icon, UI, Layout, AppContext, mockData — no duplicates

import { useState } from "react";
import Icon           from "../../components/common/Icon";
import { AppTopbar }  from "../../components/common/Layout";
import { useApp }     from "../../context/AppContext";
import {
  fmtPKR,
  INITIAL_ACCOUNTS, INITIAL_JOURNAL, INITIAL_AR, INITIAL_AP_BILLS,
  INITIAL_VOUCHERS,  INITIAL_BANK_TX,  INITIAL_COST_CENTERS, INITIAL_TAX_RATES,
} from "../../data/mockData";
import { NAV_ITEMS, ALL_NAV, ACCENT } from "./accountingConstants";
import ACDashboard        from "./ACDashboard";
import ACChartOfAccounts  from "./ACChartOfAccounts";
import ACJournalEntries   from "./ACJournalEntries";
import ACVouchers         from "./ACVouchers";
import { ACAccountsReceivable, ACAccountsPayable } from "./ACARandAP";
import { ACTrialBalance, ACProfitLoss, ACBalanceSheet, ACBankReconciliation } from "./ACReports";
import { ACCostCenters, ACTaxManagement } from "./ACMasterData";
import "./Accounting.css";

export default function AccountingApp({ onHome }) {
  const { currentUser, logout } = useApp();

  const [nav, setNav]                 = useState("dashboard");
  const [accounts, setAccounts]       = useState(INITIAL_ACCOUNTS);
  const [journal,  setJournal]        = useState(INITIAL_JOURNAL);
  const [ar,       setAr]             = useState(INITIAL_AR);
  const [ap,       setAp]             = useState(INITIAL_AP_BILLS);
  const [vouchers, setVouchers]       = useState(INITIAL_VOUCHERS);
  const [bankTx,   setBankTx]         = useState(INITIAL_BANK_TX);
  const [costCenters, setCostCenters] = useState(INITIAL_COST_CENTERS);
  const [taxRates, setTaxRates]       = useState(INITIAL_TAX_RATES);

  const currentPage = ALL_NAV.find(n => n.id === nav);

  const renderPage = () => {
    const props = { accounts, setAccounts, journal, setJournal, ar, setAr, ap, setAp, vouchers, setVouchers, bankTx, setBankTx, costCenters, setCostCenters, taxRates, setTaxRates };
    switch (nav) {
      case "dashboard":    return <ACDashboard {...props} />;
      case "coa":          return <ACChartOfAccounts {...props} />;
      case "journal":      return <ACJournalEntries {...props} />;
      case "vouchers":     return <ACVouchers {...props} />;
      case "ar":           return <ACAccountsReceivable {...props} />;
      case "ap":           return <ACAccountsPayable {...props} />;
      case "trial":        return <ACTrialBalance {...props} />;
      case "pl":           return <ACProfitLoss {...props} />;
      case "bs":           return <ACBalanceSheet {...props} />;
      case "bank":         return <ACBankReconciliation {...props} />;
      case "cost-centers": return <ACCostCenters {...props} />;
      case "tax":          return <ACTaxManagement {...props} />;
      default:             return null;
    }
  };

  return (
    <div className="app-layout">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="ac-logo-icon">
            <Icon name="briefcase" size={16} color="#fff" />
          </div>
          <div>
            <div className="logo-name">BarkahFlow</div>
            <div className="logo-sub">Management ERP</div>
          </div>
        </div>

        <div className="ac-user-chip">
          <div style={{ width:28, height:28, borderRadius:"50%", background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>
            {currentUser?.name?.[0] || "A"}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {currentUser?.name || "System Administrator"}
            </div>
            <div style={{ fontSize:10.5, color:"#6b7280" }}>Accounting</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div style={{ fontSize:10, fontWeight:700, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.08em", padding:"10px 12px 4px" }}>
                {section.section}
              </div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item${nav === item.id ? " ac-nav-active" : ""}`}
                  onClick={() => setNav(item.id)}
                >
                  <Icon name={item.icon} size={16} color={nav === item.id ? "#fff" : "#9ca3af"} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button className="nav-item" onClick={onHome}>
            <Icon name="home" size={16} color="#9ca3af" /><span>Home</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <Icon name="logout" size={16} color="#9ca3af" /><span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="main-content">
        <AppTopbar
          title="Accounting"
          subtitle={currentPage?.label || ""}
          accentColor={ACCENT}
          currentUser={currentUser}
          onHome={onHome}
          onLogout={logout}
        />
        <div className="page-scroll">
          {renderPage()}
        </div>
      </div>

    </div>
  );
}
