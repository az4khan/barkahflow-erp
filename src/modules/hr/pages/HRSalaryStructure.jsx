import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr, EARNING_COMPONENTS, DEDUCTION_COMPONENTS } from '../hrConstants';

const ACCENT = '#8b5cf6';

export default function HRSalaryStructure() {
  const { employees, hrDepartments, salaryStructures, addSalaryComponent, removeSalaryComponent, updateSalaryComponent, getActiveComponents } = useApp();
  const [selectedEmp, setSelectedEmp] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deptF,       setDeptF]       = useState('All');
  const [editComp,    setEditComp]    = useState(null);
  const [endDateComp, setEndDateComp] = useState(null);
  const [endDate,     setEndDate]     = useState('');

  const [newComp, setNewComp] = useState({ type:'earning', name:'Basic Salary', amount:'', startDate:new Date().toISOString().slice(0,10), endDate:'' });

  const emps  = (employees||[]).filter(e=>e.status==='active');
  const depts = hrDepartments||[];
  const today = new Date().toISOString().slice(0,10);

  const filteredEmps = emps.filter(e=>deptF==='All'||e.departmentId===deptF);
  const emp = emps.find(e=>e.id===selectedEmp);
  const ss  = salaryStructures?.find(s=>s.employeeId===selectedEmp);
  const comps = ss?.components||[];
  const activeComps = getActiveComponents(selectedEmp, today);

  const grossPay = activeComps.filter(c=>c.type==='earning').reduce((s,c)=>s+c.amount,0);
  const totalDed = activeComps.filter(c=>c.type==='deduction').reduce((s,c)=>s+c.amount,0);
  const netPay   = grossPay - totalDed;

  function handleAdd() {
    if(!selectedEmp||!newComp.name||!newComp.amount)return;
    addSalaryComponent(selectedEmp, {...newComp, amount:parseFloat(newComp.amount)||0});
    setNewComp({type:'earning',name:'Basic Salary',amount:'',startDate:today,endDate:''});
    setShowAddForm(false);
  }

  function handleEndDate() {
    if(!endDateComp||!endDate)return;
    removeSalaryComponent(selectedEmp, endDateComp.id, endDate);
    setEndDateComp(null); setEndDate('');
  }

  function handleUpdateComp() {
    if(!editComp)return;
    updateSalaryComponent(selectedEmp, editComp.id, { amount:parseFloat(editComp.amount)||editComp.amount });
    setEditComp(null);
  }

  const isActive = (comp) => comp.startDate<=today && (!comp.endDate||comp.endDate>=today);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Salary Structure</h2><p className="pm-page-sub">Per-employee wage components with start/end dates — history preserved</p></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:14,height:'calc(100vh - 180px)',overflow:'hidden'}}>
        {/* Employee list */}
        <div className="pm-table-wrap" style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid #f1f5f9'}}>
            <select value={deptF} onChange={e=>setDeptF(e.target.value)} style={{width:'100%',padding:'6px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}>
              <option value="All">All Departments</option>
              {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {filteredEmps.map(e=>{
              const ac=getActiveComponents(e.id,today);
              const gross=ac.filter(c=>c.type==='earning').reduce((s,c)=>s+c.amount,0);
              return(
                <div key={e.id} onClick={()=>setSelectedEmp(e.id)}
                  style={{padding:'10px 16px',cursor:'pointer',background:selectedEmp===e.id?'#f5f3ff':'#fff',borderBottom:'1px solid #f8fafc',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{e.firstName} {e.lastName}</div>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{e.empCode}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:gross>0?ACCENT:'#94a3b8'}}>{gross>0?fmtPKRhr(gross):'—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structure editor */}
        <div style={{display:'flex',flexDirection:'column',gap:10,overflow:'hidden'}}>
          {!emp ? (
            <div className="pm-table-wrap" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:14}}>← Select an employee to view/edit salary structure</div>
          ) : (
            <>
              {/* Header */}
              <div style={{background:'#0f172a',borderRadius:12,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:'#fff'}}>{emp.firstName} {emp.lastName}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{emp.empCode} · {emp.employeeType}</div>
                </div>
                <div style={{display:'flex',gap:20}}>
                  {[['Gross Pay',grossPay,'#a78bfa'],['Deductions',totalDed,'#f87171'],['Net Pay',netPay,'#34d399']].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:'right'}}><div style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{l}</div><div style={{fontSize:16,fontWeight:800,color:c}}>{fmtPKRhr(v)}</div></div>
                  ))}
                </div>
                <button className="pm-btn" style={{background:ACCENT,color:'#fff',border:'none'}} onClick={()=>setShowAddForm(true)}>+ Add Component</button>
              </div>

              {/* Components table */}
              <div className="pm-table-wrap" style={{flex:1,overflow:'auto'}}>
                <div className="pm-table-header"><div className="pm-table-title">Salary Components ({comps.length} total, {activeComps.length} active)</div></div>
                <table className="pm-table">
                  <thead><tr><th>Type</th><th>Component</th><th style={{textAlign:'right'}}>Amount</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {comps.length===0?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No components defined — click Add Component</td></tr>
                      :[...comps].sort((a,b)=>a.type.localeCompare(b.type)||a.startDate.localeCompare(b.startDate)).map(c=>{
                        const active=isActive(c);
                        return(<tr key={c.id} style={{opacity:active?1:0.5}}>
                          <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:c.type==='earning'?'#f0fdf4':'#fef2f2',color:c.type==='earning'?'#10b981':'#ef4444'}}>{c.type}</span></td>
                          <td style={{fontWeight:600}}>{c.name}</td>
                          <td style={{textAlign:'right',fontWeight:700,color:c.type==='earning'?'#10b981':'#ef4444',fontSize:14}}>
                            {editComp?.id===c.id
                              ? <input type="number" value={editComp.amount} onChange={e=>setEditComp(x=>({...x,amount:e.target.value}))} style={{width:100,padding:'4px 8px',border:'2px solid '+ACCENT,borderRadius:6,fontSize:13,textAlign:'right',outline:'none'}}/>
                              : fmtPKRhr(c.amount)
                            }
                          </td>
                          <td style={{color:'#9ca3af',fontSize:12}}>{c.startDate}</td>
                          <td style={{color:c.endDate?'#ef4444':'#94a3b8',fontSize:12}}>{c.endDate||'Ongoing'}</td>
                          <td><span className={`pm-badge ${active?'pm-badge-green':'pm-badge-gray'}`}>{active?'Active':'Ended'}</span></td>
                          <td>
                            {active&&(
                              <div style={{display:'flex',gap:4}}>
                                {editComp?.id===c.id
                                  ? <><button className="pm-btn pm-btn-primary" style={{background:ACCENT,padding:'3px 8px',fontSize:11}} onClick={handleUpdateComp}>Save</button><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setEditComp(null)}>✕</button></>
                                  : <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setEditComp({...c})}>Edit</button>
                                }
                                <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11,color:'#ef4444'}} onClick={()=>{setEndDateComp(c);setEndDate(today);}}>End</button>
                              </div>
                            )}
                          </td>
                        </tr>);
                      })
                    }
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add component modal */}
      {showAddForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>Add Salary Component</h3>
              <button onClick={()=>setShowAddForm(false)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div className="pm-form-grid">
                <div className="pm-form-group">
                  <label>Type</label>
                  <div style={{display:'flex',gap:8}}>
                    {['earning','deduction'].map(t=>(
                      <button key={t} onClick={()=>setNewComp(c=>({...c,type:t,name:t==='earning'?'Basic Salary':'EOBI'}))}
                        style={{flex:1,padding:'8px',borderRadius:8,border:'2px solid',cursor:'pointer',fontWeight:600,fontSize:13,background:newComp.type===t?(t==='earning'?'#10b981':'#ef4444'):'#fff',color:newComp.type===t?'#fff':(t==='earning'?'#10b981':'#ef4444'),borderColor:t==='earning'?'#10b981':'#ef4444'}}>
                        {t.charAt(0).toUpperCase()+t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pm-form-group">
                  <label>Component Name</label>
                  <select value={newComp.name} onChange={e=>setNewComp(c=>({...c,name:e.target.value}))}>
                    {(newComp.type==='earning'?EARNING_COMPONENTS:DEDUCTION_COMPONENTS).map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="pm-form-group"><label>Amount (Rs) *</label><input type="number" value={newComp.amount} onChange={e=>setNewComp(c=>({...c,amount:e.target.value}))} placeholder="0" autoFocus style={{fontSize:18,fontWeight:700}}/></div>
                <div className="pm-form-group"><label>Start Date *</label><input type="date" value={newComp.startDate} onChange={e=>setNewComp(c=>({...c,startDate:e.target.value}))}/></div>
                <div className="pm-form-group"><label>End Date (leave blank = ongoing)</label><input type="date" value={newComp.endDate} onChange={e=>setNewComp(c=>({...c,endDate:e.target.value}))}/></div>
              </div>
              <div style={{background:'#f5f3ff',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#4c1d95',marginTop:12,marginBottom:16}}>
                Component will be active from <strong>{newComp.startDate}</strong>{newComp.endDate?` to <strong>${newComp.endDate}</strong>`:' onwards (no end date)'}.
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                <button className="pm-btn pm-btn-outline" onClick={()=>setShowAddForm(false)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleAdd}>Add Component</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End date modal */}
      {endDateComp&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:400,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>End Component: {endDateComp.name}</h3>
            <div className="pm-form-group" style={{marginBottom:16}}><label>End Date *</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} autoFocus/></div>
            <div style={{background:'#fef2f2',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#991b1b',marginBottom:16}}>
              Component will be deactivated from <strong>{endDate}</strong>. History is preserved.
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="pm-btn pm-btn-outline" onClick={()=>setEndDateComp(null)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" style={{background:'#ef4444'}} onClick={handleEndDate}>Set End Date</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
