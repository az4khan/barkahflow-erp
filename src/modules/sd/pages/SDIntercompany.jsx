import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

export default function SDIntercompany() {
  const { sdParties, salesOrders, salesInvoices, invMaterials, warehouses, createSalesOrder, approveSalesOrder, createDeliveryOrder, deliverOrder, createSalesInvoice, sdPriceLists, toast } = useApp();

  const ownedParties = (sdParties||[]).filter(p=>p.isOwned && p.status==='active');
  const intercoSOs   = (salesOrders||[]).filter(s=> (sdParties||[]).find(p=>p.id===s.partyId)?.isOwned);
  const intercoInvs  = (salesInvoices||[]).filter(i=> (sdParties||[]).find(p=>p.id===i.partyId)?.isOwned);
  const mats  = (invMaterials||[]).filter(m=>m.status!=='inactive');
  const whs   = (warehouses||[]).filter(w=>w.status==='active');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ partyId:'', warehouseId:'', date:'', transferPrice:'MAP', items:[] });
  const [item, setItem] = useState({ materialId:'', qty:'', unitPrice:'' });

  function handleMatSelect(matId) {
    const mat = mats.find(m=>m.id===matId);
    setItem(i=>({...i,materialId:matId,unitPrice:mat?String(mat.mapPrice):''}));
  }
  function addItem() {
    const mat=mats.find(m=>m.id===item.materialId);
    if(!mat||!item.qty)return;
    const up=parseFloat(item.unitPrice)||mat.mapPrice;
    setForm(f=>({...f,items:[...f.items,{materialId:mat.id,materialName:mat.name,unit:mat.unit,qty:parseFloat(item.qty)||0,unitPrice:up,discount:0,total:(parseFloat(item.qty)||0)*up}]}));
    setItem({materialId:'',qty:'',unitPrice:''});
  }

  function handlePost() {
    const party=ownedParties.find(p=>p.id===form.partyId);
    if(!party||!form.items.length||!form.date){toast('Fill all required fields','error');return;}
    const subTotal=form.items.reduce((s,i)=>s+i.total,0);
    const so=createSalesOrder({...form,partyName:party.name,tier:party.tier,status:'approved',subTotal,taxPct:0,taxAmount:0,grandTotal:subTotal,paymentTerms:'Internal Transfer'});
    toast('Inter-company transfer posted','success');
    setShowForm(false);
    setForm({partyId:'',warehouseId:'',date:'',transferPrice:'MAP',items:[]});
  }

  const totalInterco = intercoInvs.reduce((s,i)=>s+(i.grandTotal||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Inter-company Sales</h2><p className="pm-page-sub">Sales from company to owned subsidiaries at MAP or transfer price</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Transfer</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Owned Subsidiaries', value:ownedParties.length,   icon:'building',  bg:'#f0fdf4', color:ACCENT},
          {label:'Inter-co Orders',    value:intercoSOs.length,     icon:'invoice',   bg:'#eff6ff', color:'#3b82f6'},
          {label:'Inter-co Invoiced',  value:intercoInvs.length,    icon:'briefcase', bg:'#fffbeb', color:'#f59e0b'},
          {label:'Total Value',        value:fmtPKRsd(totalInterco),icon:'trending',  bg:'#f0fdf4', color:ACCENT},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Owned subsidiaries overview */}
      <div className="pm-cards-grid" style={{marginBottom:20}}>
        {ownedParties.map(p=>{
          const tc=TIER_COLOR[p.tier]||'#94a3b8';
          const orders=intercoSOs.filter(s=>s.partyId===p.id).length;
          const value=intercoInvs.filter(i=>i.partyId===p.id).reduce((s,i)=>s+(i.grandTotal||0),0);
          return(
            <div className="pm-card" key={p.id} style={{borderLeft:`4px solid ${tc}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'#0f172a'}}>{p.name}</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>{p.code} · {p.city}</div>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:10,background:tc+'18',color:tc}}>{p.tier}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['Orders',orders],['Total Value',fmtPKRsd(value)],['Balance',fmtPKRsd(p.balance)],['Credit',fmtPKRsd(p.creditLimit)]].map(([l,v])=>(
                  <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 10px',textAlign:'center'}}><div style={{fontSize:10.5,color:'#94a3b8'}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{v}</div></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Inter-company Transactions</div></div>
        <table className="pm-table">
          <thead><tr><th>SO ID</th><th>Date</th><th>To Subsidiary</th><th>Tier</th><th style={{textAlign:'right'}}>Value</th><th>Status</th></tr></thead>
          <tbody>
            {intercoSOs.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No inter-company transactions yet</td></tr>
              :intercoSOs.map(so=>{
                const tc=TIER_COLOR[so.tier]||'#94a3b8';
                return(<tr key={so.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{so.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{so.date}</td>
                  <td style={{fontWeight:600}}>{so.partyName}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{so.tier}</span></td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(so.grandTotal)}</td>
                  <td><span className={`pm-badge ${so.status==='invoiced'?'pm-badge-green':so.status==='approved'?'pm-badge-blue':'pm-badge-gray'}`}>{so.status}</span></td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:680,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>New Inter-company Transfer</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24,overflowY:'auto',flex:1}}>
              <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:16}}>
                <div className="pm-form-group"><label>To Subsidiary *</label>
                  <select value={form.partyId} onChange={e=>setForm(f=>({...f,partyId:e.target.value}))}>
                    <option value="">— Select —</option>
                    {ownedParties.map(p=><option key={p.id} value={p.id}>[{p.tier}] {p.name}</option>)}
                  </select>
                </div>
                <div className="pm-form-group"><label>From Warehouse *</label>
                  <select value={form.warehouseId} onChange={e=>setForm(f=>({...f,warehouseId:e.target.value}))}>
                    <option value="">— Select —</option>
                    {whs.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
                <div className="pm-form-group"><label>Transfer Pricing</label>
                  <select value={form.transferPrice} onChange={e=>setForm(f=>({...f,transferPrice:e.target.value}))}>
                    <option value="MAP">MAP (Cost)</option>
                    <option value="Market">Market Price</option>
                    <option value="Custom">Custom Price</option>
                  </select>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Items</div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
                <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={e=>handleMatSelect(e.target.value)}><option value="">— Select —</option>{mats.map(m=><option key={m.id} value={m.id}>{m.name} (Stock: {m.totalQty})</option>)}</select></div>
                <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" value={item.qty} onChange={e=>setItem(i=>({...i,qty:e.target.value}))} placeholder="0"/></div>
                <div className="pm-form-group" style={{margin:0}}><label>Transfer Price</label><input type="number" value={item.unitPrice} onChange={e=>setItem(i=>({...i,unitPrice:e.target.value}))} placeholder="0"/></div>
                <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:36}} onClick={addItem}>+ Add</button>
              </div>
              {form.items.length>0&&(
                <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:16}}>
                  <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Transfer Price</th><th style={{textAlign:'right'}}>Total</th><th></th></tr></thead>
                  <tbody>
                    {form.items.map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right'}}>{it.qty} {it.unit}</td><td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.total)}</td><td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td></tr>)}
                    <tr style={{background:'#f8fafc'}}><td colSpan={3} style={{textAlign:'right',fontWeight:700}}>Total:</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT}}>{fmtPKRsd(form.items.reduce((s,i)=>s+i.total,0))}</td><td/></tr>
                  </tbody>
                </table>
              )}
              <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#065f46'}}>Inter-company sales are auto-approved. Stock will be deducted and inventory updated on delivery confirmation.</div>
            </div>
            <div style={{padding:'14px 24px',borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'flex-end',gap:8}}>
              <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handlePost} disabled={!form.items.length||!form.partyId}>Post Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
