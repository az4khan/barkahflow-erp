import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR, STATUS_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

export default function SDDashboard() {
  const { salesOrders, salesInvoices, sdParties, deliveryOrders, salesReturns } = useApp();
  const sos  = salesOrders   || [];
  const invs = salesInvoices || [];
  const pts  = sdParties     || [];
  const dos  = deliveryOrders|| [];
  const rets = salesReturns  || [];

  const totalRevenue  = invs.reduce((s,i)=>s+(i.subTotal||0),0);
  const totalInvoiced = invs.reduce((s,i)=>s+(i.grandTotal||0),0);
  const totalCOGS     = invs.reduce((s,i)=>s+(i.cogsTotal||0),0);
  const grossProfit   = totalRevenue - totalCOGS;
  const outstanding   = invs.reduce((s,i)=>s+((i.grandTotal||0)-(i.paidAmount||0)),0);
  const openOrders    = sos.filter(s=>!['invoiced','cancelled'].includes(s.status)).length;
  const inTransit     = dos.filter(d=>d.status==='in_transit').length;

  // Revenue by tier
  const byTier = {};
  invs.forEach(inv => {
    const t = inv.tier||'Other';
    byTier[t] = (byTier[t]||0) + (inv.grandTotal||0);
  });
  const tierEntries = Object.entries(byTier).sort((a,b)=>b[1]-a[1]);
  const maxTier = Math.max(...Object.values(byTier),1);

  // Monthly revenue (last 6 months)
  const now = new Date();
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const key = d.toISOString().slice(0,7);
    const label = d.toLocaleString('default',{month:'short'});
    const val = invs.filter(inv=>inv.date?.startsWith(key)).reduce((s,inv)=>s+(inv.grandTotal||0),0);
    return { label, val, key };
  });
  const maxMonth = Math.max(...months.map(m=>m.val),1);

  // Recent orders
  const recentSOs = [...sos].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);

  const STATS = [
    { label:'Total Revenue',    value:fmtPKRsd(totalRevenue), icon:'trending',  bg:'#f0fdf4', color:ACCENT },
    { label:'Gross Profit',     value:fmtPKRsd(grossProfit),  icon:'briefcase', bg:'#ecfdf5', color:'#059669', hint:totalRevenue?`${((grossProfit/totalRevenue)*100).toFixed(1)}% margin`:'' },
    { label:'AR Outstanding',   value:fmtPKRsd(outstanding),  icon:'breakdown', bg:'#fffbeb', color:'#f59e0b' },
    { label:'Open SO',          value:openOrders,             icon:'invoice',   bg:'#eff6ff', color:'#3b82f6' },
    { label:'In Transit',       value:inTransit,              icon:'truck',     bg:'#f5f3ff', color:'#8b5cf6' },
    { label:'Active Parties',   value:pts.filter(p=>p.status==='active').length, icon:'users', bg:'#f0fdf4', color:ACCENT },
  ];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">S&D Dashboard</h2>
          <p className="pm-page-sub">Sales & Distribution — Multi-tier channel overview</p>
        </div>
        <div className="pm-page-actions">
          <span style={{fontSize:11,background:'#f0fdf4',color:ACCENT,padding:'4px 12px',borderRadius:20,fontWeight:600,border:`1px solid ${ACCENT}40`}}>
            SO → DO → Invoice
          </span>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {STATS.map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div>
            {s.hint&&<div className="pm-stat-hint">{s.hint}</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:14,marginBottom:14}}>
        {/* Monthly Revenue Chart */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Monthly Revenue Trend</div></div>
          <div style={{padding:'16px 18px 8px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120}}>
              {months.map((m,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{fontSize:10,color:ACCENT,fontWeight:600}}>{m.val>0?fmtPKRsd(m.val):''}</div>
                  <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:m.val>0?ACCENT:'#f1f5f9',height:`${Math.max((m.val/maxMonth)*80,m.val>0?6:2)}px`,transition:'height 0.6s',minHeight:2}}/>
                  <div style={{fontSize:10.5,color:'#94a3b8'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by tier */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Revenue by Channel Tier</div></div>
          <div style={{padding:'14px 18px'}}>
            {tierEntries.length===0
              ? <div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:13}}>No sales data yet</div>
              : tierEntries.map(([tier,val])=>(
                <div key={tier} style={{marginBottom:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:5}}>
                    <span style={{fontWeight:600,color:TIER_COLOR[tier]||'#374151'}}>{tier}</span>
                    <span style={{fontWeight:700,color:'#0f172a'}}>{fmtPKRsd(val)}</span>
                  </div>
                  <div style={{height:7,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(val/maxTier)*100}%`,background:TIER_COLOR[tier]||ACCENT,borderRadius:4}}/>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Recent Sales Orders */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Recent Sales Orders</div></div>
          <table className="pm-table">
            <thead><tr><th>SO ID</th><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recentSOs.length===0
                ? <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:'#9ca3af'}}>No orders yet</td></tr>
                : recentSOs.map(so=>(
                  <tr key={so.id}>
                    <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{so.id}</td>
                    <td style={{fontWeight:600,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{so.partyName}</td>
                    <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:(TIER_COLOR[so.tier]||'#94a3b8')+'18',color:TIER_COLOR[so.tier]||'#94a3b8'}}>{so.tier}</span></td>
                    <td style={{textAlign:'right',fontWeight:600}}>{fmtPKRsd(so.grandTotal)}</td>
                    <td><span className={`pm-badge ${so.status==='invoiced'?'pm-badge-green':so.status==='approved'?'pm-badge-blue':so.status==='cancelled'?'pm-badge-red':'pm-badge-gray'}`}>{so.status}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* P&L Summary */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">P&L Quick View</div></div>
          <div style={{padding:'0 4px'}}>
            {[
              {label:'Total Revenue',  val:totalRevenue, color:'#10b981'},
              {label:'Cost of Sales',  val:totalCOGS,    color:'#ef4444'},
              {label:'Gross Profit',   val:grossProfit,  color:ACCENT, bold:true},
              {label:'Returns Value',  val:rets.reduce((s,r)=>s+(r.subTotal||0),0), color:'#f59e0b'},
              {label:'Net After Returns',val:grossProfit-rets.reduce((s,r)=>s+(r.subTotal||0),0), color:ACCENT, bold:true, big:true},
            ].map(({label,val,color,bold,big})=>(
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderBottom:'1px solid #f8fafc',background:bold?'#f8fafc':'#fff'}}>
                <span style={{fontSize:13,color:bold?'#0f172a':'#6b7280',fontWeight:bold?700:400}}>{label}</span>
                <span style={{fontSize:big?17:13,fontWeight:bold?700:500,color}}>{fmtPKRsd(Math.abs(val))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
