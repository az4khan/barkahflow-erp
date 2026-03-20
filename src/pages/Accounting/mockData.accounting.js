// ─── ACCOUNTING DATA ─────────────────────────────────────────────────────────
// INSTRUCTIONS: Copy everything below and APPEND to src/data/mockData.js
// No new file needed — this extends the existing mockData.js

export const INITIAL_ACCOUNTS = [
  // Assets
  { id: "1001", name: "Cash in Hand",             type: "Asset",     balance: 125000,  active: true },
  { id: "1002", name: "Cash at Bank — HBL",        type: "Asset",     balance: 980000,  active: true },
  { id: "1003", name: "Cash at Bank — MCB",        type: "Asset",     balance: 320000,  active: true },
  { id: "1010", name: "Accounts Receivable",       type: "Asset",     balance: 540000,  active: true },
  { id: "1020", name: "Inventory",                 type: "Asset",     balance: 750000,  active: true },
  { id: "1030", name: "Prepaid Expenses",          type: "Asset",     balance: 48000,   active: true },
  { id: "1100", name: "Fixed Assets — Vehicles",   type: "Asset",     balance: 1200000, active: true },
  { id: "1101", name: "Fixed Assets — Equipment",  type: "Asset",     balance: 450000,  active: true },
  { id: "1110", name: "Accumulated Depreciation",  type: "Asset",     balance: -180000, active: true },
  // Liabilities
  { id: "2001", name: "Accounts Payable",          type: "Liability", balance: 320000,  active: true },
  { id: "2010", name: "Sales Tax Payable",         type: "Liability", balance: 85000,   active: true },
  { id: "2020", name: "Withholding Tax Payable",   type: "Liability", balance: 22000,   active: true },
  { id: "2030", name: "Accrued Salaries",          type: "Liability", balance: 95000,   active: true },
  { id: "2100", name: "Short-term Loan — HBL",     type: "Liability", balance: 500000,  active: true },
  { id: "2200", name: "Long-term Loan — NBFI",     type: "Liability", balance: 1500000, active: true },
  // Equity
  { id: "3001", name: "Share Capital",             type: "Equity",    balance: 2000000, active: true },
  { id: "3002", name: "Retained Earnings",         type: "Equity",    balance: 896000,  active: true },
  // Revenue
  { id: "4001", name: "LPG Cylinder Sales",        type: "Revenue",   balance: 3850000, active: true },
  { id: "4002", name: "Bulk LPG Sales",            type: "Revenue",   balance: 1200000, active: true },
  { id: "4003", name: "Service Charges",           type: "Revenue",   balance: 185000,  active: true },
  // Expenses
  { id: "5001", name: "Cost of Goods Sold",        type: "Expense",   balance: 3200000, active: true },
  { id: "5002", name: "Salaries & Wages",          type: "Expense",   balance: 480000,  active: true },
  { id: "5003", name: "Rent Expense",              type: "Expense",   balance: 144000,  active: true },
  { id: "5004", name: "Fuel & Transportation",     type: "Expense",   balance: 220000,  active: true },
  { id: "5005", name: "Utilities",                 type: "Expense",   balance: 36000,   active: true },
  { id: "5006", name: "Marketing & Promotion",     type: "Expense",   balance: 55000,   active: true },
  { id: "5007", name: "Depreciation Expense",      type: "Expense",   balance: 90000,   active: true },
  { id: "5008", name: "Bank Charges",              type: "Expense",   balance: 12000,   active: true },
];

export const INITIAL_JOURNAL = [
  {
    id: "JE-001", date: "2024-07-01", description: "Opening balance entry", ref: "OB-2024",
    entries: [
      { account: "1002", label: "Cash at Bank — HBL", dr: 980000, cr: 0 },
      { account: "3001", label: "Share Capital",       dr: 0,      cr: 980000 },
    ],
    status: "Posted", createdBy: "admin",
  },
  {
    id: "JE-002", date: "2024-07-05", description: "Purchase of LPG Cylinders — Saudi Aramco", ref: "PO-001",
    entries: [
      { account: "1020", label: "Inventory",        dr: 450000, cr: 0 },
      { account: "2001", label: "Accounts Payable", dr: 0,      cr: 450000 },
    ],
    status: "Posted", createdBy: "hassan",
  },
  {
    id: "JE-003", date: "2024-07-10", description: "Sales to Al-Faisal Trading", ref: "INV-001",
    entries: [
      { account: "1010", label: "Accounts Receivable", dr: 285000, cr: 0 },
      { account: "4001", label: "LPG Cylinder Sales",  dr: 0,      cr: 285000 },
    ],
    status: "Posted", createdBy: "admin",
  },
  {
    id: "JE-004", date: "2024-07-15", description: "Payment to Saudi Aramco", ref: "PV-001",
    entries: [
      { account: "2001", label: "Accounts Payable",   dr: 450000, cr: 0 },
      { account: "1002", label: "Cash at Bank — HBL", dr: 0,      cr: 450000 },
    ],
    status: "Posted", createdBy: "admin",
  },
  {
    id: "JE-005", date: "2024-07-20", description: "Monthly salaries — July", ref: "PAY-07",
    entries: [
      { account: "5002", label: "Salaries & Wages",   dr: 40000, cr: 0 },
      { account: "1002", label: "Cash at Bank — HBL", dr: 0,     cr: 40000 },
    ],
    status: "Posted", createdBy: "admin",
  },
  {
    id: "JE-006", date: "2024-08-01", description: "Bulk LPG Sale — WAPDA", ref: "INV-002",
    entries: [
      { account: "1010", label: "Accounts Receivable", dr: 180000, cr: 0 },
      { account: "4002", label: "Bulk LPG Sales",      dr: 0,      cr: 180000 },
    ],
    status: "Draft", createdBy: "admin",
  },
];

export const INITIAL_AR = [
  { id: "INV-001", customer: "Al-Faisal Trading Co.",    date: "2024-07-10", due: "2024-08-10", amount: 285000, paid: 0,      status: "Overdue" },
  { id: "INV-002", customer: "WAPDA Fuel Division",      date: "2024-08-01", due: "2024-09-01", amount: 180000, paid: 180000, status: "Paid"    },
  { id: "INV-003", customer: "Pak Steel Mills",          date: "2024-08-15", due: "2024-09-15", amount: 92000,  paid: 50000,  status: "Partial" },
  { id: "INV-004", customer: "City Gas Station",         date: "2024-09-01", due: "2024-10-01", amount: 145000, paid: 0,      status: "Open"    },
  { id: "INV-005", customer: "National Fertilizers Ltd", date: "2024-09-10", due: "2024-10-10", amount: 220000, paid: 0,      status: "Open"    },
  { id: "INV-006", customer: "Karachi Gas Depot",        date: "2024-06-01", due: "2024-07-01", amount: 75000,  paid: 0,      status: "Overdue" },
];

export const INITIAL_AP_BILLS = [
  { id: "BILL-001", vendor: "Saudi Aramco",            date: "2024-07-05", due: "2024-08-05", amount: 450000, paid: 450000, status: "Paid"    },
  { id: "BILL-002", vendor: "ADNOC Distribution",      date: "2024-07-20", due: "2024-08-20", amount: 320000, paid: 0,      status: "Overdue" },
  { id: "BILL-003", vendor: "Shell Gas Pakistan",       date: "2024-08-01", due: "2024-09-01", amount: 185000, paid: 100000, status: "Partial" },
  { id: "BILL-004", vendor: "TotalEnergies Pakistan",   date: "2024-09-01", due: "2024-10-01", amount: 275000, paid: 0,      status: "Open"    },
  { id: "BILL-005", vendor: "Cylinder Repair Workshop", date: "2024-09-05", due: "2024-09-20", amount: 28000,  paid: 0,      status: "Open"    },
];

export const INITIAL_VOUCHERS = [
  { id: "PV-001", type: "Payment", date: "2024-07-15", payee: "Saudi Aramco",       account: "1002", accountName: "Cash at Bank — HBL", amount: 450000, description: "Payment for BILL-001", ref: "BILL-001", status: "Approved" },
  { id: "PV-002", type: "Payment", date: "2024-07-20", payee: "Office Landlord",    account: "1001", accountName: "Cash in Hand",        amount: 12000,  description: "July rent payment",    ref: "",         status: "Approved" },
  { id: "PV-003", type: "Payment", date: "2024-07-20", payee: "Payroll",            account: "1002", accountName: "Cash at Bank — HBL", amount: 40000,  description: "July salaries",         ref: "PAY-07",   status: "Approved" },
  { id: "PV-004", type: "Payment", date: "2024-08-10", payee: "ADNOC Distribution", account: "1002", accountName: "Cash at Bank — HBL", amount: 100000, description: "Part payment BILL-002", ref: "BILL-002", status: "Draft"    },
  { id: "RV-001", type: "Receipt", date: "2024-08-05", payee: "WAPDA Fuel Division", account: "1002", accountName: "Cash at Bank — HBL", amount: 180000, description: "Receipt for INV-002",  ref: "INV-002",  status: "Approved" },
  { id: "RV-002", type: "Receipt", date: "2024-08-20", payee: "Pak Steel Mills",    account: "1002", accountName: "Cash at Bank — HBL", amount: 50000,  description: "Partial INV-003",       ref: "INV-003",  status: "Approved" },
];

export const INITIAL_BANK_TX = [
  { id: "BK-001", date: "2024-07-01", description: "Opening Balance",           ref: "OB",     bookAmount:  980000, bankAmount:  980000, reconciled: true  },
  { id: "BK-002", date: "2024-07-15", description: "Payment to Saudi Aramco",   ref: "PV-001", bookAmount: -450000, bankAmount: -450000, reconciled: true  },
  { id: "BK-003", date: "2024-07-20", description: "Salary disbursement",       ref: "PAY-07", bookAmount:  -40000, bankAmount:  -40000, reconciled: true  },
  { id: "BK-004", date: "2024-08-05", description: "Receipt — WAPDA",           ref: "RV-001", bookAmount:  180000, bankAmount:  180000, reconciled: true  },
  { id: "BK-005", date: "2024-08-20", description: "Receipt — Pak Steel Mills", ref: "RV-002", bookAmount:   50000, bankAmount:    null, reconciled: false },
  { id: "BK-006", date: "2024-08-10", description: "Part payment ADNOC",        ref: "PV-004", bookAmount: -100000, bankAmount:    null, reconciled: false },
  { id: "BK-007", date: "2024-09-01", description: "Bank charges Aug",          ref: "BC-AUG", bookAmount:   -1200, bankAmount:   -1200, reconciled: true  },
];

export const INITIAL_COST_CENTERS = [
  { id: "CC-001", name: "LPG Distribution", budget: 1800000, actual: 1650000, dept: "Operations" },
  { id: "CC-002", name: "Cylinder Sales",   budget: 1200000, actual: 1380000, dept: "Sales"      },
  { id: "CC-003", name: "Finance & Admin",  budget: 350000,  actual: 295000,  dept: "Finance"    },
  { id: "CC-004", name: "Human Resources",  budget: 280000,  actual: 250000,  dept: "HR"         },
  { id: "CC-005", name: "IT & Technology",  budget: 180000,  actual: 195000,  dept: "IT"         },
];

export const INITIAL_TAX_RATES = [
  { id: "TX-001", name: "General Sales Tax (GST)",   rate: 17,  type: "Output",      applicable: "LPG Sales",          active: true  },
  { id: "TX-002", name: "Reduced GST",               rate: 5,   type: "Output",      applicable: "Domestic Cylinders", active: true  },
  { id: "TX-003", name: "Input Tax (Purchases)",     rate: 17,  type: "Input",       applicable: "All Purchases",      active: true  },
  { id: "TX-004", name: "WHT on Services (Sec 153)", rate: 10,  type: "Withholding", applicable: "Service Payments",   active: true  },
  { id: "TX-005", name: "WHT on Goods (Sec 153)",    rate: 4.5, type: "Withholding", applicable: "Goods Payments",     active: true  },
  { id: "TX-006", name: "Advance Tax (Sec 236H)",    rate: 1,   type: "Withholding", applicable: "Retailer Sales",     active: false },
];
