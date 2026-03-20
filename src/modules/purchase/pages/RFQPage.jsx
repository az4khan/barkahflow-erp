import { useState, useMemo } from "react";
import Icon from "../../../components/common/Icon";
import { useApp } from "../../../context/AppContext";
const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;return`Rs${Number(n).toLocaleString()}`;}
function RFQModal({prs,suppliers,materials,onClose,onSave}){
  const [f,setF]=useState({prId:"",title:"",supplierIds:[],dueDate:"",items:[],notes:""});
  const [item,setItem]=useState({materialId:"",materialName:"",qty:1,unit:"PCS"});
  function handlePR(e){const pr=prs.find(p=>p.id===e.target.value);if(pr)setF(p=>({...p,prId:pr.id,title:`RFQ for ${pr.title}`,items:pr.items.map(i=>({materialId:i.materialId,materialName:i.materialName,qty:i.qty,unit:i.unit}))}));else setF(p=>({...p,prId:""}));}
  function toggleSupplier(id){setF(p=>({...p,supplierIds:p.supplierIds.includes(id)?p.supplierIds.filter(s=>s!==id):[...p.supplierIds,id]}));}
  function handleMat(e){const m=materials.find(x=>x.id===e.target.value);setItem(i=>({...i,materialId:m?.id||"",materialName:m?.name||"",unit:m?.unit||"PCS"}));}
  function addItem(){if(!item.materialId)return;setF(p=>({...p,items:[...p.items,{...item}]}));setItem({materialId:"",materialName:"",qty:1,unit:"PCS"});}
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700}}>New Request for Quotation (RFQ)</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:16}}>
          <div className="pm-form-grid">
            <div className="pm-form-group"><label>Linked PR (Forwarded)</label><select value={f.prId} onChange={handlePR}><option value="">-- None / Manual --</option>{(prs||[]).filter(p=>["approved","initiated"].includes(p.status)).map(p=><option key={p.id} value={p.id}>{p.id} — {p.title}</option>)}</select></div>
            <div className="pm-form-group"><label>RFQ Title</label><input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="e.g. RFQ for LPG Cylinders Q2"/></div>
            <div className="pm-form-group"><label>Due Date</label><input type="date" value={f.dueDate} onChange={e=>setF(p=>({...p,dueDate:e.target.value}))}/></div>
          </div>
          {/* Supplier selection */}
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Send To Suppliers (select up to 5)</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(suppliers||[]).filter(s=>s.status==="active").map(s=>(
                <button key={s.id} onClick={()=>toggleSupplier(s.id)}
                  style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${f.supplierIds.includes(s.id)?ACCENT:"#e2e8f0"}`,background:f.supplierIds.includes(s.id)?"#fff7ed":"#fff",color:f.supplierIds.includes(s.id)?ACCENT:"#374151",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {f.supplierIds.includes(s.id)?"✓ ":""}{s.name}
                </button>
              ))}
            </div>
          </div>
          {/* Items */}
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>Items</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,marginBottom:10,alignItems:"end"}}>
              <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={handleMat}><option value="">-- Select --</option>{(materials||[]).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:Number(e.target.value)}))}/></div>
              <div className="pm-form-group" style={{margin:0}}><label>Unit</label><input value={item.unit} onChange={e=>setItem(i=>({...i,unit:e.target.value}))}/></div>
              <button onClick={addItem} className="pm-btn pm-btn-primary" style={{height:36}}>+</button>
            </div>
            {f.items.length>0&&<table className="pm-table" style={{border:"1px solid #f1f5f9"}}><thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th></th></tr></thead><tbody>{f.items.map((it,i)=><tr key={i}><td>{it.materialName}</td><td>{it.qty}</td><td>{it.unit}</td><td><button onClick={()=>setF(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button></td></tr>)}</tbody></table>}
          </div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{if(!f.title||!f.supplierIds.length||!f.items.length){alert("Add title, suppliers, and items.");return;}onSave(f);}}>Create & Send RFQ</button>
        </div>
      </div>
    </div>
  );
}
export default function RFQPage(){
  const {rfqs,quotations,prs,suppliers,materials,createRFQ,sendRFQ,addQuote}=useApp();
  const [search,setSearch]=useState(""); const [showForm,setShowForm]=useState(false);
  const [addQuoteRFQ,setAddQuoteRFQ]=useState(null);
  const [qForm,setQForm]=useState({supplierId:"",supplierName:"",validUntil:"",paymentTerms:"Net 30",deliveryDays:14,notes:"",items:[]});
  const filtered=useMemo(()=>(rfqs||[]).filter(r=>!search||r.id.toLowerCase().includes(search.toLowerCase())||r.title?.toLowerCase().includes(search.toLowerCase())),[rfqs,search]);
  function handleAddQuote(){
    if(!qForm.supplierId){alert("Select supplier.");return;}
    const items=addQuoteRFQ.items.map((it,i)=>({...it,unitPrice:Number(document.getElementById(`qp_${i}`)?.value||0),total:it.qty*Number(document.getElementById(`qp_${i}`)?.value||0)}));
    addQuote(addQuoteRFQ.id,{...qForm,items,totalAmount:items.reduce((s,i)=>s+(i.total||0),0)});
    setAddQuoteRFQ(null);
  }
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Supplier Quotation (RFQ)</h2><p className="pm-page-sub">Send RFQs to suppliers and collect quotations</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" onClick={()=>setShowForm(true)}>+ New RFQ</button></div>
      </div>
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          {l:"Total RFQs",  v:(rfqs||[]).length,                              bg:"#fff7ed",color:"#f97316",icon:"invoice"},
          {l:"Open",        v:(rfqs||[]).filter(r=>r.status==="open"||r.status==="sent").length,  bg:"#eff6ff",color:"#3b82f6",icon:"forward"},
          {l:"Quoted",      v:(rfqs||[]).filter(r=>r.status==="quoted").length,bg:"#fffbeb",color:"#f59e0b",icon:"comparison"},
          {l:"Closed",      v:(rfqs||[]).filter(r=>r.status==="closed").length,bg:"#f0fdf4",color:"#10b981",icon:"check"},
        ].map(({l,v,bg,color,icon})=>(
          <div key={l} className="pm-stat-card">
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:bg}}><Icon name={icon} size={17} color={color}/></div></div>
            <div className="pm-stat-value">{v}</div>
            <div className="pm-stat-label">{l}</div>
          </div>
        ))}
      </div>
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <div className="pm-search-bar"><span style={{color:"#94a3b8",fontSize:13}}>🔍</span><input placeholder="Search RFQ ID, title…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>RFQ ID</th><th>Title</th><th>Linked PR</th><th>Suppliers</th><th>Items</th><th>Due Date</th><th>Status</th><th>Quotes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r=>{
                const rQuotes=(quotations||[]).filter(q=>q.rfqId===r.id);
                return(
                  <tr key={r.id}>
                    <td style={{fontWeight:700,color:ACCENT}}>{r.id}</td>
                    <td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</td>
                    <td style={{fontSize:12,color:"#64748b"}}>{r.prId||"—"}</td>
                    <td style={{textAlign:"center"}}>{(r.suppliers||[]).length}</td>
                    <td style={{textAlign:"center"}}>{(r.items||[]).length}</td>
                    <td style={{fontSize:12}}>{r.dueDate?.slice(0,10)||"—"}</td>
                    <td><span className={`pm-badge pm-badge-${r.status==="sent"?"blue":r.status==="quoted"?"green":"gray"}`}>{r.status}</span></td>
                    <td style={{textAlign:"center",fontWeight:rQuotes.length>0?700:400,color:rQuotes.length>0?"#10b981":"#94a3b8"}}>{rQuotes.length}</td>
                    <td><div style={{display:"flex",gap:4}}>
                      {r.status==="draft"&&<button className="pm-btn pm-btn-primary" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>sendRFQ(r.id)}>Send RFQ</button>}
                      {r.status!=="draft"&&<button className="pm-btn pm-btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>setAddQuoteRFQ(r)}>Add Quote</button>}
                    </div></td>
                  </tr>
                );
              })}
              {!filtered.length&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No RFQs found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showForm&&<RFQModal prs={prs||[]} suppliers={suppliers||[]} materials={materials||[]} onClose={()=>setShowForm(false)} onSave={d=>{createRFQ(d);setShowForm(false);}}/>}
      {addQuoteRFQ&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:640,maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <h3 style={{fontSize:16,fontWeight:700}}>Add Quotation — {addQuoteRFQ.id}</h3>
              <button onClick={()=>setAddQuoteRFQ(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
            </div>
            <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:14}}>
              <div className="pm-form-grid">
                <div className="pm-form-group"><label>Supplier</label><select value={qForm.supplierId} onChange={e=>{const s=(suppliers||[]).find(x=>x.id===e.target.value);setQForm(p=>({...p,supplierId:s?.id||"",supplierName:s?.name||""}))}}><option value="">-- Select --</option>{(suppliers||[]).filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div className="pm-form-group"><label>Valid Until</label><input type="date" value={qForm.validUntil} onChange={e=>setQForm(p=>({...p,validUntil:e.target.value}))}/></div>
                <div className="pm-form-group"><label>Payment Terms</label><select value={qForm.paymentTerms} onChange={e=>setQForm(p=>({...p,paymentTerms:e.target.value}))}>{["Net 15","Net 30","Net 45","Net 60","Advance","COD"].map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="pm-form-group"><label>Delivery (days)</label><input type="number" min={1} value={qForm.deliveryDays} onChange={e=>setQForm(p=>({...p,deliveryDays:Number(e.target.value)}))}/></div>
              </div>
              <table className="pm-table" style={{border:"1px solid #f1f5f9"}}>
                <thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th>Unit Price (PKR)</th></tr></thead>
                <tbody>{(addQuoteRFQ.items||[]).map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td>{it.qty}</td><td>{it.unit}</td><td><input id={`qp_${i}`} type="number" min={0} defaultValue={0} style={{width:110,padding:"4px 8px",border:"1px solid #e2e8f0",borderRadius:6,outline:"none",fontSize:13}}/></td></tr>)}</tbody>
              </table>
              <div className="pm-form-group"><label>Notes</label><textarea value={qForm.notes} onChange={e=>setQForm(p=>({...p,notes:e.target.value}))} rows={2}/></div>
            </div>
            <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
              <button className="pm-btn pm-btn-outline" onClick={()=>setAddQuoteRFQ(null)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={handleAddQuote}>Save Quotation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
