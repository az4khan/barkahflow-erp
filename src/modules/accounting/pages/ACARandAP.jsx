import { useState } from 'react';
import Icon          from '../../../components/common/Icon';
import { useApp }    from '../../../context/AppContext';
import { fmtPKR }   from '../../../data/mockData';
import { fmtDate }   from '../accountingConstants';

const ACCENT = '#0d9488';

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94a3b8' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ── AR ── */
export function ACAccountsReceivable() {
  const { acAR: ar, setAcAR } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [paying, setPaying] = useState(null);
  const [payAmt, setPayAmt] = useState('');
  const [page,   setPage]   = useState(1);
  const PER = 12;

  const filtered = (ar||[]).filter(i =>
    (filter==='All' || i.status===filter) &&
    ((i.customer||'').toLowerCase().includes(search.toLowerCase()) || (i.id||'').includes(search))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function recordPayment() {
    const amt = parseFloat(payAmt)||0;
    if (!amt || !paying) return;
    setAcAR(p=>(p||[]).map(i => {
      if (i.id!==paying.id) return i;
      const newPaid = Math.min(i.paid+amt, i.amount);
      return { ...i, paid:newPaid, status:newPaid>=i.amount?'Paid':newPaid>0?'Partial':i.status };
    }));
    setPaying(null); setPayAmt('');
  }

  const totalOut  = (ar||[]).filter(i=>i.status!=='Paid').reduce((s,i)=>s+(i.amount-i.paid),0);
  const totalOver = (ar||[]).filter(i=>i.status==='Overdue').reduce((s,i)=>s+(i.amount-i.paid),0);
  const totalColl = (ar||[]).filter(i=>i.status==='Paid').reduce((s,i)=>s+i.amount,0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Accounts Receivable</h2><p className="pm-page-sub">Customer invoices & collections</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Outstanding',  value:fmtPKR(totalOut),  icon:'breakdown', bg:'#f0fdfa', color:ACCENT,    hint:`${(ar||[]).filter(i=>i.status!=='Paid').length} invoices` },
          { label:'Overdue',      value:fmtPKR(totalOver), icon:'alert',     bg:'#fef2f2', color:'#ef4444', hint:`${(ar||[]).filter(i=>i.status==='Overdue').length} invoices` },
          { label:'Collected',    value:fmtPKR(totalColl), icon:'check',     bg:'#f0fdf4', color:'#10b981' },
          { label:'Total AR',     value:fmtPKR((ar||[]).reduce((s,i)=>s+i.amount,0)), icon:'reports', bg:'#eff6ff', color:'#3b82f6' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{s.value}</div>
            {s.hint && <div className="pm-stat-hint">{s.hint}</div>}
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search invoices…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['All','Open','Partial','Overdue','Paid'].map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:filter===f?ACCENT:'#fff', color:filter===f?'#fff':'#6b7280', borderColor:filter===f?ACCENT:'#e5e7eb' }}>{f}</button>
            ))}
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Due</th><th style={{textAlign:'right'}}>Amount</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={9} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No invoices found</td></tr>
              : paged.map(i=>(
                <tr key={i.id}>
                  <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{i.id}</td>
                  <td style={{ fontWeight:600 }}>{i.customer}</td>
                  <td style={{ color:'#9ca3af', fontSize:12 }}>{fmtDate(i.date)}</td>
                  <td style={{ color:i.status==='Overdue'?'#dc2626':'#9ca3af', fontSize:12 }}>{fmtDate(i.due)}</td>
                  <td style={{ textAlign:'right', fontWeight:600 }}>{fmtPKR(i.amount)}</td>
                  <td style={{ textAlign:'right', color:'#16a34a', fontWeight:500 }}>{fmtPKR(i.paid)}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:i.amount-i.paid>0?'#dc2626':'#16a34a' }}>{fmtPKR(i.amount-i.paid)}</td>
                  <td><span className={`pm-badge ${i.status==='Paid'?'pm-badge-green':i.status==='Overdue'?'pm-badge-red':i.status==='Partial'?'pm-badge-orange':'pm-badge-blue'}`}>{i.status}</span></td>
                  <td>{i.status!=='Paid'&&<button className="pm-btn pm-btn-primary" style={{ background:ACCENT, padding:'4px 10px', fontSize:12 }} onClick={()=>{setPaying(i);setPayAmt('');}}>Record</button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px', borderTop:'1px solid #f1f5f9' }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {paying && (
        <Modal title={`Record Payment — ${paying.id}`} onClose={()=>setPaying(null)}>
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>Customer: <strong style={{ color:'#0f172a' }}>{paying.customer}</strong> · Outstanding: <strong style={{ color:'#dc2626' }}>{fmtPKR(paying.amount-paying.paid)}</strong></p>
          <div className="pm-form-group"><label>Payment Amount</label><input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={`Max: ${paying.amount-paying.paid}`}/></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setPaying(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:ACCENT }} onClick={recordPayment}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── AP ── */
export function ACAccountsPayable() {
  const { acAP: ap, setAcAP } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [paying, setPaying] = useState(null);
  const [payAmt, setPayAmt] = useState('');
  const [page,   setPage]   = useState(1);
  const PER = 12;

  const filtered = (ap||[]).filter(b =>
    (filter==='All' || b.status===filter) &&
    ((b.vendor||'').toLowerCase().includes(search.toLowerCase()) || (b.id||'').includes(search))
  );
  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  function payBill() {
    const amt = parseFloat(payAmt)||0;
    if (!amt || !paying) return;
    setAcAP(p=>(p||[]).map(b => {
      if (b.id!==paying.id) return b;
      const newPaid = Math.min(b.paid+amt, b.amount);
      return { ...b, paid:newPaid, status:newPaid>=b.amount?'Paid':newPaid>0?'Partial':b.status };
    }));
    setPaying(null); setPayAmt('');
  }

  const totalOut  = (ap||[]).filter(b=>b.status!=='Paid').reduce((s,b)=>s+(b.amount-b.paid),0);
  const totalOver = (ap||[]).filter(b=>b.status==='Overdue').reduce((s,b)=>s+(b.amount-b.paid),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Accounts Payable</h2><p className="pm-page-sub">Vendor bills & payments — auto-updated from GRN</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Outstanding',  value:fmtPKR(totalOut),  icon:'cart',      bg:'#faf5ff', color:'#7c3aed', hint:`${(ap||[]).filter(b=>b.status!=='Paid').length} bills` },
          { label:'Overdue',      value:fmtPKR(totalOver), icon:'alert',     bg:'#fef2f2', color:'#ef4444', hint:`${(ap||[]).filter(b=>b.status==='Overdue').length} bills` },
          { label:'Paid',         value:fmtPKR((ap||[]).filter(b=>b.status==='Paid').reduce((s,b)=>s+b.amount,0)), icon:'check', bg:'#f0fdf4', color:'#10b981' },
          { label:'Total AP',     value:fmtPKR((ap||[]).reduce((s,b)=>s+b.amount,0)), icon:'reports', bg:'#eff6ff', color:'#3b82f6' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{s.value}</div>
            {s.hint && <div className="pm-stat-hint">{s.hint}</div>}
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search bills…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {['All','Open','Partial','Overdue','Paid'].map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}}
                style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:filter===f?ACCENT:'#fff', color:filter===f?'#fff':'#6b7280', borderColor:filter===f?ACCENT:'#e5e7eb' }}>{f}</button>
            ))}
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Bill</th><th>Vendor</th><th>Date</th><th>Due</th><th style={{textAlign:'right'}}>Amount</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={9} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No bills found</td></tr>
              : paged.map(b=>(
                <tr key={b.id}>
                  <td style={{ fontWeight:700, color:'#7c3aed', fontFamily:'monospace' }}>{b.id}</td>
                  <td style={{ fontWeight:600 }}>{b.vendor}</td>
                  <td style={{ color:'#9ca3af', fontSize:12 }}>{fmtDate(b.date)}</td>
                  <td style={{ color:b.status==='Overdue'?'#dc2626':'#9ca3af', fontSize:12 }}>{fmtDate(b.due)}</td>
                  <td style={{ textAlign:'right', fontWeight:600 }}>{fmtPKR(b.amount)}</td>
                  <td style={{ textAlign:'right', color:'#16a34a', fontWeight:500 }}>{fmtPKR(b.paid)}</td>
                  <td style={{ textAlign:'right', fontWeight:600, color:b.amount-b.paid>0?'#dc2626':'#16a34a' }}>{fmtPKR(b.amount-b.paid)}</td>
                  <td><span className={`pm-badge ${b.status==='Paid'?'pm-badge-green':b.status==='Overdue'?'pm-badge-red':b.status==='Partial'?'pm-badge-orange':'pm-badge-blue'}`}>{b.status}</span></td>
                  <td>{b.status!=='Paid'&&<button className="pm-btn pm-btn-primary" style={{ background:'#7c3aed', padding:'4px 10px', fontSize:12 }} onClick={()=>{setPaying(b);setPayAmt('');}}>Pay</button>}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px', borderTop:'1px solid #f1f5f9' }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {paying && (
        <Modal title={`Pay Bill — ${paying.id}`} onClose={()=>setPaying(null)}>
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>Vendor: <strong style={{ color:'#0f172a' }}>{paying.vendor}</strong> · Due: <strong style={{ color:'#dc2626' }}>{fmtPKR(paying.amount-paying.paid)}</strong></p>
          <div className="pm-form-group"><label>Payment Amount</label><input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder={`Max: ${paying.amount-paying.paid}`}/></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setPaying(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{ background:'#7c3aed' }} onClick={payBill}>Save Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
