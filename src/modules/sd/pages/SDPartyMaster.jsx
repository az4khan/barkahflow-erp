import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd, TIER_COLOR } from '../sdConstants';
import { SD_PARTY_TIERS } from '../../../data/mockData';

const ACCENT = '#10b981';

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?720:520,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button>
        </div>
        <div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
}

const emptyForm = () => ({ code:'',name:'',tier:'Wholesaler',parentId:'',phone:'',email:'',city:'',address:'',creditLimit:'',creditDays:'30',isOwned:false,rating:3,status:'active',notes:'' });

export default function SDPartyMaster() {
  const { sdParties, createSdParty, updateSdParty, toggleSdPartyStatus } = useApp();
  const [tierTab,  setTierTab]  = useState('All');
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewPty,  setViewPty]  = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm());
  const [page,     setPage]     = useState(1);
  const PER = 12;

  const pts = sdParties || [];

  const filtered = useMemo(()=>pts.filter(p=>
    (tierTab==='All'||p.tier===tierTab)&&
    (!search||(p.name||'').toLowerCase().includes(search.toLowerCase())||(p.code||'').toLowerCase().includes(search.toLowerCase())||(p.city||'').toLowerCase().includes(search.toLowerCase()))
  ),[pts,tierTab,search]);

  const pages = Math.ceil(filtered.length/PER);
  const paged  = filtered.slice((page-1)*PER,page*PER);

  // Parent options per tier
  const parentTier = { Retailer:'Wholesaler', Shop:'Retailer', Consumer:null };
  const parentOpts = pts.filter(p=>p.tier===parentTier[form.tier]&&p.status==='active');

  function openCreate() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(p)  { setForm({...p,creditLimit:String(p.creditLimit||''),creditDays:String(p.creditDays||30)}); setEditId(p.id); setShowForm(true); }
  function handleSave() {
    if(!form.name||!form.code) return;
    const data={...form,creditLimit:parseFloat(form.creditLimit)||0,creditDays:parseInt(form.creditDays)||30};
    editId ? updateSdParty(editId,data) : createSdParty(data);
    setShowForm(false);
  }

  const tierCount = (t) => pts.filter(p=>p.tier===t).length;
  const totalBalance = pts.reduce((s,p)=>s+(p.balance||0),0);

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h2 className="pm-page-title">Party Master</h2>
          <p className="pm-page-sub">Wholesalers · Retailers · Shops · Consumers — multi-tier channel hierarchy</p>
        </div>
        <div className="pm-page-actions">
          <button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button>
          <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={openCreate}><Icon name="plus" size={14} color="#fff"/> New Party</button>
        </div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {[
          {label:'Total Parties',  value:pts.length,                                    icon:'users',    bg:'#f0fdf4', color:ACCENT},
          ...SD_PARTY_TIERS.map(t=>({label:t+'s', value:tierCount(t), icon:'users', bg:(TIER_COLOR[t]||'#94a3b8')+'18', color:TIER_COLOR[t]||'#94a3b8'})),
          {label:'Total AR Balance',value:fmtPKRsd(totalBalance), icon:'breakdown',                      bg:'#fffbeb', color:'#f59e0b'},
        ].map(s=>(
          <div className="pm-stat-card" key={s.label}>
            <div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div>
            <div className="pm-stat-label">{s.label}</div>
            <div className="pm-stat-value" style={{fontSize:typeof s.value==='string'?14:22}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['All',...SD_PARTY_TIERS].map(t=>(
              <button key={t} onClick={()=>{setTierTab(t);setPage(1);}}
                style={{padding:'5px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',background:tierTab===t?(t==='All'?ACCENT:TIER_COLOR[t]||ACCENT):'#fff',color:tierTab===t?'#fff':(t==='All'?'#6b7280':TIER_COLOR[t]||'#6b7280'),borderColor:tierTab===t?(t==='All'?ACCENT:TIER_COLOR[t]||ACCENT):'#e5e7eb'}}>
                {t}{t!=='All'&&<span style={{marginLeft:5,fontSize:10,opacity:0.8}}>{tierCount(t)}</span>}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:280}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search name, code, city…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>

        <table className="pm-table">
          <thead>
            <tr><th>Code</th><th>Party Name</th><th>Tier</th><th>Parent</th><th>City</th><th style={{textAlign:'right'}}>Credit Limit</th><th style={{textAlign:'right'}}>Balance</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {paged.length===0
              ? <tr><td colSpan={10} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No parties found</td></tr>
              : paged.map(p=>{
                  const parent = pts.find(x=>x.id===p.parentId);
                  const tc = TIER_COLOR[p.tier]||'#94a3b8';
                  return (
                    <tr key={p.id}>
                      <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace'}}>{p.code}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <span style={{fontWeight:600,color:'#0f172a'}}>{p.name}</span>
                          {p.isOwned&&<span style={{fontSize:10,fontWeight:700,background:'#f0fdf4',color:ACCENT,padding:'1px 6px',borderRadius:8}}>OWN</span>}
                        </div>
                        <div style={{fontSize:11,color:'#94a3b8'}}>{p.email}</div>
                      </td>
                      <td><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:10,background:tc+'18',color:tc}}>{p.tier}</span></td>
                      <td style={{color:'#6b7280',fontSize:12}}>{parent?.name||'—'}</td>
                      <td style={{color:'#9ca3af',fontSize:12}}>{p.city}</td>
                      <td style={{textAlign:'right',fontWeight:600}}>{fmtPKRsd(p.creditLimit)}</td>
                      <td style={{textAlign:'right',fontWeight:700,color:(p.balance||0)>0?'#ef4444':'#10b981'}}>{fmtPKRsd(p.balance)}</td>
                      <td style={{fontSize:13}}>{'★'.repeat(p.rating||0)+'☆'.repeat(5-(p.rating||0))}</td>
                      <td><span className={`pm-badge ${p.status==='active'?'pm-badge-green':'pm-badge-gray'}`}>{p.status}</span></td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          <button className="pm-btn pm-btn-ghost" style={{padding:'4px 8px',fontSize:11}} onClick={()=>setViewPty(p)}>View</button>
                          <button className="pm-btn pm-btn-ghost" style={{padding:'4px 8px',fontSize:11}} onClick={()=>openEdit(p)}>Edit</button>
                          <button className="pm-btn pm-btn-ghost" style={{padding:'4px 8px',fontSize:11}} onClick={()=>toggleSdPartyStatus(p.id)}>{p.status==='active'?'Deact.':'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
        {pages>1&&(
          <div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* View */}
      {viewPty&&(
        <Modal title={`${viewPty.code} — ${viewPty.name}`} onClose={()=>setViewPty(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[['Code',viewPty.code],['Tier',viewPty.tier],['City',viewPty.city||'—'],['Phone',viewPty.phone||'—'],['Email',viewPty.email||'—'],['Parent',pts.find(x=>x.id===viewPty.parentId)?.name||'—'],['Credit Limit',fmtPKRsd(viewPty.creditLimit)],['Credit Days',`${viewPty.creditDays} days`],['Balance',fmtPKRsd(viewPty.balance)],['Rating','★'.repeat(viewPty.rating||0)],['Owned',viewPty.isOwned?'Yes':'No'],['Status',viewPty.status]].map(([l,v])=>(
              <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{v}</div>
              </div>
            ))}
          </div>
          {viewPty.address&&<div style={{background:'#fffbeb',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:12}}>{viewPty.address}</div>}
          {viewPty.notes&&<div style={{background:'#f0f9ff',borderRadius:8,padding:'10px 14px',fontSize:13}}>{viewPty.notes}</div>}
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>{setViewPty(null);openEdit(viewPty);}}>Edit</button>
            <button className="pm-btn pm-btn-ghost" onClick={()=>setViewPty(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit */}
      {showForm&&(
        <Modal title={editId?'Edit Party':'New Party'} onClose={()=>setShowForm(false)} wide>
          <div className="pm-form-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div className="pm-form-group"><label>Code *</label><input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="WS-010" disabled={!!editId}/></div>
            <div className="pm-form-group" style={{gridColumn:'span 2'}}><label>Party Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Full company name"/></div>
            <div className="pm-form-group">
              <label>Tier *</label>
              <select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value,parentId:''}))}>
                {SD_PARTY_TIERS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            {parentTier[form.tier]&&(
              <div className="pm-form-group">
                <label>Parent ({parentTier[form.tier]})</label>
                <select value={form.parentId} onChange={e=>setForm(f=>({...f,parentId:e.target.value}))}>
                  <option value="">— None —</option>
                  {parentOpts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="pm-form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+92-42-xxx"/></div>
            <div className="pm-form-group"><label>Email</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="contact@company.com"/></div>
            <div className="pm-form-group"><label>City</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Lahore"/></div>
            <div className="pm-form-group"><label>Credit Limit</label><input type="number" value={form.creditLimit} onChange={e=>setForm(f=>({...f,creditLimit:e.target.value}))} placeholder="0"/></div>
            <div className="pm-form-group"><label>Credit Days</label><input type="number" value={form.creditDays} onChange={e=>setForm(f=>({...f,creditDays:e.target.value}))} placeholder="30"/></div>
            <div className="pm-form-group">
              <label>Rating</label>
              <select value={form.rating} onChange={e=>setForm(f=>({...f,rating:parseInt(e.target.value)}))}>
                {[1,2,3,4,5].map(r=><option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
              </select>
            </div>
            <div className="pm-form-group" style={{display:'flex',alignItems:'center',gap:8,paddingTop:20}}>
              <input type="checkbox" id="isOwned" checked={form.isOwned} onChange={e=>setForm(f=>({...f,isOwned:e.target.checked}))}/>
              <label htmlFor="isOwned" style={{fontSize:13,color:'#374151',cursor:'pointer'}}>Owned Subsidiary</label>
            </div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Address</label><input value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Full address"/></div>
            <div className="pm-form-group" style={{gridColumn:'1/-1'}}><label>Notes</label><textarea value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{resize:'vertical'}}/></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
            <button className="pm-btn pm-btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={handleSave}>{editId?'Save Changes':'Create Party'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
