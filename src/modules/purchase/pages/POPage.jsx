import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs${(n/1e5).toFixed(1)}L`;return`Rs${Number(n).toLocaleString()}`;}
function Badge({s}){const m={draft:"gray",initiated:"blue",pending:"orange",approved:"green",rejected:"red"};return<span className={`pm-badge pm-badge-${m[s]||"gray"}`}>{s}</span>;}

function POModal({existing,prs,suppliers,materials,onClose,onSave}){
  const [f,setF]=useState(existing||{prId:"",supplierId:"",supplierName:"",paymentTerms:"Net 30",deliveryDate:"",incoterms:"CIF",currency:"PKR",items:[],notes:""});
  const [item,setItem]=useState({materialId:"",materialName:"",qty:1,unit:"PCS",unitPrice:0});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  function handlePR(e){
    const pr=prs.find(p=>p.id===e.target.value);
    if(pr){setF(p=>({...p,prId:pr.id,items:pr.items.map(i=>({...i,unitPrice:i.estimatedPrice||0,total:i.qty*(i.estimatedPrice||0)}))}))}
    else setF(p=>({...p,prId:""}));
  }
  function handleSupplier(e){const s=suppliers.find(x=>x.id===e.target.value);set("supplierId",s?.id||"");set("supplierName",s?.name||"");}
  function handleMat(e){const m=materials.find(x=>x.id===e.target.value);setItem(i=>({...i,materialId:m?.id||"",materialName:m?.name||"",unit:m?.unit||"PCS",unitPrice:m?.unitPrice||0}));}
  function addItem(){if(!item.materialId)return;const total=item.qty*item.unitPrice;setF(p=>({...p,items:[...p.items,{...item,total}]}));setItem({materialId:"",materialName:"",qty:1,unit:"PCS",unitPrice:0});}
  const totalAmt=f.items.reduce((s,i)=>s+(i.total||0),0);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{existing?"Edit":"New"} Purchase Order</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:16}}>
          <div className="pm-form-grid">
            <div className="pm-form-group">
              <label>Linked PR (Optional)</label>
              <select value={f.prId} onChange={handlePR}>
                <option value="">-- None / Manual --</option>
                {(prs||[]).filter(p=>["approved"].includes(p.status)).map(p=><option key={p.id} value={p.id}>{p.id} — {p.title}</option>)}
              </select>
            </div>
            <div className="pm-form-group">
              <label>Supplier <span style={{color:"#ef4444"}}>*</span></label>
              <select value={f.supplierId} onChange={handleSupplier}>
                <option value="">-- Select Supplier --</option>
                {(suppliers||[]).filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="pm-form-group"><label>Payment Terms</label><select value={f.paymentTerms} onChange={e=>set("paymentTerms",e.target.value)}>{["Net 15","Net 30","Net 45","Net 60","Advance","COD"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Delivery Date</label><input type="date" value={f.deliveryDate} onChange={e=>set("deliveryDate",e.target.value)}/></div>
            <div className="pm-form-group"><label>Incoterms</label><select value={f.incoterms} onChange={e=>set("incoterms",e.target.value)}>{["CIF","FOB","EXW","DAP","DDP","FCA"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Currency</label><select value={f.currency} onChange={e=>set("currency",e.target.value)}>{["PKR","USD","EUR","AED","SAR"].map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          {/* Items */}
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>Order Items</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,marginBottom:10,alignItems:"end"}}>
              <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={handleMat}><option value="">-- Select --</option>{(materials||[]).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:Number(e.target.value)}))}/></div>
              <div className="pm-form-group" style={{margin:0}}><label>Unit</label><input value={item.unit} onChange={e=>setItem(i=>({...i,unit:e.target.value}))}/></div>
              <div className="pm-form-group" style={{margin:0}}><label>Unit Price</label><input type="number" min={0} value={item.unitPrice} onChange={e=>setItem(i=>({...i,unitPrice:Number(e.target.value)}))}/></div>
              <button onClick={addItem} className="pm-btn pm-btn-primary" style={{height:36}}>+ Add</button>
            </div>
            {f.items.length>0&&<table className="pm-table" style={{border:"1px solid #f1f5f9"}}><thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Total</th><th></th></tr></thead><tbody>{f.items.map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td>{it.qty}</td><td>{it.unit}</td><td>{fmtPKR(it.unitPrice)}</td><td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(it.total)}</td><td><button onClick={()=>setF(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button></td></tr>)}<tr style={{background:"#f8fafc"}}><td colSpan={4} style={{fontWeight:700,textAlign:"right"}}>Total:</td><td style={{fontWeight:800,color:ACCENT,fontSize:15}}>{fmtPKR(totalAmt)}</td><td/></tr></tbody></table>}
          </div>
          <div className="pm-form-group"><label>Notes</label><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Additional notes…"/></div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{if(!f.supplierId||!f.items.length){alert("Select supplier and add items.");return;}onSave({...f,totalAmount:totalAmt});}}>{existing?"Save":"Create PO"}</button>
        </div>
      </div>
    </div>
  );
}

export default function POPage(){
  const {purchaseOrders,prs,suppliers,materials,createPO,updatePO,deletePO,forwardPO}=useApp();
  const [search,setSearch]=useState(""); const [statusF,setStatusF]=useState("all");
  const [dateFrom,setDateFrom]=useState(""); const [dateTo,setDateTo]=useState("");
  const [showForm,setShowForm]=useState(false); const [editPO,setEditPO]=useState(null);
  const [page,setPage]=useState(1); const PER=10;
  const filtered=useMemo(()=>(purchaseOrders||[]).filter(p=>{
    const q=search.toLowerCase(); const mQ=!q||p.id.toLowerCase().includes(q)||(p.supplierName||"").toLowerCase().includes(q);
    const mS=statusF==="all"||p.status===statusF;
    const mD=(!dateFrom||p.createdAt>=dateFrom)&&(!dateTo||p.createdAt<=dateTo+"T23:59:59");
    return mQ&&mS&&mD;
  }),[purchaseOrders,search,statusF,dateFrom,dateTo]);
  const pages=Math.ceil(filtered.length/PER); const paged=filtered.slice((page-1)*PER,page*PER);
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Purchase Orders</h2><p className="pm-page-sub">Manage POs with full approval workflow</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" onClick={()=>{setEditPO(null);setShowForm(true);}}>+ New PO</button></div>
      </div>
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(5,1fr)",marginBottom:20}}>
        {[
          {l:"Total",    v:(purchaseOrders||[]).length,                             bg:"#eef2ff", color:"#6366f1", icon:"purchase",  sf:"all"},
          {l:"Draft",    v:(purchaseOrders||[]).filter(p=>p.status==="draft").length,   bg:"#f8fafc", color:"#64748b", icon:"invoice",   sf:"draft"},
          {l:"Initiated",v:(purchaseOrders||[]).filter(p=>p.status==="initiated").length,bg:"#eff6ff",color:"#3b82f6", icon:"forward",   sf:"initiated"},
          {l:"Approved", v:(purchaseOrders||[]).filter(p=>p.status==="approved").length, bg:"#f0fdf4", color:"#10b981", icon:"check",    sf:"approved"},
          {l:"Rejected", v:(purchaseOrders||[]).filter(p=>p.status==="rejected").length, bg:"#fef2f2", color:"#ef4444", icon:"alert",    sf:"rejected"},
        ].map(({l,v,bg,color,icon,sf})=>(
          <div key={l} className="pm-stat-card" style={{cursor:"pointer"}} onClick={()=>setStatusF(sf)}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:bg}}><Icon name={icon} size={17} color={color}/></div></div>
            <div className="pm-stat-value">{v}</div>
            <div className="pm-stat-label">{l}</div>
          </div>
        ))}
      </div>
      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:"wrap",gap:10}}>
          <div className="pm-search-bar"><Icon name="search" size={14} color="#94a3b8" /><input placeholder="Search PO ID, supplier…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
          <div className="filter-tabs">
            {[["all","All"],["draft","Draft"],["initiated","Initiated"],["approved","Approved"],["rejected","Rejected"]].map(([v,l])=>(
              <button key={v} className={`filter-tab ${statusF===v?"filter-active":""}`} onClick={()=>setStatusF(v)}>{l}</button>
            ))}
          </div>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>PO ID</th><th>Linked PR</th><th>Supplier</th><th>Items</th><th>Total Amount</th><th>Delivery</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(po=>(
                <tr key={po.id}>
                  <td style={{fontWeight:700,color:ACCENT}}>{po.id}</td>
                  <td style={{fontSize:12,color:"#64748b"}}>{po.prId||"—"}</td>
                  <td style={{fontWeight:600}}>{po.supplierName}</td>
                  <td style={{textAlign:"center"}}>{(po.items||[]).length}</td>
                  <td style={{fontWeight:700}}>{fmtPKR(po.totalAmount)}</td>
                  <td style={{fontSize:12}}>{po.deliveryDate||"—"}</td>
                  <td><Badge s={po.status}/></td>
                  <td style={{fontSize:12,color:"#94a3b8"}}>{po.createdAt?.slice(0,10)}</td>
                  <td><div style={{display:"flex",gap:4}}>
                    {po.status==="draft"&&<><button className="pm-btn pm-btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>{setEditPO(po);setShowForm(true);}}>Edit</button><button className="pm-btn pm-btn-primary" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>forwardPO(po.id)}>Forward</button><button style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:13,padding:"3px 6px"}} onClick={()=>{if(window.confirm("Delete?"))deletePO(po.id);}}>×</button></>}
                    {po.status!=="draft"&&<span style={{fontSize:12,color:"#94a3b8"}}>{po.status==="initiated"?"Pending approval":po.status}</span>}
                  </div></td>
                </tr>
              ))}
              {!paged.length&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No purchase orders found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pages>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderTop:"1px solid #f1f5f9",fontSize:13,color:"#64748b"}}>
          <span>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
          <div style={{display:"flex",gap:4}}>
            <button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=><button key={p} className={`pm-btn ${p===page?"pm-btn-primary":"pm-btn-outline"}`} style={{padding:"4px 10px",fontSize:12,minWidth:32}} onClick={()=>setPage(p)}>{p}</button>)}
            <button className="pm-btn pm-btn-outline" style={{padding:"4px 10px",fontSize:12}} disabled={page===pages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        </div>}
      </div>
      {showForm&&<POModal existing={editPO} prs={prs||[]} suppliers={suppliers||[]} materials={materials||[]} onClose={()=>{setShowForm(false);setEditPO(null);}} onSave={d=>{editPO?updatePO(editPO.id,d):createPO(d);setShowForm(false);setEditPO(null);}}/>}
    </div>
  );
}
