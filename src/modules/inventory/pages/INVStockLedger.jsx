import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { MOV_COLOR } from '../inventoryConstants';

const ACCENT = '#0ea5e9';

const MOV_LABELS = {
  '101':'Goods Receipt','102':'GRN Reversal','201':'Issue to Cost Center',
  '261':'Issue for Order','311':'Stock Transfer','551':'Adjustment +',
  '552':'Adjustment −','561':'Opening Stock','601':'Goods Issue/Sale','602':'Sales Return',
};

export default function INVStockLedger() {
  const { stockLedger, invMaterials, warehouses } = useApp();
  const [search,    setSearch]    = useState('');
  const [matFilter, setMatFilter] = useState('All');
  const [whFilter,  setWhFilter]  = useState('All');
  const [movFilter, setMovFilter] = useState('All');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [page,      setPage]      = useState(1);
  const PER = 15;

  const sl   = stockLedger   || [];
  const mats = invMaterials  || [];
  const whs  = warehouses    || [];

  const movTypes = ['All', ...new Set(sl.map(e => e.movType))].sort();
  const matOpts  = ['All', ...new Set(mats.map(m => m.name))];
  const whOpts   = ['All', ...new Set(whs.map(w => w.name))];

  const filtered = useMemo(() => sl.filter(e => {
    const q = search.toLowerCase();
    const matchQ  = !search || (e.materialName||'').toLowerCase().includes(q) || (e.ref||'').toLowerCase().includes(q) || (e.id||'').toLowerCase().includes(q);
    const matchM  = matFilter === 'All' || e.materialName === matFilter;
    const matchWH = whFilter  === 'All' || e.whName === whFilter;
    const matchMv = movFilter === 'All' || e.movType === movFilter;
    const matchD  = (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo);
    return matchQ && matchM && matchWH && matchMv && matchD;
  }).sort((a,b) => new Date(b.date) - new Date(a.date)), [sl, search, matFilter, whFilter, movFilter, dateFrom, dateTo]);

  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  // Summary stats for filtered set
  const totalIn  = filtered.filter(e=>e.qty>0).reduce((s,e)=>s+(e.value||0),0);
  const totalOut = filtered.filter(e=>e.qty<0).reduce((s,e)=>s+Math.abs(e.value||0),0);
  const netQty   = filtered.reduce((s,e)=>s+(e.qty||0),0);

  function clearFilters() {
    setSearch(''); setMatFilter('All'); setWhFilter('All');
    setMovFilter('All'); setDateFrom(''); setDateTo(''); setPage(1);
  }

  function exportCSV() {
    const rows = [
      ['Doc ID','Date','Material','Warehouse','Mov Type','Description','Qty','MAP Price','Value','Reference','Posted By'],
      ...filtered.map(e=>[e.id,e.date,e.materialName,e.whName,e.movType,MOV_LABELS[e.movType]||e.movLabel,e.qty,e.mapPrice,e.value,e.ref||'',e.createdBy||''])
    ];
    const csv  = rows.map(r=>r.join(',')).join('\n');
    const a    = document.createElement('a');
    a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `stock-ledger-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Stock Ledger</h2>
          <p className="pm-page-sub">MB51 equivalent — complete movement history with full audit trail</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[
          { label:'Total Documents',  value:filtered.length,        icon:'list',     bg:'#f0f9ff', color:ACCENT },
          { label:'Total Value In',   value:fmtPKR(totalIn),        icon:'purchase', bg:'#f0fdf4', color:'#10b981' },
          { label:'Total Value Out',  value:fmtPKR(totalOut),       icon:'cart',     bg:'#fef2f2', color:'#ef4444' },
          { label:'Net Qty Movement', value:netQty.toLocaleString(), icon:'trending', bg:'#fffbeb', color:'#f59e0b' },
          { label:'Date Range',       value:dateFrom&&dateTo?`${dateFrom} → ${dateTo}`:dateFrom||dateTo||'All Time', icon:'briefcase', bg:'#f5f3ff', color:'#8b5cf6' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?13:22, lineHeight:1.2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="pm-table-wrap" style={{ marginBottom:14 }}>
        <div style={{ padding:'14px 18px', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr auto', gap:8, alignItems:'end' }}>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Search</label>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px' }}>
              <Icon name="search" size={13} color="#94a3b8"/>
              <input placeholder="Doc ID, material, ref…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
            </div>
          </div>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Material</label>
            <select value={matFilter} onChange={e=>{setMatFilter(e.target.value);setPage(1);}} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', width:'100%' }}>
              {matOpts.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Warehouse</label>
            <select value={whFilter} onChange={e=>{setWhFilter(e.target.value);setPage(1);}} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', width:'100%' }}>
              {whOpts.map(w=><option key={w}>{w}</option>)}
            </select>
          </div>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Mov. Type</label>
            <select value={movFilter} onChange={e=>{setMovFilter(e.target.value);setPage(1);}} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', width:'100%' }}>
              {movTypes.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>From</label>
            <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', width:'100%' }}/>
          </div>
          <div className="pm-form-group" style={{ margin:0 }}>
            <label style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>To</label>
            <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}} style={{ padding:'7px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', width:'100%' }}/>
          </div>
          <button className="pm-btn pm-btn-ghost" onClick={clearFilters} style={{ height:36, fontSize:12 }}>Clear</button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <div className="pm-table-title">
            Movement Documents
            <span style={{ marginLeft:8, fontSize:12, color:'#94a3b8', fontWeight:400 }}>({filtered.length} records)</span>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th>Doc ID</th><th>Date</th><th>Material</th><th>Warehouse</th>
                <th>Type</th><th>Description</th>
                <th style={{ textAlign:'right' }}>Qty</th>
                <th style={{ textAlign:'right' }}>MAP Price</th>
                <th style={{ textAlign:'right' }}>Value</th>
                <th>Reference</th><th>Posted By</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={11} style={{ padding:40, textAlign:'center', color:'#9ca3af', fontSize:13 }}>No records found — try adjusting filters</td></tr>
                : paged.map(e => {
                    const isIn    = e.qty > 0;
                    const mcolor  = MOV_COLOR[e.movType] || '#94a3b8';
                    return (
                      <tr key={e.id}>
                        <td style={{ fontWeight:700, color:mcolor, fontFamily:'monospace', fontSize:11, whiteSpace:'nowrap' }}>{e.id}</td>
                        <td style={{ color:'#6b7280', fontSize:12, whiteSpace:'nowrap' }}>{e.date}</td>
                        <td>
                          <div style={{ fontWeight:600, color:'#0f172a', whiteSpace:'nowrap' }}>{e.materialName}</div>
                        </td>
                        <td style={{ color:'#6b7280', fontSize:12, whiteSpace:'nowrap' }}>{e.whName}</td>
                        <td>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:8, background:mcolor+'18', color:mcolor, whiteSpace:'nowrap' }}>
                            {e.movType}
                          </span>
                        </td>
                        <td style={{ color:'#6b7280', fontSize:12, whiteSpace:'nowrap' }}>{MOV_LABELS[e.movType] || e.movLabel}</td>
                        <td style={{ textAlign:'right', fontWeight:700, color:isIn?'#10b981':'#ef4444', whiteSpace:'nowrap' }}>
                          {isIn?'+':''}{(e.qty||0).toLocaleString()}
                        </td>
                        <td style={{ textAlign:'right', color:'#374151', whiteSpace:'nowrap' }}>{fmtPKR(e.mapPrice)}</td>
                        <td style={{ textAlign:'right', fontWeight:600, color:isIn?'#10b981':'#ef4444', whiteSpace:'nowrap' }}>
                          {isIn?'+':''}{fmtPKR(e.value)}
                        </td>
                        <td style={{ color:'#9ca3af', fontSize:12, whiteSpace:'nowrap' }}>{e.ref || '—'}</td>
                        <td style={{ color:'#9ca3af', fontSize:12 }}>{e.createdBy || '—'}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Totals row */}
        {filtered.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:24, padding:'12px 18px', background:'#f8fafc', borderTop:'2px solid #e2e8f0', fontSize:13 }}>
            <span style={{ color:'#6b7280' }}>Showing {paged.length} of {filtered.length} records</span>
            <span>In: <strong style={{ color:'#10b981' }}>{fmtPKR(totalIn)}</strong></span>
            <span>Out: <strong style={{ color:'#ef4444' }}>{fmtPKR(totalOut)}</strong></span>
          </div>
        )}

        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'14px', borderTop:'1px solid #f1f5f9' }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="pm-btn pm-btn-ghost" style={{ padding:'5px 10px', fontSize:12 }}>‹ Prev</button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = page <= 4 ? i+1 : page-3+i;
              if (p < 1 || p > pages) return null;
              return (
                <button key={p} onClick={()=>setPage(p)} style={{ width:30, height:30, borderRadius:6, border:'1px solid', cursor:'pointer', fontSize:12, fontWeight:600, background:page===p?ACCENT:'#fff', color:page===p?'#fff':'#6b7280', borderColor:page===p?ACCENT:'#e5e7eb' }}>{p}</button>
              );
            })}
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="pm-btn pm-btn-ghost" style={{ padding:'5px 10px', fontSize:12 }}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}
