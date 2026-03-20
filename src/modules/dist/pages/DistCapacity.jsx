import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';

export default function DistCapacity() {
  const { distVehicles, distRoutes, loadOrders, invMaterials } = useApp();
  const vehicles = distVehicles || [];
  const routes   = distRoutes   || [];
  const los      = loadOrders   || [];
  const mats     = invMaterials || [];

  const totalCapacity=vehicles.filter(v=>v.status==='active').reduce((s,v)=>s+(v.capacity||0),0);
  const todayLOs=los.filter(l=>l.date===new Date().toISOString().slice(0,10));
  const todayLoad=todayLOs.reduce((s,l)=>s+(l.totalCylinders||0),0);
  const utilization=totalCapacity>0?((todayLoad/totalCapacity)*100).toFixed(1):0;

  const matTotals=mats.filter(m=>m.status!=='inactive').map(m=>({...m,dailyAvg:Math.round((m.totalQty||0)/30)}));

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Capacity Planning</h2><p className="pm-page-sub">Fleet load capacity vs stock available vs daily demand forecast</p></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Fleet Capacity',value:`${totalCapacity} cyl`,icon:'truck',bg:'#fef2f2',color:ACCENT},{label:'Today Load',value:todayLoad,icon:'box',bg:'#eff6ff',color:'#3b82f6'},{label:'Utilization Today',value:`${utilization}%`,icon:'trending',bg:'#fffbeb',color:'#f59e0b'},{label:'Active Vehicles',value:vehicles.filter(v=>v.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Utilization bar */}
      <div className="pm-table-wrap" style={{marginBottom:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Fleet Utilization Today</div></div>
        <div style={{padding:'20px 24px'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8}}>
            <span style={{color:'#374151',fontWeight:500}}>Loaded Today: <strong style={{color:ACCENT}}>{todayLoad}</strong> / Capacity: <strong>{totalCapacity}</strong></span>
            <span style={{fontWeight:800,color:parseFloat(utilization)>90?'#ef4444':parseFloat(utilization)>70?'#f59e0b':'#10b981',fontSize:18}}>{utilization}%</span>
          </div>
          <div style={{height:16,background:'#f1f5f9',borderRadius:8,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${Math.min(parseFloat(utilization),100)}%`,background:parseFloat(utilization)>90?ACCENT:parseFloat(utilization)>70?'#f59e0b':'#10b981',borderRadius:8,transition:'width 0.7s'}}/>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Per vehicle capacity */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Vehicle Capacity</div></div>
          <table className="pm-table">
            <thead><tr><th>Vehicle</th><th>Type</th><th style={{textAlign:'right'}}>Capacity</th><th style={{textAlign:'right'}}>Today Loaded</th><th style={{textAlign:'right'}}>Free</th></tr></thead>
            <tbody>
              {vehicles.filter(v=>v.status==='active').map(v=>{
                const loaded=todayLOs.filter(l=>l.vehicleId===v.id).reduce((s,l)=>s+(l.totalCylinders||0),0);
                const free=(v.capacity||0)-loaded;
                return(<tr key={v.id}>
                  <td style={{fontWeight:600,color:ACCENT,fontFamily:'monospace'}}>{v.regNo}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{v.type}</td>
                  <td style={{textAlign:'right',fontWeight:700}}>{v.capacity} {v.capacityUnit}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:loaded>0?'#3b82f6':'#94a3b8'}}>{loaded}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:free>0?'#10b981':'#ef4444'}}>{free}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>

        {/* Stock available for dispatch */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Stock Available for Dispatch</div></div>
          <table className="pm-table">
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Total Stock</th><th style={{textAlign:'right'}}>Est. Daily Demand</th><th style={{textAlign:'right'}}>Days Cover</th></tr></thead>
            <tbody>
              {matTotals.map(m=>{
                const daysCover=m.dailyAvg>0?Math.floor((m.totalQty||0)/m.dailyAvg):999;
                return(<tr key={m.id}>
                  <td style={{fontWeight:600}}>{m.name}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{(m.totalQty||0).toLocaleString()}</td>
                  <td style={{textAlign:'right',color:'#6b7280'}}>{m.dailyAvg}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:daysCover<=3?'#ef4444':daysCover<=7?'#f59e0b':'#10b981'}}>{daysCover>=999?'∞':daysCover+'d'}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
