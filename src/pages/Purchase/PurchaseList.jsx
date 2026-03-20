import { useState } from "react";
import { Modal } from "../../components/common/UI";
import Icon from "../../components/common/Icon";
import { fmtPKR, calcLanded, ACCENT } from "./purchaseConstants";

function StatusBadge({ status }) {
  const map = {
    "Completed": "pm-badge pm-badge-completed",
    "In Transit": "pm-badge pm-badge-transit",
    "Pending":    "pm-badge pm-badge-pending",
  };
  return <span className={map[status] || "pm-badge pm-badge-pending"}>{status}</span>;
}

export default function PurchaseList({ purchases, onEdit, onDelete, onNav, toastFn }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewPO, setViewPO] = useState(null);

  const filtered = purchases.filter(p =>
    (filter === "All" || p.status === filter) &&
    (!search || p.id.toLowerCase().includes(search.toLowerCase()) ||
     p.supplier.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="pm-page-title">Purchase List</h1>
          <p className="pm-page-sub">All purchase orders — {purchases.length} records</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline">↓ Export</button>
          <button className="btn-primary" onClick={() => onNav("new-purchase")}>+ New Purchase</button>
        </div>
      </div>

      {/* Stats */}
      <div className="pm-stat-grid">
        <StatCard icon="cart"     iconColor="#3b82f6" iconBg="#eff6ff" label="All records"  value={purchases.length} />
        <StatCard icon="trending" iconColor="#22c55e" iconBg="#f0fdf4" label="Delivered"    value={purchases.filter(p => p.status === "Completed").length} sub="Completed" />
        <StatCard icon="box"      iconColor="#f97316" iconBg="#fff7ed" label="Ongoing"      value={purchases.filter(p => p.status === "In Transit").length} sub="In Transit" />
        <StatCard icon="clock"    iconColor="#9ca3af" iconBg="#f9fafb" label="Awaiting"     value={purchases.filter(p => p.status === "Pending").length} sub="Pending" />
      </div>

      {/* Search + Filter */}
      <div className="pm-filter-row">
        <div className="pm-filter-search">
          <Icon name="search" size={14} color="#9ca3af" />
          <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["All", "Completed", "In Transit", "Pending"].map(f => (
          <button key={f}
            className={`pm-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Purchase ID</th><th>Supplier</th><th>Product</th>
              <th>Qty</th><th>Unit Price</th><th>Landed Cost</th>
              <th>Subsidiary</th><th>Date</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><span className="pm-po-id" style={{ cursor: "pointer" }} onClick={() => setViewPO(p)}>{p.id}</span></td>
                <td>{p.supplier}</td>
                <td>{p.product}</td>
                <td>{p.qty.toLocaleString()}</td>
                <td>Rs{p.unitPrice.toLocaleString()}</td>
                <td><span className="pm-po-cost">{fmtPKR(calcLanded(p))}</span></td>
                <td>{p.subsidiary}</td>
                <td>{p.date}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6 }} title="View" onClick={() => setViewPO(p)}><Icon name="eye" size={14} color="#6b7280" /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6 }} title="Edit" onClick={() => onEdit(p)}><Icon name="edit" size={14} color={ACCENT} /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6 }} title="Delete" onClick={() => { onDelete(p.id); toastFn("Deleted.", "success"); }}><Icon name="trash" size={14} color="#ef4444" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PO Detail Modal */}
      {viewPO && (
        <Modal title={`Purchase Order — ${viewPO.id}`} onClose={() => setViewPO(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Supplier", viewPO.supplier], ["Product", viewPO.product],
              ["Quantity", `${viewPO.qty.toLocaleString()} units`],
              ["Unit Price", `Rs${viewPO.unitPrice.toLocaleString()}`],
              ["Transportation", fmtPKR(viewPO.transportation)],
              ["Customs Duty", fmtPKR(viewPO.customs)],
              ["Brokerage Fee", fmtPKR(viewPO.brokerage)],
              ["Port Charges", fmtPKR(viewPO.port)],
              ["Loading", fmtPKR(viewPO.loading)],
              ["Miscellaneous", fmtPKR(viewPO.misc)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f9fafb", fontSize: 13 }}>
                <span style={{ color: "#9ca3af" }}>{l}</span>
                <strong style={{ color: "#374151" }}>{v}</strong>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #f3f4f6", marginTop: 4 }}>
              <span style={{ fontWeight: 700, color: "#111827" }}>Total Landed Cost</span>
              <strong style={{ color: "#f97316", fontSize: 15 }}>{fmtPKR(calcLanded(viewPO))}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#9ca3af" }}>Status</span>
              <StatusBadge status={viewPO.status} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
