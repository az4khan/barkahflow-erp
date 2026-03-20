import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { fmtDate, ACCOUNT_TYPE_COLOR } from '../accountingConstants';

const ACCENT = '#0d9488';

export default function ACDashboard() {
  const { acAccounts: accounts, acJournal: journal, acAR: ar, acAP: ap } = useApp();

  const sum = (arr, pred) => (arr||[]).filter(pred).reduce((s, a) => s + (a.balance||0), 0);
  const totalRev    = sum(accounts, a => a.type === 'Revenue');
  const totalExp    = sum(accounts, a => a.type === 'Expense');
  const totalAss    = sum(accounts, a => a.type === 'Asset');
  const totalLiab   = sum(accounts, a => a.type === 'Liability');
  const cogs        = (accounts||[]).find(a => a.id === '5001')?.balance || 0;
  const grossProfit = totalRev - cogs;
  const netProfit   = totalRev - totalExp;
  const cashTotal   = sum(accounts, a => ['1001','1002','1003'].includes(a.id));
  const arOut       = (ar||[]).filter(i => i.status !== 'Paid').reduce((s,i) => s+(i.amount-i.paid), 0);
  const arOverdue   = (ar||[]).filter(i => i.status === 'Overdue').reduce((s,i) => s+(i.amount-i.paid), 0);
  const apOut       = (ap||[]).filter(i => i.status !== 'Paid').reduce((s,i) => s+(i.amount-i.paid), 0);
  const recentJE    = [...(journal||[])].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6);

  const typeBars = ['Asset','Liability','Equity','Revenue','Expense'].map(t => ({
    type: t, color: ACCOUNT_TYPE_COLOR[t],
    total: (accounts||[]).filter(a => a.type===t).reduce((s,a) => s+Math.abs(a.balance||0), 0),
  }));
  const maxBar = Math.max(...typeBars.map(t=>t.total), 1);

  const arAging = [
    { label:'Current', items:(ar||[]).filter(i=>i.status==='Open'),    color:'#3b82f6' },
    { label:'Partial',  items:(ar||[]).filter(i=>i.status==='Partial'), color:'#f59e0b' },
    { label:'Overdue',  items:(ar||[]).filter(i=>i.status==='Overdue'), color:'#ef4444' },
    { label:'Paid',     items:(ar||[]).filter(i=>i.status==='Paid'),    color:'#10b981' },
  ];

  const STATS = [
    { label:'Total Assets',      value:fmtPKR(totalAss),    icon:'database',  bg:'#eff6ff', color:'#3b82f6' },
    { label:'Total Liabilities', value:fmtPKR(totalLiab),   icon:'list',      bg:'#fef2f2', color:'#ef4444' },
    { label:'Net Revenue',       value:fmtPKR(totalRev),    icon:'trending',  bg:'#f0fdf4', color:'#10b981', badge:'YTD' },
    { label:'Gross Profit',      value:fmtPKR(grossProfit), icon:'briefcase', bg:'#f0fdfa', color:ACCENT,    hint:`${totalRev?((grossProfit/totalRev)*100).toFixed(1):0}% margin` },
    { label:'Net Profit',        value:fmtPKR(netProfit),   icon:'trending',  bg:netProfit>=0?'#f0fdf4':'#fef2f2', color:netProfit>=0?'#10b981':'#ef4444', hint:`${totalRev?((netProfit/totalRev)*100).toFixed(1):0}% margin` },
    { label:'AR Outstanding',    value:fmtPKR(arOut),       icon:'breakdown', bg:'#fffbeb', color:'#f59e0b', hint:`${fmtPKR(arOverdue)} overdue` },
    { label:'AP Outstanding',    value:fmtPKR(apOut),       icon:'cart',      bg:'#faf5ff', color:'#7c3aed' },
    { label:'Cash & Bank',       value:fmtPKR(cashTotal),   icon:'database',  bg:'#f0fdfa', color:ACCENT },
  ];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Accounting Dashboard</h2>
          <p className="pm-page-sub">Al-Raza LPG (Pvt.) Ltd. — Financial Overview</p>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))' }}>
        {STATS.map(s => (
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top">
              <div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div>
              {s.badge && <span className="pm-stat-badge">{s.badge}</span>}
            </div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{s.value}</div>
            {s.hint && <div className="pm-stat-hint">{s.hint}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {/* Recent JEs */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Recent Journal Entries {recentJE.some(j=>j.auto) && <span style={{fontSize:11,color:'#0d9488',fontWeight:600,marginLeft:6}}>● Live from Purchase</span>}</div></div>
          <div style={{ padding:'0 4px' }}>
            {recentJE.map(je => {
              const dr = (je.entries||[]).reduce((s,e)=>s+e.dr,0);
              return (
                <div key={je.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #f8fafc' }}>
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:700, color:ACCENT, fontFamily:'monospace', display:'flex', alignItems:'center', gap:6 }}>
                      {je.id}
                      {je.auto && <span style={{ fontSize:10, background:'#f0fdfa', color:ACCENT, padding:'1px 6px', borderRadius:10, fontFamily:'sans-serif', fontWeight:600 }}>AUTO</span>}
                    </div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:1 }}>{je.description}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{fmtPKR(dr)}</div>
                    <div style={{ fontSize:11, color:'#94a3b8' }}>{fmtDate(je.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account balances by type */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Account Balances by Type</div></div>
          <div style={{ padding:'14px 18px' }}>
            {typeBars.map(t => (
              <div key={t.type} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:5 }}>
                  <span style={{ color:'#374151', fontWeight:500 }}>{t.type}</span>
                  <span style={{ fontWeight:700, color:'#0f172a' }}>{fmtPKR(t.total)}</span>
                </div>
                <div style={{ height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(t.total/maxBar)*100}%`, background:t.color, borderRadius:4, transition:'width 0.6s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* AR Aging */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">AR Aging Summary</div></div>
          <div style={{ padding:'0 4px' }}>
            {arAging.map(({ label, items, color }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderBottom:'1px solid #f8fafc' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:color }}/>
                  <span style={{ color:'#374151' }}>{label}</span>
                  <span style={{ fontSize:11, color:'#9ca3af' }}>({items.length})</span>
                </div>
                <span style={{ fontWeight:700, color, fontSize:13 }}>{fmtPKR(items.reduce((s,i)=>s+i.amount,0))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* P&L Summary */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">P&L Quick Summary</div></div>
          <div style={{ padding:'0 4px' }}>
            {[
              { label:'Total Revenue',    val:totalRev,           color:'#10b981' },
              { label:'Cost of Goods',    val:cogs,               color:'#ef4444' },
              { label:'Gross Profit',     val:grossProfit,        color:ACCENT,   bold:true },
              { label:'Operating Exp.',   val:totalExp-cogs,      color:'#f59e0b' },
              { label:'Net Profit / Loss',val:netProfit,          color:netProfit>=0?'#10b981':'#ef4444', bold:true, big:true },
            ].map(({ label, val, color, bold, big }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #f8fafc', background:bold?'#f8fafc':'#fff' }}>
                <span style={{ fontSize:13, color:bold?'#0f172a':'#6b7280', fontWeight:bold?700:400 }}>{label}</span>
                <span style={{ fontSize:big?17:13, fontWeight:bold?700:500, color }}>{fmtPKR(Math.abs(val))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
