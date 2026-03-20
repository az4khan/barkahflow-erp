import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?760:520,maxHeight:'94vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function DistTripSettlement() {
  const { trips, settlements, invMaterials, settleTrip, toast } = useApp();
  const [viewSettl,   setViewSettl]   = useState(null);
  const [settlingTrip,setSettlingTrip]= useState(null);
  const [search,      setSearch]      = useState('');
  const [tab,         setTab]         = useState('pending'); // pending | settled
  const [page,        setPage]        = useState(1);
  const PER = 10;

  const allTrips  = trips      || [];
  const settles   = settlements|| [];
  const mats      = invMaterials||[];

  const pendingTrips  = allTrips.filter(t=>t.status==='returning');
  const settledTrips  = allTrips.filter(t=>t.status==='settled');

  // Settlement form state
  const [sf, setSf] = useState({ cashSubmitted:0, emptiesReturned:0, expenses:0, expenseNotes:'', undeliveredItems:[], driverNote:'' });

  function openSettle(trip) {
    setSettlingTrip(trip);
    // Auto-populate from trip data
    setSf({
      cashSubmitted:  trip.cashCollected || trip.cashExpected || 0,
      emptiesReturned:trip.emptiesReturned || 0,
      expenses:       trip.expenses || 0,
      expenseNotes:   '',
      undeliveredItems: trip.undeliveredQty > 0 ? [] : [],
      driverNote:     '',
    });
  }

  function handleSettle() {
    if (!settlingTrip) return;
    settleTrip(settlingTrip.id, {
      cashSubmitted:    parseFloat(sf.cashSubmitted)||0,
      cashExpected:     settlingTrip.cashExpected||0,
      emptiesReturned:  parseInt(sf.emptiesReturned)||0,
      emptiesExpected:  settlingTrip.emptiesOut||0,
      expenses:         parseFloat(sf.expenses)||0,
      expenseNotes:     sf.expenseNotes,
      undeliveredItems: sf.undeliveredItems,
      variance:         (parseFloat(sf.cashSubmitted)||0) - (settlingTrip.cashExpected||0),
      driverNote:       sf.driverNote,
      warehouseId:      settlingTrip.warehouseId||'WH-001',
    });
    setSettlingTrip(null);
  }

  const displayed = tab==='pending' ? pendingTrips : settledTrips;
  const filtered  = displayed.filter(t=>!search||(t.id||'').toLowerCase().includes(search.toLowerCase())||(t.driverName||'').toLowerCase().includes(search.toLowerCase())||(t.routeName||'').toLowerCase().includes(search.toLowerCase()));
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const totalCashSettled   = settles.reduce((s,x)=>s+(x.cashSubmitted||0),0);
  const totalVariance      = settles.reduce((s,x)=>s+(x.variance||0),0);
  const totalExpenses      = settles.reduce((s,x)=>s+(x.expenses||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Trip Settlement</h2><p className="pm-page-sub">Reconcile cash, empties, expenses — journals and stock auto-posted</p></div>
        <div className="pm-page-actions">
          {pendingTrips.length>0&&<span style={{fontSize:12,fontWeight:600,background:'#fffbeb',color:'#f59e0b',padding:'5px 14px',borderRadius:20,border:'1px solid #fde68a'}}>{pendingTrips.length} awaiting settlement</span>}
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Pending Settlement',value:pendingTrips.length,icon:'bell',bg:'#fffbeb',color:'#f59e0b'},{label:'Total Settled',value:settles.length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Cash Collected',value:fmtPKRd(totalCashSettled),icon:'store',bg:'#f0fdf4',color:'#10b981'},{label:'Net Variance',value:fmtPKRd(Math.abs(totalVariance)),icon:'breakdown',bg:totalVariance<0?'#fef2f2':'#f0fdf4',color:totalVariance<0?ACCENT:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>{setTab('pending');setPage(1);}} style={{padding:'6px 16px',borderRadius:8,border:'2px solid',fontSize:13,fontWeight:600,cursor:'pointer',background:tab==='pending'?'#f59e0b':'#fff',color:tab==='pending'?'#fff':'#6b7280',borderColor:tab==='pending'?'#f59e0b':'#e5e7eb'}}>
              Pending ({pendingTrips.length})
            </button>
            <button onClick={()=>{setTab('settled');setPage(1);}} style={{padding:'6px 16px',borderRadius:8,border:'2px solid',fontSize:13,fontWeight:600,cursor:'pointer',background:tab==='settled'?'#10b981':'#fff',color:tab==='settled'?'#fff':'#6b7280',borderColor:tab==='settled'?'#10b981':'#e5e7eb'}}>
              Settled ({settledTrips.length})
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search trip, driver, route…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>Trip ID</th><th>Date</th><th>Driver</th><th>Route</th><th>Vehicle</th><th style={{textAlign:'right'}}>Cylinders Out</th><th style={{textAlign:'right'}}>Cash Expected</th><th style={{textAlign:'right'}}>{tab==='settled'?'Cash Collected':'Status'}</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>{tab==='pending'?'No trips awaiting settlement':'No settled trips'}</td></tr>
              :paged.map(t=>(
                <tr key={t.id} style={{background:tab==='pending'?'#fffcf0':undefined}}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{t.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.date}</td>
                  <td style={{fontWeight:600}}>{t.driverName}</td>
                  <td style={{color:'#6b7280',fontSize:12}}>{t.routeName}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.vehicleReg}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{t.emptiesOut||0}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:'#374151'}}>{fmtPKRd(t.cashExpected)}</td>
                  <td style={{textAlign:'right'}}>
                    {tab==='settled'
                      ? <span style={{fontWeight:700,color:'#10b981'}}>{fmtPKRd(t.cashCollected)}</span>
                      : <span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:'#fffbeb',color:'#f59e0b'}}>Returning</span>
                    }
                  </td>
                  <td>
                    {tab==='pending'
                      ? <button className="pm-btn pm-btn-primary" style={{background:ACCENT,padding:'4px 12px',fontSize:12,fontWeight:700}} onClick={()=>openSettle(t)}>Settle ↓</button>
                      : <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>setViewSettl(settles.find(s=>s.tripId===t.id))}>View</button>
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {/* Settlement Modal */}
      {settlingTrip&&(
        <Modal title={`Settle Trip: ${settlingTrip.id}`} onClose={()=>setSettlingTrip(null)} wide>
          {/* Trip summary */}
          <div style={{background:'#0f172a',borderRadius:10,padding:'14px 18px',marginBottom:16,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
            {[['Driver',settlingTrip.driverName],['Route',settlingTrip.routeName],['Vehicle',settlingTrip.vehicleReg],['Date',settlingTrip.date]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{v}</div></div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            {/* Cash reconciliation */}
            <div style={{background:'#f8fafc',borderRadius:10,padding:'14px'}}>
              <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:12}}>Cash Reconciliation</div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
                <span style={{color:'#6b7280'}}>Expected Cash</span>
                <span style={{fontWeight:700,color:'#0f172a'}}>{fmtPKRd(settlingTrip.cashExpected)}</span>
              </div>
              <div className="pm-form-group" style={{margin:'12px 0 8px'}}>
                <label style={{fontSize:12}}>Cash Submitted by Driver *</label>
                <input type="number" value={sf.cashSubmitted} onChange={e=>setSf(s=>({...s,cashSubmitted:e.target.value}))} style={{fontSize:18,fontWeight:700}}/>
              </div>
              {sf.cashSubmitted&&(
                <div style={{padding:'8px 12px',borderRadius:7,background:(parseFloat(sf.cashSubmitted)||0)>=settlingTrip.cashExpected?'#f0fdf4':'#fef2f2',fontSize:13}}>
                  <span style={{color:'#374151'}}>Variance: </span>
                  <strong style={{color:(parseFloat(sf.cashSubmitted)||0)>=settlingTrip.cashExpected?'#10b981':'#ef4444'}}>
                    {fmtPKRd(Math.abs((parseFloat(sf.cashSubmitted)||0)-settlingTrip.cashExpected))} {(parseFloat(sf.cashSubmitted)||0)>=settlingTrip.cashExpected?'surplus':'shortage'}
                  </strong>
                </div>
              )}
            </div>

            {/* Empties & Expenses */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{background:'#f8fafc',borderRadius:10,padding:'14px'}}>
                <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10}}>Empty Cylinders Returned</div>
                <div style={{display:'flex',gap:10,alignItems:'center',fontSize:13,marginBottom:8}}>
                  <span style={{color:'#6b7280'}}>Sent out: <strong>{settlingTrip.emptiesOut||0}</strong></span>
                </div>
                <div className="pm-form-group" style={{margin:0}}>
                  <label style={{fontSize:12}}>Empties Returned</label>
                  <input type="number" value={sf.emptiesReturned} onChange={e=>setSf(s=>({...s,emptiesReturned:e.target.value}))}/>
                </div>
                {parseInt(sf.emptiesReturned)<(settlingTrip.emptiesOut||0)&&(
                  <div style={{fontSize:12,color:'#f59e0b',marginTop:6}}>⚠ {(settlingTrip.emptiesOut||0)-parseInt(sf.emptiesReturned||0)} empties short</div>
                )}
              </div>
              <div style={{background:'#f8fafc',borderRadius:10,padding:'14px'}}>
                <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10}}>Trip Expenses</div>
                <div className="pm-form-group" style={{margin:'0 0 8px'}}><label style={{fontSize:12}}>Total Expenses (Rs)</label><input type="number" value={sf.expenses} onChange={e=>setSf(s=>({...s,expenses:e.target.value}))}/></div>
                <div className="pm-form-group" style={{margin:0}}><label style={{fontSize:12}}>Expense Details</label><input value={sf.expenseNotes} onChange={e=>setSf(s=>({...s,expenseNotes:e.target.value}))} placeholder="Fuel, toll, etc."/></div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{background:'#0f172a',borderRadius:10,padding:'14px 18px',marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:13,color:'rgba(255,255,255,0.7)',marginBottom:12}}>Settlement Summary</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[['Cash Submitted',fmtPKRd(parseFloat(sf.cashSubmitted)||0),'#10b981'],['Expenses Claimed',fmtPKRd(parseFloat(sf.expenses)||0),'#f59e0b'],['Net Cash to Cashier',fmtPKRd((parseFloat(sf.cashSubmitted)||0)-(parseFloat(sf.expenses)||0)),'#60a5fa'],['Empties Returned',`${sf.emptiesReturned||0}/${settlingTrip.emptiesOut||0}`,'#a78bfa']].map(([l,v,c])=>(
                <div key={l}><div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginBottom:3}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div></div>
              ))}
            </div>
          </div>

          <div className="pm-form-group" style={{marginBottom:16}}>
            <label>Driver Note / Remarks</label>
            <textarea value={sf.driverNote} onChange={e=>setSf(s=>({...s,driverNote:e.target.value}))} rows={2} placeholder="Any issues during trip…" style={{resize:'vertical'}}/>
          </div>

          <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#065f46',marginBottom:14}}>
            <strong>Auto-posts:</strong> Cash collection journal (Dr Cash / Cr AR) · Expense journal · Undelivered stock restored to warehouse
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setSettlingTrip(null)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT,fontWeight:700}} onClick={handleSettle}>✓ Complete Settlement</button>
          </div>
        </Modal>
      )}

      {/* View settled settlement */}
      {viewSettl&&(
        <Modal title={`Settlement: ${viewSettl.id}`} onClose={()=>setViewSettl(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
            {[['Trip',viewSettl.tripId],['Driver',viewSettl.driverName],['Route',viewSettl.routeName],['Date',viewSettl.date],['Cash Expected',fmtPKRd(viewSettl.cashExpected)],['Cash Submitted',fmtPKRd(viewSettl.cashSubmitted)],['Variance',fmtPKRd(Math.abs(viewSettl.variance||0))],['Empties Out',viewSettl.emptiesExpected],['Empties Returned',viewSettl.emptiesReturned],['Expenses',fmtPKRd(viewSettl.expenses)],['Net to Cashier',fmtPKRd((viewSettl.cashSubmitted||0)-(viewSettl.expenses||0))],['Settled By',viewSettl.createdBy]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'9px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>
          {viewSettl.driverNote&&<div style={{background:'#fffbeb',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:12}}>{viewSettl.driverNote}</div>}
          <div style={{display:'flex',justifyContent:'flex-end'}}><button className="pm-btn pm-btn-ghost" onClick={()=>setViewSettl(null)}>Close</button></div>
        </Modal>
      )}
    </div>
  );
}
