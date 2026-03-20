import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';

const ACCENT = '#0ea5e9';

export default function INVReorder() {
  const { invMaterials, warehouses, stockLedger } = useApp();
  const [catFilter, setCatFilter] = useState('All');
  const [search,    setSearch]    = useState('');
  const [sortBy,    setSortBy]    = useState('urgency'); // urgency | name | qty | value
  const [showAll,   setShowAll]   = useState(false);

  const mats = invMaterials || [];
  const whs  = warehouses   || [];
  const sl   = stockLedger  || [];

  const cats = ['All', ...new Set(mats.map(m => m.category))];

  // Compute consumption rate from last 30 days of ledger
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);
  const consumptionMap = useMemo(() => {
    const map = {};
    sl.filter(e => e.qty < 0 && e.date >= thirtyDaysAgo).forEach(e => {
      map[e.materialId] = (map[e.materialId] || 0) + Math.abs(e.qty);
    });
    return map;
  }, [sl]);

  // Enrich materials with reorder analysis
  const enriched = useMemo(() => mats.map(m => {
    const consumed30d  = consumptionMap[m.id] || 0;
    const dailyRate    = consumed30d / 30;
    const daysOfStock  = dailyRate > 0 ? Math.floor((m.totalQty||0) / dailyRate) : null;
    const reorderValue = (m.reorderQty||0) * (m.mapPrice||0);
    const shortage     = Math.max(0, (m.reorderPoint||0) - (m.totalQty||0));
    const status       =
      (m.totalQty||0) === 0              ? { label:'Out of Stock', cls:'pm-badge-red',    color:'#ef4444', urgency:0 } :
      (m.totalQty||0) < (m.minStock||0)  ? { label:'Critical',     cls:'pm-badge-red',    color:'#ef4444', urgency:1 } :
      (m.totalQty||0) <= (m.reorderPoint||0) ? { label:'Reorder Now', cls:'pm-badge-orange', color:'#f59e0b', urgency:2 } :
      daysOfStock !== null && daysOfStock <= 14 ? { label:'Order Soon',  cls:'pm-badge-orange', color:'#f59e0b', urgency:3 } :
      { label:'OK',         cls:'pm-badge-green',  color:'#10b981', urgency:9 };
    return { ...m, consumed30d, dailyRate, daysOfStock, reorderValue, shortage, status };
  }), [mats, consumptionMap]);

  const needsReorder = enriched.filter(m => m.status.urgency < 9);
  const allItems     = showAll ? enriched : needsReorder;

  const filtered = allItems.filter(m =>
    (catFilter === 'All' || m.category === catFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.code||'').toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy==='urgency') return a.status.urgency - b.status.urgency;
    if (sortBy==='qty')     return (a.totalQty||0) - (b.totalQty||0);
    if (sortBy==='value')   return b.reorderValue - a.reorderValue;
    return a.name.localeCompare(b.name);
  });

  // Summary
  const outOfStock = enriched.filter(m => (m.totalQty||0) === 0).length;
  const critical   = enriched.filter(m => m.status.urgency === 1).length;
  const reorderNow = enriched.filter(m => m.status.urgency === 2).length;
  const orderSoon  = enriched.filter(m => m.status.urgency === 3).length;
  const totalReorderValue = needsReorder.reduce((s,m) => s+m.reorderValue, 0);

  function exportCSV() {
    const rows=[['Code','Material','Category','Unit','Current Qty','Min Stock','Reorder Point','Reorder Qty','MAP Price','Reorder Value','Consumed (30d)','Daily Rate','Days of Stock','Status'],
      ...sorted.map(m=>[m.code,m.name,m.category,m.unit,m.totalQty||0,m.minStock||0,m.reorderPoint||0,m.reorderQty||0,m.mapPrice||0,m.reorderValue,m.consumed30d.toFixed(1),m.dailyRate.toFixed(2),m.daysOfStock??'N/A',m.status.label])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`reorder-report-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Reorder Report</h2>
          <p className="pm-page-sub">MD07 equivalent — replenishment alerts with consumption-based forecast</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button>
          <button className="pm-btn pm-btn-ghost" onClick={()=>setShowAll(v=>!v)} style={{ fontSize:12, border:'1px solid #e2e8f0' }}>
            {showAll ? 'Show Alerts Only' : 'Show All Materials'}
          </button>
        </div>
      </div>

      {/* Alert summary banner */}
      {needsReorder.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#fef2f2,#fff7ed)', border:'1px solid #fecaca', borderRadius:12, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="bell" size={20} color="#ef4444"/>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>{needsReorder.length} materials need attention</div>
              <div style={{ fontSize:12.5, color:'#6b7280' }}>Estimated reorder value: <strong style={{ color:'#f97316' }}>{fmtPKR(totalReorderValue)}</strong></div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[['Out of Stock',outOfStock,'pm-badge-red'],['Critical',critical,'pm-badge-red'],['Reorder Now',reorderNow,'pm-badge-orange'],['Order Soon',orderSoon,'pm-badge-orange']].filter(([,v])=>v>0).map(([l,v,cls])=>(
              <span key={l} className={`pm-badge ${cls}`} style={{ fontSize:12, padding:'4px 12px' }}>{l}: {v}</span>
            ))}
          </div>
        </div>
      )}

      {needsReorder.length === 0 && (
        <div style={{ background:'#f0fdf4', border:'1px solid #a7f3d0', borderRadius:12, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <Icon name="check" size={22} color="#10b981"/>
          <div style={{ fontSize:15, fontWeight:600, color:'#065f46' }}>All stock levels are healthy — no reorder required</div>
        </div>
      )}

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[
          { label:'Out of Stock',  value:outOfStock,    icon:'alert',     bg:'#fef2f2', color:'#ef4444' },
          { label:'Critical',      value:critical,      icon:'bell',      bg:'#fef2f2', color:'#ef4444' },
          { label:'Reorder Now',   value:reorderNow,    icon:'box',       bg:'#fffbeb', color:'#f59e0b' },
          { label:'Order Soon',    value:orderSoon,     icon:'trending',  bg:'#fffbeb', color:'#f59e0b' },
          { label:'Reorder Value', value:fmtPKR(totalReorderValue), icon:'briefcase', bg:'#f0f9ff', color:ACCENT },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?15:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Sort */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:260 }}>
          <Icon name="search" size={13} color="#94a3b8"/>
          <input placeholder="Search material…" value={search} onChange={e=>setSearch(e.target.value)} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:catFilter===c?ACCENT:'#fff', color:catFilter===c?'#fff':'#6b7280', borderColor:catFilter===c?ACCENT:'#e5e7eb' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
          <span style={{ fontSize:12, color:'#94a3b8' }}>Sort:</span>
          {[['urgency','Urgency'],['qty','Stock Qty'],['value','Reorder Value'],['name','Name']].map(([v,l])=>(
            <button key={v} onClick={()=>setSortBy(v)}
              style={{ padding:'5px 10px', borderRadius:8, border:'1px solid', fontSize:11.5, cursor:'pointer', background:sortBy===v?ACCENT:'#fff', color:sortBy===v?'#fff':'#6b7280', borderColor:sortBy===v?ACCENT:'#e5e7eb' }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header">
          <div className="pm-table-title">
            {showAll ? 'All Materials' : 'Reorder Alerts'}
            <span style={{ marginLeft:8, fontSize:12, color:'#94a3b8', fontWeight:400 }}>({sorted.length})</span>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th>Code</th><th>Material</th><th>Category</th><th>Unit</th>
                <th style={{ textAlign:'right' }}>Current Qty</th>
                <th style={{ textAlign:'right' }}>Min Stock</th>
                <th style={{ textAlign:'right' }}>Reorder Pt.</th>
                <th style={{ textAlign:'right' }}>Reorder Qty</th>
                <th style={{ textAlign:'right' }}>MAP</th>
                <th style={{ textAlign:'right' }}>Reorder Value</th>
                <th style={{ textAlign:'right' }}>Consumed 30d</th>
                <th style={{ textAlign:'right' }}>Days of Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0
                ? <tr><td colSpan={13} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No items match current filters</td></tr>
                : sorted.map(m => (
                  <tr key={m.id} style={{ background: m.status.urgency===0?'#fff5f5': m.status.urgency===1?'#fff8f8':undefined }}>
                    <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{m.code}</td>
                    <td style={{ fontWeight:600, color:'#0f172a' }}>{m.name}</td>
                    <td style={{ color:'#9ca3af', fontSize:12 }}>{m.category}</td>
                    <td style={{ color:'#6b7280' }}>{m.unit}</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:m.status.color }}>
                      {(m.totalQty||0).toLocaleString()}
                    </td>
                    <td style={{ textAlign:'right', color:'#9ca3af' }}>{m.minStock||0}</td>
                    <td style={{ textAlign:'right', color:'#f59e0b', fontWeight:600 }}>{m.reorderPoint||0}</td>
                    <td style={{ textAlign:'right', color:'#10b981', fontWeight:600 }}>{m.reorderQty||0}</td>
                    <td style={{ textAlign:'right' }}>{fmtPKR(m.mapPrice)}</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:ACCENT }}>{fmtPKR(m.reorderValue)}</td>
                    <td style={{ textAlign:'right', color:'#6b7280' }}>
                      {m.consumed30d > 0 ? m.consumed30d.toFixed(1) : '—'}
                    </td>
                    <td style={{ textAlign:'right' }}>
                      {m.daysOfStock !== null ? (
                        <span style={{ fontWeight:700, color: m.daysOfStock<=7?'#ef4444':m.daysOfStock<=14?'#f59e0b':'#10b981' }}>
                          {m.daysOfStock}d
                        </span>
                      ) : <span style={{ color:'#94a3b8' }}>N/A</span>}
                    </td>
                    <td><span className={`pm-badge ${m.status.cls}`}>{m.status.label}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ padding:'12px 18px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', gap:20, flexWrap:'wrap', fontSize:12, color:'#6b7280' }}>
          <span><strong>Min Stock:</strong> Absolute minimum, trigger emergency order</span>
          <span><strong>Reorder Pt:</strong> Order when stock hits this level</span>
          <span><strong>Reorder Qty:</strong> Suggested order quantity</span>
          <span><strong>Days of Stock:</strong> Based on last 30-day consumption rate</span>
        </div>
      </div>
    </div>
  );
}
