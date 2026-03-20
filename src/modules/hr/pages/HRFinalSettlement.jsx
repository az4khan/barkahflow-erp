import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';
const ACCENT = '#8b5cf6';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?680:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}
export default function HRFinalSettlement() {
  const { employees, hrDepartments, payrollRecords, loans, finalSettlements, leaves, createFinalSettlement } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [form, setForm] = useState({ type:'resignation', exitDate:'', noticePeriodDays:30, note:'' });
  const fsets = finalSettlements || [];
  const activeEmps = (employees||[]).filter(e=>e.status==='active');
  const depts = hrDepartments||[];
  const today = new Date().toISOString().slice(0,10);

  function computeSettlement(empId) {
    const emp    = employees?.find(e=>e.id===empId);
    if (!emp) return null;
    const years  = emp.joiningDate ? Math.floor((new Date()-new Date(emp.joiningDate))/(1000*60*60*24*365)) : 0;
    const pr     = (payrollRecords||[]).filter(r=>r.employeeId===empId).slice(-1)[0];
    const basic  = pr?.earnings?.['Basic Salary']||0;
    const gratuity      = basic * years;
    // Pending leaves encashment (annual leave × per-day basic)
    const pendingLeaves = 5; // simplified — in production sum unused annual leave days
    const perDay        = basic / 26;
    const leaveEncash   = Math.round(perDay * pendingLeaves);
    // Outstanding loan
    const activeLoan    = (loans||[]).find(l=>l.employeeId===empId&&l.status==='active');
    const loanDeduction = activeLoan ? (activeLoan.amount-(activeLoan.recoveredAmount||0)) : 0;
    // Last month salary (simplified)
    const lastSalary    = pr?.netPay||0;
    const totalPayable  = gratuity + leaveEncash + lastSalary - loanDeduction;
    return { emp, years, basic, gratuity, leaveEncash, loanDeduction, lastSalary, totalPayable, pendingLeaves };
  }

  const preview = selectedEmp ? computeSettlement(selectedEmp) : null;

  function handleSettle() {
    if(!selectedEmp||!form.exitDate||!preview)return;
    createFinalSettlement({
      employeeId:   selectedEmp,
      employeeName: `${preview.emp.firstName} ${preview.emp.lastName}`,
      ...form,
      gratuity:        preview.gratuity,
      leaveEncashment: preview.leaveEncash,
      loanDeduction:   preview.loanDeduction,
      lastSalary:      preview.lastSalary,
      totalPayable:    preview.totalPayable,
      yearsOfService:  preview.years,
    });
    setShowForm(false); setSelectedEmp(''); setForm({type:'resignation',exitDate:'',noticePeriodDays:30,note:''});
  }

  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Final Settlement</h2><p className="pm-page-sub">Resignation/termination — gratuity, leave encashment, loan deduction, last salary</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Settlement</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {[{l:'Total Processed',v:fsets.length,c:ACCENT,b:'#f5f3ff'},{l:'Resignations',v:fsets.filter(s=>s.type==='resignation').length,c:'#f59e0b',b:'#fffbeb'},{l:'Terminations',v:fsets.filter(s=>s.type==='termination').length,c:'#ef4444',b:'#fef2f2'},{l:'Total Paid Out',v:fmtPKRhr(fsets.reduce((s,x)=>s+(x.totalPayable||0),0)),c:'#10b981',b:'#f0fdf4'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="briefcase" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value" style={{fontSize:typeof s.v==='string'?16:22}}>{s.v}</div></div>
      ))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Settlement Records ({fsets.length})</div></div>
      <table className="pm-table">
        <thead><tr><th>Employee</th><th>Exit Date</th><th>Type</th><th>Years</th><th style={{textAlign:'right'}}>Gratuity</th><th style={{textAlign:'right'}}>Leave Enc.</th><th style={{textAlign:'right'}}>Loan Ded.</th><th style={{textAlign:'right'}}>Net Payable</th></tr></thead>
        <tbody>
          {fsets.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No settlements processed yet</td></tr>
            :fsets.map(s=>(
              <tr key={s.id}>
                <td style={{fontWeight:600}}>{s.employeeName}</td>
                <td style={{color:'#9ca3af',fontSize:12}}>{s.exitDate}</td>
                <td><span className={`pm-badge ${s.type==='resignation'?'pm-badge-orange':'pm-badge-red'}`}>{s.type}</span></td>
                <td style={{color:'#6b7280'}}>{s.yearsOfService}y</td>
                <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{fmtPKRhr(s.gratuity)}</td>
                <td style={{textAlign:'right',color:'#3b82f6'}}>{fmtPKRhr(s.leaveEncashment)}</td>
                <td style={{textAlign:'right',color:'#ef4444'}}>{fmtPKRhr(s.loanDeduction)}</td>
                <td style={{textAlign:'right',fontWeight:800,color:ACCENT,fontSize:14}}>{fmtPKRhr(s.totalPayable)}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
    {showForm&&(
      <Modal title="Process Final Settlement" onClose={()=>setShowForm(false)} wide>
        <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr',marginBottom:16}}>
          <div className="pm-form-group" style={{gridColumn:'1/-1'}}>
            <label>Employee *</label>
            <select value={selectedEmp} onChange={e=>setSelectedEmp(e.target.value)}>
              <option value="">— Select Employee —</option>
              {activeEmps.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.empCode})</option>)}
            </select>
          </div>
          <div className="pm-form-group"><label>Exit Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="resignation">Resignation</option><option value="termination">Termination</option><option value="retirement">Retirement</option></select></div>
          <div className="pm-form-group"><label>Exit Date *</label><input type="date" value={form.exitDate} onChange={e=>setForm(f=>({...f,exitDate:e.target.value}))}/></div>
          <div className="pm-form-group"><label>Notice Period (days)</label><input type="number" value={form.noticePeriodDays} onChange={e=>setForm(f=>({...f,noticePeriodDays:e.target.value}))}/></div>
          <div className="pm-form-group"><label>Notes</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Additional details"/></div>
        </div>

        {preview&&(
          <div style={{background:'#0f172a',borderRadius:12,padding:'16px 20px',marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:12}}>{preview.emp.firstName} {preview.emp.lastName} — Settlement Preview</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
              {[['Service',`${preview.years} years`,'#a78bfa'],['Gratuity',fmtPKRhr(preview.gratuity),'#34d399'],['Leave Encash.',fmtPKRhr(preview.leaveEncash),'#60a5fa'],['Last Salary',fmtPKRhr(preview.lastSalary),'#fbbf24'],['Loan Deduction',`- ${fmtPKRhr(preview.loanDeduction)}`,'#f87171'],['Total Payable',fmtPKRhr(preview.totalPayable),'#34d399']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:3}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#991b1b',marginBottom:14}}>
          <strong>Warning:</strong> This will terminate the employee record and post a settlement journal entry. Action cannot be reversed.
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={handleSettle} disabled={!selectedEmp||!form.exitDate}>Process Settlement</button>
        </div>
      </Modal>
    )}
  </div>);
}
