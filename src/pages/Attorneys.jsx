import { useState, useEffect } from "react";
import {
  Plus, Search, X, ChevronDown, Edit2, Trash2, Mail, Loader,
} from "lucide-react";

const BASE_URL = "https://localhost:7291/api";

const attorneyApi = {
  getAll:    ()         => fetch(`${BASE_URL}/Attorney`),
  create:    (data)     => fetch(`${BASE_URL}/Attorney`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  update:    (id, data) => fetch(`${BASE_URL}/Attorney/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  delete:    (id)       => fetch(`${BASE_URL}/Attorney/${id}`, { method: "DELETE" }),
};

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmtR(n) { return "R " + Number(n).toLocaleString(); }

// ── inputStyle and Field defined at MODULE level — never recreated on render ──
const inputStyle = {
  width: "100%",
  background: "#080D1A",
  border: "1px solid rgba(141,198,63,0.22)",
  borderRadius: "7px",
  color: "#fff",
  fontSize: "13px",
  padding: "10px 12px",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label} {required && <span style={{ color: "#8DC63F" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const c = type === "success" ? "#8DC63F" : "#ef4444";
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 200, background: "#0D1426", border: `1px solid ${c}40`, borderLeft: `3px solid ${c}`, borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", fontFamily: "'Inter', sans-serif" }}>
      <span style={{ fontSize: "13px", color: "#fff" }}>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X style={{ width: "14px", height: "14px" }} /></button>
    </div>
  );
}

// ── Attorney Form Modal ───────────────────────────────────────────────────────
// Field is at module scope — inputs will NOT lose focus on re-render
function AttorneyModal({ attorney, onSave, onClose, saving }) {
  const isEdit = !!attorney;
  const [form, setForm] = useState({
    name:       attorney?.name       || "",
    email:      attorney?.email      || "",
    hourlyRate: attorney?.hourlyRate || "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "460px", maxWidth: "100%", fontFamily: "'Inter', sans-serif" }} onClick={(e) => e.stopPropagation()}>

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
          <Field label="Full Name" required>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Amukelani Ndlovu"
              style={inputStyle}
            />
          </Field>

          <Field label="Email Address" required>
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="a.name@mb.co.za"
              style={inputStyle}
            />
          </Field>

          <Field label="Hourly Rate (R)" required>
            <input
              type="number"
              value={form.hourlyRate}
              onChange={(e) => set("hourlyRate", e.target.value)}
              placeholder="e.g. 2200"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !form.name || !form.email || !form.hourlyRate}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: saving ? "rgba(141,198,63,0.5)" : "#8DC63F", border: "none", borderRadius: "7px", padding: "12px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {saving && <Loader style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Save Changes" : "Add Attorney"}
            </button>
            <button onClick={onClose} style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "12px 20px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ attorney, onEdit, onClose }) {
  if (!attorney) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "440px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: "#080D1A", padding: "28px", borderBottom: "1px solid rgba(141,198,63,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#0A0F1E" }}>
                {getInitials(attorney.name)}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>{attorney.name}</h3>
                <p style={{ fontSize: "12px", color: "#8DC63F", margin: "4px 0 0" }}>Attorney</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onEdit(attorney)} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "7px 14px", cursor: "pointer" }}>Edit</button>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X style={{ width: "18px", height: "18px" }} /></button>
            </div>
          </div>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Mail style={{ width: "14px", height: "14px", color: "rgba(141,198,63,0.5)" }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{attorney.email}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "rgba(141,198,63,0.07)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", padding: "14px" }}>
              <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Hourly Rate</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(attorney.hourlyRate)}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Attorney ID</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>#{attorney.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attorney Card ─────────────────────────────────────────────────────────────
function AttorneyCard({ attorney, onView, onEdit, onDelete }) {
  return (
    <div onClick={() => onView(attorney)}
      style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", position: "relative", overflow: "hidden" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#8DC63F", opacity: 0.6 }} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: "#0A0F1E", flexShrink: 0 }}>
          {getInitials(attorney.name)}
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>{attorney.name}</p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{attorney.email}</p>
        </div>
      </div>
      <div style={{ background: "rgba(141,198,63,0.07)", border: "1px solid rgba(141,198,63,0.15)", borderRadius: "7px", padding: "10px 14px", marginBottom: "14px" }}>
        <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 2px" }}>Hourly Rate</p>
        <p style={{ fontSize: "18px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(attorney.hourlyRate)}</p>
      </div>
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

// ── Main Component ────────────────────────────────────────────────────────────
export function Attorneys() {
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [viewMode, setViewMode]   = useState("grid");
  const [showForm, setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [visible, setVisible]     = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fetchAttorneys = async () => {
    try {
      setLoading(true); setError(null);
      const res = await attorneyApi.getAll();
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setAttorneys(await res.json());
    } catch (err) {
      setError("Failed to load attorneys. Make sure your API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttorneys(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, hourlyRate: parseFloat(form.hourlyRate) };
      const res = editTarget
        ? await attorneyApi.update(editTarget.id, { id: editTarget.id, ...payload })
        : await attorneyApi.create(payload);
      if (!res.ok) throw new Error();
      setToast({ message: editTarget ? "Attorney updated successfully" : "Attorney added successfully", type: "success" });
      setShowForm(false); setEditTarget(null);
      fetchAttorneys();
    } catch {
      setToast({ message: "Failed to save attorney. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attorney?")) return;
    try {
      const res = await attorneyApi.delete(id);
      if (!res.ok) throw new Error();
      setToast({ message: "Attorney deleted", type: "success" });
      fetchAttorneys();
    } catch {
      setToast({ message: "Failed to delete attorney.", type: "error" });
    }
  };

  const handleEdit = (attorney) => { setViewTarget(null); setEditTarget(attorney); setShowForm(true); };

  const filtered = attorneys.filter((a) => {
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  if (loading) return (
    <div style={{ minHeight: "100%", background: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      <Loader style={{ width: "32px", height: "32px", color: "#8DC63F", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>Loading attorneys...</p>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100%", background: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif", padding: "40px" }}>
      <X style={{ width: "32px", height: "32px", color: "#ef4444" }} />
      <p style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: 0 }}>Could not load attorneys</p>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0 }}>{error}</p>
      <button onClick={fetchAttorneys} style={{ fontSize: "13px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 20px", cursor: "pointer" }}>Retry</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* Header */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Team Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Attorneys</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Manage attorney profiles and hourly rates</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
          <Plus style={{ width: "15px", height: "15px" }} /> New Attorney
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Attorneys", value: attorneys.length, color: "#fff" },
          { label: "Avg Hourly Rate", value: attorneys.length ? fmtR(Math.round(attorneys.reduce((s, a) => s + Number(a.hourlyRate), 0) / attorneys.length)) : "R 0", color: "#8DC63F" },
          { label: "Showing", value: `${filtered.length} of ${attorneys.length}`, color: "#60a5fa" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...fadeIn(130), display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..."
            style={{ width: "100%", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }} />
        </div>
        {search && (
          <button onClick={() => setSearch("")} style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <X style={{ width: "12px", height: "12px" }} /> Clear
          </button>
        )}
        <div style={{ display: "flex", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", overflow: "hidden", marginLeft: "auto" }}>
          {["grid", "table"].map((v) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: "8px 14px", fontSize: "12px", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", background: viewMode === v ? "#8DC63F" : "transparent", color: viewMode === v ? "#0A0F1E" : "rgba(255,255,255,0.4)", fontWeight: viewMode === v ? 600 : 400 }}>
              {v === "grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {viewMode === "grid" && (
        <div style={{ ...fadeIn(170), display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "16px" }}>
          {filtered.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No attorneys found.</div>
            : filtered.map((a) => <AttorneyCard key={a.id} attorney={a} onView={setViewTarget} onEdit={handleEdit} onDelete={handleDelete} />)
          }
        </div>
      )}

      {/* Table */}
      {viewMode === "table" && (
        <div style={{ ...fadeIn(170), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 0.5fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            {["Name", "Email", "Hourly Rate", ""].map((h) => <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>)}
          </div>
          {filtered.length === 0
            ? <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No attorneys found.</div>
            : filtered.map((a, i) => (
              <div key={a.id} onClick={() => setViewTarget(a)}
                style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 0.5fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s", alignItems: "center" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0A0F1E" }}>{getInitials(a.name)}</div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{a.name}</p>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{a.email}</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(a.hourlyRate)}</p>
                <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(a)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#8DC63F")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                    <Edit2 style={{ width: "14px", height: "14px" }} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>
            ))
          }
          <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {attorneys.length} attorneys</span>
          </div>
        </div>
      )}

      {viewTarget && <DetailModal attorney={viewTarget} onEdit={handleEdit} onClose={() => setViewTarget(null)} />}
      {showForm && <AttorneyModal attorney={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} saving={saving} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
