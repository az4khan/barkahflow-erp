import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { fmtPKRsd } from '../sdConstants';

const ACCENT = '#10b981';
const STATUS_CFG={pending:{cls:'pm-badge-gray',label:'Pending'},in_transit:{cls:'pm-badge-orange',label:'In Transit'},delivered:{cls:'pm-badge-green',label:'Delivered'},cancelled:{cls:'pm-badge-red',label:'Cancelled'}};

function Modal({title,onClose,children,wide}){return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?700:500,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}><div style={{padding:'18px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}><h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#94a3b8'}}>×</button></div><div style={{padding:24,overflowY:'auto',flex:1}}>{children}</div></div></div>);}

export default function SDDeliveryOrders() {
  const { deliveryOrders, salesOrders, salesInvoices, warehouses, invMaterials, createSalesInvoice, deliverOrder, sdParties, toast } = useApp();
  const [search,  setSearch]  = useState('');
  const [stFilter,setStFilter]= useState('All');
  const [viewDO,  setViewDO]  = useState(null);
  const [showInvForm, setShowInvForm] = useState(false);
  const [invDO, setInvDO] = useState(null);
  const [creditDays, setCreditDays] = useState(30);
  const [page,    setPage]    = useState(1);
  const PER = 12;

  const dos  = deliveryOrders || [];
  const sos  = salesOrders    || [];
  const mats = invMaterials   || [];

  const filtered = useMemo(()=>dos.filter(d=>{
    const q=search.toLowerCase();
    return(stFilter==='All'||d.status===stFilter)&&(!search||(d.id||'').toLowerCase().includes(q)||(d.partyName||'').toLowerCase().includes(q)||(d.soId||'').toLowerCase().includes(q));
  }),[dos,stFilter,search]);
  const pages=Math.ceil(filtered.length/PER);
  const paged=filtered.slice((page-1)*PER,page*PER);

  function handleDeliver(id){deliverOrder(id);if(viewDO?.id===id)setViewDO(prev=>({...prev,status:'delivered',deliveredAt:new Date().toISOString()}));}

  function handleCreateInvoice(){
    if(!invDO)return;
    const so=sos.find(s=>s.id===invDO.soId);
    if(!so){toast('Linked SO not found','error');return;}
    const party=sdParties?.find(p=>p.id===invDO.partyId);
    // Compute COGS from MAP
    const items=so.items.map(it=>{
      const mat=mats.find(m=>m.id===it.materialId);
      const mapPrice=mat?.mapPrice||0;
      return{...it,mapPrice,cogs:it.qty*mapPrice};
    });
    const cogsTotal=items.reduce((s,i)=>s+i.cogs,0);
    createSalesInvoice({soId:so.id,doId:invDO.id,date:new Date().toISOString().slice(0,10),partyId:invDO.partyId,partyName:invDO.partyName,tier:party?.tier||so.tier,items,subTotal:so.subTotal,taxPct:so.taxPct,taxAmount:so.taxAmount,grandTotal:so.grandTotal,cogsTotal,creditDays:parseInt(creditDays)||30,paidAmount:0});
    setShowInvForm(false);setInvDO(null);
  }

  const isInvoiced=(doId)=>salesInvoices?.some(i=>i.doId===doId);

  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Delivery Orders</h2><p className="pm-page-sub">Dispatch & delivery management — confirm delivery to create invoice</p></div>
        <div className="pm-page-actions"><button className="pm-btn pm-btn-outline"><Icon name="download" size={13}/> Export</button></div>
      </div>

      <div className="pm-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[{label:'Total DOs',value:dos.length,icon:'truck',bg:'#f0fdf4',color:ACCENT},{label:'Pending',value:dos.filter(d=>d.status==='pending').length,icon:'bell',bg:'#f8fafc',color:'#94a3b8'},{label:'In Transit',value:dos.filter(d=>d.status==='in_transit').length,icon:'truck',bg:'#f5f3ff',color:'#8b5cf6'},{label:'Delivered',value:dos.filter(d=>d.status==='delivered').length,icon:'check',bg:'#f0fdf4',color:'#10b981'}].map(s=>(
          <div className="pm-stat-card" key={s.label}><div className="pm-stat-top"><div className="pm-stat-icon" style={{background:s.bg}}><Icon name={s.icon} size={17} color={s.color}/></div></div><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value">{s.value}</div></div>
        ))}
      </div>

      <div className="pm-table-wrap">
        <div className="pm-table-header" style={{flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['All','pending','in_transit','delivered'].map(s=>(
              <button key={s} onClick={()=>{setStFilter(s);setPage(1);}} style={{padding:'5px 11px',borderRadius:20,border:'1px solid',fontSize:11.5,fontWeight:500,cursor:'pointer',background:stFilter===s?ACCENT:'#fff',color:stFilter===s?'#fff':'#6b7280',borderColor:stFilter===s?ACCENT:'#e5e7eb'}}>{s==='All'?'All':s.replace('_',' ')}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 11px',flex:1,maxWidth:260}}>
            <Icon name="search" size={14} color="#94a3b8"/>
            <input placeholder="Search DO ID, party, SO…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{border:'none',background:'transparent',fontSize:12.5,outline:'none',flex:1}}/>
          </div>
        </div>
        <table className="pm-table">
          <thead><tr><th>DO ID</th><th>SO Ref</th><th>Date</th><th>Party</th><th>Warehouse</th><th>Driver / Vehicle</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.length===0?<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#9ca3af'}}>No delivery orders found</td></tr>
              :paged.map(d=>{
                const sc=STATUS_CFG[d.status]||{cls:'pm-badge-gray',label:d.status};
                const inv=isInvoiced(d.id);
                const wh=(warehouses||[]).find(w=>w.id===d.warehouseId);
                return(<tr key={d.id}>
                  <td style={{fontWeight:700,color:ACCENT,fontFamily:'monospace',fontSize:11}}>{d.id}</td>
                  <td style={{color:'#6b7280',fontFamily:'monospace',fontSize:11}}>{d.soId}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{d.date}</td>
                  <td style={{fontWeight:600}}>{d.partyName}</td>
                  <td style={{color:'#9ca3af',fontSize:12}}>{wh?.name||'—'}</td>
                  <td style={{fontSize:12,color:'#6b7280'}}>{d.driver||'—'} {d.vehicle?`· ${d.vehicle}`:''}</td>
                  <td><span className={`pm-badge ${sc.cls}`}>{sc.label}</span>{inv&&<span className="pm-badge pm-badge-green" style={{marginLeft:4}}>Invoiced</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="pm-btn pm-btn-ghost" style={{padding:'3px 7px',fontSize:11}} onClick={()=>setViewDO(d)}>View</button>
                      {d.status!=='delivered'&&<button className="pm-btn pm-btn-primary" style={{background:ACCENT,padding:'3px 7px',fontSize:11}} onClick={()=>handleDeliver(d.id)}>✓ Deliver</button>}
                      {d.status==='delivered'&&!inv&&<button className="pm-btn pm-btn-primary" style={{background:'#f97316',padding:'3px 7px',fontSize:11}} onClick={()=>{setInvDO(d);setShowInvForm(true);}}>Invoice</button>}
                    </div>
                  </td>
                </tr>);
              })
            }
          </tbody>
        </table>
        {pages>1&&<div style={{display:'flex',justifyContent:'center',gap:6,padding:'14px',borderTop:'1px solid #f1f5f9'}}>{Array.from({length:pages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setPage(p)} style={{width:30,height:30,borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,background:page===p?ACCENT:'#fff',color:page===p?'#fff':'#6b7280',borderColor:page===p?ACCENT:'#e5e7eb'}}>{p}</button>)}</div>}
      </div>

      {viewDO&&(<Modal title={`Delivery Order: ${viewDO.id}`} onClose={()=>setViewDO(null)} wide>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
          {[['DO ID',viewDO.id],['SO Ref',viewDO.soId],['Date',viewDO.date],['Party',viewDO.partyName],['Driver',viewDO.driver||'—'],['Vehicle',viewDO.vehicle||'—'],['Status',viewDO.status],['Delivered At',viewDO.deliveredAt?new Date(viewDO.deliveredAt).toLocaleString():'Pending']].map(([l,v])=>(
            <div key={l} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px'}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:2}}>{l}</div><div style={{fontSize:12.5,fontWeight:600,color:'#0f172a'}}>{v}</div></div>
          ))}
        </div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Items</div>
        <table className="pm-table" style={{border:'1px solid #f1f5f9',borderRadius:8,overflow:'hidden',marginBottom:12}}>
          <thead><tr><th>Material</th><th style={{textAlign:'right'}}>Qty</th></tr></thead>
          <tbody>{(viewDO.items||[]).map((it,i)=><tr key={i}><td style={{fontWeight:600}}>{it.materialName}</td><td style={{textAlign:'right',fontWeight:700}}>{it.qty} {it.unit}</td></tr>)}</tbody>
        </table>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          {viewDO.status!=='delivered'&&<button className="pm-btn pm-btn-primary" style={{background:ACCENT}} onClick={()=>handleDeliver(viewDO.id)}>Confirm Delivery</button>}
          <button className="pm-btn pm-btn-ghost" onClick={()=>setViewDO(null)}>Close</button>
        </div>
      </Modal>)}

      {showInvForm&&invDO&&(<Modal title={`Create Invoice for ${invDO.id}`} onClose={()=>setShowInvForm(false)}>
        <p style={{fontSize:13,color:'#6b7280',marginBottom:16}}>Party: <strong>{invDO.partyName}</strong> · SO: <strong>{invDO.soId}</strong></p>
        <div className="pm-form-group" style={{marginBottom:16}}>
          <label>Credit Days (Payment Due)</label>
          <input type="number" value={creditDays} onChange={e=>setCreditDays(e.target.value)} min={0}/>
        </div>
        <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',fontSize:12.5,color:'#065f46',marginBottom:16}}>
          Auto-creates: AR entry, Journal (Dr AR / Cr Revenue + Dr COGS / Cr Inventory)
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="pm-btn pm-btn-outline" onClick={()=>setShowInvForm(false)}>Cancel</button>
          <button className="pm-btn pm-btn-primary" style={{background:'#f97316'}} onClick={handleCreateInvoice}>Post Invoice</button>
        </div>
      </Modal>)}
    </div>
  );
}
