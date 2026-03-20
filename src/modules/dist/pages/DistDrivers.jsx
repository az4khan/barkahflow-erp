import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#ef4444';

function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:580,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

const emptyForm = ()=>({ name:'', cnic:'', phone:'', license:'', licenseExpiry:'', assignedVehicleId:'', assignedRouteId:'', joiningDate:'', status:'active', rating:4, notes:'' });

export default function DistDrivers() {
  const { distDrivers, distVehicles, distRoutes, trips, settlements, createDriver, updateDriver } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [search,   setSearch]   = useState('');

  const drivers  = distDrivers  || [];
  const vehicles = distVehicles || [];
  const routes   = distRoutes   || [];
  const allTrips = trips        || [];

  const filtered = drivers.filter(d=>!search||(d.name||'').toLowerCase().includes(search.toLowerCase())||(d.phone||'').includes(search));

  function openCreate(){setForm(emptyForm());setEditId(null);setShowForm(true);}
  function openEdit(d) {setForm({...d,rating:String(d.rating||4)});setEditId(d.id);setShowForm(true);}
  function handleSave(){
    if(!form.name)return;
    const data={...form,rating:parseFloat(form.rating)||4};
    editId?updateDriver(editId,data):createDriver(data);
    setShowForm(false);
  }

  function driverStats(drvId){
    const dTrips=allTrips.filter(t=>t.driverId===drvId);
    const settled=dTrips.filter(t=>t.status==='settled');
    const cash=settled.reduce((s,t)=>s+(t.cashCollected||0),0);
    return{trips:dTrips.length,settled:settled.length,cash};
  }

  const licenseExpiringSoon = drivers.filter(d=>{
    if(!d.licenseExpiry)return false;
    const days=Math.ceil((new Date(d.licenseExpiry)-new Date())/(1000*60*60*24));
    return days<=30&&days>=0;
  });

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Driver Master</h2><p className="pm-page-sub">Driver registry, license tracking, route and vehicle assignments</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> Add Driver</button>
        </div>
      </div>

      {licenseExpiringSoon.length>0&&(
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <Icon name="alert" size={18} color="#f59e0b"/>
          <span style={{fontSize:13,color:'#92400e'}}><strong>{licenseExpiringSoon.length} driver{licenseExpiringSoon.length>1?'s':''}</strong> have licenses expiring within 30 days: {licenseExpiringSoon.map(d=>d.name).join(', ')}</span>
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Drivers',value:drivers.length,icon:'users',bg:'#fef2f2',color:ACCENT},{label:'Active',value:drivers.filter(d=>d.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Assigned',value:drivers.filter(d=>d.assignedVehicleId).length,icon:'truck',bg:'#eff6ff',color:'#3b82f6'},{label:'License Expiring',value:licenseExpiringSoon.length,icon:'bell',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:300}}>
          <Icon name="search" size={14} color="#94a3b8"/>
          <input placeholder="Search name or phone…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
        </div>
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Drivers ({filtered.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Driver</th><th>Phone</th><th>License</th><th>Expiry</th><th>Vehicle</th><th>Route</th><th>Trips</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No drivers found</td></tr>
              :filtered.map(d=>{
                const veh=vehicles.find(v=>v.id===d.assignedVehicleId);
                const route=routes.find(r=>r.id===d.assignedRouteId);
                const stats=driverStats(d.id);
                const expiring=d.licenseExpiry&&Math.ceil((new Date(d.licenseExpiry)-new Date())/(1000*60*60*24))<=30;
                return(<tr key={d.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:ACCENT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{d.name[0]}</div>
                      <div><div style={{fontWeight:600,color:'#0f172a'}}>{d.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{d.cnic}</div></div>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{d.phone}</td>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'#374151'}}>{d.license}</td>
                  <td style={{color:expiring?'#ef4444':'#9ca3af',fontWeight:expiring?700:400,fontSize:12}}>{d.licenseExpiry||'—'}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{veh?.regNo||'—'}</td>
                  <td style={{fontSize:12,color:'#6b7280',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{route?.name||'—'}</td>
                  <td style={{fontWeight:600,color:ACCENT}}>{stats.trips}</td>
                  <td style={{fontSize:13}}>{'★'.repeat(Math.round(d.rating||0))}{'☆'.repeat(5-Math.round(d.rating||0))}</td>
                  <td><span className={`pm-badge ${d.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{d.status}</span></td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEdit(d)}>Edit</button></td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>

      {showForm&&(
        <Modal title={editId?'Edit Driver':'Add Driver'} onClose={()=>setShowForm(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Full Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Driver's full name"/></div>
            <div className="pm-form-group"><label>CNIC</label><input value={form.cnic||''} onChange={e=>setForm(f=>({...f,cnic:e.target.value}))} placeholder="35201-xxxxxxx-x"/></div>
            <div className="pm-form-group"><label>Phone</label><input value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+92-300-xxxxxxx"/></div>
            <div className="pm-form-group"><label>License No</label><input value={form.license||''} onChange={e=>setForm(f=>({...f,license:e.target.value}))} placeholder="LHR-D-xxx"/></div>
            <div className="pm-form-group"><label>License Expiry</label><input type="date" value={form.licenseExpiry||''} onChange={e=>setForm(f=>({...f,licenseExpiry:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Assigned Vehicle</label><select value={form.assignedVehicleId||''} onChange={e=>setForm(f=>({...f,assignedVehicleId:e.target.value}))}><option value="">— None —</option>{vehicles.filter(v=>v.status==='active').map(v=><option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>)}</select></div>
            <div className="pm-form-group"><label>Assigned Route</label><select value={form.assignedRouteId||''} onChange={e=>setForm(f=>({...f,assignedRouteId:e.target.value}))}><option value="">— None —</option>{routes.filter(r=>r.status==='active').map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Joining Date</label><input type="date" value={form.joiningDate||''} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Rating (1-5)</label><select value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}>{[1,2,3,4,5].map(r=><option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}</select></div>
            <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Notes</label><textarea value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{resize:'vertical'}}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save':'Add Driver'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
