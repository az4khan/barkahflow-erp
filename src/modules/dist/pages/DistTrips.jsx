import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { STATUS_COLOR, fmtPKRd } from '../distConstants';

const ACCENT = '#ef4444';
function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?740:520,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function DistTrips() {
  const { trips, returnTrip } = useApp();
  const [search,   setSearch]   = useState('');
  const [stFilter, setStFilter] = useState('All');
  const [viewTrip, setViewTrip] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const allTrips = trips || [];
  const filtered = allTrips.filter(t=>{
    const q=search.toLowerCase();
    return(stFilter==='All'||t.status===stFilter)&&
      (!search||(t.id||'').toLowerCase().includes(q)||(t.driverName||'').toLowerCase().includes(q)||(t.routeName||'').toLowerCase().includes(q))&&
      (!dateFrom||t.date>=dateFrom)&&(!dateTo||t.date<=dateTo);
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  const STATUSES=['All','planned','loading','in_transit','returning','settled','cancelled'];
  const totalCylinders=allTrips.reduce((s,t)=>s+(t.emptiesOut||0),0);
  const totalSettled=allTrips.filter(t=>t.status==='settled').reduce((s,t)=>s+(t.cashCollected||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Trip Sheets</h2><p className="pm-page-sub">All trips — auto-created on load order dispatch</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[{label:'Total Trips',value:allTrips.length,icon:'briefcase',bg:'#fef2f2',color:ACCENT},{label:'In Transit',value:allTrips.filter(t=>t.status==='in_transit').length,icon:'truck',bg:'#eff6ff',color:'#3b82f6'},{label:'Returning',value:allTrips.filter(t=>t.status==='returning').length,icon:'trending',bg:'#fffbeb',color:'#f59e0b'},{label:'Settled',value:allTrips.filter(t=>t.status==='settled').length,icon:'check',bg:'#f0fdf4',color:'#10b981'},{label:'Cash Collected',value:fmtPKRd(totalSettled),icon:'store',bg:'#f0fdf4',color:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {STATUSES.map(s=><button key={s} onClick={()=>{setStFilter(s);setPage(1);}} style={{padding:'5px 10px',borderRadius:20,border:'1px solid',fontSize:11,fontWeight:500,cursor:'pointer',background:stFilter===s?ACCENT:'#fff',color:stFilter===s?'#fff':'#6b7280',borderColor:stFilter===s?ACCENT:'#e5e7eb',textTransform:'capitalize'}}>{s.replace('_',' ')}</button>)}
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
            <span style={{color:'#94a3b8',fontSize:12}}>—</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e2e8f0',borderRadius:7,fontSize:12,outline:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'5px 10px'}}>
              <Icon name="search" size={13} color="#94a3b8"/>
              <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12,outline:'none',width:140}}/>
            </div>
          </div>
        </div>

        <table className="pm-table">
          <thead><tr><th>Trip ID</th><th>Date</th><th>Driver</th><th>Route</th><th>Vehicle</th><th style={{textAlign:'right'}}>Cyl Out</th><th style={{textAlign:'right'}}>Cash Expected</th><th style={{textAlign:'right'}}>Collected</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No trips found</td></tr>
              :paged.map(t=>{
                const sc=STATUS_COLOR[t.status]||'#94a3b8';
                return(<tr key={t.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{t.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.date}</td>
                  <td style={{fontWeight:600}}>{t.driverName}</td>
                  <td style={{color:'#6b7280',fontSize:12,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.routeName}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{t.vehicleReg}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{t.emptiesOut||0}</td>
                  <td style={{textAlign:'right',color:'#374151'}}>{fmtPKRd(t.cashExpected)}</td>
                  <td style={{textAlign:'right',fontWeight:t.cashCollected>0?700:400,color:t.cashCollected>0?'#10b981':'#9ca3af'}}>{t.cashCollected>0?fmtPKRd(t.cashCollected):'—'}</td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:sc+'18',color:sc}}>{t.status.replace('_',' ')}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewTrip(t)}>View</button>
                      {t.status==='in_transit'&&<button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6',padding:'3px 7px',fontSize:11}} onClick={()=>returnTrip(t.id)}>← Return</button>}
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {viewTrip&&(
        <Modal title={`Trip Sheet: ${viewTrip.id}`} onClose={()=>setViewTrip(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
            {[['Date',viewTrip.date],['Driver',viewTrip.driverName],['Vehicle',viewTrip.vehicleReg],['Route',viewTrip.routeName],['Departure',viewTrip.departureTime?new Date(viewTrip.departureTime).toLocaleString():'—'],['Return',viewTrip.returnTime?new Date(viewTrip.returnTime).toLocaleString():'—'],['Status',viewTrip.status.replace('_',' ')],['Load Order',viewTrip.loadOrderId||'—']].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:12.5,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
            {[['Cylinders Out',viewTrip.emptiesOut||0,'#ef4444'],['Empties Returned',viewTrip.emptiesReturned||0,'#10b981'],['Undelivered',viewTrip.undeliveredQty||0,'#f59e0b'],['Cash Expected',fmtPKRd(viewTrip.cashExpected),'#374151'],['Cash Collected',fmtPKRd(viewTrip.cashCollected),'#10b981'],['Expenses',fmtPKRd(viewTrip.expenses),'#f59e0b']].map(([l,v,c])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',textAlign:'center'}}><div style={{fontSize:11,color:'#94a3b8',marginBottom:4}}>{l}</div><div style={{fontSize:16,fontWeight:800,color:c}}>{typeof v==='string'?v:v}</div></div>
            ))}
          </div>

          {viewTrip.stops?.length>0&&(
            <>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Delivery Stops</div>
              <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
                <thead><tr><th>#</th><th>Party</th><th>Address</th><th style={{textAlign:'right'}}>Cash</th><th style={{textAlign:'right'}}>Empties</th><th>Status</th></tr></thead>
                <tbody>
                  {viewTrip.stops.map(s=><tr key={s.stopNo}><td style={{color:'#94a3b8'}}>{s.stopNo}</td><td style={{fontWeight:600}}>{s.partyName}</td><td style={{color:'#9ca3af',fontSize:12}}>{s.address}</td><td style={{textAlign:'right',fontWeight:600,color:'#10b981'}}>{s.cashCollected>0?fmtPKRd(s.cashCollected):'—'}</td><td style={{textAlign:'right'}}>{s.emptiesReturned||0}</td><td><span className={`pm-badge ${s.status==='delivered'?'pm-badge-green':s.status==='failed'?'pm-badge-red':'pm-badge-gray'}`}>{s.status}</span>{s.failReason&&<div style={{fontSize:10,color:'#9ca3af',marginTop:2}}>{s.failReason}</div>}</td></tr>)}
                </tbody>
              </table>
            </>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            {viewTrip.status==='in_transit'&&<button className="pm-btn pm-btn-primary" style={{background:'#8b5cf6'}} onClick={()=>{returnTrip(viewTrip.id);setViewTrip(null);}}>Mark as Returning</button>}
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewTrip(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
