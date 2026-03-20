import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
const ACCENT = '#8b5cf6';
function Modal({title,onClose,children}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24}}>{children}</div></div></div>);}
export default function HRDepartments() {
  const { hrDepartments, employees, createDepartment, updateDepartment } = useApp();
  const [showForm,setShowForm]=useState(false);
  const [editId,  setEditId]  =useState(null);
  const [form,    setForm]    =useState({name:'',code:'',parentId:'',hodEmployeeId:'',status:'active'});
  const depts=hrDepartments||[];
  const emps=(employees||[]).filter(e=>e.status==='active');
  function openCreate(){setForm({name:'',code:'',parentId:'',hodEmployeeId:'',status:'active'});setEditId(null);setShowForm(true);}
  function openEdit(d){setForm({...d});setEditId(d.id);setShowForm(true);}
  function handleSave(){if(!form.name)return;editId?updateDepartment(editId,form):createDepartment(form);setShowForm(false);}
  function empCount(id){return(employees||[]).filter(e=>e.departmentId===id&&e.status==='active').length;}
  function hod(id){const e=emps.find(x=>x.id===id);return e?`${e.firstName} ${e.lastName}`:'—';}
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Departments</h2><p className="pm-page-sub">Organizational structure — departments, heads, sub-departments</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Department</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      {[{label:'Total',value:depts.length,icon:'building',bg:'#f5f3ff',color:ACCENT},{label:'Active',value:depts.filter(d=>d.status==='active').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Total Staff',value:(employees||[]).filter(e=>e.status==='active').length,icon:'users',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(<div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>))}
    </div>
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Departments ({depts.length})</div></div>
      <table className="pm-table">
        <thead><tr><th>Code</th><th>Department</th><th>Parent</th><th>HOD</th><th style={{textAlign:'right'}}>Staff</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {depts.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No departments</td></tr>
            :depts.map(d=><tr key={d.id}><td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{d.code}</td><td style={{fontWeight:600}}>{d.name}</td><td style={{color:'#9ca3af',fontSize:12}}>{depts.find(x=>x.id===d.parentId)?.name||'—'}</td><td style={{color:'#6b7280',fontSize:12}}>{hod(d.hodEmployeeId)}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{empCount(d.id)}</td><td><span className={`pm-badge ${d.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{d.status}</span></td><td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEdit(d)}>Edit</button></td></tr>)
          }
        </tbody>
      </table>
    </div>
    {showForm&&(<Modal title={editId?'Edit Department':'New Department'} onClose={()=>setShowForm(false)}>
      <div className="pm-form-grid">
        <div className="pm-form-group"><label>Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
        <div className="pm-form-group"><label>Code</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))}/></div>
        <div className="pm-form-group"><label>Parent Dept</label><select value={form.parentId||''} onChange={e=>setForm(f=>({...f,parentId:e.target.value}))}><option value="">— None —</option>{depts.filter(d=>d.id!==editId).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="pm-form-group"><label>Head of Dept</label><select value={form.hodEmployeeId||''} onChange={e=>setForm(f=>({...f,hodEmployeeId:e.target.value}))}><option value="">— None —</option>{emps.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
        <div className="pm-form-group"><label>Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}><button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button><button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save':'Create'}</button></div>
    </Modal>)}
  </div>);
}
