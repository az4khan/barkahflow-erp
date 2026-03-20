import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#f97316';
const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function POSReports() {
  const { posSales, posSessions, posTerminals } = useApp();
  const [report,   setReport]   = useState('daily');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [termF,    setTermF]    = useState('All');

  const sales    = (posSales   ||[]).filter(s=>s.status==='posted');
  const sessions = posSessions ||[];
  const terms    = posTerminals||[];

  const filtered = useMemo(()=>sales.filter(s=>
    (termF==='All'||s.terminalId===termF)&&
    (!dateFrom||s.date>=dateFrom)&&(!dateTo||s.date<=dateTo)
  ),[sales,termF,dateFrom,dateTo]);

  const totalRev  = filtered.reduce((s,x)=>s+(x.grandTotal||0),0);
  const totalTxns = filtered.length;
  const avgTicket = totalTxns>0?Math.round(totalRev/totalTxns):0;

  // Daily grouping
  const dailyMap={};
  filtered.forEach(s=>{if(!dailyMap[s.date])dailyMap[s.date]={count:0,revenue:0,cash:0,card:0};dailyMap[s.date].count++;dailyMap[s.date].revenue+=(s.grandTotal||0);if(s.paymentMethod==='Cash')dailyMap[s.date].cash+=(s.grandTotal||0);else dailyMap[s.date].card+=(s.grandTotal||0);});
  const dailyRows=Object.entries(dailyMap).sort((a,b)=>b[0].localeCompare(a[0]));

  // Monthly grouping
  const monthlyMap={};
  filtered.forEach(s=>{const m=s.date?.slice(0,7)||'';if(!monthlyMap[m])monthlyMap[m]={count:0,revenue:0};monthlyMap[m].count++;monthlyMap[m].revenue+=(s.grandTotal||0);});
  const monthlyRows=Object.entries(monthlyMap).sort((a,b)=>b[0].localeCompare(a[0]));

  // Per terminal
  const termRows=terms.map(t=>{
    const ts=filtered.filter(s=>s.terminalId===t.id);
    return{...t,count:ts.length,revenue:ts.reduce((a,s)=>a+(s.grandTotal||0),0),cash:ts.filter(s=>s.paymentMethod==='Cash').reduce((a,s)=>a+(s.grandTotal||0),0)};
  });

  // Per item
  const itemMap={};
  filtered.forEach(s=>(s.items||[]).forEach(it=>{if(!itemMap[it.materialName])itemMap[it.materialName]={qty:0,revenue:0,txns:0};itemMap[it.materialName].qty+=it.qty||0;itemMap[it.materialName].revenue+=it.total||0;itemMap[it.materialName].txns++;}));
  const itemRows=Object.entries(itemMap).sort((a,b)=>b[1].revenue-a[1].revenue);

  function exportCSV() {
    const rows=[['Date','Transactions','Revenue','Cash','Card'],...dailyRows.map(([d,v])=>[d,v.count,v.revenue,v.cash,v.card])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`pos-report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  const REPORTS=[['daily','Daily'],['monthly','Monthly'],['terminal','By Terminal'],['items','By Item']];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">POS Reports</h2><p className="pm-page-sub">Sales analytics — daily, monthly, by terminal, and by product</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button></div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:4}}>
          {REPORTS.map(([v,l])=><button key={v} onClick={()=>setReport(v)} style={{padding:'6px 14px',borderRadius:8,border:'1px solid',fontSize:12.5,fontWeight:500,cursor:'pointer',background:report===v?ACCENT:'#fff',color:report===v?'#fff':'#6b7280',borderColor:report===v?ACCENT:'#e5e7eb'}}>{l}</button>)}
        </div>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        <span style={{color:'#94a3b8'}}>—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        <select value={termF} onChange={e=>setTermF(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}>
          <option value="All">All Terminals</option>
          {terms.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {(dateFrom||dateTo||termF!=='All')&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={()=>{setDateFrom('');setDateTo('');setTermF('All');}}>✕ Clear</button>}
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
        {[{label:'Total Revenue',value:fmtPKR(totalRev),icon:'trending',bg:'#fff7ed',color:ACCENT},{label:'Transactions',value:totalTxns,icon:'invoice',bg:'#fff7ed',color:ACCENT},{label:'Avg Ticket',value:fmtPKR(avgTicket),icon:'briefcase',bg:'#f0fdf4',color:'#10b981'},{label:'Cash %',value:totalRev>0?`${Math.round((filtered.filter(s=>s.paymentMethod==='Cash').reduce((a,s)=>a+(s.grandTotal||0),0)/totalRev)*100)}%`:'0%',icon:'store',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      {report==='daily'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Daily Sales Summary ({dailyRows.length} days)</div></div>
          <table className="pm-table">
            <thead><tr><th>Date</th><th style={{textAlign:'right'}}>Transactions</th><th style={{textAlign:'right'}}>Cash</th><th style={{textAlign:'right'}}>Card</th><th style={{textAlign:'right'}}>Total Revenue</th><th style={{textAlign:'right'}}>Avg Ticket</th></tr></thead>
            <tbody>
              {dailyRows.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No sales in selected period</td></tr>
                :dailyRows.map(([date,d])=><tr key={date}><td style={{fontWeight:600}}>{date}</td><td style={{textAlign:'right'}}>{d.count}</td><td style={{textAlign:'right',color:'#10b981'}}>{fmtPKR(d.cash)}</td><td style={{textAlign:'right',color:'#3b82f6'}}>{fmtPKR(d.card)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(d.revenue)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{fmtPKR(d.count>0?Math.round(d.revenue/d.count):0)}</td></tr>)
              }
            </tbody>
            {dailyRows.length>0&&<tfoot><tr style={{background:'#fff7ed',borderTop:'2px solid #e2e8f0'}}><td style={{fontWeight:700,padding:'10px 16px'}}>Total</td><td style={{textAlign:'right',fontWeight:700,padding:'10px 16px'}}>{totalTxns}</td><td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#10b981'}}>{fmtPKR(filtered.filter(s=>s.paymentMethod==='Cash').reduce((a,s)=>a+(s.grandTotal||0),0))}</td><td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#3b82f6'}}>{fmtPKR(filtered.filter(s=>s.paymentMethod==='Card').reduce((a,s)=>a+(s.grandTotal||0),0))}</td><td style={{textAlign:'right',fontWeight:800,padding:'10px 16px',color:ACCENT,fontSize:15}}>{fmtPKR(totalRev)}</td><td style={{textAlign:'right',padding:'10px 16px'}}>{fmtPKR(avgTicket)}</td></tr></tfoot>}
          </table>
        </div>
      )}

      {report==='monthly'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Monthly Summary</div></div>
          <table className="pm-table">
            <thead><tr><th>Month</th><th style={{textAlign:'right'}}>Transactions</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>Avg Daily</th></tr></thead>
            <tbody>
              {monthlyRows.length===0?<tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>
                :monthlyRows.map(([m,d])=><tr key={m}><td style={{fontWeight:600}}>{MONTHS[parseInt(m.split('-')[1])-1]} {m.split('-')[0]}</td><td style={{textAlign:'right'}}>{d.count}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(d.revenue)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{fmtPKR(Math.round(d.revenue/30))}</td></tr>)
              }
            </tbody>
          </table>
        </div>
      )}

      {report==='terminal'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Performance by Terminal</div></div>
          <table className="pm-table">
            <thead><tr><th>Terminal</th><th>Warehouse</th><th style={{textAlign:'right'}}>Transactions</th><th style={{textAlign:'right'}}>Cash</th><th style={{textAlign:'right'}}>Total Revenue</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead>
            <tbody>
              {termRows.filter(t=>t.count>0).map(t=><tr key={t.id}><td style={{fontWeight:600}}>{t.name}</td><td style={{color:'#9ca3af',fontSize:12}}>{t.warehouseId}</td><td style={{textAlign:'right'}}>{t.count}</td><td style={{textAlign:'right',color:'#10b981'}}>{fmtPKR(t.cash)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(t.revenue)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{totalRev>0?((t.revenue/totalRev)*100).toFixed(1):0}%</td></tr>)}
              {termRows.filter(t=>t.count>0).length===0&&<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No terminal data in period</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {report==='items'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Sales by Product</div></div>
          <table className="pm-table">
            <thead><tr><th>Product</th><th style={{textAlign:'right'}}>Qty Sold</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead>
            <tbody>
              {itemRows.length===0?<tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No sales data</td></tr>
                :itemRows.map(([name,d])=><tr key={name}><td style={{fontWeight:600}}>{name}</td><td style={{textAlign:'right',fontWeight:600}}>{d.qty.toLocaleString()}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(d.revenue)}</td><td style={{textAlign:'right'}}><div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}><div style={{width:60,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${totalRev>0?(d.revenue/totalRev)*100:0}%`,background:ACCENT,borderRadius:3}}/></div><span style={{fontSize:11,color:'#94a3b8',minWidth:36}}>{totalRev>0?((d.revenue/totalRev)*100).toFixed(1):0}%</span></div></td></tr>)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
