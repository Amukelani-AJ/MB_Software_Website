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

const SEED_ATTORNEY_STATS = [
  { name: "Amukelani Ndlovu",  initials: "AN", hours: 42.5, target: 50, matters: 4, invoiced: 76500 },
  { name: "Pieter Venter",     initials: "PV", hours: 38.0, target: 50, matters: 3, invoiced: 68400 },
  { name: "Sipho Mokoena",     initials: "SM", hours: 35.5, target: 50, matters: 3, invoiced: 63900 },
  { name: "Zanele Dlamini",    initials: "ZD", hours: 31.0, target: 50, matters: 2, invoiced: 55800 },
  { name: "Ruan Esterhuizen",  initials: "RE", hours: 28.5, target: 50, matters: 2, invoiced: 51300 },
  { name: "Nomsa Khumalo",     initials: "NK", hours: 24.0, target: 50, matters: 2, invoiced: 43200 },
  { name: "David Ferreira",    initials: "DF", hours: 19.5, target: 50, matters: 1, invoiced: 35100 },
  { name: "Lerato Sithole",    initials: "LS", hours: 16.0, target: 50, matters: 1, invoiced: 28800 },
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

const AVATAR_HUES = [85, 103, 118, 133, 148, 163, 178, 193];
const MEDAL_COLORS = ["text-amber-400", "text-slate-400", "text-amber-700"];

const fmtR = (n) => `R ${Math.round(n || 0).toLocaleString("en-ZA")}`;
const toDateStr = (d) => (d || "").split("T")[0];

const f = (obj, ...keys) => {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
};

// ── MiniBar ───────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color || "#8DC63F" }}
      />
    </div>
  );
}

// ── BarChartViz ───────────────────────────────────────────────────────────────
function BarChartViz({ data, visible }) {
  const maxHours  = Math.max(...data.map((d) => d.hours), 1);
  const maxBilled = Math.max(...data.map((d) => d.billed), 1);
  return (
    <div className="relative">
      <div className="mb-1.5 flex justify-between">
        <span className="text-[9px] tracking-widest text-white/20 uppercase">Hours / Billed Value</span>
        <span className="text-[9px] text-white/20">Peak: {maxHours} hrs · {fmtR(maxBilled)}</span>
      </div>
      <div className="relative flex h-[130px] items-end gap-2 pb-6">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
            <div className="flex h-[100px] w-full items-end gap-0.5">
              <div
                title={`${d.hours} hrs`}
                className="min-h-[3px] flex-1 cursor-default rounded-t-sm transition-all duration-[900ms]"
                style={{
                  height: visible ? `${(d.hours / maxHours) * 100}%` : "0%",
                  background: "linear-gradient(180deg, #8DC63F 0%, rgba(141,198,63,0.5) 100%)",
                  transitionDelay: `${i * 60}ms`,
                }}
              />
              <div
                title={fmtR(d.billed)}
                className="min-h-[3px] flex-1 cursor-default rounded-t-sm transition-all duration-[900ms]"
                style={{
                  height: visible ? `${(d.billed / maxBilled) * 100}%` : "0%",
                  background: "linear-gradient(180deg, #60a5fa 0%, rgba(96,165,250,0.35) 100%)",
                  transitionDelay: `${i * 60 + 30}ms`,
                }}
              />
            </div>
            <span className="mt-1.5 text-center text-[10px] text-white/30">{d.month}</span>
          </div>
        ))}
        <div className="absolute bottom-[22px] left-0 right-0 h-px bg-white/5" />
      </div>
    </div>
  );
}

// ── DonutChart ────────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.hours, 0);
  if (total === 0)
    return <p className="py-5 text-center text-[13px] text-white/25">No entries for this period.</p>;

  const r    = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.hours / total;
    const seg = { ...d, pct, offset: offset * circ, dash: pct * circ };
    offset += pct;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="-rotate-90 shrink-0" width="110" height="110">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        {segments.map((s, i) => (
          <circle
            key={i} cx="60" cy="60" r={r} fill="none"
            stroke={s.color} strokeWidth="14" strokeLinecap="butt"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>
      <div className="flex flex-1 flex-col gap-1.5">
        {data.slice(0, 6).map((d) => (
          <div key={d.type} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="text-[11px] text-white/50">{d.type}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-white">{d.hours}h</span>
              <span className="ml-1 text-[9px] text-white/25">
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
  const [period,       setPeriod]       = useState("This Month");
  const [visible,      setVisible]      = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [timeEntries,  setTimeEntries]  = useState([]);
  const [attorneys,    setAttorneys]    = useState([]);
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teRes, aRes, invRes] = await Promise.all([
          fetch(`${API}/TimeEntry`), fetch(`${API}/Attorney`), fetch(`${API}/Invoice`),
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

  const eDate     = (e) => f(e, "WorkDate",     "workDate");
  const eUnits    = (e) => f(e, "Units",        "units")        || 0;
  const eBilled   = (e) => f(e, "BilledAmount", "billedAmount") || 0;
  const eName     = (e) => f(e, "AttorneyName", "attorneyName") || "";
  const eMatter   = (e) => f(e, "MatterNumber", "matterNumber") || "";
  const eClient   = (e) => f(e, "ClientName",   "clientName")   || "";
  const eCategory = (e) => f(e, "Category",     "category")     || "Other";
  const iDate     = (i) => f(i, "CreatedAt",    "createdAt");
  const iAmount   = (i) => f(i, "TotalAmount",  "totalAmount")  || 0;
  const aName     = (a) => f(a, "Name",         "name")         || "";
  const aRate     = (a) => f(a, "HourlyRate",   "hourlyRate")   || 0;

  const periodEntries   = timeEntries.filter((e) => inPeriod(eDate(e)));
  const hasRealData     = periodEntries.length > 0;
  const totalHours      = periodEntries.reduce((s, e) => s + (eUnits(e) * 6) / 60, 0);
  const totalBill       = periodEntries.reduce((s, e) => s + eBilled(e), 0);
  const totalInvoice    = invoices.filter((i) => inPeriod(iDate(i))).reduce((s, i) => s + iAmount(i), 0);
  const uniqueAttorneys = new Set(periodEntries.map((e) => eName(e)).filter(Boolean)).size;

  const MONTHLY = (() => {
    const real = Array.from({ length: 7 }, (_, i) => {
      const d   = new Date(thisYear, thisMonth - (6 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const ents = timeEntries.filter((e) => toDateStr(eDate(e)).startsWith(key));
      return {
        month:  d.toLocaleString("default", { month: "short" }),
        hours:  parseFloat(ents.reduce((s, e) => s + (eUnits(e) * 6) / 60, 0).toFixed(1)),
        billed: ents.reduce((s, e) => s + eBilled(e), 0),
      };
    });
    return real.some((r) => r.hours > 0) ? real : SEED_MONTHLY;
  })();

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

  const TARGET_HRS    = 50;
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

  // ── Smart insights ─────────────────────────────────────────────────────────
  const insights = (() => {
    const list = [];
    const top  = attorneyStats[0];
    const bot  = attorneyStats[attorneyStats.length - 1];
    const topM = MATTER_PERF[0];

    if (top) {
      const pct = Math.round((top.hours / top.target) * 100);
      const adj = pct >= 100 ? "exceeded" : pct >= 80 ? "is close to" : "is behind on";
      list.push({ icon: "🏆", label: "Top Performer", text: `${top.name.split(" ")[0]} leads this period with ${top.hours} hrs — ${pct}% of the ${top.target}-hr target. They ${adj} their monthly goal across ${top.matters} matter${top.matters !== 1 ? "s" : ""}.` });
    }
    if (bot && bot.name !== top?.name && bot.hours < bot.target * 0.5) {
      const gap = parseFloat((bot.target - bot.hours).toFixed(1));
      list.push({ icon: "⚠️", label: "Capacity Alert", text: `${bot.name.split(" ")[0]} has only logged ${bot.hours} hrs this period — ${gap} hrs below target. Consider reviewing their matter assignments to improve utilisation.` });
    }
    if (topM) {
      const share = totalBill > 0 ? Math.round((topM.billed / totalBill) * 100) : 0;
      list.push({ icon: "💼", label: "Top Matter", text: `${topM.name} (${topM.ref}) is the highest-billing matter at ${fmtR(topM.billed)} — ${share}% of all billable value this period across ${topM.hours} hrs of work.` });
    }
    if (ACTIVITY_BREAKDOWN.length > 0) {
      const topCat        = ACTIVITY_BREAKDOWN[0];
      const totalCatHours = ACTIVITY_BREAKDOWN.reduce((s, c) => s + c.hours, 0);
      const catPct        = totalCatHours > 0 ? Math.round((topCat.hours / totalCatHours) * 100) : 0;
      list.push({ icon: "📊", label: "Work Breakdown", text: `${topCat.type} dominates the team's activity at ${topCat.hours} hrs (${catPct}% of all logged time). This reflects the firm's current workload focus for this period.` });
    }
    if (totalBill > 0) {
      const gap = totalBill - totalInvoice;
      list.push({ icon: "🧾", label: "Invoice Gap", text: `Total billable value is ${fmtR(totalBill)} vs ${fmtR(totalInvoice)} invoiced. ${gap > 0 ? `${fmtR(gap)} in billable work has not yet been converted to invoices — review pending matters.` : "All billable work has been invoiced. Good coverage."}` });
    }
    if (attorneyStats.length > 1) {
      const avgHours = parseFloat((attorneyStats.reduce((s, a) => s + a.hours, 0) / attorneyStats.length).toFixed(1));
      const spread   = top ? parseFloat((top.hours - avgHours).toFixed(1)) : 0;
      list.push({ icon: "👥", label: "Team Average", text: `The team averages ${avgHours} hrs per attorney this period. ${top ? `${top.name.split(" ")[0]} is ${spread} hrs above average` : ""}, suggesting an uneven distribution of work. Balancing matters could improve overall utilisation.` });
    }
    return list;
  })();

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["Attorney", "Hours", "Target", "% of Target", "Matters", "Invoiced (R)"],
      ...attorneyStats.map((a) => [a.name, a.hours, a.target, `${Math.round((a.hours / a.target) * 100)}%`, a.matters, Math.round(a.invoiced)]),
      [], ["Top Matters", "Ref", "Hours", "Billed (R)"],
      ...MATTER_PERF.map((m) => [m.name, m.ref, m.hours, Math.round(m.billed)]),
      [], ["Summary", "Value"],
      ["Period", period], ["Total Hours", totalHours.toFixed(1)],
      ["Billable Value", Math.round(totalBill)], ["Invoiced", Math.round(totalInvoice)],
      ["Active Attorneys", uniqueAttorneys],
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `MB_Report_${period.replace(/\s/g, "_")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const show = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Loading */}
      {loading && (
        <div className="flex h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#8DC63F]/20 border-t-[#8DC63F]" />
          <p className="text-[13px] text-white/35">Loading reports…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className={`mb-5 flex items-end justify-between transition-all duration-500 ${show}`}>
            <div>
              <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">Productivity &amp; Billing</p>
              <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">Reports</h2>
              <p className="m-0 mt-1 text-[13px] text-white/35">Attorney performance, billing trends and matter analysis</p>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Period selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => { setPeriod(e.target.value); setInsightIndex(0); }}
                  className="cursor-pointer appearance-none rounded-lg border border-[#8DC63F]/20 bg-[#0D1426] py-2.5 pl-3.5 pr-9 text-xs text-white/70 outline-none"
                >
                  {["This Month", "Last Month", "Q1 2026", "Q4 2025", "This Year"].map((o) => (
                    <option key={o} className="bg-[#0D1426]">{o}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              </div>
              {/* Export */}
              <button
                onClick={handleExport}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#8DC63F]/30 bg-[#8DC63F]/10 px-4 py-2.5 text-xs font-semibold text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Insights carousel */}
          {insights.length > 0 && (
            <div className={`mb-5 flex items-center gap-2.5 rounded-xl border border-[#8DC63F]/20 bg-[#8DC63F]/[0.06] px-4 py-3 transition-all delay-[40ms] duration-500 ${show}`}>
              <Lightbulb className="h-4 w-4 shrink-0 text-[#8DC63F]" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#8DC63F]">
                  {insights[insightIndex].icon} {insights[insightIndex].label}
                </span>
                <span className="ml-2 text-[13px] text-white/65">{insights[insightIndex].text}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setInsightIndex((i) => (i - 1 + insights.length) % insights.length)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#8DC63F]/25 bg-transparent text-white/40 transition-colors hover:bg-[#8DC63F]/15 hover:text-[#8DC63F]"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <span className="min-w-[30px] text-center text-[10px] text-white/30">
                  {insightIndex + 1} / {insights.length}
                </span>
                <button
                  onClick={() => setInsightIndex((i) => (i + 1) % insights.length)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#8DC63F]/25 bg-transparent text-white/40 transition-colors hover:bg-[#8DC63F]/15 hover:text-[#8DC63F]"
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* KPI cards */}
          <div className={`mb-5 grid grid-cols-4 gap-3.5 transition-all delay-[80ms] duration-500 ${show}`}>
            {[
              { label: "Total Hours",      value: `${totalHours.toFixed(1)} hrs`, sub: "team this period",     icon: Clock,      color: "#8DC63F" },
              { label: "Billable Value",   value: fmtR(totalBill),                sub: "from time entries",    icon: DollarSign, color: "#8DC63F" },
              { label: "Invoiced",         value: fmtR(totalInvoice),             sub: "sent to clients",      icon: BarChart3,  color: "#60a5fa" },
              { label: "Active Attorneys", value: String(uniqueAttorneys || attorneyStats.length), sub: "billing this period", icon: Users, color: "#a78bfa" },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="group relative cursor-default overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-[18px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DC63F]/35"
                >
                  <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full" style={{ background: `${c.color}10` }} />
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border"
                    style={{ background: `${c.color}15`, borderColor: `${c.color}25` }}
                  >
                    <Icon className="h-[15px] w-[15px]" style={{ color: c.color }} />
                  </div>
                  <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">{c.label}</p>
                  <p className="m-0 mt-1 text-[22px] font-bold">{c.value}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-white/25">{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div className={`mb-4 grid grid-cols-[1fr_300px] gap-4 transition-all delay-[140ms] duration-500 ${show}`}>
            {/* Monthly bar chart */}
            <div className="rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="m-0 text-sm font-bold">Monthly Performance</h3>
                  <p className="m-0 mt-0.5 text-[11px] text-white/30">Hours billed vs revenue generated — last 7 months</p>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "Hours",  bg: "linear-gradient(180deg,#8DC63F,rgba(141,198,63,0.5))" },
                    { label: "Billed", bg: "linear-gradient(180deg,#60a5fa,rgba(96,165,250,0.35))" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ background: l.bg }} />
                      <span className="text-[11px] text-white/40">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <BarChartViz data={MONTHLY} visible={visible} />
            </div>

            {/* Donut */}
            <div className="rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5">
              <h3 className="m-0 text-sm font-bold">Activity Breakdown</h3>
              <p className="m-0 mb-4 mt-0.5 text-[11px] text-white/30">Hours by task type this period</p>
              <DonutChart data={ACTIVITY_BREAKDOWN} />
            </div>
          </div>

          {/* Bottom row */}
          <div className={`grid grid-cols-2 gap-4 transition-all delay-200 duration-500 ${show}`}>

            {/* Attorney performance */}
            <div className="rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5">
              <h3 className="m-0 text-sm font-bold">Attorney Performance</h3>
              <p className="m-0 mb-4 mt-0.5 text-[11px] text-white/30">Hours logged vs {TARGET_HRS}-hr monthly target</p>
              <div className="flex flex-col gap-4">
                {attorneyStats.length === 0 ? (
                  <p className="py-4 text-center text-[13px] text-white/25">No data for this period.</p>
                ) : attorneyStats.map((a, i) => {
                  const pct        = Math.round((a.hours / a.target) * 100);
                  const overTarget = pct >= 100;
                  const barColor   = overTarget ? "#8DC63F" : i === 0 ? "#60a5fa" : "rgba(141,198,63,0.4)";
                  return (
                    <div key={a.name}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: `hsl(${AVATAR_HUES[i] ?? 85}, 55%, 42%)` }}
                          >
                            {a.initials}
                          </div>
                          <div>
                            <p className="m-0 text-[13px] font-semibold">{a.name}</p>
                            <p className="m-0 text-[10px] text-white/30">
                              {a.matters} matter{a.matters !== 1 ? "s" : ""} · {fmtR(a.invoiced)} billed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`m-0 text-[13px] font-bold ${overTarget ? "text-[#8DC63F]" : ""}`}>
                            {a.hours} / {a.target} hrs
                          </p>
                          <p className={`m-0 text-[10px] ${overTarget ? "text-[#8DC63F]" : "text-white/30"}`}>
                            {pct}% of target
                          </p>
                        </div>
                      </div>
                      <MiniBar value={a.hours} max={a.target} color={barColor} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top matters */}
            <div className="rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5">
              <h3 className="m-0 text-sm font-bold">Top Matters by Revenue</h3>
              <p className="m-0 mb-4 mt-0.5 text-[11px] text-white/30">Highest billing matters this period</p>
              <div className="flex flex-col gap-4">
                {MATTER_PERF.length === 0 ? (
                  <p className="py-4 text-center text-[13px] text-white/25">No data for this period.</p>
                ) : MATTER_PERF.map((m, idx) => {
                  const maxB = MATTER_PERF[0].billed;
                  return (
                    <div key={m.ref}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`min-w-[18px] text-[11px] font-bold ${MEDAL_COLORS[idx] ?? "text-[#8DC63F]/40"}`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="m-0 text-[13px] font-semibold">{m.name}</p>
                            <p className="m-0 text-[10px] text-[#8DC63F]/50">{m.ref} · {m.hours} hrs</p>
                          </div>
                        </div>
                        <p className="m-0 text-[13px] font-bold text-[#8DC63F]">{fmtR(m.billed)}</p>
                      </div>
                      <MiniBar value={m.billed} max={maxB} color={idx === 0 ? "#8DC63F" : "rgba(141,198,63,0.4)"} />
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
