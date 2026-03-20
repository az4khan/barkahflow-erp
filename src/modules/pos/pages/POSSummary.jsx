import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#f97316';
const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;

export default function POSSummary() {
  const { posSales, posSessions, posTerminals } = useApp();

  const today    = new Date().toISOString().slice(0,10);
  const sales    = (posSales   ||[]).filter(s=>s.status==='posted'&&s.date===today);
  const sessions = (posSessions||[]).filter(s=>s.openedAt?.startsWith(today)||s.closedAt?.startsWith(today));
  const terms    = posTerminals||[];

  const totalRev   = sales.reduce((s,x)=>s+(x.grandTotal||0),0);
  const cashRev    = sales.filter(s=>s.paymentMethod==='Cash').reduce((s,x)=>s+(x.grandTotal||0),0);
  const cardRev    = sales.filter(s=>s.paymentMethod==='Card').reduce((s,x)=>s+(x.grandTotal||0),0);
  const otherRev   = totalRev - cashRev - cardRev;

  // Sales per hour
  const hourly = Array.from({length:24},(_,h)=>{
    const label=`${String(h).padStart(2,'0')}:00`;
    const val=sales.filter(s=>new Date(s.createdAt).getHours()===h).reduce((a,x)=>a+(x.grandTotal||0),0);
    return{label,val};
  }).filter(h=>h.val>0||(new Date().getHours()===parseInt(h.label)));
  const maxH=Math.max(...hourly.map(h=>h.val),1);

  // Per terminal breakdown
  const perTerminal = terms.map(t=>{
    const tSales=sales.filter(s=>s.terminalId===t.id);
    return{...t,count:tSales.length,revenue:tSales.reduce((a,s)=>a+(s.grandTotal||0),0)};
  }).filter(t=>t.count>0);

  // Top items
  const itemMap={};
  sales.forEach(s=>(s.items||[]).forEach(it=>{if(!itemMap[it.materialName])itemMap[it.materialName]={qty:0,revenue:0};itemMap[it.materialName].qty+=it.qty||0;itemMap[it.materialName].revenue+=it.total||0;}));
  const topItems=Object.entries(itemMap).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,5);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Daily Summary</h2>
          <p className="pm-page-sub">Today's POS performance — {new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Print Report</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[{label:'Total Revenue',value:fmtPKR(totalRev),icon:'trending',bg:'#fff7ed',color:ACCENT},{label:'Transactions',value:sales.length,icon:'invoice',bg:'#fff7ed',color:ACCENT},{label:'Cash',value:fmtPKR(cashRev),icon:'store',bg:'#f0fdf4',color:'#10b981'},{label:'Card',value:fmtPKR(cardRev),icon:'briefcase',bg:'#eff6ff',color:'#3b82f6'},{label:'Avg Ticket',value:fmtPKR(sales.length>0?Math.round(totalRev/sales.length):0),icon:'breakdown',bg:'#f5f3ff',color:'#8b5cf6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:16}}>{s.value}</div></div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        {/* Hourly chart */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Hourly Revenue</div></div>
          <div style={{padding:'14px 18px'}}>
            {hourly.length===0
              ? <div style={{padding:30,textAlign:'center',color:'#94a3b8',fontSize:13}}>No sales today yet</div>
              : <div style={{display:'flex',alignItems:'flex-end',gap:6,height:100}}>
                  {hourly.map((h,i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                      <div style={{fontSize:9,color:ACCENT,fontWeight:600}}>{h.val>0?`${Math.round(h.val/1000)}k`:''}</div>
                      <div style={{width:'100%',borderRadius:'3px 3px 0 0',background:h.val>0?ACCENT:'#f1f5f9',height:`${Math.max((h.val/maxH)*70,h.val>0?4:2)}px`,minHeight:2}}/>
                      <div style={{fontSize:9,color:'#94a3b8'}}>{h.label}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Payment method breakdown */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Payment Breakdown</div></div>
          <div style={{padding:'16px 18px'}}>
            {[['Cash',cashRev,'#10b981'],['Card',cardRev,'#3b82f6'],['Other',otherRev,'#8b5cf6']].filter(([,v])=>v>0).map(([label,val,color])=>(
              <div key={label} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}>
                  <span style={{fontWeight:600,color:'#374151'}}>{label}</span>
                  <span style={{fontWeight:700,color}}>{fmtPKR(val)}</span>
                </div>
                <div style={{height:7,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${totalRev>0?(val/totalRev)*100:0}%`,background:color,borderRadius:4}}/>
                </div>
              </div>
            ))}
            {totalRev===0&&<div style={{padding:20,textAlign:'center',color:'#94a3b8',fontSize:13}}>No sales today</div>}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Top items */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Top Items Today</div></div>
          <table className="pm-table">
            <thead><tr><th>#</th><th>Item</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
            <tbody>
              {topItems.length===0?<tr><td colSpan={4} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No sales today</td></tr>
                :topItems.map(([name,data],i)=>(
                  <tr key={name}>
                    <td style={{color:'#94a3b8',fontWeight:700}}>{i+1}</td>
                    <td style={{fontWeight:600}}>{name}</td>
                    <td style={{textAlign:'right',fontWeight:600}}>{data.qty.toLocaleString()}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(data.revenue)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Per terminal */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Performance by Terminal</div></div>
          <table className="pm-table">
            <thead><tr><th>Terminal</th><th style={{textAlign:'right'}}>Txns</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
            <tbody>
              {perTerminal.length===0?<tr><td colSpan={3} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No activity today</td></tr>
                :perTerminal.map(t=>(
                  <tr key={t.id}>
                    <td style={{fontWeight:600}}>{t.name}</td>
                    <td style={{textAlign:'right',fontWeight:600}}>{t.count}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(t.revenue)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
