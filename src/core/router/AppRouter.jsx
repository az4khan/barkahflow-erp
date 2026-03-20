import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ERPLayout from '../layout/ERPLayout';
import LoadingScreen from '../../components/ui/LoadingScreen';

// ── Eager loaded (small, always needed) ──────────────────────────────────────
import LoginPage from '../../pages/Login/LoginPage';

// ── Lazy loaded modules ───────────────────────────────────────────────────────
const HomePage        = lazy(() => import('../../pages/Home/HomePage'));
const PurchaseApp     = lazy(() => import('../../modules/purchase/PurchaseApp'));
const AccountingApp   = lazy(() => import('../../modules/accounting/AccountingApp'));
const InventoryApp    = lazy(() => import('../../modules/inventory/InventoryApp'));
const SDApp           = lazy(() => import('../../modules/sd/SDApp'));
const POSApp          = lazy(() => import('../../modules/pos/POSApp'));
const DistApp         = lazy(() => import('../../modules/dist/DistApp'));
const HRApp           = lazy(() => import('../../modules/hr/HRApp'));
const UserManagement  = lazy(() => import('../../modules/user-management/UserManagementPage'));
const CompanySettings = lazy(() => import('../../modules/company-settings/CompanySettingsPage'));
const DatabaseBackup  = lazy(() => import('../../modules/db-backup/DatabaseBackupPage'));
const InboxPage       = lazy(() => import('../../pages/Inbox/InboxPage'));

// ── Protected route wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = currentUser.role?.name || currentUser.role || '';
    const hasAccess = roles.some(r =>
      userRole.toLowerCase().includes(r.toLowerCase())
    );
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

// ── Public route (redirect to home if already logged in) ─────────────────────
function PublicRoute({ children }) {
  const { currentUser } = useApp();
  if (currentUser) return <Navigate to="/" replace />;
  return children;
}

// ── Main router ───────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected — all inside ERPLayout shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ERPLayout />
            </ProtectedRoute>
          }
        >
          {/* Home */}
          <Route index element={<HomePage />} />

          {/* Inbox — focused task center, no module sidebar */}
          <Route path="inbox" element={<InboxPage />} />

          {/* Modules */}
          <Route path="purchase/*"    element={<PurchaseApp />} />
          <Route path="accounting/*"  element={<AccountingApp />} />
          <Route path="inventory/*"   element={<InventoryApp />} />
          <Route path="sd/*"          element={<SDApp />} />
          <Route path="pos/*"         element={<POSApp />} />
          <Route path="dist/*"        element={<DistApp />} />
          <Route path="hr/*"          element={<HRApp />} />

          <Route
            path="user-management/*"
            element={
              <ProtectedRoute roles={['admin', 'administrator']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="company-settings/*"
            element={
              <ProtectedRoute roles={['admin', 'administrator']}>
                <CompanySettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="db-backup/*"
            element={
              <ProtectedRoute roles={['admin', 'administrator']}>
                <DatabaseBackup />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
