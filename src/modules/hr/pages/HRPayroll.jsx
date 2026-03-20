import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';

const ACCENT = '#8b5cf6';

export default function HRPayroll() {
  const { payrollPeriods, payrollRecords, approvePayrollRecord, processPayroll, approveAllPayroll, postPayrollToAccounting } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const periods = payrollPeriods||[];
    return (periods.find(p=>p.status==='processing')||periods.find(p=>p.status==='open')||periods[0])?.id||'';
  });
  const [search, setSearch] = useState('');
  const [deptF,  setDeptF]  = useState('All');

  const periods = [...(payrollPeriods||[])].sort((a,b)=>b.month.localeCompare(a.month));
  const period  = periods.find(p=>p.id===selectedPeriod);
  const records = (payrollRecords||[]).filter(r=>r.periodId===selectedPeriod);

  const filtered = records.filter(r=>
    (!search||(r.name||'').toLowerCase().includes(search.toLowerCase())||(r.empCode||'').toLowerCase().includes(search.toLowerCase()))&&
    (deptF==='All'||r.department===deptF)
  );

  const depts       = [...new Set(records.map(r=>r.department))];
  const totalGross  = records.reduce((s,r)=>s+(r.grossPay||0),0);
  const totalNet    = records.reduce((s,r)=>s+(r.netPay||0),0);
  const totalDed    = records.reduce((s,r)=>s+(r.totalDeductions||0),0);
  const approvedCnt = records.filter(r=>r.status==='approved').length;

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Payroll Processing</h2><p className="pm-page-sub">Review, edit and approve payroll records per employee</p></div>
        <div className="pm-page-actions">
          <select value={selectedPeriod} onChange={e=>setSelectedPeriod(e.target.value)} style={{padding:'7px 14px',border:'2px solid '+ACCENT,borderRadius:8,fontSize:13,fontWeight:600,outline:'none',color:'#0f172a',cursor:'pointer'}}>
            {periods.map(p=><option key={p.id} value={p.id}>{p.label} — {p.status}</option>)}
          </select>
        </div>
      </div>

      {period&&(
        <div style={{background:'#0f172a',borderRadius:12,padding:'14px 20px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:'#fff'}}>{period.label}</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.45)'}}>Status: <span style={{color:period.status==='posted'?'#a78bfa':period.status==='processing'?'#60a5fa':'#34d399',fontWeight:600}}>{period.status}</span></div>
          </div>
          <div style={{display:'flex',gap:24}}>
            {[['Employees',records.length,'#e2e8f0'],['Gross',fmtPKRhr(totalGross),'#a78bfa'],['Deductions',fmtPKRhr(totalDed),'#f87171'],['Net Pay',fmtPKRhr(totalNet),'#34d399'],['Approved',`${approvedCnt}/${records.length}`,'#60a5fa']].map(([l,v,c])=>(
              <div key={l} style={{textAlign:'center'}}><div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            {period.status==='open'&&<button className="pm-btn pm-btn-primary" style={{background:'#3b82f6'}} onClick={()=>processPayroll(selectedPeriod)}>▶ Run Payroll</button>}
            {period.status==='processing'&&approvedCnt<records.length&&<button className="pm-btn pm-btn-primary" style={{background:'#f59e0b'}} onClick={()=>approveAllPayroll(selectedPeriod)}>✓ Approve All</button>}
            {period.status==='processing'&&approvedCnt===records.length&&records.length>0&&<button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>postPayrollToAccounting(selectedPeriod)}>📊 Post to Accounting</button>}
          </div>
        </div>
      )}

      {records.length===0 ? (
        <div className="pm-table-wrap"><div style={{padding:60,textAlign:'center',color:'#94a3b8'}}>
          <Icon name="briefcase" size={32} color="#e2e8f0"/>
          <div style={{marginTop:12,fontSize:14,fontWeight:500}}>
            {period?.status==='open'?'Click "Run Payroll" to generate salary records for this period':'No records for this period'}
          </div>
        </div></div>
      ) : (
        <div className="pm-table-wrap">
          <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
            <div className="pm-table-title">Payroll Records ({filtered.length})</div>
            <div style={{display:'flex',gap:6}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px'}}>
                <Icon name="search" size={13} color="#94a3b8"/>
                <input placeholder="Search employee…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',width:160}}/>
              </div>
              <select value={deptF} onChange={e=>setDeptF(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}>
                <option value="All">All Depts</option>
                {depts.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{overflowX:'auto'}}>
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Code</th><th>Employee</th><th>Department</th>
                  <th style={{textAlign:'right'}}>Days</th>
                  <th style={{textAlign:'right'}}>Absent</th>
                  <th style={{textAlign:'right'}}>Gross Pay</th>
                  <th style={{textAlign:'right'}}>Deductions</th>
                  <th style={{textAlign:'right'}}>Net Pay</th>
                  <th>Status</th>
                  {period?.status==='processing'&&<th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} style={{background:r.status==='approved'?'#fafffe':'#fff'}}>
                    <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{r.empCode}</td>
                    <td>
                      <div style={{fontWeight:600}}>{r.name}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{r.designation}</div>
                    </td>
                    <td style={{color:'#6b7280',fontSize:12}}>{r.department}</td>
                    <td style={{textAlign:'right'}}>{r.attendanceDays}</td>
                    <td style={{textAlign:'right',color:r.absentDays>0?'#ef4444':'#94a3b8',fontWeight:r.absentDays>0?700:400}}>{r.absentDays}</td>
                    <td style={{textAlign:'right',fontWeight:700,color:'#0f172a'}}>{fmtPKRhr(r.grossPay)}</td>
                    <td style={{textAlign:'right',color:'#ef4444',fontWeight:600}}>{fmtPKRhr(r.totalDeductions)}</td>
                    <td style={{textAlign:'right',fontWeight:800,color:ACCENT,fontSize:14}}>{fmtPKRhr(r.netPay)}</td>
                    <td><span className={`pm-badge ${r.status==='approved'?'pm-badge-green':'pm-badge-gray'}`}>{r.status}</span></td>
                    {period?.status==='processing'&&(
                      <td>
                        {r.status!=='approved'&&(
                          <button className="pm-btn pm-btn-primary" style={{background:'#10b981',padding:'3px 10px',fontSize:11}} onClick={()=>approvePayrollRecord(r.id)}>✓ Approve</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{background:'#f5f3ff',borderTop:'2px solid #e2e8f0'}}>
                  <td colSpan={5} style={{fontWeight:700,padding:'10px 16px',color:'#4c1d95'}}>Totals ({filtered.length} employees)</td>
                  <td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#0f172a'}}>{fmtPKRhr(filtered.reduce((s,r)=>s+(r.grossPay||0),0))}</td>
                  <td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:'#ef4444'}}>{fmtPKRhr(filtered.reduce((s,r)=>s+(r.totalDeductions||0),0))}</td>
                  <td style={{textAlign:'right',fontWeight:800,padding:'10px 16px',color:ACCENT,fontSize:15}}>{fmtPKRhr(filtered.reduce((s,r)=>s+(r.netPay||0),0))}</td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
