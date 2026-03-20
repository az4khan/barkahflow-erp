import Icon     from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKR } from '../../../data/mockData';
import { WH_TYPE_COLOR, MOV_COLOR } from '../inventoryConstants';

const ACCENT = '#0ea5e9';

export default function INVDashboard() {
  const { invMaterials, warehouses, stockLedger } = useApp();

  const mats = invMaterials || [];
  const whs  = warehouses   || [];
  const sl   = stockLedger  || [];

  // KPIs
  const totalValue    = mats.reduce((s, m) => s + (m.totalValue || 0), 0);
  const totalItems    = mats.length;
  const totalQtyUnits = mats.reduce((s, m) => s + (m.totalQty || 0), 0);
  const lowStock      = mats.filter(m => (m.totalQty || 0) <= (m.reorderPoint || 0));
  const zeroStock     = mats.filter(m => (m.totalQty || 0) === 0);
  const activeWH      = whs.filter(w => w.status === 'active').length;

  // Recent movements
  const recentMov = [...sl].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 8);

  // Value by category
  const byCategory = mats.reduce((acc, m) => {
    const cat = m.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (m.totalValue || 0);
    return acc;
  }, {});
  const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCatVal  = catEntries[0]?.[1] || 1;

  // Stock by warehouse
  const whStock = whs.map(wh => {
    const val = mats.reduce((s, m) => {
      const ws = (m.stockByWarehouse || []).find(w => w.warehouseId === wh.id);
      return s + (ws?.value || 0);
    }, 0);
    const qty = mats.reduce((s, m) => {
      const ws = (m.stockByWarehouse || []).find(w => w.warehouseId === wh.id);
      return s + (ws?.qty || 0);
    }, 0);
    return { ...wh, val, qty };
  }).filter(w => w.val > 0);

  const STATS = [
    { label: 'Total Stock Value',  value: fmtPKR(totalValue),       icon: 'briefcase', bg: '#f0f9ff', color: ACCENT },
    { label: 'Material SKUs',      value: totalItems,                icon: 'products',  bg: '#fffbeb', color: '#f59e0b' },
    { label: 'Total Units',        value: totalQtyUnits.toLocaleString(), icon: 'box', bg: '#f0fdf4', color: '#10b981' },
    { label: 'Active Warehouses',  value: activeWH,                  icon: 'building',  bg: '#f5f3ff', color: '#8b5cf6' },
    { label: 'Low / Reorder',      value: lowStock.length,           icon: 'bell',      bg: '#fffbeb', color: '#f59e0b', alert: lowStock.length > 0 },
    { label: 'Zero Stock Items',   value: zeroStock.length,          icon: 'alert',     bg: '#fef2f2', color: '#ef4444', alert: zeroStock.length > 0 },
  ];

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Inventory Dashboard</h2>
          <p className="pm-page-sub">Al-Raza LPG — Stock Overview · Moving Average Price (MAP)</p>
        </div>
        <div className="pm-page-actions">
          <span style={{ fontSize: 11, background: '#f0f9ff', color: ACCENT, padding: '4px 12px', borderRadius: 20, fontWeight: 600, border: `1px solid ${ACCENT}40` }}>
            Valuation: Moving Average Price (MAP)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="pm-stat-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        {STATS.map(s => (
          <div className="pm-stat-card" key={s.label} style={{ borderTop: s.alert ? '3px solid #ef4444' : undefined }}>
            <div className="pm-stat-top">
              <div className="pm-stat-icon" style={{ background: s.bg }}><Icon name={s.icon} size={17} color={s.color} /></div>
              {s.alert && <span style={{ fontSize: 10, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>!</span>}
            </div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{ fontSize: 18 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Stock Value by Category */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Stock Value by Category</div></div>
          <div style={{ padding: '14px 18px' }}>
            {catEntries.map(([cat, val]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{cat}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{fmtPKR(val)}</span>
                </div>
                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(val / maxCatVal) * 100}%`, background: ACCENT, borderRadius: 4, transition: 'width 0.7s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock by Warehouse */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Stock by Warehouse</div></div>
          <table className="pm-table">
            <thead><tr><th>Warehouse</th><th>Type</th><th style={{ textAlign: 'right' }}>Units</th><th style={{ textAlign: 'right' }}>Value</th></tr></thead>
            <tbody>
              {whStock.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{w.name}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: (WH_TYPE_COLOR[w.type] || '#94a3b8') + '18', color: WH_TYPE_COLOR[w.type] || '#94a3b8' }}>
                      {w.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{w.qty.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: ACCENT }}>{fmtPKR(w.val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Recent Stock Movements */}
        <div className="pm-table-wrap">
          <div className="pm-table-header">
            <div className="pm-table-title">Recent Movements</div>
          </div>
          <div style={{ padding: '0 4px' }}>
            {recentMov.map(mv => (
              <div key={mv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: (MOV_COLOR[mv.movType] || '#94a3b8') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: MOV_COLOR[mv.movType] || '#94a3b8' }}>{mv.qty > 0 ? '+' : '−'}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>{mv.materialName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{mv.movLabel} · {mv.whName}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: MOV_COLOR[mv.movType] || '#374151' }}>{mv.qty > 0 ? '+' : ''}{mv.qty}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{mv.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="pm-table-wrap" style={{ borderTop: lowStock.length ? '3px solid #f59e0b' : undefined }}>
          <div className="pm-table-header">
            <div className="pm-table-title">
              Low Stock Alerts
              {lowStock.length > 0 && <span style={{ marginLeft: 8, fontSize: 11, background: '#fffbeb', color: '#f59e0b', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{lowStock.length} items</span>}
            </div>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#10b981', fontSize: 13, fontWeight: 600 }}>✓ All stock levels are healthy</div>
          ) : (
            <table className="pm-table">
              <thead><tr><th>Material</th><th style={{ textAlign: 'right' }}>Current</th><th style={{ textAlign: 'right' }}>Reorder At</th><th>Status</th></tr></thead>
              <tbody>
                {lowStock.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.code}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: m.totalQty === 0 ? '#ef4444' : '#f59e0b' }}>{m.totalQty} {m.unit}</td>
                    <td style={{ textAlign: 'right', color: '#94a3b8' }}>{m.reorderPoint} {m.unit}</td>
                    <td>
                      <span className={`pm-badge ${m.totalQty === 0 ? 'pm-badge-red' : 'pm-badge-orange'}`}>
                        {m.totalQty === 0 ? 'Out of Stock' : 'Reorder Now'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
