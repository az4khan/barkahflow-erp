import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';

const ACCENT = '#10b981';

export default function SDCreditControl() {
  const { sdParties, salesInvoices, updateSdParty, toast } = useApp();
  const [editParty, setEditParty] = useState(null);
  const [newLimit,  setNewLimit]  = useState('');
  const [newDays,   setNewDays]   = useState('');
  const [tierF,     setTierF]     = useState('All');
  const [search,    setSearch]    = useState('');

  const pts  = (sdParties||[]).filter(p=>p.status==='active');
  const invs = salesInvoices||[];

  // Compute outstanding per party
  const partyData = pts.map(p=>{
    const outstanding = invs.filter(i=>i.partyId===p.id).reduce((s,i)=>s+((i.grandTotal||0)-(i.paidAmount||0)),0);
    const overdue     = invs.filter(i=>i.partyId===p.id&&i.dueDate&&new Date(i.dueDate)<new Date()).reduce((s,i)=>s+((i.grandTotal||0)-(i.paidAmount||0)),0);
    const utilization = (p.creditLimit||0)>0?Math.round((outstanding/(p.creditLimit||1))*100):0;
    const risk        = overdue>0?'High':utilization>80?'Medium':'Low';
    return{...p,outstanding,overdue,utilization,risk};
  });

  const filtered=partyData.filter(p=>
    (tierF==='All'||p.tier===tierF)&&
    (!search||(p.name||'').toLowerCase().includes(search.toLowerCase())||(p.code||'').toLowerCase().includes(search.toLowerCase()))
  );

  const highRisk=partyData.filter(p=>p.risk==='High').length;
  const medRisk =partyData.filter(p=>p.risk==='Medium').length;
  const totalExposure=partyData.reduce((s,p)=>s+p.outstanding,0);
  const totalOverdue =partyData.reduce((s,p)=>s+p.overdue,0);

  function handleUpdateCredit(){
    if(!editParty)return;
    const data={};
    if(newLimit)data.creditLimit=parseFloat(newLimit)||0;
    if(newDays) data.creditDays=parseInt(newDays)||30;
    updateSdParty(editParty.id,data);
    setEditParty(null);setNewLimit('');setNewDays('');
    toast('Credit terms updated','success');
  }

  const riskColor={High:'#ef4444',Medium:'#f59e0b',Low:'#10b981'};
  const riskBg   ={High:'#fef2f2',Medium:'#fffbeb',Low:'#f0fdf4'};

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Credit Control</h2><p className="pm-page-sub">Monitor credit limits, utilization, and overdue risk per party</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      {/* Alert banners */}
      {highRisk>0&&(
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
          <Icon name="alert" size={18} color="#ef4444"/>
          <span style={{fontSize:13,color:'#991b1b'}}><strong>{highRisk} parties</strong> have overdue balances — immediate follow-up required. Total overdue: <strong>{fmtPKRsd(totalOverdue)}</strong></span>
        </div>
      )}
      {medRisk>0&&(
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <Icon name="bell" size={18} color="#f59e0b"/>
          <span style={{fontSize:13,color:'#92400e'}}><strong>{medRisk} parties</strong> are above 80% credit utilization — monitor closely.</span>
        </div>
      )}

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Exposure',value:fmtPKRsd(totalExposure),icon:'briefcase',bg:'#fffbeb',color:'#f59e0b'},{label:'Total Overdue',value:fmtPKRsd(totalOverdue),icon:'alert',bg:'#fef2f2',color:'#ef4444'},{label:'High Risk',value:highRisk,icon:'bell',bg:'#fef2f2',color:'#ef4444'},{label:'Medium Risk',value:medRisk,icon:'trending',bg:'#fffbeb',color:'#f59e0b'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['All','Wholesaler','Retailer','Shop','Consumer'].map(t=><button key={t} onClick={()=>setTierF(t)} style={{padding:'5px 10px',borderRadius:20,border:'1px solid',fontSize:11.5,cursor:'pointer',background:tierF===t?ACCENT:'#fff',color:tierF===t?'#fff':'#6b7280',borderColor:tierF===t?ACCENT:'#e5e7eb'}}>{t}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search party…" value={search} onChange={e=>setSearch(e.target.value)} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>Code</th><th>Party</th><th>Tier</th><th style={{textAlign:'right'}}>Credit Limit</th><th style={{textAlign:'right'}}>Outstanding</th><th style={{textAlign:'right'}}>Overdue</th><th style={{textAlign:'right'}}>Utilization</th><th>Credit Days</th><th>Risk</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No parties found</td></tr>
              :filtered.sort((a,b)=>b.outstanding-a.outstanding).map(p=>{
                const tc=TIER_COLOR[p.tier]||'#94a3b8';
                const rc=riskColor[p.risk];const rb=riskBg[p.risk];
                return(<tr key={p.id} style={{background:p.risk==='High'?'#fff8f8':undefined}}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{p.code}</td>
                  <td><div style={{fontWeight:600}}>{p.name}</div>{p.isOwned&&<span style={{fontSize:10,background:'#f0fdf4',color:ACCENT,padding:'1px 5px',borderRadius:8}}>OWN</span>}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 7px',borderRadius:10,background:tc+'18',color:tc}}>{p.tier}</span></td>
                  <td style={{textAlign:'right',fontWeight:600}}>{fmtPKRsd(p.creditLimit)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:p.outstanding>0?'#f59e0b':'#10b981'}}>{fmtPKRsd(p.outstanding)}</td>
                  <td style={{textAlign:'right',fontWeight:700,color:p.overdue>0?'#ef4444':'#94a3b8'}}>{p.overdue>0?fmtPKRsd(p.overdue):'—'}</td>
                  <td style={{textAlign:'right'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
                      <div style={{width:60,height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(p.utilization,100)}%`,background:rc,borderRadius:3}}/></div>
                      <span style={{fontWeight:700,color:rc,minWidth:36}}>{p.utilization}%</span>
                    </div>
                  </td>
                  <td style={{color:'#6b7280'}}>{p.creditDays}d</td>
                  <td><span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:10,background:rb,color:rc}}>{p.risk}</span></td>
                  <td><button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11}} onClick={()=>{setEditParty(p);setNewLimit(String(p.creditLimit||''));setNewDays(String(p.creditDays||30));}}>Edit Credit</button></td>
                </tr>);
              })
            }
          </tbody>
        </table>
      </div>

      {editParty&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>Edit Credit Terms</h3>
              <button onClick={()=>setEditParty(null)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',marginBottom:16}}>
                <div style={{fontWeight:600,color:'#0f172a'}}>{editParty.name}</div>
                <div style={{fontSize:12,color:'#94a3b8'}}>Current: Limit {fmtPKRsd(editParty.creditLimit)} · {editParty.creditDays} days</div>
              </div>
              <div className="pm-form-grid">
                <div className="pm-form-group"><label>New Credit Limit (Rs)</label><input type="number" value={newLimit} onChange={e=>setNewLimit(e.target.value)} placeholder={editParty.creditLimit} autoFocus/></div>
                <div className="pm-form-group"><label>Credit Days</label><input type="number" value={newDays} onChange={e=>setNewDays(e.target.value)} placeholder={editParty.creditDays}/></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
                <button className="pm-btn pm-btn-outline" onClick={()=>setEditParty(null)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleUpdateCredit}>Update Credit Terms</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
