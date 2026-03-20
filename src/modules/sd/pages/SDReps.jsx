import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}

export default function SDReps() {
  const { commissionReps, salesInvoices, createCommissionRep, updateCommissionRep } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', tier:'Wholesaler', targetMonthly:'', commissionPct:'', status:'active' });

  const reps = commissionReps || [];
  const invs = salesInvoices  || [];

  // Compute current month sales per rep (simplified — match by tier)
  const now  = new Date().toISOString().slice(0,7);
  function repSales(rep) {
    return invs.filter(i=>i.tier===rep.tier&&i.date?.startsWith(now)).reduce((s,i)=>s+(i.subTotal||0),0);
  }
  function repCommission(rep) { return repSales(rep)*(rep.commissionPct/100); }
  function repAttainment(rep) { const s=repSales(rep); return rep.targetMonthly>0?Math.round((s/rep.targetMonthly)*100):0; }

  function openCreate() { setForm({name:'',email:'',phone:'',tier:'Wholesaler',targetMonthly:'',commissionPct:'',status:'active'}); setEditId(null); setShowForm(true); }
  function openEdit(r)  { setForm({...r,targetMonthly:String(r.targetMonthly||''),commissionPct:String(r.commissionPct||'')}); setEditId(r.id); setShowForm(true); }
  function handleSave() {
    if(!form.name)return;
    const data={...form,targetMonthly:parseFloat(form.targetMonthly)||0,commissionPct:parseFloat(form.commissionPct)||0};
    editId?updateCommissionRep(editId,data):createCommissionRep(data);
    setShowForm(false);
  }

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Sales Reps</h2><p className="pm-page-sub">Commission-based sales representatives with monthly targets</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> Add Rep</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Reps',value:reps.length,icon:'users',bg:'#f0fdf4',color:ACCENT},{label:'Active',value:reps.filter(r=>r.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Total Commission MTD',value:fmtPKRsd(reps.reduce((s,r)=>s+repCommission(r),0)),icon:'trending',bg:'#fffbeb',color:'#f59e0b'},{label:'Avg Attainment',value:`${Math.round(reps.reduce((s,r)=>s+repAttainment(r),0)/Math.max(reps.length,1))}%`,icon:'briefcase',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-cards-grid">
        {reps.map(rep=>{
          const sales=repSales(rep);
          const comm=repCommission(rep);
          const att=repAttainment(rep);
          const tc=TIER_COLOR[rep.tier]||'#94a3b8';
          return(
            <div className="pm-card" key={rep.id}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:tc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff'}}>{rep.name[0]}</div>
                    <div>
                      <div style={{fontWeight:700,color:'#0f172a'}}>{rep.name}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{rep.email}</div>
                    </div>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:10,background:tc+'18',color:tc}}>{rep.tier}</span>
                </div>
                <div style={{display:'flex',gap:4}}>
                  <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEdit(rep)}>Edit</button>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {[['Monthly Target',fmtPKRsd(rep.targetMonthly)],['MTD Sales',fmtPKRsd(sales)],['Commission Rate',`${rep.commissionPct}%`],['Commission MTD',fmtPKRsd(comm)]].map(([l,v])=>(
                  <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 10px'}}>
                    <div style={{fontSize:10.5,color:'#94a3b8'}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:4,display:'flex',justifyContent:'space-between',fontSize:12}}>
                <span style={{color:'#374151'}}>Target Attainment</span>
                <span style={{fontWeight:700,color:att>=100?'#10b981':att>=70?'#f59e0b':'#ef4444'}}>{att}%</span>
              </div>
              <div style={{height:7,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(att,100)}%`,background:att>=100?'#10b981':att>=70?'#f59e0b':'#ef4444',borderRadius:4,transition:'width 0.6s'}}/>
              </div>
            </div>
          );
        })}
      </div>

      {reps.length===0&&<div className="pm-table-wrap"><div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:13}}>No sales reps yet — add your first rep</div></div>}

      {showForm&&(
        <Modal title={editId?'Edit Sales Rep':'Add Sales Rep'} onClose={()=>setShowForm(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full name"/></div>
            <div className="pm-form-group"><label>Email</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="rep@company.com"/></div>
            <div className="pm-form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+92-300-…"/></div>
            <div className="pm-form-group"><label>Responsible Tier</label><select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))}><option>Wholesaler</option><option>Retailer</option><option>Shop</option><option>Consumer</option></select></div>
            <div className="pm-form-group"><label>Monthly Target (Rs)</label><input type="number" value={form.targetMonthly} onChange={e=>setForm(f=>({...f,targetMonthly:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Commission %</label><input type="number" value={form.commissionPct} onChange={e=>setForm(f=>({...f,commissionPct:e.target.value}))} placeholder="0.5"/></div>
            <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save':'Add Rep'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
