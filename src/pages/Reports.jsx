import { useState, useEffect } from "react";
import {
  TrendingUp, Users, Clock, DollarSign,
  BarChart3, ChevronDown, Download, Lightbulb,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";

const API = "https://localhost:7291/api";

const CATEGORY_COLORS = {
  Drafting:      "#8DC63F",
  Research:      "#60a5fa",
  Court:         "#a78bfa",
  Meeting:       "#f472b6",
  Consultation:  "#34d399",
  Communication: "#fb923c",
  Call:          "#fb923c",
  Email:         "#facc15",
  Admin:         "#94a3b8",
  Other:         "#64748b",
};

// ── Seed fallback data (matches your Seed.cs) ─────────────────────────────────
const SEED_ATTORNEY_STATS = [
  { name: "Amukelani Ndlovu",  initials: "AN", hours: 42.5, target: 50, billable: 42.5, rate: 1800, matters: 4, invoiced: 76500 },
  { name: "Pieter Venter",     initials: "PV", hours: 38.0, target: 50, billable: 38.0, rate: 1800, matters: 3, invoiced: 68400 },
  { name: "Sipho Mokoena",     initials: "SM", hours: 35.5, target: 50, billable: 35.5, rate: 1800, matters: 3, invoiced: 63900 },
  { name: "Zanele Dlamini",    initials: "ZD", hours: 31.0, target: 50, billable: 31.0, rate: 1800, matters: 2, invoiced: 55800 },
  { name: "Ruan Esterhuizen",  initials: "RE", hours: 28.5, target: 50, billable: 28.5, rate: 1800, matters: 2, invoiced: 51300 },
  { name: "Nomsa Khumalo",     initials: "NK", hours: 24.0, target: 50, billable: 24.0, rate: 1800, matters: 2, invoiced: 43200 },
  { name: "David Ferreira",    initials: "DF", hours: 19.5, target: 50, billable: 19.5, rate: 1800, matters: 1, invoiced: 35100 },
  { name: "Lerato Sithole",    initials: "LS", hours: 16.0, target: 50, billable: 16.0, rate: 1800, matters: 1, invoiced: 28800 },
];

const SEED_MATTER_PERF = [
  { name: "Transnet SOC Ltd",        ref: "MAT-2024-001", hours: 28.5, billed: 51300 },
  { name: "Dlamini Investments",     ref: "MAT-2024-002", hours: 22.0, billed: 39600 },
  { name: "SARS Objection — Venter", ref: "MAT-2024-003", hours: 18.5, billed: 33300 },
  { name: "Pick n Pay Stores",       ref: "MAT-2024-004", hours: 15.0, billed: 27000 },
  { name: "Harmony Gold Mining",     ref: "MAT-2024-005", hours: 12.5, billed: 22500 },
];

const SEED_MONTHLY = [
  { month: "Nov", hours: 112, billed: 201600 },
  { month: "Dec", hours: 88,  billed: 158400 },
  { month: "Jan", hours: 134, billed: 241200 },
  { month: "Feb", hours: 158, billed: 284400 },
  { month: "Mar", hours: 143, billed: 257400 },
  { month: "Apr", hours: 167, billed: 300600 },
  { month: "May", hours: 55,  billed: 99000  },
];

const SEED_BREAKDOWN = [
  { type: "Drafting",      hours: 48.5, color: "#8DC63F" },
  { type: "Research",      hours: 32.0, color: "#60a5fa" },
  { type: "Court",         hours: 28.5, color: "#a78bfa" },
  { type: "Meeting",       hours: 21.0, color: "#f472b6" },
  { type: "Consultation",  hours: 18.5, color: "#34d399" },
  { type: "Communication", hours: 14.0, color: "#fb923c" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtR = (n) => `R ${Math.round(n || 0).toLocaleString("en-ZA")}`;
const toDateStr = (d) => (d || "").split("T")[0];

// PascalCase-safe field read
const f = (obj, ...keys) => {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
};

// ── Sub-components ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginTop: "6px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color || "#8DC63F", borderRadius: "4px", transition: "width 1s ease" }} />
    </div>
  );
}

function BarChartViz({ data, visible }) {
  const maxHours  = Math.max(...data.map((d) => d.hours), 1);
  const maxBilled = Math.max(...data.map((d) => d.billed), 1);
  return (
    <div style={{ position: "relative" }}>
      {/* Y-axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>HOURS / BILLED VALUE</span>
        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>Peak: {maxHours} hrs · {fmtR(maxBilled)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "130px", paddingBottom: "24px", position: "relative" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
            <div style={{ width: "100%", display: "flex", gap: "2px", alignItems: "flex-end", height: "100px" }}>
              <div
                title={`${d.hours} hrs`}
                style={{
                  flex: 1,
                  background: "linear-gradient(180deg, #8DC63F 0%, rgba(141,198,63,0.5) 100%)",
                  borderRadius: "3px 3px 0 0",
                  height: visible ? `${(d.hours / maxHours) * 100}%` : "0%",
                  transition: `height 0.9s ease ${i * 60}ms`,
                  minHeight: "3px",
                  cursor: "default",
                }}
              />
              <div
                title={fmtR(d.billed)}
                style={{
                  flex: 1,
                  background: "linear-gradient(180deg, #60a5fa 0%, rgba(96,165,250,0.35) 100%)",
                  borderRadius: "3px 3px 0 0",
                  height: visible ? `${(d.billed / maxBilled) * 100}%` : "0%",
                  transition: `height 0.9s ease ${i * 60 + 30}ms`,
                  minHeight: "3px",
                  cursor: "default",
                }}
              />
            </div>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "6px", textAlign: "center" }}>{d.month}</span>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: "22px", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.hours, 0);
  if (total === 0) return <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "20px 0" }}>No entries for this period.</p>;
  let offset = 0;
  const r = 52; const circ = 2 * Math.PI * r;
  const segments = data.map((d) => {
    const pct = d.hours / total;
    const seg = { ...d, pct, offset: offset * circ, dash: pct * circ };
    offset += pct;
    return seg;
  });
  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <svg viewBox="0 0 120 120" style={{ width: "110px", height: "110px", transform: "rotate(-90deg)", flexShrink: 0 }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        {segments.map((s, i) => (
          <circle
            key={i} cx="60" cy="60" r={r} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset} strokeLinecap="butt"
          />
        ))}
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "7px" }}>
        {data.slice(0, 6).map((d) => (
          <div key={d.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{d.type}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff" }}>{d.hours}h</span>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", marginLeft: "4px" }}>
                {total > 0 ? Math.round((d.hours / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Reports() {
  const [period,        setPeriod]      = useState("This Month");
  const [visible,       setVisible]     = useState(false);
  const [insightIndex,  setInsightIndex] = useState(0);
  const [timeEntries, setTimeEntries] = useState([]);
  const [attorneys,   setAttorneys]   = useState([]);
  const [invoices,    setInvoices]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teRes, aRes, invRes] = await Promise.all([
          fetch(`${API}/TimeEntry`),
          fetch(`${API}/Attorney`),
          fetch(`${API}/Invoice`),
        ]);
        const [te, a, inv] = await Promise.all([teRes.json(), aRes.json(), invRes.json()]);
        setTimeEntries(Array.isArray(te)  ? te  : []);
        setAttorneys(Array.isArray(a)     ? a   : []);
        setInvoices(Array.isArray(inv)    ? inv : []);
      } catch (e) {
        console.error("Reports fetch error:", e);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 80);
      }
    };
    fetchAll();
  }, []);

  // ── Date helpers ──────────────────────────────────────────────────────────
  const now       = new Date();
  const thisYear  = now.getFullYear();
  const thisMonth = now.getMonth();

  const inPeriod = (rawDate) => {
    if (!rawDate) return false;
    const d = new Date(toDateStr(rawDate));
    if (period === "This Month") return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
    if (period === "Last Month") {
      const lm = thisMonth === 0 ? 11 : thisMonth - 1;
      const ly = thisMonth === 0 ? thisYear - 1 : thisYear;
      return d.getFullYear() === ly && d.getMonth() === lm;
    }
    if (period === "Q1 2026")   return d.getFullYear() === 2026 && d.getMonth() <= 2;
    if (period === "Q4 2025")   return d.getFullYear() === 2025 && d.getMonth() >= 9;
    if (period === "This Year") return d.getFullYear() === thisYear;
    return true;
  };

  // PascalCase-safe access
  const eDate     = (e) => f(e, "WorkDate",    "workDate");
  const eUnits    = (e) => f(e, "Units",       "units")       || 0;
  const eBilled   = (e) => f(e, "BilledAmount","billedAmount") || 0;
  const eName     = (e) => f(e, "AttorneyName","attorneyName") || "";
  const eMatter   = (e) => f(e, "MatterNumber","matterNumber") || "";
  const eClient   = (e) => f(e, "ClientName",  "clientName")   || "";
  const eCategory = (e) => f(e, "Category",    "category")     || "Other";
  const iDate     = (i) => f(i, "CreatedAt",   "createdAt");
  const iAmount   = (i) => f(i, "TotalAmount", "totalAmount")  || 0;
  const iStatus   = (i) => (f(i, "Status",     "status")       || "").toLowerCase();
  const aName     = (a) => f(a, "Name",        "name")         || "";
  const aRate     = (a) => f(a, "HourlyRate",  "hourlyRate")   || 0;

  const periodEntries = timeEntries.filter((e) => inPeriod(eDate(e)));
  const hasRealData   = periodEntries.length > 0;

  // ── KPI totals ────────────────────────────────────────────────────────────
  const totalHours   = periodEntries.reduce((s, e) => s + (eUnits(e) * 6) / 60, 0);
  const totalBill    = periodEntries.reduce((s, e) => s + eBilled(e), 0);
  const totalInvoice = invoices.filter((i) => inPeriod(iDate(i))).reduce((s, i) => s + iAmount(i), 0);
  const uniqueAttorneys = new Set(periodEntries.map((e) => eName(e)).filter(Boolean)).size;

  // ── Monthly performance (last 7 months, real data or seed) ────────────────
  const MONTHLY = (() => {
    const real = Array.from({ length: 7 }, (_, i) => {
      const d   = new Date(thisYear, thisMonth - (6 - i), 1);
      const yr  = d.getFullYear();
      const mo  = d.getMonth();
      const key = `${yr}-${String(mo + 1).padStart(2, "0")}`;
      const ents = timeEntries.filter((e) => toDateStr(eDate(e)).startsWith(key));
      return {
        month:  d.toLocaleString("default", { month: "short" }),
        hours:  parseFloat(ents.reduce((s, e) => s + (eUnits(e) * 6) / 60, 0).toFixed(1)),
        billed: ents.reduce((s, e) => s + eBilled(e), 0),
      };
    });
    const anyData = real.some((r) => r.hours > 0);
    return anyData ? real : SEED_MONTHLY;
  })();

  // ── Activity breakdown ────────────────────────────────────────────────────
  const ACTIVITY_BREAKDOWN = (() => {
    const catTotals = periodEntries.reduce((acc, e) => {
      const cat = eCategory(e);
      acc[cat]  = (acc[cat] || 0) + (eUnits(e) * 6) / 60;
      return acc;
    }, {});
    const real = Object.entries(catTotals)
      .map(([type, hrs]) => ({ type, hours: parseFloat(hrs.toFixed(1)), color: CATEGORY_COLORS[type] || "#94a3b8" }))
      .sort((a, b) => b.hours - a.hours);
    return real.length > 0 ? real : SEED_BREAKDOWN;
  })();

  // ── Attorney performance ──────────────────────────────────────────────────
  const TARGET_HRS   = 50;
  const attorneyStats = (() => {
    if (attorneys.length > 0 && hasRealData) {
      return attorneys.map((a) => {
        const name     = aName(a);
        const aEntries = periodEntries.filter((e) => eName(e) === name);
        const hrs      = parseFloat(aEntries.reduce((s, e) => s + (eUnits(e) * 6) / 60, 0).toFixed(1));
        const billed   = aEntries.reduce((s, e) => s + eBilled(e), 0);
        const matters  = new Set(aEntries.map((e) => eMatter(e)).filter(Boolean)).size;
        const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return { name, initials, hours: hrs, target: TARGET_HRS, rate: aRate(a), matters, invoiced: billed };
      }).filter((a) => a.hours > 0).sort((a, b) => b.hours - a.hours);
    }
    return SEED_ATTORNEY_STATS;
  })();

  // ── Top matters ────────────────────────────────────────────────────────────
  const MATTER_PERF = (() => {
    if (hasRealData) {
      const map = periodEntries.reduce((acc, e) => {
        const key = eMatter(e);
        if (!key) return acc;
        if (!acc[key]) acc[key] = { name: eClient(e) || key, ref: key, hours: 0, billed: 0 };
        acc[key].hours  += (eUnits(e) * 6) / 60;
        acc[key].billed += eBilled(e);
        return acc;
      }, {});
      const real = Object.values(map)
        .map((m) => ({ ...m, hours: parseFloat(m.hours.toFixed(1)) }))
        .sort((a, b) => b.billed - a.billed)
        .slice(0, 5);
      if (real.length > 0) return real;
    }
    return SEED_MATTER_PERF;
  })();

  // ── Smart insights (array of 6) ───────────────────────────────────────────
  const insights = (() => {
    const list = [];
    const top  = attorneyStats[0];
    const bot  = attorneyStats[attorneyStats.length - 1];
    const topM = MATTER_PERF[0];

    // 1. Top performer vs target
    if (top) {
      const pct = Math.round((top.hours / top.target) * 100);
      const adj = pct >= 100 ? "exceeded" : pct >= 80 ? "is close to" : "is behind on";
      list.push({
        icon: "🏆",
        label: "Top Performer",
        text: `${top.name.split(" ")[0]} leads this period with ${top.hours} hrs — ${pct}% of the ${top.target}-hr target. They ${adj} their monthly goal across ${top.matters} matter${top.matters !== 1 ? "s" : ""}.`,
      });
    }

    // 2. Underutilised attorney
    if (bot && bot.name !== top?.name && bot.hours < bot.target * 0.5) {
      const gap = parseFloat((bot.target - bot.hours).toFixed(1));
      list.push({
        icon: "⚠️",
        label: "Capacity Alert",
        text: `${bot.name.split(" ")[0]} has only logged ${bot.hours} hrs this period — ${gap} hrs below target. Consider reviewing their matter assignments to improve utilisation.`,
      });
    }

    // 3. Top revenue matter
    if (topM) {
      const share = totalBill > 0 ? Math.round((topM.billed / totalBill) * 100) : 0;
      list.push({
        icon: "💼",
        label: "Top Matter",
        text: `${topM.name} (${topM.ref}) is the highest-billing matter at ${fmtR(topM.billed)} — ${share}% of all billable value this period across ${topM.hours} hrs of work.`,
      });
    }

    // 4. Category focus — what type of work dominates
    if (ACTIVITY_BREAKDOWN.length > 0) {
      const topCat   = ACTIVITY_BREAKDOWN[0];
      const totalCatHours = ACTIVITY_BREAKDOWN.reduce((s, c) => s + c.hours, 0);
      const catPct   = totalCatHours > 0 ? Math.round((topCat.hours / totalCatHours) * 100) : 0;
      list.push({
        icon: "📊",
        label: "Work Breakdown",
        text: `${topCat.type} dominates the team's activity at ${topCat.hours} hrs (${catPct}% of all logged time). This reflects the firm's current workload focus for this period.`,
      });
    }

    // 5. Billing gap — billed vs invoiced
    if (totalBill > 0 && totalInvoice >= 0) {
      const gap      = totalBill - totalInvoice;
      const gapLabel = gap > 0 ? `${fmtR(gap)} in billable work has not yet been invoiced` : "all billable work this period has been invoiced";
      list.push({
        icon: "🧾",
        label: "Invoice Gap",
        text: `Total billable value is ${fmtR(totalBill)} vs ${fmtR(totalInvoice)} invoiced. ${gap > 0 ? `${fmtR(gap)} in billable work has not yet been converted to invoices — review pending matters.` : "All billable work has been invoiced. Good coverage."}`,
      });
    }

    // 6. Team average vs top
    if (attorneyStats.length > 1) {
      const avgHours = parseFloat((attorneyStats.reduce((s, a) => s + a.hours, 0) / attorneyStats.length).toFixed(1));
      const spread   = top ? parseFloat((top.hours - avgHours).toFixed(1)) : 0;
      list.push({
        icon: "👥",
        label: "Team Average",
        text: `The team averages ${avgHours} hrs per attorney this period. ${top ? `${top.name.split(" ")[0]} is ${spread} hrs above average` : ""}, suggesting an uneven distribution of work. Balancing matters could improve overall utilisation.`,
      });
    }

    return list;
  })();

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["Attorney", "Hours", "Target", "% of Target", "Matters", "Invoiced (R)"],
      ...attorneyStats.map((a) => [
        a.name,
        a.hours,
        a.target,
        `${Math.round((a.hours / a.target) * 100)}%`,
        a.matters,
        Math.round(a.invoiced),
      ]),
      [],
      ["Top Matters", "Ref", "Hours", "Billed (R)"],
      ...MATTER_PERF.map((m) => [m.name, m.ref, m.hours, Math.round(m.billed)]),
      [],
      ["Summary", "Value"],
      ["Period", period],
      ["Total Hours", totalHours.toFixed(1)],
      ["Billable Value", Math.round(totalBill)],
      ["Invoiced", Math.round(totalInvoice)],
      ["Active Attorneys", uniqueAttorneys],
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `MB_Report_${period.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fadeIn = (d = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.45s ease ${d}ms, transform 0.45s ease ${d}ms`,
  });

  const card = { background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "12px" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(141,198,63,0.2)", borderTop: "3px solid #8DC63F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Loading reports…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && (<>

        {/* ── Header ── */}
        <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "22px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Productivity & Billing</p>
            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Reports</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
              Attorney performance, billing trends and matter analysis
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {/* Period selector */}
            <div style={{ position: "relative" }}>
              <select
                value={period}
                onChange={(e) => { setPeriod(e.target.value); setInsightIndex(0); }}
                style={{ appearance: "none", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "9px 36px 9px 14px", cursor: "pointer", outline: "none", fontFamily: "'Inter', sans-serif" }}
              >
                {["This Month", "Last Month", "Q1 2026", "Q4 2025", "This Year"].map((o) => (
                  <option key={o} style={{ background: "#0D1426" }}>{o}</option>
                ))}
              </select>
              <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            </div>
            {/* Export button */}
            <button
              onClick={handleExport}
              style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", color: "#8DC63F", borderRadius: "8px", padding: "9px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.1)")}
            >
              <Download style={{ width: "13px", height: "13px" }} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Insights carousel ── */}
        {insights.length > 0 && (
          <div style={{ ...fadeIn(40), marginBottom: "20px", background: "rgba(141,198,63,0.06)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Lightbulb style={{ width: "15px", height: "15px", color: "#8DC63F", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#8DC63F", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {insights[insightIndex].icon} {insights[insightIndex].label}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginLeft: "8px" }}>
                {insights[insightIndex].text}
              </span>
            </div>
            {/* Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => setInsightIndex((i) => (i - 1 + insights.length) % insights.length)}
                style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(141,198,63,0.25)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.15)"; e.currentTarget.style.color = "#8DC63F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <ChevronLeft style={{ width: "12px", height: "12px" }} />
              </button>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", minWidth: "30px", textAlign: "center" }}>
                {insightIndex + 1} / {insights.length}
              </span>
              <button
                onClick={() => setInsightIndex((i) => (i + 1) % insights.length)}
                style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(141,198,63,0.25)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.15)"; e.currentTarget.style.color = "#8DC63F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <ChevronRightIcon style={{ width: "12px", height: "12px" }} />
              </button>
            </div>
          </div>
        )}

        {/* ── KPI cards ── */}
        <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
          {[
            { label: "Total Hours",       value: `${totalHours.toFixed(1)} hrs`,    sub: "team this period",     icon: Clock,      color: "#8DC63F" },
            { label: "Billable Value",    value: fmtR(totalBill),                   sub: "from time entries",    icon: DollarSign, color: "#8DC63F" },
            { label: "Invoiced",          value: fmtR(totalInvoice),                sub: "sent to clients",      icon: BarChart3,  color: "#60a5fa" },
            { label: "Active Attorneys",  value: String(uniqueAttorneys || attorneyStats.length), sub: "billing this period", icon: Users, color: "#a78bfa" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                style={{ ...card, padding: "18px", position: "relative", overflow: "hidden", transition: "border-color 0.2s ease, transform 0.2s ease", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(141,198,63,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "60px", height: "60px", background: `${c.color}10`, borderRadius: "50%" }} />
                <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: `${c.color}15`, border: `1px solid ${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <Icon style={{ width: "15px", height: "15px", color: c.color }} />
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "4px 0 2px" }}>{c.value}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{c.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Charts row ── */}
        <div style={{ ...fadeIn(140), display: "grid", gridTemplateColumns: "1fr 300px", gap: "18px", marginBottom: "18px" }}>

          {/* Monthly bar chart */}
          <div style={{ ...card, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Monthly Performance</h3>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "3px 0 0" }}>Hours billed vs revenue generated — last 7 months</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {[{ color: "linear-gradient(180deg, #8DC63F, rgba(141,198,63,0.5))", label: "Hours" }, { color: "linear-gradient(180deg, #60a5fa, rgba(96,165,250,0.35))", label: "Billed" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: l.color }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <BarChartViz data={MONTHLY} visible={visible} />
          </div>

          {/* Donut */}
          <div style={{ ...card, padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Activity Breakdown</h3>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 18px" }}>Hours by task type this period</p>
            <DonutChart data={ACTIVITY_BREAKDOWN} />
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={{ ...fadeIn(200), display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

          {/* Attorney performance */}
          <div style={{ ...card, padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Attorney Performance</h3>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 18px" }}>Hours logged vs {TARGET_HRS}-hr monthly target</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {attorneyStats.length === 0
                ? <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No data for this period.</p>
                : attorneyStats.map((a, i) => {
                  const pct         = Math.round((a.hours / a.target) * 100);
                  const overTarget  = pct >= 100;
                  const barColor    = overTarget ? "#8DC63F" : i === 0 ? "#60a5fa" : "rgba(141,198,63,0.4)";
                  return (
                    <div key={a.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            background: `hsl(${85 + i * 18}, 55%, 42%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: 700, color: "#fff",
                          }}>
                            {a.initials}
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{a.name}</p>
                            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                              {a.matters} matter{a.matters !== 1 ? "s" : ""} · {fmtR(a.invoiced)} billed
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: overTarget ? "#8DC63F" : "#fff", margin: 0 }}>
                            {a.hours} / {a.target} hrs
                          </p>
                          <p style={{ fontSize: "10px", color: overTarget ? "#8DC63F" : "rgba(255,255,255,0.3)", margin: 0 }}>
                            {pct}% of target
                          </p>
                        </div>
                      </div>
                      <MiniBar value={a.hours} max={a.target} color={barColor} />
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Top matters */}
          <div style={{ ...card, padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Top Matters by Revenue</h3>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 18px" }}>Highest billing matters this period</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {MATTER_PERF.length === 0
                ? <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No data for this period.</p>
                : MATTER_PERF.map((m, idx) => {
                  const maxB = MATTER_PERF[0].billed;
                  const pct  = maxB > 0 ? (m.billed / maxB) * 100 : 0;
                  const medalColors = ["#f59e0b", "#94a3b8", "#b45309"];
                  return (
                    <div key={m.ref}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 700,
                            color: idx < 3 ? medalColors[idx] : "rgba(141,198,63,0.4)",
                            minWidth: "18px",
                          }}>
                            #{idx + 1}
                          </span>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{m.name}</p>
                            <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.5)", margin: 0 }}>
                              {m.ref} · {m.hours} hrs
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(m.billed)}</p>
                      </div>
                      <MiniBar value={m.billed} max={maxB} color={idx === 0 ? "#8DC63F" : "rgba(141,198,63,0.4)"} />
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>

      </>)}
    </div>
  );
}
