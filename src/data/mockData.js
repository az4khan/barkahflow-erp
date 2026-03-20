// ════════════════════════════════════════════════════════════════════════════
// BarkahFlow ERP — Mock Data (seed data for in-memory / localStorage)
// ════════════════════════════════════════════════════════════════════════════

export const mockData = {

  // ── Company ──────────────────────────────────────────────────────────────────
  company: {
    id:          'COMP-001',
    name:        'Al-Raza LPG (Pvt.) Ltd.',
    shortName:   'Al-Raza LPG',
    tagline:     'Quality LPG Solutions',
    email:       'info@alrazalpg.com',
    phone:       '+92-42-35761234',
    address:     '123 Industrial Zone, Lahore, Pakistan',
    city:        'Lahore',
    country:     'Pakistan',
    currency:    'PKR',
    fiscalYearStart: 'July',
    fiscalYearEnd:   'June',
    logoUrl:     null,
    website:     'www.alrazalpg.com',
    taxNumber:   'NTN-1234567-8',
    updatedAt:   '2026-03-01T00:00:00.000Z',
  },

  subsidiaries: [
    { id: 'SUB-001', name: 'Al-Raza LPG Faisalabad', city: 'Faisalabad', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'SUB-002', name: 'Al-Raza LPG Karachi',    city: 'Karachi',    status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  ],

  security: {
    sessionTimeout:       30,
    maxLoginAttempts:     5,
    passwordMinLength:    8,
    requireUppercase:     true,
    requireNumbers:       true,
    twoFactorEnabled:     false,
  },

  notificationSettings: {
    emailNotifications:   true,
    smsNotifications:     false,
    pushNotifications:    true,
    approvalAlerts:       true,
    reportAlerts:         false,
  },

  // ── Roles ─────────────────────────────────────────────────────────────────────
  roles: [
    { id: 'ROLE-001', name: 'System Administrator', description: 'Full system access', permissions: ['all'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'ROLE-002', name: 'Purchase Manager',     description: 'Purchase module access', permissions: ['purchase.*'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'ROLE-003', name: 'Wholesale Sales',      description: 'Wholesale module access', permissions: ['wholesale.*'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'ROLE-004', name: 'Finance Manager',      description: 'Finance and accounting access', permissions: ['accounting.*', 'purchase.view'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'ROLE-005', name: 'Warehouse Officer',    description: 'Inventory and GRN access', permissions: ['inventory.*', 'purchase.grn'], createdAt: '2026-01-01T00:00:00.000Z' },
  ],

  // ── Users ─────────────────────────────────────────────────────────────────────
  users: [
    {
      id: 'USR-001', username: 'admin', password: 'admin123',
      firstName: 'System', lastName: 'Administrator',
      email: 'admin@alrazalpg.com', phone: '+92-300-0000001',
      role: { id: 'ROLE-001', name: 'System Administrator' },
      department: 'Administration', status: 'active',
      photo: null, createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'USR-002', username: 'hassan', password: 'hassan123',
      firstName: 'Hassan', lastName: 'Ahmed',
      email: 'hassan@alrazalpg.com', phone: '+92-300-0000002',
      role: { id: 'ROLE-002', name: 'Purchase Manager' },
      department: 'Procurement', status: 'active',
      photo: null, createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'USR-003', username: 'bilal', password: 'bilal123',
      firstName: 'Bilal', lastName: 'Khan',
      email: 'bilal@alrazalpg.com', phone: '+92-300-0000003',
      role: { id: 'ROLE-003', name: 'Wholesale Sales' },
      department: 'Sales', status: 'active',
      photo: null, createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],

  // ── HR — Departments (used by PR form) ────────────────────────────────────────
  departments: [
    { id: 'DEPT-001', name: 'Administration' },
    { id: 'DEPT-002', name: 'Procurement' },
    { id: 'DEPT-003', name: 'Sales' },
    { id: 'DEPT-004', name: 'Finance' },
    { id: 'DEPT-005', name: 'Operations' },
    { id: 'DEPT-006', name: 'Warehouse' },
    { id: 'DEPT-007', name: 'IT' },
    { id: 'DEPT-008', name: 'HR' },
  ],

  // ── Materials (previously Products) ──────────────────────────────────────────
  materials: [
    { id: 'MAT-001', name: 'LPG Cylinder 45kg',  code: 'LPG-45',  category: 'LPG Cylinders',  unit: 'PCS', unitPrice: 12500, stockQty: 500, description: '45kg commercial LPG cylinder', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'MAT-002', name: 'LPG Cylinder 11.8kg', code: 'LPG-12',  category: 'LPG Cylinders',  unit: 'PCS', unitPrice:  3800, stockQty: 1200, description: '11.8kg domestic LPG cylinder', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'MAT-003', name: 'LPG Cylinder 5kg',    code: 'LPG-05',  category: 'LPG Cylinders',  unit: 'PCS', unitPrice:  1800, stockQty:  800, description: '5kg portable LPG cylinder', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'MAT-004', name: 'LPG Bulk MT',         code: 'LPG-BLK', category: 'Bulk LPG',       unit: 'MT',  unitPrice: 180000, stockQty: 50, description: 'Bulk LPG metric ton', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'MAT-005', name: 'Office Chair',         code: 'OFF-CHR', category: 'Office Furniture', unit: 'PCS', unitPrice: 15000, stockQty: 20, description: 'Ergonomic office chair', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'MAT-006', name: 'A4 Paper Ream',        code: 'STA-A4',  category: 'Stationery',     unit: 'PCS', unitPrice:  1200, stockQty: 200, description: '500 sheets A4 paper', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  ],

  // ── Suppliers ────────────────────────────────────────────────────────────────
  suppliers: [
    { id: 'SUP-001', name: 'Saudi Aramco', code: 'SA-001', email: 'supply@aramco.com', phone: '+966-13-872-0115', country: 'Saudi Arabia', city: 'Dhahran', status: 'active', rating: 5, category: 'LPG', contactPerson: 'Ahmad Al-Saeed', paymentTerms: 'Net 30', currency: 'USD', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'SUP-002', name: 'ADNOC',        code: 'AD-001', email: 'procurement@adnoc.ae', phone: '+971-2-602-0000', country: 'UAE', city: 'Abu Dhabi', status: 'active', rating: 4, category: 'LPG', contactPerson: 'Mohammed Al-Hameli', paymentTerms: 'Net 45', currency: 'USD', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'SUP-003', name: 'Shell Gas',    code: 'SH-001', email: 'gas@shell.com',       phone: '+31-70-377-9111', country: 'Netherlands', city: 'The Hague', status: 'active', rating: 4, category: 'LPG', contactPerson: 'Jan van der Berg', paymentTerms: 'Net 60', currency: 'USD', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'SUP-004', name: 'TotalEnergies', code: 'TE-001', email: 'lpg@totalenergies.com', phone: '+33-1-47-44-45-46', country: 'France', city: 'Paris', status: 'active', rating: 4, category: 'LPG', contactPerson: 'Pierre Dupont', paymentTerms: 'Net 30', currency: 'EUR', createdBy: 'admin', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'SUP-005', name: 'Office Mart',  code: 'OM-001', email: 'orders@officemart.pk', phone: '+92-42-111-000-111', country: 'Pakistan', city: 'Lahore', status: 'active', rating: 3, category: 'Office Supplies', contactPerson: 'Usman Ali', paymentTerms: 'Net 15', currency: 'PKR', createdBy: 'admin', createdAt: '2026-01-15T00:00:00.000Z', updatedAt: '2026-01-15T00:00:00.000Z' },
  ],

  // ── Purchase Requisitions ────────────────────────────────────────────────────
  prs: [
    {
      id: 'PR-00001', title: 'Q1 LPG Cylinders Procurement', department: 'Operations',
      priority: 'high', status: 'approved',
      items: [
        { materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg', qty: 100, unit: 'PCS', estimatedPrice: 12500, totalEstimated: 1250000 },
        { materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', qty: 200, unit: 'PCS', estimatedPrice: 3800, totalEstimated: 760000 },
      ],
      totalEstimated: 2010000, justification: 'Q1 stock replenishment',
      createdByName: 'Hassan Ahmed', createdAt: '2026-01-05T08:00:00.000Z',
      forwardedAt: '2026-01-06T09:00:00.000Z', approvedAt: '2026-01-07T10:00:00.000Z',
    },
    {
      id: 'PR-00002', title: 'Office Furniture for New Office', department: 'Administration',
      priority: 'normal', status: 'initiated',
      items: [
        { materialId: 'MAT-005', materialName: 'Office Chair', qty: 10, unit: 'PCS', estimatedPrice: 15000, totalEstimated: 150000 },
      ],
      totalEstimated: 150000, justification: 'New office setup',
      createdByName: 'System Administrator', createdAt: '2026-02-10T10:00:00.000Z',
      forwardedAt: '2026-02-10T11:00:00.000Z',
    },
    {
      id: 'PR-00003', title: 'Stationery Q1', department: 'Administration',
      priority: 'low', status: 'draft',
      items: [
        { materialId: 'MAT-006', materialName: 'A4 Paper Ream', qty: 50, unit: 'PCS', estimatedPrice: 1200, totalEstimated: 60000 },
      ],
      totalEstimated: 60000, justification: 'Monthly stationery needs',
      createdByName: 'Hassan Ahmed', createdAt: '2026-03-01T08:00:00.000Z',
    },
  ],

  // ── RFQs ─────────────────────────────────────────────────────────────────────
  rfqs: [
    {
      id: 'RFQ-00001', prId: 'PR-00001', title: 'RFQ for LPG Cylinders Q1',
      suppliers: ['SUP-001', 'SUP-002', 'SUP-003'],
      status: 'quoted', sentAt: '2026-01-10T09:00:00.000Z',
      dueDate: '2026-01-20T00:00:00.000Z',
      items: [
        { materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg', qty: 100, unit: 'PCS' },
        { materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', qty: 200, unit: 'PCS' },
      ],
      createdByName: 'Hassan Ahmed', createdAt: '2026-01-09T08:00:00.000Z',
    },
  ],

  // ── Quotations ────────────────────────────────────────────────────────────────
  quotations: [
    { id: 'QT-00001', rfqId: 'RFQ-00001', supplierId: 'SUP-001', supplierName: 'Saudi Aramco', validUntil: '2026-02-20', items: [ { materialId: 'MAT-001', unitPrice: 11800, qty: 100, total: 1180000 }, { materialId: 'MAT-002', unitPrice: 3600, qty: 200, total: 720000 } ], totalAmount: 1900000, paymentTerms: 'Net 30', deliveryDays: 14, notes: 'Best rate guaranteed', createdAt: '2026-01-15T00:00:00.000Z' },
    { id: 'QT-00002', rfqId: 'RFQ-00001', supplierId: 'SUP-002', supplierName: 'ADNOC',        validUntil: '2026-02-20', items: [ { materialId: 'MAT-001', unitPrice: 12000, qty: 100, total: 1200000 }, { materialId: 'MAT-002', unitPrice: 3700, qty: 200, total: 740000 } ], totalAmount: 1940000, paymentTerms: 'Net 45', deliveryDays: 21, notes: '', createdAt: '2026-01-16T00:00:00.000Z' },
    { id: 'QT-00003', rfqId: 'RFQ-00001', supplierId: 'SUP-003', supplierName: 'Shell Gas',    validUntil: '2026-02-20', items: [ { materialId: 'MAT-001', unitPrice: 12200, qty: 100, total: 1220000 }, { materialId: 'MAT-002', unitPrice: 3650, qty: 200, total: 730000 } ], totalAmount: 1950000, paymentTerms: 'Net 60', deliveryDays: 10, notes: 'Fast delivery', createdAt: '2026-01-17T00:00:00.000Z' },
  ],

  // ── Purchase Orders ────────────────────────────────────────────────────────────
  purchaseOrders: [
    {
      id: 'PO-00001', prId: 'PR-00001', rfqId: 'RFQ-00001', qtId: 'QT-00001',
      supplierId: 'SUP-001', supplierName: 'Saudi Aramco',
      status: 'approved',
      items: [
        { materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg', qty: 100, unit: 'PCS', unitPrice: 11800, total: 1180000 },
        { materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', qty: 200, unit: 'PCS', unitPrice: 3600, total: 720000 },
      ],
      totalAmount: 1900000, paymentTerms: 'Net 30', deliveryDate: '2026-02-15',
      incoterms: 'CIF', currency: 'PKR',
      createdByName: 'Hassan Ahmed', createdAt: '2026-01-20T00:00:00.000Z',
      forwardedAt: '2026-01-21T00:00:00.000Z', approvedAt: '2026-01-22T00:00:00.000Z',
    },
    {
      id: 'PO-00002', prId: null,
      supplierId: 'SUP-004', supplierName: 'TotalEnergies',
      status: 'draft',
      items: [
        { materialId: 'MAT-004', materialName: 'LPG Bulk MT', qty: 10, unit: 'MT', unitPrice: 180000, total: 1800000 },
      ],
      totalAmount: 1800000, paymentTerms: 'Net 30', deliveryDate: '2026-04-01',
      incoterms: 'FOB', currency: 'USD',
      createdByName: 'Hassan Ahmed', createdAt: '2026-03-01T00:00:00.000Z',
    },
  ],

  // ── GRNs ─────────────────────────────────────────────────────────────────────
  grns: [
    {
      id: 'GRN-00001', poId: 'PO-00001', supplierId: 'SUP-001', supplierName: 'Saudi Aramco',
      status: 'completed',
      items: [
        { materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg', orderedQty: 100, receivedQty: 100, unit: 'PCS', unitPrice: 11800, total: 1180000 },
        { materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', orderedQty: 200, receivedQty: 195, unit: 'PCS', unitPrice: 3600, total: 702000 },
      ],
      totalAmount: 1882000, vehicleNo: 'LHR-1234',
      receivedAt: '2026-02-14T10:00:00.000Z', completedAt: '2026-02-14T12:00:00.000Z',
      createdByName: 'Hassan Ahmed', createdAt: '2026-02-14T09:00:00.000Z',
    },
  ],

  // ── Purchase List (direct + GRN posted) ──────────────────────────────────────
  purchases: [
    {
      id: 'PL-00001', type: 'grn', grnId: 'GRN-00001', poId: 'PO-00001',
      supplierId: 'SUP-001', supplierName: 'Saudi Aramco',
      totalAmount: 1882000, status: 'posted', postedAt: '2026-02-14T12:00:00.000Z',
      createdAt: '2026-02-14T12:00:00.000Z',
    },
    {
      id: 'PL-00002', type: 'direct',
      supplierId: 'SUP-005', supplierName: 'Office Mart',
      items: [{ materialId: 'MAT-006', materialName: 'A4 Paper Ream', qty: 20, unit: 'PCS', unitPrice: 1200, total: 24000 }],
      totalAmount: 24000, status: 'draft',
      createdByName: 'System Administrator', createdAt: '2026-03-05T10:00:00.000Z',
    },
  ],

  // ── Approval Strategies ────────────────────────────────────────────────────────
  approvalStrategies: [
    { id: 'AS-001', name: 'PR Approval — Standard', module: 'Purchase', documentType: 'PR', levels: [ { level: 1, role: 'Purchase Manager', minAmount: 0, maxAmount: 500000 }, { level: 2, role: 'Finance Manager', minAmount: 500001, maxAmount: null } ], status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'AS-002', name: 'PO Approval — Standard', module: 'Purchase', documentType: 'PO', levels: [ { level: 1, role: 'Purchase Manager', minAmount: 0, maxAmount: 1000000 }, { level: 2, role: 'System Administrator', minAmount: 1000001, maxAmount: null } ], status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  ],

  // ── Inbox Items ───────────────────────────────────────────────────────────────
  inboxItems: [
    { id: 'INBOX-00001', type: 'PR_APPROVAL', refId: 'PR-00002', refNo: 'PR-00002', title: 'PR Approval: Office Furniture', message: 'Purchase Requisition PR-00002 submitted for approval', module: 'Purchase', priority: 'normal', status: 'pending', read: false, createdByName: 'System Administrator', createdAt: '2026-02-10T11:00:00.000Z' },
  ],

  // ── Notifications ─────────────────────────────────────────────────────────────
  notifications: [
    { id: 'NOTIF-001', title: 'PR Pending Approval', message: 'PR-00002 is waiting for your approval', type: 'warning', read: false, time: '10 Feb 2026, 11:00 AM', created: '2026-02-10T11:00:00.000Z' },
    { id: 'NOTIF-002', title: 'PO Approved',         message: 'PO-00001 has been approved',            type: 'success', read: true,  time: '22 Jan 2026, 10:00 AM', created: '2026-01-22T10:00:00.000Z' },
    { id: 'NOTIF-003', title: 'GRN Completed',       message: 'GRN-00001 received and posted',         type: 'info',    read: true,  time: '14 Feb 2026, 12:00 PM', created: '2026-02-14T12:00:00.000Z' },
  ],

  // ── Backups ───────────────────────────────────────────────────────────────────
  backups: [
    { id: 'BKP-001', name: 'Full Backup — Mar 2026',  size: '24.5 MB', type: 'full',        status: 'completed', createdAt: '2026-03-01T02:00:00.000Z' },
    { id: 'BKP-002', name: 'Incremental — Feb 2026',  size: '8.2 MB',  type: 'incremental', status: 'completed', createdAt: '2026-02-15T02:00:00.000Z' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function fmtPKR(n) {
  if (!n) return 'Rs 0';
  if (n >= 1e7) return `Rs ${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `Rs ${(n / 1e5).toFixed(1)}L`;
  return `Rs ${Number(n).toLocaleString()}`;
}

// ─── Accounting Initial Data ─────────────────────────────────────────────────
export const INITIAL_ACCOUNTS = [
  { id: '1001', name: 'Cash in Hand',             type: 'Asset',     balance: 125000,  active: true },
  { id: '1002', name: 'Cash at Bank — HBL',        type: 'Asset',     balance: 980000,  active: true },
  { id: '1003', name: 'Cash at Bank — MCB',        type: 'Asset',     balance: 320000,  active: true },
  { id: '1010', name: 'Accounts Receivable',       type: 'Asset',     balance: 540000,  active: true },
  { id: '1020', name: 'Inventory',                 type: 'Asset',     balance: 750000,  active: true },
  { id: '1030', name: 'Prepaid Expenses',          type: 'Asset',     balance: 48000,   active: true },
  { id: '1100', name: 'Fixed Assets — Vehicles',   type: 'Asset',     balance: 1200000, active: true },
  { id: '1101', name: 'Fixed Assets — Equipment',  type: 'Asset',     balance: 450000,  active: true },
  { id: '1110', name: 'Accumulated Depreciation',  type: 'Asset',     balance: -180000, active: true },
  { id: '2001', name: 'Accounts Payable',          type: 'Liability', balance: 320000,  active: true },
  { id: '2010', name: 'Sales Tax Payable',         type: 'Liability', balance: 85000,   active: true },
  { id: '2020', name: 'Withholding Tax Payable',   type: 'Liability', balance: 22000,   active: true },
  { id: '2030', name: 'Accrued Salaries',          type: 'Liability', balance: 95000,   active: true },
  { id: '2100', name: 'Short-term Loan — HBL',     type: 'Liability', balance: 500000,  active: true },
  { id: '2200', name: 'Long-term Loan — NBFI',     type: 'Liability', balance: 1500000, active: true },
  { id: '3001', name: 'Share Capital',             type: 'Equity',    balance: 2000000, active: true },
  { id: '3002', name: 'Retained Earnings',         type: 'Equity',    balance: 896000,  active: true },
  { id: '4001', name: 'LPG Cylinder Sales',        type: 'Revenue',   balance: 3850000, active: true },
  { id: '4002', name: 'Bulk LPG Sales',            type: 'Revenue',   balance: 1200000, active: true },
  { id: '4003', name: 'Service Charges',           type: 'Revenue',   balance: 185000,  active: true },
  { id: '5001', name: 'Cost of Goods Sold',        type: 'Expense',   balance: 3200000, active: true },
  { id: '5002', name: 'Salaries & Wages',          type: 'Expense',   balance: 480000,  active: true },
  { id: '5003', name: 'Rent Expense',              type: 'Expense',   balance: 144000,  active: true },
  { id: '5004', name: 'Fuel & Transportation',     type: 'Expense',   balance: 220000,  active: true },
  { id: '5005', name: 'Utilities',                 type: 'Expense',   balance: 36000,   active: true },
  { id: '5006', name: 'Marketing & Promotion',     type: 'Expense',   balance: 55000,   active: true },
  { id: '5007', name: 'Depreciation Expense',      type: 'Expense',   balance: 90000,   active: true },
  { id: '5008', name: 'Bank Charges',              type: 'Expense',   balance: 12000,   active: true },
];

export const INITIAL_JOURNAL = [
  { id: 'JE-001', date: '2026-01-01', description: 'Opening balance entry', ref: 'OB-2026',
    entries: [
      { account: '1002', label: 'Cash at Bank — HBL', dr: 980000, cr: 0 },
      { account: '3001', label: 'Share Capital',       dr: 0,      cr: 980000 },
    ], status: 'Posted', createdBy: 'admin' },
  { id: 'JE-002', date: '2026-01-05', description: 'Purchase of LPG Cylinders — Saudi Aramco', ref: 'PO-001',
    entries: [
      { account: '1020', label: 'Inventory',        dr: 450000, cr: 0 },
      { account: '2001', label: 'Accounts Payable', dr: 0,      cr: 450000 },
    ], status: 'Posted', createdBy: 'hassan' },
  { id: 'JE-003', date: '2026-01-10', description: 'Sales to Al-Faisal Trading', ref: 'INV-001',
    entries: [
      { account: '1010', label: 'Accounts Receivable', dr: 285000, cr: 0 },
      { account: '4001', label: 'LPG Cylinder Sales',  dr: 0,      cr: 285000 },
    ], status: 'Posted', createdBy: 'admin' },
  { id: 'JE-004', date: '2026-01-15', description: 'Payment to Saudi Aramco', ref: 'PV-001',
    entries: [
      { account: '2001', label: 'Accounts Payable',   dr: 450000, cr: 0 },
      { account: '1002', label: 'Cash at Bank — HBL', dr: 0,      cr: 450000 },
    ], status: 'Posted', createdBy: 'admin' },
  { id: 'JE-005', date: '2026-01-20', description: 'Monthly salaries — Jan 2026', ref: 'PAY-01',
    entries: [
      { account: '5002', label: 'Salaries & Wages',   dr: 40000, cr: 0 },
      { account: '1002', label: 'Cash at Bank — HBL', dr: 0,     cr: 40000 },
    ], status: 'Posted', createdBy: 'admin' },
  { id: 'JE-006', date: '2026-02-01', description: 'Bulk LPG Sale — WAPDA', ref: 'INV-002',
    entries: [
      { account: '1010', label: 'Accounts Receivable', dr: 180000, cr: 0 },
      { account: '4002', label: 'Bulk LPG Sales',      dr: 0,      cr: 180000 },
    ], status: 'Draft', createdBy: 'admin' },
];

export const INITIAL_AR = [
  { id: 'INV-001', customer: 'Al-Faisal Trading Co.',    date: '2026-01-10', due: '2026-02-10', amount: 285000, paid: 0,      status: 'Overdue' },
  { id: 'INV-002', customer: 'WAPDA Fuel Division',      date: '2026-02-01', due: '2026-03-01', amount: 180000, paid: 180000, status: 'Paid'    },
  { id: 'INV-003', customer: 'Pak Steel Mills',          date: '2026-02-15', due: '2026-03-15', amount: 92000,  paid: 50000,  status: 'Partial' },
  { id: 'INV-004', customer: 'City Gas Station',         date: '2026-03-01', due: '2026-04-01', amount: 145000, paid: 0,      status: 'Open'    },
  { id: 'INV-005', customer: 'National Fertilizers Ltd', date: '2026-03-10', due: '2026-04-10', amount: 220000, paid: 0,      status: 'Open'    },
  { id: 'INV-006', customer: 'Karachi Gas Depot',        date: '2025-12-01', due: '2026-01-01', amount: 75000,  paid: 0,      status: 'Overdue' },
];

export const INITIAL_AP_BILLS = [
  { id: 'BILL-001', vendor: 'Saudi Aramco',            date: '2026-01-05', due: '2026-02-05', amount: 450000, paid: 450000, status: 'Paid'    },
  { id: 'BILL-002', vendor: 'ADNOC Distribution',      date: '2026-01-20', due: '2026-02-20', amount: 320000, paid: 0,      status: 'Overdue' },
  { id: 'BILL-003', vendor: 'Shell Gas Pakistan',       date: '2026-02-01', due: '2026-03-01', amount: 185000, paid: 100000, status: 'Partial' },
  { id: 'BILL-004', vendor: 'TotalEnergies Pakistan',   date: '2026-03-01', due: '2026-04-01', amount: 275000, paid: 0,      status: 'Open'    },
  { id: 'BILL-005', vendor: 'Cylinder Repair Workshop', date: '2026-03-05', due: '2026-03-20', amount: 28000,  paid: 0,      status: 'Open'    },
];

export const INITIAL_VOUCHERS = [
  { id: 'PV-001', type: 'Payment', date: '2026-01-15', payee: 'Saudi Aramco',       account: '1002', accountName: 'Cash at Bank — HBL', amount: 450000, description: 'Payment for BILL-001', ref: 'BILL-001', status: 'Approved' },
  { id: 'PV-002', type: 'Payment', date: '2026-01-20', payee: 'Office Landlord',    account: '1001', accountName: 'Cash in Hand',        amount: 12000,  description: 'Jan rent payment',     ref: '',         status: 'Approved' },
  { id: 'PV-003', type: 'Payment', date: '2026-01-20', payee: 'Payroll',            account: '1002', accountName: 'Cash at Bank — HBL', amount: 40000,  description: 'Jan salaries',          ref: 'PAY-01',   status: 'Approved' },
  { id: 'PV-004', type: 'Payment', date: '2026-02-10', payee: 'ADNOC Distribution', account: '1002', accountName: 'Cash at Bank — HBL', amount: 100000, description: 'Part payment BILL-002', ref: 'BILL-002', status: 'Draft'    },
  { id: 'RV-001', type: 'Receipt', date: '2026-02-05', payee: 'WAPDA Fuel Division', account: '1002', accountName: 'Cash at Bank — HBL', amount: 180000, description: 'Receipt for INV-002',  ref: 'INV-002',  status: 'Approved' },
  { id: 'RV-002', type: 'Receipt', date: '2026-02-20', payee: 'Pak Steel Mills',    account: '1002', accountName: 'Cash at Bank — HBL', amount: 50000,  description: 'Partial INV-003',       ref: 'INV-003',  status: 'Approved' },
];

export const INITIAL_BANK_TX = [
  { id: 'BK-001', date: '2026-01-01', description: 'Opening Balance',           ref: 'OB',     bookAmount:  980000, bankAmount:  980000, reconciled: true  },
  { id: 'BK-002', date: '2026-01-15', description: 'Payment to Saudi Aramco',   ref: 'PV-001', bookAmount: -450000, bankAmount: -450000, reconciled: true  },
  { id: 'BK-003', date: '2026-01-20', description: 'Salary disbursement',       ref: 'PAY-01', bookAmount:  -40000, bankAmount:  -40000, reconciled: true  },
  { id: 'BK-004', date: '2026-02-05', description: 'Receipt — WAPDA',           ref: 'RV-001', bookAmount:  180000, bankAmount:  180000, reconciled: true  },
  { id: 'BK-005', date: '2026-02-20', description: 'Receipt — Pak Steel Mills', ref: 'RV-002', bookAmount:   50000, bankAmount:    null, reconciled: false },
  { id: 'BK-006', date: '2026-02-10', description: 'Part payment ADNOC',        ref: 'PV-004', bookAmount: -100000, bankAmount:    null, reconciled: false },
  { id: 'BK-007', date: '2026-03-01', description: 'Bank charges Feb',          ref: 'BC-FEB', bookAmount:   -1200, bankAmount:   -1200, reconciled: true  },
];

export const INITIAL_COST_CENTERS = [
  { id: 'CC-001', name: 'LPG Distribution', budget: 1800000, actual: 1650000, dept: 'Operations' },
  { id: 'CC-002', name: 'Cylinder Sales',   budget: 1200000, actual: 1380000, dept: 'Sales'      },
  { id: 'CC-003', name: 'Finance & Admin',  budget: 350000,  actual: 295000,  dept: 'Finance'    },
  { id: 'CC-004', name: 'Human Resources',  budget: 280000,  actual: 250000,  dept: 'HR'         },
  { id: 'CC-005', name: 'IT & Technology',  budget: 180000,  actual: 195000,  dept: 'IT'         },
];

export const INITIAL_TAX_RATES = [
  { id: 'TX-001', name: 'General Sales Tax (GST)',   rate: 17,  type: 'Output',      applicable: 'LPG Sales',          active: true  },
  { id: 'TX-002', name: 'Reduced GST',               rate: 5,   type: 'Output',      applicable: 'Domestic Cylinders', active: true  },
  { id: 'TX-003', name: 'Input Tax (Purchases)',     rate: 17,  type: 'Input',       applicable: 'All Purchases',      active: true  },
  { id: 'TX-004', name: 'WHT on Services (Sec 153)', rate: 10,  type: 'Withholding', applicable: 'Service Payments',   active: true  },
  { id: 'TX-005', name: 'WHT on Goods (Sec 153)',    rate: 4.5, type: 'Withholding', applicable: 'Goods Payments',     active: true  },
  { id: 'TX-006', name: 'Advance Tax (Sec 236H)',    rate: 1,   type: 'Withholding', applicable: 'Retailer Sales',     active: false },
];

// ─── INVENTORY MODULE INITIAL DATA ───────────────────────────────────────────

export const INITIAL_WAREHOUSES = [
  { id: 'WH-001', code: 'WH-LHR-MAIN', name: 'Lahore Main Warehouse',     location: 'Lahore',    type: 'main',     status: 'active', manager: 'Azhar Ali',   capacity: 5000, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'WH-002', code: 'WH-LHR-WSLE', name: 'Wholesale Distribution Hub', location: 'Lahore',    type: 'wholesale',status: 'active', manager: 'Hassan Ahmed',capacity: 2000, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'WH-003', code: 'WH-KHI-PORT', name: 'Karachi Port Godown',        location: 'Karachi',   type: 'transit',  status: 'active', manager: 'Bilal Khan',  capacity: 3000, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'WH-004', code: 'WH-ISB-RTL',  name: 'Islamabad Retail Store',     location: 'Islamabad', type: 'retail',   status: 'active', manager: 'Sara Malik',  capacity: 500,  createdAt: '2026-01-15T00:00:00.000Z' },
];

// inv_materials extends mockData.materials with MAP + per-warehouse stock
export const INITIAL_INV_MATERIALS = [
  {
    id: 'MAT-001', code: 'LPG-45',  name: 'LPG Cylinder 45kg',
    category: 'LPG Cylinders', unit: 'PCS',
    mapPrice: 12500,          // Moving Average Price
    standardPrice: 12000,
    reorderPoint: 100, reorderQty: 500, minStock: 50, maxStock: 2000,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty: 350, value: 4375000 },
      { warehouseId: 'WH-002', qty: 120, value: 1500000 },
      { warehouseId: 'WH-003', qty:  30, value:  375000 },
    ],
    totalQty: 500, totalValue: 6250000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'MAT-002', code: 'LPG-12',  name: 'LPG Cylinder 11.8kg',
    category: 'LPG Cylinders', unit: 'PCS',
    mapPrice: 3800, standardPrice: 3700,
    reorderPoint: 300, reorderQty: 1000, minStock: 100, maxStock: 5000,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty:  800, value: 3040000 },
      { warehouseId: 'WH-002', qty:  300, value: 1140000 },
      { warehouseId: 'WH-003', qty:  100, value:  380000 },
    ],
    totalQty: 1200, totalValue: 4560000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'MAT-003', code: 'LPG-05',  name: 'LPG Cylinder 5kg',
    category: 'LPG Cylinders', unit: 'PCS',
    mapPrice: 1800, standardPrice: 1750,
    reorderPoint: 200, reorderQty: 500, minStock: 50, maxStock: 3000,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty: 600, value: 1080000 },
      { warehouseId: 'WH-004', qty: 200, value:  360000 },
    ],
    totalQty: 800, totalValue: 1440000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'MAT-004', code: 'LPG-BLK', name: 'LPG Bulk MT',
    category: 'Bulk LPG', unit: 'MT',
    mapPrice: 180000, standardPrice: 175000,
    reorderPoint: 10, reorderQty: 50, minStock: 5, maxStock: 200,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty: 30, value: 5400000 },
      { warehouseId: 'WH-003', qty: 20, value: 3600000 },
    ],
    totalQty: 50, totalValue: 9000000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'MAT-005', code: 'OFF-CHR', name: 'Office Chair',
    category: 'Office Furniture', unit: 'PCS',
    mapPrice: 15000, standardPrice: 15000,
    reorderPoint: 5, reorderQty: 10, minStock: 2, maxStock: 50,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty: 20, value: 300000 },
    ],
    totalQty: 20, totalValue: 300000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'MAT-006', code: 'STA-A4',  name: 'A4 Paper Ream',
    category: 'Stationery', unit: 'PCS',
    mapPrice: 1200, standardPrice: 1200,
    reorderPoint: 50, reorderQty: 200, minStock: 20, maxStock: 500,
    valuationMethod: 'MAP',
    stockByWarehouse: [
      { warehouseId: 'WH-001', qty: 200, value: 240000 },
    ],
    totalQty: 200, totalValue: 240000,
    status: 'active', createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Stock ledger — every movement in/out (MB51 equivalent)
export const INITIAL_STOCK_LEDGER = [
  { id: 'SL-00001', date: '2026-01-01', materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg',   warehouseId: 'WH-001', whName: 'Lahore Main', movType: '561', movLabel: 'Opening Stock',    qty:  350, mapPrice: 12000, value: 4200000,  ref: 'OPEN-2026', createdBy: 'admin' },
  { id: 'SL-00002', date: '2026-01-01', materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', warehouseId: 'WH-001', whName: 'Lahore Main', movType: '561', movLabel: 'Opening Stock',    qty:  800, mapPrice:  3700, value: 2960000,  ref: 'OPEN-2026', createdBy: 'admin' },
  { id: 'SL-00003', date: '2026-01-01', materialId: 'MAT-003', materialName: 'LPG Cylinder 5kg',    warehouseId: 'WH-001', whName: 'Lahore Main', movType: '561', movLabel: 'Opening Stock',    qty:  600, mapPrice:  1750, value: 1050000,  ref: 'OPEN-2026', createdBy: 'admin' },
  { id: 'SL-00004', date: '2026-01-05', materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg',   warehouseId: 'WH-001', whName: 'Lahore Main', movType: '101', movLabel: 'Goods Receipt',    qty:  200, mapPrice: 12500, value: 2500000,  ref: 'GRN-11234', createdBy: 'hassan' },
  { id: 'SL-00005', date: '2026-01-10', materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg',   warehouseId: 'WH-001', whName: 'Lahore Main', movType: '601', movLabel: 'Goods Issue/Sale',  qty: -50,  mapPrice: 12333, value: -616650,  ref: 'INV-2026-001', createdBy: 'bilal' },
  { id: 'SL-00006', date: '2026-01-15', materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', warehouseId: 'WH-001', whName: 'Lahore Main', movType: '101', movLabel: 'Goods Receipt',    qty:  400, mapPrice:  3800, value: 1520000,  ref: 'GRN-11235', createdBy: 'hassan' },
  { id: 'SL-00007', date: '2026-01-20', materialId: 'MAT-002', materialName: 'LPG Cylinder 11.8kg', warehouseId: 'WH-002', whName: 'Wholesale Hub', movType: '311', movLabel: 'Stock Transfer',   qty:  300, mapPrice:  3800, value: 1140000,  ref: 'TR-001', createdBy: 'admin' },
  { id: 'SL-00008', date: '2026-02-01', materialId: 'MAT-004', materialName: 'LPG Bulk MT',         warehouseId: 'WH-003', whName: 'Karachi Port', movType: '101', movLabel: 'Goods Receipt',    qty:   20, mapPrice: 180000, value: 3600000, ref: 'GRN-11236', createdBy: 'hassan' },
  { id: 'SL-00009', date: '2026-02-10', materialId: 'MAT-001', materialName: 'LPG Cylinder 45kg',   warehouseId: 'WH-002', whName: 'Wholesale Hub', movType: '601', movLabel: 'Goods Issue/Sale',  qty: -80,  mapPrice: 12500, value: -1000000, ref: 'INV-2026-002', createdBy: 'bilal' },
  { id: 'SL-00010', date: '2026-03-01', materialId: 'MAT-003', materialName: 'LPG Cylinder 5kg',    warehouseId: 'WH-004', whName: 'ISB Retail',   movType: '311', movLabel: 'Stock Transfer',   qty:  200, mapPrice:  1800, value:  360000,  ref: 'TR-002', createdBy: 'admin' },
];

// Movement type catalogue (SAP-style)
export const INV_MOVEMENT_TYPES = [
  { code: '101', label: 'Goods Receipt (GRN)',       direction: 'in',  account: '1020' },
  { code: '102', label: 'GRN Reversal',              direction: 'out', account: '1020' },
  { code: '201', label: 'Goods Issue to Cost Center',direction: 'out', account: '5001' },
  { code: '261', label: 'Goods Issue for Order',     direction: 'out', account: '5001' },
  { code: '301', label: 'Transfer Posting',          direction: 'in',  account: '1020' },
  { code: '311', label: 'Transfer to Warehouse',     direction: 'both',account: '1020' },
  { code: '551', label: 'Stock Adjustment +',        direction: 'in',  account: '5009' },
  { code: '552', label: 'Stock Adjustment -',        direction: 'out', account: '5009' },
  { code: '561', label: 'Opening Stock Entry',       direction: 'in',  account: '1020' },
  { code: '601', label: 'Goods Issue / Sales',       direction: 'out', account: '5001' },
  { code: '602', label: 'Sales Return',              direction: 'in',  account: '5001' },
];

// ─── S&D MODULE INITIAL DATA ──────────────────────────────────────────────────

export const SD_PARTY_TIERS = ['Wholesaler','Retailer','Shop','Consumer'];

export const INITIAL_SD_PARTIES = [
  // Wholesalers
  { id:'PARTY-001', code:'WS-001', name:'Al-Raza Wholesale (Own)',    tier:'Wholesaler', parentId:null,      phone:'+92-42-111-0001', email:'wholesale@alraza.com',  city:'Lahore',    creditLimit:5000000, creditDays:30, balance:0,       status:'active', isOwned:true,  rating:5, createdBy:'admin', createdAt:'2026-01-01T00:00:00.000Z' },
  { id:'PARTY-002', code:'WS-002', name:'National Gas Distributors',  tier:'Wholesaler', parentId:null,      phone:'+92-42-111-0002', email:'ngd@gas.com',           city:'Lahore',    creditLimit:3000000, creditDays:45, balance:450000,  status:'active', isOwned:false, rating:4, createdBy:'admin', createdAt:'2026-01-05T00:00:00.000Z' },
  { id:'PARTY-003', code:'WS-003', name:'Pak LPG Traders',            tier:'Wholesaler', parentId:null,      phone:'+92-51-111-0003', email:'plt@traders.com',       city:'Islamabad', creditLimit:2000000, creditDays:30, balance:200000,  status:'active', isOwned:false, rating:3, createdBy:'admin', createdAt:'2026-01-10T00:00:00.000Z' },
  // Retailers
  { id:'PARTY-004', code:'RT-001', name:'Al-Raza Retail (Own)',       tier:'Retailer',   parentId:'PARTY-001', phone:'+92-42-222-0001', email:'retail@alraza.com',   city:'Lahore',    creditLimit:1000000, creditDays:15, balance:0,       status:'active', isOwned:true,  rating:5, createdBy:'admin', createdAt:'2026-01-01T00:00:00.000Z' },
  { id:'PARTY-005', code:'RT-002', name:'City Gas Agency',            tier:'Retailer',   parentId:'PARTY-002', phone:'+92-42-222-0002', email:'cga@gas.com',         city:'Lahore',    creditLimit:500000,  creditDays:15, balance:85000,   status:'active', isOwned:false, rating:4, createdBy:'admin', createdAt:'2026-01-08T00:00:00.000Z' },
  { id:'PARTY-006', code:'RT-003', name:'Gulberg Gas Point',          tier:'Retailer',   parentId:'PARTY-002', phone:'+92-42-222-0003', email:'ggp@gas.com',         city:'Lahore',    creditLimit:300000,  creditDays:10, balance:30000,   status:'active', isOwned:false, rating:3, createdBy:'admin', createdAt:'2026-01-12T00:00:00.000Z' },
  // Shops
  { id:'PARTY-007', code:'SH-001', name:'Al-Raza Shop DHA (Own)',     tier:'Shop',       parentId:'PARTY-004', phone:'+92-42-333-0001', email:'dha@alraza.com',      city:'Lahore',    creditLimit:200000,  creditDays:7,  balance:0,       status:'active', isOwned:true,  rating:5, createdBy:'admin', createdAt:'2026-01-01T00:00:00.000Z' },
  { id:'PARTY-008', code:'SH-002', name:'Model Town Gas Shop',        tier:'Shop',       parentId:'PARTY-005', phone:'+92-42-333-0002', email:'mt@gas.com',          city:'Lahore',    creditLimit:100000,  creditDays:7,  balance:15000,   status:'active', isOwned:false, rating:4, createdBy:'admin', createdAt:'2026-01-15T00:00:00.000Z' },
  // Consumers
  { id:'PARTY-009', code:'CN-001', name:'WAPDA (Industrial)',         tier:'Consumer',   parentId:null,       phone:'+92-51-999-0001', email:'procurement@wapda.gov', city:'Islamabad', creditLimit:10000000,creditDays:60, balance:180000,  status:'active', isOwned:false, rating:5, createdBy:'admin', createdAt:'2026-01-20T00:00:00.000Z' },
  { id:'PARTY-010', code:'CN-002', name:'Pak Steel Mills',            tier:'Consumer',   parentId:null,       phone:'+92-21-111-0010', email:'supply@paksteel.com',  city:'Karachi',   creditLimit:5000000, creditDays:30, balance:92000,   status:'active', isOwned:false, rating:4, createdBy:'admin', createdAt:'2026-02-01T00:00:00.000Z' },
];

export const INITIAL_SD_PRICE_LISTS = [
  { id:'PL-001', name:'Wholesale Price List 2026', tier:'Wholesaler', effectiveFrom:'2026-01-01', effectiveTo:'2026-12-31', status:'active', items:[
    { materialId:'MAT-001', materialName:'LPG Cylinder 45kg',   unitPrice:13500, discountPct:0 },
    { materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', unitPrice:4200,  discountPct:0 },
    { materialId:'MAT-003', materialName:'LPG Cylinder 5kg',    unitPrice:2000,  discountPct:0 },
    { materialId:'MAT-004', materialName:'LPG Bulk MT',         unitPrice:195000,discountPct:0 },
  ]},
  { id:'PL-002', name:'Retail Price List 2026',    tier:'Retailer',   effectiveFrom:'2026-01-01', effectiveTo:'2026-12-31', status:'active', items:[
    { materialId:'MAT-001', materialName:'LPG Cylinder 45kg',   unitPrice:14500, discountPct:0 },
    { materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', unitPrice:4600,  discountPct:0 },
    { materialId:'MAT-003', materialName:'LPG Cylinder 5kg',    unitPrice:2200,  discountPct:0 },
    { materialId:'MAT-004', materialName:'LPG Bulk MT',         unitPrice:210000,discountPct:0 },
  ]},
  { id:'PL-003', name:'Consumer / Retail End Price',tier:'Consumer',   effectiveFrom:'2026-01-01', effectiveTo:'2026-12-31', status:'active', items:[
    { materialId:'MAT-001', materialName:'LPG Cylinder 45kg',   unitPrice:15500, discountPct:0 },
    { materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', unitPrice:5000,  discountPct:0 },
    { materialId:'MAT-003', materialName:'LPG Cylinder 5kg',    unitPrice:2400,  discountPct:0 },
  ]},
];

export const INITIAL_SALES_ORDERS = [
  { id:'SO-00001', date:'2026-01-10', partyId:'PARTY-002', partyName:'National Gas Distributors', tier:'Wholesaler', warehouseId:'WH-001', status:'invoiced', paymentTerms:'Net 30', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:50, unit:'PCS', unitPrice:13500, discount:0, total:675000 },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:100, unit:'PCS', unitPrice:4200, discount:0, total:420000 }], subTotal:1095000, taxPct:17, taxAmount:186150, grandTotal:1281150, createdBy:'bilal', createdAt:'2026-01-10T08:00:00.000Z' },
  { id:'SO-00002', date:'2026-02-05', partyId:'PARTY-009', partyName:'WAPDA (Industrial)',        tier:'Consumer',  warehouseId:'WH-001', status:'delivered', paymentTerms:'Net 60', items:[{ materialId:'MAT-004', materialName:'LPG Bulk MT', qty:10, unit:'MT', unitPrice:195000, discount:0, total:1950000 }], subTotal:1950000, taxPct:17, taxAmount:331500, grandTotal:2281500, createdBy:'bilal', createdAt:'2026-02-05T09:00:00.000Z' },
  { id:'SO-00003', date:'2026-03-01', partyId:'PARTY-003', partyName:'Pak LPG Traders',           tier:'Wholesaler',warehouseId:'WH-002', status:'approved',  paymentTerms:'Net 30', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:30, unit:'PCS', unitPrice:13500, discount:0, total:405000 },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:60, unit:'PCS', unitPrice:4200, discount:0, total:252000 }], subTotal:657000, taxPct:17, taxAmount:111690, grandTotal:768690, createdBy:'bilal', createdAt:'2026-03-01T10:00:00.000Z' },
  { id:'SO-00004', date:'2026-03-10', partyId:'PARTY-005', partyName:'City Gas Agency',           tier:'Retailer',  warehouseId:'WH-002', status:'draft',     paymentTerms:'Net 15', items:[{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:40, unit:'PCS', unitPrice:4600, discount:0, total:184000 },{ materialId:'MAT-003', materialName:'LPG Cylinder 5kg', qty:20, unit:'PCS', unitPrice:2200, discount:0, total:44000 }], subTotal:228000, taxPct:17, taxAmount:38760, grandTotal:266760, createdBy:'bilal', createdAt:'2026-03-10T11:00:00.000Z' },
];

export const INITIAL_DELIVERY_ORDERS = [
  { id:'DO-00001', soId:'SO-00001', date:'2026-01-12', partyId:'PARTY-002', partyName:'National Gas Distributors', warehouseId:'WH-001', status:'delivered', driver:'Usman Ali', vehicle:'LHR-1234', deliveredAt:'2026-01-12T14:00:00.000Z', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:50, unit:'PCS' },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:100, unit:'PCS' }], createdBy:'admin', createdAt:'2026-01-11T08:00:00.000Z' },
  { id:'DO-00002', soId:'SO-00002', date:'2026-02-08', partyId:'PARTY-009', partyName:'WAPDA (Industrial)',        warehouseId:'WH-003', status:'delivered', driver:'Hassan Raza', vehicle:'KHI-5678', deliveredAt:'2026-02-08T16:00:00.000Z', items:[{ materialId:'MAT-004', materialName:'LPG Bulk MT', qty:10, unit:'MT' }], createdBy:'admin', createdAt:'2026-02-07T09:00:00.000Z' },
  { id:'DO-00003', soId:'SO-00003', date:'2026-03-03', partyId:'PARTY-003', partyName:'Pak LPG Traders',           warehouseId:'WH-002', status:'in_transit', driver:'Ali Khan',   vehicle:'LHR-9012', deliveredAt:null, items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:30, unit:'PCS' },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:60, unit:'PCS' }], createdBy:'admin', createdAt:'2026-03-02T09:00:00.000Z' },
];

export const INITIAL_SALES_INVOICES = [
  { id:'SINV-00001', soId:'SO-00001', doId:'DO-00001', date:'2026-01-12', partyId:'PARTY-002', partyName:'National Gas Distributors', tier:'Wholesaler', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:50, unit:'PCS', unitPrice:13500, mapPrice:12500, total:675000, cogs:625000 },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:100, unit:'PCS', unitPrice:4200, mapPrice:3800, total:420000, cogs:380000 }], subTotal:1095000, taxPct:17, taxAmount:186150, grandTotal:1281150, cogsTotal:1005000, grossProfit:90000, status:'posted', paidAmount:831150, dueDate:'2026-02-11', createdBy:'bilal', createdAt:'2026-01-12T15:00:00.000Z' },
  { id:'SINV-00002', soId:'SO-00002', doId:'DO-00002', date:'2026-02-08', partyId:'PARTY-009', partyName:'WAPDA (Industrial)',        tier:'Consumer',  items:[{ materialId:'MAT-004', materialName:'LPG Bulk MT', qty:10, unit:'MT', unitPrice:195000, mapPrice:180000, total:1950000, cogs:1800000 }], subTotal:1950000, taxPct:17, taxAmount:331500, grandTotal:2281500, cogsTotal:1800000, grossProfit:150000, status:'posted', paidAmount:2281500, dueDate:'2026-04-08', createdBy:'bilal', createdAt:'2026-02-08T16:30:00.000Z' },
];

export const INITIAL_COMMISSION_REPS = [
  { id:'REP-001', name:'Bilal Khan',  email:'bilal@alrazalpg.com',  phone:'+92-300-0000003', tier:'Wholesaler', targetMonthly:5000000, commissionPct:0.5, status:'active', createdAt:'2026-01-01T00:00:00.000Z' },
  { id:'REP-002', name:'Sara Malik',  email:'sara@alrazalpg.com',   phone:'+92-300-0000004', tier:'Retailer',   targetMonthly:2000000, commissionPct:0.8, status:'active', createdAt:'2026-01-01T00:00:00.000Z' },
];

// ─── POS MODULE INITIAL DATA ──────────────────────────────────────────────────

export const INITIAL_POS_TERMINALS = [
  { id:'POS-001', name:'Main Counter — DHA',    warehouseId:'WH-001', shopPartyId:'PARTY-007', status:'active',  cashierId:'USR-003', openingBalance:10000, createdAt:'2026-01-01T00:00:00.000Z' },
  { id:'POS-002', name:'Counter 2 — Model Town',warehouseId:'WH-004', shopPartyId:'PARTY-008', status:'active',  cashierId:'USR-003', openingBalance:5000,  createdAt:'2026-01-15T00:00:00.000Z' },
];

export const INITIAL_POS_SESSIONS = [
  { id:'SESS-001', terminalId:'POS-001', cashierId:'USR-003', cashierName:'Bilal Khan', openedAt:'2026-03-18T09:00:00.000Z', closedAt:'2026-03-18T21:00:00.000Z', openingBalance:10000, closingBalance:47500, totalSales:37500, totalTransactions:12, status:'closed' },
];

export const INITIAL_POS_SALES = [
  { id:'POS-SALE-001', sessionId:'SESS-001', terminalId:'POS-001', date:'2026-03-18', partyId:'PARTY-007', items:[{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:2, unitPrice:5000, total:10000 },{ materialId:'MAT-003', materialName:'LPG Cylinder 5kg', qty:1, unitPrice:2400, total:2400 }], subTotal:12400, taxAmt:0, grandTotal:12400, paymentMethod:'cash', amountPaid:12400, change:0, status:'posted', createdAt:'2026-03-18T10:30:00.000Z' },
  { id:'POS-SALE-002', sessionId:'SESS-001', terminalId:'POS-001', date:'2026-03-18', partyId:'PARTY-007', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:1, unitPrice:15500, total:15500 }], subTotal:15500, taxAmt:0, grandTotal:15500, paymentMethod:'card', amountPaid:15500, change:0, status:'posted', createdAt:'2026-03-18T14:00:00.000Z' },
];

// ─── DISTRIBUTION MODULE INITIAL DATA ────────────────────────────────────────

export const INITIAL_DIST_ROUTES = [
  { id:'RT-001', name:'DHA / Cantt Route',       code:'DHA', city:'Lahore', zones:['DHA Phase 1','DHA Phase 2','Cantonment'], stops:12, distanceKm:28, defaultVehicleId:'VH-001', defaultDriverId:'DRV-001', status:'active', createdAt:'2026-01-01T00:00:00Z' },
  { id:'RT-002', name:'Gulberg / MM Alam Route', code:'GLB', city:'Lahore', zones:['Gulberg I','Gulberg III','M.M. Alam Rd'], stops:9,  distanceKm:18, defaultVehicleId:'VH-002', defaultDriverId:'DRV-002', status:'active', createdAt:'2026-01-01T00:00:00Z' },
  { id:'RT-003', name:'Model Town / Garden Town', code:'MTG', city:'Lahore', zones:['Model Town','Garden Town','Faisal Town'], stops:11, distanceKm:22, defaultVehicleId:'VH-001', defaultDriverId:'DRV-003', status:'active', createdAt:'2026-01-01T00:00:00Z' },
  { id:'RT-004', name:'Johar Town / Bahria',      code:'JTB', city:'Lahore', zones:['Johar Town','Bahria Town','Lake City'],   stops:14, distanceKm:35, defaultVehicleId:'VH-003', defaultDriverId:'DRV-002', status:'active', createdAt:'2026-01-01T00:00:00Z' },
];

export const INITIAL_DIST_VEHICLES = [
  { id:'VH-001', regNo:'LHR-1234', type:'Truck',      make:'Isuzu',   model:'NPR',    year:2021, capacity:80,  capacityUnit:'cylinders', fuelType:'Diesel', currentDriverId:'DRV-001', status:'active',      lastService:'2026-01-15', nextServiceDue:'2026-04-15', odometer:42500 },
  { id:'VH-002', regNo:'LHR-5678', type:'Mini Truck', make:'Toyota',  model:'Dyna',   year:2020, capacity:40,  capacityUnit:'cylinders', fuelType:'Diesel', currentDriverId:'DRV-002', status:'active',      lastService:'2026-02-01', nextServiceDue:'2026-05-01', odometer:61200 },
  { id:'VH-003', regNo:'LHR-9012', type:'Truck',      make:'Hino',    model:'500',    year:2022, capacity:120, capacityUnit:'cylinders', fuelType:'Diesel', currentDriverId:'DRV-003', status:'active',      lastService:'2026-01-20', nextServiceDue:'2026-04-20', odometer:28900 },
  { id:'VH-004', regNo:'LHR-3456', type:'Tanker',     make:'Faw',     model:'CA1083', year:2019, capacity:15,  capacityUnit:'MT',        fuelType:'Diesel', currentDriverId:null,      status:'maintenance', lastService:'2026-03-01', nextServiceDue:'2026-03-20', odometer:95400 },
];

export const INITIAL_DIST_DRIVERS = [
  { id:'DRV-001', name:'Usman Ali',    cnic:'35201-1234567-1', phone:'+92-300-1111001', license:'LHR-D-001', licenseExpiry:'2027-06-30', assignedVehicleId:'VH-001', assignedRouteId:'RT-001', status:'active', joiningDate:'2022-03-01', rating:4.8 },
  { id:'DRV-002', name:'Hassan Raza',  cnic:'35201-2345678-2', phone:'+92-300-1111002', license:'LHR-D-002', licenseExpiry:'2026-12-31', assignedVehicleId:'VH-002', assignedRouteId:'RT-002', status:'active', joiningDate:'2021-07-15', rating:4.5 },
  { id:'DRV-003', name:'Ali Khan',     cnic:'35201-3456789-3', phone:'+92-300-1111003', license:'LHR-D-003', licenseExpiry:'2027-03-31', assignedVehicleId:'VH-003', assignedRouteId:'RT-003', status:'active', joiningDate:'2023-01-10', rating:4.2 },
  { id:'DRV-004', name:'Bilal Ahmed',  cnic:'35201-4567890-4', phone:'+92-300-1111004', license:'LHR-D-004', licenseExpiry:'2026-09-30', assignedVehicleId:null,     assignedRouteId:null,    status:'active', joiningDate:'2023-06-01', rating:4.0 },
];

export const INITIAL_LOAD_ORDERS = [
  { id:'LO-00001', date:'2026-03-18', routeId:'RT-001', routeName:'DHA / Cantt Route', vehicleId:'VH-001', driverId:'DRV-001', warehouseId:'WH-001', items:[{ materialId:'MAT-001', materialName:'LPG Cylinder 45kg', qty:30, unit:'PCS' },{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:40, unit:'PCS' }], totalCylinders:70, status:'dispatched', createdBy:'admin', createdAt:'2026-03-18T07:00:00Z' },
  { id:'LO-00002', date:'2026-03-18', routeId:'RT-002', routeName:'Gulberg / MM Alam', vehicleId:'VH-002', driverId:'DRV-002', warehouseId:'WH-001', items:[{ materialId:'MAT-002', materialName:'LPG Cylinder 11.8kg', qty:35, unit:'PCS' },{ materialId:'MAT-003', materialName:'LPG Cylinder 5kg', qty:15, unit:'PCS' }], totalCylinders:50, status:'pending', createdBy:'admin', createdAt:'2026-03-18T07:30:00Z' },
];

export const INITIAL_TRIPS = [
  { id:'TR-00001', loadOrderId:'LO-00001', date:'2026-03-18', routeId:'RT-001', routeName:'DHA / Cantt Route', vehicleId:'VH-001', vehicleReg:'LHR-1234', driverId:'DRV-001', driverName:'Usman Ali', departureTime:'2026-03-18T08:00:00Z', returnTime:'2026-03-18T14:30:00Z', stops:[
    { stopNo:1, partyId:'PARTY-007', partyName:'Al-Raza Shop DHA', address:'DHA Phase 2', items:[{ materialId:'MAT-001', qty:10 },{ materialId:'MAT-002', qty:15 }], status:'delivered', cashCollected:221500, emptiesReturned:8 },
    { stopNo:2, partyId:'PARTY-008', partyName:'Model Town Gas Shop', address:'DHA Phase 1', items:[{ materialId:'MAT-001', qty:8 },{ materialId:'MAT-002', qty:12 }], status:'delivered', cashCollected:178000, emptiesReturned:6 },
    { stopNo:3, partyId:'PARTY-005', partyName:'City Gas Agency', address:'Cantonment', items:[{ materialId:'MAT-001', qty:5 }], status:'failed', cashCollected:0, emptiesReturned:0, failReason:'Customer absent' },
  ], status:'returning', cashExpected:524500, cashCollected:399500, emptiesOut:70, emptiesReturned:14, undeliveredQty:5, expenses:3700, createdBy:'admin', createdAt:'2026-03-18T07:45:00Z' },
];

export const INITIAL_SETTLEMENTS = [];

export const INITIAL_MAINTENANCE = [
  { id:'MNT-001', vehicleId:'VH-001', vehicleReg:'LHR-1234', type:'Oil Change',    date:'2026-01-15', cost:8500,  odometer:42000, vendor:'City Motors',   status:'done', notes:'Engine oil + filter replaced', nextDueDate:'2026-04-15', nextDueOdo:52000 },
  { id:'MNT-002', vehicleId:'VH-004', vehicleReg:'LHR-3456', type:'Brake Repair',  date:'2026-03-01', cost:45000, odometer:95400, vendor:'Al-Rehman Auto',status:'done', notes:'Front brake pads + disc replaced', nextDueDate:'2026-09-01', nextDueOdo:115000 },
  { id:'MNT-003', vehicleId:'VH-003', vehicleReg:'LHR-9012', type:'Tyre Change',   date:'2026-01-20', cost:32000, odometer:28500, vendor:'Punjab Tyres',  status:'done', notes:'4 tyres replaced', nextDueDate:'2026-07-20', nextDueOdo:68500 },
];

export const INITIAL_FUEL_LOG = [
  { id:'FL-001', vehicleId:'VH-001', vehicleReg:'LHR-1234', driverId:'DRV-001', driverName:'Usman Ali',   date:'2026-03-18', litres:45, pricePerLitre:285, totalCost:12825, odometer:42500, station:'PSO DHA',          createdAt:'2026-03-18T07:45:00Z' },
  { id:'FL-002', vehicleId:'VH-002', vehicleReg:'LHR-5678', driverId:'DRV-002', driverName:'Hassan Raza', date:'2026-03-17', litres:30, pricePerLitre:285, totalCost:8550,  odometer:61200, station:'Shell Gulberg',     createdAt:'2026-03-17T08:10:00Z' },
  { id:'FL-003', vehicleId:'VH-003', vehicleReg:'LHR-9012', driverId:'DRV-003', driverName:'Ali Khan',    date:'2026-03-16', litres:55, pricePerLitre:285, totalCost:15675, odometer:28900, station:'Total Model Town',  createdAt:'2026-03-16T07:30:00Z' },
];

// ─── HR MODULE INITIAL DATA ───────────────────────────────────────────────────

export const INITIAL_HR_DEPARTMENTS = [
  { id:'DEPT-001', name:'Administration',    code:'ADM', hodEmployeeId:'EMP-001', parentId:null, status:'active' },
  { id:'DEPT-002', name:'Operations',        code:'OPS', hodEmployeeId:'EMP-003', parentId:null, status:'active' },
  { id:'DEPT-003', name:'Finance',           code:'FIN', hodEmployeeId:'EMP-002', parentId:null, status:'active' },
  { id:'DEPT-004', name:'Distribution',      code:'DST', hodEmployeeId:'EMP-003', parentId:'DEPT-002', status:'active' },
  { id:'DEPT-005', name:'Sales & Marketing', code:'SAL', hodEmployeeId:'EMP-005', parentId:null, status:'active' },
  { id:'DEPT-006', name:'IT',                code:'IT',  hodEmployeeId:null,      parentId:'DEPT-001', status:'active' },
];

export const INITIAL_HR_DESIGNATIONS = [
  { id:'DES-001', title:'System Administrator', grade:'G10', departmentId:'DEPT-001', minSalary:80000,  maxSalary:150000, status:'active' },
  { id:'DES-002', title:'General Manager',      grade:'G9',  departmentId:'DEPT-002', minSalary:100000, maxSalary:200000, status:'active' },
  { id:'DES-003', title:'Finance Manager',      grade:'G8',  departmentId:'DEPT-003', minSalary:70000,  maxSalary:120000, status:'active' },
  { id:'DES-004', title:'Accountant',           grade:'G6',  departmentId:'DEPT-003', minSalary:35000,  maxSalary:60000,  status:'active' },
  { id:'DES-005', title:'Sales Executive',      grade:'G5',  departmentId:'DEPT-005', minSalary:30000,  maxSalary:55000,  status:'active' },
  { id:'DES-006', title:'Driver',               grade:'G3',  departmentId:'DEPT-004', minSalary:25000,  maxSalary:40000,  status:'active' },
  { id:'DES-007', title:'Loader / Helper',      grade:'G2',  departmentId:'DEPT-004', minSalary:20000,  maxSalary:32000,  status:'active' },
  { id:'DES-008', title:'Office Assistant',     grade:'G4',  departmentId:'DEPT-001', minSalary:28000,  maxSalary:45000,  status:'active' },
];

export const INITIAL_EMPLOYEES = [
  {
    id:'EMP-001', empCode:'EMP-001', firstName:'System',  lastName:'Administrator', cnic:'35201-0000001-1',
    phone:'+92-300-0000001', email:'admin@alrazalpg.com', gender:'Male',
    dob:'1985-01-01', joiningDate:'2020-01-01', confirmationDate:'2020-04-01',
    departmentId:'DEPT-001', designationId:'DES-001', grade:'G10',
    employeeType:'Permanent', status:'active',
    bankAccount:'0123456789', bankName:'HBL',
    userId:'USR-001', driverProfileId:null,
    address:'Lahore', emergencyContact:'', notes:'',
  },
  {
    id:'EMP-002', empCode:'EMP-002', firstName:'Hassan',  lastName:'Ahmed', cnic:'35201-0000002-2',
    phone:'+92-300-0000002', email:'hassan@alrazalpg.com', gender:'Male',
    dob:'1990-05-15', joiningDate:'2021-03-01', confirmationDate:'2021-06-01',
    departmentId:'DEPT-003', designationId:'DES-004', grade:'G6',
    employeeType:'Permanent', status:'active',
    bankAccount:'0234567890', bankName:'MCB',
    userId:'USR-002', driverProfileId:null,
    address:'Lahore', emergencyContact:'', notes:'',
  },
  {
    id:'EMP-003', empCode:'EMP-003', firstName:'Bilal',   lastName:'Khan', cnic:'35201-0000003-3',
    phone:'+92-300-0000003', email:'bilal@alrazalpg.com', gender:'Male',
    dob:'1988-09-20', joiningDate:'2022-01-01', confirmationDate:'2022-04-01',
    departmentId:'DEPT-005', designationId:'DES-005', grade:'G5',
    employeeType:'Permanent', status:'active',
    bankAccount:'0345678901', bankName:'UBL',
    userId:'USR-003', driverProfileId:null,
    address:'Lahore', emergencyContact:'', notes:'',
  },
  {
    id:'EMP-004', empCode:'EMP-004', firstName:'Usman',   lastName:'Ali', cnic:'35201-1234567-1',
    phone:'+92-300-1111001', email:'usman@alrazalpg.com', gender:'Male',
    dob:'1992-03-10', joiningDate:'2022-03-01', confirmationDate:'2022-06-01',
    departmentId:'DEPT-004', designationId:'DES-006', grade:'G3',
    employeeType:'Permanent', status:'active',
    bankAccount:'0456789012', bankName:'Meezan Bank',
    userId:null, driverProfileId:'DRV-001',
    address:'Lahore', emergencyContact:'', notes:'',
  },
  {
    id:'EMP-005', empCode:'EMP-005', firstName:'Hassan',  lastName:'Raza', cnic:'35201-2345678-2',
    phone:'+92-300-1111002', email:'hraza@alrazalpg.com', gender:'Male',
    dob:'1991-07-25', joiningDate:'2021-07-15', confirmationDate:'2021-10-15',
    departmentId:'DEPT-004', designationId:'DES-006', grade:'G3',
    employeeType:'Permanent', status:'active',
    bankAccount:'0567890123', bankName:'Allied Bank',
    userId:null, driverProfileId:'DRV-002',
    address:'Lahore', emergencyContact:'', notes:'',
  },
  {
    id:'EMP-006', empCode:'EMP-006', firstName:'Ali',     lastName:'Khan', cnic:'35201-3456789-3',
    phone:'+92-300-1111003', email:'alikhan@alrazalpg.com', gender:'Male',
    dob:'1993-11-05', joiningDate:'2023-01-10', confirmationDate:'2023-04-10',
    departmentId:'DEPT-004', designationId:'DES-006', grade:'G3',
    employeeType:'Permanent', status:'active',
    bankAccount:'0678901234', bankName:'HBL',
    userId:null, driverProfileId:'DRV-003',
    address:'Lahore', emergencyContact:'', notes:'',
  },
];

export const INITIAL_SALARY_STRUCTURES = [
  {
    id:'SS-001', employeeId:'EMP-001', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-001', type:'earning',   name:'Basic Salary',    amount:60000, startDate:'2026-01-01', endDate:null },
      { id:'SC-002', type:'earning',   name:'HRA',             amount:12000, startDate:'2026-01-01', endDate:null },
      { id:'SC-003', type:'earning',   name:'Medical Allowance',amount:5000, startDate:'2026-01-01', endDate:null },
      { id:'SC-004', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
  {
    id:'SS-002', employeeId:'EMP-002', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-010', type:'earning',   name:'Basic Salary',    amount:35000, startDate:'2026-01-01', endDate:null },
      { id:'SC-011', type:'earning',   name:'HRA',             amount:7000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-012', type:'earning',   name:'Conveyance',      amount:3000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-013', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
  {
    id:'SS-003', employeeId:'EMP-003', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-020', type:'earning',   name:'Basic Salary',    amount:40000, startDate:'2026-01-01', endDate:null },
      { id:'SC-021', type:'earning',   name:'HRA',             amount:8000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-022', type:'earning',   name:'Conveyance',      amount:3000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-023', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
  {
    id:'SS-004', employeeId:'EMP-004', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-030', type:'earning',   name:'Basic Salary',    amount:28000, startDate:'2026-01-01', endDate:null },
      { id:'SC-031', type:'earning',   name:'Conveyance',      amount:2000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-032', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
  {
    id:'SS-005', employeeId:'EMP-005', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-040', type:'earning',   name:'Basic Salary',    amount:26000, startDate:'2026-01-01', endDate:null },
      { id:'SC-041', type:'earning',   name:'Conveyance',      amount:2000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-042', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
  {
    id:'SS-006', employeeId:'EMP-006', updatedAt:'2026-01-01T00:00:00Z',
    components:[
      { id:'SC-050', type:'earning',   name:'Basic Salary',    amount:25000, startDate:'2026-01-01', endDate:null },
      { id:'SC-051', type:'earning',   name:'Conveyance',      amount:2000,  startDate:'2026-01-01', endDate:null },
      { id:'SC-052', type:'deduction', name:'EOBI',            amount:370,   startDate:'2026-01-01', endDate:null },
    ],
  },
];

export const INITIAL_PAYROLL_PERIODS = [
  { id:'PP-2026-01', month:'2026-01', label:'January 2026', status:'closed', openedAt:'2026-01-01T00:00:00Z', processedAt:'2026-01-28T00:00:00Z', postedAt:'2026-01-31T00:00:00Z', postedBy:'admin' },
  { id:'PP-2026-02', month:'2026-02', label:'February 2026',status:'closed', openedAt:'2026-02-01T00:00:00Z', processedAt:'2026-02-26T00:00:00Z', postedAt:'2026-02-28T00:00:00Z', postedBy:'admin' },
  { id:'PP-2026-03', month:'2026-03', label:'March 2026',   status:'open',   openedAt:'2026-03-01T00:00:00Z', processedAt:null, postedAt:null, postedBy:null },
];

export const INITIAL_PAYROLL_RECORDS = [
  { id:'PR-001', periodId:'PP-2026-02', employeeId:'EMP-001', empCode:'EMP-001', name:'System Administrator', department:'Administration', designation:'System Administrator', attendanceDays:28, absentDays:0, leaveDays:0, earnings:{ 'Basic Salary':60000,'HRA':12000,'Medical Allowance':5000 }, deductions:{ 'EOBI':370 }, grossPay:77000, totalDeductions:370, netPay:76630, status:'approved' },
  { id:'PR-002', periodId:'PP-2026-02', employeeId:'EMP-002', empCode:'EMP-002', name:'Hassan Ahmed', department:'Finance', designation:'Accountant', attendanceDays:28, absentDays:0, leaveDays:0, earnings:{ 'Basic Salary':35000,'HRA':7000,'Conveyance':3000 }, deductions:{ 'EOBI':370 }, grossPay:45000, totalDeductions:370, netPay:44630, status:'approved' },
  { id:'PR-003', periodId:'PP-2026-02', employeeId:'EMP-003', empCode:'EMP-003', name:'Bilal Khan', department:'Sales & Marketing', designation:'Sales Executive', attendanceDays:26, absentDays:2, leaveDays:0, earnings:{ 'Basic Salary':40000,'HRA':8000,'Conveyance':3000 }, deductions:{ 'EOBI':370,'Absent Deduction':2857 }, grossPay:51000, totalDeductions:3227, netPay:47773, status:'approved' },
  { id:'PR-004', periodId:'PP-2026-02', employeeId:'EMP-004', empCode:'EMP-004', name:'Usman Ali', department:'Distribution', designation:'Driver', attendanceDays:28, absentDays:0, leaveDays:0, earnings:{ 'Basic Salary':28000,'Conveyance':2000 }, deductions:{ 'EOBI':370 }, grossPay:30000, totalDeductions:370, netPay:29630, status:'approved' },
  { id:'PR-005', periodId:'PP-2026-02', employeeId:'EMP-005', empCode:'EMP-005', name:'Hassan Raza', department:'Distribution', designation:'Driver', attendanceDays:27, absentDays:1, leaveDays:0, earnings:{ 'Basic Salary':26000,'Conveyance':2000 }, deductions:{ 'EOBI':370,'Absent Deduction':963 }, grossPay:28000, totalDeductions:1333, netPay:26667, status:'approved' },
  { id:'PR-006', periodId:'PP-2026-02', employeeId:'EMP-006', empCode:'EMP-006', name:'Ali Khan', department:'Distribution', designation:'Driver', attendanceDays:28, absentDays:0, leaveDays:0, earnings:{ 'Basic Salary':25000,'Conveyance':2000 }, deductions:{ 'EOBI':370 }, grossPay:27000, totalDeductions:370, netPay:26630, status:'approved' },
];

export const INITIAL_ATTENDANCE = [
  { id:'ATT-001', employeeId:'EMP-001', date:'2026-03-18', status:'present', inTime:'09:00', outTime:'18:00', note:'' },
  { id:'ATT-002', employeeId:'EMP-002', date:'2026-03-18', status:'present', inTime:'09:05', outTime:'18:00', note:'' },
  { id:'ATT-003', employeeId:'EMP-003', date:'2026-03-18', status:'present', inTime:'09:00', outTime:'17:45', note:'' },
  { id:'ATT-004', employeeId:'EMP-004', date:'2026-03-18', status:'present', inTime:'07:30', outTime:'17:00', note:'Trip day' },
  { id:'ATT-005', employeeId:'EMP-005', date:'2026-03-18', status:'present', inTime:'07:30', outTime:'17:00', note:'Trip day' },
  { id:'ATT-006', employeeId:'EMP-006', date:'2026-03-18', status:'absent',  inTime:'',     outTime:'',     note:'No show' },
];

export const INITIAL_LEAVES = [
  { id:'LV-001', employeeId:'EMP-003', employeeName:'Bilal Khan', type:'Annual Leave', fromDate:'2026-03-10', toDate:'2026-03-11', days:2, reason:'Personal work', status:'approved', approvedBy:'admin', appliedAt:'2026-03-08T10:00:00Z' },
  { id:'LV-002', employeeId:'EMP-005', employeeName:'Hassan Raza', type:'Sick Leave', fromDate:'2026-03-17', toDate:'2026-03-17', days:1, reason:'Fever', status:'approved', approvedBy:'admin', appliedAt:'2026-03-17T08:00:00Z' },
  { id:'LV-003', employeeId:'EMP-002', employeeName:'Hassan Ahmed', type:'Annual Leave', fromDate:'2026-03-25', toDate:'2026-03-27', days:3, reason:'Family function', status:'pending', approvedBy:null, appliedAt:'2026-03-18T11:00:00Z' },
];

export const INITIAL_LOANS = [
  { id:'LOAN-001', employeeId:'EMP-003', employeeName:'Bilal Khan', amount:50000, disbursedDate:'2026-01-15', emiAmount:5000, emiMonths:10, recoveredAmount:10000, status:'active', note:'Medical expense', createdAt:'2026-01-15T00:00:00Z' },
  { id:'LOAN-002', employeeId:'EMP-004', employeeName:'Usman Ali',  amount:30000, disbursedDate:'2026-02-01', emiAmount:3000, emiMonths:10, recoveredAmount:3000, status:'active', note:'Vehicle repair',  createdAt:'2026-02-01T00:00:00Z' },
];
