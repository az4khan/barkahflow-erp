import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

export default function SDSalesReports() {
  const { salesInvoices, salesOrders, salesReturns, sdParties, invMaterials } = useApp();
  const [report,   setReport]   = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [tierF,    setTierF]    = useState('All');

  const invs = salesInvoices || [];
  const sos  = salesOrders   || [];
  const rets = salesReturns  || [];
  const pts  = sdParties     || [];
  const mats = invMaterials  || [];

  const filteredInvs = useMemo(()=>invs.filter(i=>
    (tierF==='All'||i.tier===tierF)&&
    (!dateFrom||i.date>=dateFrom)&&(!dateTo||i.date<=dateTo)
  ),[invs,tierF,dateFrom,dateTo]);

  const totalRev  = filteredInvs.reduce((s,i)=>s+(i.subTotal||0),0);
  const totalGST  = filteredInvs.reduce((s,i)=>s+(i.taxAmount||0),0);
  const totalCOGS = filteredInvs.reduce((s,i)=>s+(i.cogsTotal||0),0);
  const grossProfit = totalRev - totalCOGS;
  const totalReturns= rets.reduce((s,r)=>s+(r.subTotal||0),0);
  const netRevenue  = totalRev - totalReturns;

  // By tier
  const byTier = {};
  filteredInvs.forEach(i=>{ const t=i.tier||'Other'; if(!byTier[t])byTier[t]={count:0,revenue:0,cogs:0}; byTier[t].count++;byTier[t].revenue+=(i.subTotal||0);byTier[t].cogs+=(i.cogsTotal||0); });

  // By party (top 10)
  const byParty = {};
  filteredInvs.forEach(i=>{ if(!byParty[i.partyName])byParty[i.partyName]={revenue:0,count:0,tier:i.tier}; byParty[i.partyName].revenue+=(i.subTotal||0);byParty[i.partyName].count++; });
  const topParties=Object.entries(byParty).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,10);

  // By material
  const byMat = {};
  filteredInvs.forEach(i=>(i.items||[]).forEach(it=>{ if(!byMat[it.materialId])byMat[it.materialId]={name:it.materialName,qty:0,revenue:0}; byMat[it.materialId].qty+=it.qty||0;byMat[it.materialId].revenue+=it.total||0; }));
  const topMats=Object.values(byMat).sort((a,b)=>b.revenue-a.revenue);

  function exportCSV() {
    const rows=[['Invoice','Date','Party','Tier','Revenue','COGS','Gross Profit','GST','Grand Total'],...filteredInvs.map(i=>[i.id,i.date,i.partyName,i.tier,i.subTotal||0,i.cogsTotal||0,(i.subTotal||0)-(i.cogsTotal||0),i.taxAmount||0,i.grandTotal||0])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`sales-report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  const REPORTS=[['summary','Sales Summary'],['party','By Party'],['material','By Material'],['tier','By Tier']];

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Sales Reports</h2><p className="pm-page-sub">Revenue, COGS, gross profit analysis across tiers and parties</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button></div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:4}}>
          {REPORTS.map(([v,l])=><button key={v} onClick={()=>setReport(v)} style={{padding:'6px 14px',borderRadius:8,border:'1px solid',fontSize:12.5,fontWeight:500,cursor:'pointer',background:report===v?ACCENT:'#fff',color:report===v?'#fff':'#6b7280',borderColor:report===v?ACCENT:'#e5e7eb'}}>{l}</button>)}
        </div>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        <span style={{color:'#94a3b8'}}>—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}/>
        <div style={{display:'flex',gap:4}}>
          {['All','Wholesaler','Retailer','Shop','Consumer'].map(t=><button key={t} onClick={()=>setTierF(t)} style={{padding:'5px 10px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:tierF===t?ACCENT:'#fff',color:tierF===t?'#fff':'#6b7280',borderColor:tierF===t?ACCENT:'#e5e7eb'}}>{t}</button>)}
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)',marginBottom:14}}>
        {[{label:'Net Revenue',value:fmtPKRsd(netRevenue),icon:'trending',bg:'#f0fdf4',color:ACCENT},{label:'Gross Profit',value:fmtPKRsd(grossProfit),icon:'briefcase',bg:'#fffbeb',color:'#f59e0b',hint:totalRev?`${((grossProfit/totalRev)*100).toFixed(1)}% margin`:''},{label:'GST Collected',value:fmtPKRsd(totalGST),icon:'calculator',bg:'#f5f3ff',color:'#8b5cf6'},{label:'Returns',value:fmtPKRsd(totalReturns),icon:'purchase',bg:'#fef2f2',color:'#ef4444'},{label:'Invoices',value:filteredInvs.length,icon:'invoice',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div>{s.hint&&<div className="pm-stat-hint">{s.hint}</div>}</div>
        ))}
      </div>

      {/* Summary report */}
      {report==='summary'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Invoice Details ({filteredInvs.length})</div></div>
          <table className="pm-table">
            <thead><tr><th>Invoice</th><th>Date</th><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>COGS</th><th style={{textAlign:'right'}}>Gross Profit</th><th style={{textAlign:'right'}}>Margin %</th></tr></thead>
            <tbody>
              {filteredInvs.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No invoices in selected period</td></tr>
                :filteredInvs.map(i=>{const gp=(i.subTotal||0)-(i.cogsTotal||0);const margin=(i.subTotal||0)>0?((gp/(i.subTotal||0))*100).toFixed(1):0;const tc=TIER_COLOR[i.tier]||'#94a3b8';return(<tr key={i.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{i.id}</td><td style={{color:'#9ca3af',fontSize:12}}>{i.date}</td><td style={{fontWeight:600}}>{i.partyName}</td><td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{i.tier}</span></td><td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{fmtPKRsd(i.subTotal)}</td><td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRsd(i.cogsTotal)}</td><td style={{textAlign:'right',fontWeight:700,color:gp>=0?'#10b981':'#ef4444'}}>{fmtPKRsd(gp)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{margin}%</td></tr>);})}
            </tbody>
          </table>
        </div>
      )}

      {/* By party */}
      {report==='party'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Revenue by Party (Top 10)</div></div>
          <table className="pm-table">
            <thead><tr><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Invoices</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead>
            <tbody>
              {topParties.map(([name,data])=>{const tc=TIER_COLOR[data.tier]||'#94a3b8';return(<tr key={name}><td style={{fontWeight:600}}>{name}</td><td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{data.tier}</span></td><td style={{textAlign:'right'}}>{data.count}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(data.revenue)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{totalRev>0?((data.revenue/totalRev)*100).toFixed(1):0}%</td></tr>);})}
            </tbody>
          </table>
        </div>
      )}

      {/* By material */}
      {report==='material'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Revenue by Material</div></div>
          <table className="pm-table">
            <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty Sold</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead>
            <tbody>
              {topMats.map(m=><tr key={m.name}><td style={{fontWeight:600}}>{m.name}</td><td style={{textAlign:'right',fontWeight:600}}>{m.qty.toLocaleString()}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(m.revenue)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{totalRev>0?((m.revenue/totalRev)*100).toFixed(1):0}%</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* By tier */}
      {report==='tier'&&(
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Revenue by Channel Tier</div></div>
          <table className="pm-table">
            <thead><tr><th>Tier</th><th style={{textAlign:'right'}}>Invoices</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>COGS</th><th style={{textAlign:'right'}}>Gross Profit</th><th style={{textAlign:'right'}}>Margin %</th></tr></thead>
            <tbody>
              {Object.entries(byTier).map(([tier,data])=>{const gp=data.revenue-data.cogs;const tc=TIER_COLOR[tier]||'#94a3b8';return(<tr key={tier}><td><span style={{fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:10,background:tc+'18',color:tc}}>{tier}</span></td><td style={{textAlign:'right'}}>{data.count}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRsd(data.revenue)}</td><td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRsd(data.cogs)}</td><td style={{textAlign:'right',fontWeight:700,color:'#10b981'}}>{fmtPKRsd(gp)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{data.revenue>0?((gp/data.revenue)*100).toFixed(1):0}%</td></tr>);})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
