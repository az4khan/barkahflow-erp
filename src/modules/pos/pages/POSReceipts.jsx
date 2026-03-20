import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#f97316';
const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;

export default function POSReceipts() {
  const { posSales, posSessions, posTerminals, voidPosSale, toast } = useApp();
  const [search,   setSearch]   = useState('');
  const [dateF,    setDateF]    = useState('');
  const [methodF,  setMethodF]  = useState('All');
  const [viewSale, setViewSale] = useState(null);
  const [page,     setPage]     = useState(1);
  const PER = 15;

  const sales    = posSales    || [];
  const sessions = posSessions || [];
  const terms    = posTerminals|| [];

  const filtered = sales.filter(s=>{
    const q=search.toLowerCase();
    return s.status==='posted'&&
      (methodF==='All'||s.paymentMethod===methodF)&&
      (!dateF||s.date===dateF)&&
      (!search||(s.id||'').toLowerCase().includes(q)||(s.terminalId||'').toLowerCase().includes(q));
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalRevenue=filtered.reduce((s,x)=>s+(x.grandTotal||0),0);
  const methods=[...new Set(sales.map(s=>s.paymentMethod).filter(Boolean))];

  function sessionName(sessId) { return sessions.find(s=>s.id===sessId)?.cashierName||'—'; }
  function termName(termId)    { return terms.find(t=>t.id===termId)?.name||termId; }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">POS Receipts</h2><p className="pm-page-sub">All posted sales transactions with receipt detail</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Receipts',value:filtered.length,icon:'invoice',bg:'#fff7ed',color:ACCENT},{label:'Total Revenue',value:fmtPKR(totalRevenue),icon:'trending',bg:'#fff7ed',color:ACCENT},{label:'Cash Sales',value:fmtPKR(filtered.filter(s=>s.paymentMethod==='Cash').reduce((a,s)=>a+(s.grandTotal||0),0)),icon:'store',bg:'#f0fdf4',color:'#10b981'},{label:'Card Sales',value:fmtPKR(filtered.filter(s=>s.paymentMethod==='Card').reduce((a,s)=>a+(s.grandTotal||0),0)),icon:'briefcase',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search receipt ID…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
          <input type="date" value={dateF} onChange={e=>{setDateF(e.target.value);setPage(1);}} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
          {dateF&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>setDateF('')}>✕</button>}
          <div style={{display:'flex',gap:4}}>
            {['All',...methods].map(m=><button key={m} onClick={()=>{setMethodF(m);setPage(1);}} style={{padding:'5px 10px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:methodF===m?ACCENT:'#fff',color:methodF===m?'#fff':'#6b7280',borderColor:methodF===m?ACCENT:'#e5e7eb'}}>{m}</button>)}
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>Receipt ID</th><th>Date</th><th>Time</th><th>Terminal</th><th>Cashier</th><th>Items</th><th style={{textAlign:'right'}}>Amount</th><th>Payment</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No receipts found</td></tr>
              :paged.map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{s.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{s.date}</td>
                  <td style={{color:'#9ca3af',fontSize:11}}>{s.createdAt?new Date(s.createdAt).toLocaleTimeString():''}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{termName(s.terminalId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{sessionName(s.sessionId)}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{(s.items||[]).length} item{(s.items||[]).length!==1?'s':''}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(s.grandTotal)}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:s.paymentMethod==='Cash'?'#f0fdf4':s.paymentMethod==='Card'?'#eff6ff':'#f5f3ff',color:s.paymentMethod==='Cash'?'#10b981':s.paymentMethod==='Card'?'#3b82f6':'#8b5cf6'}}>{s.paymentMethod}</span></td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setViewSale(s)}>View</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {/* Receipt detail modal */}
      {viewSale&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,.25)',overflow:'hidden'}}>
            <div style={{background:ACCENT,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:'#fff'}}>{viewSale.id}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.8)'}}>{viewSale.date} · {viewSale.createdAt?new Date(viewSale.createdAt).toLocaleTimeString():''}</div>
              </div>
              <button onClick={()=>setViewSale(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',cursor:'pointer',color:'#fff',fontSize:20,borderRadius:6,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
            <div style={{padding:20}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                {[['Terminal',termName(viewSale.terminalId)],['Cashier',sessionName(viewSale.sessionId)],['Payment',viewSale.paymentMethod],['Change',fmtPKR(viewSale.change)]].map(([l,v])=>(
                  <div key={l} style={{background:'#f8fafc',borderRadius:7,padding:'8px 10px'}}><div style={{fontSize:10,color:'#94a3b8'}}>{l}</div><div style={{fontSize:12.5,fontWeight:600}}>{v}</div></div>
                ))}
              </div>
              <div style={{borderTop:'1px dashed #e2e8f0',paddingTop:12,marginBottom:12}}>
                {(viewSale.items||[]).map((it,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:13,borderBottom:'1px solid #f8fafc'}}>
                    <span>{it.materialName} × {it.qty}</span>
                    <span style={{fontWeight:600}}>{fmtPKR(it.total)}</span>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:16,borderTop:'1px solid #e2e8f0',paddingTop:10,marginBottom:16}}>
                <span>Total</span><span style={{color:ACCENT}}>{fmtPKR(viewSale.grandTotal)}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="pm-btn pm-btn-outline" style={{flex:1}} onClick={()=>setViewSale(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
