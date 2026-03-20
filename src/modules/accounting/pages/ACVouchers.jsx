import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';
import { fmtDate }   from '../accountingConstants';

const ACCENT = '#0d9488';

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:500, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

export default function ACVouchers() {
  const { acVouchers: vouchers, setAcVouchers, acAccounts: accounts } = useApp();
  const [tab,     setTab]     = useState('All');
  const [search,  setSearch]  = useState('');
  const [viewing, setViewing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [vType,   setVType]   = useState('Payment');
  const [form,    setForm]    = useState({ payee:'', account:'', amount:'', description:'', ref:'', date:'' });
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const filtered = (vouchers||[]).filter(v =>
    (tab==='All' || v.type===tab) &&
    ((v.payee||'').toLowerCase().includes(search.toLowerCase()) || (v.id||'').toLowerCase().includes(search.toLowerCase()))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function saveVoucher() {
    if (!form.date || !form.payee || !form.amount) return;
    const prefix = vType==='Payment'?'PV':'RV';
    const existing = (vouchers||[]).filter(v=>v.id.startsWith(prefix));
    const newId = `${prefix}-${String(existing.length+1).padStart(3,'0')}`;
    const acc = (accounts||[]).find(a=>a.id===form.account);
    setAcVouchers(p=>[{ id:newId, type:vType, date:form.date, payee:form.payee, account:form.account, accountName:acc?.name||'', amount:parseFloat(form.amount)||0, description:form.description, ref:form.ref, status:'Draft' },...(p||[])]);
    setShowNew(false); setForm({ payee:'', account:'', amount:'', description:'', ref:'', date:'' });
  }
  function approve(id) { setAcVouchers(p=>(p||[]).map(v=>v.id===id?{...v,status:'Approved'}:v)); }

  const pvTotal = (vouchers||[]).filter(v=>v.type==='Payment').reduce((s,v)=>s+v.amount,0);
  const rvTotal = (vouchers||[]).filter(v=>v.type==='Receipt').reduce((s,v)=>s+v.amount,0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Vouchers</h2><p className="pm-page-sub">Payment & Receipt vouchers</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={()=>{setVType('Receipt');setShowNew(true);}}>+ Receipt</button>
          <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={()=>{setVType('Payment');setShowNew(true);}}>
            <Icon name="plus" size={14} color="#fff"/> Payment
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total Vouchers', value:(vouchers||[]).length, icon:'invoice',   bg:'#f0fdfa', color:ACCENT },
          { label:'Total Payments', value:fmtPKR(pvTotal),       icon:'cart',      bg:'#fef2f2', color:'#ef4444' },
          { label:'Total Receipts', value:fmtPKR(rvTotal),       icon:'briefcase', bg:'#f0fdf4', color:'#10b981' },
          { label:'Approved',       value:(vouchers||[]).filter(v=>v.status==='Approved').length, icon:'check', bg:'#eff6ff', color:'#3b82f6' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:s.value>6?16:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search vouchers…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['All','Payment','Receipt'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:tab===t?ACCENT:'#fff', color:tab===t?'#fff':'#6b7280', borderColor:tab===t?ACCENT:'#e5e7eb' }}>{t}</button>
            ))}
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Payee / Payer</th><th>Account</th><th style={{textAlign:'right'}}>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No vouchers found</td></tr>
              : paged.map(v=>(
                <tr key={v.id}>
                  <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{v.id}</td>
                  <td><span className={`pm-badge ${v.type==='Payment'?'pm-badge-red':'pm-badge-green'}`}>{v.type}</span></td>
                  <td style={{ color:'#9ca3af', fontSize:12 }}>{fmtDate(v.date)}</td>
                  <td style={{ fontWeight:600 }}>{v.payee}</td>
                  <td style={{ color:'#9ca3af', fontSize:12 }}>{v.accountName}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:v.type==='Payment'?'#dc2626':'#16a34a' }}>{fmtPKR(v.amount)}</td>
                  <td><span className={`pm-badge ${v.status==='Approved'?'pm-badge-green':'pm-badge-orange'}`}>{v.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>setViewing(v)}>View</button>
                      {v.status==='Draft' && <button className="pm-btn pm-btn-primary" style={{ background:'#10b981', padding:'4px 10px', fontSize:12 }} onClick={()=>approve(v.id)}>Approve</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px', borderTop:'1px solid #f1f5f9' }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <Modal title={`${viewing.type} Voucher: ${viewing.id}`} onClose={()=>setViewing(null)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            {[['Voucher ID',viewing.id],['Type',viewing.type],['Date',fmtDate(viewing.date)],['Status',viewing.status],['Payee / Payer',viewing.payee],['Account',viewing.accountName],['Reference',viewing.ref||'—'],['Amount',fmtPKR(viewing.amount)]].map(([l,v])=>(
              <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, color:'#0f172a', fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showNew && (
        <Modal title={`New ${vType} Voucher`} onClose={()=>setShowNew(false)}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>{vType==='Payment'?'Payee':'Payer'} *</label><input value={form.payee} onChange={e=>setForm(f=>({...f,payee:e.target.value}))} placeholder="Name"/></div>
            <div className="pm-form-group">
              <label>Account *</label>
              <select value={form.account} onChange={e=>setForm(f=>({...f,account:e.target.value}))}>
                <option value="">— Select —</option>
                {(accounts||[]).map(a=><option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Amount *</label><input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="Bill/Invoice no."/></div>
            <div className="pm-form-group"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Payment details"/></div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowNew(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={saveVoucher}>Save Draft</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
