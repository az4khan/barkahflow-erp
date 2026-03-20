import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { WH_TYPE_COLOR } from '../inventoryConstants';

const ACCENT = '#0ea5e9';

export default function INVValuation() {
  const { invMaterials, warehouses, stockLedger } = useApp();
  const [groupBy,   setGroupBy]   = useState('material'); // material | category | warehouse
  const [catFilter, setCatFilter] = useState('All');
  const [whFilter,  setWhFilter]  = useState('All');
  const [search,    setSearch]    = useState('');

  const mats = invMaterials || [];
  const whs  = warehouses   || [];
  const sl   = stockLedger  || [];

  const cats   = ['All', ...new Set(mats.map(m => m.category))];
  const whOpts = ['All', ...whs.map(w => w.name)];

  // Filter materials
  const filtered = useMemo(() => mats.filter(m =>
    (catFilter === 'All' || m.category === catFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.code||'').toLowerCase().includes(search.toLowerCase()))
  ), [mats, catFilter, search]);

  // Grand totals
  const grandTotal  = filtered.reduce((s,m) => s+(m.totalValue||0), 0);
  const grandQty    = filtered.reduce((s,m) => s+(m.totalQty||0), 0);
  const inValue     = sl.filter(e=>e.qty>0).reduce((s,e)=>s+(e.value||0),0);
  const outValue    = sl.filter(e=>e.qty<0).reduce((s,e)=>s+Math.abs(e.value||0),0);

  // Group by category
  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(m => {
      const cat = m.category || 'Other';
      if (!map[cat]) map[cat] = { items:[], totalQty:0, totalValue:0 };
      map[cat].items.push(m);
      map[cat].totalQty   += m.totalQty   || 0;
      map[cat].totalValue += m.totalValue || 0;
    });
    return Object.entries(map).sort((a,b)=>b[1].totalValue-a[1].totalValue);
  }, [filtered]);

  // Group by warehouse
  const byWarehouse = useMemo(() => {
    const map = {};
    whs.forEach(wh => {
      let qty=0, value=0, items=[];
      filtered.forEach(m=>{
        const ws=(m.stockByWarehouse||[]).find(w=>w.warehouseId===wh.id);
        if (ws&&ws.qty>0) { qty+=ws.qty; value+=ws.value||0; items.push({...m,whQty:ws.qty,whValue:ws.value||0}); }
      });
      if (qty>0) map[wh.name]={wh,qty,value,items};
    });
    return Object.entries(map).sort((a,b)=>b[1].value-a[1].value);
  }, [filtered, whs]);

  function exportCSV() {
    const rows=[['Code','Material','Category','Unit','MAP Price','Qty','Value','Valuation Method'],...filtered.map(m=>[m.code,m.name,m.category,m.unit,m.mapPrice,m.totalQty,m.totalValue,m.valuationMethod||'MAP'])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`valuation-${new Date().toISOString().slice(0,10)}.csv`;a.click();
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Valuation Report</h2>
          <p className="pm-page-sub">MB5L equivalent — stock value at Moving Average Price (MAP)</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button>
          <div style={{ display:'flex', background:'#f1f5f9', borderRadius:8, padding:2 }}>
            {[['material','products'],['category','list'],['warehouse','building']].map(([v,icon])=>(
              <button key={v} onClick={()=>setGroupBy(v)} style={{ padding:'5px 12px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:groupBy===v?ACCENT:'transparent', color:groupBy===v?'#fff':'#6b7280', display:'flex', alignItems:'center', gap:4 }}>
                <Icon name={icon} size={13} color={groupBy===v?'#fff':'#6b7280'}/>{v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          { label:'Total Stock Value', value:fmtPKR(grandTotal), icon:'briefcase', bg:'#f0f9ff', color:ACCENT },
          { label:'Total Units',       value:grandQty.toLocaleString(), icon:'box', bg:'#f0fdf4', color:'#10b981' },
          { label:'Total Value In',    value:fmtPKR(inValue),   icon:'purchase', bg:'#f0fdf4', color:'#10b981' },
          { label:'Total Value Out',   value:fmtPKR(outValue),  icon:'cart',     bg:'#fef2f2', color:'#ef4444' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:16 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
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
      </div>

      {/* ── Group by MATERIAL ── */}
      {groupBy === 'material' && (
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Stock Valuation by Material ({filtered.length} SKUs)</div></div>
          <table className="pm-table">
            <thead>
              <tr>
                <th>Code</th><th>Material</th><th>Category</th><th>Unit</th>
                <th>Method</th>
                <th style={{ textAlign:'right' }}>MAP Price</th>
                <th style={{ textAlign:'right' }}>Qty</th>
                <th style={{ textAlign:'right' }}>Stock Value</th>
                <th style={{ textAlign:'right' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No materials found</td></tr>
                : [...filtered].sort((a,b)=>(b.totalValue||0)-(a.totalValue||0)).map(m=>(
                  <tr key={m.id}>
                    <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{m.code}</td>
                    <td style={{ fontWeight:600, color:'#0f172a' }}>{m.name}</td>
                    <td style={{ color:'#9ca3af', fontSize:12 }}>{m.category}</td>
                    <td style={{ color:'#6b7280' }}>{m.unit}</td>
                    <td>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:8, background:'#f0f9ff', color:ACCENT }}>
                        {m.valuationMethod||'MAP'}
                      </span>
                    </td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>{fmtPKR(m.mapPrice)}</td>
                    <td style={{ textAlign:'right', fontWeight:700, color:(m.totalQty||0)===0?'#ef4444':'#0f172a' }}>
                      {(m.totalQty||0).toLocaleString()}
                    </td>
                    <td style={{ textAlign:'right', fontWeight:700, color:ACCENT }}>{fmtPKR(m.totalValue)}</td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
                        <div style={{ width:60, height:5, background:'#f1f5f9', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${grandTotal>0?((m.totalValue||0)/grandTotal)*100:0}%`, background:ACCENT, borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:11, color:'#94a3b8', minWidth:36, textAlign:'right' }}>
                          {grandTotal>0?(((m.totalValue||0)/grandTotal)*100).toFixed(1):0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background:'#f0f9ff', borderTop:'2px solid #e2e8f0' }}>
                  <td colSpan={6} style={{ fontWeight:700, color:'#0f172a', padding:'12px 16px', fontSize:13 }}>Grand Total ({filtered.length} SKUs)</td>
                  <td style={{ textAlign:'right', fontWeight:700, padding:'12px 16px' }}>{grandQty.toLocaleString()}</td>
                  <td style={{ textAlign:'right', fontWeight:800, color:ACCENT, fontSize:15, padding:'12px 16px' }}>{fmtPKR(grandTotal)}</td>
                  <td style={{ textAlign:'right', fontWeight:700, padding:'12px 16px' }}>100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ── Group by CATEGORY ── */}
      {groupBy === 'category' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {byCategory.map(([cat, data]) => (
            <div className="pm-table-wrap" key={cat}>
              <div className="pm-table-header" style={{ background:'#f8fafc' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="pm-table-title">{cat}</div>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>{data.items.length} items</span>
                </div>
                <div style={{ display:'flex', gap:16, fontSize:13 }}>
                  <span>Units: <strong>{data.totalQty.toLocaleString()}</strong></span>
                  <span style={{ color:ACCENT, fontWeight:700 }}>{fmtPKR(data.totalValue)}</span>
                  <span style={{ color:'#94a3b8', fontSize:12 }}>{grandTotal>0?((data.totalValue/grandTotal)*100).toFixed(1):0}% of total</span>
                </div>
              </div>
              <table className="pm-table">
                <thead><tr><th>Code</th><th>Material</th><th>Unit</th><th style={{ textAlign:'right' }}>MAP</th><th style={{ textAlign:'right' }}>Qty</th><th style={{ textAlign:'right' }}>Value</th></tr></thead>
                <tbody>
                  {data.items.map(m=>(
                    <tr key={m.id}>
                      <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{m.code}</td>
                      <td style={{ fontWeight:600 }}>{m.name}</td>
                      <td style={{ color:'#9ca3af' }}>{m.unit}</td>
                      <td style={{ textAlign:'right' }}>{fmtPKR(m.mapPrice)}</td>
                      <td style={{ textAlign:'right', fontWeight:700 }}>{(m.totalQty||0).toLocaleString()}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color:ACCENT }}>{fmtPKR(m.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {/* Category totals bar chart */}
          <div className="pm-table-wrap">
            <div className="pm-table-header"><div className="pm-table-title">Value Distribution by Category</div></div>
            <div style={{ padding:'18px 20px' }}>
              {byCategory.map(([cat,data])=>(
                <div key={cat} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:5 }}>
                    <span style={{ fontWeight:500, color:'#374151' }}>{cat}</span>
                    <span style={{ fontWeight:700, color:ACCENT }}>{fmtPKR(data.totalValue)}</span>
                  </div>
                  <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${grandTotal>0?(data.totalValue/grandTotal)*100:0}%`, background:ACCENT, borderRadius:4, transition:'width 0.7s' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Group by WAREHOUSE ── */}
      {groupBy === 'warehouse' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {byWarehouse.map(([whName,data])=>{
            const typeColor = WH_TYPE_COLOR[data.wh.type]||'#94a3b8';
            return (
              <div className="pm-table-wrap" key={whName} style={{ borderTop:`3px solid ${typeColor}` }}>
                <div className="pm-table-header" style={{ background:'#f8fafc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="pm-table-title">{whName}</div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:10, background:typeColor+'18', color:typeColor }}>{data.wh.type}</span>
                    <span style={{ fontSize:12, color:'#94a3b8' }}>{data.items.length} items</span>
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:13 }}>
                    <span>Units: <strong>{data.qty.toLocaleString()}</strong></span>
                    <span style={{ color:ACCENT, fontWeight:700 }}>{fmtPKR(data.value)}</span>
                  </div>
                </div>
                <table className="pm-table">
                  <thead><tr><th>Code</th><th>Material</th><th>Category</th><th style={{ textAlign:'right' }}>MAP</th><th style={{ textAlign:'right' }}>Qty</th><th style={{ textAlign:'right' }}>Value</th></tr></thead>
                  <tbody>
                    {data.items.sort((a,b)=>b.whValue-a.whValue).map(m=>(
                      <tr key={m.id}>
                        <td style={{ fontWeight:700, color:ACCENT, fontFamily:'monospace' }}>{m.code}</td>
                        <td style={{ fontWeight:600 }}>{m.name}</td>
                        <td style={{ color:'#9ca3af', fontSize:12 }}>{m.category}</td>
                        <td style={{ textAlign:'right' }}>{fmtPKR(m.mapPrice)}</td>
                        <td style={{ textAlign:'right', fontWeight:700 }}>{m.whQty.toLocaleString()}</td>
                        <td style={{ textAlign:'right', fontWeight:700, color:ACCENT }}>{fmtPKR(m.whValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
