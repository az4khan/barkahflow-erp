import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd, STATUS_COLOR } from '../distConstants';

const ACCENT = '#ef4444';

export default function DistDashboard() {
  const { distRoutes, distVehicles, distDrivers, loadOrders, trips, settlements, fuelLog } = useApp();

  const routes   = distRoutes   || [];
  const vehicles = distVehicles || [];
  const drivers  = distDrivers  || [];
  const los      = loadOrders   || [];
  const allTrips = trips        || [];
  const settles  = settlements  || [];
  const fuel     = fuelLog      || [];

  const activeTrips    = allTrips.filter(t => t.status==='in_transit');
  const returningTrips = allTrips.filter(t => t.status==='returning');
  const pendingSettles = allTrips.filter(t => t.status==='returning');
  const todayTrips     = allTrips.filter(t => t.date===new Date().toISOString().slice(0,10));
  const totalCash      = settles.reduce((s,x) => s+(x.cashSubmitted||0), 0);
  const totalExpenses  = settles.reduce((s,x) => s+(x.expenses||0), 0);
  const fuelThisMonth  = fuel.filter(f=>f.date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,f)=>s+(f.totalCost||0),0);
  const maintenance    = vehicles.filter(v=>v.status==='maintenance');
  const serviceDue     = vehicles.filter(v=>v.nextServiceDue&&new Date(v.nextServiceDue)<=new Date(Date.now()+14*24*60*60*1000));

  // Monthly trips trend (last 6 months)
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-5+i);
    const key = d.toISOString().slice(0,7);
    return { label:d.toLocaleString('default',{month:'short'}), count:allTrips.filter(t=>t.date?.startsWith(key)).length };
  });
  const maxM = Math.max(...months.map(m=>m.count),1);

  // Route utilization
  const routeUtil = routes.map(r=>({
    ...r,
    tripCount:allTrips.filter(t=>t.routeId===r.id).length,
    settledCount:settles.filter(s=>allTrips.find(t=>t.id===s.tripId&&t.routeId===r.id)).length,
  }));

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Distribution Dashboard</h2><p className="pm-page-sub">Fleet operations, trip tracking & settlement overview</p></div>
        <div className="pm-page-actions">
          {(activeTrips.length+returningTrips.length)>0&&(
            <span style={{fontSize:12,fontWeight:600,background:'#fef2f2',color:ACCENT,padding:'5px 14px',borderRadius:20,border:'1px solid #fecaca'}}>
              {activeTrips.length} in transit · {returningTrips.length} returning
            </span>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(maintenance.length>0||pendingSettles.length>0||serviceDue.length>0)&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginBottom:16}}>
          {pendingSettles.length>0&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="bell" size={18} color="#f59e0b"/><span style={{fontSize:13,color:'#92400e'}}><strong>{pendingSettles.length} trips</strong> awaiting settlement</span></div>}
          {maintenance.length>0&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="alert" size={18} color={ACCENT}/><span style={{fontSize:13,color:'#991b1b'}}><strong>{maintenance.length} vehicle{maintenance.length>1?'s':''}</strong> in maintenance</span></div>}
          {serviceDue.length>0&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="alert" size={18} color="#f59e0b"/><span style={{fontSize:13,color:'#92400e'}}><strong>{serviceDue.length} vehicle{serviceDue.length>1?'s':''}</strong> due for service soon</span></div>}
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          {label:'Active Routes',    value:routes.filter(r=>r.status==='active').length, icon:'trending',  bg:'#fef2f2', color:ACCENT},
          {label:'Vehicles',         value:`${vehicles.filter(v=>v.status==='active').length}/${vehicles.length}`, icon:'truck', bg:'#fff7ed', color:'#f97316'},
          {label:'Drivers Active',   value:drivers.filter(d=>d.status==='active').length, icon:'users',    bg:'#eff6ff', color:'#3b82f6'},
          {label:'In Transit',       value:activeTrips.length,                            icon:'briefcase', bg:'#fef2f2', color:ACCENT},
          {label:'Cash Collected',   value:fmtPKRd(totalCash),                            icon:'store',     bg:'#f0fdf4', color:'#10b981'},
          {label:'Fuel This Month',  value:fmtPKRd(fuelThisMonth),                        icon:'breakdown', bg:'#fffbeb', color:'#f59e0b'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?14:22}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:14,marginBottom:14}}>
        {/* Monthly trend */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Monthly Trip Volume</div></div>
          <div style={{padding:'16px 18px 8px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:10,height:100}}>
              {months.map((m,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{fontSize:11,color:ACCENT,fontWeight:600}}>{m.count>0?m.count:''}</div>
                  <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:m.count>0?ACCENT:'#f1f5f9',height:`${Math.max((m.count/maxM)*80,m.count>0?6:2)}px`,minHeight:2}}/>
                  <div style={{fontSize:11,color:'#94a3b8'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle status */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Fleet Status</div></div>
          <div style={{padding:'12px 16px'}}>
            {[['Active','active','#10b981'],['Maintenance','maintenance','#ef4444'],['Inactive','inactive','#94a3b8']].map(([label,status,color])=>{
              const count=vehicles.filter(v=>v.status===status).length;
              return count>0?(
                <div key={label} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}>
                    <span style={{fontWeight:500}}>{label}</span>
                    <span style={{fontWeight:700,color}}>{count}</span>
                  </div>
                  <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(count/Math.max(vehicles.length,1))*100}%`,background:color,borderRadius:3}}/>
                  </div>
                </div>
              ):null;
            })}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Live trips */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Live Trips</div></div>
          <table className="pm-table">
            <thead><tr><th>Trip ID</th><th>Driver</th><th>Route</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>
              {allTrips.filter(t=>['in_transit','returning','loading'].includes(t.status)).length===0
                ? <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No active trips</td></tr>
                : allTrips.filter(t=>['in_transit','returning','loading'].includes(t.status)).map(t=>(
                  <tr key={t.id}>
                    <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{t.id}</td>
                    <td style={{fontWeight:600,fontSize:13}}>{t.driverName}</td>
                    <td style={{color:'#6b7280',fontSize:12}}>{t.routeName}</td>
                    <td style={{color:'#9ca3af',fontSize:12}}>{t.vehicleReg}</td>
                    <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:(STATUS_COLOR[t.status]||'#94a3b8')+'18',color:STATUS_COLOR[t.status]||'#94a3b8'}}>{t.status.replace('_',' ')}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Route utilization */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Route Utilization</div></div>
          <table className="pm-table">
            <thead><tr><th>Route</th><th>Stops</th><th style={{textAlign:'right'}}>Trips</th><th style={{textAlign:'right'}}>Settled</th><th>Status</th></tr></thead>
            <tbody>
              {routeUtil.map(r=>(
                <tr key={r.id}>
                  <td><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{r.code}</div></td>
                  <td style={{color:'#6b7280'}}>{r.stops}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{r.tripCount}</td>
                  <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{r.settledCount}</td>
                  <td><span className={`pm-badge ${r.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
