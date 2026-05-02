import { useState, useEffect } from "react";
import {
  Plus, Search, X, ChevronDown, Edit2, Trash2,
  Briefcase, Clock, DollarSign, Mail, Phone, User,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_ATTORNEYS = [
  {
    id: 1, name: "Amukelani Ndlovu", initials: "AN", email: "a.ndlovu@mb.co.za",
    phone: "+27 11 463 9401", role: "Senior Associate", department: "Litigation",
    rate: 2200, targetHours: 50, hoursThisMonth: 42.5, matters: 8,
    status: "active", joined: "2021-03-15",
    bio: "Specialises in commercial litigation and arbitration with 8 years of experience.",
  },
  {
    id: 2, name: "Sipho Mokoena", initials: "SM", email: "s.mokoena@mb.co.za",
    phone: "+27 11 463 9402", role: "Associate", department: "Tax & Advisory",
    rate: 1900, targetHours: 50, hoursThisMonth: 35.0, matters: 6,
    status: "active", joined: "2022-07-01",
    bio: "Tax litigation specialist with expertise in SARS disputes and tax court appeals.",
  },
  {
    id: 3, name: "Thabo Sithole", initials: "TS", email: "t.sithole@mb.co.za",
    phone: "+27 11 463 9403", role: "Associate", department: "Private Client",
    rate: 1800, targetHours: 40, hoursThisMonth: 28.0, matters: 5,
    status: "active", joined: "2023-01-10",
    bio: "Trusts, estates and family law practitioner serving high-net-worth clients.",
  },
  {
    id: 4, name: "Lerato Dlamini", initials: "LD", email: "l.dlamini@mb.co.za",
    phone: "+27 11 463 9404", role: "Junior Associate", department: "Litigation",
    rate: 1500, targetHours: 40, hoursThisMonth: 12.0, matters: 3,
    status: "active", joined: "2024-02-01",
    bio: "Recently admitted attorney assisting with litigation research and pleadings.",
  },
  {
    id: 5, name: "Nomvula Khumalo", initials: "NK", email: "n.khumalo@mb.co.za",
    phone: "+27 11 463 9405", role: "Partner", department: "Corporate",
    rate: 3500, targetHours: 60, hoursThisMonth: 55.0, matters: 12,
    status: "active", joined: "2018-06-01",
    bio: "Senior partner specialising in M&A, corporate governance and commercial contracts.",
  },
  {
    id: 6, name: "Ruan van der Berg", initials: "RV", email: "r.vdberg@mb.co.za",
    phone: "+27 11 463 9406", role: "Candidate Attorney", department: "Litigation",
    rate: 900, targetHours: 40, hoursThisMonth: 38.0, matters: 4,
    status: "inactive", joined: "2025-01-15",
    bio: "Candidate attorney serving articles — assists across litigation and drafting matters.",
  },
];

const ROLES = ["All Roles", "Partner", "Senior Associate", "Associate", "Junior Associate", "Candidate Attorney"];
const DEPARTMENTS = ["All Departments", "Litigation", "Tax & Advisory", "Private Client", "Corporate"];
const STATUSES = ["All Status", "active", "inactive"];

const DEPT_COLORS = {
  Litigation: "#60a5fa", "Tax & Advisory": "#fb923c",
  "Private Client": "#a78bfa", Corporate: "#8DC63F",
};

const ROLE_RANK = { Partner: 1, "Senior Associate": 2, Associate: 3, "Junior Associate": 4, "Candidate Attorney": 5 };

function fmtR(n) { return `R ${n.toLocaleString()}`; }

function Select({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ appearance: "none", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "8px 32px 8px 12px", cursor: "pointer", outline: "none", fontFamily: "'Inter', sans-serif" }}>
        {options.map((o) => <option key={o} value={o} style={{ background: "#0D1426" }}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
    </div>
  );
}

// ── Attorney Form Modal ────────────────────────────────────────────────────────
function AttorneyModal({ attorney, onSave, onClose }) {
  const isEdit = !!attorney;
  const [form, setForm] = useState(attorney || {
    name: "", email: "", phone: "", role: "Associate",
    department: "Litigation", rate: "", targetHours: 40,
    status: "active", bio: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const Field = ({ label, children, required }) => (
    <div>
      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label} {required && <span style={{ color: "#8DC63F" }}>*</span>}
      </label>
      {children}
    </div>
  );

  const inputStyle = { width: "100%", background: "#080D1A", border: "1px solid rgba(141,198,63,0.22)", borderRadius: "7px", color: "#fff", fontSize: "13px", padding: "10px 12px", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "520px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>{isEdit ? "Edit Attorney" : "New Attorney"}</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>{isEdit ? `Editing ${attorney.name}` : "Add a new attorney to the system"}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Full Name" required>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Amukelani Ndlovu" style={inputStyle} />
            </Field>
            <Field label="Email Address" required>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="a.name@mb.co.za" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+27 11 463 9401" style={inputStyle} />
            </Field>
            <Field label="Status">
              <div style={{ position: "relative" }}>
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                  {["active", "inactive"].map((s) => <option key={s} style={{ background: "#0D1426" }}>{s}</option>)}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Role" required>
              <div style={{ position: "relative" }}>
                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                  {["Partner", "Senior Associate", "Associate", "Junior Associate", "Candidate Attorney"].map((r) => (
                    <option key={r} style={{ background: "#0D1426" }}>{r}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </Field>
            <Field label="Department">
              <div style={{ position: "relative" }}>
                <select value={form.department} onChange={(e) => set("department", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                  {["Litigation", "Tax & Advisory", "Private Client", "Corporate"].map((d) => (
                    <option key={d} style={{ background: "#0D1426" }}>{d}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Hourly Rate (R)" required>
              <input type="number" value={form.rate} onChange={(e) => set("rate", e.target.value)} placeholder="e.g. 2200" style={inputStyle} />
            </Field>
            <Field label="Monthly Target (hrs)">
              <input type="number" value={form.targetHours} onChange={(e) => set("targetHours", e.target.value)} placeholder="e.g. 50" style={inputStyle} />
            </Field>
          </div>

          <Field label="Bio / Specialisation">
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={2} placeholder="Brief description of specialisation..."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </Field>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={() => onSave(form)}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "12px", cursor: "pointer" }}>
              {isEdit ? "Save Changes" : "Add Attorney"}
            </button>
            <button onClick={onClose}
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "12px 20px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attorney Detail Modal ──────────────────────────────────────────────────────
function DetailModal({ attorney, onEdit, onClose }) {
  if (!attorney) return null;
  const deptColor = DEPT_COLORS[attorney.department] || "#8DC63F";
  const pct = Math.min(Math.round((attorney.hoursThisMonth / attorney.targetHours) * 100), 100);
  const overTarget = pct >= 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "500px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>

        {/* Profile header */}
        <div style={{ background: "#080D1A", padding: "28px 28px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#0A0F1E", flexShrink: 0 }}>
                {attorney.initials}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>{attorney.name}</h3>
                <p style={{ fontSize: "12px", color: "#8DC63F", margin: "3px 0 0" }}>{attorney.role}</p>
                <span style={{ fontSize: "10px", color: deptColor, background: `${deptColor}15`, padding: "2px 8px", borderRadius: "4px", marginTop: "5px", display: "inline-block" }}>{attorney.department}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onEdit(attorney)} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "7px 14px", cursor: "pointer" }}>Edit</button>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {attorney.bio && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 20px" }}>{attorney.bio}</p>}

          {/* Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {[
              { icon: Mail,  val: attorney.email },
              { icon: Phone, val: attorney.phone },
            ].map(({ icon: Icon, val }) => (
              <div key={val} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon style={{ width: "14px", height: "14px", color: "rgba(141,198,63,0.5)" }} />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Hourly Rate",  value: fmtR(attorney.rate) },
              { label: "Active Matters", value: attorney.matters },
              { label: "Joined",       value: new Date(attorney.joined).getFullYear() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Hours progress */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Monthly Hours Progress</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: overTarget ? "#8DC63F" : "#fff" }}>
                {attorney.hoursThisMonth} / {attorney.targetHours} hrs ({pct}%)
              </span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: overTarget ? "#8DC63F" : "#60a5fa", borderRadius: "4px", transition: "width 0.8s ease" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attorney Card ──────────────────────────────────────────────────────────────
function AttorneyCard({ attorney, onView, onEdit, onDelete }) {
  const deptColor = DEPT_COLORS[attorney.department] || "#8DC63F";
  const pct = Math.min(Math.round((attorney.hoursThisMonth / attorney.targetHours) * 100), 100);
  const isInactive = attorney.status === "inactive";

  return (
    <div
      style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", opacity: isInactive ? 0.6 : 1, position: "relative", overflow: "hidden" }}
      onClick={() => onView(attorney)}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Dept color strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: deptColor, opacity: 0.7 }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#0A0F1E", flexShrink: 0 }}>
            {attorney.initials}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>{attorney.name}</p>
            <p style={{ fontSize: "11px", color: "#8DC63F", margin: "2px 0 0" }}>{attorney.role}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "9px", fontWeight: 700, color: isInactive ? "rgba(255,255,255,0.3)" : "#8DC63F", background: isInactive ? "rgba(255,255,255,0.05)" : "rgba(141,198,63,0.1)", border: `1px solid ${isInactive ? "rgba(255,255,255,0.1)" : "rgba(141,198,63,0.25)"}`, padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {attorney.status}
          </span>
        </div>
      </div>

      {/* Dept tag */}
      <span style={{ fontSize: "10px", color: deptColor, background: `${deptColor}15`, padding: "2px 8px", borderRadius: "4px", display: "inline-block", marginBottom: "14px" }}>
        {attorney.department}
      </span>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "14px" }}>
        {[
          { label: "Rate",    value: fmtR(attorney.rate) },
          { label: "Matters", value: attorney.matters },
          { label: "Hours",   value: `${attorney.hoursThisMonth} hrs` },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "8px 10px" }}>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: "3px 0 0" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hours progress */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Monthly target</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: pct >= 100 ? "#8DC63F" : "rgba(255,255,255,0.4)" }}>{pct}%</span>
        </div>
        <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#8DC63F" : "#60a5fa", borderRadius: "3px" }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(attorney); }}
          style={{ flex: 1, fontSize: "11px", color: "#8DC63F", background: "rgba(141,198,63,0.08)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", padding: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
          <Edit2 style={{ width: "11px", height: "11px" }} /> Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(attorney.id); }}
          style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          <Trash2 style={{ width: "11px", height: "11px" }} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Attorneys() {
  const [attorneys, setAttorneys] = useState(MOCK_ATTORNEYS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = attorneys
    .filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
      const matchRole   = roleFilter   === "All Roles"       || a.role       === roleFilter;
      const matchDept   = deptFilter   === "All Departments" || a.department === deptFilter;
      const matchStatus = statusFilter === "All Status"      || a.status     === statusFilter;
      return matchSearch && matchRole && matchDept && matchStatus;
    })
    .sort((a, b) => (ROLE_RANK[a.role] || 99) - (ROLE_RANK[b.role] || 99));

  const handleSave = (form) => {
    if (editTarget) {
      setAttorneys((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
    } else {
      const initials = form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      setAttorneys((prev) => [...prev, { ...form, id: Date.now(), initials, hoursThisMonth: 0, matters: 0, joined: new Date().toISOString().split("T")[0] }]);
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleEdit = (attorney) => {
    setViewTarget(null);
    setEditTarget(attorney);
    setShowForm(true);
  };

  const handleDelete = (id) => setAttorneys((prev) => prev.filter((a) => a.id !== id));

  const totalHours   = attorneys.filter((a) => a.status === "active").reduce((s, a) => s + a.hoursThisMonth, 0);
  const totalMatters = attorneys.filter((a) => a.status === "active").reduce((s, a) => s + a.matters, 0);
  const activeCount  = attorneys.filter((a) => a.status === "active").length;

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Team Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Attorneys</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Manage attorney profiles, rates and monthly targets</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
          <Plus style={{ width: "15px", height: "15px" }} /> New Attorney
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Attorneys", value: attorneys.length,  color: "#fff" },
          { label: "Active",          value: activeCount,        color: "#8DC63F" },
          { label: "Hours This Month",value: `${totalHours} hrs`,color: "#60a5fa" },
          { label: "Active Matters",  value: totalMatters,       color: "#8DC63F" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...fadeIn(130), display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, department..."
            style={{ width: "100%", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <Select value={roleFilter}   onChange={setRoleFilter}   options={ROLES} />
        <Select value={deptFilter}   onChange={setDeptFilter}   options={DEPARTMENTS} />
        <Select value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        {(search || roleFilter !== "All Roles" || deptFilter !== "All Departments" || statusFilter !== "All Status") && (
          <button onClick={() => { setSearch(""); setRoleFilter("All Roles"); setDeptFilter("All Departments"); setStatusFilter("All Status"); }}
            style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <X style={{ width: "12px", height: "12px" }} /> Clear
          </button>
        )}
        {/* View toggle */}
        <div style={{ display: "flex", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", overflow: "hidden", marginLeft: "auto" }}>
          {["grid", "table"].map((v) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: "8px 14px", fontSize: "12px", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", background: viewMode === v ? "#8DC63F" : "transparent", color: viewMode === v ? "#0A0F1E" : "rgba(255,255,255,0.4)", fontWeight: viewMode === v ? 600 : 400, transition: "all 0.15s ease" }}>
              {v === "grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div style={{ ...fadeIn(170), display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: "16px" }}>
          {filtered.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No attorneys match your filters.</div>
            : filtered.map((a) => <AttorneyCard key={a.id} attorney={a} onView={setViewTarget} onEdit={handleEdit} onDelete={handleDelete} />)
          }
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div style={{ ...fadeIn(170), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.7fr 0.5fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            {["Attorney", "Role", "Department", "Rate", "Matters", "Hours", "Status", ""].map((h) => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {filtered.length === 0
            ? <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No attorneys match your filters.</div>
            : filtered.map((a, i) => {
              const deptColor = DEPT_COLORS[a.department] || "#8DC63F";
              const isInactive = a.status === "inactive";
              return (
                <div key={a.id} onClick={() => setViewTarget(a)}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.7fr 0.5fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s", alignItems: "center", opacity: isInactive ? 0.6 : 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0A0F1E", flexShrink: 0 }}>{a.initials}</div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{a.name}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{a.email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{a.role}</p>
                  <span style={{ fontSize: "11px", color: deptColor, background: `${deptColor}15`, padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>{a.department}</span>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#8DC63F", margin: 0 }}>{fmtR(a.rate)}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{a.matters}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{a.hoursThisMonth} hrs</p>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: isInactive ? "rgba(255,255,255,0.3)" : "#8DC63F", background: isInactive ? "rgba(255,255,255,0.05)" : "rgba(141,198,63,0.1)", border: `1px solid ${isInactive ? "rgba(255,255,255,0.1)" : "rgba(141,198,63,0.25)"}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block" }}>
                    {a.status}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEdit(a)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8DC63F")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                      <Edit2 style={{ width: "14px", height: "14px" }} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>
              );
            })
          }
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {attorneys.length} attorneys</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}><span style={{ color: "#8DC63F", fontWeight: 600 }}>{activeCount}</span> active</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewTarget && <DetailModal attorney={viewTarget} onEdit={handleEdit} onClose={() => setViewTarget(null)} />}
      {showForm   && <AttorneyModal attorney={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} />}
    </div>
  );
}
