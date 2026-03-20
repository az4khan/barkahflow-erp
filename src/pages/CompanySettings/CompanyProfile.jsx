import { useState } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../../components/common/Icon";

const CURRENCIES = ["PKR", "USD", "AED", "SAR", "EUR", "GBP"];
const BUSINESS_TYPES = [
  "Private Limited Company",
  "Public Limited Company",
  "Sole Proprietorship",
  "Partnership",
  "LLP",
];
const MONTHS = [
  { val: "01", label: "January" }, { val: "02", label: "February" },
  { val: "03", label: "March"   }, { val: "04", label: "April"    },
  { val: "05", label: "May"     }, { val: "06", label: "June"     },
  { val: "07", label: "July"    }, { val: "08", label: "August"   },
  { val: "09", label: "September"},{ val: "10", label: "October"  },
  { val: "11", label: "November" },{ val: "12", label: "December" },
];

export default function CompanyProfile() {
  const { company, setCompany, toast } = useApp();
  const [form, setForm] = useState({ ...company });
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  const handleSave = () => {
    if (!form.name || !form.businessType) {
      toast("Company name and business type are required.", "error");
      return;
    }
    setCompany(form);
    setDirty(false);
    toast("Company profile saved successfully.", "success");
  };

  const handleDiscard = () => { setForm({ ...company }); setDirty(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Section: Basic Info */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#f5f3ff" }}>
            <Icon name="building" size={18} color="#8b5cf6" />
          </div>
          <div>
            <div className="settings-section-title">Company Information</div>
            <div className="settings-section-sub">Basic company details and identity</div>
          </div>
        </div>

        <div className="form-grid three-col">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Company Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full legal company name" />
          </div>

          <div className="form-group">
            <label>Business Type *</label>
            <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)}>
              {BUSINESS_TYPES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Currency Symbol</label>
            <input value={form.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} placeholder="e.g. Rs, $" />
          </div>

          <div className="form-group">
            <label>GST / Tax Number</label>
            <input value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value)} placeholder="GST registration number" />
          </div>

          <div className="form-group">
            <label>NTN Number</label>
            <input value={form.ntn} onChange={(e) => set("ntn", e.target.value)} placeholder="National Tax Number" />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92-42-xxxx-xxxx" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@company.com" />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="www.company.com" />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Registered Address</label>
            <textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full registered address"
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      {/* Section: Financial Year */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-icon" style={{ background: "#fffbeb" }}>
            <Icon name="calendar" size={18} color="#d97706" />
          </div>
          <div>
            <div className="settings-section-title">Financial Year</div>
            <div className="settings-section-sub">Define your fiscal year start and end months</div>
          </div>
        </div>

        <div className="form-grid two-col">
          <div className="form-group">
            <label>Financial Year Start</label>
            <select value={form.financialYearStart} onChange={(e) => set("financialYearStart", e.target.value)}>
              {MONTHS.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Financial Year End</label>
            <select value={form.financialYearEnd} onChange={(e) => set("financialYearEnd", e.target.value)}>
              {MONTHS.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="fy-preview">
          <Icon name="info" size={14} color="#d97706" />
          <span>
            Current financial year: <strong>1 {MONTHS.find((m) => m.val === form.financialYearStart)?.label}</strong>
            {" "}to{" "}
            <strong>30 {MONTHS.find((m) => m.val === form.financialYearEnd)?.label}</strong>
          </span>
        </div>
      </div>

      {/* Save bar */}
      {dirty && (
        <div className="save-bar">
          <span>
            <Icon name="info" size={14} color="#d97706" />
            You have unsaved changes
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-outline btn-sm" onClick={handleDiscard}>Discard</button>
            <button className="btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      )}

      {!dirty && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" onClick={handleSave}>
            <Icon name="save" size={15} />
            Save Profile
          </button>
        </div>
      )}
    </div>
  );
}
