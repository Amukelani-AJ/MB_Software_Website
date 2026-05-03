import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  Play,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
  Users,
  TrendingUp,
} from "lucide-react";

const API = "https://localhost:7291/api";

// ── Seed attorneys (matches your DB seed) ─────────────────────────────────────
const SEED_ATTORNEYS = [
  { id: 1, name: "Amukelani Ndlovu" },
  { id: 2, name: "Pieter Venter" },
  { id: 3, name: "Sipho Mokoena" },
  { id: 4, name: "Zanele Dlamini" },
  { id: 5, name: "Ruan Esterhuizen" },
  { id: 6, name: "Nomsa Khumalo" },
  { id: 7, name: "David Ferreira" },
  { id: 8, name: "Lerato Sithole" },
];

// ── Live simulated activity feed ─────────────────────────────────────────────
const LIVE_EVENTS = [
  { id: 1,  type: "email",   attorney: "Amukelani Ndlovu", desc: "Email sent to Transnet re: arbitration hearing date",       time: 2  },
  { id: 2,  type: "doc",     attorney: "Pieter Venter",    desc: "Heads_of_Argument_v4.docx — 38 min active editing",         time: 8  },
  { id: 3,  type: "call",    attorney: "Sipho Mokoena",    desc: "Call logged: SARS legal team — tax objection (22 min)",      time: 15 },
  { id: 4,  type: "meeting", attorney: "Zanele Dlamini",   desc: "Calendar: Dlamini Investments consultation captured",        time: 31 },
  { id: 5,  type: "browser", attorney: "Ruan Esterhuizen", desc: "Browser: saflii.org open 45 min — mining rights precedents", time: 47 },
  { id: 6,  type: "email",   attorney: "Nomsa Khumalo",    desc: "Email received: Pick n Pay — contract amendment queries",    time: 62 },
  { id: 7,  type: "doc",     attorney: "David Ferreira",   desc: "Settlement_Agreement_Draft.docx — 19 min editing",          time: 75 },
  { id: 8,  type: "call",    attorney: "Lerato Sithole",   desc: "Call: Discovery Health — benefit dispute (11 min)",          time: 90 },
];

const activityIcon = (type) => ({
  email: "✉", doc: "📄", call: "📞", meeting: "📅", browser: "🌐", invoice: "🧾"
}[type] || "•");

const fmtR = (n) =>
  `R ${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const toDateStr = (d) => (d ? d.split("T")[0] : "");

// ── Helpers ───────────────────────────────────────────────────────────────────
const nowDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const nowMonthStr = () => nowDateStr().slice(0, 7);

const friendlyDate = () => {
  return new Date().toLocaleDateString("en-ZA", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ── Main Component ────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const [elapsed, setElapsed]       = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [visible, setVisible]       = useState(false);

  const [timeEntries, setTimeEntries] = useState([]);
  const [matters, setMatters]         = useState([]);
  const [invoices, setInvoices]       = useState([]);
  const [attorneys, setAttorneys]     = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teRes, mRes, invRes, attRes] = await Promise.all([
          fetch(`${API}/TimeEntry`),
          fetch(`${API}/Matter`),
          fetch(`${API}/Invoice`),
          fetch(`${API}/Attorney`),
        ]);
        const [te, m, inv, att] = await Promise.all([
          teRes.json(), mRes.json(), invRes.json(), attRes.json(),
        ]);
        setTimeEntries(Array.isArray(te)  ? te  : []);
        setMatters(Array.isArray(m)       ? m   : []);
        setInvoices(Array.isArray(inv)    ? inv : []);
        setAttorneys(Array.isArray(att)   ? att : SEED_ATTORNEYS);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setAttorneys(SEED_ATTORNEYS);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchAll();
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let iv;
    if (timerRunning) iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [timerRunning]);

  const fmtElapsed = (s) => {
    const h   = Math.floor(s / 3600).toString().padStart(2, "0");
    const min = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${min}:${sec}`;
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const today      = nowDateStr();
  const thisMonth  = nowMonthStr();

  const todayEntries   = timeEntries.filter((e) => toDateStr(e.WorkDate ?? e.workDate) === today);
  const hoursToday     = todayEntries.reduce((s, e) => s + ((e.Units ?? e.units ?? 0) * 6) / 60, 0);

  const monthEntries   = timeEntries.filter((e) => toDateStr(e.WorkDate ?? e.workDate).startsWith(thisMonth));
  const billableMonth  = monthEntries.reduce((s, e) => s + (e.BilledAmount ?? e.billedAmount ?? 0), 0);
  const totalBilledAll = timeEntries.reduce((s, e) => s + (e.BilledAmount ?? e.billedAmount ?? 0), 0);
  const billingRate    = totalBilledAll > 0 ? Math.round((billableMonth / totalBilledAll) * 100) : 0;

  const activeMatters  = matters.filter((m) => {
    const s = (m.Status ?? m.status ?? "").toLowerCase();
    return s === "active" || s === "open";
  });

  const pendingInvoices = invoices.filter(
    (i) => (i.Status ?? i.status ?? "").toLowerCase() !== "paid"
  );
  const pendingAmount   = pendingInvoices.reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const paidAmount      = invoices.filter((i) => (i.Status ?? i.status ?? "").toLowerCase() === "paid")
                            .reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const totalBilledInv  = invoices.reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const billedPct       = totalBilledInv > 0 ? Math.round((paidAmount / totalBilledInv) * 100) : 0;

  // Recent entries (last 5)
  const recentEntries = [...timeEntries]
    .sort((a, b) => {
      const da = toDateStr(b.WorkDate ?? b.workDate);
      const db = toDateStr(a.WorkDate ?? a.workDate);
      return da.localeCompare(db);
    })
    .slice(0, 5)
    .map((e) => ({
      id:       e.Id        ?? e.id,
      matter:   e.ClientName  ?? e.clientName  ?? "—",
      ref:      e.MatterNumber ?? e.matterNumber ?? "—",
      task:     e.Narrative  ?? e.narrative   ?? "—",
      attorney: e.AttorneyName ?? e.attorneyName ?? "—",
      duration: `${(((e.Units ?? e.units ?? 0) * 6) / 60).toFixed(1)} hrs`,
      units:    e.Units ?? e.units ?? 0,
      rate:     e.HourlyRate  ?? e.hourlyRate  ?? 0,
      billed:   e.BilledAmount ?? e.billedAmount ?? 0,
      date:     toDateStr(e.WorkDate ?? e.workDate) || "—",
    }));

  // Per-attorney billing bar chart data
  const attorneyHours = timeEntries.reduce((acc, e) => {
    const name = e.AttorneyName ?? e.attorneyName;
    if (!name) return acc;
    const shortName = name.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ");
    acc[shortName] = (acc[shortName] || 0) + ((e.Units ?? e.units ?? 0) * 6) / 60;
    return acc;
  }, {});

  const attorneyBilling = timeEntries.reduce((acc, e) => {
    const name = e.AttorneyName ?? e.attorneyName;
    if (!name) return acc;
    const shortName = name.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ");
    acc[shortName] = (acc[shortName] || 0) + (e.BilledAmount ?? e.billedAmount ?? 0);
    return acc;
  }, {});

  // If no real data, fall back to seed attorneys with placeholder data
  const barData = (() => {
    const keys = Object.keys(attorneyHours);
    if (keys.length > 0) {
      return keys
        .map((k) => ({ name: k, hours: parseFloat(attorneyHours[k].toFixed(1)), billed: attorneyBilling[k] || 0 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 6);
    }
    // Seed fallback for demo
    return [
      { name: "A. Ndlovu",    hours: 42.5, billed: 76500  },
      { name: "P. Venter",    hours: 38.0, billed: 68400  },
      { name: "S. Mokoena",   hours: 35.5, billed: 63900  },
      { name: "Z. Dlamini",   hours: 31.0, billed: 55800  },
      { name: "R. Esterhuizen", hours: 28.5, billed: 51300 },
      { name: "N. Khumalo",   hours: 24.0, billed: 43200  },
    ];
  })();

  const maxHours = Math.max(...barData.map((d) => d.hours), 1);

  // Active matters list (top 4)
  const matterHoursMap = timeEntries.reduce((acc, e) => {
    const key = e.MatterNumber ?? e.matterNumber;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + ((e.Units ?? e.units ?? 0) * 6) / 60;
    return acc;
  }, {});

  const activeMattersList = activeMatters.slice(0, 4).map((m) => ({
    id:     m.Id    ?? m.id,
    name:   m.ClientName ?? m.clientName ?? "—",
    ref:    m.MatterNumber ?? m.matterNumber ?? "—",
    desc:   m.Description ?? m.description ?? "",
    hours:  parseFloat((matterHoursMap[m.MatterNumber ?? m.matterNumber] || 0).toFixed(1)),
    budget: 60,
    initial:(m.ClientName ?? m.clientName ?? "?")[0].toUpperCase(),
  }));

  const STATS = [
    {
      id: 1, label: "Hours Today",
      value: hoursToday.toFixed(1), unit: "hrs",
      sub: `${todayEntries.length} entries logged today`,
      up: true, icon: Clock, accent: "#8DC63F",
    },
    {
      id: 2, label: "Billable This Month",
      value: fmtR(billableMonth), unit: "",
      sub: `${billingRate}% of total billing`,
      up: true, icon: DollarSign, accent: "#8DC63F",
    },
    {
      id: 3, label: "Active Matters",
      value: String(activeMatters.length), unit: "",
      sub: `${matters.length} total matters`,
      up: true, icon: Briefcase, accent: "#8DC63F",
    },
    {
      id: 4, label: "Pending Invoices",
      value: String(pendingInvoices.length), unit: "",
      sub: `${fmtR(pendingAmount)} outstanding`,
      up: false, icon: FileText, accent: "#f59e0b",
    },
  ];

  const fadeIn = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  const card = {
    background: "#0D1426",
    border: "1px solid rgba(141,198,63,0.12)",
    borderRadius: "12px",
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* ── Pending invoices alert ── */}
      {!loading && pendingInvoices.length > 0 && (
        <div
          style={{
            ...fadeIn(0),
            marginBottom: "20px",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "10px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
          onClick={() => navigate("/billing")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle style={{ width: "15px", height: "15px", color: "#f59e0b", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>{pendingInvoices.length} invoice{pendingInvoices.length > 1 ? "s" : ""}</span>
              {" "}pending payment — {fmtR(pendingAmount)} outstanding
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#f59e0b", fontWeight: 600, letterSpacing: "0.5px" }}>
            Review <ChevronRight style={{ width: "13px", height: "13px" }} />
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ ...fadeIn(0), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>
            {friendlyDate()}
          </p>
          <h2 style={{ fontSize: "26px", fontWeight: 700, margin: "4px 0 0", color: "#fff", letterSpacing: "-0.5px" }}>
            {greeting()}, Amukelani.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
            {loading
              ? "Loading your dashboard…"
              : `${recentEntries.length} recent time entries · ${activeMatters.length} active matters · ${attorneys.length || SEED_ATTORNEYS.length} attorneys`
            }
          </p>
        </div>

        {/* Quick timer */}
        <div
          style={{
            ...card,
            borderColor: timerRunning ? "#8DC63F" : "rgba(141,198,63,0.2)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: timerRunning ? "0 0 24px rgba(141,198,63,0.15)" : "none",
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
              {fmtElapsed(elapsed)}
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
            {timerRunning
              ? <span style={{ width: "10px", height: "10px", background: "currentColor", borderRadius: "2px" }} />
              : <Play style={{ width: "16px", height: "16px", marginLeft: "2px" }} />
            }
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ ...fadeIn(100), display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {loading
          ? (
            <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: "10px" }}>
              <div style={{ width: "18px", height: "18px", border: "2px solid rgba(141,198,63,0.2)", borderTop: "2px solid #8DC63F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Loading dashboard…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )
          : STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                style={{ ...card, padding: "20px", position: "relative", overflow: "hidden", cursor: "default", transition: "border-color 0.2s ease, transform 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: `radial-gradient(circle, ${stat.accent}18 0%, transparent 70%)`, borderRadius: "50%" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${stat.accent}18`, border: `1px solid ${stat.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: "16px", height: "16px", color: stat.accent }} />
                  </div>
                  <ArrowUpRight style={{ width: "14px", height: "14px", color: stat.up ? "#8DC63F" : "#f59e0b", transform: stat.up ? "rotate(0deg)" : "rotate(90deg)" }} />
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "4px 0 2px", letterSpacing: "-0.5px" }}>
                  {stat.value}
                  {stat.unit && <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginLeft: "4px" }}>{stat.unit}</span>}
                </p>
                <p style={{ fontSize: "11px", color: stat.up ? "#8DC63F" : "#f59e0b", margin: 0 }}>{stat.sub}</p>
              </div>
            );
          })
        }
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Recent Time Entries table */}
          <div style={{ ...fadeIn(150), ...card, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(141,198,63,0.1)" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Recent Time Entries</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>Latest captured activity across all attorneys</p>
              </div>
              <button
                onClick={() => navigate("/time-entries")}
                style={{ fontSize: "11px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                View All <ChevronRight style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Matter", "Task", "Attorney", "Date", "Units", "Billed"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>Loading entries…</td></tr>
                  : recentEntries.length === 0
                    ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No time entries yet.</td></tr>
                    : recentEntries.map((entry, i) => (
                      <tr
                        key={entry.id}
                        style={{ borderBottom: i < recentEntries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "13px 20px" }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{entry.matter}</p>
                          <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.6)", margin: "2px 0 0" }}>{entry.ref}</p>
                        </td>
                        <td style={{ padding: "13px 20px", maxWidth: "180px" }}>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.task}</p>
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "4px" }}>
                            {entry.attorney.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ")}
                          </span>
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{entry.date}</p>
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{entry.units} u</p>
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#8DC63F", margin: 0 }}>{fmtR(entry.billed)}</p>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Attorney Productivity Bar Chart */}
          <div style={{ ...fadeIn(200), ...card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Attorney Productivity</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>Hours billed per attorney — all time</p>
              </div>
              <TrendingUp style={{ width: "16px", height: "16px", color: "rgba(141,198,63,0.4)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {barData.map((att, i) => {
                const pct = (att.hours / maxHours) * 100;
                return (
                  <div key={att.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "26px", height: "26px", borderRadius: "50%",
                          background: `hsl(${85 + i * 15}, 60%, 45%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "9px", fontWeight: 700, color: "#fff",
                        }}>
                          {att.name.split(".")[1]?.[1]?.toUpperCase() || att.name[0]}
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{att.name}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#8DC63F" }}>{att.hours} hrs</span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginLeft: "8px" }}>{fmtR(att.billed)}</span>
                      </div>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: visible ? `${pct}%` : "0%",
                        background: `linear-gradient(90deg, #8DC63F, hsl(${85 + i * 12}, 60%, 50%))`,
                        borderRadius: "4px",
                        transition: `width 1s ease ${200 + i * 80}ms`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Matters */}
          <div style={{ ...fadeIn(250), ...card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Active Matters</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>Hours logged vs estimated budget</p>
              </div>
              <button
                onClick={() => navigate("/matters")}
                style={{ fontSize: "11px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                View All <ChevronRight style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {loading
                ? <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>Loading matters…</p>
                : activeMattersList.length === 0
                  ? <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No active matters.</p>
                  : activeMattersList.map((m) => {
                    const pct = Math.min(m.budget > 0 ? (m.hours / m.budget) * 100 : 0, 100);
                    const warn = pct >= 90;
                    return (
                      <div key={m.id}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#0A0F1E" }}>
                              {m.initial}
                            </div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{m.name}</p>
                              <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.5)", margin: 0 }}>{m.ref}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "12px", fontWeight: 600, color: warn ? "#f59e0b" : "#8DC63F", margin: 0 }}>{m.hours} / {m.budget} hrs</p>
                            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{Math.round(pct)}% used</p>
                          </div>
                        </div>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: warn ? "linear-gradient(90deg, #f59e0b, #ef4444)" : "linear-gradient(90deg, #8DC63F, #6aaa1f)", borderRadius: "4px", transition: "width 1s ease" }} />
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Monthly Billing donut */}
          <div style={{ ...fadeIn(200), ...card, padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Monthly Billing</h3>
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
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#8DC63F" }}>{billedPct}%</span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>COLLECTED</span>
                </div>
              </div>
            </div>
            {[
              { label: "Collected",    value: fmtR(paidAmount),    color: "#8DC63F" },
              { label: "Outstanding",  value: fmtR(pendingAmount), color: "#f59e0b" },
              { label: "Total Billed", value: fmtR(totalBilledInv),color: "rgba(255,255,255,0.2)" },
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

          {/* Attorney roster */}
          <div style={{ ...fadeIn(250), ...card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Attorneys</h3>
              <Users style={{ width: "14px", height: "14px", color: "rgba(141,198,63,0.4)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(attorneys.length > 0 ? attorneys : SEED_ATTORNEYS).slice(0, 6).map((att, i) => {
                const name   = att.Name ?? att.name ?? "—";
                const email  = att.Email ?? att.email ?? "";
                const rate   = att.HourlyRate ?? att.hourlyRate ?? 0;
                const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={att.Id ?? att.id ?? i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", transition: "background 0.15s ease", cursor: "default" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${85 + i * 18}, 55%, 42%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                      {rate > 0 && <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.5)", margin: 0 }}>{fmtR(rate)}/hr</p>}
                    </div>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#8DC63F", flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto Activity Feed */}
          <div style={{ ...fadeIn(300), ...card, padding: "20px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Live Activity</h3>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", padding: "2px 7px", borderRadius: "20px", letterSpacing: "1px" }}>AUTO</span>
              {/* Pulsing dot */}
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8DC63F", display: "inline-block", animation: "pulse 2s ease-in-out infinite", marginLeft: "auto" }} />
              <style>{`@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }`}</style>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {LIVE_EVENTS.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", gap: "10px", padding: "9px 8px", borderRadius: "6px", transition: "background 0.15s ease", cursor: "default" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                    {activityIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span style={{ fontSize: "10px", color: "#8DC63F", fontWeight: 600 }}>{item.attorney.split(" ")[0]}</span>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{item.time} min ago</span>
                      <span style={{ fontSize: "9px", color: "#8DC63F", background: "rgba(141,198,63,0.08)", padding: "1px 5px", borderRadius: "3px", marginLeft: "2px" }}>auto</span>
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
