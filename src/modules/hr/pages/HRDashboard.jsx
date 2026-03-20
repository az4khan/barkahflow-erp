import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';

const ACCENT = '#8b5cf6';

export default function HRDashboard() {
  const { employees, hrDepartments, payrollRecords, payrollPeriods, leaves, loans, attendance } = useApp();

  const emps    = employees       || [];
  const depts   = hrDepartments   || [];
  const records = payrollRecords  || [];
  const periods = payrollPeriods  || [];
  const allLeaves= leaves         || [];
  const allLoans = loans          || [];
  const att     = attendance      || [];

  const activeEmps    = emps.filter(e=>e.status==='active');
  const lastPeriod    = [...periods].sort((a,b)=>b.month.localeCompare(a.month))[0];
  const lastRecords   = records.filter(r=>r.periodId===lastPeriod?.id);
  const totalGross    = lastRecords.reduce((s,r)=>s+(r.grossPay||0),0);
  const totalNet      = lastRecords.reduce((s,r)=>s+(r.netPay||0),0);
  const pendingLeaves = allLeaves.filter(l=>l.status==='pending');
  const activeLoans   = allLoans.filter(l=>l.status==='active');
  const totalLoanOut  = activeLoans.reduce((s,l)=>s+(l.amount-l.recoveredAmount),0);
  const today         = new Date().toISOString().slice(0,10);
  const todayPresent  = att.filter(a=>a.date===today&&a.status==='present').length;
  const todayAbsent   = att.filter(a=>a.date===today&&a.status==='absent').length;

  // Department headcount
  const deptHeadcount = depts.map(d=>({
    ...d,
    count:activeEmps.filter(e=>e.departmentId===d.id).length,
  })).filter(d=>d.count>0).sort((a,b)=>b.count-a.count);

  // Monthly payroll cost (last 6 months)
  const now = new Date();
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(),now.getMonth()-5+i,1);
    const key = d.toISOString().slice(0,7);
    const gross = records.filter(r=>r.periodId===`PP-${key}`).reduce((s,r)=>s+(r.grossPay||0),0);
    return { label:d.toLocaleString('default',{month:'short'}), gross };
  });
  const maxGross = Math.max(...months.map(m=>m.gross),1);

  // Open period alert
  const openPeriod = periods.find(p=>p.status==='open');
  const processingPeriod = periods.find(p=>p.status==='processing');

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">HR Dashboard</h2><p className="pm-page-sub">Human Resources — {activeEmps.length} active employees across {depts.length} departments</p></div>
      </div>

      {/* Alerts */}
      {(pendingLeaves.length>0||openPeriod||processingPeriod)&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginBottom:16}}>
          {pendingLeaves.length>0&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="bell" size={18} color="#f59e0b"/><span style={{fontSize:13,color:'#92400e'}}><strong>{pendingLeaves.length} leave</strong> application{pendingLeaves.length>1?'s':''} pending approval</span></div>}
          {openPeriod&&<div style={{background:'#f0fdf4',border:'1px solid #a7f3d0',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="check" size={18} color="#10b981"/><span style={{fontSize:13,color:'#065f46'}}><strong>{openPeriod.label}</strong> payroll period is open</span></div>}
          {processingPeriod&&<div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:10,padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}><Icon name="briefcase" size={18} color="#3b82f6"/><span style={{fontSize:13,color:'#1e40af'}}><strong>{processingPeriod.label}</strong> payroll processed — ready for posting</span></div>}
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(6,1fr)'}}>
        {[
          {label:'Active Employees', value:activeEmps.length,          icon:'users',    bg:'#f5f3ff', color:ACCENT},
          {label:'Departments',      value:depts.length,               icon:'building', bg:'#eff6ff', color:'#3b82f6'},
          {label:'Last Payroll',     value:fmtPKRhr(totalGross),       icon:'store',    bg:'#f0fdf4', color:'#10b981'},
          {label:'Present Today',    value:todayPresent,               icon:'check',    bg:'#f0fdf4', color:'#10b981'},
          {label:'Pending Leaves',   value:pendingLeaves.length,       icon:'invoice',  bg:'#fffbeb', color:'#f59e0b'},
          {label:'Loan Outstanding', value:fmtPKRhr(totalLoanOut),     icon:'breakdown',bg:'#fef2f2', color:'#ef4444'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?14:22}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:14,marginBottom:14}}>
        {/* Payroll trend */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Monthly Payroll Cost</div></div>
          <div style={{padding:'16px 18px 8px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:10,height:100}}>
              {months.map((m,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{fontSize:10,color:ACCENT,fontWeight:600}}>{m.gross>0?fmtPKRhr(m.gross):''}</div>
                  <div style={{width:'100%',borderRadius:'4px 4px 0 0',background:m.gross>0?ACCENT:'#f1f5f9',height:`${Math.max((m.gross/maxGross)*80,m.gross>0?6:2)}px`,minHeight:2}}/>
                  <div style={{fontSize:11,color:'#94a3b8'}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dept headcount */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">By Department</div></div>
          <div style={{padding:'12px 16px'}}>
            {deptHeadcount.map(d=>(
              <div key={d.id} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}>
                  <span style={{fontWeight:500,color:'#374151'}}>{d.name}</span>
                  <span style={{fontWeight:700,color:ACCENT}}>{d.count}</span>
                </div>
                <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(d.count/Math.max(activeEmps.length,1))*100}%`,background:ACCENT,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* Today attendance */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Today's Attendance — {today}</div></div>
          <div style={{padding:'14px 18px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            {[['Present',todayPresent,'#10b981'],['Absent',todayAbsent,'#ef4444'],['Not Marked',activeEmps.length-todayPresent-todayAbsent,'#94a3b8']].map(([l,v,c])=>(
              <div key={l} style={{textAlign:'center',padding:'14px 10px',background:'#f8fafc',borderRadius:10}}>
                <div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending leaves */}
        <div className="pm-table-wrap">
          <div className="pm-table-header"><div className="pm-table-title">Pending Leave Approvals</div></div>
          <table className="pm-table">
            <thead><tr><th>Employee</th><th>Type</th><th>Days</th><th>From</th></tr></thead>
            <tbody>
              {pendingLeaves.length===0
                ? <tr><td colSpan={4} style={{padding:24,textAlign:'center',color:'#9ca3af',fontSize:13}}>No pending leaves</td></tr>
                : pendingLeaves.slice(0,5).map(l=>(
                  <tr key={l.id}>
                    <td style={{fontWeight:600,fontSize:13}}>{l.employeeName}</td>
                    <td style={{fontSize:12,color:'#6b7280'}}>{l.type}</td>
                    <td style={{fontWeight:700,color:ACCENT}}>{l.days}d</td>
                    <td style={{fontSize:12,color:'#9ca3af'}}>{l.fromDate}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
