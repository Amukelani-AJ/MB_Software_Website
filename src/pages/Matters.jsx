import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  X,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  FileText,
  MoreHorizontal,
  Filter,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_MATTERS = [
  {
    id: 1,
    ref: "MAT-2024-041",
    name: "Khumalo v Nedbank",
    client: "Thandi Khumalo",
    type: "Litigation",
    attorney: "Amukelani Ndlovu",
    status: "active",
    opened: "2024-08-12",
    hours: 42.5,
    budget: 60,
    rate: 2200,
    description: "High Court motion proceedings regarding unlawful credit listing.",
    lastActivity: "2026-05-01",
  },
  {
    id: 2,
    ref: "MAT-2024-038",
    name: "Dlamini Estate",
    client: "Bongani Dlamini",
    type: "Estates",
    attorney: "Sipho Mokoena",
    status: "active",
    opened: "2024-07-22",
    hours: 19.5,
    budget: 30,
    rate: 1800,
    description: "Administration of deceased estate including property transfers.",
    lastActivity: "2026-05-01",
  },
  {
    id: 3,
    ref: "MAT-2024-029",
    name: "Transnet Arbitration",
    client: "Transnet SOC Ltd",
    type: "Arbitration",
    attorney: "Amukelani Ndlovu",
    status: "active",
    opened: "2024-05-10",
    hours: 118.0,
    budget: 150,
    rate: 2500,
    description: "Commercial arbitration dispute arising from engineering contract.",
    lastActivity: "2026-04-30",
  },
  {
    id: 4,
    ref: "MAT-2024-045",
    name: "Mbeki Family Trust",
    client: "Nomsa Mbeki",
    type: "Trusts",
    attorney: "Thabo Sithole",
    status: "active",
    opened: "2024-09-03",
    hours: 8.2,
    budget: 20,
    rate: 1800,
    description: "Setting up inter vivos trust and drafting trust deed.",
    lastActivity: "2026-05-01",
  },
  {
    id: 5,
    ref: "MAT-2024-031",
    name: "SARS Appeal – Venter",
    client: "Pieter Venter",
    type: "Tax",
    attorney: "Sipho Mokoena",
    status: "active",
    opened: "2024-06-18",
    hours: 28.0,
    budget: 40,
    rate: 2000,
    description: "Tax court appeal against SARS additional assessment.",
    lastActivity: "2026-04-28",
  },
  {
    id: 6,
    ref: "MAT-2023-089",
    name: "Naidoo Divorce",
    client: "Priya Naidoo",
    type: "Family",
    attorney: "Thabo Sithole",
    status: "closed",
    opened: "2023-11-05",
    hours: 34.0,
    budget: 35,
    rate: 1800,
    description: "Contested divorce proceedings including asset division.",
    lastActivity: "2025-12-10",
  },
  {
    id: 7,
    ref: "MAT-2023-074",
    name: "Sasol Contract Dispute",
    client: "Sasol Limited",
    type: "Commercial",
    attorney: "Amukelani Ndlovu",
    status: "closed",
    opened: "2023-08-14",
    hours: 67.5,
    budget: 80,
    rate: 2500,
    description: "Breach of supply agreement — settled out of court.",
    lastActivity: "2025-09-22",
  },
  {
    id: 8,
    ref: "MAT-2025-002",
    name: "Zulu Labour Dispute",
    client: "Mandla Zulu",
    type: "Labour",
    attorney: "Sipho Mokoena",
    status: "pending",
    opened: "2025-01-09",
    hours: 4.0,
    budget: 25,
    rate: 1800,
    description: "CCMA referral for unfair dismissal — awaiting set-down date.",
    lastActivity: "2026-04-15",
  },
];

const ATTORNEYS = ["All Attorneys", "Amukelani Ndlovu", "Sipho Mokoena", "Thabo Sithole"];
const STATUSES  = ["All Status", "active", "pending", "closed"];
const TYPES     = ["All Types", "Litigation", "Estates", "Arbitration", "Trusts", "Tax", "Family", "Commercial", "Labour"];

const STATUS_STYLE = {
  active:  { color: "#8DC63F", bg: "rgba(141,198,63,0.1)",  border: "rgba(141,198,63,0.3)" },
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  closed:  { color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
};

const TYPE_COLORS = {
  Litigation: "#60a5fa", Estates: "#a78bfa", Arbitration: "#f472b6",
  Trusts: "#34d399", Tax: "#fb923c", Family: "#8DC63F",
  Commercial: "#facc15", Labour: "#38bdf8",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
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
        {options.map((o) => <option key={o} value={o} style={{ background: "#0D1426" }}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
    </div>
  );
}

// ── Matter Detail Modal ────────────────────────────────────────────────────────
function MatterModal({ matter, onClose }) {
  if (!matter) return null;
  const s = STATUS_STYLE[matter.status];
  const pct = Math.min((matter.hours / matter.budget) * 100, 100);
  const overBudget = pct >= 90;
  const billed = matter.hours * matter.rate;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "560px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(141,198,63,0.12)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${TYPE_COLORS[matter.type]}20`, border: `1px solid ${TYPE_COLORS[matter.type]}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase style={{ width: "20px", height: "20px", color: TYPE_COLORS[matter.type] }} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: 0 }}>{matter.name}</h3>
                <p style={{ fontSize: "11px", color: "rgba(141,198,63,0.6)", margin: "3px 0 0", letterSpacing: "0.5px" }}>{matter.ref}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px" }}>
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: "24px 28px" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "0 0 20px", lineHeight: 1.6 }}>{matter.description}</p>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              ["Client", matter.client],
              ["Attorney", matter.attorney],
              ["Type", matter.type],
              ["Opened", new Date(matter.opened).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })],
              ["Hourly Rate", `R ${matter.rate.toLocaleString()} / hr`],
              ["Last Activity", new Date(matter.lastActivity).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Hours progress */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Hours Used</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: overBudget ? "#f59e0b" : "#8DC63F" }}>
                {matter.hours} / {matter.budget} hrs ({Math.round(pct)}%)
              </span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: overBudget ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#8DC63F,#6aaa1f)", borderRadius: "4px", transition: "width 0.8s ease" }} />
            </div>
          </div>

          {/* Billed summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(141,198,63,0.08)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", padding: "12px 14px" }}>
              <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Total Billed</p>
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>R {billed.toLocaleString()}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px 14px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 4px" }}>Status</p>
              <span style={{ fontSize: "12px", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
                {matter.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px", cursor: "pointer" }}>
              View Time Entries
            </button>
            <button style={{ fontSize: "13px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
              Edit
            </button>
            <button style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
              Close Matter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Matter Card (Grid view) ────────────────────────────────────────────────────
function MatterCard({ matter, onClick }) {
  const s = STATUS_STYLE[matter.status];
  const typeColor = TYPE_COLORS[matter.type] || "#8DC63F";
  const pct = Math.min((matter.hours / matter.budget) * 100, 100);
  const overBudget = pct >= 90;

  return (
    <div
      onClick={() => onClick(matter)}
      style={{
        background: "#0D1426",
        border: "1px solid rgba(141,198,63,0.12)",
        borderRadius: "10px",
        padding: "20px",
        cursor: "pointer",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Type color strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: typeColor, opacity: 0.7 }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${typeColor}18`, border: `1px solid ${typeColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase style={{ width: "15px", height: "15px", color: typeColor }} />
          </div>
          <div>
            <p style={{ fontSize: "10px", color: `${typeColor}`, letterSpacing: "0.5px", margin: 0 }}>{matter.type}</p>
            <p style={{ fontSize: "11px", color: "rgba(141,198,63,0.5)", margin: "1px 0 0", letterSpacing: "0.3px" }}>{matter.ref}</p>
          </div>
        </div>
        <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {matter.status}
        </span>
      </div>

      {/* Name & client */}
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 2px", lineHeight: 1.3 }}>{matter.name}</h3>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 14px" }}>{matter.client}</p>

      {/* Progress bar */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Hours</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: overBudget ? "#f59e0b" : "rgba(255,255,255,0.5)" }}>
            {matter.hours} / {matter.budget} hrs
          </span>
        </div>
        <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: overBudget ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "#8DC63F", borderRadius: "3px" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#0A0F1E" }}>
            {matter.attorney.split(" ").map(w => w[0]).join("")}
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{matter.attorney.split(" ")[0]}</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#8DC63F" }}>
          R {(matter.hours * matter.rate).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Matters() {
  const [search, setSearch] = useState("");
  const [attorney, setAttorney] = useState("All Attorneys");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Types");
  const [view, setView] = useState("grid"); // "grid" | "table"
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = MOCK_MATTERS.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.ref.toLowerCase().includes(q) || m.client.toLowerCase().includes(q);
    const matchAttorney = attorney === "All Attorneys" || m.attorney === attorney;
    const matchStatus  = status === "All Status"    || m.status === status;
    const matchType    = type === "All Types"       || m.type === type;
    return matchSearch && matchAttorney && matchStatus && matchType;
  });

  const totalHours  = filtered.reduce((s, m) => s + m.hours, 0);
  const totalBilled = filtered.reduce((s, m) => s + m.hours * m.rate, 0);
  const activeCount = filtered.filter((m) => m.status === "active").length;

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
  });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* ── Page header ── */}
      <div style={{ ...fadeIn(0), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Client Management</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Matters</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>All client matters and their billing status</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
          <Plus style={{ width: "15px", height: "15px" }} /> New Matter
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Matters", value: filtered.length, color: "#fff" },
          { label: "Active", value: activeCount, color: "#8DC63F" },
          { label: "Total Hours", value: `${totalHours.toFixed(1)} hrs`, color: "#60a5fa" },
          { label: "Total Billed", value: `R ${totalBilled.toLocaleString()}`, color: "#8DC63F" },
        ].map((c) => (
          <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + view toggle ── */}
      <div style={{ ...fadeIn(140), display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matter, client, ref..."
            style={{ width: "100%", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        <Select value={attorney} onChange={setAttorney} options={ATTORNEYS} />
        <Select value={status}   onChange={setStatus}   options={STATUSES} />
        <Select value={type}     onChange={setType}     options={TYPES} />

        {/* Clear */}
        {(search || attorney !== "All Attorneys" || status !== "All Status" || type !== "All Types") && (
          <button onClick={() => { setSearch(""); setAttorney("All Attorneys"); setStatus("All Status"); setType("All Types"); }}
            style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <X style={{ width: "12px", height: "12px" }} /> Clear
          </button>
        )}

        {/* View toggle */}
        <div style={{ display: "flex", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", overflow: "hidden", marginLeft: "auto" }}>
          {["grid", "table"].map((v) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "8px 14px", fontSize: "12px", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", background: view === v ? "#8DC63F" : "transparent", color: view === v ? "#0A0F1E" : "rgba(255,255,255,0.4)", fontWeight: view === v ? 600 : 400, transition: "all 0.15s ease" }}>
              {v === "grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid View ── */}
      {view === "grid" && (
        <div style={{ ...fadeIn(180), display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
              No matters match your filters.
            </div>
          ) : (
            filtered.map((matter) => <MatterCard key={matter.id} matter={matter} onClick={setSelected} />)
          )}
        </div>
      )}

      {/* ── Table View ── */}
      {view === "table" && (
        <div style={{ ...fadeIn(180), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
          {/* Table head */}
          <div style={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 1.5fr 1fr 1fr 0.8fr 0.8fr 0.7fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
            {["Ref", "Matter", "Client", "Attorney", "Type", "Hours", "Billed", "Status"].map((h) => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No matters match your filters.</div>
          ) : (
            filtered.map((matter, i) => {
              const s = STATUS_STYLE[matter.status];
              const typeColor = TYPE_COLORS[matter.type] || "#8DC63F";
              const pct = Math.min((matter.hours / matter.budget) * 100, 100);
              const overBudget = pct >= 90;
              return (
                <div key={matter.id} onClick={() => setSelected(matter)}
                  style={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 1.5fr 1fr 1fr 0.8fr 0.8fr 0.7fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s ease", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.55)", margin: 0, letterSpacing: "0.5px" }}>{matter.ref}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{matter.name}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{matter.client}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{matter.attorney.split(" ")[0]}</p>
                  <span style={{ fontSize: "11px", color: typeColor, background: `${typeColor}18`, padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>{matter.type}</span>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: overBudget ? "#f59e0b" : "#8DC63F", margin: 0 }}>{matter.hours} hrs</p>
                    <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", marginTop: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: overBudget ? "#f59e0b" : "#8DC63F", borderRadius: "3px" }} />
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", margin: 0 }}>R {(matter.hours * matter.rate).toLocaleString()}</p>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block" }}>
                    {matter.status}
                  </span>
                </div>
              );
            })
          )}

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {MOCK_MATTERS.length} matters
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              Total billed: <span style={{ color: "#8DC63F", fontWeight: 600 }}>R {totalBilled.toLocaleString()}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <MatterModal matter={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
