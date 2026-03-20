import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

export default function SDPartyLedger() {
  const { sdParties, salesInvoices, salesReturns } = useApp();
  const [selectedParty, setSelectedParty] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [search,   setSearch]   = useState('');

  const pts  = (sdParties||[]).filter(p=>p.status==='active');
  const invs = salesInvoices || [];
  const rets = salesReturns  || [];

  const party = pts.find(p=>p.id===selectedParty);

  // Build ledger for selected party
  const ledger = useMemo(() => {
    if (!selectedParty) return [];
    const entries = [];
    invs.filter(i=>i.partyId===selectedParty).forEach(i=>{
      entries.push({ id:i.id, date:i.date, type:'Invoice', ref:i.soId, debit:i.grandTotal||0, credit:0, balance:0 });
      if ((i.paidAmount||0)>0) entries.push({ id:`PMT-${i.id}`, date:i.date, type:'Payment', ref:i.id, debit:0, credit:i.paidAmount||0, balance:0 });
    });
    rets.filter(r=>r.partyId===selectedParty).forEach(r=>{
      entries.push({ id:r.id, date:r.date, type:'Return/Credit', ref:r.invoiceId||'', debit:0, credit:r.subTotal||0, balance:0 });
    });
    // Sort by date
    entries.sort((a,b)=>new Date(a.date)-new Date(b.date));
    // Running balance
    let bal=0;
    entries.forEach(e=>{ bal+=e.debit-e.credit; e.balance=bal; });
    return entries;
  }, [selectedParty, invs, rets]);

  const filtered = ledger.filter(e=>
    (!dateFrom||e.date>=dateFrom)&&(!dateTo||e.date<=dateTo)&&
    (!search||(e.id||'').toLowerCase().includes(search.toLowerCase())||(e.type||'').toLowerCase().includes(search.toLowerCase()))
  );

  const totalDebit  = filtered.reduce((s,e)=>s+e.debit,0);
  const totalCredit = filtered.reduce((s,e)=>s+e.credit,0);
  const closingBal  = filtered.length>0?filtered[filtered.length-1].balance:0;

  function exportCSV() {
    if(!party)return;
    const rows=[['Date','Type','Ref','Debit','Credit','Balance'],...filtered.map(e=>[e.date,e.type,e.ref,e.debit,e.credit,e.balance])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`ledger-${party.name}-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Party Ledger</h2><p className="pm-page-sub">Full transaction history per party — invoices, payments, returns</p></div>
        <div className="pm-page-actions">
          {party&&<button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export</button>}
        </div>
      </div>

      {/* Party selector + quick stats */}
      <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:14,marginBottom:14}}>
        <div className="pm-table-wrap" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f1f5f9',fontSize:12.5,fontWeight:700,color:'#374151'}}>Select Party</div>
          <div style={{maxHeight:300,overflowY:'auto'}}>
            {pts.map(p=>{
              const tc=TIER_COLOR[p.tier]||'#94a3b8';
              return(
                <div key={p.id} onClick={()=>setSelectedParty(p.id)} style={{padding:'10px 16px',cursor:'pointer',background:selectedParty===p.id?'#f0fdf4':'#fff',borderBottom:'1px solid #f8fafc',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:tc,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{p.code} · {p.tier}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:(p.balance||0)>0?'#ef4444':'#10b981',flexShrink:0}}>{fmtPKRsd(p.balance)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {party ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,alignContent:'start'}}>
            {[['Party',party.name],['Tier',party.tier],['Credit Limit',fmtPKRsd(party.creditLimit)],['Credit Days',`${party.creditDays} days`],['Outstanding Balance',fmtPKRsd(party.balance)],['City',party.city||'—']].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',border:`1px solid ${l==='Outstanding Balance'&&(party.balance||0)>0?'#fecaca':'#f1f5f9'}`}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,fontWeight:700,color:l==='Outstanding Balance'&&(party.balance||0)>0?'#ef4444':'#0f172a'}}>{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:14}}>← Select a party to view ledger</div>
        )}
      </div>

      {party && (
        <>
          {/* Filters */}
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:240}}>
              <Icon name="search" size={13} color="#94a3b8"/>
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
            </div>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
            <span style={{color:'#94a3b8'}}>—</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
            {(dateFrom||dateTo)&&<button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'4px 8px'}} onClick={()=>{setDateFrom('');setDateTo('');}}>✕ Clear</button>}
          </div>

          <div className="pm-table-wrap">
            <div className="pm-table-header"><div className="pm-table-title">Ledger — {party.name} ({filtered.length} entries)</div></div>
            <table className="pm-table">
              <thead><tr><th>Date</th><th>Type</th><th>Reference</th><th style={{textAlign:'right'}}>Debit (Dr)</th><th style={{textAlign:'right'}}>Credit (Cr)</th><th style={{textAlign:'right'}}>Balance</th></tr></thead>
              <tbody>
                {filtered.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No transactions in selected period</td></tr>
                  :filtered.map(e=>(
                    <tr key={e.id}>
                      <td style={{color:'#9ca3af',fontSize:12}}>{e.date}</td>
                      <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:e.type==='Invoice'?'#eff6ff':e.type==='Payment'?'#f0fdf4':'#fef2f2',color:e.type==='Invoice'?'#3b82f6':e.type==='Payment'?'#10b981':'#ef4444'}}>{e.type}</span></td>
                      <td style={{color:'#6b7280',fontFamily:'monospace',fontSize:11}}>{e.id}</td>
                      <td style={{textAlign:'right',fontWeight:e.debit>0?600:400,color:e.debit>0?'#ef4444':'#9ca3af'}}>{e.debit>0?fmtPKRsd(e.debit):'—'}</td>
                      <td style={{textAlign:'right',fontWeight:e.credit>0?600:400,color:e.credit>0?'#10b981':'#9ca3af'}}>{e.credit>0?fmtPKRsd(e.credit):'—'}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:e.balance>0?'#ef4444':'#10b981'}}>{fmtPKRsd(Math.abs(e.balance))} {e.balance>0?'Dr':'Cr'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            {filtered.length>0&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr repeat(3,auto)',gap:24,padding:'12px 18px',background:'#f8fafc',borderTop:'2px solid #e2e8f0',fontSize:13}}>
                <span style={{color:'#6b7280'}}>{filtered.length} transactions</span>
                <span>Total Dr: <strong style={{color:'#ef4444'}}>{fmtPKRsd(totalDebit)}</strong></span>
                <span>Total Cr: <strong style={{color:'#10b981'}}>{fmtPKRsd(totalCredit)}</strong></span>
                <span>Closing: <strong style={{color:closingBal>0?'#ef4444':'#10b981'}}>{fmtPKRsd(Math.abs(closingBal))} {closingBal>0?'Dr':'Cr'}</strong></span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
