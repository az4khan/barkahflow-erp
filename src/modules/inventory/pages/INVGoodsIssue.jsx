import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';

const ACCENT = '#0ea5e9';
const ISSUE_TYPES = [
  { code:'601', label:'Goods Issue / Sale' },
  { code:'201', label:'Issue to Cost Center' },
  { code:'261', label:'Issue for Production' },
];

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

export default function INVGoodsIssue() {
  const { invMaterials, warehouses, stockLedger, postStockMovement, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [viewing,  setViewing]  = useState(null);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const [form, setForm] = useState({ warehouseId:'', movType:'601', ref:'', note:'', date:'', items:[] });
  const [item, setItem] = useState({ materialId:'', qty:'' });

  const mats = invMaterials || [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const issueEntries = (stockLedger||[]).filter(e => ['601','201','261','102'].includes(e.movType));
  const filtered = issueEntries.filter(e =>
    !search || e.materialName.toLowerCase().includes(search.toLowerCase()) || (e.ref||'').toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function stockInWH(matId, whId) {
    const mat = mats.find(m=>m.id===matId);
    if (!mat) return 0;
    return (mat.stockByWarehouse||[]).find(w=>w.warehouseId===whId)?.qty || 0;
  }

  function addItem() {
    const mat = mats.find(m=>m.id===item.materialId);
    if (!mat || !item.qty) return;
    const avail = form.warehouseId ? stockInWH(mat.id, form.warehouseId) : 0;
    const qty   = parseFloat(item.qty)||0;
    if (form.warehouseId && qty > avail) { toast(`Only ${avail} ${mat.unit} available in selected warehouse`, 'error'); return; }
    setForm(f=>({...f,items:[...f.items,{materialId:mat.id,materialName:mat.name,unit:mat.unit,mapPrice:mat.mapPrice,qty,total:qty*mat.mapPrice,available:avail}]}));
    setItem({materialId:'',qty:''});
  }

  function handlePost() {
    if (!form.warehouseId||!form.items.length||!form.date) { toast('Fill warehouse, date and items','error'); return; }
    const movType = ISSUE_TYPES.find(t=>t.code===form.movType);
    form.items.forEach(it=>{
      postStockMovement({materialId:it.materialId,warehouseId:form.warehouseId,movType:form.movType,movLabel:movType?.label||'Goods Issue',qty:-it.qty,unitCost:it.mapPrice,ref:form.ref||'GI-MANUAL',note:form.note});
    });
    setShowForm(false);
    setForm({warehouseId:'',movType:'601',ref:'',note:'',date:'',items:[]});
  }

  const totalValue = issueEntries.reduce((s,e)=>s+Math.abs(e.value||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Goods Issue</h2>
          <p className="pm-page-sub">Movement types 601/201/261 — stock consumed at current MAP</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={()=>{setForm({warehouseId:'',movType:'601',ref:'',note:'',date:'',items:[]});setShowForm(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New Issue
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Total Issue Docs',  value:issueEntries.length,  icon:'cart',     bg:'#fef2f2', color:'#ef4444'},
          {label:'Total Value Out',   value:fmtPKR(totalValue),   icon:'briefcase',bg:'#fffbeb', color:'#f59e0b'},
          {label:'Sales Issues (601)',value:issueEntries.filter(e=>e.movType==='601').length, icon:'trending', bg:'#f0f9ff', color:ACCENT},
          {label:'Other Issues',      value:issueEntries.filter(e=>e.movType!=='601').length, icon:'box',      bg:'#f5f3ff', color:'#8b5cf6'},
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
          <div className="pm-table-title">Goods Issue Documents</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search material or ref…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Doc ID</th><th>Date</th><th>Material</th><th>Warehouse</th><th>Type</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>MAP</th><th style={{textAlign:'right'}}>Value</th><th>Ref</th><th></th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No goods issue documents</td></tr>
              : paged.map(e=>(
                <tr key={e.id}>
                  <td style={{fontWeight:700,color:'#ef4444',fontFamily:'monospace',fontSize:11}}>{e.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.date}</td>
                  <td><div style={{fontWeight:600,color:'#0f172a'}}>{e.materialName}</div></td>
                  <td style={{color:'#6b7280',fontSize:12}}>{e.whName}</td>
                  <td><span style={{fontSize:11,fontWeight:700,background:'#fef2f2',color:'#ef4444',padding:'2px 8px',borderRadius:8}}>{e.movType}</span></td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{e.qty}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{fmtPKR(e.mapPrice)}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#ef4444'}}>{fmtPKR(Math.abs(e.value))}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.ref||'—'}</td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setViewing(e)}>View</button></td>
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

      {viewing && (
        <Modal title={`GI Document: ${viewing.id}`} onClose={()=>setViewing(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['Document',viewing.id],['Date',viewing.date],['Material',viewing.materialName],['Warehouse',viewing.whName],['Type',`${viewing.movType} — ${viewing.movLabel}`],['Qty Issued',viewing.qty],['MAP at Issue',fmtPKR(viewing.mapPrice)],['Value',fmtPKR(Math.abs(viewing.value))],['Reference',viewing.ref||'—'],['Posted By',viewing.createdBy]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}><button className="pm-btn pm-btn-outline" onClick={()=>setViewing(null)}>Close</button></div>
        </Modal>
      )}

      {showForm && (
        <Modal title="New Goods Issue" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group">
              <label>Warehouse *</label>
              <select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value,items:[]}))}>
                <option value="">— Select —</option>
                {whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Issue Type</label>
              <select value={form.movType} onChange={e=>setForm(f=>({...f,movType:e.target.value}))}>
                {ISSUE_TYPES.map(t=><option key={t.code} value={t.code}>{t.code} — {t.label}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="INV/SO number"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Optional"/></div>
          </div>

          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Items to Issue</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}>
              <label>Material</label>
              <select value={item.materialId} onChange={e=>setItem(i=>({...i,materialId:e.target.value}))}>
                <option value="">— Select —</option>
                {mats.filter(m=>m.status!=='inactive').map(m=>{
                  const avail = form.warehouseId ? stockInWH(m.id,form.warehouseId) : m.totalQty;
                  return <option key={m.id} value={m.id}>{m.name} — Available: {avail} {m.unit} @ {fmtPKR(m.mapPrice)}</option>;
                })}
              </select>
            </div>
            <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={0.001} step="any" value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:'#ef4444',height:36}} onClick={addItem}>+ Add</button>
          </div>

          {form.items.length > 0 && (
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:16}}>
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Available</th><th style={{textAlign:'right'}}>Issue Qty</th><th style={{textAlign:'right'}}>MAP</th><th style={{textAlign:'right'}}>Value</th><th></th></tr></thead>
              <tbody>
                {form.items.map((it,idx)=>(
                  <tr key={idx}>
                    <td style={{fontWeight:600}}>{it.materialName}</td>
                    <td style={{textAlign:'right',color:'#94a3b8'}}>{it.available} {it.unit}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{it.qty} {it.unit}</td>
                    <td style={{textAlign:'right'}}>{fmtPKR(it.mapPrice)}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{fmtPKR(it.total)}</td>
                    <td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,i)=>i!==idx)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td>
                  </tr>
                ))}
                <tr style={{background:'#f8fafc'}}>
                  <td colSpan={4} style={{fontWeight:700,textAlign:'right'}}>Total COGS:</td>
                  <td style={{fontWeight:800,color:'#ef4444',fontSize:14}}>{fmtPKR(form.items.reduce((s,i)=>s+i.total,0))}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
          )}

          <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#991b1b',marginBottom:16}}>
            <strong>Note:</strong> Stock will be issued at current MAP. Journal entry Dr COGS / Cr Inventory will be auto-created. Negative stock is not allowed.
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={handlePost} disabled={!form.items.length||!form.warehouseId||!form.date}>Post Goods Issue</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
