import { useState } from "react";
import Icon from "../../../components/common/Icon";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
const ACCENT="#f97316";
function fmtPKR(n){if(!n)return"Rs0";if(n>=1e7)return`Rs${(n/1e7).toFixed(1)}Cr`;return`Rs${Number(n).toLocaleString()}`;}
export default function QCPage(){
  const {rfqs,quotations,createPO,toast}=useApp();
  const navigate=useNavigate();
  const [selRFQ,setSelRFQ]=useState(rfqs?.[0]||null);
  const [weights,setWeights]=useState({price:50,delivery:30,quality:20});
  const [awarded,setAwarded]=useState(null); const [posted,setPosted]=useState(false);
  const rfqQuotes=quotations.filter(q=>q.rfqId===selRFQ?.id);
  function score(q){return((weights.price/100)*(1-(q.totalAmount/(Math.max(...rfqQuotes.map(x=>x.totalAmount),1))))+
    (weights.delivery/100)*(1-(q.deliveryDays/(Math.max(...rfqQuotes.map(x=>x.deliveryDays),1))))+
    (weights.quality/100)*0.8)*100;}
  function handleGeneratePO(){
    if(!awarded)return;
    const q=rfqQuotes.find(x=>x.id===awarded);
    if(!q)return;
    createPO({rfqId:selRFQ?.id,supplierId:q.supplierId,supplierName:q.supplierName,items:q.items,totalAmount:q.totalAmount,paymentTerms:q.paymentTerms,deliveryDate:q.validUntil,currency:"PKR",notes:`Generated from QC for RFQ ${selRFQ?.id}`});
    toast("Purchase Order created from awarded quote","success");
    navigate("/purchase/po");
  }
  return(
    <div className="pm-page">
      <div className="pm-page-header">
        <div><h2 className="pm-page-title">Quotation Comparison</h2><p className="pm-page-sub">Compare supplier quotes and award the best bid</p></div>
      </div>
      {/* RFQ selector */}
      <div className="pm-chart-card" style={{marginBottom:20}}>
        <div className="pm-chart-title">Select RFQ</div>
        <select value={selRFQ?.id||""} onChange={e=>{ setSelRFQ(rfqs.find(r=>r.id===e.target.value)||null); setAwarded(null); setPosted(false); }} style={{padding:"8px 12px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",minWidth:300}}>
          <option value="">-- Select RFQ --</option>
          {rfqs.filter(r=>r.status==="quoted").map(r=><option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
        </select>
      </div>
      {selRFQ&&(
        <>
          {/* Scoring weights */}
          <div className="pm-chart-card" style={{marginBottom:20}}>
            <div className="pm-chart-title">Scoring Weights</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              {[["Price Weight",weights.price,v=>setWeights(w=>({...w,price:v}))],["Delivery Weight",weights.delivery,v=>setWeights(w=>({...w,delivery:v}))],["Quality Weight",weights.quality,v=>setWeights(w=>({...w,quality:v}))]].map(([l,v,set])=>(
                <div key={l}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,color:"#374151",marginBottom:6}}><span>{l}</span><span style={{color:ACCENT}}>{v}%</span></div>
                  <input type="range" min={0} max={100} value={v} onChange={e=>set(Number(e.target.value))} style={{width:"100%",accentColor:ACCENT}}/>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>Total: {weights.price+weights.delivery+weights.quality}% (should equal 100%)</div>
          </div>
          {/* Comparison table */}
          {rfqQuotes.length>0?(
            <div className="pm-table-wrap" style={{marginBottom:20}}>
              <div className="pm-table-header"><span className="pm-table-title">Quote Comparison — {selRFQ.id}</span></div>
              <div style={{overflowX:"auto"}}>
                <table className="pm-table">
                  <thead><tr><th>Select</th><th>Supplier</th><th>Total Amount</th><th>Delivery (days)</th><th>Payment Terms</th><th>Valid Until</th><th>Score</th></tr></thead>
                  <tbody>
                    {rfqQuotes.sort((a,b)=>score(b)-score(a)).map(q=>{
                      const sc=score(q).toFixed(1);
                      const isTop=q.id===rfqQuotes.sort((a,b)=>score(b)-score(a))[0].id;
                      return(
                        <tr key={q.id} style={{background:awarded===q.id?"#fff7ed":isTop?"#f0fdf4":""}}>
                          <td><input type="radio" name="star" disabled={posted} checked={awarded===q.id} onChange={()=>setAwarded(q.id)}/></td>
                          <td style={{fontWeight:700}}>{q.supplierName}{isTop&&<span style={{marginLeft:6,fontSize:10,background:"#f0fdf4",color:"#10b981",padding:"1px 6px",borderRadius:10,fontWeight:700}}>Recommended</span>}</td>
                          <td style={{fontWeight:700,color:ACCENT}}>{fmtPKR(q.totalAmount)}</td>
                          <td>{q.deliveryDays} days</td>
                          <td>{q.paymentTerms}</td>
                          <td style={{fontSize:12}}>{q.validUntil?.slice(0,10)}</td>
                          <td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${sc}%`,background:ACCENT,borderRadius:4}}/></div><span style={{fontWeight:700,color:"#0f172a",minWidth:36}}>{sc}</span></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ):<div style={{padding:40,textAlign:"center",color:"#94a3b8",background:"#f8fafc",borderRadius:12}}>No quotations received for this RFQ yet.</div>}
          {/* Award summary */}
          {awarded&&(
            <div className="pm-chart-card">
              <div className="pm-chart-title">Award Summary</div>
              {()=>{const q=rfqQuotes.find(x=>x.id===awarded);return q?(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                    {[["Awarded Supplier",q.supplierName],["Total Amount",fmtPKR(q.totalAmount)],["Delivery",q.deliveryDays+" days"]].map(([l,v])=>(
                      <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px"}}>
                        <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{l}</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginTop:3}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    {!posted&&<button className="pm-btn pm-btn-primary" onClick={()=>setPosted(true)}>✅ Save & Post Award</button>}
                    {posted&&<span style={{color:"#10b981",fontWeight:700,fontSize:13}}>✅ Award Posted</span>}
                    <button className="pm-btn pm-btn-outline" onClick={handleGeneratePO}>📄 Generate PO</button>
                  </div>
                </div>
              ):null;}}()
              }
            </div>
          )}
        </>
      )}
      {!selRFQ&&<div style={{padding:60,textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:12}}>⚖️</div><div style={{fontSize:15,fontWeight:600}}>Select a quoted RFQ to compare</div></div>}
    </div>
  );
}
