import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, BarChart3, ChevronDown } from "lucide-react";

const API = "https://localhost:7291/api";

const CATEGORY_COLORS = {
  Drafting:     "#8DC63F",
  Research:     "#60a5fa",
  Court:        "#a78bfa",
  Meeting:      "#f472b6",
  Consultation: "#34d399",
  Communication:"#fb923c",
  Call:         "#fb923c",
  Email:        "#facc15",
  Admin:        "#94a3b8",
};

function fmtR(n) { return `R ${Math.round(n).toLocaleString()}`; }

function MiniBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginTop: "6px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color || "#8DC63F", borderRadius: "4px", transition: "width 1s ease" }} />
    </div>
  );
}

function BarChartViz({ data }) {
  const maxHours = Math.max(...data.map((d) => d.hours));
  const maxBilled = Math.max(...data.map((d) => d.billed));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "140px", paddingBottom: "24px", position: "relative" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", display: "flex", gap: "2px", alignItems: "flex-end", height: "110px" }}>
            <div style={{ flex: 1, background: "rgba(141,198,63,0.7)", borderRadius: "3px 3px 0 0", height: `${(d.hours / maxHours) * 100}%`, transition: "height 0.8s ease", minHeight: "4px" }} title={`${d.hours} hrs`} />
            <div style={{ flex: 1, background: "rgba(96,165,250,0.5)", borderRadius: "3px 3px 0 0", height: `${(d.billed / maxBilled) * 100}%`, transition: "height 0.8s ease", minHeight: "4px" }} title={fmtR(d.billed)} />
          </div>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>{d.month}</span>
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.hours, 0);
  let offset = 0;
  const r = 54; const circ = 2 * Math.PI * r;
  const segments = data.map((d) => {
    const pct = d.hours / total;
    const seg = { ...d, pct, offset: offset * circ, dash: pct * circ };
    offset += pct;
    return seg;
  });

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
      <svg viewBox="0 0 120 120" style={{ width: "120px", height: "120px", transform: "rotate(-90deg)", flexShrink: 0 }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        {segments.map((s, i) => (
          <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={-s.offset} strokeLinecap="butt" />
        ))}
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {data.map((d) => (
          <div key={d.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{d.type}</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff" }}>{d.hours} hrs</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  const [period, setPeriod] = useState("This Month");
  const [visible, setVisible] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [attorneys, setAttorneys]     = useState([]);
  const [invoices, setInvoices]       = useState([]);
  const [loading, setLoading]         = useState(true);

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
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchAll();
  }, []);

  // ── Date helpers ──────────────────────────────────────────────────────────
  const toDateStr = (d) => (d || "").split("T")[0];
  const now       = new Date();
  const thisYear  = now.getFullYear();
  const thisMonth = now.getMonth(); // 0-indexed

  const inPeriod = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(toDateStr(dateStr));
    if (period === "This Month")  return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
    if (period === "Last Month")  { const lm = thisMonth === 0 ? 11 : thisMonth - 1; const ly = thisMonth === 0 ? thisYear - 1 : thisYear; return d.getFullYear() === ly && d.getMonth() === lm; }
    if (period === "Q1 2026")     return d.getFullYear() === 2026 && d.getMonth() <= 2;
    if (period === "Q4 2025")     return d.getFullYear() === 2025 && d.getMonth() >= 9;
    if (period === "This Year")   return d.getFullYear() === thisYear;
    return true;
  };

  const periodEntries = timeEntries.filter(e => inPeriod(e.workDate));

  // ── KPI totals ────────────────────────────────────────────────────────────
  const totalHours   = periodEntries.reduce((s, e) => s + (e.units * 6) / 60, 0);
  const totalBill    = periodEntries.reduce((s, e) => s + (e.billedAmount || 0), 0);
  const totalInvoice = invoices.filter(i => inPeriod(i.createdAt)).reduce((s, i) => s + (i.totalAmount || 0), 0);
  const avgBillRate  = totalHours > 0 ? Math.round((totalBill / (totalHours * (periodEntries[0]?.hourlyRate || 2000))) * 100) : 0;

  // ── Monthly performance (last 7 months) ───────────────────────────────────
  const MONTHLY = Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(thisYear, thisMonth - (6 - i), 1);
    const yr  = d.getFullYear();
    const mo  = d.getMonth();
    const key = `${yr}-${String(mo + 1).padStart(2, "0")}`;
    const ents = timeEntries.filter(e => toDateStr(e.workDate).startsWith(key));
    return {
      month:  d.toLocaleString("default", { month: "short" }),
      hours:  parseFloat(ents.reduce((s, e) => s + (e.units * 6) / 60, 0).toFixed(1)),
      billed: ents.reduce((s, e) => s + (e.billedAmount || 0), 0),
    };
  });

  // ── Activity breakdown (donut) ────────────────────────────────────────────
  const categoryTotals = periodEntries.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat]  = (acc[cat] || 0) + (e.units * 6) / 60;
    return acc;
  }, {});
  const ACTIVITY_BREAKDOWN = Object.entries(categoryTotals)
    .map(([type, hrs]) => ({ type, hours: parseFloat(hrs.toFixed(1)), color: CATEGORY_COLORS[type] || "#94a3b8" }))
    .sort((a, b) => b.hours - a.hours);

  // ── Attorney performance ──────────────────────────────────────────────────
  const TARGET_HRS = 50; // default monthly target — no target field in API
  const attorneyStats = attorneys.map(a => {
    const aEntries  = periodEntries.filter(e => e.attorneyName === a.name);
    const hrs       = parseFloat(aEntries.reduce((s, e) => s + (e.units * 6) / 60, 0).toFixed(1));
    const billed    = aEntries.reduce((s, e) => s + (e.billedAmount || 0), 0);
    const matterSet = new Set(aEntries.map(e => e.matterNumber).filter(Boolean));
    const initials  = a.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return { name: a.name, initials, hours: hrs, target: TARGET_HRS, billable: hrs, rate: a.hourlyRate, matters: matterSet.size, invoiced: billed };
  }).filter(a => a.hours > 0).sort((a, b) => b.hours - a.hours);

  // ── Top matters by billed amount ──────────────────────────────────────────
  const matterBilled = periodEntries.reduce((acc, e) => {
    const key = e.matterNumber;
    if (!key) return acc;
    if (!acc[key]) acc[key] = { name: e.clientName || key, ref: key, hours: 0, billed: 0 };
    acc[key].hours  += (e.units * 6) / 60;
    acc[key].billed += e.billedAmount || 0;
    return acc;
  }, {});
  const MATTER_PERF = Object.values(matterBilled)
    .map(m => ({ ...m, hours: parseFloat(m.hours.toFixed(1)) }))
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 5);

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

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

      {/* Header */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Productivity & Billing</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Reports</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Attorney performance, billing trends and matter analysis</p>
        </div>
        <div style={{ position: "relative" }}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            style={{ appearance: "none", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "7px", color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "9px 36px 9px 14px", cursor: "pointer", outline: "none", fontFamily: "'Inter', sans-serif" }}>
            {["This Month", "Last Month", "Q1 2026", "Q4 2025", "This Year"].map((o) => <option key={o} style={{ background: "#0D1426" }}>{o}</option>)}
          </select>
          <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Hours",      value: `${totalHours.toFixed(1)} hrs`, sub: "team this period",  icon: Clock,      color: "#8DC63F", trend: "" },
          { label: "Billable Value",   value: fmtR(totalBill),                sub: "from time entries", icon: DollarSign, color: "#8DC63F", trend: "" },
          { label: "Invoiced",         value: fmtR(totalInvoice),             sub: "sent to clients",   icon: BarChart3,  color: "#60a5fa", trend: "" },
          { label: "Avg Billing Rate", value: `${avgBillRate}%`,              sub: "billable vs total", icon: TrendingUp, color: "#8DC63F", trend: "" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "60px", height: "60px", background: `${c.color}10`, borderRadius: "50%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: `${c.color}15`, border: `1px solid ${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: "15px", height: "15px", color: c.color }} />
                </div>
                {c.trend && <span style={{ fontSize: "11px", color: "#8DC63F", fontWeight: 600 }}>{c.trend}</span>}
              </div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: "4px 0 2px" }}>{c.value}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ ...fadeIn(140), display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>

        {/* Bar chart */}
        <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>Monthly Performance</h3>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "3px 0 0" }}>Hours billed vs revenue generated</p>
            </div>
            <div style={{ display: "flex", gap: "14px" }}>
              {[{ color: "rgba(141,198,63,0.7)", label: "Hours" }, { color: "rgba(96,165,250,0.5)", label: "Billed" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: l.color }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <BarChartViz data={MONTHLY} />
        </div>

        {/* Donut */}
        <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Activity Breakdown</h3>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>Hours by task type this month</p>
          <DonutChart data={ACTIVITY_BREAKDOWN} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ ...fadeIn(200), display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Attorney performance */}
        <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Attorney Performance</h3>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>Hours logged vs monthly target</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {attorneyStats.length === 0 ? (
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No data for this period.</p>
            ) : attorneyStats.map((a) => {
              const pct      = Math.round((a.hours / a.target) * 100);
              const billRate = a.hours > 0 ? Math.round((a.billable / a.hours) * 100) : 0;
              const overTarget = pct >= 100;
              return (
                <div key={a.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#8DC63F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0A0F1E" }}>{a.initials}</div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{a.matters} matters · {billRate}% billable</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: overTarget ? "#8DC63F" : "#fff", margin: 0 }}>{a.hours} / {a.target} hrs</p>
                      <p style={{ fontSize: "10px", color: overTarget ? "#8DC63F" : "rgba(255,255,255,0.3)", margin: 0 }}>{pct}% of target</p>
                    </div>
                  </div>
                  <MiniBar value={a.hours} max={a.target} color={overTarget ? "#8DC63F" : "#60a5fa"} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>Invoiced: <span style={{ color: "#8DC63F" }}>{fmtR(a.invoiced)}</span></span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>Rate: R {a.rate.toLocaleString()}/hr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top matters */}
        <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Top Matters by Revenue</h3>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 20px" }}>Highest billing matters this period</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {MATTER_PERF.length === 0 ? (
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0" }}>No data for this period.</p>
            ) : MATTER_PERF.map((m, idx) => {
              const maxBilled = MATTER_PERF[0].billed;
              const pct = (m.billed / maxBilled) * 100;
              return (
                <div key={m.ref}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(141,198,63,0.5)", minWidth: "18px" }}>#{idx + 1}</span>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{m.name}</p>
                        <p style={{ fontSize: "10px", color: "rgba(141,198,63,0.5)", margin: 0 }}>{m.ref} · {m.hours} hrs</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(m.billed)}</p>
                  </div>
                  <MiniBar value={m.billed} max={maxBilled} color="#8DC63F" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
}
