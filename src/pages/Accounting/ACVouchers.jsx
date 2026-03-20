// ─── Vouchers ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import Icon         from "../../components/common/Icon";
import { Modal, StatCard, StatusBadge, SearchBox } from "../../components/common/UI";
import { fmtPKR }   from "../../data/mockData";
import { fmtDate }  from "./accountingConstants";

export default function ACVouchers({ vouchers, setVouchers, accounts }) {
  const [tab,     setTab]     = useState("All");
  const [search,  setSearch]  = useState("");
  const [viewing, setViewing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [vType,   setVType]   = useState("Payment");
  const [form,    setForm]    = useState(emptyForm());

  function emptyForm() { return { payee:"", account:"", amount:"", description:"", ref:"", date:"" }; }

  const filtered = vouchers.filter(v =>
    (tab==="All" || v.type===tab) &&
    (v.payee.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()))
  );

  const saveVoucher = () => {
    if (!form.date || !form.payee || !form.amount) return;
    const prefix = vType==="Payment"?"PV":"RV";
    const existing = vouchers.filter(v=>v.id.startsWith(prefix));
    const newId = `${prefix}-${String(existing.length+1).padStart(3,"0")}`;
    const acc = accounts.find(a=>a.id===form.account);
    setVouchers(p=>[{
      id:newId, type:vType, date:form.date, payee:form.payee,
      account:form.account, accountName:acc?.name||"", amount:parseFloat(form.amount)||0,
      description:form.description, ref:form.ref, status:"Draft",
    },...p]);
    setShowNew(false); setForm(emptyForm());
  };

  const approve = (id) => setVouchers(p=>p.map(v=>v.id===id?{...v,status:"Approved"}:v));

  const pvCount = vouchers.filter(v=>v.type==="Payment").reduce((s,v)=>s+v.amount,0);
  const rvCount = vouchers.filter(v=>v.type==="Receipt").reduce((s,v)=>s+v.amount,0);

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Vouchers</h1><p className="ac-page-sub">Payment & Receipt vouchers</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-outline ac-btn-sm" onClick={()=>{setVType("Receipt");setShowNew(true);}}>+ Receipt</button>
          <button className="ac-btn ac-btn-primary" onClick={()=>{setVType("Payment");setShowNew(true);}}>
            <Icon name="plus" size={14} color="#fff"/> Payment
          </button>
        </div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="invoice"   iconBg="#f0fdfa" iconColor="#0d9488" label="Total Vouchers"    value={vouchers.length} />
        <StatCard icon="cart"      iconBg="#fef2f2" iconColor="#ef4444" label="Total Payments"    value={fmtPKR(pvCount)} />
        <StatCard icon="briefcase" iconBg="#f0fdf4" iconColor="#10b981" label="Total Receipts"    value={fmtPKR(rvCount)} />
        <StatCard icon="check"     iconBg="#eff6ff" iconColor="#3b82f6" label="Approved"          value={vouchers.filter(v=>v.status==="Approved").length} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div className="ac-tab-bar" style={{ marginBottom:0, border:"none" }}>
          {["All","Payment","Receipt"].map(t=>(
            <button key={t} className={`ac-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search vouchers..." />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header">
          <div className="ac-table-title">Vouchers <span style={{ color:"#94a3b8", fontWeight:400 }}>({filtered.length})</span></div>
        </div>
        <table className="ac-table">
          <thead><tr><th>ID</th><th>Type</th><th>Date</th><th>Payee / Payer</th><th>Account</th><th className="right">Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No vouchers found</td></tr>
              : filtered.map(v=>(
                <tr key={v.id}>
                  <td className="primary">{v.id}</td>
                  <td><span className={`ac-badge ${v.type==="Payment"?"ac-badge-red":"ac-badge-green"}`}>{v.type}</span></td>
                  <td className="muted">{fmtDate(v.date)}</td>
                  <td className="bold">{v.payee}</td>
                  <td className="muted">{v.accountName}</td>
                  <td className="right" style={{ fontWeight:600, color:v.type==="Payment"?"#dc2626":"#16a34a" }}>{fmtPKR(v.amount)}</td>
                  <td><StatusBadge status={v.status}/></td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={()=>setViewing(v)}>View</button>
                      {v.status==="Draft" && <button className="ac-btn ac-btn-success ac-btn-sm" onClick={()=>approve(v.id)}>Approve</button>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {viewing && (
        <Modal title={`${viewing.type} Voucher: ${viewing.id}`} onClose={()=>setViewing(null)} size="md">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[["Voucher ID",viewing.id],["Type",viewing.type],["Date",fmtDate(viewing.date)],["Status",viewing.status],["Payee / Payer",viewing.payee],["Account",viewing.accountName],["Reference",viewing.ref||"—"],["Amount",fmtPKR(viewing.amount)]].map(([l,v])=>(
              <div key={l}><div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, marginBottom:3 }}>{l}</div><div style={{ fontSize:13.5, color:"#111827", fontWeight:500 }}>{v}</div></div>
            ))}
            <div style={{ gridColumn:"1/-1" }}><div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, marginBottom:3 }}>Description</div><div style={{ fontSize:13.5, color:"#374151" }}>{viewing.description||"—"}</div></div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setViewing(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showNew && (
        <Modal title={`New ${vType} Voucher`} onClose={()=>setShowNew(false)} size="md">
          <div className="ac-form-grid ac-form-grid-2">
            <div className="ac-form-group"><label>Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="ac-form-group"><label>{vType==="Payment"?"Payee":"Payer"} *</label><input value={form.payee} onChange={e=>setForm(f=>({...f,payee:e.target.value}))} placeholder="Name"/></div>
            <div className="ac-form-group"><label>Account *</label><select value={form.account} onChange={e=>setForm(f=>({...f,account:e.target.value}))}><option value="">— Select —</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}</select></div>
            <div className="ac-form-group"><label>Amount *</label><input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0"/></div>
            <div className="ac-form-group"><label>Reference</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="Bill/Invoice no."/></div>
            <div className="ac-form-group ac-form-full"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Payment details"/></div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={saveVoucher}>Save Draft</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
