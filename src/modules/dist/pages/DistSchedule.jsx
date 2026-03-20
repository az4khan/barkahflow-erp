import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { STATUS_COLOR } from '../distConstants';

const ACCENT = '#ef4444';

export default function DistSchedule() {
  const { trips, loadOrders, distRoutes, distDrivers, distVehicles } = useApp();
  const [viewMonth, setViewMonth] = useState(new Date().toISOString().slice(0,7));

  const allTrips = trips      || [];
  const los      = loadOrders || [];
  const routes   = distRoutes || [];
  const drivers  = distDrivers|| [];
  const vehicles = distVehicles||[];

  // Build calendar days for the month
  const [year, month] = viewMonth.split('-').map(Number);
  const daysInMonth   = new Date(year, month, 0).getDate();
  const firstDayOfWeek= new Date(year, month-1, 1).getDay();
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const monthTrips = allTrips.filter(t=>t.date?.startsWith(viewMonth));
  const monthLOs   = los.filter(l=>l.date?.startsWith(viewMonth));

  function tripsForDay(day) {
    const dateStr = `${viewMonth}-${String(day).padStart(2,'0')}`;
    return monthTrips.filter(t=>t.date===dateStr);
  }

  const prevMonth=()=>{ const d=new Date(year,month-2,1); setViewMonth(d.toISOString().slice(0,7)); };
  const nextMonth=()=>{ const d=new Date(year,month,  1); setViewMonth(d.toISOString().slice(0,7)); };

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Delivery Schedule</h2><p className="pm-page-sub">Calendar view of planned and completed trips by date</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-ghost" style={{padding:'6px 12px'}} onClick={prevMonth}>‹</button>
          <span style={{fontSize:14,fontWeight:700,color:'#0f172a',minWidth:120,textAlign:'center'}}>{new Date(year,month-1).toLocaleString('default',{month:'long',year:'numeric'})}</span>
          <button className="pm-btn pm-btn-ghost" style={{padding:'6px 12px'}} onClick={nextMonth}>›</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
        {[{label:'Trips This Month',value:monthTrips.length,icon:'briefcase',bg:'#fef2f2',color:ACCENT},{label:'Settled',value:monthTrips.filter(t=>t.status==='settled').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'In Transit',value:monthTrips.filter(t=>t.status==='in_transit').length,icon:'truck',bg:'#eff6ff',color:'#3b82f6'},{label:'Load Orders',value:monthLOs.length,icon:'box',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>
        ))}
      </div>

      {/* Calendar */}
      <div className="pm-table-wrap">
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:'1px solid #f1f5f9'}}>
          {DAYS.map(d=><div key={d} style={{padding:'10px',textAlign:'center',fontSize:12,fontWeight:700,color:'#94a3b8'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {/* Empty cells for first week */}
          {Array.from({length:firstDayOfWeek},(_,i)=>(
            <div key={`empty-${i}`} style={{minHeight:80,borderRight:'1px solid #f8fafc',borderBottom:'1px solid #f8fafc',background:'#fafafa'}}/>
          ))}
          {/* Day cells */}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1;
            const dayTrips=tripsForDay(day);
            const isToday=new Date().toISOString().slice(0,10)===`${viewMonth}-${String(day).padStart(2,'0')}`;
            return(
              <div key={day} style={{minHeight:80,borderRight:'1px solid #f8fafc',borderBottom:'1px solid #f8fafc',padding:'6px',background:isToday?'#fff7ed':'#fff'}}>
                <div style={{fontSize:12,fontWeight:isToday?800:500,color:isToday?ACCENT:'#374151',marginBottom:4,width:22,height:22,borderRadius:'50%',background:isToday?ACCENT:'transparent',color:isToday?'#fff':'#374151',display:'flex',alignItems:'center',justifyContent:'center'}}>{day}</div>
                {dayTrips.slice(0,3).map(t=>(
                  <div key={t.id} style={{fontSize:10,fontWeight:600,padding:'2px 5px',borderRadius:4,marginBottom:2,background:(STATUS_COLOR[t.status]||'#94a3b8')+'20',color:STATUS_COLOR[t.status]||'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {t.driverName?.split(' ')[0]} · {t.routeName?.slice(0,8)}
                  </div>
                ))}
                {dayTrips.length>3&&<div style={{fontSize:10,color:'#94a3b8'}}>+{dayTrips.length-3} more</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route schedule matrix */}
      <div className="pm-table-wrap" style={{marginTop:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Route Activity — {new Date(year,month-1).toLocaleString('default',{month:'long'})}</div></div>
        <table className="pm-table">
          <thead><tr><th>Route</th><th>Driver</th><th>Vehicle</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Settled</th><th style={{textAlign:'right'}}>In Progress</th></tr></thead>
          <tbody>
            {routes.map(r=>{
              const rTrips=monthTrips.filter(t=>t.routeId===r.id);
              const drv=drivers.find(d=>d.id===r.defaultDriverId);
              const veh=vehicles.find(v=>v.id===r.defaultVehicleId);
              return(<tr key={r.id}>
                <td style={{fontWeight:600}}>{r.name}</td>
                <td style={{color:'#6b7280',fontSize:12}}>{drv?.name||'—'}</td>
                <td style={{color:'#9ca3af',fontSize:12}}>{veh?.regNo||'—'}</td>
                <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{rTrips.length}</td>
                <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{rTrips.filter(t=>t.status==='settled').length}</td>
                <td style={{textAlign:'right',color:'#3b82f6',fontWeight:600}}>{rTrips.filter(t=>['in_transit','loading','returning'].includes(t.status)).length}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
