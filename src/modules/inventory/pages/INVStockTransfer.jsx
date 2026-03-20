import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';

const ACCENT = '#0ea5e9';

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

export default function INVStockTransfer() {
  const { invMaterials, warehouses, stockLedger, postStockTransfer, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const [form, setForm] = useState({ materialId:'', fromWH:'', toWH:'', qty:'', ref:'', note:'', date:'' });

  const mats = invMaterials || [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const transferEntries = (stockLedger||[]).filter(e=>e.movType==='311');
  // Group by ref — each transfer creates 2 entries (out + in), show unique refs
  const uniqueRefs = [...new Set(transferEntries.map(e=>e.ref||e.id))];
  const transfers  = uniqueRefs.map(ref => {
    const entries = transferEntries.filter(e=>(e.ref||e.id)===ref);
    const outE = entries.find(e=>e.qty<0) || entries[0];
    const inE  = entries.find(e=>e.qty>0) || entries[1];
    return { ref, materialName:outE?.materialName, fromWH:outE?.whName, toWH:inE?.whName, qty:Math.abs(outE?.qty||0), mapPrice:outE?.mapPrice||0, value:Math.abs(outE?.value||0), date:outE?.date, createdBy:outE?.createdBy };
  }).filter(t=>t.materialName);

  const filtered = transfers.filter(t =>
    !search || (t.materialName||'').toLowerCase().includes(search.toLowerCase()) || (t.ref||'').toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function stockInWH(matId, whId) {
    const mat = mats.find(m=>m.id===matId);
    return (mat?.stockByWarehouse||[]).find(w=>w.warehouseId===whId)?.qty || 0;
  }

  const selMat = mats.find(m=>m.id===form.materialId);
  const available = form.materialId && form.fromWH ? stockInWH(form.materialId, form.fromWH) : 0;

  function handlePost() {
    const qty = parseFloat(form.qty)||0;
    if (!form.materialId||!form.fromWH||!form.toWH||!qty||!form.date) { toast('Fill all required fields','error'); return; }
    if (form.fromWH===form.toWH) { toast('Source and destination cannot be the same','error'); return; }
    if (qty > available) { toast(`Only ${available} ${selMat?.unit} available in source warehouse`,'error'); return; }
    postStockTransfer({ materialId:form.materialId, fromWH:form.fromWH, toWH:form.toWH, qty, ref:form.ref||'TR-MANUAL', note:form.note });
    setShowForm(false);
    setForm({materialId:'',fromWH:'',toWH:'',qty:'',ref:'',note:'',date:''});
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Stock Transfer</h2>
          <p className="pm-page-sub">Movement type 311 — inter-warehouse transfer at MAP (no P&L impact)</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6'}} onClick={()=>{setForm({materialId:'',fromWH:'',toWH:'',qty:'',ref:'',note:'',date:''});setShowForm(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New Transfer
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Total Transfers',   value:transfers.length,                    icon:'truck',    bg:'#f5f3ff', color:'#8b5cf6'},
          {label:'Value Transferred', value:fmtPKR(transfers.reduce((s,t)=>s+t.value,0)), icon:'briefcase', bg:'#f0f9ff', color:ACCENT},
          {label:'Warehouses',        value:whs.length,                          icon:'building', bg:'#f0fdf4', color:'#10b981'},
          {label:'This Month',        value:transfers.filter(t=>t.date>=new Date().toISOString().slice(0,7)).length, icon:'trending', bg:'#fffbeb', color:'#f59e0b'},
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
          <div className="pm-table-title">Transfer Documents ({filtered.length})</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search material or ref…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Ref</th><th>Date</th><th>Material</th><th>From</th><th></th><th>To</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>MAP</th><th style={{textAlign:'right'}}>Value</th><th>By</th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No transfers found</td></tr>
              : paged.map((t,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:700,color:'#8b5cf6',fontFamily:'monospace',fontSize:11}}>{t.ref}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.date}</td>
                  <td style={{fontWeight:600}}>{t.materialName}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{t.fromWH}</td>
                  <td style={{color:'#94a3b8'}}>→</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{t.toWH}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#8b5cf6'}}>{t.qty.toLocaleString()}</td>
                  <td style={{textAlign:'right'}}>{fmtPKR(t.mapPrice)}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#8b5cf6'}}>{fmtPKR(t.value)}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.createdBy}</td>
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
        <Modal title="New Stock Transfer" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}>
              <label>Material *</label>
              <select value={form.materialId} onChange={e=>setForm(f=>({...f,materialId:e.target.value,fromWH:'',qty:''}))}>
                <option value="">— Select Material —</option>
                {mats.filter(m=>m.status!=='inactive'&&m.totalQty>0).map(m=><option key={m.id} value={m.id}>{m.name} ({m.code}) — Total: {m.totalQty} {m.unit}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>From Warehouse *</label>
              <select value={form.fromWH} onChange={e=>setForm(f=>({...f,fromWH:e.target.value,qty:''}))}>
                <option value="">— Select —</option>
                {whs.map(w=>{
                  const avail = form.materialId ? stockInWH(form.materialId,w.id) : 0;
                  return <option key={w.id} value={w.id} disabled={avail===0}>{w.name} — Stock: {avail}</option>;
                })}
              </select>
            </div>
            <div className="pm-form-group">
              <label>To Warehouse *</label>
              <select value={form.toWH} onChange={e=>setForm(f=>({...f,toWH:e.target.value}))}>
                <option value="">— Select —</option>
                {whs.filter(w=>w.id!==form.fromWH).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Quantity * {form.fromWH&&selMat&&<span style={{color:'#94a3b8',fontWeight:400}}>(Available: {available} {selMat.unit})</span>}</label>
              <input type="number" min={0.001} step="any" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} placeholder="0"/>
            </div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="e.g. TR-2026-001"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Reason for transfer"/></div>
          </div>

          {selMat && form.fromWH && form.toWH && form.qty && (
            <div style={{background:'#f5f3ff',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:13}}>
              <div style={{fontWeight:700,color:'#7c3aed',marginBottom:6}}>Transfer Preview</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[['Material',selMat.name],['Quantity',`${form.qty} ${selMat.unit}`],['Value at MAP',fmtPKR((parseFloat(form.qty)||0)*selMat.mapPrice)]].map(([l,v])=>(
                  <div key={l}><span style={{color:'#94a3b8',fontSize:11}}>{l}: </span><strong style={{color:'#4c1d95'}}>{v}</strong></div>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:12,color:'#6b7280'}}>No accounting entry — transfer is internal movement at MAP. Inventory account balance unchanged.</div>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6'}} onClick={handlePost}>Post Transfer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
