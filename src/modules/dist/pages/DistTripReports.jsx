import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DistTripReports() {
  const { trips, settlements, distRoutes, distDrivers, fuelLog, maintenance } = useApp();
  const [report,   setReport]   = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const allTrips = trips       || [];
  const settles  = settlements || [];
  const routes   = distRoutes  || [];
  const drivers  = distDrivers || [];
  const fuel     = fuelLog     || [];
  const maint    = maintenance || [];

  const filtered = useMemo(()=>allTrips.filter(t=>(!dateFrom||t.date>=dateFrom)&&(!dateTo||t.date<=dateTo)),[allTrips,dateFrom,dateTo]);
  const settFiltered = settles.filter(s=>{const t=allTrips.find(x=>x.id===s.tripId);return(!dateFrom||t?.date>=dateFrom)&&(!dateTo||t?.date<=dateTo);});

  const totalCash    = settFiltered.reduce((s,x)=>s+(x.cashSubmitted||0),0);
  const totalExpenses= settFiltered.reduce((s,x)=>s+(x.expenses||0),0);
  const totalFuel    = fuel.filter(f=>(!dateFrom||f.date>=dateFrom)&&(!dateTo||f.date<=dateTo)).reduce((s,f)=>s+(f.totalCost||0),0);
  const totalMaint   = maint.filter(m=>(!dateFrom||m.date>=dateFrom)&&(!dateTo||m.date<=dateTo)).reduce((s,m)=>s+(m.cost||0),0);

  const byRoute = routes.map(r=>{
    const rTrips=filtered.filter(t=>t.routeId===r.id);
    const rSettles=settFiltered.filter(s=>rTrips.find(t=>t.id===s.tripId));
    return{...r,trips:rTrips.length,settled:rTrips.filter(t=>t.status==='settled').length,cash:rSettles.reduce((s,x)=>s+(x.cashSubmitted||0),0),expenses:rSettles.reduce((s,x)=>s+(x.expenses||0),0)};
  }).filter(r=>r.trips>0);

  const byDriver = drivers.map(d=>{
    const dTrips=filtered.filter(t=>t.driverId===d.id);
    const dSettles=settFiltered.filter(s=>dTrips.find(t=>t.id===s.tripId));
    const variance=dSettles.reduce((s,x)=>s+(x.variance||0),0);
    return{...d,trips:dTrips.length,settled:dTrips.filter(t=>t.status==='settled').length,cash:dSettles.reduce((s,x)=>s+(x.cashSubmitted||0),0),variance,empties:dTrips.reduce((s,t)=>s+(t.emptiesOut||0),0),returned:dSettles.reduce((s,x)=>s+(x.emptiesReturned||0),0)};
  }).filter(d=>d.trips>0);

  const monthlyMap={};
  filtered.forEach(t=>{const m=t.date?.slice(0,7)||'';if(!monthlyMap[m])monthlyMap[m]={trips:0,settled:0};monthlyMap[m].trips++;if(t.status==='settled')monthlyMap[m].settled++;});
  const monthlyRows=Object.entries(monthlyMap).sort((a,b)=>b[0].localeCompare(a[0]));

  function exportCSV(){
    const rows=[['Trip ID','Date','Driver','Route','Vehicle','Cyl Out','Cash Expected','Cash Collected','Status'],...filtered.map(t=>[t.id,t.date,t.driverName,t.routeName,t.vehicleReg,t.emptiesOut||0,t.cashExpected||0,t.cashCollected||0,t.status])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`trip-report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  const REPORTS=[['summary','Summary'],['route','By Route'],['driver','By Driver'],['monthly','Monthly']];

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Trip Reports</h2><p className="pm-page-sub">Distribution performance — cash, empties, costs, route & driver analytics</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button></div>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:4}}>
          {REPORTS.map(([v,l])=><button key={v} onClick={()=>setReport(v)} style={{padding:'6px 14px',borderRadius:8,border:'1px solid',fontSize:12.5,fontWeight:500,cursor:'pointer',background:report===v?ACCENT:'#fff',color:report===v?'#fff':'#6b7280',borderColor:report===v?ACCENT:'#e5e7eb'}}>{l}</button>)}
        </div>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        <span style={{color:'#94a3b8'}}>—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        {(dateFrom||dateTo)&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={()=>{setDateFrom('');setDateTo('');}}>✕ Clear</button>}
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)',marginBottom:14}}>
        {[{label:'Total Trips',value:filtered.length,icon:'briefcase',bg:'#fef2f2',color:ACCENT},{label:'Cash Collected',value:fmtPKRd(totalCash),icon:'store',bg:'#f0fdf4',color:'#10b981'},{label:'Trip Expenses',value:fmtPKRd(totalExpenses),icon:'breakdown',bg:'#fffbeb',color:'#f59e0b'},{label:'Fuel Cost',value:fmtPKRd(totalFuel),icon:'trending',bg:'#fef2f2',color:ACCENT},{label:'Maintenance',value:fmtPKRd(totalMaint),icon:'alert',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:16}}>{s.value}</div></div>
        ))}
      </div>

      {report==='summary'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">All Trips ({filtered.length})</div></div>
          <table className="pm-table">
            <thead><tr><th>Trip</th><th>Date</th><th>Driver</th><th>Route</th><th style={{textAlign:'right'}}>Cyl Out</th><th style={{textAlign:'right'}}>Cash Exp.</th><th style={{textAlign:'right'}}>Collected</th><th style={{textAlign:'right'}}>Expenses</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No trips in period</td></tr>
                :filtered.sort((a,b)=>b.date?.localeCompare(a.date)).map(t=>{
                  const sett=settles.find(s=>s.tripId===t.id);
                  return(<tr key={t.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{t.id}</td><td style={{color:'#9ca3af',fontSize:12}}>{t.date}</td><td style={{fontWeight:600}}>{t.driverName}</td><td style={{color:'#6b7280',fontSize:12}}>{t.routeName}</td><td style={{textAlign:'right',fontWeight:600}}>{t.emptiesOut||0}</td><td style={{textAlign:'right',color:'#374151'}}>{fmtPKRd(t.cashExpected)}</td><td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{sett?fmtPKRd(sett.cashSubmitted):'—'}</td><td style={{textAlign:'right',color:'#f59e0b'}}>{sett?fmtPKRd(sett.expenses):'—'}</td><td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:8,background:t.status==='settled'?'#f0fdf4':t.status==='in_transit'?'#eff6ff':'#f8fafc',color:t.status==='settled'?'#10b981':t.status==='in_transit'?'#3b82f6':'#94a3b8'}}>{t.status.replace('_',' ')}</span></td></tr>);
                })
              }
            </tbody>
          </table>
        </div>
      )}

      {report==='route'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Performance by Route</div></div>
          <table className="pm-table">
            <thead><tr><th>Route</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Settled</th><th style={{textAlign:'right'}}>Cash Collected</th><th style={{textAlign:'right'}}>Expenses</th><th style={{textAlign:'right'}}>Net Cash</th></tr></thead>
            <tbody>{byRoute.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>:byRoute.map(r=><tr key={r.id}><td style={{fontWeight:600}}>{r.name}<div style={{fontSize:11,color:'#94a3b8'}}>{r.code}</div></td><td style={{textAlign:'right'}}>{r.trips}</td><td style={{textAlign:'right',color:'#10b981'}}>{r.settled}</td><td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{fmtPKRd(r.cash)}</td><td style={{textAlign:'right',color:'#f59e0b'}}>{fmtPKRd(r.expenses)}</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT}}>{fmtPKRd(r.cash-r.expenses)}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {report==='driver'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Performance by Driver</div></div>
          <table className="pm-table">
            <thead><tr><th>Driver</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Settled</th><th style={{textAlign:'right'}}>Cash</th><th style={{textAlign:'right'}}>Variance</th><th style={{textAlign:'right'}}>Empties Out</th><th style={{textAlign:'right'}}>Returned</th><th style={{textAlign:'right'}}>Return %</th></tr></thead>
            <tbody>{byDriver.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>:byDriver.map(d=>{const rate=d.empties>0?((d.returned/d.empties)*100).toFixed(0):100;return(<tr key={d.id}><td style={{fontWeight:600}}>{d.name}</td><td style={{textAlign:'right'}}>{d.trips}</td><td style={{textAlign:'right',color:'#10b981'}}>{d.settled}</td><td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{fmtPKRd(d.cash)}</td><td style={{textAlign:'right',fontWeight:700,color:d.variance<0?ACCENT:'#10b981'}}>{fmtPKRd(Math.abs(d.variance))} {d.variance<0?'short':'surplus'}</td><td style={{textAlign:'right'}}>{d.empties}</td><td style={{textAlign:'right'}}>{d.returned}</td><td style={{textAlign:'right',fontWeight:700,color:parseFloat(rate)>=95?'#10b981':parseFloat(rate)>=80?'#f59e0b':ACCENT}}>{rate}%</td></tr>);})}</tbody>
          </table>
        </div>
      )}

      {report==='monthly'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Monthly Summary</div></div>
          <table className="pm-table">
            <thead><tr><th>Month</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Settled</th><th style={{textAlign:'right'}}>Settlement %</th></tr></thead>
            <tbody>{monthlyRows.length===0?<tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>:monthlyRows.map(([m,d])=><tr key={m}><td style={{fontWeight:600}}>{MONTHS[parseInt(m.split('-')[1])-1]} {m.split('-')[0]}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{d.trips}</td><td style={{textAlign:'right',color:'#10b981'}}>{d.settled}</td><td style={{textAlign:'right',fontWeight:700,color:d.trips>0?((d.settled/d.trips)>=0.9?'#10b981':'#f59e0b'):'#94a3b8'}}>{d.trips>0?((d.settled/d.trips)*100).toFixed(0):0}%</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
