// ─── Accounts Receivable & Payable ───────────────────────────────────────────
import { useState } from "react";
import Icon         from "../../components/common/Icon";
import { Modal, StatCard, StatusBadge, SearchBox } from "../../components/common/UI";
import { fmtPKR }   from "../../data/mockData";
import { fmtDate }  from "./accountingConstants";

/* ── AR ──────────────────────────────────────────────────────────────────────── */
export function ACAccountsReceivable({ ar, setAr }) {
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");
  const [paying,  setPaying]  = useState(null);
  const [payAmt,  setPayAmt]  = useState("");

  const filtered = ar.filter(i =>
    (filter==="All" || i.status===filter) &&
    (i.customer.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search))
  );

  const recordPayment = () => {
    const amt = parseFloat(payAmt)||0;
    if (!amt || !paying) return;
    setAr(p=>p.map(i => {
      if (i.id!==paying.id) return i;
      const newPaid = Math.min(i.paid+amt, i.amount);
      return { ...i, paid:newPaid, status:newPaid>=i.amount?"Paid":newPaid>0?"Partial":i.status };
    }));
    setPaying(null); setPayAmt("");
  };

  const totalOut  = ar.filter(i=>i.status!=="Paid").reduce((s,i)=>s+(i.amount-i.paid),0);
  const totalOver = ar.filter(i=>i.status==="Overdue").reduce((s,i)=>s+(i.amount-i.paid),0);
  const totalColl = ar.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0);

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Accounts Receivable</h1><p className="ac-page-sub">Customer invoices & collections</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-outline ac-btn-sm"><Icon name="download" size={13}/> Export</button>
        </div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="breakdown" iconBg="#f0fdfa" iconColor="#0d9488" label="Outstanding"  value={fmtPKR(totalOut)} sub={`${ar.filter(i=>i.status!=="Paid").length} invoices`} />
        <StatCard icon="alert"     iconBg="#fef2f2" iconColor="#ef4444" label="Overdue"      value={fmtPKR(totalOver)} sub={`${ar.filter(i=>i.status==="Overdue").length} invoices`} />
        <StatCard icon="check"     iconBg="#f0fdf4" iconColor="#10b981" label="Collected"    value={fmtPKR(totalColl)} />
        <StatCard icon="reports"   iconBg="#eff6ff" iconColor="#3b82f6" label="Total AR"     value={fmtPKR(ar.reduce((s,i)=>s+i.amount,0))} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div className="ac-filter-bar" style={{ margin:0 }}>
          {["All","Open","Partial","Overdue","Paid"].map(f=>(
            <button key={f} className={`ac-filter-pill${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search invoices..." />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header"><div className="ac-table-title">Invoices ({filtered.length})</div></div>
        <table className="ac-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Due</th><th className="right">Amount</th><th className="right">Paid</th><th className="right">Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No invoices found</td></tr>
              : filtered.map(i=>(
                <tr key={i.id}>
                  <td className="primary">{i.id}</td>
                  <td className="bold">{i.customer}</td>
                  <td className="muted">{fmtDate(i.date)}</td>
                  <td style={{ color:i.status==="Overdue"?"#dc2626":"#6b7280", fontSize:13 }}>{fmtDate(i.due)}</td>
                  <td className="right bold">{fmtPKR(i.amount)}</td>
                  <td className="right" style={{ color:"#16a34a", fontWeight:500 }}>{fmtPKR(i.paid)}</td>
                  <td className="right" style={{ color:i.amount-i.paid>0?"#dc2626":"#16a34a", fontWeight:600 }}>{fmtPKR(i.amount-i.paid)}</td>
                  <td><StatusBadge status={i.status}/></td>
                  <td>{i.status!=="Paid"&&<button className="ac-btn ac-btn-primary ac-btn-sm" onClick={()=>{setPaying(i);setPayAmt("");}}>Record</button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {paying && (
        <Modal title={`Record Payment — ${paying.id}`} onClose={()=>setPaying(null)} size="sm">
          <p style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>Customer: <strong style={{ color:"#111827" }}>{paying.customer}</strong> · Outstanding: <strong style={{ color:"#dc2626" }}>{fmtPKR(paying.amount-paying.paid)}</strong></p>
          <div className="ac-form-group">
            <label>Payment Amount</label>
            <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={`Max: ${paying.amount-paying.paid}`}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setPaying(null)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={recordPayment}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── AP ──────────────────────────────────────────────────────────────────────── */
export function ACAccountsPayable({ ap, setAp }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [paying, setPaying] = useState(null);
  const [payAmt, setPayAmt] = useState("");

  const filtered = ap.filter(b =>
    (filter==="All" || b.status===filter) &&
    (b.vendor.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search))
  );

  const payBill = () => {
    const amt = parseFloat(payAmt)||0;
    if (!amt || !paying) return;
    setAp(p=>p.map(b => {
      if (b.id!==paying.id) return b;
      const newPaid = Math.min(b.paid+amt, b.amount);
      return { ...b, paid:newPaid, status:newPaid>=b.amount?"Paid":newPaid>0?"Partial":b.status };
    }));
    setPaying(null); setPayAmt("");
  };

  const totalOut  = ap.filter(b=>b.status!=="Paid").reduce((s,b)=>s+(b.amount-b.paid),0);
  const totalOver = ap.filter(b=>b.status==="Overdue").reduce((s,b)=>s+(b.amount-b.paid),0);

  return (
    <div className="ac-page">
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Accounts Payable</h1><p className="ac-page-sub">Vendor bills & payments</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-outline ac-btn-sm"><Icon name="download" size={13}/> Export</button>
        </div>
      </div>

      <div className="ac-stat-grid" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        <StatCard icon="cart"    iconBg="#faf5ff" iconColor="#7c3aed" label="Outstanding"  value={fmtPKR(totalOut)} sub={`${ap.filter(b=>b.status!=="Paid").length} bills`} />
        <StatCard icon="alert"   iconBg="#fef2f2" iconColor="#ef4444" label="Overdue"      value={fmtPKR(totalOver)} sub={`${ap.filter(b=>b.status==="Overdue").length} bills`} />
        <StatCard icon="check"   iconBg="#f0fdf4" iconColor="#10b981" label="Paid"         value={fmtPKR(ap.filter(b=>b.status==="Paid").reduce((s,b)=>s+b.amount,0))} />
        <StatCard icon="reports" iconBg="#eff6ff" iconColor="#3b82f6" label="Total AP"     value={fmtPKR(ap.reduce((s,b)=>s+b.amount,0))} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div className="ac-filter-bar" style={{ margin:0 }}>
          {["All","Open","Partial","Overdue","Paid"].map(f=>(
            <button key={f} className={`ac-filter-pill${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <SearchBox value={search} onChange={setSearch} placeholder="Search bills..." />
      </div>

      <div className="ac-table-wrap">
        <div className="ac-table-header"><div className="ac-table-title">Bills ({filtered.length})</div></div>
        <table className="ac-table">
          <thead><tr><th>Bill</th><th>Vendor</th><th>Date</th><th>Due</th><th className="right">Amount</th><th className="right">Paid</th><th className="right">Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"#9ca3af" }}>No bills found</td></tr>
              : filtered.map(b=>(
                <tr key={b.id}>
                  <td className="primary">{b.id}</td>
                  <td className="bold">{b.vendor}</td>
                  <td className="muted">{fmtDate(b.date)}</td>
                  <td style={{ color:b.status==="Overdue"?"#dc2626":"#6b7280", fontSize:13 }}>{fmtDate(b.due)}</td>
                  <td className="right bold">{fmtPKR(b.amount)}</td>
                  <td className="right" style={{ color:"#16a34a", fontWeight:500 }}>{fmtPKR(b.paid)}</td>
                  <td className="right" style={{ color:b.amount-b.paid>0?"#dc2626":"#16a34a", fontWeight:600 }}>{fmtPKR(b.amount-b.paid)}</td>
                  <td><StatusBadge status={b.status}/></td>
                  <td>{b.status!=="Paid"&&<button className="ac-btn ac-btn-primary ac-btn-sm" onClick={()=>{setPaying(b);setPayAmt("");}}>Pay</button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {paying && (
        <Modal title={`Pay Bill — ${paying.id}`} onClose={()=>setPaying(null)} size="sm">
          <p style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>Vendor: <strong style={{ color:"#111827" }}>{paying.vendor}</strong> · Due: <strong style={{ color:"#dc2626" }}>{fmtPKR(paying.amount-paying.paid)}</strong></p>
          <div className="ac-form-group">
            <label>Payment Amount</label>
            <input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={`Max: ${paying.amount-paying.paid}`}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:20 }}>
            <button className="ac-btn ac-btn-ghost" onClick={()=>setPaying(null)}>Cancel</button>
            <button className="ac-btn ac-btn-primary" onClick={payBill}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
