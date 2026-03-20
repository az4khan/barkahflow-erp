import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_COLOR } from '../accountingConstants';

const ACCENT = '#0d9488';

function StatusBadge({ active }) {
  return <span className={`pm-badge ${active ? 'pm-badge-green' : 'pm-badge-gray'}`}>{active ? 'Active' : 'Inactive'}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

export default function ACChartOfAccounts() {
  const { acAccounts: accounts, setAcAccounts } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({ id:'', name:'', type:'Asset', balance:'', active:true });
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const filtered = (accounts||[]).filter(a =>
    (filter === 'All' || a.type === filter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged = filtered.slice((page-1)*PER, page*PER);

  const typeSummary = ACCOUNT_TYPES.map(t => ({
    type:t, color:ACCOUNT_TYPE_COLOR[t],
    count:(accounts||[]).filter(a=>a.type===t).length,
    total:(accounts||[]).filter(a=>a.type===t).reduce((s,a)=>s+a.balance,0),
  }));

  function openAdd()  { setForm({ id:'', name:'', type:'Asset', balance:'', active:true }); setEditId(null); setShowAdd(true); }
  function openEdit(a){ setForm({ ...a, balance:String(a.balance) }); setEditId(a.id); setShowAdd(true); }
  function handleSave() {
    if (!form.id || !form.name) return;
    const data = { ...form, balance:parseFloat(form.balance)||0 };
    editId
      ? setAcAccounts(p => p.map(a => a.id===editId ? data : a))
      : setAcAccounts(p => [...p, data]);
    setShowAdd(false);
  }
  function toggleActive(id) { setAcAccounts(p => p.map(a => a.id===id ? { ...a, active:!a.active } : a)); }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Chart of Accounts</h2>
          <p className="pm-page-sub">Master ledger — Al-Raza LPG (Pvt.) Ltd.</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={openAdd}><Icon name="plus" size={14} color="#fff"/> Add Account</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {typeSummary.map(t => (
          <div className="pm-stat-card" key={t.type}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:t.color+'18' }}><Icon name="list" size={16} color={t.color}/></div></div>
            <div className="pm-stat-label">{t.type}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{fmtPKR(Math.abs(t.total))}</div>
            <div className="pm-stat-hint">{t.count} accounts</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search ID or name…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1, color:'#374151' }}/>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['All',...ACCOUNT_TYPES].map(f => (
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:filter===f?ACCENT:'#fff', color:filter===f?'#fff':'#6b7280', borderColor:filter===f?ACCENT:'#e5e7eb' }}>{f}</button>
            ))}
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>ID</th><th>Account Name</th><th>Type</th><th style={{textAlign:'right'}}>Balance</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#9ca3af', fontSize:13 }}>No accounts found</td></tr>
              : paged.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{a.id}</td>
                  <td style={{ fontWeight:600, color:'#0f172a' }}>{a.name}</td>
                  <td><span style={{ color:ACCOUNT_TYPE_COLOR[a.type], fontWeight:600, fontSize:12 }}>{a.type}</span></td>
                  <td style={{ textAlign:'right', fontWeight:600, color:a.balance<0?'#dc2626':'#111827' }}>{fmtPKR(a.balance)}</td>
                  <td><StatusBadge active={a.active}/></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>openEdit(a)}>Edit</button>
                      <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>toggleActive(a.id)}>{a.active?'Deactivate':'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px 18px', borderTop:'1px solid #f1f5f9' }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title={editId ? 'Edit Account' : 'Add Account'} onClose={()=>setShowAdd(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Account ID *</label>
              <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} placeholder="e.g. 1050" disabled={!!editId} style={{ borderColor: editId ? '#e2e8f0':'inherit' }}/>
            </div>
            <div className="pm-form-group">
              <label>Type *</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{ gridColumn:'1/-1' }}>
              <label>Account Name *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Petty Cash"/>
            </div>
            <div className="pm-form-group" style={{ gridColumn:'1/-1' }}>
              <label>Opening Balance</label>
              <input type="number" value={form.balance} onChange={e=>setForm(f=>({...f,balance:e.target.value}))} placeholder="0"/>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={handleSave}>{editId ? 'Save Changes' : 'Add Account'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
