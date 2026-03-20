import { useState } from "react";
import { useApprovals } from "../../context/ApprovalsContext";
import { ACCENT } from "./purchaseConstants";
import Icon from "../../components/common/Icon";
import { Modal } from "../../components/common/UI";

const fmtAmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);

const POSITIONS = [
  { id:"POS-001", title:"CEO" },
  { id:"POS-002", title:"CFO" },
  { id:"POS-004", title:"Head of Procurement" },
  { id:"POS-005", title:"Purchase Manager" },
  { id:"POS-007", title:"Finance Manager" },
  { id:"POS-009", title:"HR Manager" },
  { id:"POS-010", title:"IT Manager" },
];
const APPROVAL_TYPES = ["Any One","All Must Approve"];
const TIMEOUT_ACTIONS = ["Escalate","Auto Approve","Auto Reject"];
const PRIORITIES = ["Any","High","Normal","Low"];

const EMPTY_RULE = (type) => ({
  name:"", type, status:"Active",
  conditions:{ amountMin:0, amountMax:99999999, priority:"Any" },
  levels:[{ level:1, positionId:"POS-005", positionTitle:"Purchase Manager", approvalType:"Any One", timeoutDays:2, timeoutAction:"Escalate" }],
});

function LevelBadge({ n, total }) {
  return (
    <div style={{ display:"flex", gap:4 }}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{ width:20, height:20, borderRadius:6, background: i<n ? ACCENT : "#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color: i<n ? "#fff" : "#94a3b8" }}>
          {i+1}
        </div>
      ))}
    </div>
  );
}

function RuleCard({ rule, onEdit, onToggle }) {
  const typeColor = rule.type === "PR" ? "#3b82f6" : "#8b5cf6";
  return (
    <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"16px 18px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ background:typeColor+"15", color:typeColor, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:800 }}>{rule.type}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{rule.name}</span>
          <span style={{ fontSize:11, color:"#94a3b8" }}>{rule.id}</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Toggle */}
          <div onClick={() => onToggle(rule.id)}
            style={{ width:36, height:20, borderRadius:10, background: rule.status==="Active" ? ACCENT : "#e2e8f0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: rule.status==="Active" ? 19 : 3, transition:"left 0.2s" }} />
          </div>
          <span style={{ fontSize:11, color: rule.status==="Active" ? "#16a34a" : "#94a3b8", fontWeight:600 }}>{rule.status}</span>
          <button onClick={() => onEdit(rule)}
            style={{ padding:"4px 12px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", fontSize:12, cursor:"pointer", color:"#64748b", fontWeight:500 }}>
            Edit
          </button>
        </div>
      </div>

      {/* Condition */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, color:"#64748b", background:"#f8fafc", padding:"3px 10px", borderRadius:7, border:"1px solid #f1f5f9" }}>
          Amount: PKR {fmtAmt(rule.conditions.amountMin)} – {fmtAmt(rule.conditions.amountMax)}
        </span>
        {rule.conditions.priority !== "Any" && (
          <span style={{ fontSize:12, color:"#ea580c", background:"#fff7ed", padding:"3px 10px", borderRadius:7, border:"1px solid #fed7aa" }}>
            Priority: {rule.conditions.priority}
          </span>
        )}
      </div>

      {/* Approval chain */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        {rule.levels.map((lv, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
            {i > 0 && <span style={{ color:"#cbd5e1", fontSize:16 }}>→</span>}
            <div style={{ background: ACCENT+"10", border:`1px solid ${ACCENT}25`, borderRadius:9, padding:"6px 12px" }}>
              <div style={{ fontSize:10, color:ACCENT, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Level {lv.level}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a", marginTop:1 }}>{lv.positionTitle}</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{lv.approvalType} · {lv.timeoutDays}d timeout</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleForm({ rule, type, onSave, onClose }) {
  const [form, setForm] = useState(rule ? {...rule, levels:[...rule.levels.map(l=>({...l}))]} : EMPTY_RULE(type));
  const f = (path, val) => setForm(p => {
    const n = {...p};
    const keys = path.split(".");
    let obj = n;
    for (let i=0; i<keys.length-1; i++) obj = obj[keys[i]];
    obj[keys[keys.length-1]] = val;
    return n;
  });

  const addLevel = () => {
    if (form.levels.length >= 4) return;
    setForm(p => ({ ...p, levels: [...p.levels, { level:p.levels.length+1, positionId:"POS-005", positionTitle:"Purchase Manager", approvalType:"Any One", timeoutDays:2, timeoutAction:"Escalate" }] }));
  };
  const removeLevel = (i) => setForm(p => ({ ...p, levels: p.levels.filter((_,idx)=>idx!==i).map((l,idx)=>({...l,level:idx+1})) }));
  const setLevel = (i, key, val) => {
    setForm(p => {
      const levels = p.levels.map((l,idx) => idx===i ? {...l,[key]:val} : l);
      if (key==="positionId") levels[i].positionTitle = POSITIONS.find(pos=>pos.id===val)?.title || val;
      return {...p, levels};
    });
  };

  return (
    <Modal title={rule ? `Edit Rule — ${rule.name}` : `New ${type} Approval Rule`} onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px", marginBottom:16 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>Rule Name *</label>
          <input value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. High Value PR"
            style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>

        {/* Conditions */}
        <div style={{ gridColumn:"1/-1" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Conditions</div>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>Min Amount (PKR)</label>
          <input type="number" value={form.conditions.amountMin} onChange={e=>f("conditions.amountMin",Number(e.target.value))}
            style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>Max Amount (PKR)</label>
          <input type="number" value={form.conditions.amountMax} onChange={e=>f("conditions.amountMax",Number(e.target.value))}
            style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>Priority Condition</label>
          <select value={form.conditions.priority} onChange={e=>f("conditions.priority",e.target.value)}
            style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", background:"#fff" }}>
            {PRIORITIES.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>Status</label>
          <select value={form.status} onChange={e=>f("status",e.target.value)}
            style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", background:"#fff" }}>
            <option>Active</option><option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Approval levels */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Approval Levels ({form.levels.length}/4)</div>
          {form.levels.length < 4 && (
            <button onClick={addLevel}
              style={{ padding:"4px 12px", borderRadius:7, background:ACCENT, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Add Level
            </button>
          )}
        </div>
        {form.levels.map((lv, i) => (
          <div key={i} style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px", marginBottom:8, border:"1px solid #f1f5f9" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>{i+1}</div>
                <span style={{ fontSize:12.5, fontWeight:700, color:"#374151" }}>Level {i+1} Approver</span>
              </div>
              {i > 0 && (
                <button onClick={()=>removeLevel(i)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:11, fontWeight:600 }}>Remove</button>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 12px" }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Position (Approver Role)</label>
                <select value={lv.positionId} onChange={e=>setLevel(i,"positionId",e.target.value)}
                  style={{ width:"100%", padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12.5, outline:"none", background:"#fff" }}>
                  {POSITIONS.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Approval Type</label>
                <select value={lv.approvalType} onChange={e=>setLevel(i,"approvalType",e.target.value)}
                  style={{ width:"100%", padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12.5, outline:"none", background:"#fff" }}>
                  {APPROVAL_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Timeout (days)</label>
                <input type="number" min="1" max="30" value={lv.timeoutDays} onChange={e=>setLevel(i,"timeoutDays",Number(e.target.value))}
                  style={{ width:"100%", padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12.5, outline:"none", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>On Timeout</label>
                <select value={lv.timeoutAction} onChange={e=>setLevel(i,"timeoutAction",e.target.value)}
                  style={{ width:"100%", padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12.5, outline:"none", background:"#fff" }}>
                  {TIMEOUT_ACTIONS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button style={{ flex:1, padding:"9px 0", background:ACCENT, color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer" }}
          onClick={() => onSave(form)}>
          {rule ? "Save Changes" : "Create Rule"}
        </button>
        <button style={{ flex:1, padding:"9px 0", background:"#f8fafc", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }}
          onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function ApprovalStrategy() {
  const { prRules, setPrRules, poRules, setPoRules } = useApprovals();
  const [tab, setTab]     = useState("PR");
  const [modal, setModal] = useState(null); // {mode:"add"|"edit", rule, type}

  const rules   = tab === "PR" ? prRules : poRules;
  const setRules = tab === "PR" ? setPrRules : setPoRules;

  const handleSave = (form) => {
    if (form.id) {
      setRules(rs => rs.map(r => r.id === form.id ? form : r));
    } else {
      const prefix = tab === "PR" ? "APR" : "APO";
      const newId = `${prefix}-${String(rules.length+1).padStart(3,"0")}`;
      setRules(rs => [...rs, {...form, id:newId}]);
    }
    setModal(null);
  };

  const handleToggle = (id) => {
    setRules(rs => rs.map(r => r.id===id ? {...r, status: r.status==="Active"?"Inactive":"Active"} : r));
  };

  return (
    <div className="pm-page">
      <div className="pm-page-header">
        <div>
          <h1 className="pm-page-title">Approval Strategy</h1>
          <p className="pm-page-sub">Configure approval rules and chains for PR & PO workflows</p>
        </div>
        <button className="pm-btn pm-btn-primary" onClick={() => setModal({mode:"add", type:tab})}>
          + New {tab} Rule
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
        <Icon name="invoice" size={16} color="#0284c7" />
        <div style={{ fontSize:12.5, color:"#0c4a6e", lineHeight:1.6 }}>
          <strong>How it works:</strong> When a PR or PO is submitted, the system matches it against these rules by amount range and priority.
          The matched rule's approval chain is automatically assigned — each level's approver is determined by their <strong>Position</strong> (e.g. whoever holds the "CFO" position gets the approval request).
          Rules are matched in priority order; if no rule matches, it goes to the default approver.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {["PR","PO"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 24px", borderRadius:9, border:"none", fontWeight:700, fontSize:13, cursor:"pointer",
              background: tab===t ? ACCENT : "#f1f5f9", color: tab===t ? "#fff" : "#64748b" }}>
            {t} Rules
            <span style={{ marginLeft:8, background: tab===t ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: tab===t ? "#fff" : "#94a3b8", padding:"1px 7px", borderRadius:20, fontSize:11, fontWeight:700 }}>
              {(tab==="PR" ? prRules : poRules).length}
            </span>
          </button>
        ))}
      </div>

      {/* Rules list */}
      {rules.length === 0 ? (
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"40px 20px", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⚙️</div>
          <div style={{ fontSize:14, fontWeight:600, color:"#374151" }}>No {tab} rules yet</div>
          <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Create your first approval rule to get started</div>
        </div>
      ) : (
        rules.map(rule => (
          <RuleCard key={rule.id} rule={rule} onEdit={r => setModal({mode:"edit", rule:r, type:tab})} onToggle={handleToggle} />
        ))
      )}

      {modal && (
        <RuleForm
          rule={modal.mode==="edit" ? modal.rule : null}
          type={modal.type}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
