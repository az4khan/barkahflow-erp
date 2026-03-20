import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRhr } from '../hrConstants';

const ACCENT = '#8b5cf6';

export default function HRPayrollPeriods() {
  const { payrollPeriods, payrollRecords, openPayrollPeriod, closePayrollPeriod, processPayroll, approveAllPayroll, postPayrollToAccounting } = useApp();
  const [newMonth, setNewMonth] = useState('');

  const periods = [...(payrollPeriods||[])].sort((a,b)=>b.month.localeCompare(a.month));

  function totalGross(periodId) { return (payrollRecords||[]).filter(r=>r.periodId===periodId).reduce((s,r)=>s+(r.grossPay||0),0); }
  function totalNet(periodId)   { return (payrollRecords||[]).filter(r=>r.periodId===periodId).reduce((s,r)=>s+(r.netPay||0),0); }
  function empCount(periodId)   { return (payrollRecords||[]).filter(r=>r.periodId===periodId).length; }
  function approvedCount(periodId){ return (payrollRecords||[]).filter(r=>r.periodId===periodId&&r.status==='approved').length; }

  const STATUS_CFG = {
    open:       { label:'Open',       cls:'pm-badge-green',  color:'#10b981', bg:'#f0fdf4' },
    processing: { label:'Processing', cls:'pm-badge-blue',   color:'#3b82f6', bg:'#eff6ff' },
    posted:     { label:'Posted',     cls:'pm-badge-purple', color:ACCENT,    bg:'#f5f3ff' },
    closed:     { label:'Closed',     cls:'pm-badge-gray',   color:'#94a3b8', bg:'#f8fafc' },
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Payroll Periods</h2><p className="pm-page-sub">Open → Process → Approve → Post to Accounting → Close</p></div>
      </div>

      {/* Open new period */}
      <div className="pm-table-wrap" style={{marginBottom:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Open New Payroll Period</div></div>
        <div style={{padding:'16px 18px',display:'flex',gap:10,alignItems:'flex-end'}}>
          <div className="pm-form-group" style={{margin:0,flex:1,maxWidth:240}}>
            <label style={{fontSize:12,color:'#6b7280',marginBottom:4,display:'block'}}>Select Month</label>
            <input type="month" value={newMonth} onChange={e=>setNewMonth(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',width:'100%'}}/>
          </div>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT,height:38}} onClick={()=>{if(newMonth){openPayrollPeriod(newMonth);setNewMonth('');}}}>
            Open Period
          </button>
          <div style={{fontSize:12.5,color:'#94a3b8',flex:1}}>Period must be opened before payroll can be processed. Only one open period at a time recommended.</div>
        </div>
      </div>

      {/* Workflow legend */}
      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',padding:'10px 14px',background:'#f8fafc',borderRadius:10,fontSize:12.5,color:'#6b7280',flexWrap:'wrap'}}>
        {[['Open','#10b981'],['→ Process','#3b82f6'],['→ Approve All','#f59e0b'],['→ Post to Accounting',ACCENT],['→ Close','#94a3b8']].map(([l,c],i)=>(
          <span key={i} style={{fontWeight:500,color:c}}>{l}</span>
        ))}
      </div>

      {/* Periods list */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {periods.map(p=>{
          const sc  = STATUS_CFG[p.status]||STATUS_CFG.closed;
          const gr  = totalGross(p.id);
          const net = totalNet(p.id);
          const cnt = empCount(p.id);
          const app = approvedCount(p.id);
          return(
            <div key={p.id} className="pm-table-wrap" style={{borderLeft:`4px solid ${sc.color}`}}>
              <div style={{padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                    <span style={{fontSize:16,fontWeight:800,color:'#0f172a'}}>{p.label}</span>
                    <span className={`pm-badge ${sc.cls}`}>{sc.label}</span>
                  </div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>
                    Opened: {p.openedAt?new Date(p.openedAt).toLocaleDateString():'—'}
                    {p.processedAt&&` · Processed: ${new Date(p.processedAt).toLocaleDateString()}`}
                    {p.postedAt&&` · Posted: ${new Date(p.postedAt).toLocaleDateString()} by ${p.postedBy}`}
                  </div>
                </div>

                {cnt > 0 && (
                  <div style={{display:'flex',gap:20}}>
                    {[['Employees',cnt,'#374151'],['Gross Pay',fmtPKRhr(gr),'#0f172a'],['Net Pay',fmtPKRhr(net),ACCENT],['Approved',`${app}/${cnt}`,'#10b981']].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:'center'}}>
                        <div style={{fontSize:11,color:'#94a3b8'}}>{l}</div>
                        <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons based on status */}
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {p.status==='open'&&(
                    <button className="pm-btn pm-btn-primary" style={{background:'#3b82f6'}} onClick={()=>processPayroll(p.id)}>
                      ▶ Run Payroll
                    </button>
                  )}
                  {p.status==='processing'&&app<cnt&&(
                    <button className="pm-btn pm-btn-primary" style={{background:'#f59e0b'}} onClick={()=>approveAllPayroll(p.id)}>
                      ✓ Approve All ({cnt-app} pending)
                    </button>
                  )}
                  {p.status==='processing'&&app===cnt&&cnt>0&&(
                    <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>postPayrollToAccounting(p.id)}>
                      📊 Post to Accounting
                    </button>
                  )}
                  {p.status==='posted'&&(
                    <button className="pm-btn pm-btn-ghost" style={{border:'1px solid #e2e8f0'}} onClick={()=>closePayrollPeriod(p.id)}>
                      Lock & Close
                    </button>
                  )}
                </div>
              </div>

              {/* Period detail: accounting entry info */}
              {p.status==='posted'&&(
                <div style={{background:'#f5f3ff',borderTop:'1px solid #e2e8f0',padding:'10px 18px',fontSize:12.5,color:'#4c1d95'}}>
                  <strong>Posted to Accounting:</strong> Dr Salary Expense {fmtPKRhr(gr)} / Cr Salaries Payable {fmtPKRhr(net)} + statutory deductions · Journal auto-created
                </div>
              )}
            </div>
          );
        })}
        {periods.length===0&&<div className="pm-table-wrap"><div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:13}}>No payroll periods yet — open the first period above</div></div>}
      </div>
    </div>
  );
}
