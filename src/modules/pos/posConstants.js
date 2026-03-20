export const ACCENT     = '#f97316'; // orange — matches POS energy
export const POS_NAV = [
  { divider:true, label:'TERMINAL' },
  { id:'terminal',  path:'',          icon:'store',     label:'POS Terminal'    },
  { id:'sessions',  path:'sessions',  icon:'briefcase', label:'Shift Management'},
  { divider:true, label:'RECORDS' },
  { id:'receipts',  path:'receipts',  icon:'invoice',   label:'POS Receipts'   },
  { id:'refunds',   path:'refunds',   icon:'purchase',  label:'Refunds'        },
  { divider:true, label:'REPORTS' },
  { id:'summary',   path:'summary',   icon:'reports',   label:'Daily Summary'  },
  { id:'posreports',path:'posreports',icon:'trending',  label:'POS Reports'    },
];
export const PAGE_TITLE = {
  '':          'POS Terminal',   'sessions':   'Shift Management',
  'receipts':  'POS Receipts',   'refunds':    'Refunds',
  'summary':   'Daily Summary',  'posreports': 'POS Reports',
};
export const PAY_METHODS = ['Cash','Card','Bank Transfer','Cheque'];
