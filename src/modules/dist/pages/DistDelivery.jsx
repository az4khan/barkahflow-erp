import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?680:500,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

const FAIL_REASONS = ['Customer absent','Customer refused','Wrong address','Item not available','Other'];

export default function DistDelivery() {
  const { trips, updateTripStop, updateTrip, toast } = useApp();
  const [selectedTrip, setSelectedTrip] = useState('');
  const [editStop,     setEditStop]     = useState(null);
  const [stopForm,     setStopForm]     = useState({ status:'delivered', cashCollected:0, emptiesReturned:0, failReason:'' });
  const [addStopForm,  setAddStopForm]  = useState(false);
  const [newStop,      setNewStop]      = useState({ partyName:'', address:'', items:[] });

  const activeTrips = (trips||[]).filter(t=>['in_transit','loading'].includes(t.status));
  const trip = activeTrips.find(t=>t.id===selectedTrip) || (activeTrips.length>0&&!selectedTrip?activeTrips[0]:null);

  const stops = trip?.stops||[];
  const delivered  = stops.filter(s=>s.status==='delivered').length;
  const failed     = stops.filter(s=>s.status==='failed').length;
  const pending    = stops.filter(s=>!s.status||s.status==='pending').length;
  const cashSoFar  = stops.reduce((s,st)=>s+(st.cashCollected||0),0);
  const emptiesSoFar=stops.reduce((s,st)=>s+(st.emptiesReturned||0),0);

  function openEditStop(stop) {
    setEditStop(stop);
    setStopForm({ status:stop.status||'pending', cashCollected:stop.cashCollected||0, emptiesReturned:stop.emptiesReturned||0, failReason:stop.failReason||'' });
  }

  function handleUpdateStop() {
    if (!trip||!editStop) return;
    updateTripStop(trip.id, editStop.stopNo, {
      status:         stopForm.status,
      cashCollected:  parseFloat(stopForm.cashCollected)||0,
      emptiesReturned:parseInt(stopForm.emptiesReturned)||0,
      failReason:     stopForm.failReason,
    });
    // Update trip totals
    const updatedStops = stops.map(s => s.stopNo===editStop.stopNo ? { ...s, ...stopForm, cashCollected:parseFloat(stopForm.cashCollected)||0, emptiesReturned:parseInt(stopForm.emptiesReturned)||0 } : s);
    const newCash    = updatedStops.reduce((s,st)=>s+(st.cashCollected||0),0);
    const newEmpties = updatedStops.reduce((s,st)=>s+(st.emptiesReturned||0),0);
    updateTrip(trip.id, { cashCollected:newCash, emptiesReturned:newEmpties });
    setEditStop(null);
    toast('Stop updated','success');
  }

  const progressPct = stops.length>0?Math.round(((delivered+failed)/stops.length)*100):0;

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Delivery Execution</h2><p className="pm-page-sub">Real-time stop-by-stop delivery tracking for active trips</p></div>
      </div>

      {activeTrips.length===0 ? (
        <div className="pm-table-wrap"><div style={{padding:60,textAlign:'center',color:'#94a3b8'}}>
          <div style={{width:60,height:60,borderRadius:16,background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Icon name="truck" size={28} color={ACCENT}/></div>
          <div style={{fontSize:16,fontWeight:600,color:'#374151',marginBottom:6}}>No active trips</div>
          <div style={{fontSize:13}}>Dispatch a load order to create a trip</div>
        </div></div>
      ) : (
        <>
          {/* Trip selector */}
          <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>Active Trip:</span>
            {activeTrips.map(t=>(
              <button key={t.id} onClick={()=>setSelectedTrip(t.id)}
                style={{padding:'6px 16px',borderRadius:8,border:'2px solid',fontSize:12.5,fontWeight:600,cursor:'pointer',background:(trip?.id===t.id||(!selectedTrip&&t===activeTrips[0]))?ACCENT:'#fff',color:(trip?.id===t.id||(!selectedTrip&&t===activeTrips[0]))?'#fff':'#374151',borderColor:(trip?.id===t.id||(!selectedTrip&&t===activeTrips[0]))?ACCENT:'#e5e7eb'}}>
                {t.id} — {t.driverName}
              </button>
            ))}
          </div>

          {trip&&(
            <>
              {/* Trip header */}
              <div style={{background:'#0f172a',borderRadius:12,padding:'16px 20px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                <div style={{display:'flex',gap:24}}>
                  {[['Driver',trip.driverName],['Vehicle',trip.vehicleReg],['Route',trip.routeName]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{v}</div></div>
                  ))}
                </div>
                <div style={{display:'flex',gap:16}}>
                  {[['Delivered',delivered,'#10b981'],['Failed',failed,'#ef4444'],['Pending',pending,'#f59e0b'],['Cash So Far',fmtPKRd(cashSoFar),'#60a5fa']].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:'center'}}><div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div></div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
                  <span style={{color:'#6b7280'}}>Delivery Progress</span>
                  <span style={{fontWeight:700,color:progressPct===100?'#10b981':ACCENT}}>{progressPct}%</span>
                </div>
                <div style={{height:8,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${progressPct}%`,background:progressPct===100?'#10b981':ACCENT,borderRadius:4,transition:'width 0.5s'}}/>
                </div>
              </div>

              {stops.length===0 ? (
                <div className="pm-table-wrap"><div style={{padding:40,textAlign:'center',color:'#94a3b8',fontSize:13}}>No stops defined for this trip — stops are added via load order</div></div>
              ) : (
                <div className="pm-table-wrap">
                  <div className="pm-table-header"><div className="pm-table-title">Delivery Stops ({stops.length})</div></div>
                  <table className="pm-table">
                    <thead><tr><th>#</th><th>Party</th><th>Address</th><th>Items</th><th style={{textAlign:'right'}}>Cash Collected</th><th style={{textAlign:'right'}}>Empties</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {stops.map(s=>(
                        <tr key={s.stopNo} style={{background:s.status==='delivered'?'#f0fdf4':s.status==='failed'?'#fff8f8':undefined}}>
                          <td style={{fontWeight:700,color:ACCENT}}>{s.stopNo}</td>
                          <td style={{fontWeight:600}}>{s.partyName}</td>
                          <td style={{color:'#9ca3af',fontSize:12}}>{s.address}</td>
                          <td style={{fontSize:12,color:'#6b7280'}}>{(s.items||[]).map(i=>`${i.qty}`).join('+')} cyl</td>
                          <td style={{textAlign:'right',fontWeight:s.cashCollected>0?700:400,color:s.cashCollected>0?'#10b981':'#9ca3af'}}>{s.cashCollected>0?fmtPKRd(s.cashCollected):'—'}</td>
                          <td style={{textAlign:'right',color:s.emptiesReturned>0?'#8b5cf6':'#9ca3af',fontWeight:s.emptiesReturned>0?700:400}}>{s.emptiesReturned||0}</td>
                          <td>
                            <span className={`pm-badge ${s.status==='delivered'?'pm-badge-green':s.status==='failed'?'pm-badge-red':'pm-badge-gray'}`}>{s.status||'pending'}</span>
                            {s.failReason&&<div style={{fontSize:10,color:'#9ca3af'}}>{s.failReason}</div>}
                          </td>
                          <td>
                            <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>openEditStop(s)}>
                              {s.status==='delivered'?'Edit':'Update'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {editStop&&trip&&(
        <Modal title={`Stop ${editStop.stopNo} — ${editStop.partyName}`} onClose={()=>setEditStop(null)}>
          <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:2}}>{editStop.address}</div>
            <div style={{fontSize:12,color:'#94a3b8'}}>Items: {(editStop.items||[]).map(i=>`${i.qty} cyl`).join(', ')}</div>
          </div>

          <div className="pm-form-group" style={{marginBottom:12}}>
            <label>Delivery Status</label>
            <div style={{display:'flex',gap:8,marginTop:4}}>
              {[['delivered','✓ Delivered','#10b981'],['failed','✗ Failed','#ef4444'],['pending','⏳ Pending','#94a3b8']].map(([v,l,c])=>(
                <button key={v} onClick={()=>setStopForm(f=>({...f,status:v}))}
                  style={{flex:1,padding:'9px',borderRadius:8,border:`2px solid ${stopForm.status===v?c:'#e2e8f0'}`,background:stopForm.status===v?c+'18':'#fff',color:stopForm.status===v?c:'#6b7280',cursor:'pointer',fontWeight:600,fontSize:12}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {stopForm.status==='delivered'&&(
            <>
              <div className="pm-form-group" style={{marginBottom:12}}>
                <label>Cash Collected (Rs)</label>
                <input type="number" value={stopForm.cashCollected} onChange={e=>setStopForm(f=>({...f,cashCollected:e.target.value}))} placeholder="0" autoFocus style={{fontSize:18,fontWeight:700}}/>
              </div>
              <div className="pm-form-group" style={{marginBottom:16}}>
                <label>Empty Cylinders Returned</label>
                <input type="number" value={stopForm.emptiesReturned} onChange={e=>setStopForm(f=>({...f,emptiesReturned:e.target.value}))} placeholder="0"/>
              </div>
            </>
          )}

          {stopForm.status==='failed'&&(
            <div className="pm-form-group" style={{marginBottom:16}}>
              <label>Reason for Failure</label>
              <select value={stopForm.failReason} onChange={e=>setStopForm(f=>({...f,failReason:e.target.value}))}>
                <option value="">— Select reason —</option>
                {FAIL_REASONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setEditStop(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleUpdateStop}>Update Stop</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
