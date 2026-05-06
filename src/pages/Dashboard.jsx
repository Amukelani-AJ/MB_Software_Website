import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, DollarSign, Briefcase, FileText,
  Play, ArrowUpRight, AlertTriangle,
  ChevronRight, Users, TrendingUp,
} from "lucide-react";

const API = "https://localhost:7291/api";

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

const LIVE_EVENTS = [
  { id: 1, type: "email",   attorney: "Amukelani Ndlovu", desc: "Email sent to Transnet re: arbitration hearing date",        time: 2  },
  { id: 2, type: "doc",     attorney: "Pieter Venter",    desc: "Heads_of_Argument_v4.docx — 38 min active editing",          time: 8  },
  { id: 3, type: "call",    attorney: "Sipho Mokoena",    desc: "Call logged: SARS legal team — tax objection (22 min)",       time: 15 },
  { id: 4, type: "meeting", attorney: "Zanele Dlamini",   desc: "Calendar: Dlamini Investments consultation captured",         time: 31 },
  { id: 5, type: "browser", attorney: "Ruan Esterhuizen", desc: "Browser: saflii.org open 45 min — mining rights precedents",  time: 47 },
  { id: 6, type: "email",   attorney: "Nomsa Khumalo",    desc: "Email received: Pick n Pay — contract amendment queries",     time: 62 },
  { id: 7, type: "doc",     attorney: "David Ferreira",   desc: "Settlement_Agreement_Draft.docx — 19 min editing",           time: 75 },
  { id: 8, type: "call",    attorney: "Lerato Sithole",   desc: "Call: Discovery Health — benefit dispute (11 min)",           time: 90 },
];

const activityIcon = (type) =>
  ({ email: "✉", doc: "📄", call: "📞", meeting: "📅", browser: "🌐", invoice: "🧾" }[type] || "•");

const fmtR = (n) =>
  `R ${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const toDateStr = (d) => (d ? d.split("T")[0] : "");

const nowDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowMonthStr = () => nowDateStr().slice(0, 7);

const friendlyDate = () =>
  new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const AVATAR_HUES = [85, 103, 118, 133, 148, 163, 178, 193];

export function Dashboard() {
  const navigate = useNavigate();
  const [elapsed, setElapsed]           = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [visible, setVisible]           = useState(false);
  const [timeEntries, setTimeEntries]   = useState([]);
  const [matters, setMatters]           = useState([]);
  const [invoices, setInvoices]         = useState([]);
  const [attorneys, setAttorneys]       = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teRes, mRes, invRes, attRes] = await Promise.all([
          fetch(`${API}/TimeEntry`), fetch(`${API}/Matter`),
          fetch(`${API}/Invoice`),  fetch(`${API}/Attorney`),
        ]);
        const [te, m, inv, att] = await Promise.all([
          teRes.json(), mRes.json(), invRes.json(), attRes.json(),
        ]);
        setTimeEntries(Array.isArray(te)  ? te  : []);
        setMatters(Array.isArray(m)       ? m   : []);
        setInvoices(Array.isArray(inv)    ? inv : []);
        setAttorneys(Array.isArray(att)   ? att : SEED_ATTORNEYS);
      } catch {
        setAttorneys(SEED_ATTORNEYS);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchAll();
  }, []);

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
  const today     = nowDateStr();
  const thisMonth = nowMonthStr();

  const todayEntries   = timeEntries.filter((e) => toDateStr(e.WorkDate ?? e.workDate) === today);
  const hoursToday     = todayEntries.reduce((s, e) => s + ((e.Units ?? e.units ?? 0) * 6) / 60, 0);
  const monthEntries   = timeEntries.filter((e) => toDateStr(e.WorkDate ?? e.workDate).startsWith(thisMonth));
  const billableMonth  = monthEntries.reduce((s, e) => s + (e.BilledAmount ?? e.billedAmount ?? 0), 0);
  const totalBilledAll = timeEntries.reduce((s, e) => s + (e.BilledAmount ?? e.billedAmount ?? 0), 0);
  const billingRate    = totalBilledAll > 0 ? Math.round((billableMonth / totalBilledAll) * 100) : 0;

  const activeMatters   = matters.filter((m) => ["active", "open"].includes((m.Status ?? m.status ?? "").toLowerCase()));
  const pendingInvoices = invoices.filter((i) => (i.Status ?? i.status ?? "").toLowerCase() !== "paid");
  const pendingAmount   = pendingInvoices.reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const paidAmount      = invoices.filter((i) => (i.Status ?? i.status ?? "").toLowerCase() === "paid")
                            .reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const totalBilledInv  = invoices.reduce((s, i) => s + (i.TotalAmount ?? i.totalAmount ?? 0), 0);
  const billedPct       = totalBilledInv > 0 ? Math.round((paidAmount / totalBilledInv) * 100) : 0;

  const recentEntries = [...timeEntries]
    .sort((a, b) => toDateStr(b.WorkDate ?? b.workDate).localeCompare(toDateStr(a.WorkDate ?? a.workDate)))
    .slice(0, 5)
    .map((e) => ({
      id:       e.Id ?? e.id,
      matter:   e.ClientName   ?? e.clientName   ?? "—",
      ref:      e.MatterNumber ?? e.matterNumber ?? "—",
      task:     e.Narrative    ?? e.narrative    ?? "—",
      attorney: e.AttorneyName ?? e.attorneyName ?? "—",
      units:    e.Units ?? e.units ?? 0,
      billed:   e.BilledAmount ?? e.billedAmount ?? 0,
      date:     toDateStr(e.WorkDate ?? e.workDate) || "—",
    }));

  const attorneyHours = timeEntries.reduce((acc, e) => {
    const name = e.AttorneyName ?? e.attorneyName;
    if (!name) return acc;
    const short = name.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ");
    acc[short] = (acc[short] || 0) + ((e.Units ?? e.units ?? 0) * 6) / 60;
    return acc;
  }, {});
  const attorneyBilling = timeEntries.reduce((acc, e) => {
    const name = e.AttorneyName ?? e.attorneyName;
    if (!name) return acc;
    const short = name.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ");
    acc[short] = (acc[short] || 0) + (e.BilledAmount ?? e.billedAmount ?? 0);
    return acc;
  }, {});

  const barData = (() => {
    const keys = Object.keys(attorneyHours);
    if (keys.length > 0)
      return keys
        .map((k) => ({ name: k, hours: parseFloat(attorneyHours[k].toFixed(1)), billed: attorneyBilling[k] || 0 }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 6);
    return [
      { name: "A. Ndlovu",      hours: 42.5, billed: 76500 },
      { name: "P. Venter",      hours: 38.0, billed: 68400 },
      { name: "S. Mokoena",     hours: 35.5, billed: 63900 },
      { name: "Z. Dlamini",     hours: 31.0, billed: 55800 },
      { name: "R. Esterhuizen", hours: 28.5, billed: 51300 },
      { name: "N. Khumalo",     hours: 24.0, billed: 43200 },
    ];
  })();
  const maxHours = Math.max(...barData.map((d) => d.hours), 1);

  const matterHoursMap = timeEntries.reduce((acc, e) => {
    const key = e.MatterNumber ?? e.matterNumber;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + ((e.Units ?? e.units ?? 0) * 6) / 60;
    return acc;
  }, {});

  const activeMattersList = activeMatters.slice(0, 4).map((m) => ({
    id:      m.Id ?? m.id,
    name:    m.ClientName   ?? m.clientName   ?? "—",
    ref:     m.MatterNumber ?? m.matterNumber ?? "—",
    hours:   parseFloat((matterHoursMap[m.MatterNumber ?? m.matterNumber] || 0).toFixed(1)),
    budget:  60,
    initial: (m.ClientName ?? m.clientName ?? "?")[0].toUpperCase(),
  }));

  const STATS = [
    { id: 1, label: "Hours Today",        value: hoursToday.toFixed(1),         unit: "hrs", sub: `${todayEntries.length} entries logged today`,  up: true,  icon: Clock      },
    { id: 2, label: "Billable This Month", value: fmtR(billableMonth),           unit: "",    sub: `${billingRate}% of total billing`,              up: true,  icon: DollarSign },
    { id: 3, label: "Active Matters",      value: String(activeMatters.length),  unit: "",    sub: `${matters.length} total matters`,               up: true,  icon: Briefcase  },
    { id: 4, label: "Pending Invoices",    value: String(pendingInvoices.length),unit: "",    sub: `${fmtR(pendingAmount)} outstanding`,             up: false, icon: FileText   },
  ];

  const show = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Pending invoices alert */}
      {!loading && pendingInvoices.length > 0 && (
        <div
          onClick={() => navigate("/billing")}
          className={`mb-5 flex cursor-pointer items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-5 py-3 transition-all duration-500 ${show}`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="text-sm text-white/70">
              <span className="font-bold text-amber-400">
                {pendingInvoices.length} invoice{pendingInvoices.length > 1 ? "s" : ""}
              </span>{" "}
              pending payment — {fmtR(pendingAmount)} outstanding
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold tracking-wide text-amber-400">
            Review <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`mb-7 flex items-end justify-between transition-all duration-500 ${show}`}>
        <div>
          <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">{friendlyDate()}</p>
          <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">{greeting()}, Amukelani.</h2>
          <p className="m-0 mt-1 text-[13px] text-white/35">
            {loading
              ? "Loading your dashboard…"
              : `${recentEntries.length} recent time entries · ${activeMatters.length} active matters · ${attorneys.length || SEED_ATTORNEYS.length} attorneys`}
          </p>
        </div>

        {/* Quick timer */}
        <div className={`flex items-center gap-4 rounded-xl border bg-[#0D1426] px-5 py-3 transition-all duration-300 ${timerRunning ? "border-[#8DC63F] shadow-[0_0_24px_rgba(141,198,63,0.15)]" : "border-[#8DC63F]/20"}`}>
          <div>
            <p className="m-0 text-[9px] uppercase tracking-[2px] text-white/35">Quick Timer</p>
            <p className={`m-0 mt-0.5 font-mono text-2xl font-bold tabular-nums tracking-widest transition-colors duration-300 ${timerRunning ? "text-[#8DC63F]" : "text-white/50"}`}>
              {fmtElapsed(elapsed)}
            </p>
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none transition-all duration-200 ${timerRunning ? "bg-[#8DC63F]/20 text-[#8DC63F]" : "bg-[#8DC63F] text-[#0A0F1E]"}`}
          >
            {timerRunning
              ? <span className="h-2.5 w-2.5 rounded-sm bg-current" />
              : <Play className="ml-0.5 h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className={`mb-6 grid grid-cols-4 gap-4 transition-all delay-100 duration-500 ${show}`}>
        {loading ? (
          <div className="col-span-4 flex items-center justify-center gap-3 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8DC63F]/20 border-t-[#8DC63F]" />
            <span className="text-[13px] text-white/30">Loading dashboard…</span>
          </div>
        ) : STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="group relative cursor-default overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DC63F]/40"
            >
              <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full ${stat.up ? "bg-[#8DC63F]/[0.06]" : "bg-amber-500/[0.06]"}`} />
              <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${stat.up ? "border-[#8DC63F]/30 bg-[#8DC63F]/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                  <Icon className={`h-4 w-4 ${stat.up ? "text-[#8DC63F]" : "text-amber-400"}`} />
                </div>
                <ArrowUpRight className={`h-3.5 w-3.5 ${stat.up ? "text-[#8DC63F]" : "rotate-90 text-amber-400"}`} />
              </div>
              <p className="m-0 text-[11px] uppercase tracking-widest text-white/40">{stat.label}</p>
              <p className="m-0 mt-1 text-[22px] font-bold tracking-tight">
                {stat.value}
                {stat.unit && <span className="ml-1 text-[13px] text-white/40">{stat.unit}</span>}
              </p>
              <p className={`m-0 mt-0.5 text-[11px] ${stat.up ? "text-[#8DC63F]" : "text-amber-400"}`}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_320px] gap-5">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* Recent Time Entries */}
          <div className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-150 duration-500 ${show}`}>
            <div className="flex items-center justify-between border-b border-[#8DC63F]/10 px-5 py-4">
              <div>
                <h3 className="m-0 text-sm font-bold">Recent Time Entries</h3>
                <p className="m-0 mt-0.5 text-[11px] text-white/35">Latest captured activity across all attorneys</p>
              </div>
              <button
                onClick={() => navigate("/time-entries")}
                className="flex cursor-pointer items-center gap-1 rounded-md border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-3 py-1.5 text-[11px] tracking-wide text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {["Matter", "Task", "Attorney", "Date", "Units", "Billed"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-white/25">Loading entries…</td></tr>
                ) : recentEntries.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-white/25">No time entries yet.</td></tr>
                ) : recentEntries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`transition-colors duration-150 hover:bg-[#8DC63F]/[0.04] ${i < recentEntries.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <p className="m-0 text-[13px] font-semibold">{entry.matter}</p>
                      <p className="m-0 mt-0.5 text-[10px] text-[#8DC63F]/60">{entry.ref}</p>
                    </td>
                    <td className="max-w-[180px] px-5 py-3">
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-white/60">{entry.task}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50">
                        {entry.attorney.split(" ").map((w, i) => i === 0 ? w[0] + "." : w).join(" ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="m-0 text-xs text-white/40">{entry.date}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="m-0 text-xs text-white/40">{entry.units} u</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="m-0 text-[13px] font-semibold text-[#8DC63F]">{fmtR(entry.billed)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attorney Productivity */}
          <div className={`rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all delay-200 duration-500 ${show}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="m-0 text-sm font-bold">Attorney Productivity</h3>
                <p className="m-0 mt-0.5 text-[11px] text-white/35">Hours billed per attorney — all time</p>
              </div>
              <TrendingUp className="h-4 w-4 text-[#8DC63F]/40" />
            </div>
            <div className="flex flex-col gap-3">
              {barData.map((att, i) => {
                const pct = (att.hours / maxHours) * 100;
                return (
                  <div key={att.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ background: `hsl(${AVATAR_HUES[i] ?? 85}, 60%, 45%)` }}
                        >
                          {att.name.split(".")[1]?.[1]?.toUpperCase() || att.name[0]}
                        </div>
                        <span className="text-xs font-semibold">{att.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#8DC63F]">{att.hours} hrs</span>
                        <span className="ml-2 text-[10px] text-white/30">{fmtR(att.billed)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: visible ? `${pct}%` : "0%",
                          background: `linear-gradient(90deg, #8DC63F, hsl(${AVATAR_HUES[i] ?? 85}, 60%, 50%))`,
                          transitionDelay: `${200 + i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Matters */}
          <div className={`rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all delay-[250ms] duration-500 ${show}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="m-0 text-sm font-bold">Active Matters</h3>
                <p className="m-0 mt-0.5 text-[11px] text-white/35">Hours logged vs estimated budget</p>
              </div>
              <button
                onClick={() => navigate("/matters")}
                className="flex cursor-pointer items-center gap-1 rounded-md border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-3 py-1.5 text-[11px] text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {loading ? (
                <p className="py-4 text-center text-[13px] text-white/25">Loading matters…</p>
              ) : activeMattersList.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-white/25">No active matters.</p>
              ) : activeMattersList.map((m) => {
                const pct  = Math.min(m.budget > 0 ? (m.hours / m.budget) * 100 : 0, 100);
                const warn = pct >= 90;
                return (
                  <div key={m.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8DC63F] text-[10px] font-bold text-[#0A0F1E]">
                          {m.initial}
                        </div>
                        <div>
                          <p className="m-0 text-[13px] font-semibold">{m.name}</p>
                          <p className="m-0 text-[10px] text-[#8DC63F]/50">{m.ref}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`m-0 text-xs font-semibold ${warn ? "text-amber-400" : "text-[#8DC63F]"}`}>
                          {m.hours} / {m.budget} hrs
                        </p>
                        <p className="m-0 text-[10px] text-white/30">{Math.round(pct)}% used</p>
                      </div>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: warn ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#8DC63F,#6aaa1f)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* Monthly Billing donut */}
          <div className={`rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all delay-200 duration-500 ${show}`}>
            <h3 className="m-0 mb-4 text-sm font-bold">Monthly Billing</h3>
            <div className="mb-4 flex justify-center">
              <div className="relative h-[120px] w-[120px]">
                <svg viewBox="0 0 120 120" className="-rotate-90" width="120" height="120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="48" fill="none" stroke="#8DC63F"
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48 * (billedPct / 100)} ${2 * Math.PI * 48}`}
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#8DC63F]">{billedPct}%</span>
                  <span className="text-[9px] uppercase tracking-widest text-white/35">Collected</span>
                </div>
              </div>
            </div>
            {[
              { label: "Collected",    value: fmtR(paidAmount),     dot: "bg-[#8DC63F]" },
              { label: "Outstanding",  value: fmtR(pendingAmount),  dot: "bg-amber-400" },
              { label: "Total Billed", value: fmtR(totalBilledInv), dot: "bg-white/20"  },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-white/5 py-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${row.dot}`} />
                  <span className="text-xs text-white/50">{row.label}</span>
                </div>
                <span className="text-[13px] font-semibold">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Attorney roster */}
          <div className={`rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all delay-[250ms] duration-500 ${show}`}>
            <div className="mb-3.5 flex items-center justify-between">
              <h3 className="m-0 text-sm font-bold">Attorneys</h3>
              <Users className="h-3.5 w-3.5 text-[#8DC63F]/40" />
            </div>
            <div className="flex flex-col gap-1">
              {(attorneys.length > 0 ? attorneys : SEED_ATTORNEYS).slice(0, 6).map((att, i) => {
                const name     = att.Name ?? att.name ?? "—";
                const rate     = att.HourlyRate ?? att.hourlyRate ?? 0;
                const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={att.Id ?? att.id ?? i}
                    className="flex cursor-default items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-[#8DC63F]/[0.05]"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: `hsl(${AVATAR_HUES[i] ?? 85}, 55%, 42%)` }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold">{name}</p>
                      {rate > 0 && <p className="m-0 text-[10px] text-[#8DC63F]/50">{fmtR(rate)}/hr</p>}
                    </div>
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8DC63F]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className={`flex-1 rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all delay-300 duration-500 ${show}`}>
            <div className="mb-3.5 flex items-center gap-2">
              <h3 className="m-0 text-sm font-bold">Live Activity</h3>
              <span className="rounded-full border border-[#8DC63F]/30 bg-[#8DC63F]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#8DC63F]">
                AUTO
              </span>
              <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[#8DC63F]" />
            </div>
            <div className="flex flex-col gap-0.5">
              {LIVE_EVENTS.map((item) => (
                <div
                  key={item.id}
                  className="flex cursor-default gap-2.5 rounded-md px-2 py-2.5 transition-colors hover:bg-[#8DC63F]/[0.05]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#8DC63F]/20 bg-[#8DC63F]/10 text-xs">
                    {activityIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-snug text-white/65">
                      {item.desc}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#8DC63F]">{item.attorney.split(" ")[0]}</span>
                      <span className="text-[9px] text-white/20">·</span>
                      <span className="text-[9px] text-white/25">{item.time} min ago</span>
                      <span className="ml-0.5 rounded bg-[#8DC63F]/[0.08] px-1 py-px text-[9px] text-[#8DC63F]">auto</span>
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
