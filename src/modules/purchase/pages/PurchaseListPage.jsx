import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs${(n/1e5).toFixed(1)}L`;return`Rs${Number(n).toLocaleString()}`;}
export default function PurchaseListPage(){
  const {purchases,postDirectPurchase}=useApp();
  const [search,setSearch]=useState(""); const [typeF,setTypeF]=useState("all"); const [statusF,setStatusF]=useState("all");
  const [dateFrom,setDateFrom]=useState(""); const [dateTo,setDateTo]=useState("");
  const [page,setPage]=useState(1); const PER=10;
  const filtered=useMemo(()=>(purchases||[]).filter(p=>{
    const q=search.toLowerCase(); const mQ=!q||p.id.toLowerCase().includes(q)||(p.supplierName||"").toLowerCase().includes(q);
    const mT=typeF==="all"||p.type===typeF; const mS=statusF==="all"||p.status===statusF;
    const mD=(!dateFrom||p.createdAt>=dateFrom)&&(!dateTo||p.createdAt<=dateTo+"T23:59:59");
    return mQ&&mT&&mS&&mD;
  }),[purchases,search,typeF,statusF,dateFrom,dateTo]);
  const pages=Math.ceil(filtered.length/PER); const paged=filtered.slice((page-1)*PER,page*PER);
  const stats={all:(purchases||[]).length,grn:(purchases||[]).filter(p=>p.type==="grn").length,direct:(purchases||[]).filter(p=>p.type==="direct").length,posted:(purchases||[]).filter(p=>p.status==="posted").length,draft:(purchases||[]).filter(p=>p.status==="draft").length};
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Purchase List</h2><p className="pm-page-sub">All purchases — via GRN process and direct entries</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={()=>{const csv=["ID,Type,Supplier,Amount,Status,Date",...(purchases||[]).map(p=>`${p.id},${p.type},${p.supplierName},${p.totalAmount},${p.status},${p.createdAt?.slice(0,10)}`)].join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="purchases.csv";a.click();}}>↓ Export CSV</button>
        </div>
      </div>
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(5,1fr)",marginBottom:20}}>
        {[
          {l:"All Purchases", v:(purchases||[]).length,                                      bg:"#fff7ed",color:"#f97316",icon:"purchase",  sf:"all",  st:"all"},
          {l:"Via GRN",       v:(purchases||[]).filter(p=>p.type==="grn").length,            bg:"#eff6ff",color:"#3b82f6",icon:"box",        sf:"grn",  st:"all"},
          {l:"Direct",        v:(purchases||[]).filter(p=>p.type==="direct").length,         bg:"#f5f3ff",color:"#8b5cf6",icon:"cart",       sf:"direct",st:"all"},
          {l:"Posted",        v:(purchases||[]).filter(p=>p.status==="posted").length,       bg:"#f0fdf4",color:"#10b981",icon:"check",      sf:"all",  st:"posted"},
          {l:"Pending",       v:(purchases||[]).filter(p=>p.status==="draft").length,        bg:"#fffbeb",color:"#f59e0b",icon:"invoice",    sf:"all",  st:"draft"},
        ].map(({l,v,bg,color,icon,sf,st})=>(
          <div key={l} className="pm-stat-card" style={{cursor:"pointer"}} onClick={()=>{setTypeF(sf);setStatusF(st);}}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:bg}}><Icon name={icon} size={17} color={color}/></div></div>
            <div className="pm-stat-value">{v}</div>
            <div className="pm-stat-label">{l}</div>
          </div>
        ))}
      </div>
      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:"wrap",gap:10}}>
          <div className="pm-search-bar"><Icon name="search" size={14} color="#94a3b8" /><input placeholder="Search ID, supplier…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
          <div className="filter-tabs">
            {[["all","All"],["grn","GRN"],["direct","Direct"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${typeF===v?"filter-active":""}`} onClick={()=>setTypeF(v)}>{l}</button>
            ))}
          </div>
          <div className="filter-tabs" style={{marginLeft:0}}>
            {[["all","All Status"],["draft","Draft"],["posted","Posted"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>setStatusF(v)}>{l}</button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>ID</th><th>Type</th><th>Supplier</th><th>Amount</th><th>Status</th><th>Posted At</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:700,color:ACCENT}}>{p.id}</td>
                  <td><span className={`pm-badge pm-badge-${p.type==="grn"?"blue":"orange"}`}>{p.type?.toUpperCase()}</span></td>
                  <td style={{fontWeight:600}}>{p.supplierName}</td>
                  <td style={{fontWeight:700}}>{fmtPKR(p.totalAmount)}</td>
                  <td><span className={`pm-badge pm-badge-${p.status==="posted"?"green":"gray"}`}>{p.status}</span></td>
                  <td style={{fontSize:12,color:"#64748b"}}>{p.postedAt?.slice(0,10)||"—"}</td>
                  <td style={{fontSize:12,color:"#94a3b8"}}>{p.createdAt?.slice(0,10)}</td>
                  <td><div style={{display:"flex",gap:4}}>
                    {p.status==="posted"||p.type==="grn"
                      ?<span style={{fontSize:12,color:"#94a3b8"}}>View only</span>
                      :<button className="pm-btn pm-btn-primary" style={{fontSize:11,padding:"3px 10px"}} onClick={()=>{if(window.confirm("Post to inventory?"))postDirectPurchase(p.id);}}>Post to Inventory</button>
                    }
                  </div></td>
                </tr>
              ))}
              {!paged.length&&<tr><td colSpan={8} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No purchase entries found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#64748b"}}>
          <span>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
          <div style={{display:"flex",gap:4}}><button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>{Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=><button key={p} className={`pm-btn ${p===page?"pm-btn-primary":"pm-btn-outline"}`} style={{padding:"4px 10px",fontSize:12,minWidth:32}} onClick={()=>setPage(p)}>{p}</button>)}<button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button></div>
        </div>}
      </div>
    </div>
  );
}
