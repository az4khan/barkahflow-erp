import { useState } from "react";
import { Modal } from "../../components/common/UI";
import Icon from "../../components/common/Icon";

const COLORS = [
  {icon:"#f97316",bg:"#fff7ed"},
  {icon:"#3b82f6",bg:"#eff6ff"},
  {icon:"#22c55e",bg:"#f0fdf4"},
  {icon:"#8b5cf6",bg:"#f5f3ff"},
];

export default function PMProducts({ products, setProducts, toastFn }) {
  const BLANK = { name:"", category:"Cylinder", unit:"Cylinder", stock:"", reorder:"", avgPrice:"" };
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit]         = useState(null);
  const [form, setForm]         = useState(BLANK);

  const openAdd  = () => { setForm(BLANK); setEdit(null); setShowForm(true); };
  const openEdit = (p) => { setForm(p); setEdit(p); setShowForm(true); };
  const handleSave = () => {
    if (!form.name) { toastFn("Product name required.","error"); return; }
    const parsed = {...form, stock:Number(form.stock), reorder:Number(form.reorder), avgPrice:Number(form.avgPrice)};
    if (edit) setProducts(a=>a.map(x=>x.id===edit.id?{...x,...parsed}:x));
    else      setProducts(a=>[...a,{...parsed,id:`PRD-00${products.length+1}`}]);
    toastFn("Saved.","success"); setShowForm(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="pm-page-title">Product Catalog</h1>
          <p className="pm-page-sub">LPG products available for procurement</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Icon name="plus" size={15}/> Add Product</button>
      </div>

      {/* Product Cards — 4-column grid */}
      <div className="product-grid">
        {products.map((p,i) => {
          const c = COLORS[i % COLORS.length];
          return (
            <div key={p.id} className="product-card">
              <div className="product-icon-wrap" style={{background:c.bg}}>
                <Icon name="box" size={26} color={c.icon}/>
              </div>
              <div className="product-name">{p.name}</div>
              <span className="product-category-tag">{p.category}</span>
              <div className="product-fields">
                <div><span>Unit</span><strong>{p.unit}</strong></div>
                <div><span>Current Stock</span><strong>{p.stock.toLocaleString()}</strong></div>
                <div><span>Reorder Point</span><strong className="product-reorder">{p.reorder.toLocaleString()}</strong></div>
                <div><span>Avg. Price</span><strong className="product-price">Rs{p.avgPrice.toLocaleString()}</strong></div>
              </div>
              <div className="product-actions">
                <button className="btn-edit" onClick={()=>openEdit(p)}>Edit</button>
                <button className="btn-view-hist">History</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Products section with table */}
      <div className="section-title-bar">
        <span className="chart-title-bar"/>All Products
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Product ID</th><th>Name</th><th>Category</th><th>Unit</th><th>Stock</th><th>Reorder Point</th><th>Avg. Price</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p=>(
              <tr key={p.id}>
                <td style={{color:"#f97316",fontWeight:700}}>{p.id}</td>
                <td style={{fontWeight:600}}>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.unit}</td>
                <td>{p.stock.toLocaleString()}</td>
                <td style={{color:"#f97316",fontWeight:600}}>{p.reorder.toLocaleString()}</td>
                <td style={{color:"#f97316",fontWeight:700}}>Rs{p.avgPrice.toLocaleString()}</td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" onClick={()=>openEdit(p)}><Icon name="edit" size={14} color="#f97316"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={edit?"Edit Product":"Add Product"} onClose={()=>setShowForm(false)}>
          <div className="form-grid">
            {[["Product Name","name"],["Category","category"],["Unit","unit"],["Current Stock","stock"],["Reorder Point","reorder"],["Avg. Price (PKR)","avgPrice"]].map(([l,k])=>(
              <div key={k} className="form-group">
                <label>{l}</label>
                <input value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={l}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:22}}>
            <button className="btn-primary" style={{flex:1}} onClick={handleSave}>Save Product</button>
            <button className="btn-outline" style={{flex:1}} onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
