// ─── Accounting Module — Constants Only ──────────────────────────────────────
// Icon names below all exist in src/components/common/Icon.jsx (confirmed)

export const ACCENT       = "#0d9488";
export const ACCENT_HOVER = "#0f766e";
export const ACCENT_LIGHT = "#f0fdfa";

export const NAV_ITEMS = [
  {
    section: "OVERVIEW",
    items: [
      { id: "dashboard",    label: "Dashboard",           icon: "dashboard"  },
    ],
  },
  {
    section: "MASTER DATA",
    items: [
      { id: "coa",          label: "Chart of Accounts",   icon: "list"       },
      { id: "cost-centers", label: "Cost Centers",        icon: "building"   },
      { id: "tax",          label: "Tax Management",      icon: "calculator" },
    ],
  },
  {
    section: "TRANSACTIONS",
    items: [
      { id: "journal",      label: "Journal Entries",     icon: "reports"    },
      { id: "vouchers",     label: "Vouchers",            icon: "invoice"    },
      { id: "ar",           label: "Accounts Receivable", icon: "breakdown"  },
      { id: "ap",           label: "Accounts Payable",    icon: "cart"       },
    ],
  },
  {
    section: "REPORTS",
    items: [
      { id: "trial",        label: "Trial Balance",       icon: "briefcase"  },
      { id: "pl",           label: "Profit & Loss",       icon: "trending"   },
      { id: "bs",           label: "Balance Sheet",       icon: "box"        },
      { id: "bank",         label: "Bank Reconciliation", icon: "database"   },
    ],
  },
];

export const ALL_NAV = NAV_ITEMS.flatMap(s => s.items);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

export const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

export const ACCOUNT_TYPE_COLOR = {
  Asset:     "#3b82f6",
  Liability: "#ef4444",
  Equity:    "#8b5cf6",
  Revenue:   "#10b981",
  Expense:   "#f59e0b",
};
