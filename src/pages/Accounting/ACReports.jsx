// ─── Accounting Reports ───────────────────────────────────────────────────────
import { useState } from "react";
import { fmtPKR }  from "../../data/mockData";
import { fmtDate, ACCOUNT_TYPES, ACCOUNT_TYPE_COLOR } from "./accountingConstants";

/* ── Trial Balance ────────────────────────────────────────────────────────────── */
export function ACTrialBalance({ accounts }) {
  const active = accounts.filter(a => a.active);
  const totalDr = active.filter(a => a.balance > 0).reduce((s,a) => s + a.balance, 0);
  const totalCr = active.filter(a => a.balance < 0).reduce((s,a) => s + Math.abs(a.balance), 0);
  const balanced = Math.abs(totalDr - totalCr) < 1;

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Trial Balance</h1>
          <p className="ac-page-sub">Al-Raza LPG (Pvt.) Ltd.</p>
        </div>
        <div className="ac-page-actions">
          <span className={`ac-badge ${balanced?"ac-badge-green":"ac-badge-red"}`} style={{ fontSize:13, padding:"4px 12px" }}>
            {balanced?"✓ Balanced":"⚠ Unbalanced"}
          </span>
          <button className="ac-btn ac-btn-outline ac-btn-sm">Print</button>
        </div>
      </div>

      <div className="ac-table-wrap">
        {ACCOUNT_TYPES.map(type => {
          const typeAccs = active.filter(a => a.type === type);
          if (!typeAccs.length) return null;
          return (
            <div key={type}>
              <div className="ac-report-section-title">{type}</div>
              {typeAccs.map(a => (
                <div key={a.id} className="ac-report-row">
                  <span><span style={{ color:"#0d9488", fontFamily:"monospace", marginRight:12 }}>{a.id}</span>{a.name}</span>
                  <div style={{ display:"flex", gap:60, textAlign:"right" }}>
                    <span className="ac-amt" style={{ color:"#111827" }}>{a.balance>0?fmtPKR(a.balance):"—"}</span>
                    <span className="ac-amt" style={{ color:"#111827" }}>{a.balance<0?fmtPKR(Math.abs(a.balance)):"—"}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div className="ac-report-row total">
          <span style={{ fontSize:13.5 }}>TOTAL</span>
          <div style={{ display:"flex", gap:60, textAlign:"right" }}>
            <span className="ac-amt">{fmtPKR(totalDr)}</span>
            <span className="ac-amt">{fmtPKR(totalCr)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Profit & Loss ────────────────────────────────────────────────────────────── */
export function ACProfitLoss({ accounts }) {
  const revenues  = accounts.filter(a => a.type==="Revenue");
  const expenses  = accounts.filter(a => a.type==="Expense");
  const cogs      = accounts.find(a => a.id==="5001")?.balance || 0;
  const totalRev  = revenues.reduce((s,a) => s+a.balance, 0);
  const totalExp  = expenses.reduce((s,a) => s+a.balance, 0);
  const grossProfit = totalRev - cogs;
  const netProfit   = totalRev - totalExp;

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Profit & Loss Statement</h1><p className="ac-page-sub">Al-Raza LPG (Pvt.) Ltd. — Year to Date</p></div>
        <button className="ac-btn ac-btn-outline ac-btn-sm">Print</button>
      </div>
      <div className="ac-table-wrap" style={{ maxWidth:640 }}>
        <div className="ac-report-section-title">REVENUE</div>
        {revenues.map(a=><div key={a.id} className="ac-report-row"><span>{a.name}</span><span className="ac-amt pos">{fmtPKR(a.balance)}</span></div>)}
        <div className="ac-report-row total"><span>Total Revenue</span><span className="ac-amt pos">{fmtPKR(totalRev)}</span></div>

        <div className="ac-report-section-title" style={{ marginTop:8 }}>COST OF GOODS SOLD</div>
        <div className="ac-report-row"><span>Cost of Goods Sold</span><span className="ac-amt neg">{fmtPKR(cogs)}</span></div>
        <div className="ac-report-row total"><span>Gross Profit</span><span className={`ac-amt ${grossProfit>=0?"pos":"neg"}`}>{fmtPKR(Math.abs(grossProfit))}</span></div>
        <div style={{ padding:"4px 16px", fontSize:12, color:"#6b7280" }}>Gross Margin: {((grossProfit/totalRev)*100).toFixed(1)}%</div>

        <div className="ac-report-section-title" style={{ marginTop:8 }}>OPERATING EXPENSES</div>
        {expenses.filter(a=>a.id!=="5001").map(a=><div key={a.id} className="ac-report-row"><span>{a.name}</span><span className="ac-amt neg">{fmtPKR(a.balance)}</span></div>)}
        <div className="ac-report-row total"><span>Total Expenses</span><span className="ac-amt neg">{fmtPKR(totalExp)}</span></div>

        <div className="ac-report-row net">
          <span>Net Profit / Loss</span>
          <span className={`ac-amt ${netProfit>=0?"pos":"neg"}`}>{netProfit<0?"(":""}{fmtPKR(Math.abs(netProfit))}{netProfit<0?")":""}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Balance Sheet ────────────────────────────────────────────────────────────── */
export function ACBalanceSheet({ accounts }) {
  const assets      = accounts.filter(a => a.type==="Asset");
  const liabilities = accounts.filter(a => a.type==="Liability");
  const equity      = accounts.filter(a => a.type==="Equity");
  const totalAss    = assets.reduce((s,a)=>s+a.balance,0);
  const totalLiab   = liabilities.reduce((s,a)=>s+a.balance,0);
  const totalEq     = equity.reduce((s,a)=>s+a.balance,0);
  const balanced    = Math.abs(totalAss - (totalLiab + totalEq)) < 1;

  const Section = ({ title, items, total, color }) => (
    <div>
      <div className="ac-report-section-title">{title}</div>
      {items.map(a=><div key={a.id} className="ac-report-row"><span>{a.name}</span><span className="ac-amt" style={{ color:"#111827" }}>{fmtPKR(Math.abs(a.balance))}</span></div>)}
      <div className="ac-report-row total"><span>Total {title.split(" ").pop()}</span><span className="ac-amt" style={{ color }}>{fmtPKR(Math.abs(total))}</span></div>
    </div>
  );

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Balance Sheet</h1><p className="ac-page-sub">Al-Raza LPG (Pvt.) Ltd.</p></div>
        <div className="ac-page-actions">
          <span className={`ac-badge ${balanced?"ac-badge-green":"ac-badge-red"}`} style={{ fontSize:13, padding:"4px 12px" }}>{balanced?"✓ Balanced":"⚠ Out of balance"}</span>
          <button className="ac-btn ac-btn-outline ac-btn-sm">Print</button>
        </div>
      </div>
      <div className="ac-two-col">
        <div className="ac-table-wrap">
          <Section title="ASSETS"      items={assets}      total={totalAss}  color="#3b82f6" />
          <div className="ac-report-row net"><span>Total Assets</span><span className="ac-amt pos">{fmtPKR(totalAss)}</span></div>
        </div>
        <div className="ac-table-wrap">
          <Section title="LIABILITIES" items={liabilities} total={totalLiab} color="#ef4444" />
          <Section title="EQUITY"      items={equity}      total={totalEq}   color="#8b5cf6" />
          <div className="ac-report-row net"><span>Total Liabilities + Equity</span><span className="ac-amt" style={{ color:balanced?"#10b981":"#ef4444" }}>{fmtPKR(totalLiab+totalEq)}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ── Bank Reconciliation ──────────────────────────────────────────────────────── */
export function ACBankReconciliation({ bankTx, setBankTx }) {
  const bookBalance = bankTx.reduce((s,t) => s + t.bookAmount, 0);
  const bankBalance = bankTx.filter(t => t.reconciled).reduce((s,t) => s + t.bookAmount, 0);
  const diff = bookBalance - bankBalance;
  const unreconciledCount = bankTx.filter(t=>!t.reconciled).length;

  const toggle = (id) => setBankTx(p => p.map(t => t.id===id ? {...t, reconciled:!t.reconciled} : t));

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Bank Reconciliation</h1><p className="ac-page-sub">HBL Current Account</p></div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background:"#f0fdfa" }}><div style={{ color:"#0d9488", fontSize:18 }}>₨</div></div>
          </div>
          <div className="stat-label">Book Balance</div>
          <div className="stat-value">{fmtPKR(bookBalance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-icon" style={{ background:"#eff6ff" }}><div style={{ color:"#3b82f6", fontSize:18 }}>₨</div></div></div>
          <div className="stat-label">Reconciled</div>
          <div className="stat-value">{fmtPKR(bankBalance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-icon" style={{ background:diff===0?"#f0fdf4":"#fef2f2" }}><div style={{ color:diff===0?"#10b981":"#ef4444", fontSize:18 }}>≠</div></div></div>
          <div className="stat-label">Difference</div>
          <div className="stat-value" style={{ color:diff===0?"#16a34a":"#dc2626" }}>{fmtPKR(Math.abs(diff))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top"><div className="stat-icon" style={{ background:"#fffbeb" }}><div style={{ color:"#f59e0b", fontSize:18 }}>!</div></div></div>
          <div className="stat-label">Unreconciled</div>
          <div className="stat-value">{unreconciledCount}</div>
        </div>
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header"><div className="ac-table-title">Transactions</div></div>
        <table className="ac-table">
          <thead><tr><th>ID</th><th>Date</th><th>Description</th><th>Ref</th><th className="right">Book Amount</th><th className="right">Bank Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {bankTx.map(t=>(
              <tr key={t.id}>
                <td className="primary">{t.id}</td>
                <td className="muted">{fmtDate(t.date)}</td>
                <td className="bold">{t.description}</td>
                <td className="muted">{t.ref}</td>
                <td className="right" style={{ fontWeight:600, color:t.bookAmount>=0?"#16a34a":"#dc2626" }}>{fmtPKR(t.bookAmount)}</td>
                <td className="right" style={{ color:t.bankAmount===null?"#9ca3af":"#374151" }}>{t.bankAmount!==null?fmtPKR(t.bankAmount):"Pending"}</td>
                <td>
                  <span className={`ac-badge ${t.reconciled?"ac-badge-green":"ac-badge-orange"}`}>
                    {t.reconciled?"Reconciled":"Unmatched"}
                  </span>
                </td>
                <td>
                  <button
                    className="ac-rec-btn"
                    onClick={()=>toggle(t.id)}
                    style={{ color:t.reconciled?"#6b7280":"#0d9488", borderColor:t.reconciled?"#e5e7eb":"#0d9488", background:t.reconciled?"transparent":"#f0fdfa" }}
                  >
                    {t.reconciled?"Unmatch":"Match"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
