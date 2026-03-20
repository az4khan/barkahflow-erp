import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { EMP_TYPES } from '../hrConstants';
const ACCENT = '#8b5cf6';
export default function HRHeadcount() {
  const { employees, hrDepartments, hrDesignations } = useApp();
  const allEmps = employees  || [];
  const depts   = hrDepartments||[];
  const dess    = hrDesignations||[];
  const activeEmps = allEmps.filter(e=>e.status==='active');
  const today = new Date().toISOString().slice(0,10);
  // Service bands
  const bands = [
    { label:'< 1 year',  emps:activeEmps.filter(e=>{ const y=e.joiningDate?(new Date()-new Date(e.joiningDate))/(1000*60*60*24*365):0; return y<1; }) },
    { label:'1–3 years', emps:activeEmps.filter(e=>{ const y=e.joiningDate?(new Date()-new Date(e.joiningDate))/(1000*60*60*24*365):0; return y>=1&&y<3; }) },
    { label:'3–5 years', emps:activeEmps.filter(e=>{ const y=e.joiningDate?(new Date()-new Date(e.joiningDate))/(1000*60*60*24*365):0; return y>=3&&y<5; }) },
    { label:'5+ years',  emps:activeEmps.filter(e=>{ const y=e.joiningDate?(new Date()-new Date(e.joiningDate))/(1000*60*60*24*365):0; return y>=5; }) },
  ];
  return(<div className="pm-page">
    <div className="pm-page-header"><div><h2 className="pm-page-title">Headcount Report</h2><p className="pm-page-sub">Active employees by department, type, designation, and service band</p></div><div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div></div>
    <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
      {[{l:'Active',v:activeEmps.length,c:ACCENT,b:'#f5f3ff'},{l:'Permanent',v:activeEmps.filter(e=>e.employeeType==='Permanent').length,c:'#10b981',b:'#f0fdf4'},{l:'Contract',v:activeEmps.filter(e=>e.employeeType==='Contract').length,c:'#3b82f6',b:'#eff6ff'},{l:'Resigned (YTD)',v:allEmps.filter(e=>e.status==='resigned').length,c:'#f59e0b',b:'#fffbeb'},{l:'Total (All Time)',v:allEmps.length,c:'#94a3b8',b:'#f8fafc'}].map(s=>(
        <div className="pm-stat-card" key={s.l}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.b}}><Icon name="users" size={17} color={s.c}/></div></div><div className="pm-stat-label">{s.l}</div><div className="pm-stat-value">{s.v}</div></div>
      ))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
      {/* By Department */}
      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">By Department</div></div>
        <table className="pm-table">
          <thead><tr><th>Department</th><th style={{textAlign:'right'}}>Active</th><th style={{textAlign:'right'}}>% of Total</th></tr></thead>
          <tbody>
            {depts.map(d=>{const cnt=activeEmps.filter(e=>e.departmentId===d.id).length;if(!cnt)return null;return(<tr key={d.id}>
              <td style={{fontWeight:600}}>{d.name}</td>
              <td style={{textAlign:'right'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
                  <div style={{width:60,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${activeEmps.length>0?(cnt/activeEmps.length)*100:0}%`,background:ACCENT,borderRadius:3}}/></div>
                  <span style={{fontWeight:700,color:ACCENT,minWidth:20}}>{cnt}</span>
                </div>
              </td>
              <td style={{textAlign:'right',color:'#6b7280',fontSize:12}}>{activeEmps.length>0?((cnt/activeEmps.length)*100).toFixed(1):0}%</td>
            </tr>);})}
          </tbody>
        </table>
      </div>
      {/* By Type */}
      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">By Employment Type</div></div>
        <table className="pm-table">
          <thead><tr><th>Type</th><th style={{textAlign:'right'}}>Count</th><th style={{textAlign:'right'}}>%</th></tr></thead>
          <tbody>
            {EMP_TYPES.map(t=>{const cnt=activeEmps.filter(e=>e.employeeType===t).length;if(!cnt)return null;return(<tr key={t}><td style={{fontWeight:600}}>{t}</td><td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{cnt}</td><td style={{textAlign:'right',color:'#6b7280',fontSize:12}}>{activeEmps.length>0?((cnt/activeEmps.length)*100).toFixed(1):0}%</td></tr>);})}
          </tbody>
        </table>
      </div>
    </div>
    {/* Service bands */}
    <div className="pm-table-wrap" style={{marginBottom:14}}>
      <div className="pm-table-header"><div className="pm-table-title">Service Band Distribution</div></div>
      <div style={{padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {bands.map(b=>(
          <div key={b.label} style={{background:'#f8fafc',borderRadius:10,padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:28,fontWeight:900,color:ACCENT,marginBottom:4}}>{b.emps.length}</div>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:8}}>{b.label}</div>
            <div style={{height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${activeEmps.length>0?(b.emps.length/activeEmps.length)*100:0}%`,background:ACCENT,borderRadius:3}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Full roster */}
    <div className="pm-table-wrap">
      <div className="pm-table-header"><div className="pm-table-title">Active Employee Roster ({activeEmps.length})</div></div>
      <table className="pm-table">
        <thead><tr><th>Code</th><th>Employee</th><th>Department</th><th>Designation</th><th>Type</th><th>Joining Date</th><th style={{textAlign:'right'}}>Service</th></tr></thead>
        <tbody>
          {activeEmps.map(e=>{
            const dept=depts.find(d=>d.id===e.departmentId)?.name||'—';
            const des=dess.find(d=>d.id===e.designationId)?.title||'—';
            const years=e.joiningDate?Math.floor((new Date()-new Date(e.joiningDate))/(1000*60*60*24*365)):0;
            return(<tr key={e.id}>
              <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{e.empCode}</td>
              <td style={{fontWeight:600}}>{e.firstName} {e.lastName}</td>
              <td style={{color:'#6b7280',fontSize:12}}>{dept}</td>
              <td style={{color:'#6b7280',fontSize:12}}>{des}</td>
              <td><span style={{fontSize:11,padding:'2px 7px',borderRadius:8,background:'#f5f3ff',color:ACCENT,fontWeight:600}}>{e.employeeType}</span></td>
              <td style={{color:'#9ca3af',fontSize:12}}>{e.joiningDate||'—'}</td>
              <td style={{textAlign:'right',fontWeight:700,color:years>=5?'#10b981':years>=2?ACCENT:'#94a3b8'}}>{years}y</td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>
  </div>);
}
