// ─── Master Data: Cost Centers & Tax Management ───────────────────────────────
import { useState } from "react";
import Icon         from "../../components/common/Icon";
import { Modal, StatCard, StatusBadge } from "../../components/common/UI";
import { fmtPKR }  from "../../data/mockData";

/* ── Cost Centers ─────────────────────────────────────────────────────────────── */
export function ACCostCenters({ costCenters, setCostCenters }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(emptyCC());

  function emptyCC() { return { id:"", name:"", dept:"", budget:"", actual:"0" }; }

  const totalBudget = costCenters.reduce((s,c)=>s+c.budget,0);
  const totalActual = costCenters.reduce((s,c)=>s+c.actual,0);
  const over        = costCenters.filter(c=>c.actual>c.budget).length;

  const openAdd  = () => { setForm(emptyCC()); setEditId(null); setShowAdd(true); };
  const openEdit = (c) => { setForm({...c,budget:String(c.budget),actual:String(c.actual)}); setEditId(c.id); setShowAdd(true); };

  const handleSave = () => {
    if (!form.id||!form.name) return;
    const data = { ...form, budget:parseFloat(form.budget)||0, actual:parseFloat(form.actual)||0 };
    editId
      ? setCostCenters(p=>p.map(c=>c.id===editId?data:c))
      : setCostCenters(p=>[...p,data]);
    setShowAdd(false);
  };

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Cost Centers</h1><p className="ac-page-sub">Budget vs actual tracking</p></div>
        <button className="ac-btn ac-btn-primary" onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Center</button>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="building"  iconBg="#f0fdfa" iconColor="#0d9488" label="Cost Centers" value={costCenters.length} />
        <StatCard icon="briefcase" iconBg="#eff6ff" iconColor="#3b82f6" label="Total Budget" value={fmtPKR(totalBudget)} />
        <StatCard icon="trending"  iconBg={over?"#fef2f2":"#f0fdf4"} iconColor={over?"#ef4444":"#10b981"} label="Total Actual" value={fmtPKR(totalActual)} sub={`${((totalActual/totalBudget)*100).toFixed(0)}% utilised`} />
        <StatCard icon="alert"     iconBg="#fef2f2" iconColor="#ef4444" label="Over Budget"  value={over} />
      </div>

      <div className="ac-cards-grid" style={{ marginBottom:20 }}>
        {costCenters.map(c => {
          const pct = Math.min((c.actual/c.budget)*100, 100);
          const over = c.actual > c.budget;
          return (
            <div key={c.id} className="ac-cc-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="ac-cc-name">{c.name}</div>
                  <div className="ac-cc-id">{c.id} · {c.dept}</div>
                </div>
                <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>openEdit(c)}>Edit</button>
              </div>
              <div className="ac-cc-meta">
                <span>Budget: <strong>{fmtPKR(c.budget)}</strong></span>
                <span>Actual: <strong style={{ color:over?"#dc2626":"#16a34a" }}>{fmtPKR(c.actual)}</strong></span>
              </div>
              <div className="ac-track">
                <div className="ac-fill" style={{ width:`${pct}%`, background:over?"#ef4444":"#0d9488" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, marginTop:5, color:"#9ca3af" }}>
                <span>{pct.toFixed(0)}% used</span>
                <span style={{ color:over?"#dc2626":"#16a34a", fontWeight:600 }}>
                  {over?`${fmtPKR(c.actual-c.budget)} over`:`${fmtPKR(c.budget-c.actual)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view */}
      <div className="ac-table-wrap">
        <div className="ac-table-header"><div className="ac-table-title">All Cost Centers</div></div>
        <table className="ac-table">
          <thead><tr><th>ID</th><th>Name</th><th>Dept</th><th className="right">Budget</th><th className="right">Actual</th><th className="right">Variance</th><th>Utilisation</th></tr></thead>
          <tbody>
            {costCenters.map(c=>{
              const variance = c.budget-c.actual;
              return (
                <tr key={c.id}>
                  <td className="primary">{c.id}</td>
                  <td className="bold">{c.name}</td>
                  <td className="muted">{c.dept}</td>
                  <td className="right">{fmtPKR(c.budget)}</td>
                  <td className="right" style={{ color:c.actual>c.budget?"#dc2626":"#16a34a", fontWeight:600 }}>{fmtPKR(c.actual)}</td>
                  <td className="right" style={{ color:variance<0?"#dc2626":"#16a34a", fontWeight:600 }}>{variance<0?"-":""}{fmtPKR(Math.abs(variance))}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div className="ac-track" style={{ width:80 }}>
                        <div className="ac-fill" style={{ width:`${Math.min((c.actual/c.budget)*100,100)}%`, background:c.actual>c.budget?"#ef4444":"#0d9488" }}/>
                      </div>
                      <span style={{ fontSize:12, color:"#6b7280" }}>{((c.actual/c.budget)*100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editId?"Edit Cost Center":"Add Cost Center"} onClose={()=>setShowAdd(false)} size="sm">
          <div className="ac-form-grid ac-form-grid-2">
            <div className="ac-form-group"><label>ID *</label><input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="CC-006" disabled={!!editId}/></div>
            <div className="ac-form-group"><label>Department</label><input value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} placeholder="e.g. Sales"/></div>
            <div className="ac-form-group ac-form-full"><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Cost center name"/></div>
            <div className="ac-form-group"><label>Budget</label><input type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} placeholder="0"/></div>
            <div className="ac-form-group"><label>Actual</label><input type="number" value={form.actual} onChange={e=>setForm(f=>({...f,actual:e.target.value}))} placeholder="0"/></div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={handleSave}>{editId?"Save":"Add"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Tax Management ───────────────────────────────────────────────────────────── */
export function ACTaxManagement({ taxRates, setTaxRates }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(emptyTax());

  function emptyTax() { return { id:"", name:"", rate:"", type:"Output", applicable:"", active:true }; }

  const openAdd  = () => { setForm(emptyTax()); setEditId(null); setShowAdd(true); };
  const openEdit = (t) => { setForm({...t,rate:String(t.rate)}); setEditId(t.id); setShowAdd(true); };
  const toggle   = (id) => setTaxRates(p=>p.map(t=>t.id===id?{...t,active:!t.active}:t));
  const handleSave = () => {
    if (!form.id||!form.name) return;
    const data = { ...form, rate:parseFloat(form.rate)||0 };
    editId ? setTaxRates(p=>p.map(t=>t.id===editId?data:t)) : setTaxRates(p=>[...p,data]);
    setShowAdd(false);
  };

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Tax Management</h1><p className="ac-page-sub">GST & WHT rates — Pakistan Tax Framework</p></div>
        <button className="ac-btn ac-btn-primary" onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Tax</button>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="calculator" iconBg="#f0fdfa" iconColor="#0d9488" label="Tax Rates"    value={taxRates.length} />
        <StatCard icon="check"      iconBg="#f0fdf4" iconColor="#10b981" label="Active"       value={taxRates.filter(t=>t.active).length} />
        <StatCard icon="briefcase"  iconBg="#eff6ff" iconColor="#3b82f6" label="Output (GST)" value={taxRates.filter(t=>t.type==="Output").length} />
        <StatCard icon="reports"    iconBg="#faf5ff" iconColor="#7c3aed" label="Withholding"  value={taxRates.filter(t=>t.type==="Withholding").length} />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header"><div className="ac-table-title">Tax Rates ({taxRates.length})</div></div>
        <table className="ac-table">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th className="right">Rate %</th><th>Applicable</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {taxRates.map(t=>(
              <tr key={t.id}>
                <td className="primary">{t.id}</td>
                <td className="bold">{t.name}</td>
                <td><span className={`ac-badge ${t.type==="Output"?"ac-badge-blue":t.type==="Input"?"ac-badge-green":"ac-badge-orange"}`}>{t.type}</span></td>
                <td className="right" style={{ fontWeight:700, color:"#0d9488", fontSize:14 }}>{t.rate}%</td>
                <td className="muted">{t.applicable}</td>
                <td><StatusBadge status={t.active?"Active":"Inactive"}/></td>
                <td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>openEdit(t)}>Edit</button>
                    <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>toggle(t.id)}>{t.active?"Deactivate":"Activate"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editId?"Edit Tax Rate":"Add Tax Rate"} onClose={()=>setShowAdd(false)} size="sm">
          <div className="ac-form-grid ac-form-grid-2">
            <div className="ac-form-group"><label>ID *</label><input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="TX-007" disabled={!!editId}/></div>
            <div className="ac-form-group"><label>Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option>Output</option><option>Input</option><option>Withholding</option></select></div>
            <div className="ac-form-group ac-form-full"><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tax name"/></div>
            <div className="ac-form-group"><label>Rate %</label><input type="number" value={form.rate} onChange={e=>setForm(f=>({...f,rate:e.target.value}))} placeholder="0"/></div>
            <div className="ac-form-group"><label>Applicable</label><input value={form.applicable} onChange={e=>setForm(f=>({...f,applicable:e.target.value}))} placeholder="e.g. All Sales"/></div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={handleSave}>{editId?"Save":"Add"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
