import { useState } from "react";
import { fmtPKR } from "./purchaseConstants";

const BLANK = { supplier:"",product:"",qty:"",unitPrice:"",subsidiary:"Parent Company",date:"",transportation:"",customs:"",brokerage:"",loading:"",port:"",misc:"",status:"Pending" };

export default function NewPurchase({ suppliers, products, onSave, editData, onCancel, toastFn }) {
  const [form,setForm] = useState(editData||BLANK);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const prodCost = (parseFloat(form.qty)||0)*(parseFloat(form.unitPrice)||0);
  const addCosts = ["transportation","customs","brokerage","loading","port","misc"].reduce((s,k)=>s+(parseFloat(form[k])||0),0);
  const total = prodCost+addCosts;

  const handleSubmit = () => {
    if (!form.supplier||!form.product||!form.qty||!form.unitPrice) { toastFn("Fill required fields.","error"); return; }
    onSave(form); toastFn(editData?"Updated!":"Purchase order created!","success");
  };

  return (
    <div className="page">
      <div className="page-header"><div><h1 className="page-title">{editData?"Edit Purchase Order":"New Purchase Order"}</h1><p className="page-sub">Create international LPG procurement order</p></div></div>
      <div className="new-purchase-layout">
        <div className="form-card">
          <h3 className="form-section-title">Purchase Details</h3>
          <div className="form-grid">
            <div className="form-group"><label>Supplier *</label><select value={form.supplier} onChange={e=>set("supplier",e.target.value)}><option value="">Select</option>{suppliers.map(s=><option key={s.id}>{s.name}</option>)}</select></div>
            <div className="form-group"><label>Product *</label><select value={form.product} onChange={e=>{const p=products.find(x=>x.name===e.target.value);set("product",e.target.value);if(p)set("unitPrice",p.avgPrice);}}><option value="">Select</option>{products.map(p=><option key={p.id}>{p.name}</option>)}</select></div>
            <div className="form-group"><label>Quantity (Units) *</label><input type="number" value={form.qty} onChange={e=>set("qty",e.target.value)} placeholder="1000"/></div>
            <div className="form-group"><label>Unit Price (PKR) *</label><input type="number" value={form.unitPrice} onChange={e=>set("unitPrice",e.target.value)} placeholder="8500"/></div>
            <div className="form-group"><label>Destination Subsidiary</label><select value={form.subsidiary} onChange={e=>set("subsidiary",e.target.value)}><option>Parent Company</option><option>Wholesale Subsidiary</option><option>Retail Shop 1</option><option>Retail Shop 2</option></select></div>
            <div className="form-group"><label>Expected Delivery</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
          </div>
          <h3 className="form-section-title" style={{marginTop:24}}>Landed Cost Components</h3>
          <div className="form-group" style={{marginBottom:16}}><label>Product Cost (Auto)</label><input value={prodCost?prodCost.toLocaleString():""} readOnly className="input-readonly" placeholder="Auto-calculated"/></div>
          <div className="form-grid">
            {[["Transportation (PKR)","transportation"],["Customs Duty (PKR)","customs"],["Brokerage Fee (PKR)","brokerage"],["Port Charges (PKR)","port"],["Loading/Unloading (PKR)","loading"],["Miscellaneous (PKR)","misc"]].map(([l,k])=>(
              <div key={k} className="form-group"><label>{l}</label><input type="number" value={form[k]} onChange={e=>set(k,e.target.value)} placeholder="0"/></div>
            ))}
          </div>
          <div className="total-cost-line"><span>Total Landed Cost</span><span className="total-cost-val">{fmtPKR(total)}</span></div>
        </div>
        <div className="order-summary-panel">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Product Cost</span><span>{fmtPKR(prodCost)}</span></div>
            <div className="summary-row"><span>Additional Costs</span><span>{fmtPKR(addCosts)}</span></div>
            <div className="summary-divider"/>
            <div className="summary-row summary-total"><span>Total Landed</span><span className="total-orange">{fmtPKR(total)}</span></div>
            <div className="summary-row"><span>Cost per Unit</span><span>Rs{form.qty?Math.round(total/parseFloat(form.qty)).toLocaleString():"0"}</span></div>
            <button className="btn-primary btn-block" style={{marginTop:8}} onClick={handleSubmit}>{editData?"Update Order":"Create Purchase Order"}</button>
            {editData?<button className="btn-ghost btn-block" onClick={onCancel}>Cancel</button>:<button className="btn-ghost btn-block">Save as Draft</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
