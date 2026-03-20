import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd } from '../sdConstants';

const ACCENT = '#10b981';
const RETURN_REASONS = ['Defective/Damaged','Wrong Item Delivered','Customer Over-ordered','Quality Issue','Other'];

function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?680:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function SDReturns() {
  const { salesReturns, salesInvoices, sdParties, invMaterials, warehouses, createSalesReturn, toast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  const [form, setForm] = useState({ invoiceId:'', partyId:'', partyName:'', warehouseId:'', reason:'Defective/Damaged', note:'', items:[] });
  const [item, setItem] = useState({ materialId:'', qty:'', mapPrice:'' });
  const [page, setPage] = useState(1);
  const PER = 12;

  const rets = salesReturns || [];
  const invs = salesInvoices|| [];
  const mats = invMaterials || [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const filtered = rets.filter(r=>!search||(r.id||'').toLowerCase().includes(search.toLowerCase())||(r.partyName||'').toLowerCase().includes(search.toLowerCase()));
  const pages = Math.ceil(filtered.length/PER);
  const paged  = filtered.slice((page-1)*PER,page*PER);

  function handleInvSelect(invId) {
    const inv = invs.find(i=>i.id===invId);
    if(!inv)return;
    setForm(f=>({...f,invoiceId:invId,partyId:inv.partyId,partyName:inv.partyName,items:[]}));
  }

  function addItem() {
    const mat=mats.find(m=>m.id===item.materialId);
    if(!mat||!item.qty)return;
    const mp=parseFloat(item.mapPrice)||mat.mapPrice;
    const qty=parseFloat(item.qty)||0;
    setForm(f=>({...f,items:[...f.items,{materialId:mat.id,materialName:mat.name,unit:mat.unit,qty,mapPrice:mp,total:qty*mp}]}));
    setItem({materialId:'',qty:'',mapPrice:''});
  }

  function handlePost() {
    if(!form.partyName||!form.warehouseId||!form.items.length){toast('Fill all required fields','error');return;}
    const sub=form.items.reduce((s,i)=>s+i.total,0);
    createSalesReturn({...form,subTotal:sub,date:new Date().toISOString().slice(0,10)});
    setShowForm(false);
    setForm({invoiceId:'',partyId:'',partyName:'',warehouseId:'',reason:'Defective/Damaged',note:'',items:[]});
  }

  const totalReturned=rets.reduce((s,r)=>s+(r.subTotal||0),0);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Sales Returns</h2><p className="pm-page-sub">Goods returned — stock restored + credit note journal auto-created</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Return</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Returns',value:rets.length,icon:'purchase',bg:'#fef2f2',color:'#ef4444'},{label:'Total Value',value:fmtPKRsd(totalReturned),icon:'briefcase',bg:'#fffbeb',color:'#f59e0b'},{label:'This Month',value:rets.filter(r=>r.date?.startsWith(new Date().toISOString().slice(0,7))).length,icon:'trending',bg:'#f0fdf4',color:ACCENT},{label:'Linked to Invoice',value:rets.filter(r=>r.invoiceId).length,icon:'invoice',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div className="pm-table-title">Returns ({filtered.length})</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search return or party…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Return ID</th><th>Date</th><th>Invoice Ref</th><th>Party</th><th>Reason</th><th style={{textAlign:'right'}}>Value</th><th>Status</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No returns yet</td></tr>
              :paged.map(r=><tr key={r.id}><td style={{fontWeight:700,color:'#ef4444',fontFamily:'monospace',fontSize:11}}>{r.id}</td><td style={{color:'#9ca3af',fontSize:12}}>{r.date}</td><td style={{color:'#6b7280',fontFamily:'monospace',fontSize:11}}>{r.invoiceId||'—'}</td><td style={{fontWeight:600}}>{r.partyName}</td><td style={{color:'#6b7280',fontSize:12}}>{r.reason}</td><td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{fmtPKRsd(r.subTotal)}</td><td><span className="pm-badge pm-badge-green">{r.status||'posted'}</span></td></tr>)
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {showForm&&(
        <Modal title="New Sales Return" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group"><label>Against Invoice</label><select value={form.invoiceId} onChange={e=>handleInvSelect(e.target.value)}><option value="">— Select Invoice —</option>{invs.map(i=><option key={i.id} value={i.id}>{i.id} — {i.partyName}</option>)}</select></div>
            <div className="pm-form-group"><label>Party Name *</label><input value={form.partyName} onChange={e=>setForm(f=>({...f,partyName:e.target.value}))} placeholder="Or type manually"/></div>
            <div className="pm-form-group"><label>Return to Warehouse *</label><select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}><option value="">— Select —</option>{whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Reason</label><select value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}>{RETURN_REASONS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div className="pm-form-group" style={{gridColumn:'span 2'}}><label>Note</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Additional details"/></div>
          </div>
          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Return Items</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={e=>{const mat=mats.find(m=>m.id===e.target.value);setItem(i=>({...i,materialId:e.target.value,mapPrice:mat?String(mat.mapPrice):''}));}}><option value="">— Select —</option>{mats.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group" style={{margin:0}}><label>MAP Price</label><input type="number" value={item.mapPrice} onChange={e=>setItem(i=>({...i,mapPrice:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:'#ef4444',height:36}} onClick={addItem}>+ Add</button>
          </div>
          {form.items.length>0&&(
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:16}}>
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>MAP</th><th style={{textAlign:'right'}}>Credit Value</th><th></th></tr></thead>
              <tbody>{form.items.map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right'}}>{it.qty}</td><td style={{textAlign:'right'}}>{fmtPKRsd(it.mapPrice)}</td><td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{fmtPKRsd(it.total)}</td><td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td></tr>)}</tbody>
            </table>
          )}
          <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#991b1b',marginBottom:16}}>Stock will be restored to selected warehouse. Credit note journal: Dr Revenue / Cr AR auto-posted.</div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={handlePost} disabled={!form.items.length}>Post Return</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
