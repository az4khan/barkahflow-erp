import { useState } from "react";
import Icon from "../../../components/common/Icon";
import { useApp } from "../../../context/AppContext";
const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";return`Rs${Number(n).toLocaleString()}`;}
export default function DirectPurchasePage(){
  const {suppliers,materials,createDirectPurchase,purchases,postDirectPurchase}=useApp();
  const [form,setForm]=useState({supplierId:"",supplierName:"",invoiceNo:"",invoiceDate:"",notes:"",items:[]});
  const [item,setItem]=useState({materialId:"",materialName:"",qty:1,unit:"PCS",unitPrice:0});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  function handleSupplier(e){const s=suppliers.find(x=>x.id===e.target.value);set("supplierId",s?.id||"");set("supplierName",s?.name||"");}
  function handleMat(e){const m=materials.find(x=>x.id===e.target.value);setItem(i=>({...i,materialId:m?.id||"",materialName:m?.name||"",unit:m?.unit||"PCS",unitPrice:m?.unitPrice||0}));}
  function addItem(){if(!item.materialId)return;setForm(p=>({...p,items:[...p.items,{...item,total:item.qty*item.unitPrice}]}));setItem({materialId:"",materialName:"",qty:1,unit:"PCS",unitPrice:0});}
  const totalAmt=form.items.reduce((s,i)=>s+(i.total||0),0);
  const directList=(purchases||[]).filter(p=>p.type==="direct");
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Direct Purchase</h2><p className="pm-page-sub">Record purchases made without formal PO process</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:20}}>
        {/* Form */}
        <div className="pm-chart-card">
          <div className="pm-chart-title">New Direct Purchase Entry</div>
          <div className="pm-form-grid" style={{marginBottom:16}}>
            <div className="pm-form-group"><label>Supplier <span style={{color:"#ef4444"}}>*</span></label><select value={form.supplierId} onChange={handleSupplier}><option value="">-- Select --</option>{(suppliers||[]).filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Invoice No.</label><input value={form.invoiceNo} onChange={e=>set("invoiceNo",e.target.value)} placeholder="INV-001"/></div>
            <div className="pm-form-group"><label>Invoice Date</label><input type="date" value={form.invoiceDate} onChange={e=>set("invoiceDate",e.target.value)}/></div>
            <div className="pm-form-group"><label>Notes</label><input value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Optional notes…"/></div>
          </div>
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>Items</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,marginBottom:12,alignItems:"end"}}>
            <div className="pm-form-group" style={{margin:0}}><label>Material</label><select value={item.materialId} onChange={handleMat}><option value="">-- Select --</option>{(materials||[]).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
            <div className="pm-form-group" style={{margin:0}}><label>Qty</label><input type="number" min={1} value={item.qty} onChange={e=>setItem(i=>({...i,qty:Number(e.target.value)}))}/></div>
            <div className="pm-form-group" style={{margin:0}}><label>Unit</label><input value={item.unit} onChange={e=>setItem(i=>({...i,unit:e.target.value}))}/></div>
            <div className="pm-form-group" style={{margin:0}}><label>Unit Price</label><input type="number" min={0} value={item.unitPrice} onChange={e=>setItem(i=>({...i,unitPrice:Number(e.target.value)}))}/></div>
            <button onClick={addItem} className="pm-btn pm-btn-primary" style={{height:36}}>+</button>
          </div>
          {form.items.length>0&&<table className="pm-table" style={{border:"1px solid #f1f5f9",marginBottom:16}}><thead><tr><th>Material</th><th>Qty</th><th>Unit Price</th><th>Total</th><th></th></tr></thead><tbody>{form.items.map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td>{it.qty}</td><td>{fmtPKR(it.unitPrice)}</td><td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(it.total)}</td><td><button onClick={()=>setForm(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>×</button></td></tr>)}<tr style={{background:"#f8fafc"}}><td colSpan={3} style={{fontWeight:700,textAlign:"right"}}>Total:</td><td style={{fontWeight:800,color:ACCENT,fontSize:15}}>{fmtPKR(totalAmt)}</td><td/></tr></tbody></table>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setForm({supplierId:"",supplierName:"",invoiceNo:"",invoiceDate:"",notes:"",items:[]})}>Reset</button>
            <button className="pm-btn pm-btn-primary" onClick={()=>{if(!form.supplierId||!form.items.length){alert("Select supplier and add items.");return;}createDirectPurchase({...form,totalAmount:totalAmt});setForm({supplierId:"",supplierName:"",invoiceNo:"",invoiceDate:"",notes:"",items:[]});}}>Save Direct Purchase</button>
          </div>
        </div>
        {/* Recent list */}
        <div className="pm-chart-card">
          <div className="pm-chart-title">Recent Direct Purchases</div>
          {directList.length===0&&<div style={{textAlign:"center",padding:32,color:"#94a3b8",fontSize:13}}>No direct purchases yet.</div>}
          {directList.slice(0,8).map(p=>(
            <div key={p.id} style={{padding:"10px 0",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12.5,fontWeight:700,color:ACCENT}}>{p.id}</div>
                <div style={{fontSize:12,color:"#64748b"}}>{p.supplierName}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{p.createdAt?.slice(0,10)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,fontSize:13}}>{fmtPKR(p.totalAmount)}</div>
                {p.status==="draft"
                  ?<button className="pm-btn pm-btn-primary" style={{fontSize:10,padding:"2px 8px",marginTop:4}} onClick={()=>postDirectPurchase(p.id)}>Post</button>
                  :<span style={{fontSize:11,color:"#10b981",fontWeight:600}}>✅ Posted</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
