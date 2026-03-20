import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData';
import {
  INITIAL_ACCOUNTS, INITIAL_JOURNAL, INITIAL_AR, INITIAL_AP_BILLS,
  INITIAL_VOUCHERS, INITIAL_BANK_TX, INITIAL_COST_CENTERS, INITIAL_TAX_RATES,
  INITIAL_WAREHOUSES, INITIAL_INV_MATERIALS, INITIAL_STOCK_LEDGER, INV_MOVEMENT_TYPES,
  INITIAL_SD_PARTIES, INITIAL_SD_PRICE_LISTS, INITIAL_SALES_ORDERS,
  INITIAL_DELIVERY_ORDERS, INITIAL_SALES_INVOICES, INITIAL_COMMISSION_REPS,
  INITIAL_POS_TERMINALS, INITIAL_POS_SESSIONS, INITIAL_POS_SALES,
  INITIAL_DIST_ROUTES, INITIAL_DIST_VEHICLES, INITIAL_DIST_DRIVERS,
  INITIAL_LOAD_ORDERS, INITIAL_TRIPS, INITIAL_SETTLEMENTS,
  INITIAL_MAINTENANCE, INITIAL_FUEL_LOG,
  INITIAL_HR_DEPARTMENTS, INITIAL_HR_DESIGNATIONS, INITIAL_EMPLOYEES,
  INITIAL_SALARY_STRUCTURES, INITIAL_PAYROLL_PERIODS, INITIAL_PAYROLL_RECORDS,
  INITIAL_ATTENDANCE, INITIAL_LEAVES, INITIAL_LOANS,
} from '../data/mockData';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'barkahflow_state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('State save failed:', e);
  }
}

function generateId(prefix) {
  const num = String(Math.floor(Math.random() * 90000) + 10000);
  return `${prefix}-${num}`;
}

function nowISO() { return new Date().toISOString(); }

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const saved = loadState();

  // ── Auth ──
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('barkahflow_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  // ── Core data (persisted) ──
  const [users,         setUsers]         = useState(saved?.users         ?? mockData.users);
  const [roles,         setRoles]         = useState(saved?.roles         ?? mockData.roles);
  const [company,       setCompanyData]   = useState(saved?.company       ?? mockData.company);
  const [subsidiaries,  setSubsidiaries]  = useState(saved?.subsidiaries  ?? mockData.subsidiaries);
  const [security,      setSecurity]      = useState(saved?.security      ?? mockData.security);
  const [notifSettings, setNotifSettings] = useState(saved?.notifSettings ?? mockData.notificationSettings);

  // ── Purchase data (persisted) ──
  const [purchases,     setPurchases]     = useState(saved?.purchases     ?? mockData.purchases);
  const [suppliers,     setSuppliers]     = useState(saved?.suppliers     ?? mockData.suppliers);
  const [materials,     setMaterials]     = useState(saved?.materials     ?? mockData.materials);
  const [prs,           setPRs]           = useState(saved?.prs           ?? mockData.prs);
  const [rfqs,          setRFQs]          = useState(saved?.rfqs          ?? mockData.rfqs);
  const [quotations,    setQuotations]    = useState(saved?.quotations    ?? mockData.quotations);
  const [purchaseOrders,setPOs]           = useState(saved?.purchaseOrders ?? mockData.purchaseOrders);
  const [grns,          setGRNs]          = useState(saved?.grns          ?? mockData.grns);
  const [approvalStrategies, setApprovalStrategies] = useState(saved?.approvalStrategies ?? mockData.approvalStrategies);

  // ── Activity log & Notifications (persisted) ──
  const [activityLog,   setActivityLog]   = useState(saved?.activityLog   ?? []);
  const [notifications, setNotifications] = useState(saved?.notifications ?? mockData.notifications);

  // ── Accounting data (persisted) ──
  const [acAccounts,    setAcAccounts]    = useState(saved?.acAccounts    ?? INITIAL_ACCOUNTS);
  const [acJournal,     setAcJournal]     = useState(saved?.acJournal     ?? INITIAL_JOURNAL);
  const [acAR,          setAcAR]          = useState(saved?.acAR          ?? INITIAL_AR);
  const [acAP,          setAcAP]          = useState(saved?.acAP          ?? INITIAL_AP_BILLS);
  const [acVouchers,    setAcVouchers]    = useState(saved?.acVouchers    ?? INITIAL_VOUCHERS);
  const [acBankTx,      setAcBankTx]      = useState(saved?.acBankTx      ?? INITIAL_BANK_TX);
  const [acCostCenters, setAcCostCenters] = useState(saved?.acCostCenters ?? INITIAL_COST_CENTERS);
  const [acTaxRates,    setAcTaxRates]    = useState(saved?.acTaxRates    ?? INITIAL_TAX_RATES);

  // ── Inventory data (persisted) ──
  const [warehouses,    setWarehouses]    = useState(saved?.warehouses    ?? INITIAL_WAREHOUSES);
  const [invMaterials,  setInvMaterials]  = useState(saved?.invMaterials  ?? INITIAL_INV_MATERIALS);
  const [stockLedger,   setStockLedger]   = useState(saved?.stockLedger   ?? INITIAL_STOCK_LEDGER);

  // ── S&D data (persisted) ──
  const [sdParties,       setSdParties]       = useState(saved?.sdParties       ?? INITIAL_SD_PARTIES);
  const [sdPriceLists,    setSdPriceLists]    = useState(saved?.sdPriceLists    ?? INITIAL_SD_PRICE_LISTS);
  const [salesOrders,     setSalesOrders]     = useState(saved?.salesOrders     ?? INITIAL_SALES_ORDERS);
  const [deliveryOrders,  setDeliveryOrders]  = useState(saved?.deliveryOrders  ?? INITIAL_DELIVERY_ORDERS);
  const [salesInvoices,   setSalesInvoices]   = useState(saved?.salesInvoices   ?? INITIAL_SALES_INVOICES);
  const [salesReturns,    setSalesReturns]    = useState(saved?.salesReturns    ?? []);
  const [commissionReps,  setCommissionReps]  = useState(saved?.commissionReps  ?? INITIAL_COMMISSION_REPS);

  // ── POS data (persisted) ──
  const [posTerminals,  setPosTerminals]  = useState(saved?.posTerminals  ?? INITIAL_POS_TERMINALS);
  const [posSessions,   setPosSessions]   = useState(saved?.posSessions   ?? INITIAL_POS_SESSIONS);
  const [posSales,      setPosSales]      = useState(saved?.posSales      ?? INITIAL_POS_SALES);

  // ── Distribution data (persisted) ──
  const [distRoutes,     setDistRoutes]     = useState(saved?.distRoutes     ?? INITIAL_DIST_ROUTES);
  const [distVehicles,   setDistVehicles]   = useState(saved?.distVehicles   ?? INITIAL_DIST_VEHICLES);
  const [distDrivers,    setDistDrivers]    = useState(saved?.distDrivers    ?? INITIAL_DIST_DRIVERS);
  const [loadOrders,     setLoadOrders]     = useState(saved?.loadOrders     ?? INITIAL_LOAD_ORDERS);
  const [trips,          setTrips]          = useState(saved?.trips          ?? INITIAL_TRIPS);
  const [settlements,    setSettlements]    = useState(saved?.settlements    ?? INITIAL_SETTLEMENTS);
  const [maintenance,    setMaintenance]    = useState(saved?.maintenance    ?? INITIAL_MAINTENANCE);
  const [fuelLog,        setFuelLog]        = useState(saved?.fuelLog        ?? INITIAL_FUEL_LOG);

  // ── HR data (persisted) ──
  const [hrDepartments,    setHrDepartments]    = useState(saved?.hrDepartments    ?? INITIAL_HR_DEPARTMENTS);
  const [hrDesignations,   setHrDesignations]   = useState(saved?.hrDesignations   ?? INITIAL_HR_DESIGNATIONS);
  const [employees,        setEmployees]        = useState(saved?.employees        ?? INITIAL_EMPLOYEES);
  const [salaryStructures, setSalaryStructures] = useState(saved?.salaryStructures ?? INITIAL_SALARY_STRUCTURES);
  const [payrollPeriods,   setPayrollPeriods]   = useState(saved?.payrollPeriods   ?? INITIAL_PAYROLL_PERIODS);
  const [payrollRecords,   setPayrollRecords]   = useState(saved?.payrollRecords   ?? INITIAL_PAYROLL_RECORDS);
  const [attendance,       setAttendance]       = useState(saved?.attendance       ?? INITIAL_ATTENDANCE);
  const [leaves,           setLeaves]           = useState(saved?.leaves           ?? INITIAL_LEAVES);
  const [loans,            setLoans]            = useState(saved?.loans            ?? INITIAL_LOANS);
  const [finalSettlements, setFinalSettlements] = useState(saved?.finalSettlements ?? []);

  // ── UI (not persisted) ──
  const [toasts, setToasts] = useState([]);

  // ── Persist state on every change ────────────────────────────────────────────
  useEffect(() => {
    saveState({
      users, roles, company, subsidiaries, security, notifSettings,
      purchases, suppliers, materials, prs, rfqs, quotations,
      purchaseOrders, grns, approvalStrategies,
      activityLog, notifications,
      acAccounts, acJournal, acAR, acAP, acVouchers, acBankTx, acCostCenters, acTaxRates,
      warehouses, invMaterials, stockLedger,
      sdParties, sdPriceLists, salesOrders, deliveryOrders, salesInvoices, salesReturns, commissionReps,
      posTerminals, posSessions, posSales,
      distRoutes, distVehicles, distDrivers, loadOrders, trips, settlements, maintenance, fuelLog,
      hrDepartments, hrDesignations, employees, salaryStructures,
      payrollPeriods, payrollRecords, attendance, leaves, loans, finalSettlements,
    });
  }, [
    users, roles, company, subsidiaries, security, notifSettings,
    purchases, suppliers, materials, prs, rfqs, quotations,
    purchaseOrders, grns, approvalStrategies,
    activityLog, notifications,
    acAccounts, acJournal, acAR, acAP, acVouchers, acBankTx, acCostCenters, acTaxRates,
    warehouses, invMaterials, stockLedger,
    sdParties, sdPriceLists, salesOrders, deliveryOrders, salesInvoices, salesReturns, commissionReps,
    posTerminals, posSessions, posSales,
    distRoutes, distVehicles, distDrivers, loadOrders, trips, settlements, maintenance, fuelLog,
    hrDepartments, hrDesignations, employees, salaryStructures,
    payrollPeriods, payrollRecords, attendance, leaves, loans, finalSettlements,
  ]);

  // ── Activity Logger ───────────────────────────────────────────────────────────
  const logActivity = useCallback((action, module, detail) => {
    const entry = {
      id:        generateId('LOG'),
      user:      currentUser?.firstName || currentUser?.username || 'System',
      userId:    currentUser?.id,
      action,
      module,
      detail,
      timestamp: nowISO(),
      display:   formatTimestamp(nowISO()),
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 1000)); // keep last 1000
  }, [currentUser]);

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'info') => {
    const id = generateId('TOAST');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Push notification ─────────────────────────────────────────────────────────
  const pushNotification = useCallback((title, message, type = 'info') => {
    const notif = {
      id:      generateId('NOTIF'),
      title,
      message,
      type,
      read:    false,
      time:    formatTimestamp(nowISO()),
      created: nowISO(),
    };
    setNotifications(prev => [notif, ...prev].slice(0, 100));
  }, []);

  // ══════════════════════════════════════════════════════════════════════════════
  // AUTH ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function login(user) {
    const enriched = { ...user, lastLogin: nowISO() };
    setCurrentUser(enriched);
    localStorage.setItem('barkahflow_user', JSON.stringify(enriched));
    logActivity('Logged in', 'Auth', `User ${user.username} logged in`);
  }

  function logout() {
    logActivity('Logged out', 'Auth', `User ${currentUser?.username} logged out`);
    setCurrentUser(null);
    localStorage.removeItem('barkahflow_user');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // USER ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createUser(data) {
    const user = { ...data, id: generateId('USR'), createdAt: nowISO(), status: 'active' };
    setUsers(prev => [...prev, user]);
    logActivity('Created User', 'User Management', `Created user: ${user.username}`);
    toast('User created successfully', 'success');
    return user;
  }
  function updateUser(id, data) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data, updatedAt: nowISO() } : u));
    logActivity('Updated User', 'User Management', `Updated user ID: ${id}`);
    toast('User updated', 'success');
  }
  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
    logActivity('Deleted User', 'User Management', `Deleted user ID: ${id}`);
    toast('User deleted', 'success');
  }
  function resetPassword(id, password) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password, updatedAt: nowISO() } : u));
    logActivity('Reset Password', 'User Management', `Password reset for user ID: ${id}`);
    toast('Password reset', 'success');
  }
  function toggleUserStatus(id) {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === 'active' ? 'inactive' : 'active', updatedAt: nowISO() }
      : u
    ));
    logActivity('Toggled User Status', 'User Management', `Toggled status for user ID: ${id}`);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ROLE ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createRole(data) {
    const role = { ...data, id: generateId('ROLE'), createdAt: nowISO() };
    setRoles(prev => [...prev, role]);
    logActivity('Created Role', 'User Management', `Created role: ${role.name}`);
    toast('Role created', 'success');
    return role;
  }
  function updateRole(id, data) {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logActivity('Updated Role', 'User Management', `Updated role ID: ${id}`);
    toast('Role updated', 'success');
  }
  function deleteRole(id) {
    setRoles(prev => prev.filter(r => r.id !== id));
    logActivity('Deleted Role', 'User Management', `Deleted role ID: ${id}`);
    toast('Role deleted', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // COMPANY ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function setCompany(data) {
    setCompanyData(prev => ({ ...prev, ...data, updatedAt: nowISO() }));
    logActivity('Updated Company', 'Company Settings', 'Company profile updated');
    toast('Company settings saved', 'success');
  }
  function createSubsidiary(data) {
    const s = { ...data, id: generateId('SUB'), createdAt: nowISO() };
    setSubsidiaries(prev => [...prev, s]);
    logActivity('Created Subsidiary', 'Company Settings', `Created: ${s.name}`);
    toast('Subsidiary added', 'success');
    return s;
  }
  function updateSubsidiary(id, data) {
    setSubsidiaries(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    logActivity('Updated Subsidiary', 'Company Settings', `Updated subsidiary ID: ${id}`);
    toast('Subsidiary updated', 'success');
  }
  function deleteSubsidiary(id) {
    setSubsidiaries(prev => prev.filter(s => s.id !== id));
    logActivity('Deleted Subsidiary', 'Company Settings', `Deleted subsidiary ID: ${id}`);
    toast('Subsidiary removed', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PURCHASE REQUISITION ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createPR(data) {
    const pr = {
      ...data,
      id:        generateId('PR'),
      status:    'draft',
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setPRs(prev => [pr, ...prev]);
    logActivity('Created PR', 'Purchase', `Created PR: ${pr.id}`);
    toast('Purchase Requisition created', 'success');
    return pr;
  }
  function updatePR(id, data) {
    setPRs(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: nowISO() } : p));
    logActivity('Updated PR', 'Purchase', `Updated PR: ${id}`);
    toast('PR updated', 'success');
  }
  function deletePR(id) {
    setPRs(prev => prev.filter(p => p.id !== id));
    logActivity('Deleted PR', 'Purchase', `Deleted PR: ${id}`);
    toast('PR deleted', 'success');
  }
  function forwardPR(id) {
    setPRs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'initiated', forwardedAt: nowISO(), updatedAt: nowISO() } : p
    ));
    // Create inbox item
    const pr = prs.find(p => p.id === id);
    createInboxItem({
      type:       'PR_APPROVAL',
      refId:      id,
      refNo:      pr?.id,
      title:      `PR Approval: ${id}`,
      message:    `Purchase Requisition ${id} submitted for approval`,
      module:     'Purchase',
      priority:   'normal',
    });
    pushNotification('PR Submitted', `PR ${id} has been forwarded for approval`, 'info');
    logActivity('Forwarded PR', 'Purchase', `Forwarded PR: ${id} for approval`);
    toast('PR forwarded for approval', 'success');
  }
  function approvePR(id, note) {
    setPRs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved', approvedAt: nowISO(), approvalNote: note, updatedAt: nowISO() } : p
    ));
    logActivity('Approved PR', 'Purchase', `Approved PR: ${id}`);
    toast('PR approved', 'success');
  }
  function rejectPR(id, reason) {
    setPRs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected', rejectedAt: nowISO(), rejectionReason: reason, updatedAt: nowISO() } : p
    ));
    logActivity('Rejected PR', 'Purchase', `Rejected PR: ${id}. Reason: ${reason}`);
    toast('PR rejected', 'warning');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RFQ ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createRFQ(data) {
    const rfq = {
      ...data,
      id:        generateId('RFQ'),
      status:    'draft',
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setRFQs(prev => [rfq, ...prev]);
    logActivity('Created RFQ', 'Purchase', `Created RFQ: ${rfq.id}`);
    toast('RFQ created', 'success');
    return rfq;
  }
  function updateRFQ(id, data) {
    setRFQs(prev => prev.map(r => r.id === id ? { ...r, ...data, updatedAt: nowISO() } : r));
    logActivity('Updated RFQ', 'Purchase', `Updated RFQ: ${id}`);
  }
  function sendRFQ(id) {
    setRFQs(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'sent', sentAt: nowISO(), updatedAt: nowISO() } : r
    ));
    logActivity('Sent RFQ', 'Purchase', `RFQ ${id} sent to suppliers`);
    toast('RFQ sent to suppliers', 'success');
  }
  function addQuote(rfqId, quoteData) {
    const quote = {
      ...quoteData,
      id:        generateId('QT'),
      rfqId,
      createdAt: nowISO(),
    };
    setQuotations(prev => [...prev, quote]);
    setRFQs(prev => prev.map(r =>
      r.id === rfqId ? { ...r, status: 'quoted', updatedAt: nowISO() } : r
    ));
    logActivity('Added Quote', 'Purchase', `Quote added for RFQ: ${rfqId}`);
    toast('Quotation added', 'success');
    return quote;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PURCHASE ORDER ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createPO(data) {
    const po = {
      ...data,
      id:        generateId('PO'),
      status:    'draft',
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setPOs(prev => [po, ...prev]);
    logActivity('Created PO', 'Purchase', `Created PO: ${po.id}`);
    toast('Purchase Order created', 'success');
    return po;
  }
  function updatePO(id, data) {
    setPOs(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: nowISO() } : p));
    logActivity('Updated PO', 'Purchase', `Updated PO: ${id}`);
    toast('PO updated', 'success');
  }
  function deletePO(id) {
    setPOs(prev => prev.filter(p => p.id !== id));
    logActivity('Deleted PO', 'Purchase', `Deleted PO: ${id}`);
    toast('PO deleted', 'success');
  }
  function forwardPO(id) {
    setPOs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'initiated', forwardedAt: nowISO(), updatedAt: nowISO() } : p
    ));
    const po = purchaseOrders.find(p => p.id === id);
    createInboxItem({
      type:    'PO_APPROVAL',
      refId:   id,
      refNo:   po?.id,
      title:   `PO Approval: ${id}`,
      message: `Purchase Order ${id} submitted for approval`,
      module:  'Purchase',
    });
    pushNotification('PO Submitted', `PO ${id} has been forwarded for approval`, 'info');
    logActivity('Forwarded PO', 'Purchase', `Forwarded PO: ${id}`);
    toast('PO forwarded for approval', 'success');
  }
  function approvePO(id, note) {
    const po = purchaseOrders.find(p => p.id === id);
    setPOs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved', approvedAt: nowISO(), approvalNote: note, updatedAt: nowISO() } : p
    ));
    // ── Auto Journal Entry: PO Approved — commitment note only (no balance impact) ──
    const amt = po?.totalAmount || 0;
    if (amt > 0) {
      autoJournalEntry({
        description: `PO Approved: ${id} — ${po?.supplierName || 'Supplier'}`,
        ref: id,
        entries: [
          { account: '2001', label: 'Accounts Payable (Commitment)', dr: 0,   cr: amt },
          { account: '1020', label: 'Goods in Transit',              dr: amt, cr: 0   },
        ],
      });
    }
    logActivity('Approved PO', 'Purchase', `Approved PO: ${id}`);
    toast('PO approved', 'success');
  }
  function rejectPO(id, reason) {
    setPOs(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected', rejectedAt: nowISO(), rejectionReason: reason, updatedAt: nowISO() } : p
    ));
    logActivity('Rejected PO', 'Purchase', `Rejected PO: ${id}`);
    toast('PO rejected', 'warning');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // GRN ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createGRN(data) {
    const grn = {
      ...data,
      id:        generateId('GRN'),
      status:    'draft',
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setGRNs(prev => [grn, ...prev]);
    logActivity('Created GRN', 'Purchase', `Created GRN: ${grn.id}`);
    toast('GRN created', 'success');
    return grn;
  }
  function completeGRN(id) {
    const grn = grns.find(g => g.id === id);
    setGRNs(prev => prev.map(g =>
      g.id === id ? { ...g, status: 'completed', completedAt: nowISO(), updatedAt: nowISO() } : g
    ));
    // Auto-create purchase list entry
    if (grn) {
      const entry = {
        id:         generateId('PL'),
        type:       'grn',
        grnId:      id,
        poId:       grn.poId,
        supplierId: grn.supplierId,
        supplierName: grn.supplierName,
        items:      grn.items,
        totalAmount: grn.totalAmount,
        status:     'posted',
        postedAt:   nowISO(),
        createdAt:  nowISO(),
      };
      setPurchases(prev => [entry, ...prev]);

      // ── Auto Journal Entry: Dr Inventory / Cr Accounts Payable ──
      const amt = grn.totalAmount || 0;
      if (amt > 0) {
        autoJournalEntry({
          description: `GRN Completed: ${id} — ${grn.supplierName || 'Supplier'}`,
          ref: id,
          entries: [
            { account: '1020', label: 'Inventory',        dr: amt, cr: 0 },
            { account: '2001', label: 'Accounts Payable', dr: 0,   cr: amt },
          ],
        });
        // Also add to AP ledger
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        setAcAP(prev => [{
          id:     `BILL-${id}`,
          vendor: grn.supplierName || 'Supplier',
          date:   nowISO().slice(0, 10),
          due:    dueDate,
          amount: amt,
          paid:   0,
          status: 'Open',
          ref:    id,
        }, ...prev]);
      }

      // ── Post each item to Inventory Module (MAP recalculation) ──
      postGRNToInventory(grn);
    }
    // Update inventory
    if (grn?.items) {
      grn.items.forEach(item => {
        logActivity('Inventory Updated', 'Inventory', `+${item.receivedQty} ${item.unit} of ${item.materialName} via GRN ${id}`);
      });
    }
    logActivity('Completed GRN', 'Purchase', `GRN ${id} completed and posted to inventory`);
    toast('GRN completed — inventory & accounts updated', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DIRECT PURCHASE ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createDirectPurchase(data) {
    const entry = {
      ...data,
      id:        generateId('DP'),
      type:      'direct',
      status:    'draft',
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setPurchases(prev => [entry, ...prev]);
    logActivity('Created Direct Purchase', 'Purchase', `Created direct purchase: ${entry.id}`);
    toast('Direct purchase saved', 'success');
    return entry;
  }
  function postDirectPurchase(id) {
    const entry = purchases.find(p => p.id === id);
    setPurchases(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'posted', postedAt: nowISO(), updatedAt: nowISO() } : p
    ));
    // ── Auto Journal Entry: Dr Inventory (or Expense) / Cr Cash at Bank ──
    const amt = entry?.totalAmount || 0;
    if (amt > 0) {
      autoJournalEntry({
        description: `Direct Purchase Posted: ${id} — ${entry?.supplierName || 'Supplier'}`,
        ref: id,
        entries: [
          { account: '1020', label: 'Inventory',          dr: amt, cr: 0 },
          { account: '1002', label: 'Cash at Bank — HBL', dr: 0,   cr: amt },
        ],
      });
    }
    logActivity('Posted Direct Purchase', 'Purchase', `Posted to inventory: ${id}`);
    toast('Purchase posted to inventory & accounts', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SUPPLIER ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createSupplier(data) {
    const s = {
      ...data,
      id:        generateId('SUP'),
      status:    'active',
      rating:    data.rating || 3,
      createdBy: currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setSuppliers(prev => [s, ...prev]);
    logActivity('Created Supplier', 'Purchase', `Created supplier: ${s.name}`);
    toast('Supplier created', 'success');
    return s;
  }
  function updateSupplier(id, data) {
    setSuppliers(prev => prev.map(s =>
      s.id === id ? { ...s, ...data, updatedAt: nowISO() } : s
    ));
    logActivity('Updated Supplier', 'Purchase', `Updated supplier: ${id}`);
    toast('Supplier updated', 'success');
  }
  function toggleSupplierStatus(id) {
    setSuppliers(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active', updatedAt: nowISO() } : s
    ));
    logActivity('Toggled Supplier Status', 'Purchase', `Toggled status for supplier: ${id}`);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MATERIAL ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createMaterial(data) {
    const m = {
      ...data,
      id:        generateId('MAT'),
      createdBy: currentUser?.username,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setMaterials(prev => [m, ...prev]);
    logActivity('Created Material', 'Purchase', `Created material: ${m.name}`);
    toast('Material created', 'success');
    return m;
  }
  function updateMaterial(id, data) {
    setMaterials(prev => prev.map(m =>
      m.id === id ? { ...m, ...data, updatedAt: nowISO() } : m
    ));
    logActivity('Updated Material', 'Purchase', `Updated material: ${id}`);
    toast('Material updated', 'success');
  }
  function deleteMaterial(id) {
    setMaterials(prev => prev.filter(m => m.id !== id));
    logActivity('Deleted Material', 'Purchase', `Deleted material: ${id}`);
    toast('Material deleted', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // INBOX ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  const [inboxItems, setInboxItems] = useState(saved?.inboxItems ?? mockData.inboxItems ?? []);

  function createInboxItem(data) {
    const item = {
      ...data,
      id:        generateId('INBOX'),
      status:    'pending',
      read:      false,
      createdBy: currentUser?.id,
      createdByName: currentUser?.firstName || currentUser?.username,
      createdAt: nowISO(),
    };
    setInboxItems(prev => [item, ...prev]);
    return item;
  }
  function approveInboxItem(id, note) {
    const item = inboxItems.find(i => i.id === id);
    setInboxItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'approved', approvedAt: nowISO(), note } : i
    ));
    // Update the referenced document
    if (item?.type === 'PR_APPROVAL') approvePR(item.refId, note);
    if (item?.type === 'PO_APPROVAL') approvePO(item.refId, note);
    logActivity('Approved Item', 'Inbox', `Approved ${item?.type}: ${item?.refId}`);
    toast('Item approved', 'success');
  }
  function rejectInboxItem(id, reason) {
    const item = inboxItems.find(i => i.id === id);
    setInboxItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'rejected', rejectedAt: nowISO(), reason } : i
    ));
    if (item?.type === 'PR_APPROVAL') rejectPR(item.refId, reason);
    if (item?.type === 'PO_APPROVAL') rejectPO(item.refId, reason);
    logActivity('Rejected Item', 'Inbox', `Rejected ${item?.type}: ${item?.refId}`);
    toast('Item rejected', 'warning');
  }
  function markInboxRead(id) {
    setInboxItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // NOTIFICATION ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function markNotifRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }
  function markAllNotifsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // APPROVAL STRATEGY ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  function createApprovalStrategy(data) {
    const s = { ...data, id: generateId('AS'), createdAt: nowISO() };
    setApprovalStrategies(prev => [...prev, s]);
    logActivity('Created Approval Strategy', 'Purchase', `Created: ${s.name}`);
    toast('Approval strategy created', 'success');
    return s;
  }
  function updateApprovalStrategy(id, data) {
    setApprovalStrategies(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    logActivity('Updated Approval Strategy', 'Purchase', `Updated: ${id}`);
    toast('Approval strategy updated', 'success');
  }
  function deleteApprovalStrategy(id) {
    setApprovalStrategies(prev => prev.filter(s => s.id !== id));
    logActivity('Deleted Approval Strategy', 'Purchase', `Deleted: ${id}`);
    toast('Approval strategy deleted', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ACCOUNTING ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  function generateJEId() {
    const num = String(Math.floor(Math.random() * 90000) + 10000);
    return `JE-${num}`;
  }

  // Auto journal entry — called internally by purchase actions
  function autoJournalEntry({ description, ref, entries }) {
    const je = {
      id:          generateJEId(),
      date:        nowISO().slice(0, 10),
      description,
      ref:         ref || '',
      entries,
      status:      'Posted',
      createdBy:   currentUser?.username || 'system',
      auto:        true,
    };
    setAcJournal(prev => [je, ...prev]);
    // Also update account balances
    setAcAccounts(prev => prev.map(acc => {
      const lines = entries.filter(e => e.account === acc.id);
      if (!lines.length) return acc;
      const delta = lines.reduce((s, e) => {
        // Debit increases Asset/Expense, decreases Liability/Equity/Revenue
        const drEffect = ['Asset', 'Expense'].includes(acc.type) ? e.dr : -e.dr;
        const crEffect = ['Asset', 'Expense'].includes(acc.type) ? -e.cr : e.cr;
        return s + drEffect + crEffect;
      }, 0);
      return { ...acc, balance: acc.balance + delta };
    }));
    return je;
  }

  function createJournalEntry(data) {
    const je = { ...data, id: generateJEId(), auto: false, createdBy: currentUser?.username };
    setAcJournal(prev => [je, ...prev]);
    logActivity('Created Journal Entry', 'Accounting', `JE: ${je.id} — ${je.description}`);
    toast('Journal entry created', 'success');
    return je;
  }
  function updateAcAccount(id, data) {
    setAcAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }
  function createAcAR(data) {
    setAcAR(prev => [{ ...data, id: generateJEId() }, ...prev]);
  }
  function updateAcAR(id, data) {
    setAcAR(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }
  function createAcAP(data) {
    setAcAP(prev => [{ ...data, id: generateJEId() }, ...prev]);
  }
  function updateAcAP(id, data) {
    setAcAP(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }
  function createAcVoucher(data) {
    setAcVouchers(prev => [{ ...data, id: generateJEId() }, ...prev]);
  }
  function updateAcCostCenter(id, data) {
    setAcCostCenters(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }
  function createAcCostCenter(data) {
    setAcCostCenters(prev => [...prev, { ...data, id: generateJEId() }]);
  }
  function createAcTaxRate(data) {
    setAcTaxRates(prev => [...prev, { ...data, id: generateJEId() }]);
  }
  function updateAcTaxRate(id, data) {
    setAcTaxRates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // INVENTORY ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  function generateSLId() {
    return `SL-${String(Math.floor(Math.random() * 900000) + 100000)}`;
  }

  // ── MAP recalculator (SAP Moving Average Price logic) ─────────────────────
  function recalcMAP(material, warehouseId, qtyIn, unitCost) {
    const whStock = (material.stockByWarehouse || []).find(w => w.warehouseId === warehouseId);
    const curQty  = whStock?.qty   || 0;
    const curVal  = whStock?.value || 0;
    const newQty  = curQty + qtyIn;
    const newVal  = curVal + (qtyIn * unitCost);
    const newMAP  = newQty > 0 ? newVal / newQty : material.mapPrice;
    return { newQty, newVal, newMAP };
  }

  // ── Core stock posting — all movements go through here ──────────────────────
  function postStockMovement({ materialId, warehouseId, movType, movLabel, qty, unitCost, ref, note }) {
    const mat = invMaterials.find(m => m.id === materialId);
    if (!mat) return null;

    const isIn     = qty > 0;
    const absQty   = Math.abs(qty);
    const mapPrice = isIn ? unitCost : mat.mapPrice; // issue always at MAP
    const value    = qty * mapPrice;

    // Update invMaterials — MAP + per-warehouse qty/value
    setInvMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      let newSBW = [...(m.stockByWarehouse || [])];
      const idx  = newSBW.findIndex(w => w.warehouseId === warehouseId);

      if (isIn) {
        const { newQty, newVal, newMAP } = recalcMAP(m, warehouseId, absQty, unitCost);
        if (idx >= 0) {
          newSBW[idx] = { ...newSBW[idx], qty: newQty, value: newVal };
        } else {
          newSBW.push({ warehouseId, qty: newQty, value: newVal });
        }
        const totalQty   = newSBW.reduce((s, w) => s + w.qty, 0);
        const totalValue = newSBW.reduce((s, w) => s + w.value, 0);
        return { ...m, mapPrice: newMAP, totalQty, totalValue, stockByWarehouse: newSBW, updatedAt: nowISO() };
      } else {
        // Goods issue — deduct at current MAP, no MAP change
        if (idx >= 0) {
          const newQty = newSBW[idx].qty - absQty;
          const newVal = newQty * m.mapPrice;
          newSBW[idx]  = { ...newSBW[idx], qty: Math.max(newQty, 0), value: Math.max(newVal, 0) };
        }
        const totalQty   = newSBW.reduce((s, w) => s + w.qty, 0);
        const totalValue = newSBW.reduce((s, w) => s + w.value, 0);
        return { ...m, totalQty, totalValue, stockByWarehouse: newSBW, updatedAt: nowISO() };
      }
    }));

    // Also sync legacy materials.stockQty so PR/RFQ pages still work
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      const newQty = Math.max((m.stockQty || 0) + qty, 0);
      return { ...m, stockQty: newQty, unitPrice: isIn ? unitCost : m.unitPrice };
    }));

    // Append to stock ledger
    const wh  = warehouses.find(w => w.id === warehouseId);
    const mat2 = invMaterials.find(m => m.id === materialId);
    const entry = {
      id:           generateSLId(),
      date:         nowISO().slice(0, 10),
      materialId,
      materialName: mat2?.name || materialId,
      warehouseId,
      whName:       wh?.name || warehouseId,
      movType,
      movLabel,
      qty,
      mapPrice,
      value,
      ref:          ref || '',
      note:         note || '',
      createdBy:    currentUser?.username || 'system',
      createdAt:    nowISO(),
    };
    setStockLedger(prev => [entry, ...prev]);

    // Auto accounting entry for every stock movement
    const acctMap = {
      '101': { dr: '1020', cr: '2001', drLabel: 'Inventory', crLabel: 'Accounts Payable' },
      '561': { dr: '1020', cr: '3002', drLabel: 'Inventory', crLabel: 'Retained Earnings' },
      '601': { dr: '5001', cr: '1020', drLabel: 'Cost of Goods Sold', crLabel: 'Inventory' },
      '602': { dr: '1020', cr: '5001', drLabel: 'Inventory', crLabel: 'Cost of Goods Sold' },
      '551': { dr: '1020', cr: '5009', drLabel: 'Inventory', crLabel: 'Inventory Adjustment' },
      '552': { dr: '5009', cr: '1020', drLabel: 'Inventory Adjustment', crLabel: 'Inventory' },
      '311': null, // Transfer — internal, no P&L impact
    };
    const acctRule = acctMap[movType];
    if (acctRule && Math.abs(value) > 0) {
      autoJournalEntry({
        description: `${movLabel}: ${mat2?.name} (${absQty} ${mat2?.unit}) — ${wh?.name || warehouseId}`,
        ref,
        entries: [
          { account: acctRule.dr, label: acctRule.drLabel, dr: Math.abs(value), cr: 0 },
          { account: acctRule.cr, label: acctRule.crLabel, dr: 0, cr: Math.abs(value) },
        ],
      });
    }

    logActivity('Stock Movement', 'Inventory', `${movLabel}: ${absQty} × ${mat2?.name} @ ${wh?.name}`);
    return entry;
  }

  // ── Warehouse CRUD ────────────────────────────────────────────────────────
  function createWarehouse(data) {
    const wh = { ...data, id: generateId('WH'), createdAt: nowISO(), status: 'active' };
    setWarehouses(prev => [...prev, wh]);
    logActivity('Created Warehouse', 'Inventory', `Warehouse: ${wh.name}`);
    toast('Warehouse created', 'success');
    return wh;
  }
  function updateWarehouse(id, data) {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    logActivity('Updated Warehouse', 'Inventory', `Warehouse ID: ${id}`);
    toast('Warehouse updated', 'success');
  }
  function toggleWarehouseStatus(id) {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w));
  }

  // ── invMaterial CRUD ──────────────────────────────────────────────────────
  function createInvMaterial(data) {
    const mat = {
      ...data,
      id:           generateId('MAT'),
      totalQty:     0,
      totalValue:   0,
      stockByWarehouse: [],
      createdAt:    nowISO(),
      updatedAt:    nowISO(),
      status:       'active',
    };
    setInvMaterials(prev => [mat, ...prev]);
    // Also add to legacy materials list
    setMaterials(prev => [{ id: mat.id, name: mat.name, code: mat.code, category: mat.category, unit: mat.unit, unitPrice: mat.mapPrice, stockQty: 0, description: mat.description || '', createdBy: currentUser?.username, createdAt: nowISO(), updatedAt: nowISO() }, ...prev]);
    logActivity('Created Material', 'Inventory', `Material: ${mat.name}`);
    toast('Material created', 'success');
    return mat;
  }
  function updateInvMaterial(id, data) {
    setInvMaterials(prev => prev.map(m => m.id === id ? { ...m, ...data, updatedAt: nowISO() } : m));
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, name: data.name || m.name, unitPrice: data.mapPrice || m.unitPrice, updatedAt: nowISO() } : m));
    logActivity('Updated Material', 'Inventory', `Material ID: ${id}`);
    toast('Material updated', 'success');
  }
  function toggleInvMaterialStatus(id) {
    setInvMaterials(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active', updatedAt: nowISO() } : m));
  }

  // ── GRN completion now also hits inventory properly ───────────────────────
  // (called from completeGRN — additional inv posting per item)
  function postGRNToInventory(grn) {
    if (!grn?.items?.length) return;
    const wh = grn.warehouseId || 'WH-001'; // default to main WH if not specified
    grn.items.forEach(item => {
      postStockMovement({
        materialId:  item.materialId,
        warehouseId: wh,
        movType:     '101',
        movLabel:    'Goods Receipt',
        qty:         item.receivedQty || item.qty,
        unitCost:    item.unitPrice   || item.estimatedPrice || 0,
        ref:         grn.id,
      });
    });
  }

  // ── Stock Transfer between warehouses ────────────────────────────────────
  function postStockTransfer({ materialId, fromWH, toWH, qty, ref, note }) {
    const mat = invMaterials.find(m => m.id === materialId);
    if (!mat) return;
    const mapPrice = mat.mapPrice;
    const value    = qty * mapPrice;

    // Deduct from source
    setInvMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      const newSBW = (m.stockByWarehouse || []).map(w => {
        if (w.warehouseId === fromWH) return { ...w, qty: Math.max(w.qty - qty, 0), value: Math.max((w.qty - qty) * m.mapPrice, 0) };
        if (w.warehouseId === toWH)   return { ...w, qty: w.qty + qty, value: (w.qty + qty) * m.mapPrice };
        return w;
      });
      // If toWH doesn't exist yet
      if (!newSBW.find(w => w.warehouseId === toWH)) newSBW.push({ warehouseId: toWH, qty, value });
      const totalQty   = newSBW.reduce((s, w) => s + w.qty, 0);
      const totalValue = newSBW.reduce((s, w) => s + w.value, 0);
      return { ...m, totalQty, totalValue, stockByWarehouse: newSBW, updatedAt: nowISO() };
    }));

    // Two ledger entries (out + in)
    const fromWHName = warehouses.find(w => w.id === fromWH)?.name || fromWH;
    const toWHName   = warehouses.find(w => w.id === toWH)?.name   || toWH;
    const base = { materialId, materialName: mat.name, movType: '311', movLabel: 'Stock Transfer', qty, mapPrice, value, ref: ref || '', createdBy: currentUser?.username || 'system', createdAt: nowISO() };
    setStockLedger(prev => [
      { ...base, id: generateSLId(), warehouseId: toWH,   whName: toWHName,   qty:  qty, date: nowISO().slice(0,10) },
      { ...base, id: generateSLId(), warehouseId: fromWH, whName: fromWHName, qty: -qty, date: nowISO().slice(0,10) },
      ...prev,
    ]);

    logActivity('Stock Transfer', 'Inventory', `${qty} × ${mat.name}: ${fromWHName} → ${toWHName}`);
    toast('Stock transferred successfully', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // S&D ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Party CRUD ────────────────────────────────────────────────────────────
  function createSdParty(data) {
    const p = { ...data, id:generateId('PARTY'), balance:0, createdBy:currentUser?.username, createdAt:nowISO() };
    setSdParties(prev => [p, ...prev]);
    logActivity('Created Party', 'S&D', `${data.tier}: ${data.name}`);
    toast('Party created', 'success'); return p;
  }
  function updateSdParty(id, data) {
    setSdParties(prev => prev.map(p => p.id===id ? { ...p, ...data } : p));
    logActivity('Updated Party', 'S&D', `Party ID: ${id}`);
    toast('Party updated', 'success');
  }
  function toggleSdPartyStatus(id) {
    setSdParties(prev => prev.map(p => p.id===id ? { ...p, status:p.status==='active'?'inactive':'active' } : p));
  }

  // ── Price List CRUD ───────────────────────────────────────────────────────
  function createPriceList(data) {
    const pl = { ...data, id:generateId('PL'), createdAt:nowISO() };
    setSdPriceLists(prev => [pl, ...prev]);
    toast('Price list created', 'success'); return pl;
  }
  function updatePriceList(id, data) {
    setSdPriceLists(prev => prev.map(pl => pl.id===id ? { ...pl, ...data } : pl));
    toast('Price list updated', 'success');
  }

  // ── Sales Order ───────────────────────────────────────────────────────────
  function createSalesOrder(data) {
    const so = { ...data, id:generateId('SO'), status:'draft', createdBy:currentUser?.username, createdAt:nowISO() };
    setSalesOrders(prev => [so, ...prev]);
    logActivity('Created Sales Order', 'S&D', `SO: ${so.id} for ${data.partyName}`);
    toast('Sales order created', 'success'); return so;
  }
  function updateSalesOrder(id, data) {
    setSalesOrders(prev => prev.map(s => s.id===id ? { ...s, ...data } : s));
    toast('Sales order updated', 'success');
  }
  function approveSalesOrder(id) {
    setSalesOrders(prev => prev.map(s => s.id===id ? { ...s, status:'approved', approvedAt:nowISO() } : s));
    logActivity('Approved SO', 'S&D', `SO: ${id}`);
    toast('Sales order approved', 'success');
  }
  function cancelSalesOrder(id) {
    setSalesOrders(prev => prev.map(s => s.id===id ? { ...s, status:'cancelled' } : s));
    toast('Sales order cancelled', 'warning');
  }

  // ── Delivery Order ────────────────────────────────────────────────────────
  function createDeliveryOrder(data) {
    const doEntry = { ...data, id:generateId('DO'), status:'pending', createdBy:currentUser?.username, createdAt:nowISO() };
    setDeliveryOrders(prev => [doEntry, ...prev]);
    // Update SO status
    setSalesOrders(prev => prev.map(s => s.id===data.soId ? { ...s, status:'delivery_pending' } : s));
    logActivity('Created Delivery Order', 'S&D', `DO: ${doEntry.id} for SO: ${data.soId}`);
    toast('Delivery order created', 'success'); return doEntry;
  }
  function deliverOrder(id) {
    const doEntry = deliveryOrders.find(d => d.id===id);
    setDeliveryOrders(prev => prev.map(d => d.id===id ? { ...d, status:'delivered', deliveredAt:nowISO() } : d));
    if (doEntry) {
      // Issue stock from inventory
      (doEntry.items||[]).forEach(item => {
        postStockMovement({ materialId:item.materialId, warehouseId:doEntry.warehouseId, movType:'601', movLabel:'Goods Issue/Sale', qty:-item.qty, unitCost:0, ref:doEntry.soId });
      });
      setSalesOrders(prev => prev.map(s => s.id===doEntry.soId ? { ...s, status:'delivered' } : s));
    }
    logActivity('Delivered Order', 'S&D', `DO: ${id}`);
    toast('Delivery confirmed — stock issued', 'success');
  }

  // ── Sales Invoice (posts to AR + accounting) ──────────────────────────────
  function createSalesInvoice(data) {
    const inv = { ...data, id:generateId('SINV'), status:'posted', createdBy:currentUser?.username, createdAt:nowISO() };
    setSalesInvoices(prev => [inv, ...prev]);
    // Update SO + DO status
    setSalesOrders(prev => prev.map(s => s.id===data.soId ? { ...s, status:'invoiced' } : s));

    // Auto AR entry
    const dueDate = new Date(Date.now() + (data.creditDays||30)*24*60*60*1000).toISOString().slice(0,10);
    setAcAR(prev => [{
      id:`AR-${inv.id}`, customer:data.partyName, date:data.date||nowISO().slice(0,10),
      due:dueDate, amount:data.grandTotal||0, paid:0, status:'Open', ref:inv.id,
    }, ...prev]);
    // Update party balance
    setSdParties(prev => prev.map(p => p.id===data.partyId ? { ...p, balance:(p.balance||0)+(data.grandTotal||0) } : p));

    // Auto Journal: Dr AR / Cr Revenue + Dr COGS / Cr Inventory
    const revenue  = data.subTotal    || 0;
    const tax      = data.taxAmount   || 0;
    const cogs     = data.cogsTotal   || 0;
    autoJournalEntry({
      description: `Sales Invoice: ${inv.id} — ${data.partyName}`,
      ref: inv.id,
      entries: [
        { account:'1010', label:'Accounts Receivable', dr:data.grandTotal||0, cr:0 },
        { account:'4001', label:'LPG Cylinder Sales',  dr:0, cr:revenue },
        { account:'2010', label:'Sales Tax Payable',   dr:0, cr:tax },
      ],
    });
    if (cogs > 0) {
      autoJournalEntry({
        description: `COGS: ${inv.id}`,
        ref: inv.id,
        entries: [
          { account:'5001', label:'Cost of Goods Sold', dr:cogs, cr:0 },
          { account:'1020', label:'Inventory',          dr:0,    cr:cogs },
        ],
      });
    }
    logActivity('Posted Sales Invoice', 'S&D', `SINV: ${inv.id} — ${fmtCurrency(data.grandTotal)}`);
    toast('Invoice posted — AR & accounting updated', 'success');
    return inv;
  }
  function recordSalesPayment(invoiceId, amount) {
    const inv = salesInvoices.find(i => i.id===invoiceId);
    setSalesInvoices(prev => prev.map(i => i.id===invoiceId ? { ...i, paidAmount:(i.paidAmount||0)+amount } : i));
    // Update AR
    setAcAR(prev => prev.map(r => {
      if (r.ref!==invoiceId) return r;
      const newPaid = Math.min((r.paid||0)+amount, r.amount);
      return { ...r, paid:newPaid, status:newPaid>=r.amount?'Paid':newPaid>0?'Partial':r.status };
    }));
    // Update party balance
    if (inv) setSdParties(prev => prev.map(p => p.id===inv.partyId ? { ...p, balance:Math.max(0,(p.balance||0)-amount) } : p));
    logActivity('Recorded Payment', 'S&D', `SINV: ${invoiceId} — Rs ${amount.toLocaleString()}`);
    toast('Payment recorded', 'success');
  }

  // ── Sales Returns ─────────────────────────────────────────────────────────
  function createSalesReturn(data) {
    const ret = { ...data, id:generateId('SRET'), status:'posted', createdBy:currentUser?.username, createdAt:nowISO() };
    setSalesReturns(prev => [ret, ...prev]);
    // Reverse stock (goods receipt back)
    (data.items||[]).forEach(item => {
      postStockMovement({ materialId:item.materialId, warehouseId:data.warehouseId, movType:'602', movLabel:'Sales Return', qty:item.qty, unitCost:item.mapPrice||0, ref:ret.id });
    });
    // Credit note journal
    autoJournalEntry({
      description: `Sales Return: ${ret.id} — ${data.partyName}`,
      ref: ret.id,
      entries: [
        { account:'4001', label:'LPG Sales (Return)',  dr:data.subTotal||0, cr:0 },
        { account:'1010', label:'Accounts Receivable', dr:0, cr:data.subTotal||0 },
      ],
    });
    toast('Sales return posted — stock restored', 'success');
    return ret;
  }

  // ── Commission Reps ───────────────────────────────────────────────────────
  function createCommissionRep(data) {
    const rep = { ...data, id:generateId('REP'), createdAt:nowISO() };
    setCommissionReps(prev => [rep, ...prev]);
    toast('Sales rep created', 'success'); return rep;
  }
  function updateCommissionRep(id, data) {
    setCommissionReps(prev => prev.map(r => r.id===id ? { ...r, ...data } : r));
    toast('Sales rep updated', 'success');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtCurrency(n) { return `Rs ${(n||0).toLocaleString()}`; }

  // ══════════════════════════════════════════════════════════════════════════════
  // POS ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  function openPosSession(terminalId, openingBalance) {
    const sess = { id:generateId('SESS'), terminalId, cashierId:currentUser?.id, cashierName:currentUser?.firstName||currentUser?.username, openedAt:nowISO(), closedAt:null, openingBalance, closingBalance:null, totalSales:0, totalTransactions:0, status:'open' };
    setPosSessions(prev => [sess, ...prev]);
    setPosTerminals(prev => prev.map(t => t.id===terminalId ? { ...t, currentSessionId:sess.id } : t));
    logActivity('Opened POS Session', 'POS', `Terminal: ${terminalId}`);
    return sess;
  }
  function closePosSession(sessionId, closingBalance) {
    setPosSessions(prev => prev.map(s => s.id===sessionId ? { ...s, status:'closed', closedAt:nowISO(), closingBalance } : s));
    logActivity('Closed POS Session', 'POS', `Session: ${sessionId}`);
    toast('Session closed', 'success');
  }
  function createPosSale(data) {
    const sale = { ...data, id:generateId('POS-SALE'), status:'posted', createdAt:nowISO() };
    setPosSales(prev => [sale, ...prev]);
    // Update session totals
    setPosSessions(prev => prev.map(s => s.id===data.sessionId ? { ...s, totalSales:(s.totalSales||0)+(data.grandTotal||0), totalTransactions:(s.totalTransactions||0)+1 } : s));
    // Issue stock
    (data.items||[]).forEach(item => {
      postStockMovement({ materialId:item.materialId, warehouseId:data.warehouseId||'WH-001', movType:'601', movLabel:'POS Sale', qty:-item.qty, unitCost:0, ref:sale.id });
    });
    // Journal: Dr Cash / Cr Revenue
    autoJournalEntry({
      description: `POS Sale: ${sale.id}`,
      ref: sale.id,
      entries: [
        { account:'1001', label:'Cash in Hand',       dr:data.grandTotal||0, cr:0 },
        { account:'4001', label:'LPG Cylinder Sales', dr:0, cr:data.grandTotal||0 },
      ],
    });
    return sale;
  }
  function voidPosSale(id) {
    setPosSales(prev => prev.map(s => s.id===id ? { ...s, status:'voided' } : s));
    toast('Sale voided', 'warning');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // HR ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Departments ───────────────────────────────────────────────────────────
  function createDepartment(data) {
    const d = { ...data, id:generateId('DEPT'), status:'active' };
    setHrDepartments(prev => [d, ...prev]);
    toast('Department created', 'success'); return d;
  }
  function updateDepartment(id, data) {
    setHrDepartments(prev => prev.map(d => d.id===id ? { ...d, ...data } : d));
    toast('Department updated', 'success');
  }

  // ── Designations ──────────────────────────────────────────────────────────
  function createDesignation(data) {
    const d = { ...data, id:generateId('DES'), status:'active' };
    setHrDesignations(prev => [d, ...prev]);
    toast('Designation created', 'success'); return d;
  }
  function updateDesignation(id, data) {
    setHrDesignations(prev => prev.map(d => d.id===id ? { ...d, ...data } : d));
    toast('Designation updated', 'success');
  }

  // ── Employees ─────────────────────────────────────────────────────────────
  function createEmployee(data) {
    const emp = { ...data, id:generateId('EMP'), empCode:generateId('EMP'), userId:null, driverProfileId:null, createdAt:nowISO() };
    setEmployees(prev => [emp, ...prev]);
    logActivity('Created Employee', 'HR', `${data.firstName} ${data.lastName}`);
    toast('Employee created', 'success'); return emp;
  }
  function updateEmployee(id, data) {
    setEmployees(prev => prev.map(e => e.id===id ? { ...e, ...data, updatedAt:nowISO() } : e));
    toast('Employee updated', 'success');
  }
  function terminateEmployee(id, data) {
    setEmployees(prev => prev.map(e => e.id===id ? { ...e, status:'terminated', ...data } : e));
    logActivity('Terminated Employee', 'HR', `EMP: ${id}`);
    toast('Employee terminated', 'warning');
  }
  // Link employee to user login
  function linkEmployeeToUser(empId, userId) {
    setEmployees(prev => prev.map(e => e.id===empId ? { ...e, userId } : e));
    toast('Employee linked to user account', 'success');
  }
  // Link employee to driver profile
  function linkEmployeeToDriver(empId, driverProfileId) {
    setEmployees(prev => prev.map(e => e.id===empId ? { ...e, driverProfileId } : e));
    // Also update dist driver with employeeId
    setDistDrivers(prev => prev.map(d => d.id===driverProfileId ? { ...d, employeeId:empId } : d));
    toast('Employee linked to driver profile', 'success');
  }

  // ── Salary Structure ──────────────────────────────────────────────────────
  function saveSalaryStructure(employeeId, components) {
    const existing = salaryStructures.find(s => s.employeeId===employeeId);
    if (existing) {
      setSalaryStructures(prev => prev.map(s => s.id===existing.id ? { ...s, components, updatedAt:nowISO() } : s));
    } else {
      const ss = { id:generateId('SS'), employeeId, components, updatedAt:nowISO() };
      setSalaryStructures(prev => [ss, ...prev]);
    }
    toast('Salary structure saved', 'success');
  }
  function addSalaryComponent(employeeId, component) {
    const existing = salaryStructures.find(s => s.employeeId===employeeId);
    const newComp  = { ...component, id:generateId('SC'), startDate:component.startDate||nowISO().slice(0,10), endDate:component.endDate||null };
    if (existing) {
      setSalaryStructures(prev => prev.map(s => s.id===existing.id ? { ...s, components:[...s.components, newComp], updatedAt:nowISO() } : s));
    } else {
      const ss = { id:generateId('SS'), employeeId, components:[newComp], updatedAt:nowISO() };
      setSalaryStructures(prev => [ss, ...prev]);
    }
    toast('Component added', 'success');
  }
  function removeSalaryComponent(employeeId, componentId, endDate) {
    // Set end date (soft remove) rather than deleting
    setSalaryStructures(prev => prev.map(s => {
      if (s.employeeId!==employeeId) return s;
      const components = s.components.map(c => c.id===componentId ? { ...c, endDate:endDate||nowISO().slice(0,10) } : c);
      return { ...s, components, updatedAt:nowISO() };
    }));
    toast('Component end-dated', 'success');
  }
  function updateSalaryComponent(employeeId, componentId, data) {
    setSalaryStructures(prev => prev.map(s => {
      if (s.employeeId!==employeeId) return s;
      const components = s.components.map(c => c.id===componentId ? { ...c, ...data } : c);
      return { ...s, components, updatedAt:nowISO() };
    }));
    toast('Component updated', 'success');
  }

  // ── Helper: get active components for an employee on a given date ─────────
  function getActiveComponents(employeeId, asOfDate) {
    const ss  = salaryStructures.find(s => s.employeeId===employeeId);
    if (!ss) return [];
    const date = asOfDate || nowISO().slice(0,10);
    return (ss.components||[]).filter(c => c.startDate <= date && (!c.endDate || c.endDate >= date));
  }

  // ── Payroll Periods ───────────────────────────────────────────────────────
  function openPayrollPeriod(month) {
    const label = new Date(month+'-01').toLocaleString('default',{month:'long',year:'numeric'});
    const existing = payrollPeriods.find(p => p.month===month);
    if (existing) { toast('Period already exists', 'error'); return; }
    const period = { id:`PP-${month}`, month, label, status:'open', openedAt:nowISO(), processedAt:null, postedAt:null, postedBy:null };
    setPayrollPeriods(prev => [period, ...prev]);
    toast(`Payroll period ${label} opened`, 'success');
    return period;
  }
  function closePayrollPeriod(periodId) {
    setPayrollPeriods(prev => prev.map(p => p.id===periodId ? { ...p, status:'closed', closedAt:nowISO() } : p));
    toast('Period closed', 'success');
  }

  // ── Payroll Processing ────────────────────────────────────────────────────
  function processPayroll(periodId) {
    const period = payrollPeriods.find(p => p.id===periodId);
    if (!period || period.status==='posted') { toast('Cannot process this period', 'error'); return; }
    const activeEmps = employees.filter(e => e.status==='active');
    const month      = period.month;
    // Days in month
    const [y,m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const records = activeEmps.map(emp => {
      const dept = hrDepartments.find(d=>d.id===emp.departmentId);
      const des  = hrDesignations.find(d=>d.id===emp.designationId);
      const comps = getActiveComponents(emp.id, `${month}-${String(daysInMonth).padStart(2,'0')}`);

      // Count attendance for month
      const empAtt = attendance.filter(a => a.employeeId===emp.id && a.date.startsWith(month));
      const presentDays = empAtt.filter(a=>a.status==='present').length;
      const absentDays  = empAtt.filter(a=>a.status==='absent').length;
      const empLeaves   = leaves.filter(l=>l.employeeId===emp.id && l.fromDate.startsWith(month) && l.status==='approved');
      const leaveDays   = empLeaves.reduce((s,l)=>s+(l.days||0),0);

      // Loan recovery for this employee
      const activeLoan = loans.find(l=>l.employeeId===emp.id && l.status==='active');
      const loanEMI    = activeLoan?.emiAmount||0;

      // Build earnings & deductions maps from active components
      const earnings   = {};
      const deductions = {};
      comps.forEach(c => {
        if (c.type==='earning')   earnings[c.name]   = c.amount;
        if (c.type==='deduction') deductions[c.name] = c.amount;
      });

      // Absent deduction
      const basicSalary  = earnings['Basic Salary'] || 0;
      const perDay       = daysInMonth > 0 ? basicSalary / daysInMonth : 0;
      if (absentDays > 0) deductions['Absent Deduction'] = Math.round(perDay * absentDays);

      // Loan recovery
      if (loanEMI > 0) deductions['Loan Recovery'] = loanEMI;

      const grossPay        = Object.values(earnings).reduce((s,v)=>s+v,0);
      const totalDeductions = Object.values(deductions).reduce((s,v)=>s+v,0);
      const netPay          = grossPay - totalDeductions;

      return {
        id: generateId('PR'),
        periodId, employeeId:emp.id, empCode:emp.empCode,
        name:`${emp.firstName} ${emp.lastName}`,
        department: dept?.name||'', designation: des?.title||'',
        attendanceDays: presentDays||daysInMonth, absentDays, leaveDays,
        earnings, deductions, grossPay, totalDeductions, netPay,
        status: 'draft',
      };
    });

    // Remove existing draft records for this period, add new ones
    setPayrollRecords(prev => [...prev.filter(r=>r.periodId!==periodId), ...records]);
    setPayrollPeriods(prev => prev.map(p => p.id===periodId ? { ...p, status:'processing', processedAt:nowISO() } : p));
    logActivity('Processed Payroll', 'HR', `Period: ${period.label} — ${records.length} employees`);
    toast(`Payroll processed for ${records.length} employees`, 'success');
    return records;
  }

  function approvePayrollRecord(recordId) {
    setPayrollRecords(prev => prev.map(r => r.id===recordId ? { ...r, status:'approved' } : r));
  }
  function approveAllPayroll(periodId) {
    setPayrollRecords(prev => prev.map(r => r.periodId===periodId ? { ...r, status:'approved' } : r));
    toast('All payroll records approved', 'success');
  }

  function postPayrollToAccounting(periodId) {
    const period  = payrollPeriods.find(p => p.id===periodId);
    const records = payrollRecords.filter(r => r.periodId===periodId && r.status==='approved');
    if (!period || !records.length) { toast('No approved records to post', 'error'); return; }

    const totalGross = records.reduce((s,r)=>s+(r.grossPay||0),0);
    const totalNet   = records.reduce((s,r)=>s+(r.netPay||0),0);
    const totalDed   = records.reduce((s,r)=>s+(r.totalDeductions||0),0);

    // Journal: Dr Salary Expense / Cr Salaries Payable
    autoJournalEntry({
      description: `Payroll: ${period.label}`,
      ref: periodId,
      entries: [
        { account:'5020', label:'Salary Expense',    dr:totalGross, cr:0 },
        { account:'2020', label:'Salaries Payable',  dr:0, cr:totalNet },
        { account:'2021', label:'EOBI Payable',      dr:0, cr:records.reduce((s,r)=>s+(r.deductions?.EOBI||0),0) },
        { account:'2022', label:'Tax Withholding',   dr:0, cr:records.reduce((s,r)=>s+(r.deductions?.['Income Tax']||0),0) },
        { account:'1010', label:'Loan Recoveries',   dr:0, cr:records.reduce((s,r)=>s+(r.deductions?.['Loan Recovery']||0),0) },
      ].filter(e=>e.dr>0||e.cr>0),
    });

    // Update loan recovered amounts
    records.forEach(r => {
      const loanEMI = r.deductions?.['Loan Recovery']||0;
      if (loanEMI > 0) {
        setLoans(prev => prev.map(l => {
          if (l.employeeId!==r.employeeId||l.status!=='active') return l;
          const newRecovered = (l.recoveredAmount||0) + loanEMI;
          const done = newRecovered >= l.amount;
          return { ...l, recoveredAmount:newRecovered, status:done?'closed':'active' };
        }));
      }
    });

    setPayrollPeriods(prev => prev.map(p => p.id===periodId ? { ...p, status:'posted', postedAt:nowISO(), postedBy:currentUser?.username } : p));
    logActivity('Posted Payroll', 'HR', `Period: ${period.label} — Rs ${totalGross.toLocaleString()}`);
    toast(`Payroll posted to accounting — Rs ${totalGross.toLocaleString()} gross`, 'success');
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  function markAttendance(data) {
    const existing = attendance.find(a=>a.employeeId===data.employeeId&&a.date===data.date);
    if (existing) {
      setAttendance(prev => prev.map(a => a.id===existing.id ? { ...a, ...data } : a));
    } else {
      const rec = { ...data, id:generateId('ATT') };
      setAttendance(prev => [rec, ...prev]);
    }
  }
  function markBulkAttendance(date, records) {
    const toAdd=[], toUpdate=[];
    records.forEach(r=>{
      const ex=attendance.find(a=>a.employeeId===r.employeeId&&a.date===date);
      if(ex) toUpdate.push({...ex,...r});
      else    toAdd.push({...r,id:generateId('ATT'),date});
    });
    setAttendance(prev=>[...prev.filter(a=>a.date!==date||!records.find(r=>r.employeeId===a.employeeId)),...toUpdate,...toAdd]);
    toast(`Attendance saved for ${records.length} employees`,'success');
  }

  // ── Leaves ────────────────────────────────────────────────────────────────
  function applyLeave(data) {
    const lv = { ...data, id:generateId('LV'), status:'pending', approvedBy:null, appliedAt:nowISO() };
    setLeaves(prev => [lv, ...prev]);
    toast('Leave application submitted', 'success'); return lv;
  }
  function approveLeave(id) {
    setLeaves(prev => prev.map(l => l.id===id ? { ...l, status:'approved', approvedBy:currentUser?.username } : l));
    toast('Leave approved', 'success');
  }
  function rejectLeave(id) {
    setLeaves(prev => prev.map(l => l.id===id ? { ...l, status:'rejected' } : l));
    toast('Leave rejected', 'warning');
  }

  // ── Loans ─────────────────────────────────────────────────────────────────
  function createLoan(data) {
    const loan = { ...data, id:generateId('LOAN'), recoveredAmount:0, status:'active', createdAt:nowISO() };
    setLoans(prev => [loan, ...prev]);
    // Disburse from accounts: Dr Loan to Employee / Cr Cash
    autoJournalEntry({
      description: `Employee Loan: ${data.employeeName}`,
      ref: loan.id,
      entries: [
        { account:'1030', label:'Loans to Employees', dr:data.amount||0, cr:0 },
        { account:'1001', label:'Cash in Hand',       dr:0, cr:data.amount||0 },
      ],
    });
    toast('Loan created and disbursed', 'success'); return loan;
  }
  function updateLoan(id, data) {
    setLoans(prev => prev.map(l => l.id===id ? { ...l, ...data } : l));
    toast('Loan updated', 'success');
  }

  // ── Final Settlement ──────────────────────────────────────────────────────
  function createFinalSettlement(data) {
    const fs = { ...data, id:generateId('FS'), createdBy:currentUser?.username, createdAt:nowISO() };
    setFinalSettlements(prev => [fs, ...prev]);
    // Terminate employee
    terminateEmployee(data.employeeId, { status:data.type==='resignation'?'resigned':'terminated', exitDate:data.exitDate });
    // Accounting: Dr Various / Cr Bank
    if (data.totalPayable > 0) {
      autoJournalEntry({
        description: `Final Settlement: ${data.employeeName}`,
        ref: fs.id,
        entries: [
          { account:'5030', label:'Final Settlement Expense', dr:data.totalPayable, cr:0 },
          { account:'1001', label:'Cash / Bank',              dr:0, cr:data.totalPayable },
        ],
      });
    }
    logActivity('Final Settlement', 'HR', `${data.employeeName} — Rs ${data.totalPayable?.toLocaleString()}`);
    toast('Final settlement processed', 'success'); return fs;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DISTRIBUTION ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Routes ────────────────────────────────────────────────────────────────
  function createDistRoute(data) {
    const r = { ...data, id:generateId('RT'), createdBy:currentUser?.username, createdAt:nowISO() };
    setDistRoutes(prev => [r, ...prev]);
    logActivity('Created Route', 'Distribution', data.name);
    toast('Route created', 'success'); return r;
  }
  function updateDistRoute(id, data) {
    setDistRoutes(prev => prev.map(r => r.id===id ? { ...r, ...data } : r));
    toast('Route updated', 'success');
  }
  function toggleDistRouteStatus(id) {
    setDistRoutes(prev => prev.map(r => r.id===id ? { ...r, status:r.status==='active'?'inactive':'active' } : r));
  }

  // ── Vehicles ──────────────────────────────────────────────────────────────
  function createVehicle(data) {
    const v = { ...data, id:generateId('VH'), createdAt:nowISO() };
    setDistVehicles(prev => [v, ...prev]);
    toast('Vehicle added', 'success'); return v;
  }
  function updateVehicle(id, data) {
    setDistVehicles(prev => prev.map(v => v.id===id ? { ...v, ...data } : v));
    toast('Vehicle updated', 'success');
  }
  function toggleVehicleStatus(id) {
    setDistVehicles(prev => prev.map(v => v.id===id ? { ...v, status:v.status==='active'?'inactive':'active' } : v));
  }

  // ── Drivers ───────────────────────────────────────────────────────────────
  function createDriver(data) {
    const d = { ...data, id:generateId('DRV'), createdAt:nowISO() };
    setDistDrivers(prev => [d, ...prev]);
    toast('Driver added', 'success'); return d;
  }
  function updateDriver(id, data) {
    setDistDrivers(prev => prev.map(d => d.id===id ? { ...d, ...data } : d));
    toast('Driver updated', 'success');
  }

  // ── Load Orders ───────────────────────────────────────────────────────────
  function createLoadOrder(data) {
    const lo = { ...data, id:generateId('LO'), status:'pending', createdBy:currentUser?.username, createdAt:nowISO() };
    setLoadOrders(prev => [lo, ...prev]);
    logActivity('Created Load Order', 'Distribution', `${data.routeName} — ${data.totalCylinders} cylinders`);
    toast('Load order created', 'success'); return lo;
  }
  function dispatchLoadOrder(id) {
    const lo = loadOrders.find(l => l.id===id);
    setLoadOrders(prev => prev.map(l => l.id===id ? { ...l, status:'dispatched', dispatchedAt:nowISO() } : l));
    // Create trip from load order
    if (lo) {
      const driver = distDrivers.find(d => d.id===lo.driverId);
      const vehicle= distVehicles.find(v => v.id===lo.vehicleId);
      const trip   = {
        id: generateId('TR'), loadOrderId:lo.id, date:lo.date,
        routeId:lo.routeId, routeName:lo.routeName,
        vehicleId:lo.vehicleId, vehicleReg:vehicle?.regNo||'',
        driverId:lo.driverId, driverName:driver?.name||'',
        departureTime:nowISO(), returnTime:null,
        stops:[], status:'in_transit',
        cashExpected:0, cashCollected:0,
        emptiesOut:lo.totalCylinders||0, emptiesReturned:0, undeliveredQty:0,
        expenses:0, createdBy:currentUser?.username, createdAt:nowISO(),
      };
      setTrips(prev => [trip, ...prev]);
      // Deduct stock from warehouse
      (lo.items||[]).forEach(item => {
        postStockMovement({ materialId:item.materialId, warehouseId:lo.warehouseId, movType:'601', movLabel:'Load Out — Trip', qty:-item.qty, unitCost:0, ref:lo.id });
      });
    }
    toast('Load order dispatched — trip created', 'success');
  }

  // ── Trips ─────────────────────────────────────────────────────────────────
  function updateTrip(id, data) {
    setTrips(prev => prev.map(t => t.id===id ? { ...t, ...data } : t));
  }
  function updateTripStop(tripId, stopNo, data) {
    setTrips(prev => prev.map(t => {
      if (t.id!==tripId) return t;
      const stops = (t.stops||[]).map(s => s.stopNo===stopNo ? { ...s, ...data } : s);
      return { ...t, stops };
    }));
  }
  function returnTrip(id) {
    setTrips(prev => prev.map(t => t.id===id ? { ...t, status:'returning', returnTime:nowISO() } : t));
    toast('Trip marked as returning', 'success');
  }

  // ── Trip Settlement ───────────────────────────────────────────────────────
  function settleTrip(tripId, settlementData) {
    const trip = trips.find(t => t.id===tripId);
    if (!trip) return;

    const sett = {
      ...settlementData,
      id:        generateId('SETT'),
      tripId,
      date:      nowISO().slice(0,10),
      driverId:  trip.driverId,
      driverName:trip.driverName,
      routeName: trip.routeName,
      createdBy: currentUser?.username,
      createdAt: nowISO(),
    };
    setSettlements(prev => [sett, ...prev]);

    // Mark trip settled
    setTrips(prev => prev.map(t => t.id===tripId ? { ...t, status:'settled', settlementId:sett.id, cashCollected:settlementData.cashSubmitted, emptiesReturned:settlementData.emptiesReturned } : t));

    // Restore undelivered stock back to warehouse
    if (settlementData.undeliveredItems?.length) {
      settlementData.undeliveredItems.forEach(item => {
        postStockMovement({ materialId:item.materialId, warehouseId:trip.warehouseId||'WH-001', movType:'602', movLabel:'Undelivered Return', qty:item.qty, unitCost:0, ref:sett.id });
      });
    }

    // Post cash collection journal: Dr Cash / Cr AR
    if (settlementData.cashSubmitted > 0) {
      autoJournalEntry({
        description: `Trip Settlement: ${sett.id} — ${trip.driverName}`,
        ref: sett.id,
        entries: [
          { account:'1001', label:'Cash in Hand',       dr:settlementData.cashSubmitted, cr:0 },
          { account:'1010', label:'Accounts Receivable', dr:0, cr:settlementData.cashSubmitted },
        ],
      });
    }
    // Post driver expenses: Dr Transport Expense / Cr Cash
    if (settlementData.expenses > 0) {
      autoJournalEntry({
        description: `Trip Expenses: ${sett.id}`,
        ref: sett.id,
        entries: [
          { account:'5010', label:'Transport Expense', dr:settlementData.expenses, cr:0 },
          { account:'1001', label:'Cash in Hand',      dr:0, cr:settlementData.expenses },
        ],
      });
    }

    logActivity('Settled Trip', 'Distribution', `${tripId} — Cash: Rs ${settlementData.cashSubmitted?.toLocaleString()}`);
    toast('Trip settled — stock restored, journals posted', 'success');
    return sett;
  }

  // ── Maintenance ───────────────────────────────────────────────────────────
  function createMaintenanceRecord(data) {
    const rec = { ...data, id:generateId('MNT'), createdAt:nowISO() };
    setMaintenance(prev => [rec, ...prev]);
    // Update vehicle last service date
    if (data.vehicleId) updateVehicle(data.vehicleId, { lastService:data.date, nextServiceDue:data.nextDueDate, status:'active' });
    toast('Maintenance record saved', 'success'); return rec;
  }
  function updateMaintenanceRecord(id, data) {
    setMaintenance(prev => prev.map(r => r.id===id ? { ...r, ...data } : r));
    toast('Maintenance updated', 'success');
  }

  // ── Fuel Log ──────────────────────────────────────────────────────────────
  function createFuelEntry(data) {
    const entry = { ...data, id:generateId('FL'), createdAt:nowISO() };
    setFuelLog(prev => [entry, ...prev]);
    // Update vehicle odometer
    if (data.vehicleId && data.odometer) updateVehicle(data.vehicleId, { odometer:data.odometer });
    toast('Fuel entry recorded', 'success'); return entry;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // DATABASE BACKUP ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  const [backups, setBackups] = useState(saved?.backups ?? mockData.backups ?? []);
  function createBackup(data) {
    const b = { ...data, id: generateId('BKP'), createdAt: nowISO() };
    setBackups(prev => [b, ...prev]);
    logActivity('Created Backup', 'Database', `Backup created: ${b.id}`);
    toast('Backup created', 'success');
    return b;
  }
  function deleteBackup(id) {
    setBackups(prev => prev.filter(b => b.id !== id));
    logActivity('Deleted Backup', 'Database', `Backup deleted: ${id}`);
    toast('Backup deleted', 'success');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // USER PREFERENCES (pinned apps, etc.)
  // ══════════════════════════════════════════════════════════════════════════════
  const [userPrefs, setUserPrefs] = useState(() => {
    try {
      const p = localStorage.getItem('barkahflow_prefs_' + (currentUser?.id || 'guest'));
      return p ? JSON.parse(p) : { pinnedApps: [], appOrder: [] };
    } catch { return { pinnedApps: [], appOrder: [] }; }
  });
  function updatePrefs(prefs) {
    const merged = { ...userPrefs, ...prefs };
    setUserPrefs(merged);
    localStorage.setItem('barkahflow_prefs_' + (currentUser?.id || 'guest'), JSON.stringify(merged));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // Context value
  // ══════════════════════════════════════════════════════════════════════════════
  const value = {
    // Auth
    currentUser, login, logout,

    // Users
    users, createUser, updateUser, deleteUser, resetPassword, toggleUserStatus,

    // Roles
    roles, createRole, updateRole, deleteRole,

    // Company
    company, setCompany, subsidiaries, createSubsidiary, updateSubsidiary, deleteSubsidiary,
    security, setSecurity, notifSettings, setNotifSettings,

    // Purchase — PR
    prs, createPR, updatePR, deletePR, forwardPR, approvePR, rejectPR,

    // Purchase — RFQ
    rfqs, quotations, createRFQ, updateRFQ, sendRFQ, addQuote,

    // Purchase — PO
    purchaseOrders, createPO, updatePO, deletePO, forwardPO, approvePO, rejectPO,

    // Purchase — GRN
    grns, createGRN, completeGRN,

    // Direct purchase / Purchase list
    purchases, createDirectPurchase, postDirectPurchase,

    // Suppliers
    suppliers, createSupplier, updateSupplier, toggleSupplierStatus,

    // Materials
    materials, createMaterial, updateMaterial, deleteMaterial,

    // Inbox
    inboxItems, createInboxItem, approveInboxItem, rejectInboxItem, markInboxRead,

    // Notifications
    notifications, pushNotification, markNotifRead, markAllNotifsRead,

    // Approval strategies
    approvalStrategies, createApprovalStrategy, updateApprovalStrategy, deleteApprovalStrategy,

    // Inventory
    warehouses, invMaterials, stockLedger,
    INV_MOVEMENT_TYPES,
    createWarehouse, updateWarehouse, toggleWarehouseStatus,
    createInvMaterial, updateInvMaterial, toggleInvMaterialStatus,
    postStockMovement, postStockTransfer, postGRNToInventory,

    // Accounting
    acAccounts, acJournal, acAR, acAP, acVouchers, acBankTx, acCostCenters, acTaxRates,
    setAcAccounts, setAcJournal, setAcAR, setAcAP, setAcVouchers, setAcBankTx,
    setAcCostCenters, setAcTaxRates,
    createJournalEntry, updateAcAccount,
    createAcAR, updateAcAR, createAcAP, updateAcAP,
    createAcVoucher, updateAcCostCenter, createAcCostCenter,
    createAcTaxRate, updateAcTaxRate,

    // S&D
    sdParties, sdPriceLists, salesOrders, deliveryOrders, salesInvoices, salesReturns, commissionReps,
    createSdParty, updateSdParty, toggleSdPartyStatus,
    createPriceList, updatePriceList,
    createSalesOrder, updateSalesOrder, approveSalesOrder, cancelSalesOrder,
    createDeliveryOrder, deliverOrder,
    createSalesInvoice, recordSalesPayment,
    createSalesReturn,
    createCommissionRep, updateCommissionRep,

    // POS
    posTerminals, posSessions, posSales,
    openPosSession, closePosSession, createPosSale, voidPosSale,

    // HR
    hrDepartments, hrDesignations, employees, salaryStructures,
    payrollPeriods, payrollRecords, attendance, leaves, loans, finalSettlements,
    createDepartment, updateDepartment,
    createDesignation, updateDesignation,
    createEmployee, updateEmployee, terminateEmployee, linkEmployeeToUser, linkEmployeeToDriver,
    saveSalaryStructure, addSalaryComponent, removeSalaryComponent, updateSalaryComponent, getActiveComponents,
    openPayrollPeriod, closePayrollPeriod,
    processPayroll, approvePayrollRecord, approveAllPayroll, postPayrollToAccounting,
    markAttendance, markBulkAttendance,
    applyLeave, approveLeave, rejectLeave,
    createLoan, updateLoan,
    createFinalSettlement,

    // Distribution
    distRoutes, distVehicles, distDrivers, loadOrders, trips, settlements, maintenance, fuelLog,
    createDistRoute, updateDistRoute, toggleDistRouteStatus,
    createVehicle, updateVehicle, toggleVehicleStatus,
    createDriver, updateDriver,
    createLoadOrder, dispatchLoadOrder,
    updateTrip, updateTripStop, returnTrip,
    settleTrip,
    createMaintenanceRecord, updateMaintenanceRecord,
    createFuelEntry,

    // Backups
    backups, createBackup, deleteBackup,

    // Activity log
    activityLog, logActivity,

    // Preferences
    userPrefs, updatePrefs,

    // UI
    toasts, toast, dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
