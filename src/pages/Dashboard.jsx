import { useState, useEffect } from "react";
import {
  Clock,
  TrendingUp,
  FileText,
  Briefcase,
  Play,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  MoreHorizontal,
  Timer,
  DollarSign,
  Users,
  Activity,
} from "lucide-react";

const API = "https://localhost:7291/api";

// Activity feed stays simulated (no backend for auto-capture)
const ACTIVITY_FEED = [
  { id: 1, type: "email",   desc: "Email sent to Khumalo re: court date",        time: "2 min ago",  auto: true  },
  { id: 2, type: "meeting", desc: "Calendar: Dlamini consultation captured",      time: "34 min ago", auto: true  },
  { id: 3, type: "doc",     desc: "Document edited: Heads of Argument v3.docx",  time: "1 hr ago",   auto: true  },
  { id: 4, type: "call",    desc: "Call logged: Transnet legal team (18 min)",    time: "2 hrs ago",  auto: true  },
  { id: 5, type: "invoice", desc: "Invoice INV-0089 generated for Venter",        time: "3 hrs ago",  auto: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const activityIcon = (type) => {
  const map = { email: "✉", meeting: "📅", doc: "📄", call: "📞", invoice: "🧾" };
  return map[type] || "•";
};

const statusStyle = (status) =>
  status === "approved"
    ? { color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)" }
    : { color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" };

// ── Component ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [visible, setVisible] = useState(false);

  // API state
  const [timeEntries, setTimeEntries]   = useState([]);
  const [matters, setMatters]           = useState([]);
  const [invoices, setInvoices]         = useState([]);
  const [loading, setLoading]           = useState(true);

  // Fetch all data in parallel
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teRes, mRes, invRes] = await Promise.all([
          fetch(`${API}/TimeEntry`),
          fetch(`${API}/Matter`),
          fetch(`${API}/Invoice`),
        ]);
        const [te, m, inv] = await Promise.all([teRes.json(), mRes.json(), invRes.json()]);
        setTimeEntries(Array.isArray(te) ? te : []);
        setMatters(Array.isArray(m) ? m : []);
        setInvoices(Array.isArray(inv) ? inv : []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchAll();
  }, []);

  // ── Derived stats from real data ──
  // Parse workDate safely regardless of timezone offset in the ISO string
  const toLocalDateStr = (dateStr) => {
    if (!dateStr) return "";
    // Take only the date part before "T" — avoids UTC shift issues
    return dateStr.split("T")[0];
  };

  const todayLocal = new Date();
  const today = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
  const thisMonth = today.slice(0, 7); // "YYYY-MM"

  // Hours today from time entries (units * 6 / 60)
  const todayEntries = timeEntries.filter(e => toLocalDateStr(e.workDate) === today);
  const hoursToday   = todayEntries.reduce((s, e) => s + (e.units * 6) / 60, 0);

  // Billable this month
  const monthEntries   = timeEntries.filter(e => toLocalDateStr(e.workDate).startsWith(thisMonth));
  const billableMonth  = monthEntries.reduce((s, e) => s + (e.billedAmount || 0), 0);
  const totalMonthAmt  = timeEntries.reduce((s, e) => s + (e.billedAmount || 0), 0);
  const billingRate    = totalMonthAmt > 0 ? Math.round((billableMonth / totalMonthAmt) * 100) : 0;

  // Active matters
  const activeMatters = matters.filter(m => {
    const s = (m.status || "").toLowerCase();
    return s === "active" || s === "open";
  });

  // Pending invoices
  const pendingInvoices  = invoices.filter(i => (i.status || "").toLowerCase() !== "paid");
  const pendingAmount    = pendingInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  // Recent entries (last 5 sorted by date desc)
  const recentEntries = [...timeEntries]
    .sort((a, b) => new Date(toLocalDateStr(b.workDate)) - new Date(toLocalDateStr(a.workDate)))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      matter: e.clientName || "—",
      ref: e.matterNumber || "—",
      task: e.narrative || "—",
      attorney: e.attorneyName ? e.attorneyName.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ") : "—",
      duration: `${((e.units * 6) / 60).toFixed(1)} hrs`,
      units: e.units,
      status: "pending",
      time: toLocalDateStr(e.workDate) || "—",
    }));

  // Active matters for progress panel (top 4 by entry count)
  const matterHours = timeEntries.reduce((acc, e) => {
    const key = e.matterNumber;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + (e.units * 6) / 60;
    return acc;
  }, {});

  const activeMattersList = activeMatters.slice(0, 4).map(m => ({
    id: m.id,
    name: m.clientName || m.description || "—",
    ref: m.matterNumber || "—",
    hours: parseFloat((matterHours[m.matterNumber] || 0).toFixed(1)),
    budget: 60, // No budget field in API — use placeholder
    attorney: (m.clientName || "?")[0].toUpperCase(),
  }));

  // Monthly billing ring
  const paidAmount     = invoices.filter(i => (i.status || "").toLowerCase() === "paid").reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalBilled    = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const billedPct      = totalBilled > 0 ? Math.round((paidAmount / totalBilled) * 100) : 0;
  const fmtR = (n) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Stats cards built from real data
  const STATS = [
    { id: 1, label: "Hours Today",        value: hoursToday.toFixed(1),         unit: "hrs",  sub: `${todayEntries.length} entries today`,             up: true,  icon: Clock,       accent: "#8DC63F" },
    { id: 2, label: "Billable This Month",value: fmtR(billableMonth),            unit: "",     sub: `${billingRate}% billing rate`,                     up: true,  icon: DollarSign,  accent: "#8DC63F" },
    { id: 3, label: "Active Matters",     value: String(activeMatters.length),   unit: "",     sub: `${matters.length} total matters`,                  up: true,  icon: Briefcase,   accent: "#8DC63F" },
    { id: 4, label: "Pending Invoices",   value: String(pendingInvoices.length), unit: "",     sub: `${fmtR(pendingAmount)} outstanding`,                up: false, icon: FileText,    accent: "#f59e0b" },
  ];

  // Live timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatElapsed = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#080D1A",
        padding: "28px 32px",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      {/* ── Welcome bar ── */}
      <div
        style={{
          ...fadeIn(0),
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>
            Thursday, 1 May 2026
          </p>
          <h2 style={{ fontSize: "26px", fontWeight: 700, margin: "4px 0 0", color: "#fff", letterSpacing: "-0.5px" }}>
            Good morning, Amukelani.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
            You have <span style={{ color: "#8DC63F", fontWeight: 600 }}>{loading ? "…" : `${recentEntries.length} recent time entries`}</span> to review today.
          </p>
        </div>

        {/* Quick timer widget */}
        <div
          style={{
            background: "#0D1426",
            border: `1px solid ${timerRunning ? "#8DC63F" : "rgba(141,198,63,0.2)"}`,
            borderRadius: "10px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: timerRunning ? "0 0 20px rgba(141,198,63,0.15)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <div>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
              Quick Timer
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: timerRunning ? "#8DC63F" : "rgba(255,255,255,0.5)",
                fontVariantNumeric: "tabular-nums",
                margin: "2px 0 0",
                letterSpacing: "2px",
                fontFamily: "'Courier New', monospace",
                transition: "color 0.3s ease",
              }}
            >
              {formatElapsed(elapsed)}
            </p>
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "none",
              background: timerRunning ? "rgba(141,198,63,0.2)" : "#8DC63F",
              color: timerRunning ? "#8DC63F" : "#0A0F1E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            {timerRunning ? (
              <span style={{ width: "10px", height: "10px", background: "currentColor", borderRadius: "2px" }} />
            ) : (
              <Play style={{ width: "16px", height: "16px", marginLeft: "2px" }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          ...fadeIn(100),
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", gap: "10px" }}>
            <div style={{ width: "20px", height: "20px", border: "2px solid rgba(141,198,63,0.2)", borderTop: "2px solid #8DC63F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Loading dashboard…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              style={{
                background: "#0D1426",
                border: "1px solid rgba(141,198,63,0.12)",
                borderRadius: "10px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s ease, transform 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Background glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  background: `radial-gradient(circle, ${stat.accent}18 0%, transparent 70%)`,
                  borderRadius: "50%",
                }}
              />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: `${stat.accent}18`,
                    border: `1px solid ${stat.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px", color: stat.accent }} />
                </div>
                <ArrowUpRight
                  style={{
                    width: "14px",
                    height: "14px",
                    color: stat.up ? "#8DC63F" : "#f59e0b",
                    transform: stat.up ? "rotate(0deg)" : "rotate(90deg)",
                  }}
                />
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "4px 0 2px", letterSpacing: "-0.5px" }}>
                {stat.value}
                {stat.unit && <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginLeft: "4px" }}>{stat.unit}</span>}
              </p>
              <p style={{ fontSize: "11px", color: stat.up ? "#8DC63F" : "#f59e0b", margin: 0 }}>
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Recent Time Entries */}
          <div style={{ ...fadeIn(200), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(141,198,63,0.1)" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Recent Time Entries</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>Today's captured activity</p>
              </div>
              <button
                style={{
                  fontSize: "11px",
                  color: "#8DC63F",
                  background: "rgba(141,198,63,0.1)",
                  border: "1px solid rgba(141,198,63,0.25)",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                }}
              >
                View All
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Matter", "Task", "Attorney", "Time", "Units", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>Loading entries…</td></tr>
                ) : recentEntries.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No time entries yet.</td></tr>
                ) : recentEntries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: i < recentEntries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{entry.matter}</p>
                      <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", margin: "2px 0 0", letterSpacing: "0.5px" }}>{entry.ref}</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{entry.task}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{entry.time}</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.06)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {entry.attorney}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#8DC63F", margin: 0 }}>{entry.duration}</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{entry.units} units</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          ...statusStyle(entry.status),
                        }}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active Matters */}
          <div style={{ ...fadeIn(300), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Active Matters</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>Hours used vs budget</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {loading ? (
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>Loading matters…</p>
              ) : activeMattersList.length === 0 ? (
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No active matters.</p>
              ) : activeMattersList.map((matter) => {
                const pct = Math.min(matter.budget > 0 ? (matter.hours / matter.budget) * 100 : 0, 100);
                const overBudget = pct >= 90;
                return (
                  <div key={matter.id}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#8DC63F",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#0A0F1E",
                          }}
                        >
                          {matter.attorney}
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{matter.name}</p>
                          <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.5)", margin: 0 }}>{matter.ref}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: overBudget ? "#f59e0b" : "#8DC63F", margin: 0 }}>
                          {matter.hours} / {matter.budget} hrs
                        </p>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{Math.round(pct)}% used</p>
                      </div>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: overBudget
                            ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                            : "linear-gradient(90deg, #8DC63F, #6aaa1f)",
                          borderRadius: "4px",
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Billing summary donut-style */}
          <div style={{ ...fadeIn(200), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Monthly Billing</h3>
            {/* Simple visual ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <svg viewBox="0 0 120 120" style={{ width: "120px", height: "120px", transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="48"
                    fill="none"
                    stroke="#8DC63F"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 48 * (billedPct / 100)} ${2 * Math.PI * 48}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#8DC63F" }}>{billedPct}%</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>BILLED</span>
                </div>
              </div>
            </div>
            {[
              { label: "Collected",    value: fmtR(paidAmount),                  color: "#8DC63F" },
              { label: "Outstanding",  value: fmtR(pendingAmount),               color: "#f59e0b" },
              { label: "Total Billed", value: fmtR(totalBilled),                 color: "rgba(255,255,255,0.2)" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: row.color }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{row.label}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Auto Activity Feed */}
          <div style={{ ...fadeIn(300), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Activity Feed</h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#8DC63F",
                  background: "rgba(141,198,63,0.1)",
                  border: "1px solid rgba(141,198,63,0.3)",
                  padding: "2px 7px",
                  borderRadius: "20px",
                  letterSpacing: "1px",
                }}
              >
                AUTO
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {ACTIVITY_FEED.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "6px",
                    transition: "background 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      background: "rgba(141,198,63,0.1)",
                      border: "1px solid rgba(141,198,63,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {activityIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{item.time}</span>
                      {item.auto && (
                        <span style={{ fontSize: "9px", color: "#8DC63F", background: "rgba(141,198,63,0.08)", padding: "1px 5px", borderRadius: "3px" }}>
                          auto-captured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
