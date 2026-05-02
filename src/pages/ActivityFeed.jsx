import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ChevronDown,
  X,
  AlertCircle,
  Wifi,
  Play,
  SkipForward,
} from "lucide-react";

// ── Mock matters for assignment ────────────────────────────────────────────────
const MATTERS = [
  { id: 1, ref: "MAT-2024-041", name: "Khumalo v Nedbank" },
  { id: 2, ref: "MAT-2024-038", name: "Dlamini Estate" },
  { id: 3, ref: "MAT-2024-029", name: "Transnet Arbitration" },
  { id: 4, ref: "MAT-2024-045", name: "Mbeki Family Trust" },
  { id: 5, ref: "MAT-2024-031", name: "SARS Appeal – Venter" },
];

// ── Simulated incoming events pool ────────────────────────────────────────────
const EVENT_POOL = [
  { type: "email",    icon: Mail,     label: "Email Detected",       color: "#60a5fa", desc: "Email sent to Thandi Khumalo re: court date confirmation",         duration: 0.1, units: 1,  attorney: "Amukelani Ndlovu",  suggestedMatter: 1 },
  { type: "call",     icon: Phone,    label: "Call Captured",        color: "#34d399", desc: "Outbound call to Transnet legal team — duration 22 min",           duration: 0.4, units: 4,  attorney: "Amukelani Ndlovu",  suggestedMatter: 3 },
  { type: "document", icon: FileText, label: "Document Edited",      color: "#a78bfa", desc: "Heads of Argument v4.docx edited and saved (38 mins active)",      duration: 0.6, units: 6,  attorney: "Amukelani Ndlovu",  suggestedMatter: 1 },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",        color: "#f472b6", desc: "Calendar event ended: Dlamini Estate — client consultation",       duration: 0.5, units: 5,  attorney: "Sipho Mokoena",     suggestedMatter: 2 },
  { type: "research", icon: Globe,    label: "Research Detected",    color: "#fb923c", desc: "Browser: saflii.org open for 45 mins — tax tribunal precedents",   duration: 0.8, units: 8,  attorney: "Sipho Mokoena",     suggestedMatter: 5 },
  { type: "email",    icon: Mail,     label: "Email Detected",       color: "#60a5fa", desc: "Email received and replied to: Mbeki Trust — deed amendment query", duration: 0.1, units: 1,  attorney: "Thabo Sithole",     suggestedMatter: 4 },
  { type: "document", icon: FileText, label: "Document Edited",      color: "#a78bfa", desc: "Trust Deed Draft v2.docx edited — 52 mins of active editing",      duration: 0.9, units: 9,  attorney: "Thabo Sithole",     suggestedMatter: 4 },
  { type: "call",     icon: Phone,    label: "Call Captured",        color: "#34d399", desc: "Inbound call from SARS official — duration 18 min",                duration: 0.3, units: 3,  attorney: "Sipho Mokoena",     suggestedMatter: 5 },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",        color: "#f472b6", desc: "Calendar event ended: Pre-arbitration prep with Transnet team",    duration: 1.5, units: 15, attorney: "Amukelani Ndlovu",  suggestedMatter: 3 },
  { type: "research", icon: Globe,    label: "Research Detected",    color: "#fb923c", desc: "Browser: judgments.co.za — credit listing case law (31 mins)",     duration: 0.5, units: 5,  attorney: "Amukelani Ndlovu",  suggestedMatter: 1 },
];

const TYPE_LABELS = {
  email: "Email", call: "Call", document: "Document", meeting: "Meeting", research: "Research",
};

// ── Assign Modal ───────────────────────────────────────────────────────────────
function AssignModal({ event, onAssign, onDismiss }) {
  const [matter, setMatter] = useState(event.suggestedMatter);
  const [duration, setDuration] = useState(event.duration);
  const [note, setNote] = useState(event.desc);

  const units = Math.ceil(duration * 10); // 6-min units
  const selectedMatter = MATTERS.find((m) => m.id === matter);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={onDismiss}
    >
      <div
        style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "12px", width: "500px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)", background: "rgba(141,198,63,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${event.color}20`, border: `1px solid ${event.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <event.icon style={{ width: "15px", height: "15px", color: event.color }} />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>Assign to Matter</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{event.label} · {event.attorney}</p>
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Auto-detected info */}
          <div style={{ background: "rgba(141,198,63,0.06)", border: "1px solid rgba(141,198,63,0.15)", borderRadius: "8px", padding: "12px 14px", marginBottom: "18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.7)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 4px" }}>Auto-Detected Activity</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>{event.desc}</p>
          </div>

          {/* Matter select */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Client Matter <span style={{ color: "#8DC63F" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={matter}
                onChange={(e) => setMatter(Number(e.target.value))}
                style={{ width: "100%", appearance: "none", background: "#080D1A", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "7px", color: "#fff", fontSize: "13px", padding: "10px 36px 10px 12px", outline: "none", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
              >
                {MATTERS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "#0D1426" }}>{m.ref} — {m.name}</option>
                ))}
              </select>
              <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Duration (hours)
            </label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0.1)}
                style={{ flex: 1, background: "#080D1A", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "7px", color: "#fff", fontSize: "13px", padding: "10px 12px", outline: "none", fontFamily: "'Inter', sans-serif" }}
              />
              <div style={{ background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "7px", padding: "10px 14px", minWidth: "90px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", margin: 0, letterSpacing: "1px" }}>UNITS</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{units}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Description / Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              style={{ width: "100%", background: "#080D1A", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "7px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "10px 12px", outline: "none", fontFamily: "'Inter', sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => onAssign({ ...event, matter: selectedMatter, duration, units, note })}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "11px", cursor: "pointer", letterSpacing: "0.3px" }}
            >
              ✓ Confirm & Save Entry
            </button>
            <button
              onClick={onDismiss}
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "11px 16px", cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feed Item ──────────────────────────────────────────────────────────────────
function FeedItem({ item, onAssign, isNew }) {
  const [highlighted, setHighlighted] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setHighlighted(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  const statusStyle = {
    pending:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
    assigned: { color: "#8DC63F", bg: "rgba(141,198,63,0.1)",  border: "rgba(141,198,63,0.25)" },
    dismissed:{ color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
  };
  const ss = statusStyle[item.status];

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: highlighted ? "rgba(141,198,63,0.05)" : "transparent",
        transition: "background 1s ease",
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div style={{ width: "36px", height: "36px", flexShrink: 0, borderRadius: "8px", background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
        <item.icon style={{ width: "16px", height: "16px", color: item.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{item.label}</span>
          <span style={{ fontSize: "10px", color: item.color, background: `${item.color}15`, padding: "2px 7px", borderRadius: "4px" }}>{item.type}</span>
          {isNew && (
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#8DC63F", background: "rgba(141,198,63,0.15)", border: "1px solid rgba(141,198,63,0.3)", padding: "2px 7px", borderRadius: "4px", letterSpacing: "1px", animation: "pulse 1s ease infinite" }}>
              NEW
            </span>
          )}
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: "0 0 6px", lineHeight: 1.5 }}>{item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.attorney}</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.duration} hrs · {item.units} units</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{item.timestamp}</span>
          {item.matter && (
            <>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>·</span>
              <span style={{ fontSize: "11px", color: "#8DC63F", fontWeight: 600 }}>{item.matter.ref}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {item.status}
        </span>
        {item.status === "pending" && (
          <button
            onClick={() => onAssign(item)}
            style={{ fontSize: "11px", fontWeight: 600, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            + Assign
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [assignTarget, setAssignTarget] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({ total: 0, assigned: 0, pending: 0, dismissed: 0 });
  const poolIndex = useRef(0);
  const intervalRef = useRef(null);
  const idCounter = useRef(0);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  // Recalculate stats when feed changes
  useEffect(() => {
    setStats({
      total: feed.length,
      assigned: feed.filter((f) => f.status === "assigned").length,
      pending: feed.filter((f) => f.status === "pending").length,
      dismissed: feed.filter((f) => f.status === "dismissed").length,
    });
  }, [feed]);

  const addEvent = () => {
    const template = EVENT_POOL[poolIndex.current % EVENT_POOL.length];
    poolIndex.current += 1;
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const id = ++idCounter.current;

    const newEvent = { ...template, id, status: "pending", timestamp, matter: null };

    setFeed((prev) => [newEvent, ...prev]);
    setNewIds((prev) => new Set([...prev, id]));
    setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 3000);
  };

  const startSimulation = () => {
    if (simulating) {
      clearInterval(intervalRef.current);
      setSimulating(false);
      return;
    }
    setSimulating(true);
    addEvent(); // fire one immediately
    intervalRef.current = setInterval(addEvent, 5000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleAssign = (assigned) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === assigned.id
          ? { ...item, status: "assigned", matter: assigned.matter, duration: assigned.duration, units: assigned.units, desc: assigned.note }
          : item
      )
    );
    setAssignTarget(null);
  };

  const handleDismiss = (id) => {
    setFeed((prev) => prev.map((item) => item.id === id ? { ...item, status: "dismissed" } : item));
  };

  const filtered = filter === "all" ? feed : feed.filter((f) => f.status === filter || f.type === filter);

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
  });

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "assigned", label: "Assigned" },
    { id: "email", label: "Emails" },
    { id: "call", label: "Calls" },
    { id: "meeting", label: "Meetings" },
    { id: "document", label: "Documents" },
    { id: "research", label: "Research" },
  ];

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ ...fadeIn(0), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Automation Engine</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Activity Feed</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
            Auto-captured attorney activity — review and assign to matters
          </p>
        </div>

        {/* Simulate button */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={addEvent}
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "7px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <SkipForward style={{ width: "14px", height: "14px" }} /> Trigger Event
          </button>
          <button
            onClick={startSimulation}
            style={{ fontSize: "13px", fontWeight: 700, color: simulating ? "#ef4444" : "#0A0F1E", background: simulating ? "rgba(239,68,68,0.15)" : "#8DC63F", border: simulating ? "1px solid rgba(239,68,68,0.4)" : "none", borderRadius: "7px", padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease" }}
          >
            {simulating ? (
              <>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1s ease infinite" }} />
                Stop Simulation
              </>
            ) : (
              <>
                <Play style={{ width: "14px", height: "14px" }} />
                Start Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Live indicator ── */}
      {simulating && (
        <div style={{ ...fadeIn(0), display: "flex", alignItems: "center", gap: "10px", background: "rgba(141,198,63,0.06)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "10px", height: "10px" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#8DC63F", animation: "ping 1.5s ease infinite", opacity: 0.4 }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#8DC63F" }} />
          </div>
          <span style={{ fontSize: "12px", color: "rgba(141,198,63,0.8)", fontWeight: 500 }}>
            Simulation running — monitoring emails, calls, documents, meetings and browser activity in real time
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>New event every 5s</span>
        </div>
      )}

      {/* ── Empty state ── */}
      {feed.length === 0 && (
        <div style={{ ...fadeIn(100), background: "#0D1426", border: "1px dashed rgba(141,198,63,0.2)", borderRadius: "12px", padding: "60px 40px", textAlign: "center", marginBottom: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "rgba(141,198,63,0.08)", border: "1px solid rgba(141,198,63,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Zap style={{ width: "24px", height: "24px", color: "#8DC63F" }} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>No Activity Yet</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 20px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Click <strong style={{ color: "#8DC63F" }}>Start Simulation</strong> to watch the system automatically detect and capture attorney activity in real time.
          </p>
          <button onClick={startSimulation} style={{ fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "11px 24px", cursor: "pointer" }}>
            <Play style={{ width: "14px", height: "14px", display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
            Start Simulation
          </button>
        </div>
      )}

      {feed.length > 0 && (
        <>
          {/* ── Stats ── */}
          <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
            {[
              { label: "Total Captured", value: stats.total, color: "#fff" },
              { label: "Pending Review", value: stats.pending, color: "#f59e0b" },
              { label: "Assigned", value: stats.assigned, color: "#8DC63F" },
              { label: "Dismissed", value: stats.dismissed, color: "rgba(255,255,255,0.3)" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "14px 18px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: "24px", fontWeight: 700, color: c.color, margin: "4px 0 0" }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filter tabs ── */}
          <div style={{ ...fadeIn(120), display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s ease",
                  background: filter === f.id ? "#8DC63F" : "transparent",
                  color: filter === f.id ? "#0A0F1E" : "rgba(255,255,255,0.45)",
                  borderColor: filter === f.id ? "#8DC63F" : "rgba(255,255,255,0.1)",
                  fontWeight: filter === f.id ? 600 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
            {stats.pending > 0 && (
              <span style={{ fontSize: "11px", color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", padding: "6px 12px", borderRadius: "20px", marginLeft: "auto" }}>
                ⚠ {stats.pending} pending review
              </span>
            )}
          </div>

          {/* ── Feed list ── */}
          <div style={{ ...fadeIn(160), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
            {/* List header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Wifi style={{ width: "14px", height: "14px", color: simulating ? "#8DC63F" : "rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>
                  {filtered.length} {filter === "all" ? "events" : filter} captured
                </span>
              </div>
              {stats.pending > 0 && (
                <button
                  onClick={() => {
                    const firstPending = feed.find((f) => f.status === "pending");
                    if (firstPending) setAssignTarget(firstPending);
                  }}
                  style={{ fontSize: "11px", fontWeight: 600, color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "5px 12px", cursor: "pointer" }}
                >
                  Review Next Pending →
                </button>
              )}
            </div>

            {/* Events */}
            {filtered.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
                No events match this filter.
              </div>
            ) : (
              filtered.map((item) => (
                <FeedItem
                  key={item.id}
                  item={item}
                  isNew={newIds.has(item.id)}
                  onAssign={setAssignTarget}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* ── Assign Modal ── */}
      {assignTarget && (
        <AssignModal
          event={assignTarget}
          onAssign={handleAssign}
          onDismiss={() => setAssignTarget(null)}
        />
      )}
    </div>
  );
}
