import { useState } from "react";
import Icon from "../../../components/common/Icon";
import { useApp } from "../../../context/AppContext";
const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;if(n>=1e5)return`Rs${(n/1e5).toFixed(1)}L`;return`Rs${Number(n).toLocaleString()}`;}
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function ReportCard({icon, iconBg, iconColor, title, desc, onClick}){
  return(
    <button onClick={onClick} style={{background:"#fff", border:"1px solid #f1f5f9", borderRadius:12,padding:"18px 20px",textAlign:"left",cursor:"pointer",transition:"all 0.15s",display:"flex",flexDirection:"column",gap:8,width:"100%"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,.08)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
      <div style={{width:38,height:38,borderRadius:10,background:iconBg||"#fff7ed",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon name={icon} size={20} color={iconColor||"#f97316"}/>
      </div>
      <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{title}</div>
      <div style={{fontSize:12,color:"#94a3b8"}}>{desc}</div>
      <div style={{fontSize:12,color:ACCENT,fontWeight:600,marginTop:4}}>Run Report →</div>
    </button>
  );
}
export default function PMReports(){
  const {purchases,suppliers,purchaseOrders,prs,company}=useApp();
  const [activeReport,setActiveReport]=useState(null);
  const [params,setParams]=useState({supplierId:"all",dateFrom:"",dateTo:""});
  const companyName=company?.name||"Al-Raza LPG";

  function getSupplierLedger(){
    const filtered=(purchases||[]).filter(p=>{
      const mS=params.supplierId==="all"||p.supplierId===params.supplierId;
      const mD=(!params.dateFrom||p.createdAt>=params.dateFrom)&&(!params.dateTo||p.createdAt<=params.dateTo+"T23:59:59");
      return mS&&mD;
    });
    return filtered;
  }
  function getMonthlySummary(){
    const result={};
    (purchases||[]).filter(p=>{
      const mD=(!params.dateFrom||p.createdAt>=params.dateFrom)&&(!params.dateTo||p.createdAt<=params.dateTo+"T23:59:59");
      return mD;
    }).forEach(p=>{
      const d=new Date(p.createdAt); const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      if(!result[key])result[key]={month:MONTHS[d.getMonth()]+" "+d.getFullYear(),count:0,total:0};
      result[key].count++; result[key].total+=(p.totalAmount||0);
    });
    return Object.values(result).sort((a,b)=>a.month<b.month?-1:1);
  }
  function downloadCSV(data,filename){
    if(!data.length)return;
    const headers=Object.keys(data[0]);
    const csv=[headers.join(","),...data.map(r=>headers.map(h=>r[h]).join(","))].join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download=filename;a.click();
  }
  function printReport(title,content){
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}h1{font-size:20px;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f8fafc;padding:8px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:.04em}td{padding:8px 12px;border-bottom:1px solid #f1f5f9}.footer{margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8}</style></head><body><div style="display:flex;justify-content:space-between;margin-bottom:24px"><div><h1>${title}</h1><p>${companyName} · Generated ${new Date().toLocaleDateString("en-PK")}</p></div></div>${content}<div class="footer">${companyName} — Confidential</div></body></html>`);
    w.document.close();w.print();
  }
  const reportData = activeReport==="supplier-ledger" ? getSupplierLedger() : activeReport==="monthly" ? getMonthlySummary() : [];
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Purchase Reports</h2><p className="pm-page-sub">Generate, print and export procurement analytics</p></div>
      </div>
      {!activeReport&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16,marginBottom:24}}>
          <ReportCard icon="suppliers" iconBg="#fff7ed" iconColor="#f97316" title="Supplier Ledger" desc="Purchase history by supplier with totals" onClick={()=>setActiveReport("supplier-ledger")}/>
          <ReportCard icon="invoice" iconBg="#eff6ff" iconColor="#3b82f6" title="Monthly Purchase Summary" desc="Month-by-month spend analysis" onClick={()=>setActiveReport("monthly")}/>
          <ReportCard icon="list" iconBg="#f0fdf4" iconColor="#10b981" title="PR Summary" desc="Requisition status and approval times" onClick={()=>setActiveReport("pr-summary")}/>
          <ReportCard icon="reports" iconBg="#f5f3ff" iconColor="#8b5cf6" title="PO Analysis" desc="Purchase orders by supplier and status" onClick={()=>setActiveReport("po-analysis")}/>
        </div>
      )}
      {activeReport&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setActiveReport(null)}>← Back</button>
            <h3 style={{fontSize:15,fontWeight:700}}>{activeReport==="supplier-ledger"?"Supplier Ledger":activeReport==="monthly"?"Monthly Purchase Summary":activeReport==="pr-summary"?"PR Summary":"PO Analysis"}</h3>
          </div>
          {/* Params */}
          <div style={{background:"#fff", border:"1px solid #f1f5f9", borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"end"}}>
            {activeReport==="supplier-ledger"&&(
              <div className="pm-form-group" style={{margin:0}}>
                <label>Supplier</label>
                <select value={params.supplierId} onChange={e=>setParams(p=>({...p,supplierId:e.target.value}))} style={{padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none"}}>
                  <option value="all">All Suppliers</option>
                  {(suppliers||[]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div className="pm-form-group" style={{margin:0}}><label>From Date</label><input type="date" value={params.dateFrom} onChange={e=>setParams(p=>({...p,dateFrom:e.target.value}))} style={{padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none"}}/></div>
            <div className="pm-form-group" style={{margin:0}}><label>To Date</label><input type="date" value={params.dateTo}   onChange={e=>setParams(p=>({...p,dateTo:e.target.value}))}   style={{padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none"}}/></div>
            <div style={{display:"flex",gap:8,marginTop:20}}>
              {activeReport==="supplier-ledger"&&<button className="pm-btn pm-btn-outline" style={{fontSize:12}} onClick={()=>downloadCSV(reportData.map(p=>({ID:p.id,Supplier:p.supplierName,Type:p.type,Amount:p.totalAmount,Status:p.status,Date:p.createdAt?.slice(0,10)})),"supplier-ledger.csv")}>↓ Excel/CSV</button>}
              {activeReport==="monthly"&&<button className="pm-btn pm-btn-outline" style={{fontSize:12}} onClick={()=>downloadCSV(reportData.map(m=>({Month:m.month,Orders:m.count,Total:m.total})),"monthly-summary.csv")}>↓ Excel/CSV</button>}
              <button className="pm-btn pm-btn-primary" style={{fontSize:12}} onClick={()=>{
                if(activeReport==="supplier-ledger"){
                  const rows=reportData.map(p=>`<tr><td>${p.id}</td><td>${p.supplierName}</td><td>${p.type?.toUpperCase()}</td><td>Rs${Number(p.totalAmount).toLocaleString()}</td><td>${p.status}</td><td>${p.createdAt?.slice(0,10)}</td></tr>`).join("");
                  printReport("Supplier Ledger",`<table><thead><tr><th>ID</th><th>Supplier</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`);
                } else {
                  const rows=reportData.map(m=>`<tr><td>${m.month}</td><td>${m.count}</td><td>Rs${Number(m.total).toLocaleString()}</td></tr>`).join("");
                  printReport("Monthly Purchase Summary",`<table><thead><tr><th>Month</th><th>Orders</th><th>Total Amount</th></tr></thead><tbody>${rows}</tbody></table>`);
                }
              }}>🖨 Print / PDF</button>
            </div>
          </div>
          {/* Report output */}
          {(activeReport==="supplier-ledger"||activeReport==="monthly")&&(
            <div className="pm-table-wrap">
              <table className="pm-table">
                {activeReport==="supplier-ledger"&&<><thead><tr><th>ID</th><th>Supplier</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{reportData.map(p=><tr key={p.id}><td style={{fontWeight:600,color:ACCENT}}>{p.id}</td><td>{p.supplierName}</td><td><span className={`pm-badge pm-badge-${p.type==="grn"?"blue":"orange"}`}>{p.type?.toUpperCase()}</span></td><td style={{fontWeight:700}}>{fmtPKR(p.totalAmount)}</td><td><span className={`pm-badge pm-badge-${p.status==="posted"?"green":"gray"}`}>{p.status}</span></td><td style={{fontSize:12,color:"#94a3b8"}}>{p.createdAt?.slice(0,10)}</td></tr>)}{!reportData.length&&<tr><td colSpan={6} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>No data.</td></tr>}</tbody></>}
                {activeReport==="monthly"&&<><thead><tr><th>Month</th><th>Orders</th><th>Total Amount</th></tr></thead><tbody>{reportData.map((m,i)=><tr key={i}><td style={{fontWeight:600}}>{m.month}</td><td>{m.count}</td><td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(m.total)}</td></tr>)}{!reportData.length&&<tr><td colSpan={3} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>No data.</td></tr>}</tbody></>}
              </table>
            </div>
          )}
          {(activeReport==="pr-summary")&&(
            <div className="pm-table-wrap">
              <table className="pm-table"><thead><tr><th>PR ID</th><th>Title</th><th>Dept</th><th>Priority</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{(prs||[]).map(p=><tr key={p.id}><td style={{fontWeight:600,color:ACCENT}}>{p.id}</td><td>{p.title}</td><td>{p.department}</td><td>{p.priority}</td><td style={{fontWeight:700}}>{fmtPKR(p.totalEstimated)}</td><td><span className={`pm-badge pm-badge-${p.status==="approved"?"green":p.status==="rejected"?"red":p.status==="draft"?"gray":"blue"}`}>{p.status}</span></td><td style={{fontSize:12,color:"#94a3b8"}}>{p.createdAt?.slice(0,10)}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {(activeReport==="po-analysis")&&(
            <div className="pm-table-wrap">
              <table className="pm-table"><thead><tr><th>PO ID</th><th>Supplier</th><th>Amount</th><th>Incoterms</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{(purchaseOrders||[]).map(p=><tr key={p.id}><td style={{fontWeight:600,color:ACCENT}}>{p.id}</td><td>{p.supplierName}</td><td style={{fontWeight:700}}>{fmtPKR(p.totalAmount)}</td><td>{p.incoterms}</td><td><span className={`pm-badge pm-badge-${p.status==="approved"?"green":p.status==="draft"?"gray":"blue"}`}>{p.status}</span></td><td style={{fontSize:12,color:"#94a3b8"}}>{p.createdAt?.slice(0,10)}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
