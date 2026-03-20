import { useApp }  from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_COLOR } from '../accountingConstants';

const ACCENT = '#0d9488';
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

function ReportRow({ label, value, color, bold, big, indent }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 20px', borderBottom:'1px solid #f8fafc', background:bold?'#f8fafc':'#fff', paddingLeft:indent?32:20 }}>
      <span style={{ fontSize:13, color:bold?'#0f172a':'#374151', fontWeight:bold?700:400 }}>{label}</span>
      <span style={{ fontSize:big?17:13, fontWeight:bold?700:500, color:color||'#374151' }}>{value}</span>
    </div>
  );
}

function SectionTitle({ title }) {
  return <div style={{ padding:'8px 20px', background:'#f1f5f9', fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' }}>{title}</div>;
}

/* ── Trial Balance ── */
export function ACTrialBalance() {
  const { acAccounts: accounts } = useApp();
  const active   = (accounts||[]).filter(a => a.active);
  const totalDr  = active.filter(a => a.balance > 0).reduce((s,a) => s+a.balance, 0);
  const totalCr  = active.filter(a => a.balance < 0).reduce((s,a) => s+Math.abs(a.balance), 0);
  const balanced = Math.abs(totalDr - totalCr) < 1;

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Trial Balance</h2><p className="pm-page-sub">Al-Raza LPG (Pvt.) Ltd.</p></div>
        <div className="pm-page-actions">
          <span className={`pm-badge ${balanced?'pm-badge-green':'pm-badge-red'}`} style={{ fontSize:13, padding:'5px 14px' }}>{balanced?'✓ Balanced':'⚠ Unbalanced'}</span>
          <button className="pm-btn pm-btn-outline"><span>Print</span></button>
        </div>
      </div>
      <div className="pm-table-wrap">
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', padding:'10px 20px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', gap:60 }}>
          <span>Account</span><span style={{textAlign:'right', minWidth:100}}>Debit</span><span style={{textAlign:'right', minWidth:100}}>Credit</span>
        </div>
        {ACCOUNT_TYPES.map(type => {
          const typeAccs = active.filter(a => a.type === type);
          if (!typeAccs.length) return null;
          return (
            <div key={type}>
              <SectionTitle title={type}/>
              {typeAccs.map(a => (
                <div key={a.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', padding:'9px 20px', borderBottom:'1px solid #f8fafc', gap:60 }}>
                  <span style={{ fontSize:13, color:'#374151' }}><span style={{ color:ACCENT, fontFamily:'monospace', marginRight:12, fontWeight:600 }}>{a.id}</span>{a.name}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0f172a', textAlign:'right', minWidth:100 }}>{a.balance>0?fmtPKR(a.balance):'—'}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0f172a', textAlign:'right', minWidth:100 }}>{a.balance<0?fmtPKR(Math.abs(a.balance)):'—'}</span>
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', padding:'12px 20px', background:'#f8fafc', borderTop:'2px solid #e2e8f0', gap:60 }}>
          <span style={{ fontSize:13.5, fontWeight:700, color:'#0f172a' }}>TOTAL</span>
          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a', textAlign:'right', minWidth:100 }}>{fmtPKR(totalDr)}</span>
          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a', textAlign:'right', minWidth:100 }}>{fmtPKR(totalCr)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Profit & Loss ── */
export function ACProfitLoss() {
  const { acAccounts: accounts } = useApp();
  const revenues    = (accounts||[]).filter(a => a.type==='Revenue');
  const expenses    = (accounts||[]).filter(a => a.type==='Expense');
  const cogs        = (accounts||[]).find(a => a.id==='5001')?.balance || 0;
  const totalRev    = revenues.reduce((s,a) => s+a.balance, 0);
  const totalExp    = expenses.reduce((s,a) => s+a.balance, 0);
  const grossProfit = totalRev - cogs;
  const netProfit   = totalRev - totalExp;

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Profit & Loss Statement</h2><p className="pm-page-sub">Al-Raza LPG (Pvt.) Ltd. — Year to Date</p></div>
        <button className="pm-btn pm-btn-outline">Print</button>
      </div>
      <div className="pm-table-wrap" style={{ maxWidth:680 }}>
        <SectionTitle title="Revenue"/>
        {revenues.map(a=><ReportRow key={a.id} label={a.name} value={fmtPKR(a.balance)} color="#10b981"/>)}
        <ReportRow label="Total Revenue" value={fmtPKR(totalRev)} color="#10b981" bold/>

        <SectionTitle title="Cost of Goods Sold"/>
        <ReportRow label="Cost of Goods Sold" value={fmtPKR(cogs)} color="#ef4444"/>
        <ReportRow label="Gross Profit" value={fmtPKR(Math.abs(grossProfit))} color={grossProfit>=0?ACCENT:'#ef4444'} bold big/>
        <div style={{ padding:'4px 20px', fontSize:12, color:'#94a3b8' }}>Gross Margin: {totalRev?((grossProfit/totalRev)*100).toFixed(1):0}%</div>

        <SectionTitle title="Operating Expenses"/>
        {expenses.filter(a=>a.id!=='5001').map(a=><ReportRow key={a.id} label={a.name} value={fmtPKR(a.balance)} color="#f59e0b"/>)}
        <ReportRow label="Total Expenses" value={fmtPKR(totalExp)} color="#f59e0b" bold/>

        <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:netProfit>=0?'#f0fdf4':'#fef2f2', borderTop:'2px solid #e2e8f0' }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>Net Profit / Loss</span>
          <span style={{ fontSize:22, fontWeight:800, color:netProfit>=0?'#10b981':'#ef4444' }}>{netProfit<0?'(':''}{fmtPKR(Math.abs(netProfit))}{netProfit<0?')':''}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Balance Sheet ── */
export function ACBalanceSheet() {
  const { acAccounts: accounts } = useApp();
  const assets      = (accounts||[]).filter(a => a.type==='Asset');
  const liabilities = (accounts||[]).filter(a => a.type==='Liability');
  const equity      = (accounts||[]).filter(a => a.type==='Equity');
  const totalAss    = assets.reduce((s,a)=>s+a.balance,0);
  const totalLiab   = liabilities.reduce((s,a)=>s+a.balance,0);
  const totalEq     = equity.reduce((s,a)=>s+a.balance,0);
  const balanced    = Math.abs(totalAss-(totalLiab+totalEq)) < 1;

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Balance Sheet</h2><p className="pm-page-sub">Al-Raza LPG (Pvt.) Ltd.</p></div>
        <div className="pm-page-actions">
          <span className={`pm-badge ${balanced?'pm-badge-green':'pm-badge-red'}`} style={{ fontSize:13, padding:'5px 14px' }}>{balanced?'✓ Balanced':'⚠ Out of balance'}</span>
          <button className="pm-btn pm-btn-outline">Print</button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div className="pm-table-wrap">
          <SectionTitle title="Assets"/>
          {assets.map(a=><ReportRow key={a.id} label={a.name} value={fmtPKR(Math.abs(a.balance))} color="#374151"/>)}
          <ReportRow label="Total Assets" value={fmtPKR(Math.abs(totalAss))} color="#3b82f6" bold big/>
        </div>
        <div className="pm-table-wrap">
          <SectionTitle title="Liabilities"/>
          {liabilities.map(a=><ReportRow key={a.id} label={a.name} value={fmtPKR(Math.abs(a.balance))} color="#374151"/>)}
          <ReportRow label="Total Liabilities" value={fmtPKR(Math.abs(totalLiab))} color="#ef4444" bold/>
          <SectionTitle title="Equity"/>
          {equity.map(a=><ReportRow key={a.id} label={a.name} value={fmtPKR(Math.abs(a.balance))} color="#374151"/>)}
          <ReportRow label="Total Equity" value={fmtPKR(Math.abs(totalEq))} color="#8b5cf6" bold/>
          <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', background:'#f8fafc', borderTop:'2px solid #e2e8f0' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Total Liabilities + Equity</span>
            <span style={{ fontSize:14, fontWeight:700, color:balanced?'#10b981':'#ef4444' }}>{fmtPKR(totalLiab+totalEq)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bank Reconciliation ── */
export function ACBankReconciliation() {
  const { acBankTx: bankTx, setAcBankTx } = useApp();
  const bookBalance = (bankTx||[]).reduce((s,t) => s+t.bookAmount, 0);
  const bankBalance = (bankTx||[]).filter(t=>t.reconciled).reduce((s,t) => s+t.bookAmount, 0);
  const diff = bookBalance - bankBalance;
  const toggle = (id) => setAcBankTx(p => (p||[]).map(t => t.id===id ? {...t, reconciled:!t.reconciled} : t));

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Bank Reconciliation</h2><p className="pm-page-sub">HBL Current Account</p></div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Book Balance',  value:fmtPKR(bookBalance),  bg:'#f0fdfa', color:ACCENT },
          { label:'Reconciled',    value:fmtPKR(bankBalance),  bg:'#eff6ff', color:'#3b82f6' },
          { label:'Difference',    value:fmtPKR(Math.abs(diff)), bg:diff===0?'#f0fdf4':'#fef2f2', color:diff===0?'#10b981':'#ef4444' },
          { label:'Unreconciled',  value:(bankTx||[]).filter(t=>!t.reconciled).length, bg:'#fffbeb', color:'#f59e0b' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><span style={{ color:s.color, fontSize:18, fontWeight:700 }}>₨</span></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Transactions</div></div>
        <table className="pm-table">
          <thead><tr><th>ID</th><th>Date</th><th>Description</th><th>Ref</th><th style={{textAlign:'right'}}>Book Amount</th><th style={{textAlign:'right'}}>Bank Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(bankTx||[]).map(t=>(
              <tr key={t.id}>
                <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{t.id}</td>
                <td style={{ color:'#9ca3af', fontSize:12 }}>{fmtDate(t.date)}</td>
                <td style={{ fontWeight:600 }}>{t.description}</td>
                <td style={{ color:'#9ca3af' }}>{t.ref}</td>
                <td style={{ textAlign:'right', fontWeight:600, color:t.bookAmount>=0?'#16a34a':'#dc2626' }}>{fmtPKR(t.bookAmount)}</td>
                <td style={{ textAlign:'right', color:t.bankAmount===null?'#9ca3af':'#374151' }}>{t.bankAmount!==null?fmtPKR(t.bankAmount):'Pending'}</td>
                <td><span className={`pm-badge ${t.reconciled?'pm-badge-green':'pm-badge-orange'}`}>{t.reconciled?'Reconciled':'Unmatched'}</span></td>
                <td>
                  <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12, color:t.reconciled?'#6b7280':ACCENT, borderColor:t.reconciled?'#e5e7eb':ACCENT }} onClick={()=>toggle(t.id)}>
                    {t.reconciled?'Unmatch':'Match'}
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
