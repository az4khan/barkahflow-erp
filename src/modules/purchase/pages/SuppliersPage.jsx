import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";


const ACCENT = "#f97316";
function fmtPKR(n){ if(!n)return "Rs0"; if(n>=1e7)return `Rs${(n/1e7).toFixed(1)}Cr`; if(n>=1e5)return `Rs${(n/1e5).toFixed(1)}L`; return `Rs${Number(n).toLocaleString()}`; }

function SupplierModal({ existing, onClose, onSave }) {
  const [f, setF] = useState(existing || { name:"",code:"",email:"",phone:"",country:"Pakistan",city:"",category:"",contactPerson:"",paymentTerms:"Net 30",currency:"PKR",rating:3,status:"active",notes:"" });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:680,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{existing?"Edit Supplier":"New Supplier"}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1}}>
          <div className="pm-form-grid">
            {[["Supplier Name","name","text",true],["Code","code","text",true],["Email","email","email",true],["Phone","phone","tel",false],["Country","country","text",false],["City","city","text",false],["Category","category","text",false],["Contact Person","contactPerson","text",false]].map(([l,k,t,req])=>(
              <div key={k} className="pm-form-group">
                <label>{l}{req&&<span style={{color:"#ef4444"}}> *</span>}</label>
                <input type={t} value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={l}/>
              </div>
            ))}
            <div className="pm-form-group">
              <label>Payment Terms</label>
              <select value={f.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)}>
                {["Net 15","Net 30","Net 45","Net 60","Advance","COD"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Currency</label>
              <select value={f.currency} onChange={e=>set("currency",e.target.value)}>
                {["PKR","USD","EUR","AED","SAR"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Rating (1–5)</label>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                {[1,2,3,4,5].map(r=>(
                  <button key={r} onClick={()=>set("rating",r)}
                    style={{background:f.rating>=r?"#f97316":"#f1f5f9",border:"none",borderRadius:6,width:32,height:32,cursor:"pointer",color:f.rating>=r?"#fff":"#94a3b8",fontSize:16}}>★</button>
                ))}
              </div>
            </div>
            <div className="pm-form-group">
              <label>Status</label>
              <select value={f.status} onChange={e=>set("status",e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="pm-form-group" style={{gridColumn:"1/-1"}}>
              <label>Notes</label>
              <textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Additional notes…"/>
            </div>
          </div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{ if(!f.name||!f.code||!f.email){alert("Name, code, and email are required.");return;} onSave(f); }}>{existing?"Save Changes":"Create Supplier"}</button>
        </div>
      </div>
    </div>
  );
}

function LedgerModal({ supplier, purchases, onClose }) {
  const history = (purchases||[]).filter(p=>p.supplierId===supplier.id);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:720,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <h3 style={{fontSize:16,fontWeight:700}}>Supplier Ledger</h3>
            <p style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{supplier.name} — Purchase History</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[["Total Orders",history.length],["Total Amount",fmtPKR(history.reduce((s,p)=>s+(p.totalAmount||0),0))],["Last Purchase",history[0]?.createdAt?.slice(0,10)||"—"]].map(([l,v])=>(
              <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{l}</div>
                <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginTop:4}}>{v}</div>
              </div>
            ))}
          </div>
          <table className="pm-table">
            <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {history.length ? history.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:600,color:ACCENT}}>{p.id}</td>
                  <td><span className={`pm-badge pm-badge-${p.type==="grn"?"blue":"gray"}`}>{p.type?.toUpperCase()}</span></td>
                  <td style={{fontWeight:600}}>{fmtPKR(p.totalAmount)}</td>
                  <td><span className={`pm-badge pm-badge-${p.status==="posted"?"green":"orange"}`}>{p.status}</span></td>
                  <td style={{color:"#94a3b8",fontSize:12}}>{p.createdAt?.slice(0,10)}</td>
                </tr>
              )) : <tr><td colSpan={5} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>No purchase history for this supplier.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const { suppliers, createSupplier, updateSupplier, toggleSupplierStatus, purchases } = useApp();
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editS, setEditS] = useState(null);
  const [ledgerS, setLedgerS] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = useMemo(()=>(suppliers||[]).filter(s=>{
    const q=search.toLowerCase();
    const matchQ=!q||s.name.toLowerCase().includes(q)||(s.code||"").toLowerCase().includes(q)||(s.email||"").toLowerCase().includes(q)||(s.city||"").toLowerCase().includes(q);
    const matchS=statusF==="all"||s.status===statusF;
    const matchD=(!dateFrom||s.createdAt>=dateFrom)&&(!dateTo||s.createdAt<=dateTo+"T23:59:59");
    return matchQ&&matchS&&matchD;
  }),[suppliers,search,statusF,dateFrom,dateTo]);

  const pages = Math.ceil(filtered.length/PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const active = (suppliers||[]).filter(s=>s.status==="active").length;

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Suppliers</h2><p className="pm-page-sub">Manage vendor profiles, ratings and purchase history</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" onClick={()=>{setEditS(null);setShowForm(true);}}>+ New Supplier</button>
        </div>
      </div>

      {/* Stats */}
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          {l:"Total Suppliers", v:(suppliers||[]).length,                                                                       bg:"#fff7ed",color:"#f97316",icon:"suppliers"},
          {l:"Active",          v:active,                                                                                       bg:"#f0fdf4",color:"#10b981",icon:"check"},
          {l:"Inactive",        v:(suppliers||[]).length-active,                                                                bg:"#f8fafc",color:"#64748b",icon:"building"},
          {l:"Avg Rating",      v:(((suppliers||[]).reduce((s,x)=>s+(x.rating||0),0))/Math.max((suppliers||[]).length,1)).toFixed(1)+" ★", bg:"#fffbeb",color:"#f59e0b",icon:"star"},
        ].map(({l,v,bg,color,icon})=>(
          <div key={l} className="pm-stat-card">
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:bg}}><Icon name={icon} size={17} color={color}/></div></div>
            <div className="pm-stat-value">{v}</div>
            <div className="pm-stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:"wrap",gap:10}}>
          <div className="pm-search-bar">
            <Icon name="search" size={14} color="#94a3b8" />
            <input placeholder="Search name, code, city…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          <div className="filter-tabs">
            {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>setStatusF(v)}>{l}</button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>Code</th><th>Supplier Name</th><th>Contact</th><th>Country</th><th>Category</th><th>Rating</th><th>Payment Terms</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontSize:12}}>{s.code}</td>
                  <td>
                    <div style={{fontWeight:600,color:"#0f172a"}}>{s.name}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{s.email}</div>
                  </td>
                  <td style={{fontSize:12,color:"#64748b"}}>{s.contactPerson||"—"}<br/><span style={{fontSize:11}}>{s.phone}</span></td>
                  <td style={{fontSize:12}}>{s.city?`${s.city}, `:""}{s.country}</td>
                  <td>{s.category||"—"}</td>
                  <td>{"★".repeat(s.rating||0)}<span style={{color:"#e2e8f0"}}>{"★".repeat(5-(s.rating||0))}</span></td>
                  <td style={{fontSize:12}}>{s.paymentTerms}</td>
                  <td><span className={`pm-badge pm-badge-${s.status==="active"?"green":"gray"}`}>{s.status}</span></td>
                  <td style={{fontSize:11,color:"#94a3b8"}}>
                    <div>{s.createdAt?.slice(0,10)}</div>
                    <div style={{fontSize:10}}>{s.createdBy}</div>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>setLedgerS(s)}>Ledger</button>
                      <button className="pm-btn pm-btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>{setEditS(s);setShowForm(true);}}>Edit</button>
                      <button className={`pm-btn ${s.status==="active"?"pm-btn-outline":"pm-btn-primary"}`} style={{fontSize:11,padding:"3px 8px"}} onClick={()=>toggleSupplierStatus(s.id)}>
                        {s.status==="active"?"Deactivate":"Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!paged.length && <tr><td colSpan={10} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No suppliers found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1 && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#64748b"}}>
            <span>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}</span>
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
      {showForm && <SupplierModal existing={editS} onClose={()=>{setShowForm(false);setEditS(null);}} onSave={d=>{ editS?updateSupplier(editS.id,d):createSupplier(d); setShowForm(false);setEditS(null); }}/>}
      {ledgerS  && <LedgerModal supplier={ledgerS} purchases={purchases} onClose={()=>setLedgerS(null)}/>}
    </div>
  );
}
