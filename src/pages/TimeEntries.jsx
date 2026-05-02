import { useState, useEffect } from "react";
import {
  Search,

  Plus,
  ChevronDown,
 
 X,
} from "lucide-react";

const API = "https://localhost:7291/api";

const STATUSES = ["All Status", "approved", "pending", "rejected"];
const TYPES = ["All Types", "Drafting", "Research", "Court", "Meeting", "Consultation", "Communication"];

const STATUS_STYLE = {
  approved: { color: "#8DC63F", bg: "rgba(141,198,63,0.1)", border: "rgba(141,198,63,0.3)" },
  pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)"  },
};

const TYPE_COLORS = {
  Drafting: "#8DC63F", Research: "#60a5fa", Court: "#a78bfa",
  Meeting: "#34d399", Consultation: "#f472b6", Communication: "#fb923c",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function Select({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          background: "#0D1426",
          border: "1px solid rgba(141,198,63,0.2)",
          borderRadius: "6px",
          color: "rgba(255,255,255,0.7)",
          fontSize: "12px",
          padding: "8px 32px 8px 12px",
          cursor: "pointer",
          outline: "none",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
    </div>
  );
}

function Modal({ entry, onClose, onDelete, onEdit }) {
  if (!entry) return null;
  const s = STATUS_STYLE[entry.status];
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", padding: "28px", width: "480px", maxWidth: "90vw", fontFamily: "'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>{entry.matter}</h3>
            <p style={{ fontSize: "11px", color: "rgba(141,198,63,0.6)", margin: "3px 0 0", letterSpacing: "0.5px" }}>{entry.ref}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {[
          ["Task", entry.task],
          ["Attorney", entry.attorney],
          ["Type", entry.type],
          ["Date", entry.date],
          ["Time", `${entry.start} – ${entry.end}`],
          ["Duration", `${entry.duration} hrs (${entry.units} units)`],
          ["Rate", `R ${entry.rate.toLocaleString()} / hr`],
          ["Amount", `R ${(entry.duration * entry.rate).toLocaleString()}`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{val}</span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {entry.status}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onEdit(entry)} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "6px", padding: "7px 16px", cursor: "pointer" }}>Edit</button>
            <button onClick={() => onDelete(entry)} style={{ fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "7px 16px", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
// TimeEntryDTO gives units + hourlyRate + billedAmount directly.
// duration in hours = units * 6 / 60
function mapEntry(e) {
  // Handle both PascalCase (C# default) and camelCase
  const id          = e.Id          ?? e.id;
  const attorneyId  = e.AttorneyId  ?? e.attorneyId;
  const matterId    = e.MatterId    ?? e.matterId;
  const clientName  = e.ClientName  ?? e.clientName;
  const matterNum   = e.MatterNumber ?? e.matterNumber;
  const narrative   = e.Narrative   ?? e.narrative;
  const category    = e.Category    ?? e.category;
  const units       = e.Units       ?? e.units;
  const hourlyRate  = e.HourlyRate  ?? e.hourlyRate;
  const billedAmt   = e.BilledAmount ?? e.billedAmount;
  const workDate    = e.WorkDate    ?? e.workDate;
  const attName     = e.AttorneyName ?? e.attorneyName;

  return {
    id,
    attorneyId,
    matterId,
    matter: clientName || "—",
    ref: matterNum || "—",
    task: narrative || "—",
    attorney: attName || "—",
    type: category || "Other",
    date: workDate ? workDate.split("T")[0] : "—",
    duration: parseFloat(((units * 6) / 60).toFixed(2)),
    units,
    rate: hourlyRate,
    billedAmount: billedAmt,
    status: "pending",
  };
}


// ── Module-scope shared styles (prevents focus-loss bug) ──────────────────────
const inputStyle = {
  width: "100%", background: "#080D1A",
  border: "1px solid rgba(141,198,63,0.22)",
  borderRadius: "7px", color: "#fff", fontSize: "13px",
  padding: "10px 12px", outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

function FieldLabel({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label}{required && <span style={{ color: "#8DC63F" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ── Export CSV ─────────────────────────────────────────────────────────────────
function exportToCSV(entries) {
  const headers = ["Matter", "Ref", "Task", "Attorney", "Type", "Date", "Units", "Duration (hrs)", "Rate (R)", "Value (R)", "Status"];
  const rows = entries.map((e) => [
    e.matter, e.ref, `"${e.task}"`, e.attorney, e.type, e.date,
    e.units, e.duration, e.rate,
    (e.duration * e.rate).toFixed(2), e.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `time-entries-${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Time Entry Form Modal ──────────────────────────────────────────────────────
function TimeEntryModal({ entry, onClose, onSave, saving }) {
  const isEdit = !!entry;

  const [form, setForm] = useState({
    attorneyId: entry?.attorneyId || "",
    matterId:   entry?.matterId   || "",
    narrative:  entry?.task       || "",
    category:   entry?.type       || "Drafting",
    units:      entry?.units      || "",
    workDate:   entry?.date       || new Date().toISOString().split("T")[0],
  });

  const [attorneys, setAttorneys] = useState([]);
  const [matters,   setMatters]   = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    Promise.all([
      fetch(`${API}/Attorney`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/Matter`).then((r) => r.json()).catch(() => []),
    ]).then(([atts, mats]) => {
      setAttorneys(atts);
      setMatters(mats);
    }).finally(() => setLoadingData(false));
  }, []);

  const isValid = form.attorneyId && form.matterId && form.narrative && form.units && form.workDate;

  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "520px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", fontFamily: "'Inter', sans-serif" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#0D1426", zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>{isEdit ? "Edit Time Entry" : "New Time Entry"}</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>{isEdit ? "Update this entry" : "Log billable time"}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {loadingData ? (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>Loading attorneys and matters…</p>
          ) : (<>

            {/* Attorney */}
            <FieldLabel label="Attorney" required>
              <div style={{ position: "relative" }}>
                <select value={form.attorneyId} onChange={(e) => set("attorneyId", e.target.value)} style={selectStyle}>
                  <option value="">— Select attorney —</option>
                  {attorneys.map((a) => {
                    const id  = a.Id  ?? a.id;
                    const name = a.Name ?? a.name;
                    return <option key={id} value={id} style={{ background: "#0D1426" }}>{name}</option>;
                  })}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </FieldLabel>

            {/* Matter */}
            <FieldLabel label="Matter" required>
              <div style={{ position: "relative" }}>
                <select value={form.matterId} onChange={(e) => set("matterId", e.target.value)} style={selectStyle}>
                  <option value="">— Select matter —</option>
                  {matters.map((m) => {
                    const id  = m.Id  ?? m.id;
                    const num = m.MatterNumber ?? m.matterNumber;
                    const client = m.ClientName ?? m.clientName;
                    return <option key={id} value={id} style={{ background: "#0D1426" }}>{num} — {client}</option>;
                  })}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            </FieldLabel>

            {/* Narrative */}
            <FieldLabel label="Narrative" required>
              <textarea
                value={form.narrative}
                onChange={(e) => set("narrative", e.target.value)}
                placeholder="Describe the work done…"
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </FieldLabel>

            {/* Category + Units row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <FieldLabel label="Category" required>
                <div style={{ position: "relative" }}>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)} style={selectStyle}>
                    {["Drafting","Research","Court","Meeting","Consultation","Communication"].map((c) => (
                      <option key={c} value={c} style={{ background: "#0D1426" }}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                </div>
              </FieldLabel>

              <FieldLabel label="Units (1 unit = 6 min)" required>
                <input
                  value={form.units}
                  onChange={(e) => set("units", e.target.value)}
                  placeholder="e.g. 5"
                  type="number"
                  min="1"
                  style={inputStyle}
                />
              </FieldLabel>
            </div>

            {/* Duration preview */}
            {form.units && (
              <div style={{ background: "rgba(141,198,63,0.06)", border: "1px solid rgba(141,198,63,0.15)", borderRadius: "6px", padding: "8px 12px", fontSize: "12px", color: "rgba(141,198,63,0.8)" }}>
                ⏱ {((parseInt(form.units) * 6) / 60).toFixed(2)} hours ({form.units} units × 6 min)
              </div>
            )}

            {/* Work Date */}
            <FieldLabel label="Work Date" required>
              <input
                value={form.workDate}
                onChange={(e) => set("workDate", e.target.value)}
                type="date"
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </FieldLabel>

          </>)}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !isValid || loadingData}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: saving || !isValid || loadingData ? "rgba(141,198,63,0.4)" : "#8DC63F", border: "none", borderRadius: "7px", padding: "12px", cursor: saving || !isValid || loadingData ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Entry")}
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

// ── Main Component ─────────────────────────────────────────────────────────────
export function TimeEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [attorney, setAttorney] = useState("All Attorneys");
  const [attorneyList, setAttorneyList] = useState(["All Attorneys"]);
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Types");
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/TimeEntry`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const mapped = data.map(mapEntry);
      setEntries(mapped);
      // Build attorney filter list from real data
      const names = ["All Attorneys", ...new Set(mapped.map((e) => e.attorney).filter(Boolean))];
      setAttorneyList(names);
    } catch (err) {
      setError("Could not load time entries. Make sure your API is running.");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete entry for "${entry.task}"?`)) return;
    try {
      const res = await fetch(`${API}/TimeEntry/${entry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Entry deleted.");
      setSelected(null);
      fetchEntries();
    } catch {
      showToast("Delete failed.", false);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        AttorneyId: parseInt(form.attorneyId, 10),
        MatterId:   parseInt(form.matterId, 10),
        Narrative:  form.narrative,
        Category:   form.category,
        Units:      parseInt(form.units, 10),
        WorkDate:   form.workDate,
      };
      let res;
      if (editTarget) {
        res = await fetch(`${API}/TimeEntry/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API}/TimeEntry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => res.status);
        throw new Error(msg);
      }
      showToast(editTarget ? "Entry updated." : "Entry created.");
      setShowForm(false);
      setEditTarget(null);
      setSelected(null);
      fetchEntries();
    } catch (err) {
      console.error("Save error:", err);
      showToast(`Failed to save: ${err.message || "unknown error"}`, false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filtered = entries.filter((e) => {
    const matchSearch = e.matter.toLowerCase().includes(search.toLowerCase()) || e.task.toLowerCase().includes(search.toLowerCase()) || e.ref.toLowerCase().includes(search.toLowerCase());
    const matchAttorney = attorney === "All Attorneys" || e.attorney === attorney;
    const matchStatus = status === "All Status" || e.status === status;
    const matchType = type === "All Types" || e.type === type;
    return matchSearch && matchAttorney && matchStatus && matchType;
  });

  const totalHours = filtered.reduce((s, e) => s + e.duration, 0);
  const totalUnits = filtered.reduce((s, e) => s + e.units, 0);
  const totalValue = filtered.reduce((s, e) => s + e.duration * e.rate, 0);
  const pendingCount = filtered.filter((e) => e.status === "pending").length;

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
  });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.ok ? "rgba(141,198,63,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.ok ? "rgba(141,198,63,0.4)" : "rgba(239,68,68,0.4)"}`, color: toast.ok ? "#8DC63F" : "#ef4444", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(141,198,63,0.2)", borderTop: "3px solid #8DC63F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Loading entries…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" }}>
          <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
          <button onClick={fetchEntries} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "6px", padding: "8px 18px", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {!loading && !error && (<>

      {/* ── Header ── */}
      <div style={{ ...fadeIn(0), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Time Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", color: "#fff", letterSpacing: "-0.5px" }}>Time Entries</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Review, edit and approve all captured time</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setEditTarget(null); setShowForm(true); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "6px", padding: "9px 16px", cursor: "pointer" }}>
            <Plus style={{ width: "14px", height: "14px" }} /> New Entry
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ ...fadeIn(100), display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Hours", value: `${totalHours.toFixed(1)} hrs`, color: "#8DC63F" },
          { label: "Total Units", value: `${totalUnits} units`, color: "#60a5fa" },
          { label: "Total Value", value: `R ${totalValue.toLocaleString()}`, color: "#8DC63F" },
          { label: "Pending Review", value: `${pendingCount} entries`, color: "#f59e0b" },
        ].map((card) => (
          <div key={card.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{card.label}</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: card.color, margin: "6px 0 0" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ ...fadeIn(150), display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matter, task, ref..."
            style={{
              width: "100%",
              background: "#0D1426",
              border: "1px solid rgba(141,198,63,0.2)",
              borderRadius: "6px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "12px",
              padding: "8px 12px 8px 32px",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
        <Select value={attorney} onChange={setAttorney} options={attorneyList} />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <Select value={type} onChange={setType} options={TYPES} />

        {/* Active filters count */}
        {(attorney !== "All Attorneys" || status !== "All Status" || type !== "All Types" || search) && (
          <button
            onClick={() => { setSearch(""); setAttorney("All Attorneys"); setStatus("All Status"); setType("All Types"); }}
            style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <X style={{ width: "12px", height: "12px" }} /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ ...fadeIn(200), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {["Matter / Ref", "Task", "Attorney", "Date", "Duration", "Units", "Value", "Status"].map((h) => (
            <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            No entries match your filters.
          </div>
        ) : (
          filtered.map((entry, i) => {
            const s = STATUS_STYLE[entry.status];
            const typeColor = TYPE_COLORS[entry.type] || "#8DC63F";
            return (
              <div
                key={entry.id}
                onClick={() => setSelected(entry)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.6fr",
                  padding: "14px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Matter */}
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{entry.matter}</p>
                  <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.55)", margin: "2px 0 0", letterSpacing: "0.5px" }}>{entry.ref}</p>
                </div>

                {/* Task */}
                <div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: 0 }}>{entry.task}</p>
                  <span style={{ fontSize: "10px", color: typeColor, background: `${typeColor}18`, padding: "1px 6px", borderRadius: "3px", marginTop: "3px", display: "inline-block" }}>
                    {entry.type}
                  </span>
                </div>

                {/* Attorney */}
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{entry.attorney.split(" ").map(w => w[0]).join(". ")}.</p>

                {/* Date */}
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  {new Date(entry.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                </p>

                {/* Duration */}
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#8DC63F", margin: 0 }}>{entry.duration} hrs</p>

                {/* Units */}
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{entry.units}</p>

                {/* Value */}
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", margin: 0 }}>
                  R {(entry.duration * entry.rate).toLocaleString()}
                </p>

                {/* Status */}
                <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block" }}>
                  {entry.status}
                </span>
              </div>
            );
          })
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {entries.length} entries
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            Total: <span style={{ color: "#8DC63F", fontWeight: 600 }}>R {totalValue.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <Modal entry={selected} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={(entry) => { setEditTarget(entry); setShowForm(true); setSelected(null); }} />
      {showForm && <TimeEntryModal entry={editTarget} onClose={() => { setShowForm(false); setEditTarget(null); }} onSave={handleSave} saving={saving} />}
      </>)}
    </div>
  );
}
