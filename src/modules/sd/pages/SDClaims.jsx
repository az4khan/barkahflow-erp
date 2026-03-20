import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd } from '../sdConstants';

const ACCENT = '#10b981';
const CLAIM_TYPES = ['Short Delivery','Price Dispute','Quality Claim','Damaged in Transit','Billing Error'];

export default function SDClaims() {
  const { sdParties, salesInvoices } = useApp();
  const [claims, setClaims] = useState([
    { id:'CLM-001', date:'2026-01-15', partyId:'PARTY-002', partyName:'National Gas Distributors', invoiceId:'SINV-00001', type:'Short Delivery', amount:27000, note:'3 cylinders short in delivery', status:'approved', resolvedBy:'Credit Note' },
    { id:'CLM-002', date:'2026-02-20', partyId:'PARTY-009', partyName:'WAPDA (Industrial)',        invoiceId:'SINV-00002', type:'Price Dispute',   amount:15000, note:'Price difference vs PO', status:'pending',  resolvedBy:'' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ partyId:'', invoiceId:'', type:'Short Delivery', amount:'', note:'' });

  const pts  = sdParties    || [];
  const invs = salesInvoices|| [];

  function handleSave() {
    if(!form.partyId||!form.amount)return;
    const party=pts.find(p=>p.id===form.partyId);
    setClaims(prev=>[{...form,id:`CLM-${String(prev.length+1).padStart(3,'0')}`,date:new Date().toISOString().slice(0,10),partyName:party?.name||'',amount:parseFloat(form.amount)||0,status:'pending',resolvedBy:''},...prev]);
    setShowForm(false);
    setForm({partyId:'',invoiceId:'',type:'Short Delivery',amount:'',note:''});
  }

  const totalPending  = claims.filter(c=>c.status==='pending').reduce((s,c)=>s+c.amount,0);
  const totalApproved = claims.filter(c=>c.status==='approved').reduce((s,c)=>s+c.amount,0);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Claims & Adjustments</h2><p className="pm-page-sub">Customer claims — short deliveries, price disputes, quality issues</p></div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>setShowForm(true)}><Icon name="plus" size={14} color="#fff"/> New Claim</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total Claims',value:claims.length,icon:'alert',bg:'#fffbeb',color:'#f59e0b'},{label:'Pending',value:claims.filter(c=>c.status==='pending').length,icon:'bell',bg:'#fef2f2',color:'#ef4444'},{label:'Pending Value',value:fmtPKRsd(totalPending),icon:'briefcase',bg:'#fef2f2',color:'#ef4444'},{label:'Approved Value',value:fmtPKRsd(totalApproved),icon:'check',bg:'#f0fdf4',color:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?16:22}}>{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header"><div className="pm-table-title">Claims ({claims.length})</div></div>
        <table className="pm-table">
          <thead><tr><th>Claim ID</th><th>Date</th><th>Party</th><th>Invoice</th><th>Type</th><th style={{textAlign:'right'}}>Amount</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {claims.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No claims recorded</td></tr>
              :claims.map(c=>(
                <tr key={c.id}>
                  <td style={{fontWeight:700,color:'#f59e0b',fontFamily:'monospace',fontSize:11}}>{c.id}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{c.date}</td>
                  <td style={{fontWeight:600}}>{c.partyName}</td>
                  <td style={{color:'#6b7280',fontFamily:'monospace',fontSize:11}}>{c.invoiceId||'—'}</td>
                  <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:8,background:'#fffbeb',color:'#f59e0b'}}>{c.type}</span></td>
                  <td style={{textAlign:'right',fontWeight:700,color:'#f59e0b'}}>{fmtPKRsd(c.amount)}</td>
                  <td style={{color:'#9ca3af',fontSize:12,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.note}</td>
                  <td><span className={`pm-badge ${c.status==='approved'?'pm-badge-green':c.status==='rejected'?'pm-badge-red':'pm-badge-orange'}`}>{c.status}</span></td>
                  <td>
                    {c.status==='pending'&&(
                      <div style={{display:'flex',gap:4}}>
                        <button className="pm-btn pm-btn-primary" style={{background:'#10b981',padding:'3px 8px',fontSize:11}} onClick={()=>setClaims(p=>p.map(x=>x.id===c.id?{...x,status:'approved',resolvedBy:'Credit Note'}:x))}>Approve</button>
                        <button className="pm-btn pm-btn-ghost" style={{padding:'3px 8px',fontSize:11,color:'#ef4444'}} onClick={()=>setClaims(p=>p.map(x=>x.id===c.id?{...x,status:'rejected'}:x))}>Reject</button>
                      </div>
                    )}
                    {c.status!=='pending'&&<span style={{fontSize:12,color:'#94a3b8'}}>{c.resolvedBy||'—'}</span>}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>New Claim</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div className="pm-form-grid">
                <div className="pm-form-group"><label>Party *</label><select value={form.partyId} onChange={e=>setForm(f=>({...f,partyId:e.target.value}))}><option value="">— Select —</option>{pts.filter(p=>p.status==='active').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div className="pm-form-group"><label>Against Invoice</label><select value={form.invoiceId} onChange={e=>setForm(f=>({...f,invoiceId:e.target.value}))}><option value="">— None —</option>{invs.filter(i=>form.partyId?i.partyId===form.partyId:true).map(i=><option key={i.id} value={i.id}>{i.id}</option>)}</select></div>
                <div className="pm-form-group"><label>Claim Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{CLAIM_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="pm-form-group"><label>Claim Amount *</label><input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0"/></div>
                <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Note / Description</label><textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={3} style={{resize:'vertical'}} placeholder="Describe the claim in detail"/></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
                <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
                <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>Submit Claim</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
