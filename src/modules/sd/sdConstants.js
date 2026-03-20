export const ACCENT       = '#10b981'; // emerald — distinct from all other modules
export const ACCENT_DARK  = '#059669';

export const SD_NAV = [
  { divider:true, label:'OVERVIEW' },
  { id:'dashboard',   path:'',           icon:'dashboard', label:'Dashboard'         },
  { divider:true, label:'MASTER DATA' },
  { id:'parties',     path:'parties',    icon:'users',     label:'Party Master'       },
  { id:'pricelists',  path:'pricelists', icon:'list',      label:'Price Lists'        },
  { id:'discounts',   path:'discounts',  icon:'star',      label:'Discount Schemes'   },
  { divider:true, label:'SALES FLOW' },
  { id:'orders',      path:'orders',     icon:'invoice',   label:'Sales Orders'       },
  { id:'delivery',    path:'delivery',   icon:'truck',     label:'Delivery Orders'    },
  { id:'invoices',    path:'invoices',   icon:'briefcase', label:'Sales Invoices'     },
  { id:'interco',     path:'interco',    icon:'building',  label:'Inter-company Sales'},
  { divider:true, label:'POST-SALE' },
  { id:'returns',     path:'returns',    icon:'purchase',  label:'Sales Returns'      },
  { id:'claims',      path:'claims',     icon:'alert',     label:'Claims & Adjustments'},
  { divider:true, label:'RECEIVABLES' },
  { id:'ledger',      path:'ledger',     icon:'reports',   label:'Party Ledger'       },
  { id:'collections', path:'collections',icon:'check',     label:'Collections'        },
  { divider:true, label:'COMMISSION' },
  { id:'reps',        path:'reps',       icon:'users',     label:'Sales Reps'         },
  { id:'commission',  path:'commission', icon:'trending',  label:'Commission Ledger'  },
  { divider:true, label:'REPORTS' },
  { id:'salesreports',path:'salesreports',icon:'breakdown',label:'Sales Reports'      },
  { id:'creditctrl',  path:'creditctrl', icon:'shield',    label:'Credit Control'     },
];

export const PAGE_TITLE = {
  '':            'Dashboard',        'parties':     'Party Master',
  'pricelists':  'Price Lists',      'discounts':   'Discount Schemes',
  'orders':      'Sales Orders',     'delivery':    'Delivery Orders',
  'invoices':    'Sales Invoices',   'interco':     'Inter-company Sales',
  'returns':     'Sales Returns',    'claims':      'Claims & Adjustments',
  'ledger':      'Party Ledger',     'collections': 'Collections',
  'reps':        'Sales Reps',       'commission':  'Commission Ledger',
  'salesreports':'Sales Reports',    'creditctrl':  'Credit Control',
};

export const TIER_COLOR = {
  Wholesaler: '#10b981', Retailer: '#3b82f6',
  Shop:       '#f59e0b', Consumer: '#8b5cf6',
};

export const STATUS_COLOR = {
  draft:'#94a3b8', approved:'#3b82f6', delivery_pending:'#f59e0b',
  delivered:'#10b981', invoiced:'#0ea5e9', cancelled:'#ef4444', posted:'#10b981',
};

export const fmtPKRsd = n => {
  if (!n) return 'Rs 0';
  if (n >= 1e7) return `Rs ${(n/1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `Rs ${(n/1e5).toFixed(1)}L`;
  return `Rs ${Number(n).toLocaleString()}`;
};
