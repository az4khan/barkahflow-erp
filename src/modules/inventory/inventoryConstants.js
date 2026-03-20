export const ACCENT = '#0ea5e9'; // sky-500 — distinct from Purchase (orange) and Accounting (teal)
export const ACCENT_DARK = '#0284c7';

export const INV_NAV = [
  { divider: true, label: 'OVERVIEW' },
  { id: 'dashboard',   path: '',           icon: 'dashboard', label: 'Dashboard'        },
  { divider: true, label: 'MASTER DATA' },
  { id: 'materials',   path: 'materials',  icon: 'products',  label: 'Materials'         },
  { id: 'warehouses',  path: 'warehouses', icon: 'building',  label: 'Warehouses'        },
  { id: 'stock',       path: 'stock',      icon: 'box',       label: 'Stock Overview'    },
  { divider: true, label: 'TRANSACTIONS' },
  { id: 'receipt',     path: 'receipt',    icon: 'purchase',  label: 'Goods Receipt'     },
  { id: 'issue',       path: 'issue',      icon: 'cart',      label: 'Goods Issue'       },
  { id: 'transfer',    path: 'transfer',   icon: 'truck',     label: 'Stock Transfer'    },
  { id: 'adjustment',  path: 'adjustment', icon: 'edit',      label: 'Stock Adjustment'  },
  { id: 'opening',     path: 'opening',    icon: 'upload',    label: 'Opening Stock'     },
  { divider: true, label: 'REPORTS' },
  { id: 'ledger',      path: 'ledger',     icon: 'reports',   label: 'Stock Ledger'      },
  { id: 'valuation',   path: 'valuation',  icon: 'briefcase', label: 'Valuation Report'  },
  { id: 'reorder',     path: 'reorder',    icon: 'bell',      label: 'Reorder Report'    },
];

export const PAGE_TITLE = {
  '':           'Dashboard',
  'materials':  'Materials',
  'warehouses': 'Warehouses',
  'stock':      'Stock Overview',
  'receipt':    'Goods Receipt',
  'issue':      'Goods Issue',
  'transfer':   'Stock Transfer',
  'adjustment': 'Stock Adjustment',
  'opening':    'Opening Stock',
  'ledger':     'Stock Ledger',
  'valuation':  'Valuation Report',
  'reorder':    'Reorder Report',
};

export const WH_TYPE_COLOR = {
  main:      '#0ea5e9',
  wholesale: '#f97316',
  retail:    '#10b981',
  transit:   '#8b5cf6',
  other:     '#94a3b8',
};

export const MOV_COLOR = {
  '101': '#10b981', '561': '#10b981', '602': '#10b981', '551': '#10b981', '301': '#10b981',
  '601': '#ef4444', '102': '#ef4444', '552': '#ef4444', '201': '#ef4444', '261': '#ef4444',
  '311': '#3b82f6',
};

export const fmtQty = (n, unit) => `${Number(n).toLocaleString()} ${unit || ''}`.trim();
