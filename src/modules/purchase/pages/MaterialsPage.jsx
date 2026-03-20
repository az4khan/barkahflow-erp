import { useState, useMemo } from "react";
import { useApp } from "../../../context/AppContext";
import Icon from "../../../components/common/Icon";

const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs 0";if(n>=1e7)return`Rs ${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs ${(n/1e5).toFixed(1)}L`;return`Rs ${Number(n).toLocaleString()}`;}
function MaterialModal({existing,onClose,onSave}){
  const [f,setF]=useState(existing||{name:"",code:"",category:"",unit:"PCS",unitPrice:0,stockQty:0,description:""});
  const cats=["LPG Cylinders","Bulk LPG","Office Furniture","Stationery","IT Equipment","Safety Equipment","Spare Parts","Other"];
  const units=["PCS","KG","MT","L","BOX","CARTON","SET","ROLL"];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{existing?"Edit Material":"New Material"}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:24,overflowY:"auto",flex:1}}>
          <div className="pm-form-grid">
            <div className="pm-form-group" style={{gridColumn:"1/-1"}}><label>Material Name <span style={{color:"#ef4444"}}>*</span></label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="e.g. LPG Cylinder 45kg"/></div>
            <div className="pm-form-group"><label>Code <span style={{color:"#ef4444"}}>*</span></label><input value={f.code} onChange={e=>setF(p=>({...p,code:e.target.value}))} placeholder="e.g. LPG-45"/></div>
            <div className="pm-form-group"><label>Category</label><select value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))}><option value="">-- Select --</option>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="pm-form-group"><label>Unit of Measure</label><select value={f.unit} onChange={e=>setF(p=>({...p,unit:e.target.value}))}>{units.map(u=><option key={u}>{u}</option>)}</select></div>
            <div className="pm-form-group"><label>Unit Price (PKR)</label><input type="number" min={0} value={f.unitPrice} onChange={e=>setF(p=>({...p,unitPrice:Number(e.target.value)}))}/></div>
            <div className="pm-form-group"><label>Current Stock Qty</label><input type="number" min={0} value={f.stockQty} onChange={e=>setF(p=>({...p,stockQty:Number(e.target.value)}))}/></div>
            <div className="pm-form-group" style={{gridColumn:"1/-1"}}><label>Description</label><textarea value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} rows={2} placeholder="Material description…"/></div>
          </div>
        </div>
        <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
          <button className="pm-btn pm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="pm-btn pm-btn-primary" onClick={()=>{if(!f.name||!f.code){alert("Name and code required.");return;}onSave(f);}}>{existing?"Save Changes":"Create Material"}</button>
        </div>
      </div>
    </div>
  );
}
export default function MaterialsPage(){
  const {materials,createMaterial,updateMaterial,deleteMaterial}=useApp();
  const [search,setSearch]=useState(""); const [catF,setCatF]=useState("all");
  const [dateFrom,setDateFrom]=useState(""); const [dateTo,setDateTo]=useState("");
  const [showForm,setShowForm]=useState(false); const [editM,setEditM]=useState(null);
  const [page,setPage]=useState(1); const PER=10;
  const cats=["all",...new Set((materials||[]).map(m=>m.category).filter(Boolean))];
  const filtered=useMemo(()=>(materials||[]).filter(m=>{
    const q=search.toLowerCase();
    const mQ=!q||m.name.toLowerCase().includes(q)||(m.code||"").toLowerCase().includes(q)||(m.category||"").toLowerCase().includes(q);
    const mC=catF==="all"||m.category===catF;
    const mD=(!dateFrom||m.createdAt>=dateFrom)&&(!dateTo||m.createdAt<=dateTo+"T23:59:59");
    return mQ&&mC&&mD;
  }),[materials,search,catF,dateFrom,dateTo]);
  const pages=Math.ceil(filtered.length/PER); const paged=filtered.slice((page-1)*PER,page*PER);
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Materials</h2><p className="pm-page-sub">Catalogue of all purchasable items — cylinders, furniture, stationery and more</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" onClick={()=>{setEditM(null);setShowForm(true);}}>+ New Material</button></div>
      </div>
      <div className="pm-stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          {l:"Total Materials",  v:(materials||[]).length,                                    bg:"#fff7ed",color:"#f97316",icon:"products"},
          {l:"Active",           v:(materials||[]).filter(m=>m.status!=="inactive").length,   bg:"#f0fdf4",color:"#10b981",icon:"check"},
          {l:"Low Stock",        v:(materials||[]).filter(m=>(m.stockQty||0)<(m.minStock||0)).length, bg:"#fef2f2",color:"#ef4444",icon:"alert"},
          {l:"Total Stock Value", v:fmtPKR((materials||[]).reduce((s,m)=>s+(m.stockQty||0)*(m.unitPrice||m.lastPrice||0),0)), bg:"#fffbeb",color:"#f59e0b",icon:"briefcase"},
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
          <div className="pm-search-bar"><Icon name="search" size={14} color="#94a3b8" /><input placeholder="Search name, code, category…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
          <select className="pm-btn pm-btn-outline" style={{padding:"6px 10px",fontSize:12.5}} value={catF} onChange={e=>setCatF(e.target.value)}>{cats.map(c=><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}</select>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   style={{padding:"6px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,outline:"none",color:"#374151"}}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table className="pm-table">
            <thead><tr><th>Code</th><th>Material Name</th><th>Category</th><th>Unit</th><th>Unit Price</th><th>Stock Qty</th><th>Created By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map(m=>(
                <tr key={m.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontSize:12}}>{m.code}</td>
                  <td><div style={{fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{m.description}</div></td>
                  <td><span className="pm-badge pm-badge-blue">{m.category||"—"}</span></td>
                  <td>{m.unit}</td>
                  <td style={{fontWeight:600}}>Rs{Number(m.unitPrice).toLocaleString()}</td>
                  <td style={{fontWeight:600,color:m.stockQty>50?"#10b981":m.stockQty>10?"#f59e0b":"#ef4444"}}>{(m.stockQty||0).toLocaleString()}</td>
                  <td style={{fontSize:11,color:"#94a3b8"}}>{m.createdBy}</td>
                  <td style={{fontSize:11,color:"#94a3b8"}}>{m.createdAt?.slice(0,10)}</td>
                  <td><div style={{display:"flex",gap:4}}>
                    <button className="pm-btn pm-btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>{setEditM(m);setShowForm(true);}}>Edit</button>
                    <button style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:13,padding:"3px 6px"}} onClick={()=>{if(window.confirm("Delete this material?"))deleteMaterial(m.id);}}>×</button>
                  </div></td>
                </tr>
              ))}
              {!paged.length&&<tr><td colSpan={9} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No materials found.</td></tr>}
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
      {showForm&&<MaterialModal existing={editM} onClose={()=>{setShowForm(false);setEditM(null);}} onSave={d=>{editM?updateMaterial(editM.id,d):createMaterial(d);setShowForm(false);setEditM(null);}}/>}
    </div>
  );
}
