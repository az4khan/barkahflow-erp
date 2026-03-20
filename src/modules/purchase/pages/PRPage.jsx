import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT = "#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs${(n/1e5).toFixed(1)}L`;return`Rs${Number(n).toLocaleString()}`;}

/* ── PR Form Modal ── */
function PRModal({ existing, onClose, onSave }) {
  const { materials } = useApp();
  const depts = ["Administration","Procurement","Sales","Finance","Operations","Warehouse","IT","HR"];
  const [form, setForm] = useState(existing || { title:"", department:"", priority:"normal", justification:"", items:[] });
  const [item, setItem] = useState({ materialId:"", materialName:"", qty:1, unit:"PCS", estimatedPrice:0 });

  function addItem(){ if(!item.materialId){alert("Select a material");return;} setForm(f=>({...f,items:[...f.items,{...item,totalEstimated:item.qty*item.estimatedPrice}]})); setItem({materialId:"",materialName:"",qty:1,unit:"PCS",estimatedPrice:0}); }
  function removeItem(i){ setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)})); }
  function handleMat(e){ const m=(materials||[]).find(x=>x.id===e.target.value); setItem(i=>({...i,materialId:m?.id||"",materialName:m?.name||"",unit:m?.unit||"PCS",estimatedPrice:m?.unitPrice||0})); }
  const totalEst = form.items.reduce((s,i)=>s+(i.totalEstimated||0),0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:760,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{existing?"Edit":"New"} Purchase Requisition</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:16}}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{gridColumn:"1/-1"}}><label>Title <span style={{color:"#ef4444"}}>*</span></label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Q2 LPG Cylinders Procurement"/></div>
            <div className="pm-form-group"><label>Department <span style={{color:"#ef4444"}}>*</span></label><select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}><option value="">-- Select --</option>{depts.map(d=><option key={d}>{d}</option>)}</select></div>
            <div className="pm-form-group"><label>Priority</label><select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></div>
            <div className="pm-form-group" style={{gridColumn:"1/-1"}}><label>Justification</label><textarea value={form.justification} onChange={e=>setForm(f=>({...f,justification:e.target.value}))} rows={2} placeholder="Reason for this requisition…"/></div>
          </div>
          {/* Items */}
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>Materials / Items</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,marginBottom:10,alignItems:"end"}}>
              <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={handleMat}><option value="">-- Select Material --</option>{(materials||[]).map(m=><option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}</select></div>
              <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:Number(e.target.value)}))}/></div>
              <div className="pm-form-group" style={{margin:0}}><label>Unit</label><input value={item.unit} onChange={e=>setItem(i=>({...i,unit:e.target.value}))}/></div>
              <div className="pm-form-group" style={{margin:0}}><label>Est. Price</label><input type="number" min={0} value={item.estimatedPrice} onChange={e=>setItem(i=>({...i,estimatedPrice:Number(e.target.value)}))}/></div>
              <button onClick={addItem} className="pm-btn pm-btn-primary" style={{height:36}}>+ Add</button>
            </div>
            {form.items.length>0 && (
              <table className="pm-table" style={{border:"1px solid #f1f5f9",marginBottom:8}}>
                <thead><tr><th>#</th><th>Material</th><th>Qty</th><th>Unit</th><th>Est. Price</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {form.items.map((it,idx)=>(
                    <tr key={idx}>
                      <td style={{color:"#94a3b8"}}>{idx+1}</td>
                      <td style={{fontWeight:600}}>{it.materialName}</td>
                      <td>{it.qty}</td><td>{it.unit}</td>
                      <td>{fmtPKR(it.estimatedPrice)}</td>
                      <td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(it.totalEstimated)}</td>
                      <td><button onClick={()=>removeItem(idx)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button></td>
                    </tr>
                  ))}
                  <tr style={{background:"#f8fafc"}}><td colSpan={5} style={{fontWeight:700,textAlign:"right"}}>Total Estimated:</td><td style={{fontWeight:800,color:ACCENT,fontSize:15}}>{fmtPKR(totalEst)}</td><td/></tr>
                </tbody>
              </table>
            )}
            {!form.items.length && <div style={{padding:16,textAlign:"center",color:"#94a3b8",background:"#f8fafc",borderRadius:8,fontSize:13}}>No items added yet</div>}
          </div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{ if(!form.title||!form.department||!form.items.length){alert("Fill title, department, and add at least one item.");return;} onSave({...form,totalEstimated:totalEst}); }}>{existing?"Save":"Create PR"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── View Modal ── */
function ViewModal({ pr, onClose, onForward }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:640,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div><h3 style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{pr.id}</h3><p style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{pr.title}</p></div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[["Department",pr.department],["Priority",pr.priority],["Status",pr.status],["Created By",pr.createdByName],["Date",pr.createdAt?.slice(0,10)],["Est. Total",fmtPKR(pr.totalEstimated)]].map(([l,v])=>(
              <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{v||"—"}</div>
              </div>
            ))}
          </div>
          {pr.justification && <div style={{background:"#fffbeb",borderRadius:8,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#92400e"}}><strong>Justification:</strong> {pr.justification}</div>}
          <table className="pm-table" style={{border:"1px solid #f1f5f9"}}>
            <thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th>Est. Price</th><th>Total</th></tr></thead>
            <tbody>{(pr.items||[]).map((it,i)=><tr key={i}><td>{it.materialName}</td><td>{it.qty}</td><td>{it.unit}</td><td>{fmtPKR(it.estimatedPrice)}</td><td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(it.totalEstimated)}</td></tr>)}</tbody>
          </table>
          {pr.rejectionReason && <div style={{marginTop:14,background:"#fef2f2",borderRadius:8,padding:"12px 14px",fontSize:13,color:"#991b1b"}}><strong>Rejection Reason:</strong> {pr.rejectionReason}</div>}
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Close</button>
          {pr.status==="draft" && <button className="pm-btn pm-btn-primary" onClick={()=>{onForward(pr.id);onClose();}}>➤ Forward for Approval</button>}
        </div>
      </div>
    </div>
  );
}

/* ── Main PR Page ── */
export default function PRPage() {
  const { prs, createPR, updatePR, deletePR, forwardPR } = useApp();
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPR, setEditPR]     = useState(null);
  const [viewPR, setViewPR]     = useState(null);
  const [page, setPage]         = useState(1);
  const PER = 10;

  const filtered = useMemo(()=>(prs||[]).filter(p=>{
    const q=search.toLowerCase();
    const mQ=!q||p.id.toLowerCase().includes(q)||p.title.toLowerCase().includes(q)||(p.department||"").toLowerCase().includes(q);
    const mS=statusF==="all"||p.status===statusF;
    const mD=(!dateFrom||p.createdAt>=dateFrom)&&(!dateTo||p.createdAt<=dateTo+"T23:59:59");
    return mQ&&mS&&mD;
  }),[prs,search,statusF,dateFrom,dateTo]);

  const pages = Math.ceil(filtered.length/PER);
  const paged = filtered.slice((page-1)*PER, page*PER);

  const stats = {
    total:    (prs||[]).length,
    pending:  (prs||[]).filter(p=>["initiated","pending"].includes(p.status)).length,
    approved: (prs||[]).filter(p=>p.status==="approved").length,
    totalEst: (prs||[]).reduce((s,p)=>s+(p.totalEstimated||0),0),
  };

  const STATUS_MAP = {draft:"gray",initiated:"blue",pending:"orange",approved:"green",rejected:"red"};

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Purchase Requisition</h2>
          <p className="pm-page-sub">Internal material requests — awaiting approval</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={()=>{}}>PR Approval →</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{setEditPR(null);setShowForm(true);}}>+ New Requisition</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="pm-stat-grid">
        {[
          {label:"Total PRs",    value:String(stats.total),           icon:"list",     bg:"#eff6ff", color:"#3b82f6"},
          {label:"Pending",      value:String(stats.pending),         icon:"bell",     bg:"#fffbeb", color:"#f59e0b"},
          {label:"Approved",     value:String(stats.approved),        icon:"check",    bg:"#f0fdf4", color:"#10b981"},
          {label:"Est. Total Cost",value:fmtPKR(stats.totalEst),      icon:"invoice",  bg:"#fff7ed", color:"#f97316"},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 11px",flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search PR ID, title, dept…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:"none",background:"transparent",fontSize:12.5,outline:"none",flex:1,color:"#374151"}}/>
          </div>
          {/* Status pills */}
          <div className="filter-tabs">
            {[["all","All"],["draft","Draft"],["initiated","Initiated"],["approved","Approved"],["rejected","Rejected"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>{setStatusF(v);setPage(1);}}>{l}</button>
            ))}
          </div>
          {/* Date */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
            <span style={{fontSize:12,color:"#94a3b8"}}>—</span>
            <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
            {(dateFrom||dateTo)&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:"4px 8px"}} onClick={()=>{setDateFrom("");setDateTo("");}}>✕</button>}
          </div>
        </div>

        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>PR ID</th><th>Title</th><th>Department</th><th>QTY</th><th>Est. Cost</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(pr=>(
                <tr key={pr.id}>
                  <td style={{fontWeight:700,color:ACCENT}}>{pr.id}</td>
                  <td><div style={{fontWeight:600,color:"#0f172a",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr.title}</div><div style={{fontSize:11,color:"#94a3b8"}}>{pr.createdByName}</div></td>
                  <td>{pr.department}</td>
                  <td style={{textAlign:"center"}}>{(pr.items||[]).reduce((s,i)=>s+(i.qty||0),0).toLocaleString()} <span style={{fontSize:11,color:"#94a3b8"}}>{(pr.items||[])[0]?.unit||""}</span></td>
                  <td style={{fontWeight:600}}>{fmtPKR(pr.totalEstimated)}</td>
                  <td><span className={`pm-badge pm-badge-${pr.priority==="high"?"red":pr.priority==="normal"?"blue":"gray"}`}>{pr.priority}</span></td>
                  <td><span className={`pm-badge pm-badge-${STATUS_MAP[pr.status]||"gray"}`}>{pr.status}</span></td>
                  <td style={{fontSize:12,color:"#94a3b8"}}>{pr.createdAt?.slice(0,10)}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>setViewPR(pr)}>View</button>
                      {pr.status==="draft"&&<>
                        <button className="pm-btn pm-btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>{setEditPR(pr);setShowForm(true);}}>Edit</button>
                        <button className="pm-btn pm-btn-primary" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>forwardPR(pr.id)}>Forward</button>
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:15,padding:"3px 6px"}} onClick={()=>{if(window.confirm("Delete?"))deletePR(pr.id);}}>×</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
              {!paged.length&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No purchase requisitions found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages>1&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#64748b"}}>
            <span>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
            <div style={{display:"flex",gap:4}}>
              <button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
                <button key={p} className={`pm-btn ${p===page?"pm-btn-primary":"pm-btn-outline"}`} style={{padding:"4px 10px",fontSize:12,minWidth:32}} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showForm&&<PRModal existing={editPR} onClose={()=>{setShowForm(false);setEditPR(null);}} onSave={d=>{editPR?updatePR(editPR.id,d):createPR(d);setShowForm(false);setEditPR(null);}}/>}
      {viewPR&&<ViewModal pr={viewPR} onClose={()=>setViewPR(null)} onForward={forwardPR}/>}
    </div>
  );
}
