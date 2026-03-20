import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';
const ACCENT='#8b5cf6';
function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}
export default function HRLoans(){
  const {loans,employees,createLoan,updateLoan}=useApp();
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({employeeId:'',amount:'',disbursedDate:'',emiAmount:'',emiMonths:'',note:''});
  const allLoans=loans||[];
  const emps=(employees||[]).filter(e=>e.status==='active');
  function handleCreate(){
    if(!form.employeeId||!form.amount)return;
    const emp=emps.find(e=>e.id===form.employeeId);
    createLoan({...form,amount:parseFloat(form.amount)||0,emiAmount:parseFloat(form.emiAmount)||0,emiMonths:parseInt(form.emiMonths)||0,employeeName:`${emp?.firstName||''} ${emp?.lastName||''}`});
    setShowForm(false);setForm({employeeId:'',amount:'',disbursedDate:'',emiAmount:'',emiMonths:'',note:''});
  }
  const totalOut=allLoans.filter(l=>l.status==='active').reduce((s,l)=>s+(l.amount-(l.recoveredAmount||0)),0);
  const totalDisbursed=allLoans.reduce((s,l)=>s+(l.amount||0),0);
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Loan Management</h2><p className="pm-page-sub">Employee loans with EMI auto-deducted from monthly payroll</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Loan</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {[{l:'Total Loans',v:allLoans.length,c:ACCENT,b:'#f5f3ff'},{l:'Active',v:allLoans.filter(l=>l.status==='active').length,c:'#ef4444',b:'#fef2f2'},{l:'Outstanding',v:fmtPKRhr(totalOut),c:'#f59e0b',b:'#fffbeb'},{l:'Total Disbursed',v:fmtPKRhr(totalDisbursed),c:'#10b981',b:'#f0fdf4'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="breakdown" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value" style={{fontSize:typeof s.v==='string'?16:22}}>{s.v}</div></div>
      ))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Loans ({allLoans.length})</div></div>
      <table className="pm-table">
        <thead><tr><th>Loan ID</th><th>Employee</th><th>Disbursed</th><th style={{textAlign:'right'}}>Amount</th><th style={{textAlign:'right'}}>EMI</th><th style={{textAlign:'right'}}>Recovered</th><th style={{textAlign:'right'}}>Outstanding</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>
          {allLoans.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No loans</td></tr>
            :allLoans.map(l=>{
              const pct=l.amount>0?((l.recoveredAmount||0)/l.amount)*100:0;
              const out=(l.amount||0)-(l.recoveredAmount||0);
              return(<tr key={l.id}>
                <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{l.id}</td>
                <td style={{fontWeight:600}}>{l.employeeName}</td>
                <td style={{color:'#9ca3af',fontSize:12}}>{l.disbursedDate}</td>
                <td style={{textAlign:'right',fontWeight:700}}>{fmtPKRhr(l.amount)}</td>
                <td style={{textAlign:'right',color:'#6b7280'}}>{fmtPKRhr(l.emiAmount)}/mo</td>
                <td style={{textAlign:'right',color:'#10b981',fontWeight:600}}>{fmtPKRhr(l.recoveredAmount)}</td>
                <td style={{textAlign:'right',fontWeight:700,color:out>0?'#ef4444':'#10b981'}}>{fmtPKRhr(out)}</td>
                <td style={{minWidth:100}}>
                  <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:pct>=100?'#10b981':ACCENT,borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{pct.toFixed(0)}%</div>
                </td>
                <td><span className={`pm-badge ${l.status==='active'?'pm-badge-orange':'pm-badge-green'}`}>{l.status}</span></td>
              </tr>);
            })
          }
        </tbody>
      </table>
    </div>
    {showForm&&(<Modal title="New Employee Loan" onClose={()=>setShowForm(false)}>
      <div className="pm-form-grid">
        <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Employee *</label><select value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))}><option value="">— Select —</option>{emps.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.empCode})</option>)}</select></div>
        <div className="pm-form-group"><label>Loan Amount *</label><input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} autoFocus style={{fontSize:18,fontWeight:700}}/></div>
        <div className="pm-form-group"><label>Disbursement Date</label><input type="date" value={form.disbursedDate} onChange={e=>setForm(f=>({...f,disbursedDate:e.target.value}))}/></div>
        <div className="pm-form-group"><label>Monthly EMI</label><input type="number" value={form.emiAmount} onChange={e=>setForm(f=>({...f,emiAmount:e.target.value}))}/></div>
        <div className="pm-form-group"><label>No. of Months</label><input type="number" value={form.emiMonths} onChange={e=>setForm(f=>({...f,emiMonths:e.target.value}))}/></div>
        <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note</label><input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Reason for loan"/></div>
      </div>
      <div style={{background:'#f5f3ff',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#4c1d95',marginTop:12,marginBottom:16}}>EMI will be auto-deducted under "Loan Recovery" when payroll is processed. Journal: Dr Loan to Employee / Cr Cash.</div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleCreate}>Disburse Loan</button></div>
    </Modal>)}
  </div>);
}
