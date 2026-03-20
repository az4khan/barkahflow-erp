import { useState, useMemo } from 'react';
import Icon      from '../../../components/common/Icon';
import { useApp } from '../../../context/AppContext';
import { PAY_METHODS } from '../posConstants';

const ACCENT = '#f97316';

export default function POSTerminal() {
  const { posTerminals, posSessions, invMaterials, sdPriceLists, sdParties, warehouses, createPosSale, openPosSession, closePosSession, currentUser, toast } = useApp();

  const [selectedTerminal, setSelectedTerminal] = useState(posTerminals?.[0]?.id || '');
  const [cart,  setCart]  = useState([]);
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [openingBal, setOpeningBal] = useState('');
  const [closingBal, setClosingBal] = useState('');
  const [showOpenSession, setShowOpenSession] = useState(false);
  const [showCloseSession, setShowCloseSession] = useState(false);

  const terminal  = (posTerminals||[]).find(t => t.id === selectedTerminal);
  const activeSession = (posSessions||[]).find(s => s.terminalId === selectedTerminal && s.status === 'open');
  const mats      = (invMaterials||[]).filter(m => m.status !== 'inactive' && m.totalQty > 0);
  const wh        = (warehouses||[]).find(w => w.id === terminal?.warehouseId);

  // Get consumer price list for POS
  const pl = (sdPriceLists||[]).find(p => p.tier === 'Consumer' && p.status === 'active');

  const priceFor = (matId) => {
    const plItem = pl?.items?.find(i => i.materialId === matId);
    const mat    = mats.find(m => m.id === matId);
    return plItem?.unitPrice || mat?.mapPrice || 0;
  };

  const filteredMats = useMemo(() => mats.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.code||'').toLowerCase().includes(search.toLowerCase())
  ), [mats, search]);

  function addToCart(mat) {
    setCart(prev => {
      const ex = prev.find(i => i.materialId === mat.id);
      const up = priceFor(mat.id);
      if (ex) return prev.map(i => i.materialId === mat.id ? {...i, qty: i.qty+1, total: (i.qty+1)*i.unitPrice} : i);
      return [...prev, { materialId:mat.id, materialName:mat.name, unit:mat.unit, qty:1, unitPrice:up, total:up }];
    });
  }

  function updateCartQty(matId, qty) {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.materialId !== matId)); return; }
    setCart(prev => prev.map(i => i.materialId === matId ? {...i, qty, total: qty*i.unitPrice} : i));
  }

  const subTotal   = cart.reduce((s,i) => s+i.total, 0);
  const grandTotal = subTotal; // POS = no GST for consumer retail (configurable)
  const change     = Math.max(0, (parseFloat(amountTendered)||0) - grandTotal);

  function handlePay() {
    if (!activeSession) { toast('Open a shift first','error'); return; }
    if (!cart.length)   { toast('Cart is empty','error'); return; }
    const tendered = parseFloat(amountTendered)||0;
    if (payMethod === 'Cash' && tendered < grandTotal) { toast('Insufficient amount tendered','error'); return; }

    const sale = createPosSale({
      sessionId:   activeSession.id,
      terminalId:  selectedTerminal,
      warehouseId: terminal?.warehouseId || 'WH-001',
      date:        new Date().toISOString().slice(0,10),
      partyId:     terminal?.shopPartyId,
      items:       cart,
      subTotal,
      taxAmt:      0,
      grandTotal,
      paymentMethod: payMethod,
      amountPaid:  Math.min(tendered||grandTotal, grandTotal),
      change,
    });

    setLastReceipt({ ...sale, change, tendered });
    setCart([]);
    setAmountTendered('');
    setShowPayModal(false);
  }

  function handleOpenSession() {
    if (!selectedTerminal) { toast('Select terminal','error'); return; }
    openPosSession(selectedTerminal, parseFloat(openingBal)||0);
    setShowOpenSession(false); setOpeningBal('');
    toast('Shift opened','success');
  }

  function handleCloseSession() {
    if (!activeSession) return;
    closePosSession(activeSession.id, parseFloat(closingBal)||0);
    setShowCloseSession(false); setClosingBal('');
  }

  const fmtPKR = n => `Rs ${Number(n||0).toLocaleString()}`;

  return (
    <div style={{ display:'flex', height:'calc(100vh - 64px)', overflow:'hidden', background:'#f1f5f9' }}>

      {/* ── Left: Product Grid ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'14px 0 14px 14px' }}>

        {/* Terminal selector + session bar */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <select value={selectedTerminal} onChange={e=>setSelectedTerminal(e.target.value)}
            style={{ padding:'7px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, fontWeight:600, outline:'none', color:'#0f172a' }}>
            {(posTerminals||[]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {activeSession
            ? <span style={{ fontSize:12, fontWeight:600, background:'#f0fdf4', color:'#10b981', padding:'4px 12px', borderRadius:20, border:'1px solid #a7f3d0' }}>● Shift Open</span>
            : <span style={{ fontSize:12, fontWeight:600, background:'#fef2f2', color:'#ef4444', padding:'4px 12px', borderRadius:20, border:'1px solid #fecaca' }}>● No Active Shift</span>
          }
          {!activeSession
            ? <button className="pm-btn pm-btn-primary" style={{ background:'#10b981', fontSize:12 }} onClick={()=>setShowOpenSession(true)}>Open Shift</button>
            : <button className="pm-btn pm-btn-ghost"   style={{ fontSize:12, color:'#ef4444', border:'1px solid #fecaca' }} onClick={()=>setShowCloseSession(true)}>Close Shift</button>
          }
          {wh && <span style={{ fontSize:11, color:'#94a3b8', marginLeft:'auto' }}>Warehouse: {wh.name}</span>}
        </div>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 14px', marginBottom:10 }}>
          <Icon name="search" size={15} color="#94a3b8"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{ border:'none', outline:'none', fontSize:13.5, flex:1 }}/>
          {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:18 }}>×</button>}
        </div>

        {/* Product grid */}
        <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, alignContent:'start', paddingRight:4 }}>
          {filteredMats.map(mat => {
            const price   = priceFor(mat.id);
            const inCart  = cart.find(i => i.materialId === mat.id);
            return (
              <button key={mat.id} onClick={() => addToCart(mat)}
                style={{ background:'#fff', border:`2px solid ${inCart?ACCENT:'#f1f5f9'}`, borderRadius:12, padding:'14px 12px', cursor:'pointer', textAlign:'left', transition:'all 0.12s', boxShadow:inCart?`0 0 0 3px ${ACCENT}20`:undefined }}
                onMouseEnter={e=>{ if(!inCart) e.currentTarget.style.borderColor='#cbd5e1'; }}
                onMouseLeave={e=>{ if(!inCart) e.currentTarget.style.borderColor='#f1f5f9'; }}>
                <div style={{ width:32, height:32, borderRadius:8, background:ACCENT+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                  <Icon name="box" size={16} color={ACCENT}/>
                </div>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#0f172a', marginBottom:2, lineHeight:1.3 }}>{mat.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginBottom:6 }}>{mat.code} · {mat.totalQty} {mat.unit}</div>
                <div style={{ fontSize:14, fontWeight:800, color:ACCENT }}>{fmtPKR(price)}</div>
                {inCart && <div style={{ fontSize:11, fontWeight:700, color:'#10b981', marginTop:4 }}>× {inCart.qty} in cart</div>}
              </button>
            );
          })}
          {filteredMats.length === 0 && <div style={{ gridColumn:'1/-1', padding:40, textAlign:'center', color:'#94a3b8' }}>No products found</div>}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div style={{ width:320, display:'flex', flexDirection:'column', background:'#fff', margin:'14px', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', overflow:'hidden', flexShrink:0 }}>

        <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>Cart</div>
          <div style={{ fontSize:12, color:'#94a3b8' }}>{cart.length} item{cart.length!==1?'s':''}</div>
        </div>

        {/* Cart items */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 12px' }}>
          {cart.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:13 }}>Add products to cart</div>
            : cart.map(item => (
              <div key={item.materialId} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 6px', borderBottom:'1px solid #f8fafc' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.materialName}</div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>{fmtPKR(item.unitPrice)} each</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button onClick={()=>updateCartQty(item.materialId, item.qty-1)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontSize:13, fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                  <button onClick={()=>updateCartQty(item.materialId, item.qty+1)} style={{ width:24, height:24, borderRadius:6, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:ACCENT, minWidth:70, textAlign:'right' }}>{fmtPKR(item.total)}</div>
              </div>
            ))
          }
        </div>

        {/* Totals */}
        <div style={{ padding:'12px 18px', borderTop:'2px solid #f1f5f9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13, color:'#6b7280' }}>
            <span>Sub Total</span><span>{fmtPKR(subTotal)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid #f1f5f9', fontSize:18, fontWeight:800, color:'#0f172a', marginTop:4 }}>
            <span>Total</span><span style={{ color:ACCENT }}>{fmtPKR(grandTotal)}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button onClick={()=>setCart([])} className="pm-btn pm-btn-ghost" style={{ flex:1, fontSize:13 }}>Clear</button>
            <button onClick={()=>setShowPayModal(true)} className="pm-btn pm-btn-primary" style={{ flex:2, background:ACCENT, fontSize:14, fontWeight:700 }} disabled={!cart.length||!activeSession}>
              Pay {fmtPKR(grandTotal)}
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPayModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 20px 60px rgba(0,0,0,.25)', overflow:'hidden' }}>
            <div style={{ background:ACCENT, padding:'20px 24px' }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:4 }}>Amount Due</div>
              <div style={{ fontSize:36, fontWeight:800, color:'#fff' }}>{fmtPKR(grandTotal)}</div>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:8 }}>Payment Method</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {PAY_METHODS.map(m => (
                    <button key={m} onClick={()=>setPayMethod(m)}
                      style={{ padding:'7px 14px', borderRadius:8, border:'2px solid', fontSize:12.5, fontWeight:600, cursor:'pointer', background:payMethod===m?ACCENT:'#fff', color:payMethod===m?'#fff':'#374151', borderColor:payMethod===m?ACCENT:'#e2e8f0' }}>{m}</button>
                  ))}
                </div>
              </div>
              {payMethod === 'Cash' && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:6 }}>Amount Tendered</div>
                  <input type="number" value={amountTendered} onChange={e=>setAmountTendered(e.target.value)} placeholder={grandTotal.toString()} autoFocus
                    style={{ width:'100%', padding:'12px 14px', border:'2px solid #e2e8f0', borderRadius:10, fontSize:18, fontWeight:700, outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
                  {(parseFloat(amountTendered)||0) >= grandTotal && (
                    <div style={{ marginTop:10, padding:'10px 14px', background:'#f0fdf4', borderRadius:8, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:13, color:'#374151' }}>Change</span>
                      <span style={{ fontSize:16, fontWeight:800, color:'#10b981' }}>{fmtPKR(change)}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <button className="pm-btn pm-btn-ghost" style={{ flex:1 }} onClick={()=>setShowPayModal(false)}>Cancel</button>
                <button onClick={handlePay} style={{ flex:2, background:ACCENT, color:'#fff', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:700, cursor:'pointer' }}>
                  ✓ Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Last Receipt ── */}
      {lastReceipt && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:360, boxShadow:'0 20px 60px rgba(0,0,0,.25)', overflow:'hidden' }}>
            <div style={{ background:'#10b981', padding:'20px 24px', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:4 }}>✓</div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Sale Complete!</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', marginTop:4 }}>{lastReceipt.id}</div>
            </div>
            <div style={{ padding:24 }}>
              {(lastReceipt.items||[]).map((it,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f8fafc', fontSize:13 }}>
                  <span>{it.materialName} × {it.qty}</span>
                  <span style={{ fontWeight:600 }}>Rs {(it.total||0).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', fontWeight:800, fontSize:16 }}>
                <span>Total</span><span style={{ color:ACCENT }}>Rs {(lastReceipt.grandTotal||0).toLocaleString()}</span>
              </div>
              {lastReceipt.paymentMethod === 'Cash' && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6b7280' }}>
                  <span>Change</span><span style={{ fontWeight:600, color:'#10b981' }}>Rs {(lastReceipt.change||0).toLocaleString()}</span>
                </div>
              )}
              <div style={{ marginTop:16, fontSize:11, color:'#94a3b8', textAlign:'center' }}>{new Date().toLocaleString()}</div>
              <button onClick={()=>setLastReceipt(null)} style={{ width:'100%', marginTop:16, padding:'12px', background:ACCENT, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer' }}>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Open Session Modal ── */}
      {showOpenSession && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:380, padding:28, boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Open Shift</h3>
            <div className="pm-form-group" style={{ marginBottom:20 }}>
              <label>Opening Cash Balance</label>
              <input type="number" value={openingBal} onChange={e=>setOpeningBal(e.target.value)} placeholder="e.g. 10000" autoFocus style={{ fontSize:18, fontWeight:700 }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="pm-btn pm-btn-ghost" style={{ flex:1 }} onClick={()=>setShowOpenSession(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" style={{ flex:2, background:'#10b981' }} onClick={handleOpenSession}>Open Shift</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close Session Modal ── */}
      {showCloseSession && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:380, padding:28, boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Close Shift</h3>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
              Session sales: <strong>{fmtPKR(activeSession?.totalSales||0)}</strong> · Transactions: <strong>{activeSession?.totalTransactions||0}</strong>
            </p>
            <div className="pm-form-group" style={{ marginBottom:20 }}>
              <label>Closing Cash Count</label>
              <input type="number" value={closingBal} onChange={e=>setClosingBal(e.target.value)} placeholder="Count cash in drawer" autoFocus style={{ fontSize:18, fontWeight:700 }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="pm-btn pm-btn-ghost" style={{ flex:1 }} onClick={()=>setShowCloseSession(false)}>Cancel</button>
              <button className="pm-btn pm-btn-primary" style={{ flex:2, background:'#ef4444' }} onClick={handleCloseSession}>Close Shift</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
