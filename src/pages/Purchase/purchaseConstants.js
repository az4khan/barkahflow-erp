// ── Shared constants for Purchase module ─────────────────────────────────────
export const ACCENT = "#f97316";

export const MONTHS       = ["Oct","Nov","Dec","Jan","Feb","Mar"];
export const MONTHLY_DATA = [41000000,49000000,57000000,43000000,63000000,50000000];
export const DONUT_COLORS = ["#f97316","#3b82f6","#22c55e","#8b5cf6","#f59e0b","#ef4444"];
export const DONUT_LABELS = ["Product Cost","Transportation","Customs Duty","Port Charges","Brokerage","Misc"];
export const DONUT_VALS   = [62,14,12,6,4,2];

export const PM_NAV = [
  { id:"pm-dashboard",         label:"Dashboard",           icon:"dashboard"  },
  { divider: true, label:"Procurement Flow" },
  { id:"pr-requisition",       label:"Purchase Requisition",icon:"list"       },
  { id:"pr-approval",          label:"PR Approval",         icon:"check"      },
  { id:"supplier-quotation",   label:"Supplier Quotation",  icon:"invoice"    },
  { id:"quotation-comparison", label:"Quotation Comparison",icon:"breakdown"  },
  { id:"purchase-order",       label:"Purchase Order",      icon:"purchase"   },
  { id:"goods-receipt",        label:"Goods Receipt",       icon:"box"        },
  { id:"approval-strategy",    label:"Approval Strategy",   icon:"shield"     },
  { divider: true, label:"Management" },
  { id:"new-purchase",         label:"Direct Purchase",     icon:"cart"       },
  { id:"purchase-list",        label:"Purchase List",       icon:"reports"    },
  { id:"pm-suppliers",         label:"Suppliers",           icon:"truck"      },
  { id:"pm-products",          label:"Products",            icon:"products"   },
  { id:"landed-cost",          label:"Landed Cost Calc.",   icon:"calculator" },
  { id:"cost-breakdown",       label:"Cost Breakdown",      icon:"invoice"    },
  { id:"pm-reports",           label:"Purchase Reports",    icon:"dashboard"  },
];

export const fmtPKR = (n) => {
  if (n >= 1e9) return `Rs${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `Rs${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `Rs${(n/1e3).toFixed(0)}K`;
  return `Rs${n.toLocaleString()}`;
};

export const calcLanded = (p) =>
  (p.qty||0)*(p.unitPrice||0)+(p.transportation||0)+(p.customs||0)+
  (p.brokerage||0)+(p.loading||0)+(p.port||0)+(p.misc||0);
