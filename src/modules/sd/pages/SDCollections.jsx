import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';
const PAY_METHODS = ['Cash','Cheque','Bank Transfer','Online'];

export default function SDCollections() {
  const { salesInvoices, sdParties, recordSalesPayment, toast } = useApp();
  const [paying,  setPaying]  = useState(null);
  const [payAmt,  setPayAmt]  = useState('');
  const [payRef,  setPayRef]  = useState('');
  const [payMeth, setPayMeth] = useState('Cash');
  const [tierF,   setTierF]   = useState('All');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const invs = salesInvoices || [];
  const pts  = sdParties     || [];

  // Outstanding invoices only
  const outstanding = invs.filter(i=>(i.grandTotal||0)-(i.paidAmount||0)>0).map(i=>{
    const party=pts.find(p=>p.id===i.partyId);
    const due=(i.grandTotal||0)-(i.paidAmount||0);
    const isOverdue=i.dueDate&&new Date(i.dueDate)<new Date();
    return{...i,tier:party?.tier||i.tier,outstanding:due,isOverdue};
  });

  const filtered=outstanding.filter(i=>(tierF==='All'||i.tier===tierF)&&(!search||(i.id||'').toLowerCase().includes(search.toLowerCase())||(i.partyName||'').toLowerCase().includes(search.toLowerCase())));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalOutstanding=outstanding.reduce((s,i)=>s+i.outstanding,0);
  const overdue=outstanding.filter(i=>i.isOverdue);
  const totalOverdue=overdue.reduce((s,i)=>s+i.outstanding,0);
  const TIERS=['All','Wholesaler','Retailer','Shop','Consumer'];

  function handleCollect(){
    const amt=parseFloat(payAmt)||0;
    if(!amt||!paying){toast('Enter a valid amount','error');return;}
    if(amt>paying.outstanding){toast(`Max collectible: ${fmtPKRsd(paying.outstanding)}`,'error');return;}
    recordSalesPayment(paying.id,amt);
    setPaying(null);setPayAmt('');setPayRef('');setPayMeth('Cash');
  }

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Collections</h2><p className="pm-page-sub">Collect outstanding receivables — AR updated in real-time</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Outstanding',value:fmtPKRsd(totalOutstanding),icon:'breakdown',bg:'#fffbeb',color:'#f59e0b'},{label:'Overdue',value:fmtPKRsd(totalOverdue),icon:'alert',bg:'#fef2f2',color:'#ef4444'},{label:'Invoices Pending',value:outstanding.length,icon:'invoice',bg:'#eff6ff',color:'#3b82f6'},{label:'Overdue Count',value:overdue.length,icon:'bell',bg:'#fef2f2',color:'#ef4444'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {TIERS.map(t=><button key={t} onClick={()=>{setTierF(t);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,fontWeight:500,cursor:'pointer',background:tierF===t?ACCENT:'#fff',color:tierF===t?'#fff':'#6b7280',borderColor:tierF===t?ACCENT:'#e5e7eb'}}>{t}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search invoice or party…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Due Date</th><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Invoice Amt</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Outstanding</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No outstanding invoices</td></tr>
              :paged.map(i=>{
                const tc=TIER_COLOR[i.tier]||'#94a3b8';
                return(<tr key={i.id} style={{background:i.isOverdue?'#fff8f8':undefined}}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{i.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{i.date}</td>
                  <td style={{color:i.isOverdue?'#ef4444':'#9ca3af',fontWeight:i.isOverdue?700:400,fontSize:12}}>{i.dueDate||'—'}</td>
                  <td style={{fontWeight:600}}>{i.partyName}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{i.tier}</span></td>
                  <td style={{textAlign:'right'}}>{fmtPKRsd(i.grandTotal)}</td>
                  <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{fmtPKRsd(i.paidAmount)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:i.isOverdue?'#ef4444':'#f59e0b'}}>{fmtPKRsd(i.outstanding)}</td>
                  <td><span className={`pm-badge ${i.isOverdue?'pm-badge-red':'pm-badge-orange'}`}>{i.isOverdue?'Overdue':'Pending'}</span></td>
                  <td><button className="pm-btn pm-btn-primary" style={{background:ACCENT,padding:'3px 10px',fontSize:12}} onClick={()=>{setPaying(i);setPayAmt(String(i.outstanding));}}>Collect</button></td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {paying&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>Collect Payment</h3>
              <button onClick={()=>setPaying(null)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div style={{background:'#f0fdf4',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>Invoice: <strong style={{color:'#0f172a'}}>{paying.id}</strong></div>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>Party: <strong style={{color:'#0f172a'}}>{paying.partyName}</strong></div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                  <span style={{fontSize:13}}>Outstanding:</span>
                  <span style={{fontSize:16,fontWeight:800,color:'#ef4444'}}>{fmtPKRsd(paying.outstanding)}</span>
                </div>
              </div>
              <div className="pm-form-group" style={{marginBottom:12}}><label>Amount to Collect *</label><input type="number" value={payAmt} onChange={e=>setPayAmt(e.target.value)} placeholder="0" autoFocus style={{fontSize:18,fontWeight:700}}/></div>
              <div className="pm-form-group" style={{marginBottom:12}}><label>Payment Method</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {PAY_METHODS.map(m=><button key={m} onClick={()=>setPayMeth(m)} style={{padding:'6px 12px',borderRadius:8,border:'2px solid',fontSize:12,fontWeight:600,cursor:'pointer',background:payMeth===m?ACCENT:'#fff',color:payMeth===m?'#fff':'#374151',borderColor:payMeth===m?ACCENT:'#e2e8f0'}}>{m}</button>)}
                </div>
              </div>
              <div className="pm-form-group" style={{marginBottom:20}}><label>Reference (Cheque No / TRN)</label><input value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="Optional"/></div>
              <div style={{display:'flex',gap:8}}>
                <button className="pm-btn pm-btn-outline" style={{flex:1}} onClick={()=>setPaying(null)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{flex:2,background:ACCENT}} onClick={handleCollect}>✓ Record Collection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
