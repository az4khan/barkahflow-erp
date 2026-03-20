import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';

const ACCENT = '#0ea5e9';

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth: wide ? 720 : 520, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:'auto', flex:1 }}>{children}</div>
      </div>
    </div>
  );
}

const CATEGORIES = ['LPG Cylinders','Bulk LPG','Office Furniture','Stationery','Tools & Equipment','Spare Parts','Other'];
const UNITS      = ['PCS','MT','KG','LTR','SET','BOX','ROLL','DRUM','OTHER'];
const VAL_METHODS = ['MAP','Standard'];

export default function INVMaterials() {
  const { invMaterials, createInvMaterial, updateInvMaterial, toggleInvMaterialStatus, warehouses } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [viewMat,  setViewMat]  = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const [form, setForm] = useState({
    code:'', name:'', category:'LPG Cylinders', unit:'PCS',
    mapPrice:'', standardPrice:'', valuationMethod:'MAP',
    reorderPoint:'', reorderQty:'', minStock:'', maxStock:'',
    description:'', status:'active',
  });

  const mats = invMaterials || [];
  const cats = ['All', ...new Set(mats.map(m => m.category))];

  const filtered = mats.filter(m =>
    (catFilter === 'All' || m.category === catFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.code||'').toLowerCase().includes(search.toLowerCase()))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  const totalValue = mats.reduce((s,m) => s + (m.totalValue||0), 0);
  const lowStock   = mats.filter(m => (m.totalQty||0) <= (m.reorderPoint||0)).length;

  function openCreate() {
    setForm({ code:'', name:'', category:'LPG Cylinders', unit:'PCS', mapPrice:'', standardPrice:'', valuationMethod:'MAP', reorderPoint:'', reorderQty:'', minStock:'', maxStock:'', description:'', status:'active' });
    setEditId(null); setShowForm(true);
  }
  function openEdit(m) {
    setForm({ ...m, mapPrice:String(m.mapPrice||''), standardPrice:String(m.standardPrice||''), reorderPoint:String(m.reorderPoint||''), reorderQty:String(m.reorderQty||''), minStock:String(m.minStock||''), maxStock:String(m.maxStock||'') });
    setEditId(m.id); setShowForm(true);
  }
  function handleSave() {
    if (!form.name || !form.code) return;
    const data = { ...form, mapPrice:parseFloat(form.mapPrice)||0, standardPrice:parseFloat(form.standardPrice)||0, reorderPoint:parseInt(form.reorderPoint)||0, reorderQty:parseInt(form.reorderQty)||0, minStock:parseInt(form.minStock)||0, maxStock:parseInt(form.maxStock)||0 };
    editId ? updateInvMaterial(editId, data) : createInvMaterial(data);
    setShowForm(false);
  }

  const stockStatus = (m) => {
    if ((m.totalQty||0) === 0) return { label:'Out of Stock', cls:'pm-badge-red' };
    if ((m.totalQty||0) <= (m.reorderPoint||0)) return { label:'Reorder', cls:'pm-badge-orange' };
    if ((m.totalQty||0) >= (m.maxStock||99999)) return { label:'Overstocked', cls:'pm-badge-purple' };
    return { label:'OK', cls:'pm-badge-green' };
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Materials</h2>
          <p className="pm-page-sub">Material master — shared across Purchase, Inventory & Sales</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Material</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total SKUs',       value:mats.length,           icon:'products',  bg:'#f0f9ff', color:ACCENT },
          { label:'Active',           value:mats.filter(m=>m.status!=='inactive').length, icon:'check', bg:'#f0fdf4', color:'#10b981' },
          { label:'Stock Value',      value:fmtPKR(totalValue),    icon:'briefcase', bg:'#fffbeb', color:'#f59e0b' },
          { label:'Reorder Alerts',   value:lowStock,              icon:'bell',      bg:'#fef2f2', color:'#ef4444' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?16:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:280 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search code or name…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {cats.map(c=>(
              <button key={c} onClick={()=>{setCatFilter(c);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:catFilter===c?ACCENT:'#fff', color:catFilter===c?'#fff':'#6b7280', borderColor:catFilter===c?ACCENT:'#e5e7eb', whiteSpace:'nowrap' }}>{c}</button>
            ))}
          </div>
        </div>

        <table className="pm-table">
          <thead>
            <tr>
              <th>Code</th><th>Material Name</th><th>Category</th><th>Unit</th>
              <th style={{textAlign:'right'}}>MAP Price</th>
              <th style={{textAlign:'right'}}>Stock Qty</th>
              <th style={{textAlign:'right'}}>Stock Value</th>
              <th>Status</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={10} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No materials found</td></tr>
              : paged.map(m => {
                  const st = stockStatus(m);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{m.code}</td>
                      <td>
                        <div style={{ fontWeight:600, color:'#0f172a' }}>{m.name}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{m.id}</div>
                      </td>
                      <td style={{ color:'#6b7280', fontSize:12 }}>{m.category}</td>
                      <td style={{ color:'#6b7280' }}>{m.unit}</td>
                      <td style={{ textAlign:'right', fontWeight:600 }}>{fmtPKR(m.mapPrice)}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color:m.totalQty<=m.reorderPoint?'#f59e0b':'#0f172a' }}>
                        {(m.totalQty||0).toLocaleString()}
                      </td>
                      <td style={{ textAlign:'right', fontWeight:600, color:ACCENT }}>{fmtPKR(m.totalValue)}</td>
                      <td><span className={`pm-badge ${m.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{m.status}</span></td>
                      <td><span className={`pm-badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 8px', fontSize:11 }} onClick={()=>setViewMat(m)}>View</button>
                          <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 8px', fontSize:11 }} onClick={()=>openEdit(m)}>Edit</button>
                          <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 8px', fontSize:11 }} onClick={()=>toggleInvMaterialStatus(m.id)}>{m.status==='active'?'Deact.':'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  );
              })
            }
          </tbody>
        </table>
        {pages>1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px', borderTop:'1px solid #f1f5f9' }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewMat && (
        <Modal title={`${viewMat.code} — ${viewMat.name}`} onClose={()=>setViewMat(null)} wide>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {[['Code',viewMat.code],['Category',viewMat.category],['Unit',viewMat.unit],['MAP Price',fmtPKR(viewMat.mapPrice)],['Std Price',fmtPKR(viewMat.standardPrice)],['Valuation',viewMat.valuationMethod],['Total Qty',`${viewMat.totalQty} ${viewMat.unit}`],['Total Value',fmtPKR(viewMat.totalValue)],['Status',viewMat.status]].map(([l,v])=>(
              <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12.5, fontWeight:700, color:'#374151', marginBottom:8 }}>Stock by Warehouse</div>
          <table className="pm-table" style={{ border:'1px solid #f1f5f9', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
            <thead><tr><th>Warehouse</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Value</th><th style={{textAlign:'right'}}>MAP (local)</th></tr></thead>
            <tbody>
              {(viewMat.stockByWarehouse||[]).map(ws => {
                const wh = (warehouses||[]).find(w=>w.id===ws.warehouseId);
                return (
                  <tr key={ws.warehouseId}>
                    <td style={{ fontWeight:600 }}>{wh?.name||ws.warehouseId}</td>
                    <td style={{ textAlign:'right', fontWeight:700 }}>{ws.qty} {viewMat.unit}</td>
                    <td style={{ textAlign:'right', fontWeight:600, color:ACCENT }}>{fmtPKR(ws.value)}</td>
                    <td style={{ textAlign:'right', color:'#6b7280' }}>{fmtPKR(ws.qty>0?ws.value/ws.qty:0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[['Reorder Point',`${viewMat.reorderPoint} ${viewMat.unit}`],['Reorder Qty',`${viewMat.reorderQty} ${viewMat.unit}`],['Min/Max',`${viewMat.minStock} / ${viewMat.maxStock} ${viewMat.unit}`]].map(([l,v])=>(
              <div key={l} style={{ background:'#fffbeb', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#f59e0b' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>{setViewMat(null);openEdit(viewMat);}}>Edit</button>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewMat(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal title={editId?'Edit Material':'New Material'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{ gridTemplateColumns:'1fr 1fr 1fr' }}>
            <div className="pm-form-group"><label>Material Code *</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="e.g. LPG-45" disabled={!!editId}/></div>
            <div className="pm-form-group" style={{ gridColumn:'span 2' }}><label>Material Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full material name"/></div>
            <div className="pm-form-group"><label>Category</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Unit of Measure</label>
              <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
                {UNITS.map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Valuation Method</label>
              <select value={form.valuationMethod} onChange={e=>setForm(f=>({...f,valuationMethod:e.target.value}))}>
                {VAL_METHODS.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>MAP Price *</label><input type="number" value={form.mapPrice} onChange={e=>setForm(f=>({...f,mapPrice:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Standard Price</label><input type="number" value={form.standardPrice} onChange={e=>setForm(f=>({...f,standardPrice:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"/>
            <div className="pm-form-group"><label>Reorder Point</label><input type="number" value={form.reorderPoint} onChange={e=>setForm(f=>({...f,reorderPoint:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Reorder Qty</label><input type="number" value={form.reorderQty} onChange={e=>setForm(f=>({...f,reorderQty:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Min / Max Stock</label>
              <div style={{ display:'flex', gap:6 }}>
                <input type="number" value={form.minStock} onChange={e=>setForm(f=>({...f,minStock:e.target.value}))} placeholder="Min"/>
                <input type="number" value={form.maxStock} onChange={e=>setForm(f=>({...f,maxStock:e.target.value}))} placeholder="Max"/>
              </div>
            </div>
            <div className="pm-form-group" style={{ gridColumn:'1/-1' }}><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Optional description…" style={{ resize:'vertical' }}/></div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={handleSave}>{editId?'Save Changes':'Create Material'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
