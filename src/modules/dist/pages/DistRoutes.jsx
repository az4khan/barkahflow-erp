import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#ef4444';
const CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad'];

function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?660:500,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

const emptyForm = () => ({ code:'', name:'', city:'Lahore', zones:'', stops:'', distanceKm:'', defaultVehicleId:'', defaultDriverId:'', status:'active', notes:'' });

export default function DistRoutes() {
  const { distRoutes, distVehicles, distDrivers, createDistRoute, updateDistRoute, toggleDistRouteStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [viewRoute,setViewRoute]= useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [search,   setSearch]   = useState('');

  const routes  = distRoutes  || [];
  const vehicles= distVehicles|| [];
  const drivers = distDrivers || [];

  const filtered = routes.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()));

  function openCreate() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(r)  { setForm({ ...r, zones:Array.isArray(r.zones)?r.zones.join(', '):r.zones||'', stops:String(r.stops||''), distanceKm:String(r.distanceKm||'') }); setEditId(r.id); setShowForm(true); }

  function handleSave() {
    if (!form.name||!form.code) return;
    const data = { ...form, zones:form.zones.split(',').map(z=>z.trim()).filter(Boolean), stops:parseInt(form.stops)||0, distanceKm:parseFloat(form.distanceKm)||0 };
    editId ? updateDistRoute(editId, data) : createDistRoute(data);
    setShowForm(false);
  }

  function getDriver(id) { return drivers.find(d=>d.id===id); }
  function getVehicle(id){ return vehicles.find(v=>v.id===id); }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Route Master</h2><p className="pm-page-sub">Define delivery routes, zones, and default vehicle/driver assignments</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Route</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Routes',value:routes.length,icon:'trending',bg:'#fef2f2',color:ACCENT},{label:'Active',value:routes.filter(r=>r.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Total Stops',value:routes.reduce((s,r)=>s+(r.stops||0),0),icon:'store',bg:'#eff6ff',color:'#3b82f6'},{label:'Total Distance',value:`${routes.reduce((s,r)=>s+(r.distanceKm||0),0)} km`,icon:'truck',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:300}}>
          <Icon name="search" size={14} color="#94a3b8"/>
          <input placeholder="Search route name, code, city…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {filtered.map(r=>{
          const drv=getDriver(r.defaultDriverId);
          const veh=getVehicle(r.defaultVehicleId);
          return(
            <div key={r.id} className="pm-card" style={{borderLeft:`4px solid ${r.status==='active'?ACCENT:'#94a3b8'}`}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:700,background:ACCENT+'18',color:ACCENT,padding:'1px 8px',borderRadius:8}}>{r.code}</span>
                    <span className={`pm-badge ${r.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{r.status}</span>
                  </div>
                  <div style={{fontWeight:700,color:'#0f172a',fontSize:14}}>{r.name}</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{r.city}</div>
                </div>
                <div style={{display:'flex',gap:4}}>
                  <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setViewRoute(r)}>View</button>
                  <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEdit(r)}>Edit</button>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
                {[['Stops',r.stops||0],['Distance',`${r.distanceKm||0}km`],['Zones',(Array.isArray(r.zones)?r.zones:r.zones?.split(',')||[]).length]].map(([l,v])=>(
                  <div key={l} style={{background:'#f8fafc',borderRadius:7,padding:'7px 10px',textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#94a3b8'}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{v}</div>
                  </div>
                ))}
              </div>

              {(drv||veh)&&(
                <div style={{display:'flex',gap:8,paddingTop:8,borderTop:'1px solid #f1f5f9',fontSize:12}}>
                  {veh&&<div style={{display:'flex',alignItems:'center',gap:5,color:'#6b7280'}}><Icon name="truck" size={12} color="#94a3b8"/>{veh.regNo}</div>}
                  {drv&&<div style={{display:'flex',alignItems:'center',gap:5,color:'#6b7280'}}><Icon name="users" size={12} color="#94a3b8"/>{drv.name}</div>}
                </div>
              )}

              <div style={{marginTop:8}}>
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                  {(Array.isArray(r.zones)?r.zones:r.zones?.split(',')||[]).slice(0,4).map((z,i)=>(
                    <span key={i} style={{fontSize:10.5,background:'#f0f9ff',color:'#0369a1',padding:'2px 7px',borderRadius:10}}>{z.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0&&<div className="pm-table-wrap"><div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:13}}>No routes found</div></div>}

      {viewRoute&&(
        <Modal title={`Route: ${viewRoute.name}`} onClose={()=>setViewRoute(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
            {[['Code',viewRoute.code],['City',viewRoute.city],['Stops',viewRoute.stops],['Distance',`${viewRoute.distanceKm}km`],['Vehicle',getVehicle(viewRoute.defaultVehicleId)?.regNo||'—'],['Driver',getDriver(viewRoute.defaultDriverId)?.name||'—'],['Status',viewRoute.status]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>Zones / Areas</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {(Array.isArray(viewRoute.zones)?viewRoute.zones:viewRoute.zones?.split(',')||[]).map((z,i)=>(
                <span key={i} style={{fontSize:12,background:'#f0f9ff',color:'#0369a1',padding:'4px 12px',borderRadius:20}}>{z.trim()}</span>
              ))}
            </div>
          </div>
          {viewRoute.notes&&<div style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:14}}>{viewRoute.notes}</div>}
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>toggleDistRouteStatus(viewRoute.id)}>{viewRoute.status==='active'?'Deactivate':'Activate'}</button>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewRoute(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showForm&&(
        <Modal title={editId?'Edit Route':'New Route'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div className="pm-form-group"><label>Code *</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="DHA" disabled={!!editId}/></div>
            <div className="pm-form-group" style={{gridColumn:'span 2'}}><label>Route Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. DHA / Cantt Route"/></div>
            <div className="pm-form-group"><label>City</label><select value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="pm-form-group"><label>No. of Stops</label><input type="number" value={form.stops} onChange={e=>setForm(f=>({...f,stops:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Distance (km)</label><input type="number" value={form.distanceKm} onChange={e=>setForm(f=>({...f,distanceKm:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Zones / Areas (comma separated)</label><input value={form.zones} onChange={e=>setForm(f=>({...f,zones:e.target.value}))} placeholder="DHA Phase 1, DHA Phase 2, Cantonment"/></div>
            <div className="pm-form-group"><label>Default Vehicle</label><select value={form.defaultVehicleId} onChange={e=>setForm(f=>({...f,defaultVehicleId:e.target.value}))}><option value="">— None —</option>{vehicles.filter(v=>v.status==='active').map(v=><option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>)}</select></div>
            <div className="pm-form-group"><label>Default Driver</label><select value={form.defaultDriverId} onChange={e=>setForm(f=>({...f,defaultDriverId:e.target.value}))}><option value="">— None —</option>{drivers.filter(d=>d.status==='active').map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Notes</label><textarea value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{resize:'vertical'}}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save Changes':'Create Route'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
