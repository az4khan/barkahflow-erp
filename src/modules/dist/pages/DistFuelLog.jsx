import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}

export default function DistFuelLog() {
  const { fuelLog, distVehicles, distDrivers, createFuelEntry } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 15;
  const [form, setForm] = useState({ vehicleId:'', driverId:'', date:'', litres:'', pricePerLitre:'285', station:'', odometer:'' });

  const fuel    = fuelLog      || [];
  const vehicles= distVehicles || [];
  const drivers = distDrivers  || [];

  const filtered=fuel.filter(f=>!search||(f.vehicleReg||'').toLowerCase().includes(search.toLowerCase())||(f.driverName||'').toLowerCase().includes(search.toLowerCase())||(f.station||'').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalCost   = fuel.reduce((s,f)=>s+(f.totalCost||0),0);
  const totalLitres = fuel.reduce((s,f)=>s+(f.litres||0),0);
  const thisMonth   = fuel.filter(f=>f.date?.startsWith(new Date().toISOString().slice(0,7)));
  const monthCost   = thisMonth.reduce((s,f)=>s+(f.totalCost||0),0);
  const avgPrice    = totalLitres>0?(totalCost/totalLitres).toFixed(0):0;

  function handleVehicleSelect(vId){
    const v=vehicles.find(x=>x.id===vId);
    const d=drivers.find(x=>x.id===v?.currentDriverId);
    setForm(f=>({...f,vehicleId:vId,vehicleReg:v?.regNo||'',driverId:d?.id||'',driverName:d?.name||'',odometer:String(v?.odometer||'')}));
  }

  function handleSave(){
    if(!form.vehicleId||!form.date||!form.litres)return;
    const litres=parseFloat(form.litres)||0;
    const ppl=parseFloat(form.pricePerLitre)||285;
    createFuelEntry({...form,litres,pricePerLitre:ppl,totalCost:litres*ppl,odometer:parseInt(form.odometer)||0});
    setShowForm(false);
    setForm({vehicleId:'',driverId:'',date:'',litres:'',pricePerLitre:'285',station:'',odometer:''});
  }

  // Per vehicle fuel cost
  const byVehicle=vehicles.map(v=>{
    const vFuel=fuel.filter(f=>f.vehicleId===v.id);
    return{...v,entries:vFuel.length,litres:vFuel.reduce((s,f)=>s+(f.litres||0),0),cost:vFuel.reduce((s,f)=>s+(f.totalCost||0),0)};
  }).filter(v=>v.entries>0);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Fuel Log</h2><p className="pm-page-sub">Vehicle fuel consumption tracking with cost analysis</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> Add Entry</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Fuel Cost',value:fmtPKRd(totalCost),icon:'store',bg:'#fef2f2',color:ACCENT},{label:'Total Litres',value:`${totalLitres.toLocaleString()} L`,icon:'box',bg:'#eff6ff',color:'#3b82f6'},{label:'This Month',value:fmtPKRd(monthCost),icon:'trending',bg:'#fffbeb',color:'#f59e0b'},{label:'Avg Price/L',value:`Rs ${avgPrice}`,icon:'briefcase',bg:'#f5f3ff',color:'#8b5cf6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* By vehicle */}
      <div className="pm-table-wrap" style={{marginBottom:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Fuel Cost by Vehicle</div></div>
        <div style={{padding:'14px 18px'}}>
          {byVehicle.map(v=>(
            <div key={v.id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                <span style={{fontWeight:600}}>{v.regNo} <span style={{color:'#94a3b8',fontSize:11,fontWeight:400}}>{v.type}</span></span>
                <span style={{display:'flex',gap:16}}>
                  <span style={{color:'#6b7280'}}>{v.litres.toFixed(0)} L</span>
                  <span style={{fontWeight:700,color:ACCENT}}>{fmtPKRd(v.cost)}</span>
                </span>
              </div>
              <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${totalCost>0?(v.cost/totalCost)*100:0}%`,background:ACCENT,borderRadius:3}}/>
              </div>
            </div>
          ))}
          {byVehicle.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:20,fontSize:13}}>No fuel data yet</div>}
        </div>
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div className="pm-table-title">Fuel Entries ({filtered.length})</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search vehicle, driver, station…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>ID</th><th>Date</th><th>Vehicle</th><th>Driver</th><th>Station</th><th style={{textAlign:'right'}}>Litres</th><th style={{textAlign:'right'}}>Price/L</th><th style={{textAlign:'right'}}>Total Cost</th><th style={{textAlign:'right'}}>Odometer</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No fuel entries yet</td></tr>
              :paged.map(f=>(
                <tr key={f.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{f.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{f.date}</td>
                  <td style={{fontWeight:600}}>{f.vehicleReg}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{f.driverName}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{f.station||'—'}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{f.litres} L</td>
                  <td style={{textAlign:'right',color:'#9ca3af'}}>Rs {f.pricePerLitre}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRd(f.totalCost)}</td>
                  <td style={{textAlign:'right',color:'#9ca3af',fontSize:12}}>{(f.odometer||0).toLocaleString()} km</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {showForm&&(
        <Modal title="Add Fuel Entry" onClose={()=>setShowForm(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>Vehicle *</label><select value={form.vehicleId} onChange={e=>handleVehicleSelect(e.target.value)}><option value="">— Select —</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>)}</select></div>
            <div className="pm-form-group"><label>Driver</label><select value={form.driverId} onChange={e=>{const d=drivers.find(x=>x.id===e.target.value);setForm(f=>({...f,driverId:e.target.value,driverName:d?.name||''}));}}><option value="">— Select —</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Litres *</label><input type="number" value={form.litres} onChange={e=>setForm(f=>({...f,litres:e.target.value}))} placeholder="0" autoFocus style={{fontSize:18,fontWeight:700}}/></div>
            <div className="pm-form-group"><label>Price per Litre (Rs)</label><input type="number" value={form.pricePerLitre} onChange={e=>setForm(f=>({...f,pricePerLitre:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Fuel Station</label><input value={form.station} onChange={e=>setForm(f=>({...f,station:e.target.value}))} placeholder="PSO / Shell / Total"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Odometer Reading (km)</label><input type="number" value={form.odometer} onChange={e=>setForm(f=>({...f,odometer:e.target.value}))}/></div>
          </div>
          {form.litres&&form.pricePerLitre&&(
            <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',marginTop:12,display:'flex',justifyContent:'space-between',fontSize:14}}>
              <span style={{color:'#374151'}}>Total Cost:</span>
              <strong style={{color:ACCENT}}>{fmtPKRd((parseFloat(form.litres)||0)*(parseFloat(form.pricePerLitre)||0))}</strong>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>Save Entry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
