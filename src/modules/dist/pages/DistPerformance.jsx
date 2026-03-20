import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';

export default function DistPerformance() {
  const { distDrivers, trips, settlements, fuelLog } = useApp();

  const drivers  = distDrivers || [];
  const allTrips = trips       || [];
  const settles  = settlements || [];
  const fuel     = fuelLog     || [];

  const driverStats = drivers.map(d=>{
    const dTrips   = allTrips.filter(t=>t.driverId===d.id);
    const dSettles = settles.filter(s=>dTrips.find(t=>t.id===s.tripId));
    const dFuel    = fuel.filter(f=>f.driverId===d.id);
    const totalOut = dTrips.reduce((s,t)=>s+(t.emptiesOut||0),0);
    const totalRet = dSettles.reduce((s,x)=>s+(x.emptiesReturned||0),0);
    const totalVar = dSettles.reduce((s,x)=>s+(x.variance||0),0);
    const cash     = dSettles.reduce((s,x)=>s+(x.cashSubmitted||0),0);
    const fuelCost = dFuel.reduce((s,f)=>s+(f.totalCost||0),0);
    const empRate  = totalOut>0?((totalRet/totalOut)*100).toFixed(1):100;
    const settRate = dTrips.length>0?((dSettles.length/dTrips.length)*100).toFixed(0):0;
    // Score: 40% empty return rate + 30% settlement rate + 30% (no shortage penalty)
    const score=Math.round((parseFloat(empRate)*0.4)+(parseFloat(settRate)*0.3)+((totalVar>=0?100:Math.max(0,100+totalVar/1000))*0.3));
    return{...d,trips:dTrips.length,settled:dSettles.length,cash,fuelCost,totalOut,totalRet,totalVar,empRate,settRate,score};
  });

  const sorted=[...driverStats].sort((a,b)=>b.score-a.score);

  function scoreColor(s){ return s>=85?'#10b981':s>=70?'#f59e0b':'#ef4444'; }
  function scoreBadge(s){ return s>=85?'Excellent':s>=70?'Good':'Needs Improvement'; }

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Driver Performance</h2><p className="pm-page-sub">Composite score — settlement rate, empty returns, cash variance</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      {/* Top performers podium */}
      {sorted.filter(d=>d.trips>0).length>=3&&(
        <div style={{display:'flex',gap:10,marginBottom:20,justifyContent:'center',alignItems:'flex-end'}}>
          {[sorted[1],sorted[0],sorted[2]].filter(Boolean).map((d,i)=>{
            const podPos=[2,1,3][i];
            const heights=['100px','120px','90px'];
            const sc=scoreColor(d.score);
            return(
              <div key={d.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:1,maxWidth:180}}>
                <div style={{fontSize:11,fontWeight:700,color:sc,background:sc+'18',padding:'3px 10px',borderRadius:10}}>{d.score}pts</div>
                <div style={{width:48,height:48,borderRadius:'50%',background:sc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff'}}>{d.name[0]}</div>
                <div style={{textAlign:'center'}}><div style={{fontWeight:700,fontSize:13}}>{d.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{d.trips} trips</div></div>
                <div style={{width:'100%',height:heights[i],background:sc+'20',borderRadius:'8px 8px 0 0',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:32,fontWeight:900,color:sc}}>#{podPos}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Driver Scorecard</div></div>
        <table className="pm-table">
          <thead>
            <tr>
              <th>Rank</th><th>Driver</th><th style={{textAlign:'right'}}>Trips</th>
              <th style={{textAlign:'right'}}>Settlement %</th>
              <th style={{textAlign:'right'}}>Empty Return %</th>
              <th style={{textAlign:'right'}}>Cash Variance</th>
              <th style={{textAlign:'right'}}>Cash Collected</th>
              <th>Score</th><th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {sorted.filter(d=>d.trips>0).length===0
              ?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No trip data yet</td></tr>
              :sorted.filter(d=>d.trips>0).map((d,i)=>{
                const sc=scoreColor(d.score);
                return(<tr key={d.id}>
                  <td style={{fontWeight:800,color:i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':ACCENT,fontSize:16}}>#{i+1}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:sc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{d.name[0]}</div>
                      <div><div style={{fontWeight:600}}>{d.name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{d.assignedRouteId?'Assigned':'Unassigned'}</div></div>
                    </div>
                  </td>
                  <td style={{textAlign:'right',fontWeight:600}}>{d.trips}</td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
                      <div style={{width:50,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(parseFloat(d.settRate),100)}%`,background:parseFloat(d.settRate)>=90?'#10b981':'#f59e0b',borderRadius:3}}/></div>
                      <span style={{fontWeight:700,color:parseFloat(d.settRate)>=90?'#10b981':'#f59e0b',minWidth:36}}>{d.settRate}%</span>
                    </div>
                  </td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
                      <div style={{width:50,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(parseFloat(d.empRate),100)}%`,background:parseFloat(d.empRate)>=95?'#10b981':parseFloat(d.empRate)>=80?'#f59e0b':ACCENT,borderRadius:3}}/></div>
                      <span style={{fontWeight:700,color:parseFloat(d.empRate)>=95?'#10b981':parseFloat(d.empRate)>=80?'#f59e0b':ACCENT,minWidth:36}}>{d.empRate}%</span>
                    </div>
                  </td>
                  <td style={{textAlign:'right',fontWeight:700,color:d.totalVar>=0?'#10b981':ACCENT}}>{d.totalVar>=0?'+':''}{fmtPKRd(d.totalVar)}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#10b981'}}>{fmtPKRd(d.cash)}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:60,height:7,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${d.score}%`,background:sc,borderRadius:4}}/></div>
                      <span style={{fontWeight:800,color:sc,fontSize:14}}>{d.score}</span>
                    </div>
                  </td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:10,background:sc+'18',color:sc}}>{scoreBadge(d.score)}</span></td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>

      <div style={{background:'#f8fafc',borderRadius:10,padding:'14px 18px',marginTop:14,fontSize:12.5,color:'#6b7280'}}>
        <strong style={{color:'#374151'}}>Score Methodology:</strong> Empty Return Rate (40%) + Settlement Rate (30%) + Cash Variance Score (30%). Higher is better. Excellent: 85+, Good: 70–84.
      </div>
    </div>
  );
}
