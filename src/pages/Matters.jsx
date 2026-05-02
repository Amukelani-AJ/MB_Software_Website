import { useState, useEffect } from "react";
import {
  Plus, Search, X, ChevronDown, Edit2, Trash2,
  Briefcase, Loader, FileText,
} from "lucide-react";

// ── API ────────────────────────────────────────────────────────────────────────
const BASE_URL = "https://localhost:7291/api";

const matterApi = {
  getAll:  ()         => fetch(`${BASE_URL}/Matter`),
  getById: (id)       => fetch(`${BASE_URL}/Matter/${id}`),
  create:  (data)     => fetch(`${BASE_URL}/Matter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }),
  update:  (id, data) => fetch(`${BASE_URL}/Matter/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }),
  delete:  (id)       => fetch(`${BASE_URL}/Matter/${id}`, { method: "DELETE" }),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  Active:   { color: "#8DC63F", bg: "rgba(141,198,63,0.1)",  border: "rgba(141,198,63,0.3)"  },
  Pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)"  },
  Closed:   { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
  Inactive: { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
};

const STATUS_OPTIONS = ["Active", "Pending", "Closed", "Inactive"];

function getStatusStyle(status) {
  return STATUS_STYLE[status] || STATUS_STYLE["Pending"];
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  const color = type === "success" ? "#8DC63F" : "#ef4444";
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 200, background: "#0D1426", border: `1px solid ${color}40`, borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", fontFamily: "'Inter', sans-serif" }}>
      <span style={{ fontSize: "13px", color: "#fff" }}>{message}</span>
      <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
        <X style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  );
}

// ── Shared form primitives (defined at module scope to avoid remount on re-render)
const inputStyle = {
  width: "100%", background: "#080D1A",
  border: "1px solid rgba(141,198,63,0.22)",
  borderRadius: "7px", color: "#fff", fontSize: "13px",
  padding: "10px 12px", outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label} {required && <span style={{ color: "#8DC63F" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Matter Form Modal ──────────────────────────────────────────────────────────
function MatterModal({ matter, onSave, onClose, saving }) {
  const isEdit = !!matter;
  const [form, setForm] = useState({
    matterNumber: matter?.matterNumber || "",
    clientName:   matter?.clientName   || "",
    description:  matter?.description  || "",
    status:       matter?.status       || "Active",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const isValid = form.matterNumber && form.clientName && form.status;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "500px", maxWidth: "100%", fontFamily: "'Inter', sans-serif" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>
              {isEdit ? "Edit Matter" : "New Matter"}
            </h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>
              {isEdit ? `Editing ${matter.matterNumber}` : "Create a new client matter"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Matter Number" required>
              <input
                value={form.matterNumber}
                onChange={(e) => set("matterNumber", e.target.value)}
                placeholder="e.g. MAT-2024-001"
                style={inputStyle}
              />
            </Field>
            <Field label="Status" required>
              <div style={{ position: "relative" }}>
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" }}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} style={{ background: "#0D1426" }}>{s}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </Field>
          </div>

          <Field label="Client Name" required>
            <input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              placeholder="e.g. Thandi Khumalo"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the matter..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </Field>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !isValid}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: saving || !isValid ? "rgba(141,198,63,0.4)" : "#8DC63F", border: "none", borderRadius: "7px", padding: "12px", cursor: saving || !isValid ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {saving && <Loader style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              {isEdit ? "Save Changes" : "Create Matter"}
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

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ matter, onEdit, onClose }) {
  if (!matter) return null;
  const s = getStatusStyle(matter.status);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "480px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "#080D1A", padding: "24px 28px", borderBottom: "1px solid rgba(141,198,63,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(141,198,63,0.12)", border: "1px solid rgba(141,198,63,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase style={{ width: "20px", height: "20px", color: "#8DC63F" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: 0 }}>{matter.clientName}</h3>
                <p style={{ fontSize: "11px", color: "rgba(141,198,63,0.6)", margin: "3px 0 0", letterSpacing: "0.5px" }}>{matter.matterNumber}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => onEdit(matter)} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "7px 14px", cursor: "pointer" }}>
                Edit
              </button>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Description */}
          {matter.description && (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "12px 14px" }}>
              {matter.description}
            </p>
          )}

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Matter Number", value: matter.matterNumber },
              { label: "Client",        value: matter.clientName },
              { label: "Matter ID",     value: `#${matter.id}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{value}</p>
              </div>
            ))}
            {/* Status */}
            <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "8px", padding: "12px 14px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Status</p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: s.color, margin: 0 }}>{matter.status}</p>
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose} style={{ width: "100%", fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "11px", cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Matter Card ────────────────────────────────────────────────────────────────
function MatterCard({ matter, onView, onEdit, onDelete }) {
  const s = getStatusStyle(matter.status);
  return (
    <div
      onClick={() => onView(matter)}
      style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", position: "relative", overflow: "hidden" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Top strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.color, opacity: 0.7 }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase style={{ width: "16px", height: "16px", color: "#8DC63F" }} />
          </div>
          <p style={{ fontSize: "11px", color: "rgba(141,198,63,0.6)", margin: 0, letterSpacing: "0.5px" }}>{matter.matterNumber}</p>
        </div>
        <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {matter.status}
        </span>
      </div>

      {/* Client name */}
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.3 }}>{matter.clientName}</h3>

      {/* Description */}
      {matter.description && (
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {matter.description}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(matter); }}
          style={{ flex: 1, fontSize: "11px", color: "#8DC63F", background: "rgba(141,198,63,0.08)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", padding: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
        >
          <Edit2 style={{ width: "11px", height: "11px" }} /> Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(matter.id); }}
          style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "7px 12px", cursor: "pointer" }}
        >
          <Trash2 style={{ width: "11px", height: "11px" }} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Matters() {
  const [matters, setMatters]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode]     = useState("grid");
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [visible, setVisible]       = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchMatters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await matterApi.getAll();
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setMatters(data);
    } catch (err) {
      setError("Failed to load matters. Make sure your API is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatters(); }, []);

  // ── Save (create or update) ──────────────────────────────────────────────────
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        matterNumber: form.matterNumber,
        clientName:   form.clientName,
        description:  form.description,
        status:       form.status,
      };

      let res;
      if (editTarget) {
        res = await matterApi.update(editTarget.id, { id: editTarget.id, ...payload });
      } else {
        res = await matterApi.create(payload);
      }

      if (!res.ok) throw new Error(`Error ${res.status}`);
      setToast({ message: editTarget ? "Matter updated successfully" : "Matter created successfully", type: "success" });
      setShowForm(false);
      setEditTarget(null);
      fetchMatters();
    } catch (err) {
      setToast({ message: "Failed to save matter. Please try again.", type: "error" });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this matter?")) return;
    try {
      const res = await matterApi.delete(id);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setToast({ message: "Matter deleted", type: "success" });
      fetchMatters();
    } catch (err) {
      setToast({ message: "Failed to delete matter.", type: "error" });
      console.error(err);
    }
  };

  const handleEdit = (matter) => {
    setViewTarget(null);
    setEditTarget(matter);
    setShowForm(true);
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = matters.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.clientName.toLowerCase().includes(q) ||
      m.matterNumber.toLowerCase().includes(q) ||
      (m.description || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Counts for summary cards ──────────────────────────────────────────────────
  const activeCount  = matters.filter((m) => m.status === "Active").length;
  const pendingCount = matters.filter((m) => m.status === "Pending").length;
  const closedCount  = matters.filter((m) => m.status === "Closed").length;

  const fadeIn = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms`,
  });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100%", background: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <Loader style={{ width: "32px", height: "32px", color: "#8DC63F", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>Loading matters...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100%", background: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif", padding: "40px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X style={{ width: "22px", height: "22px", color: "#ef4444" }} />
        </div>
        <p style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: 0 }}>Could not load matters</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0, textAlign: "center" }}>{error}</p>
        <button onClick={fetchMatters} style={{ fontSize: "13px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 20px", cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* ── Header ── */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Client Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Matters</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>All client matters and their current status</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}
        >
          <Plus style={{ width: "15px", height: "15px" }} /> New Matter
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Matters", value: matters.length,  color: "#fff"    },
          { label: "Active",        value: activeCount,      color: "#8DC63F" },
          { label: "Pending",       value: pendingCount,     color: "#f59e0b" },
          { label: "Closed",        value: closedCount,      color: "rgba(255,255,255,0.3)" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ ...fadeIn(130), display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client, matter number..."
            style={{ width: "100%", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }} />
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s ease",
                background: statusFilter === s ? "#8DC63F" : "transparent",
                color: statusFilter === s ? "#0A0F1E" : "rgba(255,255,255,0.45)",
                borderColor: statusFilter === s ? "#8DC63F" : "rgba(255,255,255,0.1)",
                fontWeight: statusFilter === s ? 600 : 400,
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Clear search */}
        {search && (
          <button onClick={() => setSearch("")}
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

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        <div style={{ ...fadeIn(170), display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: "16px" }}>
          {filtered.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No matters found.</div>
            : filtered.map((m) => <MatterCard key={m.id} matter={m} onView={setViewTarget} onEdit={handleEdit} onDelete={handleDelete} />)
          }
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <div style={{ ...fadeIn(170), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 2fr 0.8fr 0.5fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            {["Matter No.", "Client", "Description", "Status", ""].map((h) => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0
            ? <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No matters found.</div>
            : filtered.map((m, i) => {
              const s = getStatusStyle(m.status);
              return (
                <div key={m.id} onClick={() => setViewTarget(m)}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 2fr 0.8fr 0.5fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <p style={{ fontSize: "12px", color: "rgba(141,198,63,0.7)", margin: 0, fontWeight: 600 }}>{m.matterNumber}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{m.clientName}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.description || "—"}</p>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block" }}>
                    {m.status}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEdit(m)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#8DC63F")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                      <Edit2 style={{ width: "14px", height: "14px" }} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", transition: "color 0.15s" }}
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
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {matters.length} matters
            </span>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {viewTarget && <DetailModal matter={viewTarget} onEdit={handleEdit} onClose={() => setViewTarget(null)} />}
      {showForm   && <MatterModal matter={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} saving={saving} />}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
