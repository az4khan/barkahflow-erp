export const ACCENT      = '#ef4444'; // red — fleet/urgent
export const ACCENT_DARK = '#dc2626';

export const DIST_NAV = [
  { divider:true, label:'OVERVIEW' },
  { id:'dashboard',    path:'',             icon:'dashboard', label:'Dashboard'          },
  { divider:true, label:'MASTER DATA' },
  { id:'routes',       path:'routes',       icon:'trending',  label:'Route Master'       },
  { id:'vehicles',     path:'vehicles',     icon:'truck',     label:'Vehicle Master'     },
  { id:'drivers',      path:'drivers',      icon:'users',     label:'Driver Master'      },
  { divider:true, label:'OPERATIONS' },
  { id:'loadorders',   path:'loadorders',   icon:'box',       label:'Load Orders'        },
  { id:'trips',        path:'trips',        icon:'briefcase', label:'Trip Sheets'        },
  { id:'delivery',     path:'delivery',     icon:'check',     label:'Delivery Execution' },
  { id:'empties',      path:'empties',      icon:'purchase',  label:'Empties & Returns'  },
  { id:'settlement',   path:'settlement',   icon:'breakdown', label:'Trip Settlement'    },
  { divider:true, label:'FLEET' },
  { id:'maintenance',  path:'maintenance',  icon:'alert',     label:'Maintenance Log'    },
  { id:'fuel',         path:'fuel',         icon:'store',     label:'Fuel Log'           },
  { divider:true, label:'PLANNING' },
  { id:'schedule',     path:'schedule',     icon:'invoice',   label:'Delivery Schedule'  },
  { id:'capacity',     path:'capacity',     icon:'products',  label:'Capacity Planning'  },
  { divider:true, label:'REPORTS' },
  { id:'tripreports',  path:'tripreports',  icon:'reports',   label:'Trip Reports'       },
  { id:'performance',  path:'performance',  icon:'star',      label:'Driver Performance' },
];

export const PAGE_TITLE = {
  '':           'Dashboard',         'routes':      'Route Master',
  'vehicles':   'Vehicle Master',    'drivers':     'Driver Master',
  'loadorders': 'Load Orders',       'trips':       'Trip Sheets',
  'delivery':   'Delivery Execution','empties':     'Empties & Returns',
  'settlement': 'Trip Settlement',   'maintenance': 'Maintenance Log',
  'fuel':       'Fuel Log',          'schedule':    'Delivery Schedule',
  'capacity':   'Capacity Planning', 'tripreports': 'Trip Reports',
  'performance':'Driver Performance',
};

export const VEHICLE_TYPES  = ['Truck','Mini Truck','Tanker','Pickup','Motorcycle','Van'];
export const TRIP_STATUSES  = ['planned','loading','in_transit','returning','settled','cancelled'];
export const STATUS_COLOR   = {
  planned:'#94a3b8', loading:'#f59e0b', in_transit:'#3b82f6',
  returning:'#8b5cf6', settled:'#10b981', cancelled:'#ef4444',
};

export const fmtPKRd = n => {
  if (!n) return 'Rs 0';
  if (n >= 1e7) return `Rs ${(n/1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `Rs ${(n/1e5).toFixed(1)}L`;
  return `Rs ${Number(n).toLocaleString()}`;
};
