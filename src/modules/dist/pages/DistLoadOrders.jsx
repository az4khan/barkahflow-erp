import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?720:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function DistLoadOrders() {
  const { distRoutes, distVehicles, distDrivers, warehouses, invMaterials, loadOrders, createLoadOrder, dispatchLoadOrder, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [viewLO,   setViewLO]   = useState(null);
  const [search,   setSearch]   = useState('');
  const [stFilter, setStFilter] = useState('All');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const los     = loadOrders  || [];
  const routes  = (distRoutes||[]).filter(r=>r.status==='active');
  const vehicles= (distVehicles||[]).filter(v=>v.status==='active');
  const drivers = (distDrivers||[]).filter(d=>d.status==='active');
  const whs     = (warehouses||[]).filter(w=>w.status==='active');
  const mats    = (invMaterials||[]).filter(m=>m.status!=='inactive'&&m.totalQty>0);

  const [form, setForm] = useState({ routeId:'', vehicleId:'', driverId:'', warehouseId:'', date:'', notes:'', items:[] });
  const [item, setItem] = useState({ materialId:'', qty:'' });

  const filtered = los.filter(l=>(stFilter==='All'||l.status===stFilter)&&(!search||(l.id||'').toLowerCase().includes(search.toLowerCase())||(l.routeName||'').toLowerCase().includes(search.toLowerCase())));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  function handleRouteChange(routeId) {
    const r=routes.find(x=>x.id===routeId);
    setForm(f=>({...f,routeId,vehicleId:r?.defaultVehicleId||'',driverId:r?.defaultDriverId||'',warehouseId:'WH-001'}));
  }
  function addItem(){
    const mat=mats.find(m=>m.id===item.materialId);
    if(!mat||!item.qty)return;
    const qty=parseInt(item.qty)||0;
    setForm(f=>({...f,items:[...f.items.filter(i=>i.materialId!==mat.id),{materialId:mat.id,materialName:mat.name,unit:mat.unit,qty,available:mat.totalQty}]}));
    setItem({materialId:'',qty:''});
  }
  function handleCreate(){
    if(!form.routeId||!form.vehicleId||!form.driverId||!form.items.length||!form.date){toast('Fill all required fields','error');return;}
    const route=routes.find(r=>r.id===form.routeId);
    const total=form.items.reduce((s,i)=>s+i.qty,0);
    createLoadOrder({...form,routeName:route?.name||'',totalCylinders:total});
    setShowForm(false);
    setForm({routeId:'',vehicleId:'',driverId:'',warehouseId:'',date:'',notes:'',items:[]});
  }

  const vehicleName=id=>distVehicles?.find(v=>v.id===id)?.regNo||id;
  const driverName=id=>distDrivers?.find(d=>d.id===id)?.name||id;

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Load Orders</h2><p className="pm-page-sub">Plan cylinder loads per trip — dispatching creates trip sheet + issues stock</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>{setForm({routeId:'',vehicleId:'',driverId:'',warehouseId:'',date:'',notes:'',items:[]});setShowForm(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New Load Order
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total',value:los.length,icon:'box',bg:'#fef2f2',color:ACCENT},{label:'Pending',value:los.filter(l=>l.status==='pending').length,icon:'bell',bg:'#fffbeb',color:'#f59e0b'},{label:'Dispatched',value:los.filter(l=>l.status==='dispatched').length,icon:'truck',bg:'#eff6ff',color:'#3b82f6'},{label:'Cylinders Today',value:los.filter(l=>l.date===new Date().toISOString().slice(0,10)).reduce((s,l)=>s+(l.totalCylinders||0),0),icon:'products',bg:'#f0fdf4',color:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['All','pending','dispatched','cancelled'].map(s=><button key={s} onClick={()=>{setStFilter(s);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:stFilter===s?ACCENT:'#fff',color:stFilter===s?'#fff':'#6b7280',borderColor:stFilter===s?ACCENT:'#e5e7eb',textTransform:'capitalize'}}>{s}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search ID or route…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>LO ID</th><th>Date</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Items</th><th style={{textAlign:'right'}}>Cylinders</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No load orders found</td></tr>
              :paged.map(lo=>(
                <tr key={lo.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{lo.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{lo.date}</td>
                  <td style={{fontWeight:600}}>{lo.routeName}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{vehicleName(lo.vehicleId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{driverName(lo.driverId)}</td>
                  <td style={{fontSize:12,color:'#9ca3af'}}>{(lo.items||[]).length} items</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{lo.totalCylinders}</td>
                  <td><span className={`pm-badge ${lo.status==='dispatched'?'pm-badge-blue':lo.status==='cancelled'?'pm-badge-red':'pm-badge-orange'}`}>{lo.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewLO(lo)}>View</button>
                      {lo.status==='pending'&&<button className="pm-btn pm-btn-primary" style={{background:'#3b82f6',padding:'3px 7px',fontSize:11}} onClick={()=>dispatchLoadOrder(lo.id)}>Dispatch →</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {viewLO&&(
        <Modal title={`Load Order: ${viewLO.id}`} onClose={()=>setViewLO(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
            {[['Date',viewLO.date],['Route',viewLO.routeName],['Vehicle',vehicleName(viewLO.vehicleId)],['Driver',driverName(viewLO.driverId)],['Warehouse',viewLO.warehouseId],['Status',viewLO.status],['Total Cylinders',viewLO.totalCylinders]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'9px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>
          <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Available</th></tr></thead>
            <tbody>{(viewLO.items||[]).map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{it.qty} {it.unit}</td><td style={{textAlign:'right',color:'#94a3b8'}}>{it.available}</td></tr>)}</tbody>
          </table>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            {viewLO.status==='pending'&&<button className="pm-btn pm-btn-primary" style={{background:'#3b82f6'}} onClick={()=>{dispatchLoadOrder(viewLO.id);setViewLO(null);}}>Dispatch</button>}
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewLO(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showForm&&(
        <Modal title="New Load Order" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group"><label>Route *</label><select value={form.routeId} onChange={e=>handleRouteChange(e.target.value)}><option value="">— Select —</option>{routes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Vehicle *</label><select value={form.vehicleId} onChange={e=>setForm(f=>({...f,vehicleId:e.target.value}))}><option value="">— Select —</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.regNo} ({v.capacity} cyl)</option>)}</select></div>
            <div className="pm-form-group"><label>Driver *</label><select value={form.driverId} onChange={e=>setForm(f=>({...f,driverId:e.target.value}))}><option value="">— Select —</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Warehouse *</label><select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}><option value="">— Select —</option>{whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Notes</label><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional"/></div>
          </div>

          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Load Items</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={e=>setItem(i=>({...i,materialId:e.target.value}))}><option value="">— Select —</option>{mats.map(m=><option key={m.id} value={m.id}>{m.name} (Avail: {m.totalQty} {m.unit})</option>)}</select></div>
            <div className="pm-form-group" style={{margin:0}}><label>Qty to Load</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:36}} onClick={addItem}>+ Add</button>
          </div>

          {form.items.length>0&&(
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Available</th><th></th></tr></thead>
              <tbody>
                {form.items.map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{it.qty}</td><td style={{textAlign:'right',color:it.qty>it.available?'#ef4444':'#94a3b8'}}>{it.available}</td><td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td></tr>)}
                <tr style={{background:'#f8fafc'}}><td style={{fontWeight:700}}>Total</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT,fontSize:14}}>{form.items.reduce((s,i)=>s+i.qty,0)} cylinders</td><td/><td/></tr>
              </tbody>
            </table>
          )}

          <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#991b1b',marginBottom:14}}>
            <strong>Dispatch:</strong> Stock will be issued from warehouse (movement 601). A Trip Sheet will be auto-created.
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-ghost" onClick={handleCreate} disabled={!form.items.length||!form.routeId}>Save Draft</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>{handleCreate();}} disabled={!form.items.length||!form.routeId||!form.vehicleId||!form.driverId}>Create & Dispatch</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
