import { useState, useEffect } from "react";
import {
  Search,

  Plus,
  ChevronDown,
 
  Download,
  X,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_ENTRIES = [
  { id: 1, matter: "Khumalo v Nedbank", ref: "MAT-2024-041", task: "Drafting heads of argument", attorney: "Amukelani Ndlovu", type: "Drafting", date: "2026-05-01", start: "09:00", end: "11:30", duration: 2.5, units: 25, rate: 1800, status: "approved" },
  { id: 2, matter: "Dlamini Estate", ref: "MAT-2024-038", task: "Client consultation call", attorney: "Sipho Mokoena", type: "Consultation", date: "2026-05-01", start: "11:45", end: "12:15", duration: 0.5, units: 5, rate: 1800, status: "pending" },
  { id: 3, matter: "Transnet Arbitration", ref: "MAT-2024-029", task: "Reviewing discovery documents", attorney: "Amukelani Ndlovu", type: "Research", date: "2026-05-01", start: "13:00", end: "16:00", duration: 3.0, units: 30, rate: 2200, status: "approved" },
  { id: 4, matter: "Mbeki Family Trust", ref: "MAT-2024-045", task: "Email correspondence with client", attorney: "Thabo Sithole", type: "Communication", date: "2026-05-01", start: "16:10", end: "16:22", duration: 0.2, units: 2, rate: 1800, status: "pending" },
  { id: 5, matter: "SARS Appeal – Venter", ref: "MAT-2024-031", task: "Research: Tax tribunal precedents", attorney: "Sipho Mokoena", type: "Research", date: "2026-04-30", start: "08:00", end: "09:30", duration: 1.5, units: 15, rate: 2000, status: "approved" },
  { id: 6, matter: "Khumalo v Nedbank", ref: "MAT-2024-041", task: "Court appearance – Motion court", attorney: "Amukelani Ndlovu", type: "Court", date: "2026-04-30", start: "10:00", end: "13:00", duration: 3.0, units: 30, rate: 2500, status: "approved" },
  { id: 7, matter: "Transnet Arbitration", ref: "MAT-2024-029", task: "Pre-arbitration meeting with client", attorney: "Amukelani Ndlovu", type: "Meeting", date: "2026-04-29", start: "14:00", end: "15:30", duration: 1.5, units: 15, rate: 2200, status: "approved" },
  { id: 8, matter: "Dlamini Estate", ref: "MAT-2024-038", task: "Drafting letters of executorship", attorney: "Sipho Mokoena", type: "Drafting", date: "2026-04-29", start: "09:30", end: "11:00", duration: 1.5, units: 15, rate: 1800, status: "pending" },
  { id: 9, matter: "SARS Appeal – Venter", ref: "MAT-2024-031", task: "Phone call with SARS official", attorney: "Thabo Sithole", type: "Communication", date: "2026-04-28", start: "10:15", end: "10:45", duration: 0.5, units: 5, rate: 2000, status: "approved" },
  { id: 10, matter: "Mbeki Family Trust", ref: "MAT-2024-045", task: "Trust deed review and annotation", attorney: "Thabo Sithole", type: "Research", date: "2026-04-28", start: "13:00", end: "15:00", duration: 2.0, units: 20, rate: 1800, status: "rejected" },
];

const ATTORNEYS = ["All Attorneys", "Amukelani Ndlovu", "Sipho Mokoena", "Thabo Sithole"];
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

function Modal({ entry, onClose }) {
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
            <button style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "6px", padding: "7px 16px", cursor: "pointer" }}>Edit</button>
            <button style={{ fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "7px 16px", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function TimeEntries() {
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [search, setSearch] = useState("");
  const [attorney, setAttorney] = useState("All Attorneys");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Types");
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

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

      {/* ── Header ── */}
      <div style={{ ...fadeIn(0), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Time Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", color: "#fff", letterSpacing: "-0.5px" }}>Time Entries</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Review, edit and approve all captured time</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.6)", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", padding: "9px 16px", cursor: "pointer" }}>
            <Download style={{ width: "14px", height: "14px" }} /> Export
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "6px", padding: "9px 16px", cursor: "pointer" }}>
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
        <Select value={attorney} onChange={setAttorney} options={ATTORNEYS} />
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
      <Modal entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
