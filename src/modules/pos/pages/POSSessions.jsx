import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';

const ACCENT = '#f97316';
const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;

export default function POSSessions() {
  const { posSessions, posTerminals, posSales, openPosSession, closePosSession, currentUser, toast } = useApp();
  const [showOpen,    setShowOpen]    = useState(false);
  const [showClose,   setShowClose]   = useState(false);
  const [closingSess, setClosingSess] = useState(null);
  const [terminalId,  setTerminalId]  = useState(posTerminals?.[0]?.id || '');
  const [openingBal,  setOpeningBal]  = useState('');
  const [closingBal,  setClosingBal]  = useState('');
  const [page, setPage] = useState(1);
  const PER = 12;

  const sessions  = [...(posSessions||[])].sort((a,b)=>new Date(b.openedAt)-new Date(a.openedAt));
  const terminals = posTerminals || [];
  const sales     = posSales     || [];

  const pages = Math.ceil(sessions.length / PER);
  const paged  = sessions.slice((page-1)*PER, page*PER);

  function sessionSales(sessId) { return sales.filter(s=>s.sessionId===sessId&&s.status==='posted'); }

  function handleOpen() {
    if (!terminalId) { toast('Select a terminal','error'); return; }
    const existing = sessions.find(s=>s.terminalId===terminalId&&s.status==='open');
    if (existing) { toast('A shift is already open for this terminal','error'); return; }
    openPosSession(terminalId, parseFloat(openingBal)||0);
    setShowOpen(false); setOpeningBal('');
    toast('Shift opened successfully','success');
  }

  function handleClose() {
    if (!closingSess) return;
    closePosSession(closingSess.id, parseFloat(closingBal)||0);
    const sessIncome = sessionSales(closingSess.id).reduce((s,x)=>s+(x.grandTotal||0),0);
    const expected   = (closingSess.openingBalance||0) + sessIncome;
    const actual     = parseFloat(closingBal)||0;
    const variance   = actual - expected;
    setShowClose(false); setClosingSess(null); setClosingBal('');
    if (Math.abs(variance) > 0) toast(`Shift closed — variance: ${fmtPKR(Math.abs(variance))} ${variance>=0?'surplus':'shortage'}`, variance>=0?'success':'error');
    else toast('Shift closed — cash balanced','success');
  }

  const openSessions   = sessions.filter(s=>s.status==='open');
  const closedSessions = sessions.filter(s=>s.status==='closed');
  const totalRevenue   = sessions.reduce((s,x)=>s+(x.totalSales||0),0);
  const totalTxns      = sessions.reduce((s,x)=>s+(x.totalTransactions||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Shift Management</h2><p className="pm-page-sub">Open and close POS shifts, reconcile cash, view session summaries</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline" onClick={()=>setShowOpen(true)}><Icon name="plus" size={13}/> Open Shift</button>
        </div>
      </div>

      {openSessions.length > 0 && (
        <div style={{background:'#f0fdf4',border:'1px solid #a7f3d0',borderRadius:10,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 0 3px #bbf7d0'}}/>
            <span style={{fontSize:13,fontWeight:600,color:'#065f46'}}>{openSessions.length} shift{openSessions.length>1?'s':''} currently open</span>
          </div>
          <div style={{display:'flex',gap:8}}>
            {openSessions.map(s=>{
              const term=terminals.find(t=>t.id===s.terminalId);
              return(
                <div key={s.id} style={{background:'#fff',borderRadius:8,padding:'8px 14px',display:'flex',alignItems:'center',gap:12,border:'1px solid #a7f3d0'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'#0f172a'}}>{term?.name||s.terminalId}</div>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{s.cashierName} · {new Date(s.openedAt).toLocaleTimeString()}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:12,fontWeight:700,color:ACCENT}}>{fmtPKR(s.totalSales)}</div>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{s.totalTransactions} txns</div>
                  </div>
                  <button className="pm-btn pm-btn-ghost" style={{fontSize:11,padding:'4px 10px',border:'1px solid #fecaca',color:'#ef4444'}} onClick={()=>{setClosingSess(s);setClosingBal('');setShowClose(true);}}>Close</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Sessions',value:sessions.length,icon:'briefcase',bg:'#fff7ed',color:ACCENT},{label:'Open Now',value:openSessions.length,icon:'store',bg:'#f0fdf4',color:'#10b981'},{label:'Total Revenue',value:fmtPKR(totalRevenue),icon:'trending',bg:'#fff7ed',color:ACCENT},{label:'Total Transactions',value:totalTxns,icon:'invoice',bg:'#eff6ff',color:'#3b82f6'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">All Shifts ({sessions.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Session ID</th><th>Terminal</th><th>Cashier</th><th>Opened</th><th>Closed</th><th style={{textAlign:'right'}}>Opening Bal</th><th style={{textAlign:'right'}}>Sales</th><th style={{textAlign:'right'}}>Transactions</th><th style={{textAlign:'right'}}>Closing Bal</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={11} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No sessions yet</td></tr>
              :paged.map(s=>{
                const term=terminals.find(t=>t.id===s.terminalId);
                const variance=(s.closingBalance||0)-((s.openingBalance||0)+(s.totalSales||0));
                return(<tr key={s.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{s.id}</td>
                  <td style={{fontSize:12,color:'#374151',fontWeight:500}}>{term?.name||s.terminalId}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{s.cashierName}</td>
                  <td style={{fontSize:11,color:'#9ca3af'}}>{new Date(s.openedAt).toLocaleString()}</td>
                  <td style={{fontSize:11,color:'#9ca3af'}}>{s.closedAt?new Date(s.closedAt).toLocaleString():'—'}</td>
                  <td style={{textAlign:'right'}}>{fmtPKR(s.openingBalance)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:ACCENT}}>{fmtPKR(s.totalSales)}</td>
                  <td style={{textAlign:'right',fontWeight:600}}>{s.totalTransactions}</td>
                  <td style={{textAlign:'right',fontWeight:600,color:s.closingBalance!=null?(Math.abs(variance)<1?'#10b981':variance>0?'#10b981':'#ef4444'):'#94a3b8'}}>{s.closingBalance!=null?fmtPKR(s.closingBalance):'—'}</td>
                  <td><span className={`pm-badge ${s.status==='open'?'pm-badge-green':'pm-badge-gray'}`}>{s.status}</span></td>
                  <td>{s.status==='open'&&<button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11,color:'#ef4444',border:'1px solid #fecaca'}} onClick={()=>{setClosingSess(s);setClosingBal('');setShowClose(true);}}>Close</button>}</td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {/* Open Shift Modal */}
      {showOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,.25)',overflow:'hidden'}}>
            <div style={{background:ACCENT,padding:'20px 24px'}}>
              <div style={{fontSize:18,fontWeight:800,color:'#fff'}}>Open New Shift</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',marginTop:4}}>Count and record your opening cash</div>
            </div>
            <div style={{padding:24}}>
              <div className="pm-form-group" style={{marginBottom:16}}>
                <label>Terminal</label>
                <select value={terminalId} onChange={e=>setTerminalId(e.target.value)}>
                  {terminals.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="pm-form-group" style={{marginBottom:20}}>
                <label>Opening Cash Balance</label>
                <input type="number" value={openingBal} onChange={e=>setOpeningBal(e.target.value)} placeholder="Count cash in drawer" autoFocus style={{fontSize:18,fontWeight:700}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="pm-btn pm-btn-ghost" style={{flex:1}} onClick={()=>setShowOpen(false)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{flex:2,background:'#10b981'}} onClick={handleOpen}>Open Shift</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showClose&&closingSess&&(()=>{
        const sessIncome=sessionSales(closingSess.id).reduce((s,x)=>s+(x.grandTotal||0),0);
        const expected=(closingSess.openingBalance||0)+sessIncome;
        const actual=parseFloat(closingBal)||0;
        const variance=actual-expected;
        return(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
            <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,.25)',overflow:'hidden'}}>
              <div style={{background:'#0f172a',padding:'20px 24px'}}>
                <div style={{fontSize:18,fontWeight:800,color:'#fff'}}>Close Shift</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:4}}>{terminals.find(t=>t.id===closingSess.terminalId)?.name||''} · {closingSess.cashierName}</div>
              </div>
              <div style={{padding:24}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                  {[['Opening Balance',fmtPKR(closingSess.openingBalance)],['Sales Revenue',fmtPKR(sessIncome)],['Expected Cash',fmtPKR(expected)],['Transactions',closingSess.totalTransactions]].map(([l,v])=>(
                    <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,color:'#94a3b8'}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{v}</div></div>
                  ))}
                </div>
                <div className="pm-form-group" style={{marginBottom:12}}>
                  <label>Actual Cash Count</label>
                  <input type="number" value={closingBal} onChange={e=>setClosingBal(e.target.value)} placeholder={String(expected)} autoFocus style={{fontSize:18,fontWeight:700}}/>
                </div>
                {closingBal&&(
                  <div style={{background:Math.abs(variance)<1?'#f0fdf4':variance>0?'#f0fdf4':'#fef2f2',borderRadius:8,padding:'10px 14px',marginBottom:14,display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:13,color:'#374151'}}>Variance</span>
                    <span style={{fontSize:15,fontWeight:800,color:Math.abs(variance)<1?'#10b981':variance>0?'#10b981':'#ef4444'}}>{variance>=0?'+':''}{fmtPKR(variance)}</span>
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  <button className="pm-btn pm-btn-ghost" style={{flex:1}} onClick={()=>{setShowClose(false);setClosingSess(null);}}>Cancel</button>
                  <button className="pm-btn pm-btn-primary" style={{flex:2,background:'#ef4444'}} onClick={handleClose}>Close Shift</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
