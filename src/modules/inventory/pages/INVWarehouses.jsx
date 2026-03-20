import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';
import { WH_TYPE_COLOR } from '../inventoryConstants';

const ACCENT = '#0ea5e9';
const WH_TYPES = ['main','wholesale','retail','transit','other'];

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:520, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

export default function INVWarehouses() {
  const { warehouses, invMaterials, createWarehouse, updateWarehouse, toggleWarehouseStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [viewWH,   setViewWH]   = useState(null);
  const [form, setForm] = useState({ code:'', name:'', location:'', type:'main', manager:'', capacity:'', status:'active' });

  const whs  = warehouses   || [];
  const mats = invMaterials || [];

  // Compute per-warehouse stock summary
  const whSummary = (whId) => {
    let qty = 0, value = 0, items = 0;
    mats.forEach(m => {
      const ws = (m.stockByWarehouse||[]).find(w=>w.warehouseId===whId);
      if (ws) { qty += ws.qty||0; value += ws.value||0; items++; }
    });
    return { qty, value, items };
  };

  const totalValue = whs.reduce((s, w) => s + whSummary(w.id).value, 0);

  function openCreate() { setForm({ code:'', name:'', location:'', type:'main', manager:'', capacity:'', status:'active' }); setEditId(null); setShowForm(true); }
  function openEdit(w)  { setForm({ ...w, capacity:String(w.capacity||'') }); setEditId(w.id); setShowForm(true); }
  function handleSave() {
    if (!form.name || !form.code) return;
    const data = { ...form, capacity: parseInt(form.capacity)||0 };
    editId ? updateWarehouse(editId, data) : createWarehouse(data);
    setShowForm(false);
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Warehouses</h2>
          <p className="pm-page-sub">Storage locations — stock is tracked per warehouse</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Warehouse</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total Warehouses', value:whs.length,                         icon:'building',  bg:'#f0f9ff', color:ACCENT },
          { label:'Active',           value:whs.filter(w=>w.status==='active').length, icon:'check', bg:'#f0fdf4', color:'#10b981' },
          { label:'Total Stock Value',value:fmtPKR(totalValue),                 icon:'briefcase', bg:'#fffbeb', color:'#f59e0b' },
          { label:'Types',            value:new Set(whs.map(w=>w.type)).size,   icon:'database',  bg:'#f5f3ff', color:'#8b5cf6' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?16:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="pm-cards-grid" style={{ marginBottom:20 }}>
        {whs.map(wh => {
          const { qty, value, items } = whSummary(wh.id);
          const utilPct = wh.capacity > 0 ? Math.min((qty/wh.capacity)*100,100) : 0;
          const typeColor = WH_TYPE_COLOR[wh.type]||'#94a3b8';
          return (
            <div className="pm-card" key={wh.id} style={{ borderLeft:`4px solid ${typeColor}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{wh.name}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:10, background:typeColor+'18', color:typeColor }}>{wh.type}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>{wh.code} · {wh.location}</div>
                </div>
                <span className={`pm-badge ${wh.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{wh.status}</span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
                {[['Items',items],['Units',qty.toLocaleString()],['Value',fmtPKR(value)]].map(([l,v])=>(
                  <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:600 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginTop:2 }}>{v}</div>
                  </div>
                ))}
              </div>

              {wh.capacity > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, color:'#94a3b8', marginBottom:4 }}>
                    <span>Capacity: {wh.capacity.toLocaleString()} units</span>
                    <span style={{ fontWeight:600, color:utilPct>90?'#ef4444':utilPct>70?'#f59e0b':typeColor }}>{utilPct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${utilPct}%`, background:utilPct>90?'#ef4444':utilPct>70?'#f59e0b':typeColor, borderRadius:4, transition:'width 0.6s' }}/>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'#94a3b8' }}>
                <span><Icon name="user" size={12} color="#94a3b8" style={{ marginRight:4 }}/> {wh.manager||'—'}</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:11 }} onClick={()=>setViewWH(wh)}>Details</button>
                  <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:11 }} onClick={()=>openEdit(wh)}>Edit</button>
                  <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:11 }} onClick={()=>toggleWarehouseStatus(wh.id)}>{wh.status==='active'?'Deact.':'Activate'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">All Warehouses ({whs.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Location</th><th>Manager</th><th style={{textAlign:'right'}}>Units</th><th style={{textAlign:'right'}}>Value</th><th style={{textAlign:'right'}}>Capacity</th><th>Status</th></tr></thead>
          <tbody>
            {whs.map(wh => {
              const { qty, value } = whSummary(wh.id);
              const typeColor = WH_TYPE_COLOR[wh.type]||'#94a3b8';
              return (
                <tr key={wh.id}>
                  <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{wh.code}</td>
                  <td style={{ fontWeight:600 }}>{wh.name}</td>
                  <td><span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:10, background:typeColor+'18', color:typeColor }}>{wh.type}</span></td>
                  <td style={{ color:'#9ca3af' }}>{wh.location}</td>
                  <td style={{ color:'#6b7280' }}>{wh.manager||'—'}</td>
                  <td style={{ textAlign:'right', fontWeight:600 }}>{qty.toLocaleString()}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:ACCENT }}>{fmtPKR(value)}</td>
                  <td style={{ textAlign:'right', color:'#9ca3af' }}>{wh.capacity?.toLocaleString()||'—'}</td>
                  <td><span className={`pm-badge ${wh.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{wh.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewWH && (
        <Modal title={viewWH.name} onClose={()=>setViewWH(null)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[['Code',viewWH.code],['Type',viewWH.type],['Location',viewWH.location],['Manager',viewWH.manager||'—'],['Capacity',`${(viewWH.capacity||0).toLocaleString()} units`],['Status',viewWH.status]].map(([l,v])=>(
              <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12.5, fontWeight:700, color:'#374151', marginBottom:8 }}>Materials in this Warehouse</div>
          <table className="pm-table" style={{ border:'1px solid #f1f5f9', borderRadius:8, overflow:'hidden' }}>
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Value</th></tr></thead>
            <tbody>
              {(invMaterials||[]).filter(m=>(m.stockByWarehouse||[]).some(w=>w.warehouseId===viewWH.id)).map(m=>{
                const ws = m.stockByWarehouse.find(w=>w.warehouseId===viewWH.id);
                return (
                  <tr key={m.id}>
                    <td><div style={{ fontWeight:600 }}>{m.name}</div><div style={{ fontSize:11, color:'#94a3b8' }}>{m.code}</div></td>
                    <td style={{ textAlign:'right', fontWeight:700 }}>{ws.qty} {m.unit}</td>
                    <td style={{ textAlign:'right', fontWeight:600, color:ACCENT }}>{fmtPKR(ws.value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setViewWH(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal title={editId?'Edit Warehouse':'New Warehouse'} onClose={()=>setShowForm(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>Code *</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="WH-LHR-01" disabled={!!editId}/></div>
            <div className="pm-form-group"><label>Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {WH_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{ gridColumn:'1/-1' }}><label>Warehouse Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full warehouse name"/></div>
            <div className="pm-form-group"><label>Location / City</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Lahore"/></div>
            <div className="pm-form-group"><label>Manager</label><input value={form.manager} onChange={e=>setForm(f=>({...f,manager:e.target.value}))} placeholder="Responsible person"/></div>
            <div className="pm-form-group"><label>Capacity (units)</label><input type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={handleSave}>{editId?'Save Changes':'Create Warehouse'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
