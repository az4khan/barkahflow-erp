import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#f97316';
const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;
const REFUND_REASONS = ['Customer Request','Defective Product','Wrong Item','Duplicate Sale','Other'];

export default function POSRefunds() {
  const { posSales, posTerminals, posSessions, voidPosSale, toast } = useApp();
  const [search,      setSearch]      = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [selectedSale,setSelectedSale]= useState(null);
  const [reason,      setReason]      = useState('Customer Request');
  const [note,        setNote]        = useState('');
  const [page,        setPage]        = useState(1);
  const PER = 12;

  const sales    = posSales    || [];
  const terms    = posTerminals|| [];
  const sessions = posSessions || [];

  // Voided sales are refunds
  const refunds  = sales.filter(s=>s.status==='voided').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  // Eligible for refund: posted sales
  const eligible = sales.filter(s=>s.status==='posted').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const filtered = eligible.filter(s=>{
    const q=search.toLowerCase();
    return !search||(s.id||'').toLowerCase().includes(q)||(terms.find(t=>t.id===s.terminalId)?.name||'').toLowerCase().includes(q);
  });

  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalRefunded=refunds.reduce((s,x)=>s+(x.grandTotal||0),0);

  function handleVoid() {
    if(!selectedSale){toast('Select a sale to void','error');return;}
    voidPosSale(selectedSale.id);
    setShowForm(false);setSelectedSale(null);setReason('Customer Request');setNote('');
    toast(`Sale ${selectedSale.id} voided — refund recorded`,'success');
  }

  function termName(id) { return terms.find(t=>t.id===id)?.name||id; }
  function cashierName(sessId) { return sessions.find(s=>s.id===sessId)?.cashierName||'—'; }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Refunds</h2><p className="pm-page-sub">Void sales and process customer refunds with reason tracking</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> Process Refund</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Refunds',value:refunds.length,icon:'purchase',bg:'#fef2f2',color:'#ef4444'},{label:'Total Refunded',value:fmtPKR(totalRefunded),icon:'briefcase',bg:'#fef2f2',color:'#ef4444'},{label:'Eligible Sales',value:eligible.length,icon:'invoice',bg:'#fff7ed',color:ACCENT},{label:'Today Refunds',value:refunds.filter(r=>r.date===new Date().toISOString().slice(0,10)).length,icon:'trending',bg:'#f8fafc',color:'#94a3b8'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Refund history */}
      {refunds.length>0&&(
        <div className="pm-table-wrap" style={{marginBottom:14}}>
          <div className="pm-table-header"><div className="pm-table-title">Refund History ({refunds.length})</div></div>
          <table className="pm-table">
            <thead><tr><th>Sale ID</th><th>Date</th><th>Terminal</th><th>Cashier</th><th>Items</th><th style={{textAlign:'right'}}>Refunded</th><th>Status</th></tr></thead>
            <tbody>
              {refunds.slice(0,10).map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:700,color:'#ef4444',fontFamily:'monospace',fontSize:11}}>{s.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{s.date}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{termName(s.terminalId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{cashierName(s.sessionId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{(s.items||[]).length}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#ef4444'}}>{fmtPKR(s.grandTotal)}</td>
                  <td><span className="pm-badge pm-badge-red">Voided</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sales eligible for refund */}
      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div className="pm-table-title">Sales Eligible for Refund ({filtered.length})</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search by ID or terminal…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Sale ID</th><th>Date</th><th>Terminal</th><th>Cashier</th><th>Items</th><th style={{textAlign:'right'}}>Amount</th><th>Payment</th><th>Action</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No posted sales found</td></tr>
              :paged.map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{s.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{s.date}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{termName(s.terminalId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{cashierName(s.sessionId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{(s.items||[]).length} items</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(s.grandTotal)}</td>
                  <td style={{fontSize:12}}>{s.paymentMethod}</td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11,color:'#ef4444',border:'1px solid #fecaca'}} onClick={()=>{setSelectedSale(s);setShowForm(true);}}>Refund</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,.25)',overflow:'hidden'}}>
            <div style={{background:'#ef4444',padding:'16px 20px'}}>
              <div style={{fontSize:16,fontWeight:800,color:'#fff'}}>Process Refund</div>
              {selectedSale&&<div style={{fontSize:12,color:'rgba(255,255,255,0.8)',marginTop:2}}>{selectedSale.id} · {fmtPKR(selectedSale.grandTotal)}</div>}
            </div>
            <div style={{padding:24}}>
              {!selectedSale&&(
                <div className="pm-form-group" style={{marginBottom:16}}>
                  <label>Select Sale to Refund</label>
                  <select onChange={e=>{const s=sales.find(x=>x.id===e.target.value);setSelectedSale(s||null);}}>
                    <option value="">— Select —</option>
                    {eligible.slice(0,20).map(s=><option key={s.id} value={s.id}>{s.id} · {s.date} · {fmtPKR(s.grandTotal)}</option>)}
                  </select>
                </div>
              )}
              {selectedSale&&(
                <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
                  {(selectedSale.items||[]).map((it,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'3px 0'}}><span>{it.materialName} × {it.qty}</span><span style={{fontWeight:600}}>{fmtPKR(it.total)}</span></div>
                  ))}
                  <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,borderTop:'1px solid #fecaca',paddingTop:8,marginTop:6}}><span>Total to Refund</span><span style={{color:'#ef4444'}}>{fmtPKR(selectedSale.grandTotal)}</span></div>
                </div>
              )}
              <div className="pm-form-group" style={{marginBottom:12}}><label>Refund Reason</label><select value={reason} onChange={e=>setReason(e.target.value)}>{REFUND_REASONS.map(r=><option key={r}>{r}</option>)}</select></div>
              <div className="pm-form-group" style={{marginBottom:20}}><label>Note</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Additional details"/></div>
              <div style={{display:'flex',gap:8}}>
                <button className="pm-btn pm-btn-ghost" style={{flex:1}} onClick={()=>{setShowForm(false);setSelectedSale(null);}}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{flex:2,background:'#ef4444'}} onClick={handleVoid} disabled={!selectedSale}>Confirm Refund</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
