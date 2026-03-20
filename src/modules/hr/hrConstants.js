export const ACCENT      = '#8b5cf6'; // violet — distinct from all other modules
export const ACCENT_DARK = '#7c3aed';

export const HR_NAV = [
  { divider:true, label:'OVERVIEW' },
  { id:'dashboard',    path:'',            icon:'dashboard', label:'Dashboard'          },
  { divider:true, label:'ORGANIZATION' },
  { id:'employees',    path:'employees',   icon:'users',     label:'Employee Master'    },
  { id:'departments',  path:'departments', icon:'building',  label:'Departments'        },
  { id:'designations', path:'designations',icon:'star',      label:'Designations'       },
  { divider:true, label:'TIME & LEAVE' },
  { id:'attendance',   path:'attendance',  icon:'check',     label:'Attendance'         },
  { id:'leaves',       path:'leaves',      icon:'invoice',   label:'Leave Management'   },
  { divider:true, label:'PAYROLL' },
  { id:'salarystructure',path:'salarystructure',icon:'list', label:'Salary Structure'   },
  { id:'periods',      path:'periods',     icon:'briefcase', label:'Payroll Periods'    },
  { id:'payroll',      path:'payroll',     icon:'store',     label:'Payroll Processing' },
  { id:'slips',        path:'slips',       icon:'invoice',   label:'Salary Slips'       },
  { divider:true, label:'BENEFITS & LOANS' },
  { id:'loans',        path:'loans',       icon:'breakdown', label:'Loan Management'    },
  { id:'eobi',         path:'eobi',        icon:'shield',    label:'EOBI / PESSI'       },
  { id:'gratuity',     path:'gratuity',    icon:'trending',  label:'Gratuity'           },
  { id:'settlement',   path:'settlement',  icon:'purchase',  label:'Final Settlement'   },
  { divider:true, label:'REPORTS' },
  { id:'payreports',   path:'payreports',  icon:'reports',   label:'Payroll Reports'    },
  { id:'headcount',    path:'headcount',   icon:'products',  label:'Headcount Report'   },
];

export const PAGE_TITLE = {
  '':               'Dashboard',         'employees':    'Employee Master',
  'departments':    'Departments',       'designations': 'Designations',
  'attendance':     'Attendance',        'leaves':       'Leave Management',
  'salarystructure':'Salary Structure',  'periods':      'Payroll Periods',
  'payroll':        'Payroll Processing','slips':        'Salary Slips',
  'loans':          'Loan Management',   'eobi':         'EOBI / PESSI',
  'gratuity':       'Gratuity',          'settlement':   'Final Settlement',
  'payreports':     'Payroll Reports',   'headcount':    'Headcount Report',
};

export const EMP_TYPES   = ['Permanent','Contract','Daily Wage','Probation'];
export const GRADES      = ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'];
export const LEAVE_TYPES = ['Annual Leave','Sick Leave','Casual Leave','Unpaid Leave','Maternity Leave','Paternity Leave'];
export const EARNING_COMPONENTS  = ['Basic Salary','HRA','Conveyance','Medical Allowance','Overtime','Bonus','Incentive','Special Allowance'];
export const DEDUCTION_COMPONENTS= ['EOBI','PESSI','Income Tax','Loan Recovery','Absent Deduction','Late Deduction','Other Deduction'];
export const BANKS = ['HBL','MCB','UBL','Meezan Bank','Allied Bank','Bank Alfalah','NBP','Standard Chartered','Faysal Bank','Silk Bank'];

export const fmtPKRhr = n => {
  if (!n && n!==0) return 'Rs 0';
  if (n >= 1e7) return `Rs ${(n/1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `Rs ${(n/1e5).toFixed(1)}L`;
  return `Rs ${Number(n).toLocaleString()}`;
};

// EOBI rates (Pakistan 2026)
export const EOBI_EMP_RATE  = 0.01;  // 1% of min wage (Rs 370/month flat)
export const EOBI_EMP_AMT   = 370;   // employee contribution (flat)
export const EOBI_EMPR_AMT  = 1295;  // employer contribution (flat)
export const PESSI_EMP_RATE = 0.03;  // 3% of gross (Punjab)
export const PESSI_EMPR_RATE= 0.06;  // 6% of gross (employer)
