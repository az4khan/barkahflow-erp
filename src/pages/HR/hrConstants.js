export const HR_COLOR = "#FF0080";

export const HR_NAV = [
  { id:"hr-dashboard",    label:"Dashboard",             icon:"dashboard" },
  { divider:true, label:"Organization" },
  { id:"org-management",  label:"Org Management",        icon:"building"  },
  { id:"positions",       label:"Position Management",   icon:"briefcase" },
  { divider:true, label:"Workforce" },
  { id:"hire-employee",   label:"Hire Employee",         icon:"userplus"  },
  { id:"employees",       label:"Employee List",         icon:"users"     },
];

// ── Seed org data ─────────────────────────────────────────────────────────────
export const SEED_ORG = {
  companies: [
    { id:"CO-001", name:"Al-Raza LPG (Pvt.) Ltd.", code:"ARLPG", country:"Pakistan", status:"Active" },
  ],
  businessUnits: [
    { id:"BU-001", companyId:"CO-001", name:"LPG Operations",   code:"LGOP", status:"Active" },
    { id:"BU-002", companyId:"CO-001", name:"Corporate Affairs", code:"CORP", status:"Active" },
  ],
  divisions: [
    { id:"DV-001", buId:"BU-001", name:"Commercial Division",   code:"COMM", status:"Active" },
    { id:"DV-002", buId:"BU-001", name:"Technical Division",    code:"TECH", status:"Active" },
    { id:"DV-003", buId:"BU-002", name:"Finance Division",      code:"FIN",  status:"Active" },
    { id:"DV-004", buId:"BU-002", name:"Human Resources Div.",  code:"HRD",  status:"Active" },
  ],
  departments: [
    { id:"DP-001", divId:"DV-001", name:"Procurement",          code:"PROC", status:"Active" },
    { id:"DP-002", divId:"DV-001", name:"Sales & Marketing",    code:"SALE", status:"Active" },
    { id:"DP-003", divId:"DV-002", name:"Operations",           code:"OPER", status:"Active" },
    { id:"DP-004", divId:"DV-002", name:"Maintenance",          code:"MANT", status:"Active" },
    { id:"DP-005", divId:"DV-003", name:"Finance & Accounts",   code:"FINC", status:"Active" },
    { id:"DP-006", divId:"DV-004", name:"Human Resources",      code:"HRMS", status:"Active" },
    { id:"DP-007", divId:"DV-004", name:"Information Technology",code:"IT",  status:"Active" },
  ],
  subDepartments: [
    { id:"SD-001", deptId:"DP-001", name:"Import Procurement",  code:"IMPR", status:"Active" },
    { id:"SD-002", deptId:"DP-001", name:"Local Procurement",   code:"LCPR", status:"Active" },
    { id:"SD-003", deptId:"DP-002", name:"Wholesale Sales",     code:"WHSL", status:"Active" },
    { id:"SD-004", deptId:"DP-002", name:"Retail Sales",        code:"RTSL", status:"Active" },
    { id:"SD-005", deptId:"DP-005", name:"Accounts Payable",    code:"ACCP", status:"Active" },
    { id:"SD-006", deptId:"DP-005", name:"Accounts Receivable", code:"ACCR", status:"Active" },
  ],
};

// ── Seed positions ────────────────────────────────────────────────────────────
export const SEED_POSITIONS = [
  { id:"POS-001", title:"Chief Executive Officer",    code:"CEO",   deptId:"",     grade:"G-1",  reportsTo:null,      type:"Executive", status:"Active", filled:true  },
  { id:"POS-002", title:"Chief Financial Officer",    code:"CFO",   deptId:"DP-005",grade:"G-2", reportsTo:"POS-001", type:"Executive", status:"Active", filled:true  },
  { id:"POS-003", title:"Chief Operating Officer",    code:"COO",   deptId:"",     grade:"G-2",  reportsTo:"POS-001", type:"Executive", status:"Active", filled:false },
  { id:"POS-004", title:"Head of Procurement",        code:"HPROC", deptId:"DP-001",grade:"G-3", reportsTo:"POS-001", type:"Management",status:"Active", filled:true  },
  { id:"POS-005", title:"Purchase Manager",           code:"PM",    deptId:"DP-001",grade:"G-4", reportsTo:"POS-004", type:"Management",status:"Active", filled:true  },
  { id:"POS-006", title:"Purchase Officer",           code:"PO",    deptId:"DP-001",grade:"G-5", reportsTo:"POS-005", type:"Staff",     status:"Active", filled:false },
  { id:"POS-007", title:"Finance Manager",            code:"FM",    deptId:"DP-005",grade:"G-4", reportsTo:"POS-002", type:"Management",status:"Active", filled:false },
  { id:"POS-008", title:"Accounts Officer",           code:"AO",    deptId:"DP-005",grade:"G-5", reportsTo:"POS-007", type:"Staff",     status:"Active", filled:false },
  { id:"POS-009", title:"HR Manager",                 code:"HRM",   deptId:"DP-006",grade:"G-4", reportsTo:"POS-001", type:"Management",status:"Active", filled:false },
  { id:"POS-010", title:"IT Manager",                 code:"ITM",   deptId:"DP-007",grade:"G-4", reportsTo:"POS-001", type:"Management",status:"Active", filled:true  },
  { id:"POS-011", title:"Sales Manager",              code:"SM",    deptId:"DP-002",grade:"G-4", reportsTo:"POS-001", type:"Management",status:"Active", filled:false },
  { id:"POS-012", title:"Wholesale Sales Executive",  code:"WSE",   deptId:"DP-002",grade:"G-5", reportsTo:"POS-011", type:"Staff",     status:"Active", filled:true  },
];

// ── Seed employees ────────────────────────────────────────────────────────────
export const SEED_EMPLOYEES = [
  { id:"EMP-001", empNo:"E-0001", firstName:"Hassan",  lastName:"Raza",     positionId:"POS-005", deptId:"DP-001", status:"Active", joinDate:"2021-03-15", phone:"+92-300-1234567", email:"hassan@barkahflow.com",  gender:"Male",   cnic:"35201-1234567-1", linkedUserId:"USR-002" },
  { id:"EMP-002", empNo:"E-0002", firstName:"Bilal",   lastName:"Sheikh",   positionId:"POS-012", deptId:"DP-002", status:"Active", joinDate:"2020-07-01", phone:"+92-321-9876543", email:"bilal@barkahflow.com",   gender:"Male",   cnic:"35201-9876543-2", linkedUserId:"USR-003" },
  { id:"EMP-003", empNo:"E-0003", firstName:"Ahmed",   lastName:"Khan",     positionId:"POS-004", deptId:"DP-001", status:"Active", joinDate:"2018-01-10", phone:"+92-333-1111111", email:"ahmed@barkahflow.com",   gender:"Male",   cnic:"35201-1111111-3", linkedUserId:null       },
  { id:"EMP-004", empNo:"E-0004", firstName:"Sara",    lastName:"Malik",    positionId:"POS-002", deptId:"DP-005", status:"Active", joinDate:"2019-05-20", phone:"+92-311-2222222", email:"sara@barkahflow.com",    gender:"Female", cnic:"35201-2222222-4", linkedUserId:null       },
  { id:"EMP-005", empNo:"E-0005", firstName:"Omar",    lastName:"Farooq",   positionId:"POS-010", deptId:"DP-007", status:"Active", joinDate:"2022-09-01", phone:"+92-345-3333333", email:"omar@barkahflow.com",    gender:"Male",   cnic:"35201-3333333-5", linkedUserId:"USR-001"  },
];

export const GRADES = ["G-1","G-2","G-3","G-4","G-5","G-6","G-7","G-8"];
export const POSITION_TYPES = ["Executive","Management","Staff","Contractual"];
export const GENDERS = ["Male","Female","Other"];
