import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { GRADES, fmtPKRhr } from '../hrConstants';
const ACCENT = '#8b5cf6';
function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}
export default function HRDesignations() {
  const { hrDesignations, hrDepartments, employees, createDesignation, updateDesignation } = useApp();
  const [showForm,setShowForm]=useState(false);
  const [editId,  setEditId]  =useState(null);
  const [form,    setForm]    =useState({title:'',grade:'G1',departmentId:'',minSalary:'',maxSalary:'',status:'active'});
  const dess=hrDesignations||[];
  const depts=hrDepartments||[];
  function openCreate(){setForm({title:'',grade:'G1',departmentId:'',minSalary:'',maxSalary:'',status:'active'});setEditId(null);setShowForm(true);}
  function openEdit(d){setForm({...d,minSalary:String(d.minSalary||''),maxSalary:String(d.maxSalary||'')});setEditId(d.id);setShowForm(true);}
  function handleSave(){if(!form.title)return;const data={...form,minSalary:parseFloat(form.minSalary)||0,maxSalary:parseFloat(form.maxSalary)||0};editId?updateDesignation(editId,data):createDesignation(data);setShowForm(false);}
  function empCount(id){return(employees||[]).filter(e=>e.designationId===id&&e.status==='active').length;}
  function dept(id){return depts.find(d=>d.id===id)?.name||'—';}
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Designations</h2><p className="pm-page-sub">Job titles with grade and salary band mapping</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Designation</button></div></div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Designations ({dess.length})</div></div>
      <table className="pm-table">
        <thead><tr><th>Title</th><th>Grade</th><th>Department</th><th style={{textAlign:'right'}}>Min Salary</th><th style={{textAlign:'right'}}>Max Salary</th><th style={{textAlign:'right'}}>Staff</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {dess.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No designations</td></tr>
            :dess.map(d=><tr key={d.id}><td style={{fontWeight:600}}>{d.title}</td><td><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:'#f5f3ff',color:ACCENT}}>{d.grade}</span></td><td style={{color:'#6b7280',fontSize:12}}>{dept(d.departmentId)}</td><td style={{textAlign:'right'}}>{fmtPKRhr(d.minSalary)}</td><td style={{textAlign:'right'}}>{fmtPKRhr(d.maxSalary)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{empCount(d.id)}</td><td><span className={`pm-badge ${d.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{d.status}</span></td><td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEdit(d)}>Edit</button></td></tr>)
          }
        </tbody>
      </table>
    </div>
    {showForm&&(<Modal title={editId?'Edit Designation':'New Designation'} onClose={()=>setShowForm(false)}>
      <div className="pm-form-grid">
        <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Senior Accountant"/></div>
        <div className="pm-form-group"><label>Grade</label><select value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value}))}>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
        <div className="pm-form-group"><label>Department</label><select value={form.departmentId||''} onChange={e=>setForm(f=>({...f,departmentId:e.target.value}))}><option value="">— Select —</option>{depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="pm-form-group"><label>Min Salary</label><input type="number" value={form.minSalary} onChange={e=>setForm(f=>({...f,minSalary:e.target.value}))}/></div>
        <div className="pm-form-group"><label>Max Salary</label><input type="number" value={form.maxSalary} onChange={e=>setForm(f=>({...f,maxSalary:e.target.value}))}/></div>
        <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}><button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save':'Create'}</button></div>
    </Modal>)}
  </div>);
}
