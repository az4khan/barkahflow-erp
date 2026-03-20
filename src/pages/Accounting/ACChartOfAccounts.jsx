// ─── Chart of Accounts ────────────────────────────────────────────────────────
import { useState } from "react";
import Icon         from "../../components/common/Icon";
import { Modal, StatCard, StatusBadge, SearchBox } from "../../components/common/UI";
import { fmtPKR }   from "../../data/mockData";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_COLOR } from "./accountingConstants";

export default function ACChartOfAccounts({ accounts, setAccounts }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(emptyForm());

  function emptyForm() { return { id:"", name:"", type:"Asset", balance:"", active:true }; }

  const filtered = accounts.filter(a =>
    (filter === "All" || a.type === filter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );

  const openAdd  = () => { setForm(emptyForm()); setEditId(null); setShowAdd(true); };
  const openEdit = (a) => { setForm({ ...a, balance:String(a.balance) }); setEditId(a.id); setShowAdd(true); };

  const handleSave = () => {
    if (!form.id || !form.name) return;
    const data = { ...form, balance:parseFloat(form.balance)||0 };
    editId
      ? setAccounts(p => p.map(a => a.id===editId ? data : a))
      : setAccounts(p => [...p, data]);
    setShowAdd(false);
  };

  const toggleActive = (id) => setAccounts(p => p.map(a => a.id===id ? { ...a, active:!a.active } : a));

  const typeSummary = ACCOUNT_TYPES.map(t => ({
    type:t, color:ACCOUNT_TYPE_COLOR[t],
    count:accounts.filter(a=>a.type===t).length,
    total:accounts.filter(a=>a.type===t).reduce((s,a)=>s+a.balance,0),
  }));

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Chart of Accounts</h1>
          <p className="ac-page-sub">Master ledger — Al-Raza LPG (Pvt.) Ltd.</p>
        </div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-outline ac-btn-sm"><Icon name="download" size={13}/> Export</button>
          <button className="ac-btn ac-btn-primary" onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Account</button>
        </div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(5,1fr)" }}>
        {typeSummary.map(t => (
          <StatCard key={t.type} icon="list" iconBg={t.color+"18"} iconColor={t.color}
            label={t.type} value={fmtPKR(Math.abs(t.total))} sub={`${t.count} accounts`} />
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div className="ac-filter-bar" style={{ margin:0 }}>
          {["All",...ACCOUNT_TYPES].map(f => (
            <button key={f} className={`ac-filter-pill${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search ID or name..." />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header">
          <div className="ac-table-title">{filter==="All"?"All Accounts":`${filter} Accounts`} <span style={{ color:"#94a3b8", fontWeight:400 }}>({filtered.length})</span></div>
        </div>
        <table className="ac-table">
          <thead><tr>
            <th>ID</th><th>Account Name</th><th>Type</th>
            <th className="right">Balance</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"#9ca3af", fontSize:13 }}>No accounts found</td></tr>
              : filtered.map(a => (
                <tr key={a.id}>
                  <td className="primary">{a.id}</td>
                  <td className="bold">{a.name}</td>
                  <td><span style={{ color:ACCOUNT_TYPE_COLOR[a.type], fontWeight:600, fontSize:12.5 }}>{a.type}</span></td>
                  <td className="right" style={{ color:a.balance<0?"#dc2626":"#111827", fontWeight:600 }}>{fmtPKR(a.balance)}</td>
                  <td><StatusBadge status={a.active?"Active":"Inactive"}/></td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>openEdit(a)}>Edit</button>
                      <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>toggleActive(a.id)}>{a.active?"Deactivate":"Activate"}</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title={editId?"Edit Account":"Add Account"} onClose={()=>setShowAdd(false)} size="sm">
          <div className="ac-form-grid ac-form-grid-2">
            <div className="ac-form-group">
              <label>Account ID *</label>
              <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="e.g. 1050" disabled={!!editId} />
            </div>
            <div className="ac-form-group">
              <label>Type *</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="ac-form-group ac-form-full">
              <label>Account Name *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Petty Cash" />
            </div>
            <div className="ac-form-group ac-form-full">
              <label>Opening Balance</label>
              <input type="number" value={form.balance} onChange={e=>setForm(f=>({...f,balance:e.target.value}))} placeholder="0" />
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={handleSave}>{editId?"Save Changes":"Add Account"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
