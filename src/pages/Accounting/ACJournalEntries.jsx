// ─── Journal Entries ──────────────────────────────────────────────────────────
import { useState } from "react";
import Icon         from "../../components/common/Icon";
import { Modal, StatCard, StatusBadge, SearchBox } from "../../components/common/UI";
import { fmtPKR }   from "../../data/mockData";
import { fmtDate }  from "./accountingConstants";

function emptyForm() {
  return { date:"", description:"", ref:"", lines:[{account:"",dr:"",cr:""},{account:"",dr:"",cr:""}] };
}

export default function ACJournalEntries({ journal, setJournal, accounts }) {
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");
  const [showNew, setShowNew] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form,    setForm]    = useState(emptyForm());

  const totalDr  = form.lines.reduce((s,l) => s + (parseFloat(l.dr)||0), 0);
  const totalCr  = form.lines.reduce((s,l) => s + (parseFloat(l.cr)||0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.01 && totalDr > 0;

  const filtered = journal.filter(je =>
    (filter==="All" || je.status===filter) &&
    (je.id.toLowerCase().includes(search.toLowerCase()) ||
     je.description.toLowerCase().includes(search.toLowerCase()))
  );

  const updateLine = (i, f, v) =>
    setForm(prev => { const l=[...prev.lines]; l[i]={...l[i],[f]:v}; return {...prev,lines:l}; });

  const saveJE = (status) => {
    if (!form.date || !form.description) return;
    const newId = `JE-${String(journal.length+1).padStart(3,"0")}`;
    setJournal(p => [{
      id:newId, date:form.date, description:form.description, ref:form.ref,
      entries:form.lines.filter(l=>l.account).map(l => {
        const acc = accounts.find(a=>a.id===l.account);
        return { account:l.account, label:acc?.name||l.account, dr:parseFloat(l.dr)||0, cr:parseFloat(l.cr)||0 };
      }),
      status, createdBy:"admin",
    }, ...p]);
    setShowNew(false); setForm(emptyForm());
  };

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Journal Entries</h1>
          <p className="ac-page-sub">General Ledger — Double-entry bookkeeping</p>
        </div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-outline ac-btn-sm"><Icon name="download" size={13}/> Export</button>
          <button className="ac-btn ac-btn-primary" onClick={()=>{setForm(emptyForm());setShowNew(true);}}>
            <Icon name="plus" size={14} color="#fff"/> New Entry
          </button>
        </div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="reports"   iconBg="#f0fdfa" iconColor="#0d9488" label="Total Entries" value={journal.length} />
        <StatCard icon="check"     iconBg="#f0fdf4" iconColor="#10b981" label="Posted"        value={journal.filter(j=>j.status==="Posted").length} badge="✓" />
        <StatCard icon="invoice"   iconBg="#fffbeb" iconColor="#f59e0b" label="Draft"         value={journal.filter(j=>j.status==="Draft").length} />
        <StatCard icon="briefcase" iconBg="#eff6ff" iconColor="#3b82f6" label="Total Posted"
          value={fmtPKR(journal.filter(j=>j.status==="Posted").reduce((s,j)=>s+j.entries.reduce((ss,e)=>ss+e.dr,0),0))} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div className="ac-filter-bar" style={{ margin:0 }}>
          {["All","Posted","Draft"].map(f=>(
            <button key={f} className={`ac-filter-pill${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search entries..." />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header">
          <div className="ac-table-title">Journal Entries <span style={{ color:"#94a3b8", fontWeight:400 }}>({filtered.length})</span></div>
        </div>
        <table className="ac-table">
          <thead><tr>
            <th>ID</th><th>Date</th><th>Description</th><th>Ref</th>
            <th className="right">Debit</th><th className="right">Credit</th>
            <th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"#9ca3af", fontSize:13 }}>No entries found</td></tr>
              : filtered.map(je => {
                  const dr=je.entries.reduce((s,e)=>s+e.dr,0);
                  const cr=je.entries.reduce((s,e)=>s+e.cr,0);
                  return (
                    <tr key={je.id}>
                      <td className="primary">{je.id}</td>
                      <td className="muted">{fmtDate(je.date)}</td>
                      <td className="bold">{je.description}</td>
                      <td className="muted">{je.ref||"—"}</td>
                      <td className="right" style={{ color:"#16a34a", fontWeight:600 }}>{fmtPKR(dr)}</td>
                      <td className="right" style={{ color:"#dc2626", fontWeight:600 }}>{fmtPKR(cr)}</td>
                      <td><StatusBadge status={je.status}/></td>
                      <td><button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>setViewing(je)}>View</button></td>
                    </tr>
                  );
              })
            }
          </tbody>
        </table>
      </div>

      {/* View Modal — uses shared Modal */}
      {viewing && (
        <Modal title={`Journal Entry: ${viewing.id}`} onClose={()=>setViewing(null)} size="lg">
          <div className="ac-info-row">
            <div><span>Date:</span>{fmtDate(viewing.date)}</div>
            <div><span>Ref:</span>{viewing.ref||"—"}</div>
            <div><span>Status:</span><StatusBadge status={viewing.status}/></div>
          </div>
          <p style={{ fontSize:13.5, color:"#374151", marginBottom:14, fontWeight:500 }}>{viewing.description}</p>
          <table className="ac-table" style={{ border:"1px solid #f1f5f9", borderRadius:8, overflow:"hidden" }}>
            <thead><tr><th>ID</th><th>Account</th><th className="right">Debit</th><th className="right">Credit</th></tr></thead>
            <tbody>
              {viewing.entries.map((e,i)=>(
                <tr key={i}>
                  <td className="primary">{e.account}</td><td>{e.label}</td>
                  <td className="right" style={{ color:e.dr>0?"#16a34a":"#9ca3af" }}>{e.dr>0?fmtPKR(e.dr):"—"}</td>
                  <td className="right" style={{ color:e.cr>0?"#dc2626":"#9ca3af" }}>{e.cr>0?fmtPKR(e.cr):"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:24, background:"#f8fafc", borderRadius:8, padding:"10px 16px", marginTop:8, fontSize:13 }}>
            <span>Dr: <strong style={{ color:"#16a34a" }}>{fmtPKR(viewing.entries.reduce((s,e)=>s+e.dr,0))}</strong></span>
            <span>Cr: <strong style={{ color:"#dc2626" }}>{fmtPKR(viewing.entries.reduce((s,e)=>s+e.cr,0))}</strong></span>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* New JE Modal */}
      {showNew && (
        <Modal title="New Journal Entry" onClose={()=>setShowNew(false)} size="xl">
          <div className="ac-form-grid ac-form-grid-3" style={{ marginBottom:16 }}>
            <div className="ac-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="ac-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="e.g. INV-001"/></div>
            <div className="ac-form-group ac-form-full"><label>Description *</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Entry description"/></div>
          </div>

          <div className="ac-je-lines">
            <div className="ac-je-hd"><span>Account</span><span style={{ textAlign:"right" }}>Debit</span><span style={{ textAlign:"right" }}>Credit</span><span/></div>
            {form.lines.map((line,i)=>(
              <div key={i} className="ac-je-row">
                <select value={line.account} onChange={e=>updateLine(i,"account",e.target.value)}>
                  <option value="">— Select Account —</option>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
                </select>
                <input type="number" value={line.dr} onChange={e=>updateLine(i,"dr",e.target.value)} placeholder="0" style={{ textAlign:"right" }}/>
                <input type="number" value={line.cr} onChange={e=>updateLine(i,"cr",e.target.value)} placeholder="0" style={{ textAlign:"right" }}/>
                <button onClick={()=>setForm(f=>({...f,lines:f.lines.filter((_,j)=>j!==i)}))} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:16, padding:0 }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
            <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>setForm(f=>({...f,lines:[...f.lines,{account:"",dr:"",cr:""}]}))}>
              <Icon name="plus" size={13}/> Add Line
            </button>
            <div className="ac-je-totals">
              <span>Dr: <strong className={balanced?"ac-bal-ok":"ac-bal-bad"}>{fmtPKR(totalDr)}</strong></span>
              <span>Cr: <strong className={balanced?"ac-bal-ok":"ac-bal-bad"}>{fmtPKR(totalCr)}</strong></span>
              {totalDr>0 && <span style={{ fontSize:12 }}>{balanced?<span className="ac-bal-ok">✓ Balanced</span>:<span className="ac-bal-bad">⚠ Diff: {fmtPKR(Math.abs(totalDr-totalCr))}</span>}</span>}
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            <button className="ac-btn ac-btn-outline" onClick={()=>saveJE("Draft")}>Save Draft</button>
            <button className="ac-btn ac-btn-primary" onClick={()=>saveJE("Posted")} disabled={!balanced}>Post Entry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
