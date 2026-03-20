import { useState, useMemo } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr, EMP_TYPES, GRADES, BANKS } from '../hrConstants';

const ACCENT = '#8b5cf6';

function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?780:520,maxHeight:'94vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

const emptyForm = ()=>({ firstName:'', lastName:'', cnic:'', phone:'', email:'', gender:'Male', dob:'', joiningDate:'', confirmationDate:'', departmentId:'', designationId:'', grade:'G1', employeeType:'Permanent', bankAccount:'', bankName:'HBL', address:'', emergencyContact:'', notes:'' });

export default function HREmployees() {
  const { employees, hrDepartments, hrDesignations, distDrivers, users, createEmployee, updateEmployee, linkEmployeeToUser, linkEmployeeToDriver, terminateEmployee, salaryStructures, getActiveComponents } = useApp();
  const [search,   setSearch]   = useState('');
  const [deptF,    setDeptF]    = useState('All');
  const [typeF,    setTypeF]    = useState('All');
  const [statusF,  setStatusF]  = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [viewEmp,  setViewEmp]  = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const emps  = employees      || [];
  const depts = hrDepartments  || [];
  const dess  = hrDesignations || [];
  const drvs  = distDrivers    || [];
  const usrs  = users          || [];

  const filtered = useMemo(()=>emps.filter(e=>{
    const q=search.toLowerCase();
    return(statusF==='All'||e.status===statusF)&&
      (deptF==='All'||e.departmentId===deptF)&&
      (typeF==='All'||e.employeeType===typeF)&&
      (!search||(e.firstName+' '+e.lastName).toLowerCase().includes(q)||(e.empCode||'').toLowerCase().includes(q)||(e.cnic||'').includes(search));
  }),[emps,statusF,deptF,typeF,search]);

  const pages = Math.ceil(filtered.length/PER);
  const paged  = filtered.slice((page-1)*PER,page*PER);

  function dept(id){ return depts.find(d=>d.id===id)?.name||'—'; }
  function des(id) { return dess.find(d=>d.id===id)?.title||'—'; }
  function netSalary(empId) {
    const comps = getActiveComponents(empId, new Date().toISOString().slice(0,10));
    const gross = comps.filter(c=>c.type==='earning').reduce((s,c)=>s+c.amount,0);
    const ded   = comps.filter(c=>c.type==='deduction').reduce((s,c)=>s+c.amount,0);
    return { gross, net:gross-ded };
  }

  function openCreate() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(e)  { setForm({ ...e }); setEditId(e.id); setShowForm(true); }
  function handleSave() {
    if(!form.firstName||!form.cnic) return;
    editId ? updateEmployee(editId,form) : createEmployee(form);
    setShowForm(false);
  }

  const statusColor={ active:'#10b981', resigned:'#f59e0b', terminated:'#ef4444' };

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Employee Master</h2><p className="pm-page-sub">Central employee registry — links to user logins and driver profiles</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Employee</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Active',value:emps.filter(e=>e.status==='active').length,icon:'users',bg:'#f5f3ff',color:ACCENT},{label:'Contract',value:emps.filter(e=>e.employeeType==='Contract').length,icon:'invoice',bg:'#eff6ff',color:'#3b82f6'},{label:'Resigned',value:emps.filter(e=>e.status==='resigned').length,icon:'purchase',bg:'#fffbeb',color:'#f59e0b'},{label:'Terminated',value:emps.filter(e=>e.status==='terminated').length,icon:'alert',bg:'#fef2f2',color:'#ef4444'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {['active','All','resigned','terminated'].map(s=>(
              <button key={s} onClick={()=>{setStatusF(s);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:statusF===s?ACCENT:'#fff',color:statusF===s?'#fff':'#6b7280',borderColor:statusF===s?ACCENT:'#e5e7eb',textTransform:'capitalize'}}>{s}</button>
            ))}
            <select value={deptF} onChange={e=>{setDeptF(e.target.value);setPage(1);}} style={{padding:'5px 10px',border:'1px solid #e2e8f0',borderRadius:20,fontSize:11.5,outline:'none',cursor:'pointer'}}>
              <option value="All">All Depts</option>
              {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search name, code, CNIC…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>Code</th><th>Employee</th><th>Department</th><th>Designation</th><th>Type</th><th>Joining</th><th style={{textAlign:'right'}}>Net Salary</th><th>Links</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No employees found</td></tr>
              :paged.map(e=>{
                const ns=netSalary(e.id);
                const sc=statusColor[e.status]||'#94a3b8';
                const hasUser=!!e.userId;
                const hasDriver=!!e.driverProfileId;
                return(<tr key={e.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{e.empCode}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:ACCENT,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>{e.firstName[0]}</div>
                      <div><div style={{fontWeight:600,color:'#0f172a'}}>{e.firstName} {e.lastName}</div><div style={{fontSize:11,color:'#94a3b8'}}>{e.cnic}</div></div>
                    </div>
                  </td>
                  <td style={{color:'#6b7280',fontSize:12}}>{dept(e.departmentId)}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{des(e.designationId)}</td>
                  <td><span style={{fontSize:11,padding:'2px 7px',borderRadius:8,background:'#f5f3ff',color:ACCENT,fontWeight:600}}>{e.employeeType}</span></td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{e.joiningDate||'—'}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{ns.gross>0?fmtPKRhr(ns.net):'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      {hasUser&&<span style={{fontSize:10,fontWeight:700,background:'#eff6ff',color:'#3b82f6',padding:'1px 6px',borderRadius:6}}>User</span>}
                      {hasDriver&&<span style={{fontSize:10,fontWeight:700,background:'#fef2f2',color:'#ef4444',padding:'1px 6px',borderRadius:6}}>Driver</span>}
                    </div>
                  </td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:sc+'18',color:sc}}>{e.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewEmp(e)}>View</button>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>openEdit(e)}>Edit</button>
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {/* View Modal */}
      {viewEmp&&(
        <Modal title={`${viewEmp.empCode} — ${viewEmp.firstName} ${viewEmp.lastName}`} onClose={()=>setViewEmp(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[['CNIC',viewEmp.cnic],['Phone',viewEmp.phone],['Email',viewEmp.email],['Department',dept(viewEmp.departmentId)],['Designation',des(viewEmp.designationId)],['Grade',viewEmp.grade],['Type',viewEmp.employeeType],['Joining',viewEmp.joiningDate||'—'],['Confirmation',viewEmp.confirmationDate||'—'],['Bank',viewEmp.bankName||'—'],['Account',viewEmp.bankAccount||'—'],['Status',viewEmp.status]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'9px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>

          {/* Link to user / driver */}
          <div style={{background:'#f5f3ff',borderRadius:10,padding:'14px 16px',marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,color:'#4c1d95',marginBottom:10}}>System Links</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:6}}>User Account: <strong style={{color:viewEmp.userId?'#3b82f6':'#94a3b8'}}>{viewEmp.userId?usrs.find(u=>u.id===viewEmp.userId)?.username||viewEmp.userId:'Not linked'}</strong></div>
                {!viewEmp.userId&&(
                  <select style={{padding:'5px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none',width:'100%'}} onChange={e=>{if(e.target.value){linkEmployeeToUser(viewEmp.id,e.target.value);setViewEmp(prev=>({...prev,userId:e.target.value}));}}}>
                    <option value="">Link to user login…</option>
                    {usrs.filter(u=>!emps.find(em=>em.userId===u.id)).map(u=><option key={u.id} value={u.id}>{u.username} ({u.firstName} {u.lastName})</option>)}
                  </select>
                )}
              </div>
              <div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:6}}>Driver Profile: <strong style={{color:viewEmp.driverProfileId?'#ef4444':'#94a3b8'}}>{viewEmp.driverProfileId?drvs.find(d=>d.id===viewEmp.driverProfileId)?.name||viewEmp.driverProfileId:'Not linked'}</strong></div>
                {!viewEmp.driverProfileId&&(
                  <select style={{padding:'5px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none',width:'100%'}} onChange={e=>{if(e.target.value){linkEmployeeToDriver(viewEmp.id,e.target.value);setViewEmp(prev=>({...prev,driverProfileId:e.target.value}));}}}>
                    <option value="">Link to driver profile…</option>
                    {drvs.filter(d=>!emps.find(em=>em.driverProfileId===d.id)).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            {viewEmp.status==='active'&&<button className="pm-btn pm-btn-ghost" style={{color:'#ef4444',border:'1px solid #fecaca'}} onClick={()=>{terminateEmployee(viewEmp.id,{type:'termination',exitDate:new Date().toISOString().slice(0,10)});setViewEmp(null);}}>Terminate</button>}
            <button className="pm-btn pm-btn-outline" onClick={()=>{setViewEmp(null);openEdit(viewEmp);}}>Edit</button>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewEmp(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {showForm&&(
        <Modal title={editId?'Edit Employee':'New Employee'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div className="pm-form-group"><label>First Name *</label><input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Last Name *</label><input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}/></div>
            <div className="pm-form-group"><label>CNIC *</label><input value={form.cnic} onChange={e=>setForm(f=>({...f,cnic:e.target.value}))} placeholder="35201-xxxxxxx-x"/></div>
            <div className="pm-form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Email</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Gender</label><select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}><option>Male</option><option>Female</option></select></div>
            <div className="pm-form-group"><label>Date of Birth</label><input type="date" value={form.dob||''} onChange={e=>setForm(f=>({...f,dob:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Joining Date</label><input type="date" value={form.joiningDate||''} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Confirmation Date</label><input type="date" value={form.confirmationDate||''} onChange={e=>setForm(f=>({...f,confirmationDate:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Department</label><select value={form.departmentId} onChange={e=>setForm(f=>({...f,departmentId:e.target.value}))}><option value="">— Select —</option>{depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="pm-form-group"><label>Designation</label><select value={form.designationId} onChange={e=>setForm(f=>({...f,designationId:e.target.value}))}><option value="">— Select —</option>{dess.filter(d=>!form.departmentId||d.departmentId===form.departmentId).map(d=><option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
            <div className="pm-form-group"><label>Grade</label><select value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value}))}>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
            <div className="pm-form-group"><label>Employee Type</label><select value={form.employeeType} onChange={e=>setForm(f=>({...f,employeeType:e.target.value}))}>{EMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="pm-form-group"><label>Bank</label><select value={form.bankName||'HBL'} onChange={e=>setForm(f=>({...f,bankName:e.target.value}))}>{BANKS.map(b=><option key={b}>{b}</option>)}</select></div>
            <div className="pm-form-group"><label>Bank Account No</label><input value={form.bankAccount||''} onChange={e=>setForm(f=>({...f,bankAccount:e.target.value}))} placeholder="Account number"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Address</label><input value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
            <div className="pm-form-group"><label>Emergency Contact</label><input value={form.emergencyContact||''} onChange={e=>setForm(f=>({...f,emergencyContact:e.target.value}))}/></div>
            <div className="pm-form-group" style={{gridColumn:'span 2'}}><label>Notes</label><input value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save Changes':'Create Employee'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
