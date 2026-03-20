import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
const MAINT_TYPES = ['Oil Change','Tyre Change','Brake Repair','Engine Service','Battery','Suspension','Electrical','Body Work','Annual Service','Other'];

function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:540,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function DistMaintenance() {
  const { maintenance, distVehicles, createMaintenanceRecord } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const records  = maintenance  || [];
  const vehicles = distVehicles || [];

  const [form, setForm] = useState({ vehicleId:'', type:'Oil Change', date:'', cost:'', odometer:'', vendor:'', notes:'', nextDueDate:'', nextDueOdo:'', status:'done' });

  function handleVehicleSelect(vId) {
    const v=vehicles.find(x=>x.id===vId);
    setForm(f=>({...f,vehicleId:vId,vehicleReg:v?.regNo||'',odometer:String(v?.odometer||'')}));
  }

  function handleSave(){
    if(!form.vehicleId||!form.date)return;
    createMaintenanceRecord({...form,cost:parseFloat(form.cost)||0,odometer:parseInt(form.odometer)||0,nextDueOdo:parseInt(form.nextDueOdo)||0});
    setShowForm(false);
    setForm({vehicleId:'',type:'Oil Change',date:'',cost:'',odometer:'',vendor:'',notes:'',nextDueDate:'',nextDueOdo:'',status:'done'});
  }

  const filtered = records.filter(r=>(filter==='All'||r.type===filter)&&(!search||(r.vehicleReg||'').toLowerCase().includes(search.toLowerCase())||(r.type||'').toLowerCase().includes(search.toLowerCase())||(r.vendor||'').toLowerCase().includes(search.toLowerCase())));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalCost=records.reduce((s,r)=>s+(r.cost||0),0);
  const serviceDue=vehicles.filter(v=>v.nextServiceDue&&new Date(v.nextServiceDue)<=new Date(Date.now()+14*24*60*60*1000)&&v.status==='active');

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Maintenance Log</h2><p className="pm-page-sub">Vehicle service history, costs, and upcoming service tracking</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> Log Maintenance</button>
        </div>
      </div>

      {serviceDue.length>0&&(
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <Icon name="bell" size={18} color="#f59e0b"/>
          <span style={{fontSize:13,color:'#92400e'}}>Service due within 14 days: <strong>{serviceDue.map(v=>`${v.regNo} (${v.nextServiceDue})`).join(', ')}</strong></span>
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Records',value:records.length,icon:'list',bg:'#fef2f2',color:ACCENT},{label:'Total Cost',value:fmtPKRd(totalCost),icon:'briefcase',bg:'#fffbeb',color:'#f59e0b'},{label:'This Month',value:fmtPKRd(records.filter(r=>r.date?.startsWith(new Date().toISOString().slice(0,7))).reduce((s,r)=>s+(r.cost||0),0)),icon:'trending',bg:'#eff6ff',color:'#3b82f6'},{label:'Due Soon',value:serviceDue.length,icon:'alert',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Per vehicle cost summary */}
      <div className="pm-table-wrap" style={{marginBottom:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Cost by Vehicle</div></div>
        <div style={{padding:'14px 18px',display:'flex',gap:12,flexWrap:'wrap'}}>
          {vehicles.map(v=>{
            const cost=records.filter(r=>r.vehicleId===v.id).reduce((s,r)=>s+(r.cost||0),0);
            const count=records.filter(r=>r.vehicleId===v.id).length;
            if(!count)return null;
            return(
              <div key={v.id} style={{background:'#f8fafc',borderRadius:10,padding:'12px 16px',minWidth:140}}>
                <div style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:12}}>{v.regNo}</div>
                <div style={{fontSize:11,color:'#94a3b8',marginBottom:6}}>{v.type} · {count} records</div>
                <div style={{fontSize:16,fontWeight:800,color:'#0f172a'}}>{fmtPKRd(cost)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {['All',...MAINT_TYPES.slice(0,6)].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 10px',borderRadius:20,border:'1px solid',fontSize:11,cursor:'pointer',background:filter===f?ACCENT:'#fff',color:filter===f?'#fff':'#6b7280',borderColor:filter===f?ACCENT:'#e5e7eb'}}>{f}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search vehicle, type, vendor…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Date</th><th>Vendor</th><th style={{textAlign:'right'}}>Cost</th><th style={{textAlign:'right'}}>Odometer</th><th>Next Due</th><th>Notes</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No maintenance records</td></tr>
              :paged.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{r.id}</td>
                  <td style={{fontWeight:600}}>{r.vehicleReg}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:'#fef2f2',color:ACCENT}}>{r.type}</span></td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{r.date}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{r.vendor||'—'}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#f59e0b'}}>{fmtPKRd(r.cost)}</td>
                  <td style={{textAlign:'right',color:'#9ca3af',fontSize:12}}>{(r.odometer||0).toLocaleString()} km</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{r.nextDueDate||'—'}</td>
                  <td style={{color:'#9ca3af',fontSize:11,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.notes||'—'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {showForm&&(
        <Modal title="Log Maintenance" onClose={()=>setShowForm(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>Vehicle *</label><select value={form.vehicleId} onChange={e=>handleVehicleSelect(e.target.value)}><option value="">— Select —</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>)}</select></div>
            <div className="pm-form-group"><label>Maintenance Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{MAINT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Cost (Rs)</label><input type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Odometer (km)</label><input type="number" value={form.odometer} onChange={e=>setForm(f=>({...f,odometer:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Vendor / Workshop</label><input value={form.vendor} onChange={e=>setForm(f=>({...f,vendor:e.target.value}))} placeholder="Workshop name"/></div>
            <div className="pm-form-group"><label>Next Service Date</label><input type="date" value={form.nextDueDate} onChange={e=>setForm(f=>({...f,nextDueDate:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Next Service Odometer</label><input type="number" value={form.nextDueOdo} onChange={e=>setForm(f=>({...f,nextDueOdo:e.target.value}))}/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Notes</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Work done, parts replaced, etc." style={{resize:'vertical'}}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>Save Record</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
