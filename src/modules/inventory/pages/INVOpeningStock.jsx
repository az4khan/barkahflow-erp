import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';

const ACCENT = '#0ea5e9';

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?760:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
        </div>
        <div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
}

export default function INVOpeningStock() {
  const { invMaterials, warehouses, stockLedger, postStockMovement, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const [form, setForm]   = useState({ warehouseId:'', date:'', ref:'', note:'', items:[] });
  const [item, setItem]   = useState({ materialId:'', qty:'', unitCost:'' });

  const mats = invMaterials || [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const openingEntries = (stockLedger||[]).filter(e=>e.movType==='561');
  const filtered = openingEntries.filter(e =>
    !search || (e.materialName||'').toLowerCase().includes(search.toLowerCase()) || (e.ref||'').toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function addItem() {
    const mat = mats.find(m=>m.id===item.materialId);
    if (!mat||!item.qty||!item.unitCost) return;
    const qty  = parseFloat(item.qty)||0;
    const cost = parseFloat(item.unitCost)||0;
    setForm(f=>({...f,items:[...f.items,{materialId:mat.id,materialName:mat.name,unit:mat.unit,qty,unitCost:cost,total:qty*cost}]}));
    setItem({materialId:'',qty:'',unitCost:''});
  }

  function handlePost() {
    if (!form.warehouseId||!form.items.length||!form.date) { toast('Fill warehouse, date and items','error'); return; }
    form.items.forEach(it=>{
      postStockMovement({materialId:it.materialId,warehouseId:form.warehouseId,movType:'561',movLabel:'Opening Stock',qty:it.qty,unitCost:it.unitCost,ref:form.ref||'OPEN-STOCK',note:form.note});
    });
    setShowForm(false);
    setForm({warehouseId:'',date:'',ref:'',note:'',items:[]});
    toast('Opening stock posted successfully','success');
  }

  const totalValue = openingEntries.reduce((s,e)=>s+(e.value||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Opening Stock</h2>
          <p className="pm-page-sub">MB1C equivalent — initial stock upload. One-time use per period.</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>{setForm({warehouseId:'',date:'',ref:'',note:'',items:[]});setShowForm(true);}}>
            <Icon name="upload" size={14} color="#fff"/> Post Opening Stock
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:12,padding:'14px 18px',marginBottom:20,display:'flex',gap:12,alignItems:'flex-start'}}>
        <Icon name="bell" size={18} color={ACCENT}/>
        <div style={{fontSize:13,color:'#0369a1'}}>
          <strong>Opening Stock (Movement 561)</strong> is used to load initial inventory balances when going live or starting a new fiscal period. It debits the Inventory account and credits Retained Earnings. Post only once per material per warehouse per period.
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Opening Docs Posted', value:openingEntries.length,     icon:'upload',   bg:'#f0f9ff', color:ACCENT},
          {label:'Materials Loaded',    value:new Set(openingEntries.map(e=>e.materialId)).size, icon:'products', bg:'#f0fdf4', color:'#10b981'},
          {label:'Total Opening Value', value:fmtPKR(totalValue),        icon:'briefcase',bg:'#fffbeb', color:'#f59e0b'},
          {label:'Warehouses Covered',  value:new Set(openingEntries.map(e=>e.warehouseId)).size, icon:'building', bg:'#f5f3ff', color:'#8b5cf6'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div className="pm-table-title">Opening Stock Documents</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Doc ID</th><th>Date</th><th>Material</th><th>Warehouse</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Unit Cost</th><th style={{textAlign:'right'}}>Value</th><th>Ref</th><th>By</th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No opening stock documents</td></tr>
              : paged.map(e=>(
                <tr key={e.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{e.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.date}</td>
                  <td style={{fontWeight:600}}>{e.materialName}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{e.whName}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>+{e.qty}</td>
                  <td style={{textAlign:'right'}}>{fmtPKR(e.mapPrice)}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{fmtPKR(e.value)}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.ref||'—'}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.createdBy}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1 && (
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Post Opening Stock" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group">
              <label>Warehouse *</label>
              <select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}>
                <option value="">— Select —</option>
                {whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Posting Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="e.g. OPEN-2026"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="e.g. Opening balances as at 01-Jan-2026"/></div>
          </div>

          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Items</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}>
              <label>Material</label>
              <select value={item.materialId} onChange={e=>{const mat=mats.find(m=>m.id===e.target.value);setItem(i=>({...i,materialId:e.target.value,unitCost:mat?String(mat.mapPrice):''}));}}>
                <option value="">— Select —</option>
                {mats.filter(m=>m.status!=='inactive').map(m=><option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{margin:0}}><label>Opening Qty</label><input type="number" min={0.001} step="any" value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group" style={{margin:0}}><label>Unit Cost (MAP)</label><input type="number" min={0} step="any" value={item.unitCost} onChange={e=>setItem(i=>({...i,unitCost:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:36}} onClick={addItem}>+ Add</button>
          </div>

          {form.items.length>0 && (
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:16}}>
              <thead><tr><th>#</th><th>Material</th><th style={{textAlign:'right'}}>Opening Qty</th><th style={{textAlign:'right'}}>Unit Cost</th><th style={{textAlign:'right'}}>Value</th><th></th></tr></thead>
              <tbody>
                {form.items.map((it,idx)=>(
                  <tr key={idx}>
                    <td style={{color:'#94a3b8'}}>{idx+1}</td>
                    <td style={{fontWeight:600}}>{it.materialName}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>+{it.qty} {it.unit}</td>
                    <td style={{textAlign:'right'}}>{fmtPKR(it.unitCost)}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(it.total)}</td>
                    <td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,i)=>i!==idx)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td>
                  </tr>
                ))}
                <tr style={{background:'#f8fafc'}}>
                  <td colSpan={4} style={{fontWeight:700,textAlign:'right'}}>Total Opening Value:</td>
                  <td style={{fontWeight:800,color:ACCENT,fontSize:14}}>{fmtPKR(form.items.reduce((s,i)=>s+i.total,0))}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
          )}

          {!form.items.length && <div style={{padding:24,textAlign:'center',color:'#94a3b8',background:'#f8fafc',borderRadius:8,marginBottom:16,fontSize:13}}>Add materials with their opening quantities and costs</div>}

          <div style={{background:'#fffbeb',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#92400e',marginBottom:16}}>
            <strong>Accounting:</strong> Dr Inventory (1020) / Cr Retained Earnings (3002). This establishes the initial MAP for each material.
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handlePost} disabled={!form.items.length||!form.warehouseId||!form.date}>Post Opening Stock</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
