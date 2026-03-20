import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';

const ACCENT = '#0ea5e9';
const REASONS = ['Physical count difference','Damaged / Expired','Theft / Shrinkage','Correction / Entry error','Sample / Consumption','Other'];

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?680:500,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
        </div>
        <div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
}

export default function INVStockAdjustment() {
  const { invMaterials, warehouses, stockLedger, postStockMovement, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const [form, setForm] = useState({ materialId:'', warehouseId:'', direction:'+', qty:'', reason:'Physical count difference', note:'', date:'' });

  const mats = invMaterials || [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const adjEntries = (stockLedger||[]).filter(e=>['551','552'].includes(e.movType));
  const filtered = adjEntries.filter(e =>
    !search || (e.materialName||'').toLowerCase().includes(search.toLowerCase()) || (e.ref||'').toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  const selMat = mats.find(m=>m.id===form.materialId);
  const currentQty = selMat && form.warehouseId ? ((selMat.stockByWarehouse||[]).find(w=>w.warehouseId===form.warehouseId)?.qty||0) : 0;
  const adjQty  = parseFloat(form.qty)||0;
  const newQty  = form.direction==='+' ? currentQty+adjQty : Math.max(currentQty-adjQty,0);

  function handlePost() {
    if (!form.materialId||!form.warehouseId||!adjQty||!form.date) { toast('Fill all required fields','error'); return; }
    const isPos  = form.direction==='+';
    const movType = isPos ? '551' : '552';
    const movLabel = isPos ? 'Stock Adjustment +' : 'Stock Adjustment -';
    postStockMovement({ materialId:form.materialId, warehouseId:form.warehouseId, movType, movLabel, qty:isPos?adjQty:-adjQty, unitCost:selMat?.mapPrice||0, ref:`ADJ-${Date.now()}`, note:`${form.reason}: ${form.note}` });
    setShowForm(false);
    setForm({materialId:'',warehouseId:'',direction:'+',qty:'',reason:'Physical count difference',note:'',date:''});
  }

  const posAdj = adjEntries.filter(e=>e.movType==='551').reduce((s,e)=>s+(e.value||0),0);
  const negAdj = adjEntries.filter(e=>e.movType==='552').reduce((s,e)=>s+Math.abs(e.value||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Stock Adjustment</h2>
          <p className="pm-page-sub">MI07 equivalent — correct stock discrepancies with full audit trail</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#f59e0b'}} onClick={()=>setShowForm(true)}>
            <Icon name="plus" size={14} color="#fff"/> New Adjustment
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Total Adjustments', value:adjEntries.length, icon:'edit',     bg:'#fffbeb', color:'#f59e0b'},
          {label:'Positive (+)',      value:adjEntries.filter(e=>e.movType==='551').length, icon:'check', bg:'#f0fdf4', color:'#10b981'},
          {label:'Negative (−)',      value:adjEntries.filter(e=>e.movType==='552').length, icon:'alert', bg:'#fef2f2', color:'#ef4444'},
          {label:'Net Value Impact',  value:fmtPKR(posAdj-negAdj), icon:'briefcase', bg:'#f0f9ff', color:ACCENT},
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
          <div className="pm-table-title">Adjustment Documents ({filtered.length})</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Doc ID</th><th>Date</th><th>Type</th><th>Material</th><th>Warehouse</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Value</th><th>Note</th><th>By</th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No adjustments found</td></tr>
              : paged.map(e=>(
                <tr key={e.id}>
                  <td style={{fontWeight:700,color:'#f59e0b',fontFamily:'monospace',fontSize:11}}>{e.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.date}</td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:e.movType==='551'?'#f0fdf4':'#fef2f2',color:e.movType==='551'?'#10b981':'#ef4444'}}>{e.movType==='551'?'+ Adj':'− Adj'}</span></td>
                  <td style={{fontWeight:600}}>{e.materialName}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{e.whName}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:e.qty>0?'#10b981':'#ef4444'}}>{e.qty>0?'+':''}{e.qty}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#f59e0b'}}>{fmtPKR(Math.abs(e.value))}</td>
                  <td style={{color:'#9ca3af',fontSize:11,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.note||'—'}</td>
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
        <Modal title="Stock Adjustment" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}>
              <label>Material *</label>
              <select value={form.materialId} onChange={e=>setForm(f=>({...f,materialId:e.target.value,warehouseId:''}))}>
                <option value="">— Select Material —</option>
                {mats.filter(m=>m.status!=='inactive').map(m=><option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Warehouse *</label>
              <select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}>
                <option value="">— Select —</option>
                {whs.map(w=>{
                  const qty = form.materialId ? ((mats.find(m=>m.id===form.materialId)?.stockByWarehouse||[]).find(s=>s.warehouseId===w.id)?.qty||0) : '?';
                  return <option key={w.id} value={w.id}>{w.name} — Current: {qty}</option>;
                })}
              </select>
            </div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group">
              <label>Direction</label>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                {['+','−'].map(d=>(
                  <button key={d} onClick={()=>setForm(f=>({...f,direction:d}))}
                    style={{flex:1,padding:'8px',borderRadius:8,border:'2px solid',cursor:'pointer',fontWeight:700,fontSize:16,background:form.direction===d?(d==='+'?'#10b981':'#ef4444'):'#fff',color:form.direction===d?'#fff':(d==='+'?'#10b981':'#ef4444'),borderColor:d==='+'?'#10b981':'#ef4444'}}>
                    {d} Positive / Negative
                  </button>
                ))}
              </div>
            </div>
            <div className="pm-form-group">
              <label>Adjustment Qty * {selMat&&form.warehouseId&&<span style={{color:'#94a3b8',fontWeight:400}}>(Current: {currentQty} {selMat.unit})</span>}</label>
              <input type="number" min={0.001} step="any" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0"/>
            </div>
            <div className="pm-form-group">
              <label>Reason</label>
              <select value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}>
                {REASONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note / Detail</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Additional detail for audit trail"/></div>
          </div>

          {selMat && form.warehouseId && adjQty > 0 && (
            <div style={{background:form.direction==='+'?'#f0fdf4':'#fef2f2',borderRadius:8,padding:'12px 16px',marginBottom:16}}>
              <div style={{fontWeight:700,color:form.direction==='+'?'#16a34a':'#dc2626',marginBottom:8}}>Adjustment Preview</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,fontSize:13}}>
                {[['Current Qty',`${currentQty} ${selMat.unit}`],['Adjustment',`${form.direction==='+'?'+':'−'}${adjQty} ${selMat.unit}`],['New Qty',`${newQty} ${selMat.unit}`],['Value Impact',fmtPKR(adjQty*selMat.mapPrice)]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:11,color:'#94a3b8',marginBottom:2}}>{l}</div><strong>{v}</strong></div>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:12,color:'#6b7280'}}>Journal entry: {form.direction==='+'?'Dr Inventory / Cr Inventory Adjustment':'Dr Inventory Adjustment / Cr Inventory'}</div>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:'#f59e0b'}} onClick={handlePost}>Post Adjustment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
