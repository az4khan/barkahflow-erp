// ─── Accounting Dashboard ─────────────────────────────────────────────────────
import { StatCard } from "../../components/common/UI";
import { fmtPKR }   from "../../data/mockData";
import { fmtDate, ACCOUNT_TYPE_COLOR } from "./accountingConstants";

export default function ACDashboard({ accounts, journal, ar, ap }) {
  const sum = (arr, pred) => arr.filter(pred).reduce((s, a) => s + a.balance, 0);

  const totalRev  = sum(accounts, a => a.type === "Revenue");
  const totalExp  = sum(accounts, a => a.type === "Expense");
  const totalAss  = sum(accounts, a => a.type === "Asset");
  const totalLiab = sum(accounts, a => a.type === "Liability");
  const cogs      = accounts.find(a => a.id === "5001")?.balance || 0;
  const grossProfit = totalRev - cogs;
  const netProfit   = totalRev - totalExp;
  const cashTotal   = sum(accounts, a => ["1001","1002","1003"].includes(a.id));
  const arOut       = ar.filter(i => i.status !== "Paid").reduce((s,i) => s + (i.amount - i.paid), 0);
  const arOverdue   = ar.filter(i => i.status === "Overdue").reduce((s,i) => s + (i.amount - i.paid), 0);
  const apOut       = ap.filter(i => i.status !== "Paid").reduce((s,i) => s + (i.amount - i.paid), 0);

  const recentJE = [...journal].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5);

  const typeBars = ["Asset","Liability","Equity","Revenue","Expense"].map(t => ({
    type: t, color: ACCOUNT_TYPE_COLOR[t],
    total: accounts.filter(a => a.type === t).reduce((s,a) => s + Math.abs(a.balance), 0),
  }));
  const maxBar = Math.max(...typeBars.map(t => t.total));

  const arAging = [
    { label:"Current", items:ar.filter(i=>i.status==="Open"),    color:"#3b82f6" },
    { label:"Partial",  items:ar.filter(i=>i.status==="Partial"), color:"#f59e0b" },
    { label:"Overdue",  items:ar.filter(i=>i.status==="Overdue"), color:"#ef4444" },
    { label:"Paid",     items:ar.filter(i=>i.status==="Paid"),    color:"#10b981" },
  ];

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Accounting Dashboard</h1>
          <p className="ac-page-sub">Al-Raza LPG (Pvt.) Ltd. — Financial Overview</p>
        </div>
      </div>

      {/* KPI cards — shared StatCard */}
      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))" }}>
        <StatCard icon="database"  iconBg="#eff6ff" iconColor="#3b82f6" label="Total Assets"      value={fmtPKR(totalAss)} />
        <StatCard icon="list"      iconBg="#fef2f2" iconColor="#ef4444" label="Total Liabilities"  value={fmtPKR(totalLiab)} />
        <StatCard icon="trending"  iconBg="#f0fdf4" iconColor="#10b981" label="Net Revenue"        value={fmtPKR(totalRev)} badge="YTD" />
        <StatCard icon="briefcase" iconBg="#f0fdfa" iconColor="#0d9488" label="Gross Profit"       value={fmtPKR(grossProfit)} sub={`${((grossProfit/totalRev)*100).toFixed(1)}% margin`} />
        <StatCard icon="trending"  iconBg={netProfit>=0?"#f0fdf4":"#fef2f2"} iconColor={netProfit>=0?"#10b981":"#ef4444"} label="Net Profit" value={fmtPKR(netProfit)} sub={`${((netProfit/totalRev)*100).toFixed(1)}% margin`} />
        <StatCard icon="breakdown" iconBg="#fffbeb" iconColor="#f59e0b" label="AR Outstanding"     value={fmtPKR(arOut)} sub={`${fmtPKR(arOverdue)} overdue`} />
        <StatCard icon="cart"      iconBg="#faf5ff" iconColor="#7c3aed" label="AP Outstanding"     value={fmtPKR(apOut)} />
        <StatCard icon="database"  iconBg="#f0fdfa" iconColor="#0d9488" label="Cash & Bank"        value={fmtPKR(cashTotal)} />
      </div>

      <div className="ac-two-col" style={{ marginBottom:16 }}>

        {/* Recent JEs */}
        <div className="ac-card">
          <div className="ac-card-title">Recent Journal Entries</div>
          {recentJE.map(je => {
            const dr = je.entries.reduce((s,e)=>s+e.dr,0);
            return (
              <div key={je.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0d9488", fontFamily:"monospace" }}>{je.id}</div>
                  <div style={{ fontSize:12.5, color:"#6b7280", marginTop:1 }}>{je.description}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{fmtPKR(dr)}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{fmtDate(je.date)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Account balances by type */}
        <div className="ac-card">
          <div className="ac-card-title">Account Balances by Type</div>
          {typeBars.map(t => (
            <div key={t.type} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:5 }}>
                <span style={{ color:"#374151", fontWeight:500 }}>{t.type}</span>
                <span style={{ fontWeight:700, color:"#111827" }}>{fmtPKR(t.total)}</span>
              </div>
              <div className="ac-track">
                <div className="ac-fill" style={{ width:`${(t.total/maxBar)*100}%`, background:t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ac-two-col">

        {/* AR Aging */}
        <div className="ac-card">
          <div className="ac-card-title">AR Aging Summary</div>
          {arAging.map(({ label, items, color }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                <span style={{ color:"#374151" }}>{label}</span>
                <span style={{ fontSize:11, color:"#9ca3af" }}>({items.length})</span>
              </div>
              <span style={{ fontWeight:600, color, fontSize:13 }}>{fmtPKR(items.reduce((s,i)=>s+i.amount,0))}</span>
            </div>
          ))}
        </div>

        {/* P&L Summary */}
        <div className="ac-card">
          <div className="ac-card-title">P&L Quick Summary</div>
          {[
            { label:"Total Revenue",    val:totalRev,              color:"#10b981" },
            { label:"Cost of Goods",    val:-cogs,                 color:"#ef4444" },
            { label:"Gross Profit",     val:grossProfit,           color:"#0d9488", bold:true },
            { label:"Operating Exp.",   val:-(totalExp - cogs),    color:"#f59e0b" },
            { label:"Net Profit / Loss",val:netProfit,             color:netProfit>=0?"#10b981":"#ef4444", bold:true, big:true },
          ].map(({ label, val, color, bold, big }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f8fafc" }}>
              <span style={{ fontSize:13, color:bold?"#111827":"#6b7280", fontWeight:bold?700:400 }}>{label}</span>
              <span style={{ fontSize:big?16:13, fontWeight:bold?700:500, color }}>{fmtPKR(Math.abs(val))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
