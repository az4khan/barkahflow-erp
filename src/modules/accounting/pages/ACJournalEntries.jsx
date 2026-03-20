import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';
import { fmtDate }   from '../accountingConstants';

const ACCENT = '#0d9488';

function StatusBadge({ status }) {
  const map = { Posted:'pm-badge-green', Draft:'pm-badge-orange', Auto:'pm-badge-blue' };
  return <span className={`pm-badge ${map[status]||'pm-badge-gray'}`}>{status}</span>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:wide?780:520, maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:'auto', flex:1 }}>{children}</div>
      </div>
    </div>
  );
}

function emptyForm() { return { date:'', description:'', ref:'', lines:[{account:'',dr:'',cr:''},{account:'',dr:'',cr:''}] }; }

export default function ACJournalEntries() {
  const { acJournal: journal, setAcJournal, acAccounts: accounts } = useApp();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form,    setForm]    = useState(emptyForm());
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const totalDr  = form.lines.reduce((s,l) => s+(parseFloat(l.dr)||0), 0);
  const totalCr  = form.lines.reduce((s,l) => s+(parseFloat(l.cr)||0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.01 && totalDr > 0;

  const filtered = (journal||[]).filter(je =>
    (filter==='All' || je.status===filter || (filter==='Auto' && je.auto)) &&
    (je.id.toLowerCase().includes(search.toLowerCase()) || je.description.toLowerCase().includes(search.toLowerCase()))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  const updateLine = (i,f,v) => setForm(prev => { const l=[...prev.lines]; l[i]={...l[i],[f]:v}; return {...prev,lines:l}; });

  function saveJE(status) {
    if (!form.date || !form.description) return;
    const newId = `JE-${String((journal||[]).length+1).padStart(3,'0')}`;
    setAcJournal(p => [{
      id:newId, date:form.date, description:form.description, ref:form.ref,
      entries:form.lines.filter(l=>l.account).map(l => {
        const acc = (accounts||[]).find(a=>a.id===l.account);
        return { account:l.account, label:acc?.name||l.account, dr:parseFloat(l.dr)||0, cr:parseFloat(l.cr)||0 };
      }),
      status, auto:false, createdBy:'user',
    }, ...(p||[])]);
    setShowNew(false); setForm(emptyForm());
  }

  const stats = {
    total:  (journal||[]).length,
    posted: (journal||[]).filter(j=>j.status==='Posted').length,
    draft:  (journal||[]).filter(j=>j.status==='Draft').length,
    auto:   (journal||[]).filter(j=>j.auto).length,
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Journal Entries</h2>
          <p className="pm-page-sub">General Ledger — Double-entry bookkeeping</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={()=>{setForm(emptyForm());setShowNew(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New Entry
          </button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total Entries', value:stats.total,  icon:'reports',   bg:'#f0fdfa', color:ACCENT },
          { label:'Posted',        value:stats.posted, icon:'check',     bg:'#f0fdf4', color:'#10b981', badge:'✓' },
          { label:'Draft',         value:stats.draft,  icon:'invoice',   bg:'#fffbeb', color:'#f59e0b' },
          { label:'Auto (Purchase)',value:stats.auto,  icon:'trending',  bg:'#eff6ff', color:'#3b82f6', badge:'⚡' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div>{s.badge&&<span className="pm-stat-badge">{s.badge}</span>}</div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search entries…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['All','Posted','Draft','Auto'].map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:filter===f?ACCENT:'#fff', color:filter===f?'#fff':'#6b7280', borderColor:filter===f?ACCENT:'#e5e7eb' }}>{f}</button>
            ))}
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>ID</th><th>Date</th><th>Description</th><th>Ref</th><th style={{textAlign:'right'}}>Debit</th><th style={{textAlign:'right'}}>Credit</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No entries found</td></tr>
              : paged.map(je => {
                  const dr = (je.entries||[]).reduce((s,e)=>s+e.dr,0);
                  const cr = (je.entries||[]).reduce((s,e)=>s+e.cr,0);
                  return (
                    <tr key={je.id}>
                      <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>
                        {je.id}{je.auto&&<span style={{ marginLeft:4, fontSize:10, background:'#f0fdfa', color:ACCENT, padding:'1px 5px', borderRadius:8 }}>AUTO</span>}
                      </td>
                      <td style={{ color:'#9ca3af', fontSize:12 }}>{fmtDate(je.date)}</td>
                      <td style={{ fontWeight:600, color:'#0f172a', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{je.description}</td>
                      <td style={{ color:'#9ca3af' }}>{je.ref||'—'}</td>
                      <td style={{ textAlign:'right', color:'#16a34a', fontWeight:600 }}>{fmtPKR(dr)}</td>
                      <td style={{ textAlign:'right', color:'#dc2626', fontWeight:600 }}>{fmtPKR(cr)}</td>
                      <td><StatusBadge status={je.auto?'Auto':je.status}/></td>
                      <td><button className="pm-btn pm-btn-ghost" style={{ padding:'4px 10px', fontSize:12 }} onClick={()=>setViewing(je)}>View</button></td>
                    </tr>
                  );
              })
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
        <Modal title={`Journal Entry: ${viewing.id}`} onClose={()=>setViewing(null)} wide>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Date',fmtDate(viewing.date)],['Ref',viewing.ref||'—'],['Status',viewing.auto?'Auto-Posted':viewing.status]].map(([l,v])=>(
              <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:'#374151', marginBottom:14, fontWeight:500, background:'#f8fafc', padding:'10px 14px', borderRadius:8 }}>{viewing.description}</p>
          <table className="pm-table" style={{ border:'1px solid #f1f5f9', borderRadius:8, overflow:'hidden' }}>
            <thead><tr><th>ID</th><th>Account</th><th style={{textAlign:'right'}}>Debit</th><th style={{textAlign:'right'}}>Credit</th></tr></thead>
            <tbody>
              {(viewing.entries||[]).map((e,i)=>(
                <tr key={i}>
                  <td style={{ color:ACCENT, fontFamily:'monospace', fontWeight:600 }}>{e.account}</td>
                  <td style={{ fontWeight:600 }}>{e.label}</td>
                  <td style={{ textAlign:'right', color:e.dr>0?'#16a34a':'#9ca3af', fontWeight:600 }}>{e.dr>0?fmtPKR(e.dr):'—'}</td>
                  <td style={{ textAlign:'right', color:e.cr>0?'#dc2626':'#9ca3af', fontWeight:600 }}>{e.cr>0?fmtPKR(e.cr):'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:24, background:'#f8fafc', borderRadius:8, padding:'10px 16px', marginTop:8, fontSize:13 }}>
            <span>Dr: <strong style={{ color:'#16a34a' }}>{fmtPKR((viewing.entries||[]).reduce((s,e)=>s+e.dr,0))}</strong></span>
            <span>Cr: <strong style={{ color:'#dc2626' }}>{fmtPKR((viewing.entries||[]).reduce((s,e)=>s+e.cr,0))}</strong></span>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showNew && (
        <Modal title="New Journal Entry" onClose={()=>setShowNew(false)} wide>
          <div className="pm-form-grid" style={{ gridTemplateColumns:'1fr 1fr 2fr', marginBottom:16 }}>
            <div className="pm-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="e.g. INV-001"/></div>
            <div className="pm-form-group"><label>Description *</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Entry description"/></div>
          </div>
          <div style={{ border:'1px solid #f1f5f9', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 28px', gap:8, padding:'8px 12px', background:'#f8fafc', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase' }}>
              <span>Account</span><span style={{textAlign:'right'}}>Debit</span><span style={{textAlign:'right'}}>Credit</span><span/>
            </div>
            {form.lines.map((line,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 28px', gap:8, padding:'8px 12px', borderTop:'1px solid #f8fafc', alignItems:'center' }}>
                <select value={line.account} onChange={e=>updateLine(i,'account',e.target.value)} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:7, fontSize:12.5, outline:'none' }}>
                  <option value="">— Select Account —</option>
                  {(accounts||[]).map(a=><option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
                </select>
                <input type="number" value={line.dr} onChange={e=>updateLine(i,'dr',e.target.value)} placeholder="0" style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:7, fontSize:12.5, textAlign:'right', outline:'none' }}/>
                <input type="number" value={line.cr} onChange={e=>updateLine(i,'cr',e.target.value)} placeholder="0" style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:7, fontSize:12.5, textAlign:'right', outline:'none' }}/>
                <button onClick={()=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:18, padding:0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setForm(f=>({...f,lines:[...f.lines,{account:'',dr:'',cr:''}]}))}><Icon name="plus" size={13}/> Add Line</button>
            <div style={{ display:'flex', gap:16, fontSize:13 }}>
              <span>Dr: <strong style={{ color:balanced?'#16a34a':'#ef4444' }}>{fmtPKR(totalDr)}</strong></span>
              <span>Cr: <strong style={{ color:balanced?'#16a34a':'#ef4444' }}>{fmtPKR(totalCr)}</strong></span>
              {totalDr>0 && <span style={{ fontSize:12 }}>{balanced?<span style={{color:'#16a34a'}}>✓ Balanced</span>:<span style={{color:'#ef4444'}}>⚠ Diff: {fmtPKR(Math.abs(totalDr-totalCr))}</span>}</span>}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowNew(false)}>Cancel</button>
            <button className="pm-btn pm-btn-outline" onClick={()=>saveJE('Draft')}>Save Draft</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={()=>saveJE('Posted')} disabled={!balanced}>Post Entry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
