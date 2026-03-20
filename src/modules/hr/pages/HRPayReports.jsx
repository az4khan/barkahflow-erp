import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';
const ACCENT = '#8b5cf6';
export default function HRPayReports() {
  const { payrollPeriods, payrollRecords, hrDepartments, employees } = useApp();
  const [report, setReport]     = useState('summary');
  const [selectedPeriod, setSP] = useState((payrollPeriods||[]).find(p=>p.status==='posted'||p.status==='closed')?.id||'');
  const periods = [...(payrollPeriods||[])].sort((a,b)=>b.month.localeCompare(a.month));
  const records = (payrollRecords||[]).filter(r=>r.periodId===selectedPeriod);
  const period  = periods.find(p=>p.id===selectedPeriod);
  const depts   = hrDepartments||[];
  const totalGross = records.reduce((s,r)=>s+(r.grossPay||0),0);
  const totalNet   = records.reduce((s,r)=>s+(r.netPay||0),0);
  const totalDed   = records.reduce((s,r)=>s+(r.totalDeductions||0),0);
  // By department
  const byDept = depts.map(d=>{const dr=records.filter(r=>r.department===d.name);return{...d,count:dr.length,gross:dr.reduce((s,r)=>s+(r.grossPay||0),0),net:dr.reduce((s,r)=>s+(r.netPay||0),0)};}).filter(d=>d.count>0);
  // Bank transfer sheet
  const bankRows = records.map(r=>{const emp=(employees||[]).find(e=>e.id===r.employeeId);return{...r,bankName:emp?.bankName||'—',bankAccount:emp?.bankAccount||'—'};});
  function exportCSV(){
    const rows=[['Code','Employee','Department','Bank','Account','Net Pay'],...bankRows.map(r=>[r.empCode,r.name,r.department,r.bankName,r.bankAccount,r.netPay])];
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));a.download=`payroll-${selectedPeriod}.csv`;a.click();
  }
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Payroll Reports</h2><p className="pm-page-sub">Summary, department breakdown, and bank transfer sheet</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-outline" onClick={exportCSV}><Icon name="download" size={13}/> Export CSV</button></div></div>
    <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
      <select value={selectedPeriod} onChange={e=>setSP(e.target.value)} style={{padding:'7px 14px',border:'2px solid '+ACCENT,borderRadius:8,fontSize:13,fontWeight:600,outline:'none',minWidth:200}}>
        <option value="">— Select Period —</option>
        {periods.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
      <div style={{display:'flex',gap:4}}>
        {[['summary','Summary'],['dept','By Department'],['bank','Bank Sheet']].map(([v,l])=>
          <button key={v} onClick={()=>setReport(v)} style={{padding:'6px 14px',borderRadius:8,border:'1px solid',fontSize:12.5,cursor:'pointer',background:report===v?ACCENT:'#fff',color:report===v?'#fff':'#6b7280',borderColor:report===v?ACCENT:'#e5e7eb'}}>{l}</button>
        )}
      </div>
    </div>
    {selectedPeriod&&<div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
      {[{l:'Employees',v:records.length,c:ACCENT,b:'#f5f3ff'},{l:'Gross Pay',v:fmtPKRhr(totalGross),c:'#0f172a',b:'#f8fafc'},{l:'Deductions',v:fmtPKRhr(totalDed),c:'#ef4444',b:'#fef2f2'},{l:'Net Pay',v:fmtPKRhr(totalNet),c:'#10b981',b:'#f0fdf4'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="store" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value" style={{fontSize:typeof s.v==='string'?16:22}}>{s.v}</div></div>
      ))}
    </div>}
    {report==='summary'&&<div className="pm-table-wrap"><div className="pm-table-header"><div className="pm-table-title">{period?.label||'Select a period'} — Payroll Summary</div></div><table className="pm-table"><thead><tr><th>Code</th><th>Employee</th><th>Department</th><th style={{textAlign:'right'}}>Days</th><th style={{textAlign:'right'}}>Gross</th><th style={{textAlign:'right'}}>Deductions</th><th style={{textAlign:'right'}}>Net Pay</th></tr></thead><tbody>{records.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>Select a posted period</td></tr>:records.map(r=><tr key={r.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{r.empCode}</td><td style={{fontWeight:600}}>{r.name}</td><td style={{color:'#6b7280',fontSize:12}}>{r.department}</td><td style={{textAlign:'right'}}>{r.attendanceDays}</td><td style={{textAlign:'right',fontWeight:600}}>{fmtPKRhr(r.grossPay)}</td><td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRhr(r.totalDeductions)}</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT}}>{fmtPKRhr(r.netPay)}</td></tr>)}</tbody><tfoot><tr style={{background:'#f5f3ff',borderTop:'2px solid #e2e8f0'}}><td colSpan={4} style={{fontWeight:700,padding:'10px 16px'}}>Totals</td><td style={{textAlign:'right',fontWeight:700,padding:'10px 16px'}}>{fmtPKRhr(totalGross)}</td><td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#ef4444'}}>{fmtPKRhr(totalDed)}</td><td style={{textAlign:'right',fontWeight:900,padding:'10px 16px',color:ACCENT,fontSize:15}}>{fmtPKRhr(totalNet)}</td></tr></tfoot></table></div>}
    {report==='dept'&&<div className="pm-table-wrap"><div className="pm-table-header"><div className="pm-table-title">Payroll by Department</div></div><table className="pm-table"><thead><tr><th>Department</th><th style={{textAlign:'right'}}>Employees</th><th style={{textAlign:'right'}}>Gross Pay</th><th style={{textAlign:'right'}}>Net Pay</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead><tbody>{byDept.length===0?<tr><td colSpan={5} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>:byDept.map(d=><tr key={d.id}><td style={{fontWeight:600}}>{d.name}</td><td style={{textAlign:'right',fontWeight:600}}>{d.count}</td><td style={{textAlign:'right'}}>{fmtPKRhr(d.gross)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRhr(d.net)}</td><td style={{textAlign:'right',color:'#6b7280'}}>{totalGross>0?((d.gross/totalGross)*100).toFixed(1):0}%</td></tr>)}</tbody></table></div>}
    {report==='bank'&&<div className="pm-table-wrap"><div className="pm-table-header"><div className="pm-table-title">Bank Transfer Sheet — {period?.label}</div></div><table className="pm-table"><thead><tr><th>Code</th><th>Employee Name</th><th>Bank</th><th>Account Number</th><th style={{textAlign:'right'}}>Net Pay</th></tr></thead><tbody>{bankRows.length===0?<tr><td colSpan={5} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>:bankRows.map(r=><tr key={r.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{r.empCode}</td><td style={{fontWeight:600}}>{r.name}</td><td style={{color:'#6b7280',fontSize:12}}>{r.bankName}</td><td style={{fontFamily:'monospace',fontSize:12}}>{r.bankAccount||'—'}</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT,fontSize:14}}>{fmtPKRhr(r.netPay)}</td></tr>)}</tbody><tfoot><tr style={{background:'#f5f3ff',borderTop:'2px solid #e2e8f0'}}><td colSpan={4} style={{fontWeight:700,padding:'10px 16px'}}>Total Transfer</td><td style={{textAlign:'right',fontWeight:900,padding:'10px 16px',color:ACCENT,fontSize:15}}>{fmtPKRhr(totalNet)}</td></tr></tfoot></table></div>}
  </div>);
}
