import { useState } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';
const DISC_TYPES = ['Volume','Seasonal','Party-specific','Loyalty'];
const TIERS = ['All','Wholesaler','Retailer','Shop','Consumer'];

export default function SDDiscounts() {
  const { sdParties, invMaterials } = useApp();
  const [discounts, setDiscounts] = useState([
    { id:'DSC-001', name:'Bulk LPG Volume Discount', type:'Volume', tier:'Wholesaler', minQty:100, discountPct:5,  materialId:'MAT-001', materialName:'LPG Cylinder 45kg',  status:'active',  validFrom:'2026-01-01', validTo:'2026-12-31' },
    { id:'DSC-002', name:'Summer Season Offer',      type:'Seasonal',tier:'Retailer', minQty:50,  discountPct:3,  materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg',status:'active',  validFrom:'2026-04-01', validTo:'2026-06-30' },
    { id:'DSC-003', name:'WAPDA Loyalty Discount',   type:'Loyalty', tier:'Consumer', minQty:1,   discountPct:2,  materialId:'MAT-004', materialName:'LPG Bulk MT',        status:'active',  validFrom:'2026-01-01', validTo:'2026-12-31' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', type:'Volume', tier:'Wholesaler', minQty:'', discountPct:'', materialId:'', validFrom:'', validTo:'' });

  const mats = (invMaterials||[]).filter(m=>m.status!=='inactive');

  function handleSave() {
    if (!form.name||!form.discountPct) return;
    const mat = mats.find(m=>m.id===form.materialId);
    const newDisc = { ...form, id:`DSC-${String(discounts.length+1).padStart(3,'0')}`, materialName:mat?.name||'All', minQty:parseFloat(form.minQty)||0, discountPct:parseFloat(form.discountPct)||0, status:'active' };
    setDiscounts(prev=>[newDisc,...prev]);
    setShowForm(false);
    setForm({ name:'', type:'Volume', tier:'Wholesaler', minQty:'', discountPct:'', materialId:'', validFrom:'', validTo:'' });
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Discount Schemes</h2><p className="pm-page-sub">Volume, seasonal & loyalty discounts applied at order entry</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Scheme</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {label:'Total Schemes', value:discounts.length,                            icon:'star',   bg:'#f0fdf4', color:ACCENT},
          {label:'Active',        value:discounts.filter(d=>d.status==='active').length, icon:'check',  bg:'#f0fdf4', color:'#10b981'},
          {label:'Volume',        value:discounts.filter(d=>d.type==='Volume').length,   icon:'box',    bg:'#eff6ff', color:'#3b82f6'},
          {label:'Avg Discount',  value:`${(discounts.reduce((s,d)=>s+d.discountPct,0)/Math.max(discounts.length,1)).toFixed(1)}%`, icon:'trending', bg:'#fffbeb', color:'#f59e0b'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?18:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Discount Schemes ({discounts.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Name</th><th>Type</th><th>Tier</th><th>Material</th><th style={{textAlign:'right'}}>Min Qty</th><th style={{textAlign:'right'}}>Discount %</th><th>Valid Period</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {discounts.map(d=>{
              const tc=TIER_COLOR[d.tier]||'#94a3b8';
              return(
                <tr key={d.id}>
                  <td style={{fontWeight:600,color:'#0f172a'}}>{d.name}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:'#f0f9ff',color:'#3b82f6'}}>{d.type}</span></td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:tc+'18',color:tc}}>{d.tier}</span></td>
                  <td style={{color:'#6b7280',fontSize:12}}>{d.materialName}</td>
                  <td style={{textAlign:'right'}}>{d.minQty}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT,fontSize:14}}>{d.discountPct}%</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{d.validFrom} → {d.validTo}</td>
                  <td><span className={`pm-badge ${d.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{d.status}</span></td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setDiscounts(p=>p.map(x=>x.id===d.id?{...x,status:x.status==='active'?'inactive':'active'}:x))}>{d.status==='active'?'Deactivate':'Activate'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:560,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>New Discount Scheme</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Scheme Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Ramadan Volume Offer"/></div>
                <div className="pm-form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{DISC_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="pm-form-group"><label>Tier</label><select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))}>{TIERS.filter(t=>t!=='All').map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="pm-form-group"><label>Material (leave blank for all)</label><select value={form.materialId} onChange={e=>setForm(f=>({...f,materialId:e.target.value}))}><option value="">All Materials</option>{mats.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                <div className="pm-form-group"><label>Min Qty</label><input type="number" value={form.minQty} onChange={e=>setForm(f=>({...f,minQty:e.target.value}))} placeholder="0"/></div>
                <div className="pm-form-group"><label>Discount % *</label><input type="number" value={form.discountPct} onChange={e=>setForm(f=>({...f,discountPct:e.target.value}))} placeholder="e.g. 5"/></div>
                <div className="pm-form-group"><label>Valid From</label><input type="date" value={form.validFrom} onChange={e=>setForm(f=>({...f,validFrom:e.target.value}))}/></div>
                <div className="pm-form-group"><label>Valid To</label><input type="date" value={form.validTo} onChange={e=>setForm(f=>({...f,validTo:e.target.value}))}/></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
                <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>Create Scheme</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
