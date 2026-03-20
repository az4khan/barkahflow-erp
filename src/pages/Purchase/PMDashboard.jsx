import { useState } from "react";
import { BarChart, DonutChart } from "./components/PurchaseCharts";
import { fmtPKR, calcLanded } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { StatCard } from "../../components/common/UI";

const TABS = ["Overview", "Purchase List", "Suppliers", "Landed Cost"];

export default function PMDashboard({ purchases, onNav }) {
  const [tab, setTab] = useState("Overview");

  const total     = purchases.reduce((s, p) => s + calcLanded(p), 0);
  const completed = purchases.filter(p => p.status === "Completed").length;
  const totalQty  = purchases.reduce((s, p) => s + p.qty, 0);

  const handleTab = (t) => {
    setTab(t);
    if (t === "Purchase List") onNav("purchase-list");
    if (t === "Suppliers")     onNav("pm-suppliers");
    if (t === "Landed Cost")   onNav("landed-cost");
  };

  return (
    <div className="pm-page">
      {/* Header */}
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Purchase Management</h1>
          <p className="pm-page-sub">International Energy Procurement — Module 1</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline">↓ Export</button>
          <button className="pm-btn pm-btn-primary" onClick={() => onNav("new-purchase")}>
            + New Purchase
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="pm-tab-bar">
        {TABS.map(t => (
          <button key={t}
            className={`pm-tab ${tab === t ? "active" : ""}`}
            onClick={() => handleTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="pm-stat-grid">
        <StatCard icon="invoice"  iconColor="#f97316" iconBg="#fff7ed"
          label="Total Landed Cost"  value={fmtPKR(total)}             badge="8.1%" />
        <StatCard icon="cart"     iconColor="#3b82f6" iconBg="#eff6ff"
          label="Total Purchases"    value={purchases.length}           sub="Active orders" />
        <StatCard icon="trending" iconColor="#22c55e" iconBg="#f0fdf4"
          label="Completed Orders"   value={completed}                  sub="This month" />
        <StatCard icon="box"      iconColor="#8b5cf6" iconBg="#f5f3ff"
          label="Total Qty (Units)"  value={totalQty.toLocaleString()}  sub="All products" />
      </div>

      {/* Charts */}
      <div className="pm-charts-row">
        <div className="pm-chart-card">
          <div className="pm-chart-title">Monthly Purchase Trend (PKR)</div>
          <BarChart />
        </div>
        <div className="pm-chart-card">
          <div className="pm-chart-title">Cost Breakdown by Category</div>
          <DonutChart />
        </div>
      </div>
    </div>
  );
}
