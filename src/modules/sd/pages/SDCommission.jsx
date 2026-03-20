import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function SDCommission() {
  const { commissionReps, salesInvoices } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0,7));
  const [selectedRep,   setSelectedRep]   = useState('');

  const reps = commissionReps || [];
  const invs = salesInvoices  || [];

  function repMonthlySales(repId, month) {
    const rep=reps.find(r=>r.id===repId);
    if(!rep)return 0;
    return invs.filter(i=>i.tier===rep.tier&&(i.date||'').startsWith(month)).reduce((s,i)=>s+(i.subTotal||0),0);
  }
  function repCommission(repId, month) {
    const rep=reps.find(r=>r.id===repId);
    if(!rep)return 0;
    return repMonthlySales(repId,month)*(rep.commissionPct/100);
  }

  // Last 6 months for trend
  const monthRange=Array.from({length:6},(_,i)=>{
    const d=new Date();d.setMonth(d.getMonth()-5+i);
    return d.toISOString().slice(0,7);
  });

  const filteredReps = selectedRep ? reps.filter(r=>r.id===selectedRep) : reps;
  const totalComm = filteredReps.reduce((s,r)=>s+repCommission(r.id,selectedMonth),0);
  const totalSales= filteredReps.reduce((s,r)=>s+repMonthlySales(r.id,selectedMonth),0);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Commission Ledger</h2><p className="pm-page-sub">Monthly commission earned vs targets — per sales rep</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div>
          <label style={{fontSize:11,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Month</label>
          <input type="month" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} style={{padding:'7px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none'}}/>
        </div>
        <div>
          <label style={{fontSize:11,fontWeight:600,color:'#94a3b8',display:'block',marginBottom:4}}>Sales Rep</label>
          <select value={selectedRep} onChange={e=>setSelectedRep(e.target.value)} style={{padding:'7px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none'}}>
            <option value="">All Reps</option>
            {reps.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Sales MTD',value:fmtPKRsd(totalSales),icon:'trending',bg:'#f0fdf4',color:ACCENT},{label:'Commission Earned',value:fmtPKRsd(totalComm),icon:'star',bg:'#fffbeb',color:'#f59e0b'},{label:'Reps Shown',value:filteredReps.length,icon:'users',bg:'#eff6ff',color:'#3b82f6'},{label:'Avg Commission Rate',value:`${filteredReps.length>0?(filteredReps.reduce((s,r)=>s+r.commissionPct,0)/filteredReps.length).toFixed(1):0}%`,icon:'briefcase',bg:'#f5f3ff',color:'#8b5cf6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?15:22}}>{s.value}</div></div>
        ))}
      </div>

      {/* Commission table */}
      <div className="pm-table-wrap" style={{marginBottom:14}}>
        <div className="pm-table-header"><div className="pm-table-title">Commission Statement — {selectedMonth}</div></div>
        <table className="pm-table">
          <thead><tr><th>Sales Rep</th><th>Tier</th><th style={{textAlign:'right'}}>Monthly Target</th><th style={{textAlign:'right'}}>Actual Sales</th><th style={{textAlign:'right'}}>Attainment</th><th style={{textAlign:'right'}}>Rate %</th><th style={{textAlign:'right'}}>Commission</th><th>Status</th></tr></thead>
          <tbody>
            {filteredReps.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No reps found</td></tr>
              :filteredReps.map(rep=>{
                const sales=repMonthlySales(rep.id,selectedMonth);
                const comm=repCommission(rep.id,selectedMonth);
                const att=rep.targetMonthly>0?Math.round((sales/rep.targetMonthly)*100):0;
                const tc=TIER_COLOR[rep.tier]||'#94a3b8';
                return(<tr key={rep.id}>
                  <td><div style={{fontWeight:700,color:'#0f172a'}}>{rep.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{rep.email}</div></td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{rep.tier}</span></td>
                  <td style={{textAlign:'right'}}>{fmtPKRsd(rep.targetMonthly)}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:ACCENT}}>{fmtPKRsd(sales)}</td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
                      <div style={{width:60,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(att,100)}%`,background:att>=100?'#10b981':att>=70?'#f59e0b':'#ef4444',borderRadius:3}}/></div>
                      <span style={{fontWeight:700,color:att>=100?'#10b981':att>=70?'#f59e0b':'#ef4444',minWidth:36}}>{att}%</span>
                    </div>
                  </td>
                  <td style={{textAlign:'right',color:'#6b7280'}}>{rep.commissionPct}%</td>
                  <td style={{textAlign:'right',fontWeight:800,color:'#f59e0b',fontSize:14}}>{fmtPKRsd(comm)}</td>
                  <td><span className={`pm-badge ${comm>0?'pm-badge-green':'pm-badge-gray'}`}>{comm>0?'Earned':'No Sales'}</span></td>
                </tr>);
              })
            }
          </tbody>
          {filteredReps.length>0&&(
            <tfoot><tr style={{background:'#f0fdf4',borderTop:'2px solid #e2e8f0'}}>
              <td colSpan={3} style={{fontWeight:700,padding:'10px 16px'}}>Total</td>
              <td style={{textAlign:'right',fontWeight:700,padding:'10px 16px',color:ACCENT}}>{fmtPKRsd(totalSales)}</td>
              <td/><td/>
              <td style={{textAlign:'right',fontWeight:800,padding:'10px 16px',color:'#f59e0b',fontSize:15}}>{fmtPKRsd(totalComm)}</td>
              <td/>
            </tr></tfoot>
          )}
        </table>
      </div>

      {/* 6-month trend */}
      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">6-Month Commission Trend</div></div>
        <table className="pm-table">
          <thead><tr><th>Rep</th>{monthRange.map(m=><th key={m} style={{textAlign:'right'}}>{MONTHS[parseInt(m.split('-')[1])-1]}</th>)}<th style={{textAlign:'right'}}>Total</th></tr></thead>
          <tbody>
            {reps.map(rep=>{
              const monthly=monthRange.map(m=>repCommission(rep.id,m));
              const total=monthly.reduce((s,v)=>s+v,0);
              return(<tr key={rep.id}>
                <td style={{fontWeight:600}}>{rep.name}</td>
                {monthly.map((v,i)=><td key={i} style={{textAlign:'right',color:v>0?'#f59e0b':'#9ca3af',fontWeight:v>0?600:400}}>{v>0?fmtPKRsd(v):'—'}</td>)}
                <td style={{textAlign:'right',fontWeight:800,color:'#f59e0b'}}>{fmtPKRsd(total)}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
