import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#ef4444';

export default function DistEmpties() {
  const { trips, settlements, distDrivers, distRoutes } = useApp();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const allTrips  = trips       || [];
  const settles   = settlements || [];
  const drivers   = distDrivers || [];
  const routes    = distRoutes  || [];

  const settled = allTrips.filter(t=>t.status==='settled'&&(!dateFrom||t.date>=dateFrom)&&(!dateTo||t.date<=dateTo));

  const totalOut      = settled.reduce((s,t)=>s+(t.emptiesOut||0),0);
  const totalReturned = settled.reduce((s,t)=>s+(t.emptiesReturned||0),0);
  const totalShort    = totalOut - totalReturned;
  const returnRate    = totalOut>0?((totalReturned/totalOut)*100).toFixed(1):0;

  // Per driver empties summary
  const driverEmpties = drivers.map(d=>{
    const dTrips=settled.filter(t=>t.driverId===d.id);
    const out=dTrips.reduce((s,t)=>s+(t.emptiesOut||0),0);
    const ret=dTrips.reduce((s,t)=>s+(t.emptiesReturned||0),0);
    return{...d,trips:dTrips.length,out,returned:ret,short:out-ret,rate:out>0?((ret/out)*100).toFixed(1):100};
  }).filter(d=>d.trips>0);

  // Per route empties
  const routeEmpties = routes.map(r=>{
    const rTrips=settled.filter(t=>t.routeId===r.id);
    const out=rTrips.reduce((s,t)=>s+(t.emptiesOut||0),0);
    const ret=rTrips.reduce((s,t)=>s+(t.emptiesReturned||0),0);
    return{...r,trips:rTrips.length,out,returned:ret,short:out-ret,rate:out>0?((ret/out)*100).toFixed(1):100};
  }).filter(r=>r.trips>0);

  // Trip-level detail
  const tripDetail = settled.map(t=>{
    const sett=settles.find(s=>s.tripId===t.id);
    return{...t,settEmpties:sett?.emptiesReturned||t.emptiesReturned||0};
  });

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Empties & Returns</h2><p className="pm-page-sub">Empty cylinder tracking — return rates per driver and route</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <div style={{display:'flex',gap:6}}>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
            <span style={{color:'#94a3b8',alignSelf:'center'}}>—</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
          </div>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Cylinders Out',value:totalOut,icon:'box',bg:'#fef2f2',color:ACCENT},{label:'Empties Returned',value:totalReturned,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Short / Missing',value:totalShort,icon:'alert',bg:totalShort>0?'#fef2f2':'#f0fdf4',color:totalShort>0?ACCENT:'#10b981'},{label:'Return Rate',value:`${returnRate}%`,icon:'trending',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?18:22}}>{s.value}</div></div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        {/* By Driver */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Empties by Driver</div></div>
          <table className="pm-table">
            <thead><tr><th>Driver</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Out</th><th style={{textAlign:'right'}}>Returned</th><th style={{textAlign:'right'}}>Short</th><th style={{textAlign:'right'}}>Rate</th></tr></thead>
            <tbody>
              {driverEmpties.length===0?<tr><td colSpan={6} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No data</td></tr>
                :driverEmpties.map(d=>(
                  <tr key={d.id}>
                    <td style={{fontWeight:600}}>{d.name}</td>
                    <td style={{textAlign:'right',color:'#9ca3af'}}>{d.trips}</td>
                    <td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{d.out}</td>
                    <td style={{textAlign:'right',fontWeight:600,color:'#10b981'}}>{d.returned}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:d.short>0?ACCENT:'#10b981'}}>{d.short}</td>
                    <td style={{textAlign:'right'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
                        <div style={{width:50,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(parseFloat(d.rate),100)}%`,background:parseFloat(d.rate)>=95?'#10b981':parseFloat(d.rate)>=80?'#f59e0b':'#ef4444',borderRadius:3}}/></div>
                        <span style={{fontSize:11,fontWeight:700,color:parseFloat(d.rate)>=95?'#10b981':parseFloat(d.rate)>=80?'#f59e0b':'#ef4444'}}>{d.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* By Route */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Empties by Route</div></div>
          <table className="pm-table">
            <thead><tr><th>Route</th><th style={{textAlign:'right'}}>Out</th><th style={{textAlign:'right'}}>Returned</th><th style={{textAlign:'right'}}>Short</th><th style={{textAlign:'right'}}>Rate</th></tr></thead>
            <tbody>
              {routeEmpties.length===0?<tr><td colSpan={5} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No data</td></tr>
                :routeEmpties.map(r=>(
                  <tr key={r.id}>
                    <td><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{r.code}</div></td>
                    <td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{r.out}</td>
                    <td style={{textAlign:'right',fontWeight:600,color:'#10b981'}}>{r.returned}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:r.short>0?ACCENT:'#94a3b8'}}>{r.short}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:parseFloat(r.rate)>=95?'#10b981':parseFloat(r.rate)>=80?'#f59e0b':'#ef4444'}}>{r.rate}%</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Trip-wise Empty Detail ({tripDetail.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Trip</th><th>Date</th><th>Driver</th><th>Route</th><th style={{textAlign:'right'}}>Sent Out</th><th style={{textAlign:'right'}}>Returned</th><th style={{textAlign:'right'}}>Short</th><th>Return %</th></tr></thead>
          <tbody>
            {tripDetail.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No settled trips in selected period</td></tr>
              :tripDetail.map(t=>{
                const short=(t.emptiesOut||0)-(t.settEmpties||0);
                const rate=t.emptiesOut>0?((t.settEmpties/t.emptiesOut)*100).toFixed(0):100;
                return(<tr key={t.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{t.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.date}</td>
                  <td style={{fontWeight:600,fontSize:13}}>{t.driverName}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{t.routeName}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{t.emptiesOut||0}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#10b981'}}>{t.settEmpties||0}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:short>0?ACCENT:'#10b981'}}>{short}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:50,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(parseFloat(rate),100)}%`,background:parseFloat(rate)>=95?'#10b981':parseFloat(rate)>=80?'#f59e0b':ACCENT,borderRadius:3}}/></div>
                      <span style={{fontSize:11,fontWeight:700,color:parseFloat(rate)>=95?'#10b981':parseFloat(rate)>=80?'#f59e0b':ACCENT}}>{rate}%</span>
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
