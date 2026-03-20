import { useState } from "react";
import Icon from "../../../components/common/Icon";
import { useApp } from "../../../context/AppContext";
export default function ApprovalStrategyPage(){
  const {approvalStrategies,createApprovalStrategy,updateApprovalStrategy,deleteApprovalStrategy}=useApp();
  const [showForm,setShowForm]=useState(false); const [editAS,setEditAS]=useState(null);
  const [form,setForm]=useState({name:"",module:"Purchase",documentType:"PR",status:"active",levels:[{level:1,role:"Purchase Manager",minAmount:0,maxAmount:null}]});
  const ROLES=["Purchase Manager","Finance Manager","System Administrator","Department Head","CEO"];
  const DOCS=["PR","PO","GRN","Direct Purchase"];
  function addLevel(){setForm(p=>({...p,levels:[...p.levels,{level:p.levels.length+1,role:"Finance Manager",minAmount:0,maxAmount:null}]}));}
  function updateLevel(i,k,v){setForm(p=>({...p,levels:p.levels.map((l,idx)=>idx===i?{...l,[k]:v}:l)}));}
  function save(){if(!form.name){alert("Name required.");return;}editAS?updateApprovalStrategy(editAS.id,form):createApprovalStrategy(form);setShowForm(false);setEditAS(null);setForm({name:"",module:"Purchase",documentType:"PR",status:"active",levels:[{level:1,role:"Purchase Manager",minAmount:0,maxAmount:null}]});}
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Approval Strategy</h2><p className="pm-page-sub">Configure multi-level approval workflows for PRs and POs</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-primary" onClick={()=>{setEditAS(null);setShowForm(true);}}>+ New Strategy</button></div>
      </div>
      {/* Existing strategies */}
      <div className="pm-cards-grid">
        {(approvalStrategies||[]).map(s=>(
          <div key={s.id} className="pm-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{s.name}</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{s.module} → {s.documentType}</div>
              </div>
              <span className={`pm-badge pm-badge-${s.status==="active"?"green":"gray"}`}>{s.status}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {(s.levels||[]).map((l,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:7}}>
                  <span style={{width:22,height:22,borderRadius:"50%",background:"#f97316",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{l.level}</span>
                  <span style={{fontSize:12.5,flex:1}}>{l.role}</span>
                  <span style={{fontSize:11,color:"#94a3b8"}}>Rs{(l.minAmount||0).toLocaleString()}{l.maxAmount?` – Rs${l.maxAmount.toLocaleString()}`:"+"}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="pm-btn pm-btn-outline" style={{fontSize:11,flex:1}} onClick={()=>{setEditAS(s);setForm({...s});setShowForm(true);}}>Edit</button>
              <button style={{background:"none",border:"1px solid #fecaca",borderRadius:8,color:"#ef4444",cursor:"pointer",padding:"5px 10px",fontSize:11}} onClick={()=>{if(window.confirm("Delete?"))deleteApprovalStrategy(s.id);}}>Delete</button>
            </div>
          </div>
        ))}
        {!(approvalStrategies||[]).length&&<div style={{padding:40,textAlign:"center",color:"#94a3b8",gridColumn:"1/-1"}}>No approval strategies yet. Create one to enable document workflows.</div>}
      </div>
      {/* Form */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <h3 style={{fontSize:16,fontWeight:700}}>{editAS?"Edit":"New"} Approval Strategy</h3>
              <button onClick={()=>{setShowForm(false);setEditAS(null);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>×</button>
            </div>
            <div style={{padding:24,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:16}}>
              <div className="pm-form-grid">
                <div className="pm-form-group" style={{gridColumn:"1/-1"}}><label>Strategy Name <span style={{color:"#ef4444"}}>*</span></label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. PR Approval — Standard"/></div>
                <div className="pm-form-group"><label>Module</label><select value={form.module} onChange={e=>setForm(p=>({...p,module:e.target.value}))}>{["Purchase","HR","Finance"].map(m=><option key={m}>{m}</option>)}</select></div>
                <div className="pm-form-group"><label>Document Type</label><select value={form.documentType} onChange={e=>setForm(p=>({...p,documentType:e.target.value}))}>{DOCS.map(d=><option key={d}>{d}</option>)}</select></div>
                <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#374151"}}>Approval Levels</div>
                  <button className="pm-btn pm-btn-outline" style={{fontSize:12}} onClick={addLevel}>+ Add Level</button>
                </div>
                {form.levels.map((l,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"auto 2fr 1fr 1fr auto",gap:8,alignItems:"end",marginBottom:10}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"#f97316",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>{l.level}</div>
                    <div className="pm-form-group" style={{margin:0}}><label>Role</label><select value={l.role} onChange={e=>updateLevel(i,"role",e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
                    <div className="pm-form-group" style={{margin:0}}><label>Min Amount</label><input type="number" value={l.minAmount||0} onChange={e=>updateLevel(i,"minAmount",Number(e.target.value))}/></div>
                    <div className="pm-form-group" style={{margin:0}}><label>Max Amount</label><input type="number" value={l.maxAmount||""} placeholder="Unlimited" onChange={e=>updateLevel(i,"maxAmount",e.target.value?Number(e.target.value):null)}/></div>
                    <button onClick={()=>setForm(p=>({...p,levels:p.levels.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,marginBottom:4}}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"14px 24px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
              <button className="pm-btn pm-btn-outline" onClick={()=>{setShowForm(false);setEditAS(null);}}>Cancel</button>
              <button className="pm-btn pm-btn-primary" onClick={save}>{editAS?"Save Changes":"Create Strategy"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
