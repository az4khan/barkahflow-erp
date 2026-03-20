import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';

const ACCENT = '#0d9488';

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Cost Centers ── */
export function ACCostCenters() {
  const { acCostCenters: costCenters, setAcCostCenters } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({ id:'', name:'', dept:'', budget:'', actual:'0' });

  const totalBudget = (costCenters||[]).reduce((s,c)=>s+c.budget,0);
  const totalActual = (costCenters||[]).reduce((s,c)=>s+c.actual,0);
  const over        = (costCenters||[]).filter(c=>c.actual>c.budget).length;

  function openAdd()  { setForm({ id:'', name:'', dept:'', budget:'', actual:'0' }); setEditId(null); setShowAdd(true); }
  function openEdit(c){ setForm({...c, budget:String(c.budget), actual:String(c.actual)}); setEditId(c.id); setShowAdd(true); }
  function handleSave() {
    if (!form.id||!form.name) return;
    const data = { ...form, budget:parseFloat(form.budget)||0, actual:parseFloat(form.actual)||0 };
    editId
      ? setAcCostCenters(p=>(p||[]).map(c=>c.id===editId?data:c))
      : setAcCostCenters(p=>[...(p||[]),data]);
    setShowAdd(false);
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Cost Centers</h2><p className="pm-page-sub">Budget vs actual tracking</p></div>
        <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Center</button>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Cost Centers', value:(costCenters||[]).length, icon:'building',  bg:'#f0fdfa', color:ACCENT },
          { label:'Total Budget', value:fmtPKR(totalBudget),      icon:'briefcase', bg:'#eff6ff', color:'#3b82f6' },
          { label:'Total Actual', value:fmtPKR(totalActual),      icon:'trending',  bg:over?'#fef2f2':'#f0fdf4', color:over?'#ef4444':'#10b981', hint:`${totalBudget?((totalActual/totalBudget)*100).toFixed(0):0}% utilised` },
          { label:'Over Budget',  value:over,                     icon:'alert',     bg:'#fef2f2', color:'#ef4444' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?16:22 }}>{s.value}</div>
            {s.hint&&<div className="pm-stat-hint">{s.hint}</div>}
          </div>
        ))}
      </div>

      <div className="pm-cards-grid" style={{ marginBottom:20 }}>
        {(costCenters||[]).map(c => {
          const pct  = Math.min((c.actual/c.budget)*100, 100);
          const isOver = c.actual > c.budget;
          return (
            <div className="pm-card" key={c.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{c.name}</div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{c.id} · {c.dept}</div>
                </div>
                <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>openEdit(c)}>Edit</button>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:8 }}>
                <span>Budget: <strong>{fmtPKR(c.budget)}</strong></span>
                <span>Actual: <strong style={{ color:isOver?'#dc2626':'#16a34a' }}>{fmtPKR(c.actual)}</strong></span>
              </div>
              <div style={{ height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:isOver?'#ef4444':ACCENT, borderRadius:4, transition:'width 0.6s' }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, color:'#94a3b8' }}>
                <span>{pct.toFixed(0)}% used</span>
                <span style={{ color:isOver?'#dc2626':'#16a34a', fontWeight:600 }}>{isOver?`${fmtPKR(c.actual-c.budget)} over`:`${fmtPKR(c.budget-c.actual)} left`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">All Cost Centers</div></div>
        <table className="pm-table">
          <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th style={{textAlign:'right'}}>Budget</th><th style={{textAlign:'right'}}>Actual</th><th style={{textAlign:'right'}}>Variance</th><th>Utilisation</th></tr></thead>
          <tbody>
            {(costCenters||[]).map(c=>{
              const variance = c.budget-c.actual;
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{c.id}</td>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td style={{ color:'#9ca3af' }}>{c.dept}</td>
                  <td style={{ textAlign:'right' }}>{fmtPKR(c.budget)}</td>
                  <td style={{ textAlign:'right', color:c.actual>c.budget?'#dc2626':'#16a34a', fontWeight:600 }}>{fmtPKR(c.actual)}</td>
                  <td style={{ textAlign:'right', color:variance<0?'#dc2626':'#16a34a', fontWeight:600 }}>{variance<0?'-':''}{fmtPKR(Math.abs(variance))}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:80, height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.min((c.actual/c.budget)*100,100)}%`, background:c.actual>c.budget?'#ef4444':ACCENT }}/>
                      </div>
                      <span style={{ fontSize:12, color:'#6b7280' }}>{((c.actual/c.budget)*100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editId?'Edit Cost Center':'Add Cost Center'} onClose={()=>setShowAdd(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>ID *</label><input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="CC-006" disabled={!!editId}/></div>
            <div className="pm-form-group"><label>Department</label><input value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} placeholder="e.g. Sales"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Cost center name"/></div>
            <div className="pm-form-group"><label>Budget</label><input type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Actual</label><input type="number" value={form.actual} onChange={e=>setForm(f=>({...f,actual:e.target.value}))} placeholder="0"/></div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={handleSave}>{editId?'Save':'Add'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Tax Management ── */
export function ACTaxManagement() {
  const { acTaxRates: taxRates, setAcTaxRates } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({ id:'', name:'', rate:'', type:'Output', applicable:'', active:true });

  function openAdd()  { setForm({ id:'', name:'', rate:'', type:'Output', applicable:'', active:true }); setEditId(null); setShowAdd(true); }
  function openEdit(t){ setForm({...t, rate:String(t.rate)}); setEditId(t.id); setShowAdd(true); }
  function toggle(id) { setAcTaxRates(p=>(p||[]).map(t=>t.id===id?{...t,active:!t.active}:t)); }
  function handleSave() {
    if (!form.id||!form.name) return;
    const data = { ...form, rate:parseFloat(form.rate)||0 };
    editId
      ? setAcTaxRates(p=>(p||[]).map(t=>t.id===editId?data:t))
      : setAcTaxRates(p=>[...(p||[]),data]);
    setShowAdd(false);
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Tax Management</h2><p className="pm-page-sub">GST & WHT rates — Pakistan Tax Framework</p></div>
        <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Tax</button>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Tax Rates',    value:(taxRates||[]).length,                             icon:'calculator', bg:'#f0fdfa', color:ACCENT },
          { label:'Active',       value:(taxRates||[]).filter(t=>t.active).length,         icon:'check',      bg:'#f0fdf4', color:'#10b981' },
          { label:'Output (GST)', value:(taxRates||[]).filter(t=>t.type==='Output').length,icon:'briefcase',  bg:'#eff6ff', color:'#3b82f6' },
          { label:'Withholding',  value:(taxRates||[]).filter(t=>t.type==='Withholding').length, icon:'reports', bg:'#faf5ff', color:'#7c3aed' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Tax Rates ({(taxRates||[]).length})</div></div>
        <table className="pm-table">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th style={{textAlign:'right'}}>Rate %</th><th>Applicable</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(taxRates||[]).map(t=>(
              <tr key={t.id}>
                <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{t.id}</td>
                <td style={{ fontWeight:600 }}>{t.name}</td>
                <td><span className={`pm-badge ${t.type==='Output'?'pm-badge-blue':t.type==='Input'?'pm-badge-green':'pm-badge-orange'}`}>{t.type}</span></td>
                <td style={{ textAlign:'right', fontWeight:700, color:ACCENT, fontSize:14 }}>{t.rate}%</td>
                <td style={{ color:'#9ca3af', fontSize:12 }}>{t.applicable}</td>
                <td><span className={`pm-badge ${t.active?'pm-badge-green':'pm-badge-gray'}`}>{t.active?'Active':'Inactive'}</span></td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>openEdit(t)}>Edit</button>
                    <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>toggle(t.id)}>{t.active?'Deactivate':'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editId?'Edit Tax Rate':'Add Tax Rate'} onClose={()=>setShowAdd(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>ID *</label><input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="TX-007" disabled={!!editId}/></div>
            <div className="pm-form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Output</option><option>Input</option><option>Withholding</option></select></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tax name"/></div>
            <div className="pm-form-group"><label>Rate %</label><input type="number" value={form.rate} onChange={e=>setForm(f=>({...f,rate:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Applicable</label><input value={form.applicable} onChange={e=>setForm(f=>({...f,applicable:e.target.value}))} placeholder="e.g. All Sales"/></div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={handleSave}>{editId?'Save':'Add'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
