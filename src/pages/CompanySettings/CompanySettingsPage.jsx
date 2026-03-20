import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AppTopbar } from "../../components/common/Layout";
import { StatCard } from "../../components/common/UI";
import CompanyProfile from "./CompanyProfile";
import SubsidiaryManagement from "./SubsidiaryManagement";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";
import "./CompanySettings.css";

const TABS = [
  { id: "profile",       label: "Company Profile",      icon: "🏢" },
  { id: "subsidiaries",  label: "Subsidiaries",          icon: "🌐" },
  { id: "security",      label: "Security",              icon: "🔒" },
  { id: "notifications", label: "Notifications",         icon: "🔔" },
];

export default function CompanySettingsPage({ onHome }) {
  const { currentUser, logout, company, subsidiaries, security } = useApp();
  const [activeTab, setActiveTab] = useState("profile");

  const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "Company Settings";

  return (
    <div className="cs-layout">
      <AppTopbar
        title="Company Settings"
        subtitle={tabLabel}
        accentColor="#6366f1"
        currentUser={currentUser}
        onHome={onHome}
        onLogout={logout}
        onNavigate={(dest) => onHome && onHome(dest)}
      />

      <div className="cs-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Company Settings</h1>
            <p className="page-sub">Configure your company profile, subsidiaries, security and notifications</p>
          </div>
        </div>

        {/* KPI row */}
        <div className="stats-row four-col">
          <StatCard
            icon="building"
            iconColor="#8b5cf6"
            iconBg="#f5f3ff"
            label="Company"
            value={company.name.split(" ").slice(0, 2).join(" ")}
          />
          <StatCard
            icon="box"
            iconColor="#3b82f6"
            iconBg="#eff6ff"
            label="Subsidiaries"
            value={subsidiaries.length}
            sub={`${subsidiaries.filter((s) => s.status === "Active").length} active`}
          />
          <StatCard
            icon="shield"
            iconColor="#dc2626"
            iconBg="#fef2f2"
            label="Max Login Attempts"
            value={security.maxLoginAttempts}
            sub={`${security.sessionTimeout}m session timeout`}
          />
          <StatCard
            icon="calendar"
            iconColor="#d97706"
            iconBg="#fffbeb"
            label="Currency"
            value={company.currency}
            sub={`Symbol: ${company.currencySymbol}`}
          />
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "tab-active" : ""}`}
              style={activeTab === t.id ? { borderBottomColor: "#8b5cf6", color: "#8b5cf6" } : {}}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "profile"       && <CompanyProfile />}
          {activeTab === "subsidiaries"  && <SubsidiaryManagement />}
          {activeTab === "security"      && <SecuritySettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}
