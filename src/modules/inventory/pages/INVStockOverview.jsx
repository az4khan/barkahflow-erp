import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { WH_TYPE_COLOR } from '../inventoryConstants';

const ACCENT = '#0ea5e9';

export default function INVStockOverview() {
  const { invMaterials, warehouses } = useApp();
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [whFilter,  setWhFilter]  = useState('All');
  const [view,      setView]      = useState('table'); // table | matrix
  const [page,      setPage]      = useState(1);
  const PER = 15;

  const mats = invMaterials || [];
  const whs  = warehouses   || [];
  const cats = ['All', ...new Set(mats.map(m => m.category))];
  const activeWHs = whs.filter(w => w.status === 'active');

  const filtered = useMemo(() => mats.filter(m =>
    (catFilter === 'All' || m.category === catFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.code||'').toLowerCase().includes(search.toLowerCase()))
  ), [mats, catFilter, search]);

  const pages = Math.ceil(filtered.length / PER);
  const paged  = filtered.slice((page-1)*PER, page*PER);

  const totalValue = mats.reduce((s,m) => s+(m.totalValue||0), 0);
  const totalQty   = mats.reduce((s,m) => s+(m.totalQty||0), 0);
  const lowStock   = mats.filter(m => (m.totalQty||0) <= (m.reorderPoint||0));

  function stockForWH(mat, whId) {
    return (mat.stockByWarehouse||[]).find(w => w.warehouseId === whId) || { qty: 0, value: 0 };
  }

  function stockStatus(m) {
    const qty = m.totalQty || 0;
    if (qty === 0) return { label:'Out of Stock', cls:'pm-badge-red',    color:'#ef4444' };
    if (qty <= (m.reorderPoint||0)) return { label:'Reorder',    cls:'pm-badge-orange', color:'#f59e0b' };
    if (qty >= (m.maxStock||99999)) return { label:'Overstocked', cls:'pm-badge-purple', color:'#8b5cf6' };
    return { label:'OK', cls:'pm-badge-green', color:'#10b981' };
  }

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Stock Overview</h2>
          <p className="pm-page-sub">MMBE equivalent — real-time stock by material & warehouse</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <div style={{ display:'flex', background:'#f1f5f9', borderRadius:8, padding:2 }}>
            {[['table','list'],['matrix','grid']].map(([v,icon])=>(
              <button key={v} onClick={()=>setView(v)} style={{ padding:'5px 12px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:view===v?ACCENT:'transparent', color:view===v?'#fff':'#6b7280', display:'flex', alignItems:'center', gap:4 }}>
                <Icon name={icon} size={13} color={view===v?'#fff':'#6b7280'}/>{v==='table'?'Table':'Matrix'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-stat-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[
          { label:'Total Value',      value:fmtPKR(totalValue), icon:'briefcase', bg:'#f0f9ff', color:ACCENT },
          { label:'Total Units',      value:totalQty.toLocaleString(), icon:'box', bg:'#f0fdf4', color:'#10b981' },
          { label:'SKUs',             value:mats.length,        icon:'products',  bg:'#fffbeb', color:'#f59e0b' },
          { label:'Warehouses',       value:activeWHs.length,   icon:'building',  bg:'#f5f3ff', color:'#8b5cf6' },
          { label:'Reorder Alerts',   value:lowStock.length,    icon:'bell',      bg:'#fef2f2', color:'#ef4444' },
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{ background:s.bg }}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize:typeof s.value==='string'?16:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 11px', flex:1, maxWidth:280 }}>
          <Icon name="search" size={14} color="#94a3b8"/>
          <input placeholder="Search code or name…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ border:'none', background:'transparent', fontSize:12.5, outline:'none', flex:1 }}/>
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>{setCatFilter(c);setPage(1);}}
              style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', background:catFilter===c?ACCENT:'#fff', color:catFilter===c?'#fff':'#6b7280', borderColor:catFilter===c?ACCENT:'#e5e7eb' }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Code</th><th>Material</th><th>Category</th><th>Unit</th>
                <th style={{textAlign:'right'}}>MAP Price</th>
                <th style={{textAlign:'right'}}>Total Qty</th>
                <th style={{textAlign:'right'}}>Total Value</th>
                <th style={{textAlign:'right'}}>Reorder Pt.</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No materials found</td></tr>
                : paged.map(m => {
                    const st = stockStatus(m);
                    return (
                      <tr key={m.id}>
                        <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{m.code}</td>
                        <td><div style={{fontWeight:600,color:'#0f172a'}}>{m.name}</div></td>
                        <td style={{color:'#9ca3af',fontSize:12}}>{m.category}</td>
                        <td style={{color:'#6b7280'}}>{m.unit}</td>
                        <td style={{textAlign:'right',fontWeight:600}}>{fmtPKR(m.mapPrice)}</td>
                        <td style={{textAlign:'right',fontWeight:700,color:st.color}}>{(m.totalQty||0).toLocaleString()}</td>
                        <td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{fmtPKR(m.totalValue)}</td>
                        <td style={{textAlign:'right',color:'#9ca3af'}}>{m.reorderPoint||0}</td>
                        <td><span className={`pm-badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
          {pages>1 && (
            <div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matrix view — material × warehouse */}
      {view === 'matrix' && (
        <div className="pm-table-wrap" style={{overflowX:'auto'}}>
          <table className="pm-table" style={{minWidth:600}}>
            <thead>
              <tr>
                <th style={{position:'sticky',left:0,background:'#f8fafc',zIndex:2}}>Material</th>
                {activeWHs.map(wh=>(
                  <th key={wh.id} style={{textAlign:'right'}}>
                    <div style={{fontSize:11,fontWeight:700,color:WH_TYPE_COLOR[wh.type]||'#6b7280'}}>{wh.name.split(' ').slice(0,2).join(' ')}</div>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:400}}>{wh.type}</div>
                  </th>
                ))}
                <th style={{textAlign:'right',background:'#f0f9ff'}}>Total</th>
                <th style={{textAlign:'right',background:'#f0f9ff'}}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const st = stockStatus(m);
                return (
                  <tr key={m.id}>
                    <td style={{position:'sticky',left:0,background:'#fff',zIndex:1,fontWeight:600,minWidth:180}}>
                      <div style={{color:'#0f172a'}}>{m.name}</div>
                      <div style={{fontSize:11,color:ACCENT,fontFamily:'monospace'}}>{m.code} · {m.unit}</div>
                    </td>
                    {activeWHs.map(wh=>{
                      const ws = stockForWH(m, wh.id);
                      return (
                        <td key={wh.id} style={{textAlign:'right',color:ws.qty>0?'#0f172a':'#e2e8f0',fontWeight:ws.qty>0?600:400}}>
                          {ws.qty > 0 ? ws.qty.toLocaleString() : '—'}
                        </td>
                      );
                    })}
                    <td style={{textAlign:'right',fontWeight:700,color:st.color,background:'#f8fafc'}}>{(m.totalQty||0).toLocaleString()}</td>
                    <td style={{textAlign:'right',fontWeight:600,color:ACCENT,background:'#f8fafc'}}>{fmtPKR(m.totalValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
