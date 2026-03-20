import { useState } from "react";
import { HR_COLOR, SEED_ORG } from "./hrConstants";
import Icon from "../../components/common/Icon";
import { Modal } from "../../components/common/UI";

const C = HR_COLOR;

function Badge({ active }) {
  return (
    <span style={{ background: active ? "#f0fdf4" : "#fef2f2", color: active ? "#16a34a" : "#dc2626", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700, flexShrink:0 }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Inp(props) {
  return <input {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box" }} />;
}
function Sel({ children, ...props }) {
  return <select {...props} style={{ width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, color:"#0f172a", outline:"none", boxSizing:"border-box", background:"#fff" }}>{children}</select>;
}
function Lbl({ children }) {
  return <label style={{ fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:5 }}>{children}</label>;
}

const LEVELS = [
  { key:"companies",      label:"Company",        color:"#64748b", icon:"building", idPrefix:"CO" },
  { key:"businessUnits",  label:"Business Unit",  color:"#3b82f6", icon:"sitemap",  idPrefix:"BU" },
  { key:"divisions",      label:"Division",       color:"#8b5cf6", icon:"sitemap",  idPrefix:"DV" },
  { key:"departments",    label:"Department",     color:C,         icon:"users",    idPrefix:"DP" },
  { key:"subDepartments", label:"Sub-Department", color:"#f59e0b", icon:"users",    idPrefix:"SD" },
];

const PARENT_FIELD = {
  businessUnits:  "companyId",
  divisions:      "buId",
  departments:    "divId",
  subDepartments: "deptId",
};

const PARENT_SEL_MAP_KEY = {
  companyId: "companies",
  buId:      "businessUnits",
  divId:     "divisions",
  deptId:    "departments",
};

function LevelRow({ levelCfg, items, selectedId, onSelect, onAdd, onEdit, parentSelected, isLast }) {
  const { label, color, icon } = levelCfg;
  const activeCount = items.filter(x => x.status === "Active").length;

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #f1f5f9" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 18px", background:"#fafbfc", borderBottom:"1px solid #f1f5f9" }}>
        <div style={{ width:26, height:26, borderRadius:7, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon name={icon} size={13} color={color} />
        </div>
        <span style={{ fontSize:12.5, fontWeight:700, color:"#374151" }}>{label}</span>
        <span style={{ fontSize:11, color:"#94a3b8", background:"#fff", border:"1px solid #e2e8f0", padding:"1px 8px", borderRadius:20 }}>
          {items.length} total &middot; {activeCount} active
        </span>
        <div style={{ flex:1 }} />
        {parentSelected && (
          <button onClick={onAdd}
            style={{ padding:"5px 13px", borderRadius:7, background:color, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
            <Icon name="plus" size={12} color="#fff" /> Add {label}
          </button>
        )}
      </div>

      {/* Cards */}
      <div style={{ padding:"12px 18px", minHeight:56 }}>
        {items.length === 0 ? (
          <div style={{ fontSize:12.5, color:"#cbd5e1", fontStyle:"italic", padding:"4px 0" }}>
            {parentSelected
              ? `No ${label.toLowerCase()}s yet — click "Add ${label}" to create one`
              : `← Select a ${LEVELS[LEVELS.findIndex(l=>l.key===levelCfg.key)-1]?.label || "parent"} above to see ${label.toLowerCase()}s`}
          </div>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {items.map(item => {
              const isSel = selectedId === item.id;
              return (
                <div key={item.id} onClick={() => onSelect(isSel ? null : item.id)}
                  style={{
                    display:"flex", alignItems:"center", gap:9, padding:"8px 13px",
                    borderRadius:10, cursor:"pointer", border:"2px solid",
                    borderColor: isSel ? color : "#e2e8f0",
                    background:  isSel ? color+"0d" : "#fff",
                    boxShadow:   isSel ? `0 0 0 3px ${color}22` : "none",
                    transition:"all 0.14s",
                  }}
                  onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.borderColor=color+"60"; e.currentTarget.style.background="#fafafa"; }}}
                  onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#fff"; }}}
                >
                  <div style={{ width:7, height:7, borderRadius:"50%", background: item.status==="Active" ? "#22c55e" : "#f87171", flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12.5, fontWeight: isSel ? 700 : 500, color:"#0f172a", whiteSpace:"nowrap" }}>{item.name}</div>
                    <div style={{ fontSize:10.5, color:"#94a3b8" }}>{item.code}</div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); onEdit(item); }}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 3px", borderRadius:5, color:"#d1d5db", marginLeft:2 }}
                    onMouseEnter={e=>e.currentTarget.style.color=color}
                    onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}
                  >
                    <Icon name="edit" size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrgManagement() {
  const [org, setOrg] = useState(SEED_ORG);
  const [sel, setSel] = useState({ companies:"CO-001", businessUnits:null, divisions:null, departments:null, subDepartments:null });
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});

  const f = k => e => setForm(p=>({ ...p, [k]: e.target.value }));

  const getItems = (levelKey) => {
    const pField = PARENT_FIELD[levelKey];
    if (!pField) return org[levelKey];
    const parentSelKey = PARENT_SEL_MAP_KEY[pField];
    const parentId = sel[parentSelKey];
    if (!parentId) return [];
    return (org[levelKey]||[]).filter(x => x[pField] === parentId);
  };

  const isParentSelected = (levelKey) => {
    if (levelKey === "companies") return true;
    const parentMap = { businessUnits:"companies", divisions:"businessUnits", departments:"divisions", subDepartments:"departments" };
    return !!sel[parentMap[levelKey]];
  };

  const handleSelect = (levelKey, id) => {
    const order = ["companies","businessUnits","divisions","departments","subDepartments"];
    const idx = order.indexOf(levelKey);
    const cleared = {};
    order.slice(idx+1).forEach(l => { cleared[l] = null; });
    setSel(s => ({ ...s, [levelKey]: id, ...cleared }));
  };

  const openAdd = (levelKey) => {
    const pField = PARENT_FIELD[levelKey];
    const defaults = {};
    if (pField) {
      const parentSelKey = PARENT_SEL_MAP_KEY[pField];
      defaults[pField] = sel[parentSelKey];
    }
    setForm({ ...defaults, status:"Active" });
    setModal({ level:levelKey, mode:"add" });
  };

  const openEdit = (levelKey, item) => {
    setForm({ ...item });
    setModal({ level:levelKey, mode:"edit" });
  };

  const save = () => {
    const { level, mode } = modal;
    setOrg(o => {
      if (mode === "add") {
        const pfx = LEVELS.find(l=>l.key===level)?.idPrefix || "XX";
        const newId = `${pfx}-${String(Date.now()).slice(-4)}`;
        return { ...o, [level]: [...(o[level]||[]), { ...form, id:newId }] };
      }
      return { ...o, [level]: (o[level]||[]).map(x => x.id===form.id ? {...form} : x) };
    });
    setModal(null);
  };

  const stats = [
    { label:"Business Units", val:org.businessUnits.length, color:"#3b82f6" },
    { label:"Divisions",      val:org.divisions.length,     color:"#8b5cf6" },
    { label:"Departments",    val:org.departments.length,   color:C         },
    { label:"Sub-Depts",      val:org.subDepartments.length,color:"#f59e0b" },
  ];

  const crumbs = [
    { key:"companies",     label: org.companies.find(x=>x.id===sel.companies)?.name },
    { key:"businessUnits", label: org.businessUnits.find(x=>x.id===sel.businessUnits)?.name },
    { key:"divisions",     label: org.divisions.find(x=>x.id===sel.divisions)?.name },
    { key:"departments",   label: org.departments.find(x=>x.id===sel.departments)?.name },
  ].filter(c => c.label);

  const modalLvl = modal ? LEVELS.find(l=>l.key===modal.level) : null;

  return (
    <div style={{ padding:"22px 26px", maxWidth:1300, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0 }}>Organization Management</h1>
          <p style={{ fontSize:13, color:"#94a3b8", margin:"4px 0 0" }}>Build your 5-level organizational structure</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:10, padding:"7px 14px", textAlign:"center", minWidth:80 }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10.5, color:"#94a3b8", fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12, fontSize:12.5, flexWrap:"wrap" }}>
          <span style={{ color:"#94a3b8", fontWeight:500 }}>Path:</span>
          {crumbs.map((c, i) => (
            <span key={c.key} style={{ display:"flex", alignItems:"center", gap:6 }}>
              {i > 0 && <Icon name="chevron" size={11} color="#cbd5e1" />}
              <span style={{ color: i===crumbs.length-1 ? C : "#374151", fontWeight: i===crumbs.length-1 ? 700 : 400 }}>{c.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Tip */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"8px 14px", background:"#fff9f0", border:"1px solid #fed7aa", borderRadius:9, fontSize:12, color:"#92400e" }}>
        <span>💡</span>
        <span>Click any card to select it — the level below filters automatically. The selected card is highlighted with a border.</span>
      </div>

      {/* Stacked levels */}
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, overflow:"hidden" }}>
        {LEVELS.map((lvl, idx) => (
          <LevelRow
            key={lvl.key}
            levelCfg={lvl}
            items={getItems(lvl.key)}
            selectedId={sel[lvl.key]}
            parentSelected={isParentSelected(lvl.key)}
            onSelect={id => handleSelect(lvl.key, id)}
            onAdd={() => openAdd(lvl.key)}
            onEdit={item => openEdit(lvl.key, item)}
            isLast={idx === LEVELS.length - 1}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && modalLvl && (
        <Modal title={`${modal.mode==="add"?"Add New":"Edit"} ${modalLvl.label}`} onClose={() => setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 16px" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <Lbl>Name *</Lbl>
              <Inp value={form.name||""} onChange={f("name")} placeholder={`${modalLvl.label} name`} autoFocus />
            </div>
            <div>
              <Lbl>Code *</Lbl>
              <Inp value={form.code||""} onChange={f("code")} placeholder="e.g. PROC" />
            </div>
            <div>
              <Lbl>Status</Lbl>
              <Sel value={form.status||"Active"} onChange={f("status")}>
                <option>Active</option><option>Inactive</option>
              </Sel>
            </div>
            {modal.level === "companies" && (
              <div style={{ gridColumn:"1/-1" }}>
                <Lbl>Country</Lbl>
                <Inp value={form.country||""} onChange={f("country")} placeholder="Pakistan" />
              </div>
            )}
            {modal.level === "businessUnits" && (
              <div style={{ gridColumn:"1/-1" }}>
                <Lbl>Company *</Lbl>
                <Sel value={form.companyId||""} onChange={f("companyId")}>
                  <option value="">Select…</option>
                  {org.companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </Sel>
              </div>
            )}
            {modal.level === "divisions" && (
              <div style={{ gridColumn:"1/-1" }}>
                <Lbl>Business Unit *</Lbl>
                <Sel value={form.buId||""} onChange={f("buId")}>
                  <option value="">Select…</option>
                  {org.businessUnits.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </Sel>
              </div>
            )}
            {modal.level === "departments" && (
              <div style={{ gridColumn:"1/-1" }}>
                <Lbl>Division *</Lbl>
                <Sel value={form.divId||""} onChange={f("divId")}>
                  <option value="">Select…</option>
                  {org.divisions.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Sel>
              </div>
            )}
            {modal.level === "subDepartments" && (
              <div style={{ gridColumn:"1/-1" }}>
                <Lbl>Department *</Lbl>
                <Sel value={form.deptId||""} onChange={f("deptId")}>
                  <option value="">Select…</option>
                  {org.departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Sel>
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button style={{ flex:1, padding:"9px 0", background:C, color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer" }} onClick={save}>
              {modal.mode==="add" ? `Create ${modalLvl.label}` : "Save Changes"}
            </button>
            <button style={{ flex:1, padding:"9px 0", background:"#f8fafc", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer" }} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
