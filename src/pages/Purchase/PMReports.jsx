import { StatCard } from "../../components/common/UI";
import Icon from "../../components/common/Icon";
import { fmtPKR, calcLanded } from "./purchaseConstants";

const REPORTS = [
  { name:"Monthly Purchase Summary", desc:"Month-wise purchase totals by supplier", size:"156 KB", date:"2026-03-03" },
  { name:"Supplier Ledger",           desc:"All transactions per supplier",           size:"89 KB",  date:"2026-03-03" },
  { name:"Landed Cost Analysis",      desc:"Detailed cost breakdown per PO",          size:"234 KB", date:"2026-03-02" },
  { name:"Purchase vs Budget",        desc:"Actual vs budgeted comparison",           size:"78 KB",  date:"2026-03-01" },
  { name:"Pending Orders Report",     desc:"All POs with pending status",             size:"45 KB",  date:"2026-03-03" },
  { name:"Supplier Performance",      desc:"Delivery time & quality metrics",         size:"112 KB", date:"2026-03-01" },
];

export default function PMReports({ purchases }) {
  const total    = purchases.reduce((s,p)=>s+calcLanded(p),0);
  const avgOrder = purchases.length ? total/purchases.length : 0;
  const totalQty = purchases.reduce((s,p)=>s+p.qty,0);
  const suppCount= [...new Set(purchases.map(p=>p.supplier))].length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="pm-page-title">Purchase Reports</h1>
          <p className="pm-page-sub">Analytics & reports for procurement module</p>
        </div>
        <button className="btn-primary"><Icon name="download" size={15}/> Export All</button>
      </div>

      <div className="stats-row">
        <StatCard icon="invoice"  iconColor="#f97316" iconBg="#fff7ed" label="Total Landed Cost" value={fmtPKR(total)}     badge="↑ 8.1%"/>
        <StatCard icon="trending" iconColor="#3b82f6" iconBg="#eff6ff" label="Avg Order Value"   value={fmtPKR(avgOrder)}  sub="Per order"/>
        <StatCard icon="box"      iconColor="#22c55e" iconBg="#f0fdf4" label="Total Units"       value={totalQty.toLocaleString()} sub="All products"/>
        <StatCard icon="suppliers" iconColor="#8b5cf6" iconBg="#f5f3ff" label="Suppliers Used"   value={suppCount}         sub="This period"/>
      </div>

      <div className="report-files-grid">
        {REPORTS.map((r,i)=>(
          <div key={i} className="report-file-card">
            <div className="report-file-icon">
              <Icon name="invoice" size={22} color="#f97316"/>
            </div>
            <div className="report-file-info">
              <div className="report-file-name">{r.name}</div>
              <div className="report-file-desc">{r.desc}</div>
            </div>
            <div className="report-file-meta">
              <div className="report-file-size">{r.size}</div>
              <div className="report-file-date">{r.date}</div>
            </div>
            <div className="report-file-actions">
              <button>View</button>
              <button>PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
