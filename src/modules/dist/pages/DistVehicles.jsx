import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { VEHICLE_TYPES } from '../distConstants';

const ACCENT = '#ef4444';
const FUEL_TYPES = ['Diesel','Petrol','CNG','Electric'];

function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?660:500,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

const emptyForm = () => ({ regNo:'', type:'Truck', make:'', model:'', year:'', capacity:'', capacityUnit:'cylinders', fuelType:'Diesel', currentDriverId:'', status:'active', odometer:'', lastService:'', nextServiceDue:'' });

export default function DistVehicles() {
  const { distVehicles, distDrivers, createVehicle, updateVehicle, toggleVehicleStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [filter,   setFilter]   = useState('All');

  const vehicles = distVehicles || [];
  const drivers  = distDrivers  || [];

  const filtered = vehicles.filter(v => filter==='All' || v.status===filter || v.type===filter);

  function openCreate() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(v)  { setForm({ ...v, year:String(v.year||''), capacity:String(v.capacity||''), odometer:String(v.odometer||'') }); setEditId(v.id); setShowForm(true); }

  function handleSave() {
    if (!form.regNo) return;
    const data = { ...form, year:parseInt(form.year)||0, capacity:parseFloat(form.capacity)||0, odometer:parseInt(form.odometer)||0 };
    editId ? updateVehicle(editId, data) : createVehicle(data);
    setShowForm(false);
  }

  const statusColor = { active:'#10b981', maintenance:'#ef4444', inactive:'#94a3b8' };
  const statusBg    = { active:'#f0fdf4', maintenance:'#fef2f2', inactive:'#f8fafc' };

  const daysUntilService = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date)-new Date())/(1000*60*60*24));
    return diff;
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Vehicle Master</h2><p className="pm-page-sub">Fleet registry — trucks, tankers, capacity and service tracking</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> Add Vehicle</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[{label:'Total Fleet',value:vehicles.length,icon:'truck',bg:'#fef2f2',color:ACCENT},{label:'Active',value:vehicles.filter(v=>v.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'In Maintenance',value:vehicles.filter(v=>v.status==='maintenance').length,icon:'alert',bg:'#fef2f2',color:'#ef4444'},{label:'Total Capacity',value:`${vehicles.reduce((s,v)=>s+(v.capacity||0),0)} cyl`,icon:'box',bg:'#eff6ff',color:'#3b82f6'},{label:'Service Due ≤14d',value:vehicles.filter(v=>{ const d=daysUntilService(v.nextServiceDue); return d!==null&&d<=14; }).length,icon:'bell',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {['All','active','maintenance','inactive',...VEHICLE_TYPES].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 12px',borderRadius:20,border:'1px solid',fontSize:11.5,fontWeight:500,cursor:'pointer',background:filter===f?ACCENT:'#fff',color:filter===f?'#fff':'#6b7280',borderColor:filter===f?ACCENT:'#e5e7eb',textTransform:'capitalize'}}>{f}</button>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Vehicles ({filtered.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Reg No</th><th>Type</th><th>Make / Model</th><th>Year</th><th>Capacity</th><th>Driver</th><th>Odometer</th><th>Last Service</th><th>Next Service</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={11} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No vehicles found</td></tr>
              :filtered.map(v=>{
                const drv=drivers.find(d=>d.id===v.currentDriverId);
                const daysLeft=daysUntilService(v.nextServiceDue);
                const serviceUrgent=daysLeft!==null&&daysLeft<=14;
                return(<tr key={v.id} style={{background:v.status==='maintenance'?'#fff8f8':undefined}}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{v.regNo}</td>
                  <td style={{fontSize:12,color:'#374151'}}>{v.type}</td>
                  <td><div style={{fontWeight:600}}>{v.make} {v.model}</div></td>
                  <td style={{color:'#9ca3af'}}>{v.year}</td>
                  <td style={{fontWeight:600}}>{v.capacity} {v.capacityUnit}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{drv?.name||'—'}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{(v.odometer||0).toLocaleString()} km</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{v.lastService||'—'}</td>
                  <td style={{color:serviceUrgent?'#ef4444':'#9ca3af',fontWeight:serviceUrgent?700:400,fontSize:12}}>
                    {v.nextServiceDue||'—'}{serviceUrgent&&daysLeft>=0?` (${daysLeft}d)`:daysLeft<0?' (overdue)':''}
                  </td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:statusBg[v.status]||'#f8fafc',color:statusColor[v.status]||'#94a3b8'}}>{v.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>openEdit(v)}>Edit</button>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>toggleVehicleStatus(v.id)}>{v.status==='active'?'→Maint':v.status==='maintenance'?'→Active':'→Active'}</button>
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>

      {showForm&&(
        <Modal title={editId?'Edit Vehicle':'Add Vehicle'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div className="pm-form-group"><label>Reg No *</label><input value={form.regNo} onChange={e=>setForm(f=>({...f,regNo:e.target.value.toUpperCase()}))} placeholder="LHR-1234" disabled={!!editId}/></div>
            <div className="pm-form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{VEHICLE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Make</label><input value={form.make} onChange={e=>setForm(f=>({...f,make:e.target.value}))} placeholder="Isuzu"/></div>
            <div className="pm-form-group"><label>Model</label><input value={form.model} onChange={e=>setForm(f=>({...f,model:e.target.value}))} placeholder="NPR"/></div>
            <div className="pm-form-group"><label>Year</label><input type="number" value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="2021"/></div>
            <div className="pm-form-group"><label>Fuel Type</label><select value={form.fuelType} onChange={e=>setForm(f=>({...f,fuelType:e.target.value}))}>{FUEL_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} placeholder="80"/></div>
            <div className="pm-form-group"><label>Capacity Unit</label><select value={form.capacityUnit} onChange={e=>setForm(f=>({...f,capacityUnit:e.target.value}))}><option value="cylinders">Cylinders</option><option value="MT">MT</option><option value="litres">Litres</option></select></div>
            <div className="pm-form-group"><label>Odometer (km)</label><input type="number" value={form.odometer} onChange={e=>setForm(f=>({...f,odometer:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Assigned Driver</label><select value={form.currentDriverId} onChange={e=>setForm(f=>({...f,currentDriverId:e.target.value}))}><option value="">— None —</option>{(drivers||[]).filter(d=>d.status==='active').map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Last Service</label><input type="date" value={form.lastService||''} onChange={e=>setForm(f=>({...f,lastService:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Next Service Due</label><input type="date" value={form.nextServiceDue||''} onChange={e=>setForm(f=>({...f,nextServiceDue:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save Changes':'Add Vehicle'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
