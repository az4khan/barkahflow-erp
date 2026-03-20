import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
const ACCENT = '#8b5cf6';
const ATT_STATUS=['present','absent','half-day','on-leave','holiday'];
const SC={present:'pm-badge-green',absent:'pm-badge-red','half-day':'pm-badge-orange','on-leave':'pm-badge-blue',holiday:'pm-badge-gray'};
export default function HRAttendance(){
  const {employees,hrDepartments,attendance,markBulkAttendance}=useApp();
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [deptF,setDeptF]=useState('All');
  const [draft,setDraft]=useState({});
  const [saved,setSaved]=useState(false);
  const emps=(employees||[]).filter(e=>e.status==='active'&&(deptF==='All'||e.departmentId===deptF));
  const depts=hrDepartments||[];
  const dayAtt=useMemo(()=>(attendance||[]).filter(a=>a.date===date),[attendance,date]);
  const getStatus=empId=>{const a=dayAtt.find(x=>x.employeeId===empId);return draft[empId]||a?.status||'present';};
  const getNote=empId=>{const a=dayAtt.find(x=>x.employeeId===empId);return a?.note||'';};
  function setStatus(empId,status){setDraft(d=>({...d,[empId]:status}));setSaved(false);}
  function handleSave(){
    const records=emps.map(e=>({employeeId:e.id,status:getStatus(e.id),inTime:'',outTime:'',note:''}));
    markBulkAttendance(date,records);
    setDraft({});setSaved(true);
  }
  const present=emps.filter(e=>getStatus(e.id)==='present').length;
  const absent=emps.filter(e=>getStatus(e.id)==='absent').length;
  const onLeave=emps.filter(e=>getStatus(e.id)==='on-leave').length;
  return(<div className="pm-page">
    <div className="pm-page-header">
      <div><h2 className="pm-page-title">Attendance</h2><p className="pm-page-sub">Daily attendance marking — bulk save per date</p></div>
      <div className="pm-page-actions">
        <input type="date" value={date} onChange={e=>{setDate(e.target.value);setDraft({});setSaved(false);}} style={{padding:'7px 12px',border:'2px solid '+ACCENT,borderRadius:8,fontSize:13,fontWeight:600,outline:'none'}}/>
        <select value={deptF} onChange={e=>setDeptF(e.target.value)} style={{padding:'7px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none'}}>
          <option value="All">All Departments</option>
          {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
    </div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:14}}>
      {[{l:'Total',v:emps.length,c:ACCENT,b:'#f5f3ff'},{l:'Present',v:present,c:'#10b981',b:'#f0fdf4'},{l:'Absent',v:absent,c:'#ef4444',b:'#fef2f2'},{l:'On Leave',v:onLeave,c:'#3b82f6',b:'#eff6ff'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="users" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value">{s.v}</div></div>
      ))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header">
        <div className="pm-table-title">Attendance — {new Date(date+'T00:00:00').toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="pm-btn pm-btn-ghost" style={{fontSize:12}} onClick={()=>{const d={};emps.forEach(e=>d[e.id]='present');setDraft(d);setSaved(false);}}>Mark All Present</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{saved?'✓ Saved':'Save Attendance'}</button>
        </div>
      </div>
      <table className="pm-table">
        <thead><tr><th>Code</th><th>Employee</th><th>Department</th><th>Attendance</th></tr></thead>
        <tbody>
          {emps.length===0?<tr><td colSpan={4} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No employees found</td></tr>
            :emps.map(e=>{
              const st=getStatus(e.id);
              const dept=(hrDepartments||[]).find(d=>d.id===e.departmentId)?.name||'—';
              return(<tr key={e.id} style={{background:st==='absent'?'#fff8f8':st==='present'?'#fafffe':'#fff'}}>
                <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{e.empCode}</td>
                <td style={{fontWeight:600}}>{e.firstName} {e.lastName}</td>
                <td style={{color:'#6b7280',fontSize:12}}>{dept}</td>
                <td>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {ATT_STATUS.map(s=>(
                      <button key={s} onClick={()=>setStatus(e.id,s)}
                        style={{padding:'5px 10px',borderRadius:8,border:'2px solid',fontSize:11.5,fontWeight:600,cursor:'pointer',textTransform:'capitalize',background:st===s?(s==='present'?'#10b981':s==='absent'?'#ef4444':s==='half-day'?'#f59e0b':s==='on-leave'?'#3b82f6':'#94a3b8'):'#fff',color:st===s?'#fff':'#6b7280',borderColor:st===s?(s==='present'?'#10b981':s==='absent'?'#ef4444':s==='half-day'?'#f59e0b':s==='on-leave'?'#3b82f6':'#94a3b8'):'#e5e7eb'}}>
                        {s.replace('-',' ')}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>);
            })
          }
        </tbody>
      </table>
    </div>
  </div>);
}
