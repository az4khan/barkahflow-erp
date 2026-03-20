/**
 * Global page registry — every page in every module.
 * Used by global search in UniversalTopbar and ModuleSidebar.
 * Each entry: { path, title, module, moduleAccent, keywords }
 */

export const PAGE_REGISTRY = [
  // ── Purchase ─────────────────────────────────────────────────────────────
  { path:"/purchase",           title:"Dashboard",             module:"Purchase",        moduleAccent:"#f97316", keywords:"purchase overview stats summary" },
  { path:"/purchase/pr",        title:"Purchase Requisition",  module:"Purchase",        moduleAccent:"#f97316", keywords:"PR requisition request approval" },
  { path:"/purchase/rfq",       title:"Supplier Quotation",    module:"Purchase",        moduleAccent:"#f97316", keywords:"RFQ quotation supplier bid" },
  { path:"/purchase/qc",        title:"Quotation Comparison",  module:"Purchase",        moduleAccent:"#f97316", keywords:"compare quotation vendor selection" },
  { path:"/purchase/po",        title:"Purchase Order",        module:"Purchase",        moduleAccent:"#f97316", keywords:"PO order vendor purchase" },
  { path:"/purchase/grn",       title:"Goods Receipt",         module:"Purchase",        moduleAccent:"#f97316", keywords:"GRN goods receipt inward stock" },
  { path:"/purchase/direct",    title:"Direct Purchase",       module:"Purchase",        moduleAccent:"#f97316", keywords:"direct cash purchase quick buy" },
  { path:"/purchase/list",      title:"Purchase List",         module:"Purchase",        moduleAccent:"#f97316", keywords:"purchase history list all orders" },
  { path:"/purchase/suppliers", title:"Suppliers",             module:"Purchase",        moduleAccent:"#f97316", keywords:"supplier vendor master party" },
  { path:"/purchase/materials", title:"Materials",             module:"Purchase",        moduleAccent:"#f97316", keywords:"material product item master catalogue" },
  { path:"/purchase/approval",  title:"Approval Strategy",     module:"Purchase",        moduleAccent:"#f97316", keywords:"approval workflow strategy rules" },
  { path:"/purchase/reports",   title:"Purchase Reports",      module:"Purchase",        moduleAccent:"#f97316", keywords:"purchase analytics report summary" },

  // ── Sales & Distribution ──────────────────────────────────────────────────
  { path:"/sd",                 title:"Dashboard",             module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"sales overview wholesale" },
  { path:"/sd/parties",         title:"Party Master",          module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"customer party client distributor" },
  { path:"/sd/pricelists",      title:"Price Lists",           module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"price list rate card slab" },
  { path:"/sd/discounts",       title:"Discount Schemes",      module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"discount scheme promotion offer" },
  { path:"/sd/orders",          title:"Sales Orders",          module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"SO sales order booking" },
  { path:"/sd/delivery",        title:"Delivery Orders",       module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"DO delivery order dispatch" },
  { path:"/sd/invoices",        title:"Sales Invoices",        module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"invoice bill tax challan" },
  { path:"/sd/returns",         title:"Sales Returns",         module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"return refund credit note" },
  { path:"/sd/collections",     title:"Collections",           module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"payment collection cash receipt" },
  { path:"/sd/ledger",          title:"Party Ledger",          module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"ledger statement account balance" },
  { path:"/sd/reps",            title:"Sales Reps",            module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"sales rep agent commission" },
  { path:"/sd/commission",      title:"Commission Ledger",     module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"commission agent ledger earnings" },
  { path:"/sd/credit",          title:"Credit Control",        module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"credit limit overdue outstanding" },
  { path:"/sd/reports",         title:"Sales Reports",         module:"Sales & Dist.",   moduleAccent:"#10b981", keywords:"sales analytics revenue report" },

  // ── Point of Sale ─────────────────────────────────────────────────────────
  { path:"/pos",                title:"POS Terminal",          module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"POS retail counter cash sale" },
  { path:"/pos/sessions",       title:"Shift Management",      module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"shift session open close cashier" },
  { path:"/pos/receipts",       title:"Receipts",              module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"receipt voucher print sale" },
  { path:"/pos/refunds",        title:"Refunds",               module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"refund return void cancel" },
  { path:"/pos/summary",        title:"Daily Summary",         module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"daily summary Z report sales total" },
  { path:"/pos/reports",        title:"POS Reports",           module:"Point of Sale",   moduleAccent:"#3b82f6", keywords:"POS report analytics" },

  // ── Inventory ─────────────────────────────────────────────────────────────
  { path:"/inventory",          title:"Dashboard",             module:"Inventory",       moduleAccent:"#f59e0b", keywords:"inventory stock overview warehouse" },
  { path:"/inventory/materials",title:"Materials",             module:"Inventory",       moduleAccent:"#f59e0b", keywords:"material item product SKU" },
  { path:"/inventory/warehouses",title:"Warehouses",           module:"Inventory",       moduleAccent:"#f59e0b", keywords:"warehouse store location bin" },
  { path:"/inventory/stock",    title:"Stock Overview",        module:"Inventory",       moduleAccent:"#f59e0b", keywords:"stock balance on hand quantity" },
  { path:"/inventory/gr",       title:"Goods Receipt (GR)",    module:"Inventory",       moduleAccent:"#f59e0b", keywords:"goods receipt inward GR 101" },
  { path:"/inventory/gi",       title:"Goods Issue (GI)",      module:"Inventory",       moduleAccent:"#f59e0b", keywords:"goods issue outward GI 601" },
  { path:"/inventory/transfer", title:"Stock Transfer",        module:"Inventory",       moduleAccent:"#f59e0b", keywords:"transfer move stock 311" },
  { path:"/inventory/adjust",   title:"Stock Adjustment",      module:"Inventory",       moduleAccent:"#f59e0b", keywords:"adjust write-off surplus 551 552" },
  { path:"/inventory/opening",  title:"Opening Stock",         module:"Inventory",       moduleAccent:"#f59e0b", keywords:"opening initial balance 561" },
  { path:"/inventory/ledger",   title:"Stock Ledger (MB51)",   module:"Inventory",       moduleAccent:"#f59e0b", keywords:"ledger history movements MB51" },
  { path:"/inventory/valuation",title:"Valuation (MB5L)",      module:"Inventory",       moduleAccent:"#f59e0b", keywords:"valuation MAP price MB5L" },
  { path:"/inventory/reorder",  title:"Reorder Report",        module:"Inventory",       moduleAccent:"#f59e0b", keywords:"reorder minimum stock replenishment MD07" },

  // ── Distribution ──────────────────────────────────────────────────────────
  { path:"/dist",               title:"Dashboard",             module:"Distribution",    moduleAccent:"#ef4444", keywords:"distribution fleet delivery overview" },
  { path:"/dist/routes",        title:"Route Master",          module:"Distribution",    moduleAccent:"#ef4444", keywords:"route area zone delivery path" },
  { path:"/dist/vehicles",      title:"Vehicle Master",        module:"Distribution",    moduleAccent:"#ef4444", keywords:"vehicle truck fleet truck tanker" },
  { path:"/dist/drivers",       title:"Driver Master",         module:"Distribution",    moduleAccent:"#ef4444", keywords:"driver staff license fleet" },
  { path:"/dist/loadorders",    title:"Load Orders",           module:"Distribution",    moduleAccent:"#ef4444", keywords:"load order cylinder dispatch" },
  { path:"/dist/trips",         title:"Trip Sheets",           module:"Distribution",    moduleAccent:"#ef4444", keywords:"trip sheet journey delivery" },
  { path:"/dist/delivery",      title:"Delivery Execution",    module:"Distribution",    moduleAccent:"#ef4444", keywords:"delivery execute stop customer" },
  { path:"/dist/empties",       title:"Empties & Returns",     module:"Distribution",    moduleAccent:"#ef4444", keywords:"empty cylinder return empties" },
  { path:"/dist/settlement",    title:"Trip Settlement",       module:"Distribution",    moduleAccent:"#ef4444", keywords:"settle trip cash collection reconcile" },
  { path:"/dist/maintenance",   title:"Maintenance Log",       module:"Distribution",    moduleAccent:"#ef4444", keywords:"maintenance repair service vehicle" },
  { path:"/dist/fuel",          title:"Fuel Log",              module:"Distribution",    moduleAccent:"#ef4444", keywords:"fuel petrol diesel cost log" },
  { path:"/dist/schedule",      title:"Delivery Schedule",     module:"Distribution",    moduleAccent:"#ef4444", keywords:"schedule calendar plan delivery" },
  { path:"/dist/capacity",      title:"Capacity Planning",     module:"Distribution",    moduleAccent:"#ef4444", keywords:"capacity load plan fleet" },
  { path:"/dist/tripreports",   title:"Trip Reports",          module:"Distribution",    moduleAccent:"#ef4444", keywords:"trip report analytics performance" },
  { path:"/dist/performance",   title:"Driver Performance",    module:"Distribution",    moduleAccent:"#ef4444", keywords:"driver performance score rating" },

  // ── HR ────────────────────────────────────────────────────────────────────
  { path:"/hr",                 title:"Dashboard",             module:"HR",              moduleAccent:"#8b5cf6", keywords:"HR human resource people overview" },
  { path:"/hr/employees",       title:"Employee Master",       module:"HR",              moduleAccent:"#8b5cf6", keywords:"employee staff worker master" },
  { path:"/hr/departments",     title:"Departments",           module:"HR",              moduleAccent:"#8b5cf6", keywords:"department team division org" },
  { path:"/hr/designations",    title:"Designations",          module:"HR",              moduleAccent:"#8b5cf6", keywords:"designation title grade role job" },
  { path:"/hr/attendance",      title:"Attendance",            module:"HR",              moduleAccent:"#8b5cf6", keywords:"attendance present absent daily" },
  { path:"/hr/leaves",          title:"Leave Management",      module:"HR",              moduleAccent:"#8b5cf6", keywords:"leave annual sick casual balance" },
  { path:"/hr/salarystructure", title:"Salary Structure",      module:"HR",              moduleAccent:"#8b5cf6", keywords:"salary structure wage component" },
  { path:"/hr/periods",         title:"Payroll Periods",       module:"HR",              moduleAccent:"#8b5cf6", keywords:"payroll period month open close" },
  { path:"/hr/payroll",         title:"Payroll Processing",    module:"HR",              moduleAccent:"#8b5cf6", keywords:"payroll process run salary" },
  { path:"/hr/slips",           title:"Salary Slips",          module:"HR",              moduleAccent:"#8b5cf6", keywords:"salary slip payslip print" },
  { path:"/hr/loans",           title:"Loan Management",       module:"HR",              moduleAccent:"#8b5cf6", keywords:"loan advance EMI recovery" },
  { path:"/hr/eobi",            title:"EOBI / PESSI",          module:"HR",              moduleAccent:"#8b5cf6", keywords:"EOBI PESSI statutory contribution" },
  { path:"/hr/gratuity",        title:"Gratuity",              module:"HR",              moduleAccent:"#8b5cf6", keywords:"gratuity end service benefit" },
  { path:"/hr/settlement",      title:"Final Settlement",      module:"HR",              moduleAccent:"#8b5cf6", keywords:"final settlement resignation termination" },
  { path:"/hr/payreports",      title:"Payroll Reports",       module:"HR",              moduleAccent:"#8b5cf6", keywords:"payroll report bank sheet summary" },
  { path:"/hr/headcount",       title:"Headcount Report",      module:"HR",              moduleAccent:"#8b5cf6", keywords:"headcount staff count roster" },

  // ── Accounting ────────────────────────────────────────────────────────────
  { path:"/accounting",         title:"Dashboard",             module:"Accounting",      moduleAccent:"#0d9488", keywords:"accounting finance overview" },
  { path:"/accounting/accounts",title:"Chart of Accounts",    module:"Accounting",      moduleAccent:"#0d9488", keywords:"COA accounts ledger chart" },
  { path:"/accounting/journal", title:"Journal Entries",      module:"Accounting",      moduleAccent:"#0d9488", keywords:"journal entry debit credit" },
  { path:"/accounting/ar",      title:"Accounts Receivable",  module:"Accounting",      moduleAccent:"#0d9488", keywords:"AR receivable debtor outstanding" },
  { path:"/accounting/ap",      title:"Accounts Payable",     module:"Accounting",      moduleAccent:"#0d9488", keywords:"AP payable creditor supplier bill" },
  { path:"/accounting/vouchers",title:"Vouchers",             module:"Accounting",      moduleAccent:"#0d9488", keywords:"voucher payment receipt cash bank" },
  { path:"/accounting/bank",    title:"Bank Transactions",    module:"Accounting",      moduleAccent:"#0d9488", keywords:"bank transaction reconcile statement" },
  { path:"/accounting/costcenters",title:"Cost Centers",      module:"Accounting",      moduleAccent:"#0d9488", keywords:"cost center department allocation" },
  { path:"/accounting/taxrates",title:"Tax Rates",            module:"Accounting",      moduleAccent:"#0d9488", keywords:"tax rate GST VAT rate" },
  { path:"/accounting/reports", title:"Financial Reports",    module:"Accounting",      moduleAccent:"#0d9488", keywords:"P&L balance sheet trial financial report" },

  // ── System ────────────────────────────────────────────────────────────────
  { path:"/inbox",              title:"Approvals Inbox",       module:"System",          moduleAccent:"#6366f1", keywords:"inbox approval pending workflow" },
  { path:"/user-management",    title:"User Management",       module:"System",          moduleAccent:"#0ea5e9", keywords:"user login role permission access" },
  { path:"/company-settings",   title:"Company Settings",      module:"System",          moduleAccent:"#6366f1", keywords:"company settings profile config" },
  { path:"/db-backup",          title:"Database Backup",       module:"System",          moduleAccent:"#64748b", keywords:"backup restore export database" },
];

/**
 * Search pages by query string
 * Returns top 8 matching pages
 */
export function searchPages(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return PAGE_REGISTRY
    .filter(p => {
      const haystack = `${p.title} ${p.module} ${p.keywords}`.toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit);
}
