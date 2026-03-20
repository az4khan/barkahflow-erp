import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { LEAVE_TYPES } from '../hrConstants';
const ACCENT = '#8b5cf6';
function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}
export default function HRLeaves(){
  const {leaves,employees,applyLeave,approveLeave,rejectLeave}=useApp();
  const [filter,setFilter]=useState('pending');
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({employeeId:'',type:'Annual Leave',fromDate:'',toDate:'',reason:''});
  const [page,setPage]=useState(1);
  const PER=12;
  const allLeaves=leaves||[];
  const emps=(employees||[]).filter(e=>e.status==='active');
  const filtered=allLeaves.filter(l=>filter==='All'||l.status===filter).sort((a,b)=>new Date(b.appliedAt)-new Date(a.appliedAt));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);
  function calcDays(from,to){if(!from||!to)return 0;const d=(new Date(to)-new Date(from))/(1000*60*60*24);return Math.round(d)+1;}
  function handleApply(){
    if(!form.employeeId||!form.fromDate||!form.toDate)return;
    const emp=emps.find(e=>e.id===form.employeeId);
    const days=calcDays(form.fromDate,form.toDate);
    applyLeave({...form,days,employeeName:`${emp?.firstName||''} ${emp?.lastName||''}`});
    setShowForm(false);setForm({employeeId:'',type:'Annual Leave',fromDate:'',toDate:'',reason:''});
  }
  const SC={pending:'pm-badge-orange',approved:'pm-badge-green',rejected:'pm-badge-red'};
  // Leave balance summary per employee (Annual: 14, Sick: 10, Casual: 7)
  const leaveBalance=empId=>{
    const year=new Date().getFullYear();
    const taken=(leaves||[]).filter(l=>l.employeeId===empId&&l.status==='approved'&&l.fromDate?.startsWith(String(year)));
    const byType={};
    LEAVE_TYPES.forEach(t=>byType[t]=taken.filter(l=>l.type===t).reduce((s,l)=>s+(l.days||0),0));
    return byType;
  };
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Leave Management</h2><p className="pm-page-sub">Apply, approve and track employee leave balances</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> Apply Leave</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      {[{l:'Total',v:allLeaves.length,c:ACCENT,b:'#f5f3ff'},{l:'Pending',v:allLeaves.filter(l=>l.status==='pending').length,c:'#f59e0b',b:'#fffbeb'},{l:'Approved',v:allLeaves.filter(l=>l.status==='approved').length,c:'#10b981',b:'#f0fdf4'},{l:'Rejected',v:allLeaves.filter(l=>l.status==='rejected').length,c:'#ef4444',b:'#fef2f2'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="invoice" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value">{s.v}</div></div>
      ))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:4}}>
          {['All','pending','approved','rejected'].map(s=><button key={s} onClick={()=>{setFilter(s);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:filter===s?ACCENT:'#fff',color:filter===s?'#fff':'#6b7280',borderColor:filter===s?ACCENT:'#e5e7eb',textTransform:'capitalize'}}>{s}</button>)}
        </div>
      </div>
      <table className="pm-table">
        <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th style={{textAlign:'right'}}>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {paged.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No leave records</td></tr>
            :paged.map(l=>(
              <tr key={l.id}>
                <td style={{fontWeight:600}}>{l.employeeName}</td>
                <td style={{fontSize:12,color:'#6b7280'}}>{l.type}</td>
                <td style={{fontSize:12,color:'#9ca3af'}}>{l.fromDate}</td>
                <td style={{fontSize:12,color:'#9ca3af'}}>{l.toDate}</td>
                <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{l.days}d</td>
                <td style={{color:'#6b7280',fontSize:12,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.reason}</td>
                <td><span className={`pm-badge ${SC[l.status]||'pm-badge-gray'}`}>{l.status}</span></td>
                <td>
                  {l.status==='pending'&&<div style={{display:'flex',gap:4}}>
                    <button className="pm-btn pm-btn-primary" style={{background:'#10b981',padding:'3px 8px',fontSize:11}} onClick={()=>approveLeave(l.id)}>✓</button>
                    <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11,color:'#ef4444'}} onClick={()=>rejectLeave(l.id)}>✕</button>
                  </div>}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
    </div>
    {showForm&&(<Modal title="Apply Leave" onClose={()=>setShowForm(false)}>
      <div className="pm-form-grid">
        <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Employee *</label><select value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))}><option value="">— Select —</option>{emps.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.empCode})</option>)}</select></div>
        <div className="pm-form-group"><label>Leave Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="pm-form-group"><label>Days: <strong style={{color:ACCENT}}>{calcDays(form.fromDate,form.toDate)}</strong></label></div>
        <div className="pm-form-group"><label>From Date *</label><input type="date" value={form.fromDate} onChange={e=>setForm(f=>({...f,fromDate:e.target.value}))}/></div>
        <div className="pm-form-group"><label>To Date *</label><input type="date" value={form.toDate} onChange={e=>setForm(f=>({...f,toDate:e.target.value}))}/></div>
        <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Reason</label><textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} rows={2} style={{resize:'vertical'}}/></div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}><button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleApply}>Submit Application</button></div>
    </Modal>)}
  </div>);
}
