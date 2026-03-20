import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { AppTopbar } from "../../components/common/Layout";
import { StatCard } from "../../components/common/UI";
import UserList from "./UserList";
import RoleManagement from "./RoleManagement";
import AuditLog from "./AuditLog";
import "./UserManagement.css";

const TABS = [
  { id: "users",   label: "User List",        icon: "👥" },
  { id: "roles",   label: "Role Management",  icon: "🛡️" },
  { id: "audit",   label: "Audit Log",        icon: "📋" },
];

export default function UserManagementPage({ onHome }) {
  const { currentUser, logout, users, roles } = useApp();
  const [activeTab, setActiveTab] = useState("users");

  const activeUsers   = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status !== "Active").length;

  const tabLabel = TABS.find((t) => t.id === activeTab)?.label || "User Management";

  return (
    <div className="um-layout">
      {/* Top Bar */}
      <AppTopbar
        title="User Management"
        subtitle={tabLabel}
        accentColor="#8b5cf6"
        currentUser={currentUser}
        onHome={onHome}
        onLogout={logout}
        onNavigate={(dest) => onHome && onHome(dest)}
      />

      {/* Page content */}
      <div className="um-body">
        {/* Page heading */}
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-sub">
              Manage users, define roles and assign authorizations
            </p>
          </div>
        </div>

        {/* KPI row */}
        <div className="stats-row four-col">
          <StatCard
            icon="users"
            iconColor="#3b82f6"
            iconBg="#eff6ff"
            label="Total Users"
            value={users.length}
          />
          <StatCard
            icon="check"
            iconColor="#16a34a"
            iconBg="#f0fdf4"
            label="Active Users"
            value={activeUsers}
          />
          <StatCard
            icon="shield"
            iconColor="#8b5cf6"
            iconBg="#f5f3ff"
            label="Roles Defined"
            value={roles.length}
          />
          <StatCard
            icon="lock"
            iconColor="#d97706"
            iconBg="#fffbeb"
            label="Inactive / Locked"
            value={inactiveUsers}
          />
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === "users" && <UserList />}
          {activeTab === "roles" && <RoleManagement />}
          {activeTab === "audit" && <AuditLog />}
        </div>
      </div>
    </div>
  );
}
