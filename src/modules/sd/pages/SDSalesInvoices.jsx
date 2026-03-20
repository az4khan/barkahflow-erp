import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?720:460,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function SDSalesInvoices(){
  const {salesInvoices,recordSalesPayment} = useApp();
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('All');
  const [dateFrom,setDateFrom]=useState('');
  const [dateTo,setDateTo]=useState('');
  const [viewInv,setViewInv]=useState(null);
  const [paying,setPaying]=useState(null);
  const [payAmt,setPayAmt]=useState('');
  const [page,setPage]=useState(1);
  const PER=12;

  const invs=salesInvoices||[];
  const filtered=useMemo(()=>invs.filter(i=>{
    const q=search.toLowerCase();
    const outstanding=(i.grandTotal||0)-(i.paidAmount||0);
    const status=outstanding<=0?'paid':i.paidAmount>0?'partial':'unpaid';
    return(filter==='All'||status===filter)&&(!search||(i.id||'').toLowerCase().includes(q)||(i.partyName||'').toLowerCase().includes(q))&&(!dateFrom||i.date>=dateFrom)&&(!dateTo||i.date<=dateTo);
  }),[invs,filter,search,dateFrom,dateTo]);

  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalInv=invs.reduce((s,i)=>s+(i.grandTotal||0),0);
  const totalPaid=invs.reduce((s,i)=>s+(i.paidAmount||0),0);
  const outstanding=totalInv-totalPaid;
  const totalGP=invs.reduce((s,i)=>s+((i.subTotal||0)-(i.cogsTotal||0)),0);

  function handlePay(){
    const amt=parseFloat(payAmt)||0;
    if(!amt||!paying)return;
    recordSalesPayment(paying.id,amt);
    setPaying(null);setPayAmt('');
  }

  function invStatus(i){
    const out=(i.grandTotal||0)-(i.paidAmount||0);
    if(out<=0)return{label:'Paid',cls:'pm-badge-green'};
    if((i.paidAmount||0)>0)return{label:'Partial',cls:'pm-badge-orange'};
    const due=i.dueDate&&new Date(i.dueDate)<new Date()?{label:'Overdue',cls:'pm-badge-red'}:{label:'Unpaid',cls:'pm-badge-blue'};
    return due;
  }

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Sales Invoices</h2><p className="pm-page-sub">Posted invoices — AR, COGS and revenue auto-booked to accounting</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Invoiced',value:fmtPKRsd(totalInv),icon:'invoice',bg:'#f0fdf4',color:ACCENT},{label:'Total Collected',value:fmtPKRsd(totalPaid),icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Outstanding',value:fmtPKRsd(outstanding),icon:'alert',bg:'#fef2f2',color:'#ef4444'},{label:'Gross Profit',value:fmtPKRsd(totalGP),icon:'trending',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:16}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['All','unpaid','partial','paid'].map(f=>(
              <button key={f} onClick={()=>{setFilter(f);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,fontWeight:500,cursor:'pointer',background:filter===f?ACCENT:'#fff',color:filter===f?'#fff':'#6b7280',borderColor:filter===f?ACCENT:'#e5e7eb'}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search invoice or party…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
          <div style={{display:'flex',gap:6}}>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
            <span style={{fontSize:12,color:'#94a3b8',alignSelf:'center'}}>—</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Invoice</th><th>SO Ref</th><th>Date</th><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Grand Total</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No invoices found</td></tr>
              :paged.map(i=>{
                const st=invStatus(i);
                const out=(i.grandTotal||0)-(i.paidAmount||0);
                const tc=TIER_COLOR[i.tier]||'#94a3b8';
                return(<tr key={i.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{i.id}</td>
                  <td style={{color:'#9ca3af',fontFamily:'monospace',fontSize:11}}>{i.soId}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{i.date}</td>
                  <td style={{fontWeight:600}}>{i.partyName}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{i.tier}</span></td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(i.grandTotal)}</td>
                  <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{fmtPKRsd(i.paidAmount)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:out>0?'#ef4444':'#10b981'}}>{fmtPKRsd(out)}</td>
                  <td><span className={`pm-badge ${st.cls}`}>{st.label}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewInv(i)}>View</button>
                      {out>0&&<button className="pm-btn pm-btn-primary" style={{background:ACCENT,padding:'3px 7px',fontSize:11}} onClick={()=>{setPaying(i);setPayAmt('');}}>Collect</button>}
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {viewInv&&(<Modal title={`Invoice: ${viewInv.id}`} onClose={()=>setViewInv(null)} wide>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
          {[['SO Ref',viewInv.soId],['Date',viewInv.date],['Party',viewInv.partyName],['Tier',viewInv.tier],['Sub Total',fmtPKRsd(viewInv.subTotal)],['Tax',fmtPKRsd(viewInv.taxAmount)],['Grand Total',fmtPKRsd(viewInv.grandTotal)],['Paid',fmtPKRsd(viewInv.paidAmount)],['Outstanding',fmtPKRsd((viewInv.grandTotal||0)-(viewInv.paidAmount||0))],['COGS',fmtPKRsd(viewInv.cogsTotal)],['Gross Profit',fmtPKRsd((viewInv.subTotal||0)-(viewInv.cogsTotal||0))],['Due Date',viewInv.dueDate||'—']].map(([l,v])=>(
            <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:12.5,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
          ))}
        </div>
        <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
          <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Sale Price</th><th style={{textAlign:'right'}}>MAP</th><th style={{textAlign:'right'}}>COGS</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
          <tbody>{(viewInv.items||[]).map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right'}}>{it.qty}</td><td style={{textAlign:'right'}}>{fmtPKRsd(it.unitPrice)}</td><td style={{textAlign:'right',color:'#9ca3af'}}>{fmtPKRsd(it.mapPrice)}</td><td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRsd(it.cogs)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(it.total)}</td></tr>)}</tbody>
        </table>
        <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#065f46',marginBottom:12}}>Journal entries auto-booked: Dr AR / Cr Revenue + Dr COGS / Cr Inventory</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          {(viewInv.grandTotal||0)-(viewInv.paidAmount||0)>0&&<button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>{setPaying(viewInv);setPayAmt('');setViewInv(null);}}>Record Collection</button>}
          <button className="pm-btn pm-btn-ghost" onClick={()=>setViewInv(null)}>Close</button>
        </div>
      </Modal>)}

      {paying&&(<Modal title={`Collect Payment — ${paying.id}`} onClose={()=>setPaying(null)}>
        <p style={{fontSize:13,color:'#6b7280',marginBottom:16}}>Party: <strong>{paying.partyName}</strong> · Outstanding: <strong style={{color:'#ef4444'}}>{fmtPKRsd((paying.grandTotal||0)-(paying.paidAmount||0))}</strong></p>
        <div className="pm-form-group" style={{marginBottom:16}}><label>Amount Collected</label><input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder="Enter amount"/></div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="pm-btn pm-btn-outline" onClick={()=>setPaying(null)}>Cancel</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handlePay}>Save Payment</button>
        </div>
      </Modal>)}
    </div>
  );
}
