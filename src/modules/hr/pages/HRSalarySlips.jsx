import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';
const ACCENT = '#8b5cf6';
export default function HRSalarySlips(){
  const {payrollPeriods,payrollRecords,employees,company}=useApp();
  const [selectedPeriod,setSelectedPeriod]=useState((payrollPeriods||[]).find(p=>p.status==='posted'||p.status==='closed')?.id||'');
  const [selectedEmp,setSelectedEmp]=useState('');
  const [viewSlip,setViewSlip]=useState(null);
  const periods=[...(payrollPeriods||[])].filter(p=>['processing','posted','closed'].includes(p.status)).sort((a,b)=>b.month.localeCompare(a.month));
  const records=(payrollRecords||[]).filter(r=>r.periodId===selectedPeriod);
  const period=periods.find(p=>p.id===selectedPeriod);
  const slip=viewSlip;
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Salary Slips</h2><p className="pm-page-sub">View and print individual salary slips per period</p></div></div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
      <div><label style={{fontSize:12,color:'#6b7280',display:'block',marginBottom:4}}>Period</label>
        <select value={selectedPeriod} onChange={e=>{setSelectedPeriod(e.target.value);setSelectedEmp('');setViewSlip(null);}} style={{padding:'7px 14px',border:'2px solid '+ACCENT,borderRadius:8,fontSize:13,fontWeight:600,outline:'none',minWidth:200}}>
          <option value="">— Select Period —</option>
          {periods.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
    </div>
    {selectedPeriod&&!viewSlip&&(
      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">{period?.label} — {records.length} employees</div></div>
        <table className="pm-table">
          <thead><tr><th>Code</th><th>Employee</th><th>Department</th><th style={{textAlign:'right'}}>Gross</th><th style={{textAlign:'right'}}>Deductions</th><th style={{textAlign:'right'}}>Net Pay</th><th>Action</th></tr></thead>
          <tbody>
            {records.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No records for this period</td></tr>
              :records.map(r=><tr key={r.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{r.empCode}</td><td style={{fontWeight:600}}>{r.name}</td><td style={{color:'#6b7280',fontSize:12}}>{r.department}</td><td style={{textAlign:'right',fontWeight:600}}>{fmtPKRhr(r.grossPay)}</td><td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRhr(r.totalDeductions)}</td><td style={{textAlign:'right',fontWeight:800,color:ACCENT}}>{fmtPKRhr(r.netPay)}</td><td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setViewSlip(r)}>View Slip</button></td></tr>)
            }
          </tbody>
        </table>
      </div>
    )}
    {viewSlip&&(
      <div style={{background:'#fff',border:'2px solid #e2e8f0',borderRadius:12,maxWidth:680,margin:'0 auto',overflow:'hidden'}}>
        {/* Header */}
        <div style={{background:ACCENT,padding:'20px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:20,fontWeight:800,color:'#fff'}}>{company?.name||'Al-Raza LPG (Pvt.) Ltd.'}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{company?.address||'Lahore, Pakistan'}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:'#fff'}}>SALARY SLIP</div><div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{period?.label}</div></div>
        </div>
        {/* Employee info */}
        <div style={{padding:'16px 28px',background:'#f8fafc',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,borderBottom:'1px solid #e2e8f0'}}>
          {[['Employee',viewSlip.name],['Code',viewSlip.empCode],['Department',viewSlip.department],['Designation',viewSlip.designation],['Days Worked',viewSlip.attendanceDays],['Days Absent',viewSlip.absentDays]].map(([l,v])=>(
            <div key={l} style={{display:'flex',gap:8,fontSize:13}}><span style={{color:'#94a3b8',minWidth:100}}>{l}:</span><strong style={{color:'#0f172a'}}>{v}</strong></div>
          ))}
        </div>
        {/* Earnings & deductions */}
        <div style={{padding:'16px 28px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10,paddingBottom:6,borderBottom:'1px solid #f1f5f9'}}>Earnings</div>
            {Object.entries(viewSlip.earnings||{}).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:'1px solid #f8fafc'}}>
                <span style={{color:'#374151'}}>{k}</span><span style={{fontWeight:600,color:'#10b981'}}>{fmtPKRhr(v)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:14,padding:'10px 0',borderTop:'2px solid #e2e8f0',marginTop:4}}>
              <span>Gross Pay</span><span style={{color:ACCENT}}>{fmtPKRhr(viewSlip.grossPay)}</span>
            </div>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10,paddingBottom:6,borderBottom:'1px solid #f1f5f9'}}>Deductions</div>
            {Object.entries(viewSlip.deductions||{}).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'5px 0',borderBottom:'1px solid #f8fafc'}}>
                <span style={{color:'#374151'}}>{k}</span><span style={{fontWeight:600,color:'#ef4444'}}>{fmtPKRhr(v)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:14,padding:'10px 0',borderTop:'2px solid #e2e8f0',marginTop:4}}>
              <span>Total Deductions</span><span style={{color:'#ef4444'}}>{fmtPKRhr(viewSlip.totalDeductions)}</span>
            </div>
          </div>
        </div>
        {/* Net pay */}
        <div style={{background:ACCENT+'18',borderTop:'2px solid '+ACCENT,padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:16,fontWeight:800,color:'#0f172a'}}>NET PAY</span>
          <span style={{fontSize:24,fontWeight:900,color:ACCENT}}>{fmtPKRhr(viewSlip.netPay)}</span>
        </div>
        <div style={{padding:'14px 28px',display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="pm-btn pm-btn-ghost" onClick={()=>setViewSlip(null)}>← Back to List</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>window.print()}>🖨 Print</button>
        </div>
      </div>
    )}
  </div>);
}
