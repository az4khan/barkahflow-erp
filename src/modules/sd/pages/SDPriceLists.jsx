import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';
const TIERS  = ['Wholesaler','Retailer','Shop','Consumer'];

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

export default function SDPriceLists() {
  const { sdPriceLists, invMaterials, createPriceList, updatePriceList } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [viewPL,   setViewPL]   = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({ name:'', tier:'Wholesaler', effectiveFrom:'', effectiveTo:'', status:'active', items:[] });
  const [priceItem, setPriceItem] = useState({ materialId:'', unitPrice:'' });

  const pls  = sdPriceLists  || [];
  const mats = (invMaterials || []).filter(m => m.status !== 'inactive');

  function openCreate() { setForm({ name:'', tier:'Wholesaler', effectiveFrom:'', effectiveTo:'', status:'active', items:[] }); setEditId(null); setShowForm(true); }
  function openEdit(pl)  { setForm({ ...pl }); setEditId(pl.id); setShowForm(true); }

  function addPriceItem() {
    const mat = mats.find(m => m.id === priceItem.materialId);
    if (!mat || !priceItem.unitPrice) return;
    setForm(f => ({ ...f, items: [...(f.items||[]).filter(i=>i.materialId!==mat.id), { materialId:mat.id, materialName:mat.name, unitPrice:parseFloat(priceItem.unitPrice)||0, discountPct:0 }] }));
    setPriceItem({ materialId:'', unitPrice:'' });
  }

  function handleSave() {
    if (!form.name || !form.items?.length) return;
    editId ? updatePriceList(editId, form) : createPriceList(form);
    setShowForm(false);
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Price Lists</h2><p className="pm-page-sub">Tier-based pricing — Wholesaler → Retailer → Shop → Consumer</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Price List</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {TIERS.map(t => {
          const pl = pls.find(p => p.tier===t && p.status==='active');
          return (
            <div className="pm-stat-card" key={t} style={{borderTop:`3px solid ${TIER_COLOR[t]}`}}>
              <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:TIER_COLOR[t]+'18'}}><Icon name="list" size={17} color={TIER_COLOR[t]}/></div></div>
              <div className="pm-stat-label">{t}</div>
              <div className="pm-stat-value" style={{fontSize:14}}>{pl?.name || 'No active list'}</div>
              <div className="pm-stat-hint">{pl ? `${pl.items?.length||0} materials` : '—'}</div>
            </div>
          );
        })}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {pls.length===0 && <div className="pm-table-wrap"><div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:13}}>No price lists yet — create one to enable tier pricing on Sales Orders</div></div>}
        {pls.map(pl => (
          <div className="pm-table-wrap" key={pl.id} style={{borderLeft:`4px solid ${TIER_COLOR[pl.tier]||'#94a3b8'}`}}>
            <div className="pm-table-header">
              <div>
                <div className="pm-table-title">{pl.name}</div>
                <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>{pl.effectiveFrom} → {pl.effectiveTo} · {pl.items?.length||0} materials</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:10,background:TIER_COLOR[pl.tier]+'18',color:TIER_COLOR[pl.tier]}}>{pl.tier}</span>
                <span className={`pm-badge ${pl.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{pl.status}</span>
                <button className="pm-btn pm-btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>setViewPL(pl)}>View</button>
                <button className="pm-btn pm-btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>openEdit(pl)}>Edit</button>
              </div>
            </div>
            <table className="pm-table">
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Unit Price</th><th style={{textAlign:'right'}}>Discount %</th><th style={{textAlign:'right'}}>Effective Price</th></tr></thead>
              <tbody>
                {(pl.items||[]).map(it => (
                  <tr key={it.materialId}>
                    <td style={{fontWeight:600}}>{it.materialName}</td>
                    <td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td>
                    <td style={{textAlign:'right',color:'#9ca3af'}}>{it.discountPct||0}%</td>
                    <td style={{textAlign:'right',fontWeight:700,color:TIER_COLOR[pl.tier]||ACCENT}}>{fmtPKRsd(it.unitPrice*(1-(it.discountPct||0)/100))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {viewPL && (
        <Modal title={viewPL.name} onClose={()=>setViewPL(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[['Tier',viewPL.tier],['Status',viewPL.status],['From',viewPL.effectiveFrom||'—'],['To',viewPL.effectiveTo||'—'],['Materials',viewPL.items?.length||0]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>
          <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden'}}>
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Unit Price</th><th style={{textAlign:'right'}}>Discount</th><th style={{textAlign:'right'}}>Final Price</th></tr></thead>
            <tbody>{(viewPL.items||[]).map(it=><tr key={it.materialId}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td><td style={{textAlign:'right',color:'#94a3b8'}}>{it.discountPct||0}%</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.unitPrice*(1-(it.discountPct||0)/100))}</td></tr>)}</tbody>
          </table>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}><button className="pm-btn pm-btn-ghost" onClick={()=>setViewPL(null)}>Close</button></div>
        </Modal>
      )}

      {showForm && (
        <Modal title={editId?'Edit Price List':'New Price List'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr',marginBottom:16}}>
            <div className="pm-form-group"><label>List Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Wholesale Price List 2026"/></div>
            <div className="pm-form-group"><label>Tier *</label>
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))}>
                {TIERS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Effective From</label><input type="date" value={form.effectiveFrom} onChange={e=>setForm(f=>({...f,effectiveFrom:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Effective To</label><input type="date" value={form.effectiveTo} onChange={e=>setForm(f=>({...f,effectiveTo:e.target.value}))}/></div>
          </div>

          <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:8}}>Price Items</div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr auto',gap:8,marginBottom:12,alignItems:'end'}}>
            <div className="pm-form-group" style={{margin:0}}><label>Material</label>
              <select value={priceItem.materialId} onChange={e=>{ const mat=mats.find(m=>m.id===e.target.value); setPriceItem(i=>({...i,materialId:e.target.value,unitPrice:mat?String(mat.mapPrice):''})); }}>
                <option value="">— Select —</option>
                {mats.map(m=><option key={m.id} value={m.id}>{m.name} (MAP: {fmtPKRsd(m.mapPrice)})</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{margin:0}}><label>Unit Price *</label><input type="number" value={priceItem.unitPrice} onChange={e=>setPriceItem(i=>({...i,unitPrice:e.target.value}))} placeholder="0"/></div>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:36}} onClick={addPriceItem}>+ Add</button>
          </div>

          {(form.items||[]).length > 0 && (
            <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:16}}>
              <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Unit Price</th><th></th></tr></thead>
              <tbody>
                {(form.items||[]).map((it,i)=>(
                  <tr key={i}>
                    <td style={{fontWeight:600}}>{it.materialName}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.unitPrice)}</td>
                    <td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:16}}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save Changes':'Create Price List'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
