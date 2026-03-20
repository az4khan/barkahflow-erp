import { useState } from "react";
import { Modal } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

export default function PMSuppliers({ suppliers, setSuppliers, toastFn }) {
  const BLANK = { name:"",country:"",contact:"",phone:"",email:"",code:"" };
  const [showForm,setShowForm] = useState(false);
  const [edit,setEdit]         = useState(null);
  const [form,setForm]         = useState(BLANK);

  const openAdd  = () => { setForm(BLANK); setEdit(null); setShowForm(true); };
  const openEdit = (s) => { setForm(s); setEdit(s); setShowForm(true); };
  const handleSave = () => {
    if (!form.name) { toastFn("Company name required.","error"); return; }
    if (edit) setSuppliers(a=>a.map(x=>x.id===edit.id?{...x,...form}:x));
    else      setSuppliers(a=>[...a,{...form,id:`SUP-00${suppliers.length+1}`,rating:4.5,orders:0}]);
    toastFn("Saved.","success"); setShowForm(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1 className="page-title">Supplier Management</h1><p className="page-sub">{suppliers.length} international suppliers</p></div>
        <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15}/> Add Supplier</button>
      </div>
      <div className="card-grid">
        {suppliers.map(s=>(
          <div key={s.id} className="supplier-card">
            <div className="supplier-card-header">
              <div><div className="supplier-name">{s.name}</div><div className="supplier-country">{s.country}</div></div>
              <span className="supplier-id-badge">{s.id}</span>
            </div>
            <div className="supplier-fields">
              <div><span>Contact</span><strong>{s.contact}</strong></div>
              <div><span>Phone</span><strong>{s.phone}</strong></div>
              <div><span>Vendor Code</span><strong>{s.code}</strong></div>
              <div><span>Rating</span><strong>★ {s.rating}</strong></div>
            </div>
            <div className="supplier-orders-row"><span>Total Orders</span><span className="orders-count">{s.orders} orders</span></div>
            <div className="supplier-actions">
              <button className="btn-edit" onClick={()=>openEdit(s)}>Edit</button>
              <button className="btn-view-hist">View History</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <Modal title={edit?"Edit Supplier":"Add Supplier"} onClose={()=>setShowForm(false)}>
          <div className="form-grid">
            {[["Company Name","name"],["Country","country"],["Contact Person","contact"],["Phone","phone"],["Email","email"],["Vendor Code","code"]].map(([l,k])=>(
              <div key={k} className="form-group"><label>{l}</label><input value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>
            ))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:20}}>
            <button className="btn-primary" style={{flex:1}} onClick={handleSave}>Save</button>
            <button className="btn-outline" style={{flex:1}} onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
