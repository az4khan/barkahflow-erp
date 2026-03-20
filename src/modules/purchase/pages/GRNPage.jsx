import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;return`Rs${Number(n).toLocaleString()}`;}
function GRNModal({purchaseOrders,suppliers,materials,onClose,onSave}){
  const [f,setF]=useState({poId:"",supplierId:"",supplierName:"",vehicleNo:"",items:[],notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  function handlePO(e){
    const po=purchaseOrders.find(x=>x.id===e.target.value);
    if(po){setF(p=>({...p,poId:po.id,supplierId:po.supplierId,supplierName:po.supplierName,items:po.items.map(i=>({...i,receivedQty:i.qty,total:i.qty*i.unitPrice}))}))}
    else setF(p=>({...p,poId:"",items:[]}));
  }
  function updateReceived(idx,qty){setF(p=>({...p,items:p.items.map((it,i)=>i===idx?{...it,receivedQty:Number(qty),total:Number(qty)*it.unitPrice}:it)}));}
  const totalAmt=f.items.reduce((s,i)=>s+(i.total||0),0);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:760,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700}}>New Goods Receipt (GRN)</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:16}}>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Linked PO <span style={{color:"#ef4444"}}>*</span></label>
              <select value={f.poId} onChange={handlePO}>
                <option value="">-- Select Approved PO --</option>
                {(purchaseOrders||[]).filter(p=>p.status==="approved").map(p=><option key={p.id} value={p.id}>{p.id} — {p.supplierName}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Supplier</label><input value={f.supplierName} readOnly style={{background:"#f8fafc"}}/></div>
            <div className="pm-form-group"><label>Vehicle / Truck No.</label><input value={f.vehicleNo} onChange={e=>set("vehicleNo",e.target.value)} placeholder="e.g. LHR-1234"/></div>
            <div className="pm-form-group"><label>Notes</label><input value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="Inspection notes…"/></div>
          </div>
          {f.items.length>0&&(
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>Received Items</div>
              <table className="pm-table" style={{border:"1px solid #f1f5f9"}}>
                <thead><tr><th>Material</th><th>Ordered Qty</th><th>Received Qty</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {f.items.map((it,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{it.materialName}</td>
                      <td style={{color:"#64748b"}}>{it.qty}</td>
                      <td><input type="number" min={0} max={it.qty} value={it.receivedQty} onChange={e=>updateReceived(i,e.target.value)} style={{width:80,padding:"4px 8px",border:"1px solid #e2e8f0",borderRadius:6,outline:"none",fontSize:13}}/></td>
                      <td>{it.unit}</td>
                      <td>{fmtPKR(it.unitPrice)}</td>
                      <td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(it.total)}</td>
                    </tr>
                  ))}
                  <tr style={{background:"#f8fafc"}}><td colSpan={5} style={{fontWeight:700,textAlign:"right"}}>Total:</td><td style={{fontWeight:800,color:ACCENT,fontSize:15}}>{fmtPKR(totalAmt)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
          {!f.poId&&<div style={{padding:20,textAlign:"center",color:"#94a3b8",background:"#f8fafc",borderRadius:8}}>Select an approved PO to load items</div>}
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{if(!f.poId){alert("Select a PO.");return;}onSave({...f,totalAmount:totalAmt});}}> Create GRN</button>
        </div>
      </div>
    </div>
  );
}
export default function GRNPage(){
  const {grns,purchaseOrders,suppliers,materials,createGRN,completeGRN}=useApp();
  const [search,setSearch]=useState(""); const [statusF,setStatusF]=useState("all");
  const [dateFrom,setDateFrom]=useState(""); const [dateTo,setDateTo]=useState("");
  const [showForm,setShowForm]=useState(false); const [page,setPage]=useState(1); const PER=10;
  const filtered=useMemo(()=>(grns||[]).filter(g=>{
    const q=search.toLowerCase(); const mQ=!q||g.id.toLowerCase().includes(q)||(g.supplierName||"").toLowerCase().includes(q);
    const mS=statusF==="all"||g.status===statusF;
    const mD=(!dateFrom||g.createdAt>=dateFrom)&&(!dateTo||g.createdAt<=dateTo+"T23:59:59");
    return mQ&&mS&&mD;
  }),[grns,search,statusF,dateFrom,dateTo]);
  const pages=Math.ceil(filtered.length/PER); const paged=filtered.slice((page-1)*PER,page*PER);
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Goods Receipt (GRN)</h2><p className="pm-page-sub">Record incoming goods against Purchase Orders</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" onClick={()=>setShowForm(true)}>+ New GRN</button></div>
      </div>
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          {l:"Total GRNs",     v:(grns||[]).length,                                                                           bg:"#fff7ed", color:"#f97316", icon:"box"},
          {l:"Draft",          v:(grns||[]).filter(g=>g.status==="draft").length,                                             bg:"#f8fafc", color:"#64748b", icon:"invoice"},
          {l:"Completed",      v:(grns||[]).filter(g=>g.status==="completed").length,                                         bg:"#f0fdf4", color:"#10b981", icon:"check"},
          {l:"Total Received", v:fmtPKR((grns||[]).filter(g=>g.status==="completed").reduce((s,g)=>s+(g.totalAmount||0),0)), bg:"#eef2ff", color:"#6366f1", icon:"briefcase"},
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
          <div className="pm-search-bar"><Icon name="search" size={14} color="#94a3b8" /><input placeholder="Search GRN ID, supplier…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
          <div className="filter-tabs">
            {[["all","All"],["draft","Draft"],["completed","Completed"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>setStatusF(v)}>{l}</button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>GRN ID</th><th>Linked PO</th><th>Supplier</th><th>Items</th><th>Total Amount</th><th>Vehicle</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(g=>(
                <tr key={g.id}>
                  <td style={{fontWeight:700,color:ACCENT}}>{g.id}</td>
                  <td style={{fontSize:12,color:"#64748b"}}>{g.poId||"—"}</td>
                  <td style={{fontWeight:600}}>{g.supplierName}</td>
                  <td style={{textAlign:"center"}}>{(g.items||[]).length}</td>
                  <td style={{fontWeight:700}}>{fmtPKR(g.totalAmount)}</td>
                  <td style={{fontSize:12}}>{g.vehicleNo||"—"}</td>
                  <td><span className={`pm-badge pm-badge-${g.status==="completed"?"green":"orange"}`}>{g.status}</span></td>
                  <td style={{fontSize:12,color:"#94a3b8"}}>{g.createdAt?.slice(0,10)}</td>
                  <td>{g.status==="draft"&&<button className="pm-btn pm-btn-primary" style={{fontSize:11,padding:"3px 10px"}} onClick={()=>{if(window.confirm("Complete this GRN? This will update inventory."))completeGRN(g.id);}}>Complete & Post</button>}
                  {g.status==="completed"&&<span style={{fontSize:12,color:"#10b981",fontWeight:600}}>✅ Posted</span>}</td>
                </tr>
              ))}
              {!paged.length&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No GRNs found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#64748b"}}>
          <span>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
          <div style={{display:"flex",gap:4}}><button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>{Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=><button key={p} className={`pm-btn ${p===page?"pm-btn-primary":"pm-btn-outline"}`} style={{padding:"4px 10px",fontSize:12,minWidth:32}} onClick={()=>setPage(p)}>{p}</button>)}<button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button></div>
        </div>}
      </div>
      {showForm&&<GRNModal purchaseOrders={purchaseOrders||[]} suppliers={suppliers||[]} materials={materials||[]} onClose={()=>setShowForm(false)} onSave={d=>{createGRN(d);setShowForm(false);}}/>}
    </div>
  );
}
