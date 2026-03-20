import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr, EOBI_EMP_AMT, EOBI_EMPR_AMT } from '../hrConstants';
const ACCENT = '#8b5cf6';
export default function HREobi() {
  const { employees, hrDepartments, payrollRecords } = useApp();
  const emps  = (employees||[]).filter(e=>e.status==='active');
  const depts = hrDepartments||[];
  const totalEmp  = emps.length * EOBI_EMP_AMT;
  const totalEmpr = emps.length * EOBI_EMPR_AMT;
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">EOBI / PESSI</h2><p className="pm-page-sub">Statutory contributions — auto-deducted from payroll each month</p></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {[{l:'Enrolled Employees',v:emps.length,c:ACCENT,b:'#f5f3ff'},{l:'Employee EOBI/mo',v:fmtPKRhr(totalEmp),c:'#3b82f6',b:'#eff6ff'},{l:'Employer EOBI/mo',v:fmtPKRhr(totalEmpr),c:'#10b981',b:'#f0fdf4'},{l:'Total EOBI/mo',v:fmtPKRhr(totalEmp+totalEmpr),c:'#f59e0b',b:'#fffbeb'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="shield" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value" style={{fontSize:typeof s.v==='string'?16:22}}>{s.v}</div></div>
      ))}
    </div>
    <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'12px 16px',marginBottom:14,fontSize:13,color:'#1e40af'}}>
      <strong>EOBI Rates (Pakistan 2026):</strong> Employee contribution: Rs {EOBI_EMP_AMT}/month (flat) · Employer contribution: Rs {EOBI_EMPR_AMT}/month (flat). Auto-posted to journal Dr EOBI Expense / Cr EOBI Payable on payroll post.
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">EOBI Contribution Register ({emps.length} employees)</div></div>
      <table className="pm-table">
        <thead><tr><th>Employee</th><th>Code</th><th>Department</th><th style={{textAlign:'right'}}>Employee Share</th><th style={{textAlign:'right'}}>Employer Share</th><th style={{textAlign:'right'}}>Total/Month</th></tr></thead>
        <tbody>
          {emps.map(e=>(
            <tr key={e.id}>
              <td style={{fontWeight:600}}>{e.firstName} {e.lastName}</td>
              <td style={{fontFamily:'monospace',fontSize:11,color:ACCENT}}>{e.empCode}</td>
              <td style={{color:'#6b7280',fontSize:12}}>{depts.find(d=>d.id===e.departmentId)?.name||'—'}</td>
              <td style={{textAlign:'right',color:'#ef4444',fontWeight:600}}>{fmtPKRhr(EOBI_EMP_AMT)}</td>
              <td style={{textAlign:'right',color:'#f59e0b',fontWeight:600}}>{fmtPKRhr(EOBI_EMPR_AMT)}</td>
              <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKRhr(EOBI_EMP_AMT+EOBI_EMPR_AMT)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{background:'#f5f3ff',borderTop:'2px solid #e2e8f0'}}>
            <td colSpan={3} style={{fontWeight:700,padding:'10px 16px'}}>Monthly Total ({emps.length} employees)</td>
            <td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#ef4444'}}>{fmtPKRhr(totalEmp)}</td>
            <td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#f59e0b'}}>{fmtPKRhr(totalEmpr)}</td>
            <td style={{textAlign:'right',fontWeight:800,padding:'10px 16px',color:ACCENT,fontSize:15}}>{fmtPKRhr(totalEmp+totalEmpr)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>);
}
