import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR, STATUS_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?800:520,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
        </div>
        <div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
}

const PAY_TERMS = ['Net 15','Net 30','Net 45','Net 60','Cash on Delivery','Advance'];

export default function SDSalesOrders() {
  const { salesOrders, sdParties, sdPriceLists, invMaterials, warehouses, createSalesOrder, updateSalesOrder, approveSalesOrder, cancelSalesOrder, createDeliveryOrder, toast } = useApp();
  const [search,  setSearch]  = useState('');
  const [stFilter,setStFilter]= useState('All');
  const [dateFrom,setDateFrom]= useState('');
  const [dateTo,  setDateTo]  = useState('');
  const [showForm,setShowForm]= useState(false);
  const [viewSO,  setViewSO]  = useState(null);
  const [editId,  setEditId]  = useState(null);
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const sos  = salesOrders || [];
  const pts  = sdParties   || [];
  const mats = invMaterials|| [];
  const whs  = (warehouses||[]).filter(w=>w.status==='active');

  const [form,  setForm]  = useState({partyId:'',warehouseId:'',date:'',paymentTerms:'Net 30',notes:'',items:[]});
  const [item,  setItem]  = useState({materialId:'',qty:'',unitPrice:''});

  const selParty = pts.find(p=>p.id===form.partyId);
  const priceList = sdPriceLists?.find(pl=>pl.tier===selParty?.tier&&pl.status==='active');

  function handlePartyChange(partyId) {
    const party = pts.find(p=>p.id===partyId);
    const pl    = sdPriceLists?.find(p=>p.tier===party?.tier&&p.status==='active');
    setForm(f=>({...f,partyId,items:[]}));
    setItem({materialId:'',qty:'',unitPrice:''});
  }

  function handleMatSelect(matId) {
    const mat = mats.find(m=>m.id===matId);
    const plItem = priceList?.items?.find(i=>i.materialId===matId);
    setItem(i=>({...i,materialId:matId,unitPrice:plItem?String(plItem.unitPrice):mat?String(mat.mapPrice):''}));
  }

  function addItem() {
    const mat = mats.find(m=>m.id===item.materialId);
    if(!mat||!item.qty||!item.unitPrice) return;
    const qty=parseFloat(item.qty)||0,up=parseFloat(item.unitPrice)||0;
    setForm(f=>({...f,items:[...f.items,{materialId:mat.id,materialName:mat.name,unit:mat.unit,qty,unitPrice:up,discount:0,total:qty*up}]}));
    setItem({materialId:'',qty:'',unitPrice:''});
  }

  const subTotal   = form.items.reduce((s,i)=>s+i.total,0);
  const taxPct     = 17;
  const taxAmount  = subTotal*(taxPct/100);
  const grandTotal = subTotal+taxAmount;

  function handleSave(status='draft') {
    if(!form.partyId||!form.items.length||!form.date){toast('Fill party, date and items','error');return;}
    const data={...form,partyName:selParty?.name,tier:selParty?.tier,status,subTotal,taxPct,taxAmount,grandTotal};
    if(editId){updateSalesOrder(editId,data);}else{createSalesOrder(data);}
    setShowForm(false); setForm({partyId:'',warehouseId:'',date:'',paymentTerms:'Net 30',notes:'',items:[]});
  }

  function handleCreateDO(so) {
    createDeliveryOrder({soId:so.id,partyId:so.partyId,partyName:so.partyName,warehouseId:so.warehouseId,date:new Date().toISOString().slice(0,10),items:so.items.map(i=>({materialId:i.materialId,materialName:i.materialName,unit:i.unit,qty:i.qty}))});
  }

  const filtered = useMemo(()=>sos.filter(s=>{
    const q=search.toLowerCase();
    return(stFilter==='All'||s.status===stFilter)&&(!search||(s.id||'').toLowerCase().includes(q)||(s.partyName||'').toLowerCase().includes(q))&&(!dateFrom||s.date>=dateFrom)&&(!dateTo||s.date<=dateTo);
  }),[sos,stFilter,search,dateFrom,dateTo]);

  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const STATUSES=['All','draft','approved','delivery_pending','delivered','invoiced','cancelled'];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Sales Orders</h2><p className="pm-page-sub">SO → DO → Invoice flow — tier-aware pricing</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>{setForm({partyId:'',warehouseId:'',date:'',paymentTerms:'Net 30',notes:'',items:[]});setEditId(null);setShowForm(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New SO
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          {label:'Total SOs',    value:sos.length,                                   icon:'invoice',  bg:'#f0fdf4', color:ACCENT},
          {label:'Draft',        value:sos.filter(s=>s.status==='draft').length,      icon:'edit',     bg:'#f8fafc', color:'#94a3b8'},
          {label:'Approved',     value:sos.filter(s=>s.status==='approved').length,   icon:'check',    bg:'#eff6ff', color:'#3b82f6'},
          {label:'In Delivery',  value:sos.filter(s=>['delivery_pending','delivered'].includes(s.status)).length, icon:'truck', bg:'#f5f3ff', color:'#8b5cf6'},
          {label:'Total Value',  value:fmtPKRsd(sos.reduce((s,o)=>s+(o.grandTotal||0),0)), icon:'briefcase', bg:'#fffbeb', color:'#f59e0b'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search SO ID or party…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {STATUSES.map(s=>(
              <button key={s} onClick={()=>{setStFilter(s);setPage(1);}}
                style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,fontWeight:500,cursor:'pointer',background:stFilter===s?ACCENT:'#fff',color:stFilter===s?'#fff':'#6b7280',borderColor:stFilter===s?ACCENT:'#e5e7eb',whiteSpace:'nowrap'}}>{s==='All'?'All':s.replace('_',' ')}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
            <span style={{fontSize:12,color:'#94a3b8'}}>—</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
            {(dateFrom||dateTo)&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>{setDateFrom('');setDateTo('');}}>✕</button>}
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>SO ID</th><th>Date</th><th>Party</th><th>Tier</th><th>Warehouse</th><th style={{textAlign:'right'}}>Sub Total</th><th style={{textAlign:'right'}}>Tax</th><th style={{textAlign:'right'}}>Grand Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No sales orders found</td></tr>
              : paged.map(so=>{
                  const tc=TIER_COLOR[so.tier]||'#94a3b8';
                  const wh=(warehouses||[]).find(w=>w.id===so.warehouseId);
                  return (
                    <tr key={so.id}>
                      <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{so.id}</td>
                      <td style={{color:'#9ca3af',fontSize:12}}>{so.date}</td>
                      <td><div style={{fontWeight:600}}>{so.partyName}</div></td>
                      <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{so.tier}</span></td>
                      <td style={{color:'#9ca3af',fontSize:12}}>{wh?.name||so.warehouseId||'—'}</td>
                      <td style={{textAlign:'right'}}>{fmtPKRsd(so.subTotal)}</td>
                      <td style={{textAlign:'right',color:'#9ca3af'}}>{fmtPKRsd(so.taxAmount)}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(so.grandTotal)}</td>
                      <td><span className={`pm-badge ${so.status==='invoiced'?'pm-badge-green':so.status==='approved'?'pm-badge-blue':so.status==='cancelled'?'pm-badge-red':so.status==='delivered'?'pm-badge-green':'pm-badge-gray'}`}>{so.status.replace('_',' ')}</span></td>
                      <td>
                        <div style={{display:'flex',gap:4,flexWrap:'nowrap'}}>
                          <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewSO(so)}>View</button>
                          {so.status==='draft'&&<button className="pm-btn pm-btn-primary" style={{background:'#3b82f6',padding:'3px 7px',fontSize:11}} onClick={()=>approveSalesOrder(so.id)}>Approve</button>}
                          {so.status==='approved'&&<button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6',padding:'3px 7px',fontSize:11}} onClick={()=>handleCreateDO(so)}>Create DO</button>}
                          {so.status==='draft'&&<button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11,color:'#ef4444'}} onClick={()=>cancelSalesOrder(so.id)}>Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
        {pages>1&&(
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewSO&&(
        <Modal title={`Sales Order: ${viewSO.id}`} onClose={()=>setViewSO(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
            {[['Date',viewSO.date],['Party',viewSO.partyName],['Tier',viewSO.tier],['Status',viewSO.status.replace('_',' ')],['Payment',viewSO.paymentTerms],['Warehouse',(warehouses||[]).find(w=>w.id===viewSO.warehouseId)?.name||'—'],['Sub Total',fmtPKRsd(viewSO.subTotal)],['Grand Total',fmtPKRsd(viewSO.grandTotal)]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:12.5,fontWeight:600,color:'#0f172a'}}>{v}</div>
              </div>
            ))}
          </div>
          <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Unit Price</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
            <tbody>
              {(viewSO.items||[]).map((it,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:600}}>{it.materialName}</td>
                  <td style={{textAlign:'right'}}>{it.qty} {it.unit}</td>
                  <td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:'flex',justifyContent:'flex-end',gap:12,fontSize:13,marginBottom:12}}>
            <span>Sub: <strong>{fmtPKRsd(viewSO.subTotal)}</strong></span>
            <span>Tax ({viewSO.taxPct}%): <strong>{fmtPKRsd(viewSO.taxAmount)}</strong></span>
            <span style={{color:ACCENT,fontWeight:700,fontSize:15}}>Total: {fmtPKRsd(viewSO.grandTotal)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            {viewSO.status==='draft'&&<button className="pm-btn pm-btn-primary" style={{background:'#3b82f6'}} onClick={()=>{approveSalesOrder(viewSO.id);setViewSO(null);}}>Approve</button>}
            {viewSO.status==='approved'&&<button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6'}} onClick={()=>{handleCreateDO(viewSO);setViewSO(null);}}>Create Delivery Order</button>}
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewSO(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* New SO Form */}
      {showForm&&(
        <Modal title="New Sales Order" onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group">
              <label>Party *</label>
              <select value={form.partyId} onChange={e=>handlePartyChange(e.target.value)}>
                <option value="">— Select Party —</option>
                {pts.filter(p=>p.status==='active').map(p=><option key={p.id} value={p.id}>[{p.tier}] {p.name} ({p.code})</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Warehouse *</label>
              <select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}>
                <option value="">— Select —</option>
                {whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group">
              <label>Payment Terms</label>
              <select value={form.paymentTerms} onChange={e=>setForm(f=>({...f,paymentTerms:e.target.value}))}>
                {PAY_TERMS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {selParty&&priceList&&(
            <div style={{background:'#f0fdf4',borderRadius:8,padding:'8px 14px',marginBottom:12,fontSize:12.5,color:'#065f46'}}>
              <strong>{priceList.name}</strong> will be applied for {selParty.tier} tier.
            </div>
          )}

          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Order Items</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}>
              <label>Material</label>
              <select value={item.materialId} onChange={e=>handleMatSelect(e.target.value)}>
                <option value="">— Select —</option>
                {mats.filter(m=>m.status!=='inactive').map(m=><option key={m.id} value={m.id}>{m.name} (Stock: {m.totalQty} {m.unit})</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group" style={{margin:0}}><label>Unit Price</label><input type="number" value={item.unitPrice} onChange={e=>setItem(i=>({...i,unitPrice:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:36}} onClick={addItem}>+ Add</button>
          </div>

          {form.items.length>0&&(
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Unit Price</th><th style={{textAlign:'right'}}>Total</th><th></th></tr></thead>
              <tbody>
                {form.items.map((it,idx)=>(
                  <tr key={idx}>
                    <td style={{fontWeight:600}}>{it.materialName}</td>
                    <td style={{textAlign:'right'}}>{it.qty} {it.unit}</td>
                    <td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.total)}</td>
                    <td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,i)=>i!==idx)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td>
                  </tr>
                ))}
                <tr style={{background:'#f8fafc'}}>
                  <td colSpan={3} style={{textAlign:'right',fontWeight:700}}>Sub Total:</td>
                  <td style={{textAlign:'right',fontWeight:700}}>{fmtPKRsd(subTotal)}</td><td/>
                </tr>
                <tr style={{background:'#f8fafc'}}>
                  <td colSpan={3} style={{textAlign:'right',color:'#6b7280'}}>GST (17%):</td>
                  <td style={{textAlign:'right',color:'#6b7280'}}>{fmtPKRsd(taxAmount)}</td><td/>
                </tr>
                <tr style={{background:'#f0fdf4'}}>
                  <td colSpan={3} style={{textAlign:'right',fontWeight:800,fontSize:14}}>Grand Total:</td>
                  <td style={{textAlign:'right',fontWeight:800,fontSize:15,color:ACCENT}}>{fmtPKRsd(grandTotal)}</td><td/>
                </tr>
              </tbody>
            </table>
          )}

          <div className="pm-form-group" style={{marginBottom:16}}><label>Notes</label><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional"/></div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-outline" onClick={()=>handleSave('draft')}>Save Draft</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>handleSave('approved')} disabled={!form.items.length}>Approve SO</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
