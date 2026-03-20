import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';
const ACCENT = '#8b5cf6';
export default function HRGratuity() {
  const { employees, hrDepartments, payrollRecords } = useApp();
  const activeEmps = (employees||[]).filter(e=>e.status==='active'&&e.joiningDate);
  const depts = hrDepartments||[];
  const today = new Date();
  const enriched = activeEmps.map(e=>{
    const years  = Math.floor((today-new Date(e.joiningDate))/(1000*60*60*24*365));
    const months = Math.floor(((today-new Date(e.joiningDate))%(1000*60*60*24*365))/(1000*60*60*24*30));
    // Get basic from last payroll record
    const pr = (payrollRecords||[]).filter(r=>r.employeeId===e.id).slice(-1)[0];
    const basic = pr?.earnings?.['Basic Salary']||0;
    const gratuity = basic * years; // 1 month basic per year
    return { ...e, years, months, basic, gratuity };
  }).sort((a,b)=>b.years-a.years);
  const totalGratuity = enriched.reduce((s,e)=>s+e.gratuity,0);
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Gratuity</h2><p className="pm-page-sub">Accrued gratuity — 1 month basic salary per completed year of service</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {[{l:'Active Employees',v:enriched.length,c:ACCENT,b:'#f5f3ff'},{l:'Total Accrued',v:fmtPKRhr(totalGratuity),c:'#10b981',b:'#f0fdf4'},{l:'Avg. Service',v:`${Math.round(enriched.reduce((s,e)=>s+e.years,0)/Math.max(enriched.length,1))}y`,c:'#3b82f6',b:'#eff6ff'},{l:'>5 Year Staff',v:enriched.filter(e=>e.years>=5).length,c:'#f59e0b',b:'#fffbeb'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="trending" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value" style={{fontSize:typeof s.v==='string'?16:22}}>{s.v}</div></div>
      ))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Gratuity Register</div></div>
      <table className="pm-table">
        <thead><tr><th>Employee</th><th>Department</th><th>Joining Date</th><th style={{textAlign:'right'}}>Years</th><th style={{textAlign:'right'}}>Months</th><th style={{textAlign:'right'}}>Basic Salary</th><th style={{textAlign:'right'}}>Gratuity Accrued</th></tr></thead>
        <tbody>
          {enriched.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No data</td></tr>
            :enriched.map(e=>(
              <tr key={e.id}>
                <td><div style={{fontWeight:600}}>{e.firstName} {e.lastName}</div><div style={{fontSize:11,color:'#94a3b8'}}>{e.empCode}</div></td>
                <td style={{color:'#6b7280',fontSize:12}}>{depts.find(d=>d.id===e.departmentId)?.name||'—'}</td>
                <td style={{color:'#9ca3af',fontSize:12}}>{e.joiningDate}</td>
                <td style={{textAlign:'right',fontWeight:700,color:e.years>=5?'#10b981':e.years>=2?ACCENT:'#94a3b8'}}>{e.years}y</td>
                <td style={{textAlign:'right',color:'#9ca3af'}}>{e.months}m</td>
                <td style={{textAlign:'right'}}>{fmtPKRhr(e.basic)}</td>
                <td style={{textAlign:'right',fontWeight:800,color:'#10b981',fontSize:e.years>=5?15:13}}>{fmtPKRhr(e.gratuity)}</td>
              </tr>
            ))
          }
        </tbody>
        <tfoot>
          <tr style={{background:'#f5f3ff',borderTop:'2px solid #e2e8f0'}}>
            <td colSpan={6} style={{fontWeight:700,padding:'10px 16px'}}>Total Gratuity Liability</td>
            <td style={{textAlign:'right',fontWeight:900,padding:'10px 16px',color:'#10b981',fontSize:16}}>{fmtPKRhr(totalGratuity)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>);
}
