import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, BarChart3, ChevronDown } from "lucide-react";

const ATTORNEYS = [
  { name: "Amukelani Ndlovu",  initials: "AN", hours: 42.5, target: 50, billable: 38.0, rate: 2200, matters: 8,  invoiced: 83600 },
  { name: "Sipho Mokoena",     initials: "SM", hours: 35.0, target: 50, billable: 29.5, rate: 1900, matters: 6,  invoiced: 56050 },
  { name: "Thabo Sithole",     initials: "TS", hours: 28.0, target: 40, billable: 22.0, rate: 1800, matters: 5,  invoiced: 39600 },
];

const MONTHLY = [
  { month: "Nov", hours: 120, billed: 210000 },
  { month: "Dec", hours: 85,  billed: 148750 },
  { month: "Jan", hours: 132, billed: 231000 },
  { month: "Feb", hours: 118, billed: 206500 },
  { month: "Mar", hours: 145, billed: 253750 },
  { month: "Apr", hours: 138, billed: 241500 },
  { month: "May", hours: 105, billed: 179250 },
];

const ACTIVITY_BREAKDOWN = [
  { type: "Drafting",     hours: 42,  color: "#8DC63F" },
  { type: "Research",     hours: 31,  color: "#60a5fa" },
  { type: "Court",        hours: 18,  color: "#a78bfa" },
  { type: "Meetings",     hours: 24,  color: "#f472b6" },
  { type: "Consultation", hours: 15,  color: "#34d399" },
  { type: "Comms",        hours: 12,  color: "#fb923c" },
  { type: "Admin",        hours: 8,   color: "#facc15" },
];

const MATTER_PERF = [
  { name: "Transnet Arbitration", ref: "MAT-2024-029", hours: 118, billed: 295000, status: "active" },
  { name: "Khumalo v Nedbank",    ref: "MAT-2024-041", hours: 42,  billed: 92400,  status: "active" },
  { name: "SARS Appeal – Venter", ref: "MAT-2024-031", hours: 28,  billed: 56000,  status: "active" },
  { name: "Dlamini Estate",       ref: "MAT-2024-038", hours: 19,  billed: 34200,  status: "active" },
  { name: "Mbeki Family Trust",   ref: "MAT-2024-045", hours: 8,   billed: 14400,  status: "active" },
];

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

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const totalHours   = ATTORNEYS.reduce((s, a) => s + a.hours, 0);
  const totalBill    = ATTORNEYS.reduce((s, a) => s + a.billable * a.rate, 0);
  const totalInvoice = ATTORNEYS.reduce((s, a) => s + a.invoiced, 0);
  const avgBillRate  = Math.round((ATTORNEYS.reduce((s, a) => s + (a.billable / a.hours), 0) / ATTORNEYS.length) * 100);

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

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
          { label: "Total Hours",       value: `${totalHours} hrs`,     sub: "team this month",  icon: Clock,       color: "#8DC63F", trend: "+8%" },
          { label: "Billable Value",    value: fmtR(totalBill),         sub: "from time entries",icon: DollarSign,  color: "#8DC63F", trend: "+12%" },
          { label: "Invoiced",          value: fmtR(totalInvoice),      sub: "sent to clients",  icon: BarChart3,   color: "#60a5fa", trend: "+5%" },
          { label: "Avg Billing Rate",  value: `${avgBillRate}%`,       sub: "billable vs total",icon: TrendingUp,  color: "#8DC63F", trend: "+3%" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "60px", height: "60px", background: `${c.color}10`, borderRadius: "50%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: `${c.color}15`, border: `1px solid ${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: "15px", height: "15px", color: c.color }} />
                </div>
                <span style={{ fontSize: "11px", color: "#8DC63F", fontWeight: 600 }}>{c.trend}</span>
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
            {ATTORNEYS.map((a) => {
              const pct = Math.round((a.hours / a.target) * 100);
              const billRate = Math.round((a.billable / a.hours) * 100);
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
            {MATTER_PERF.map((m, idx) => {
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
    </div>
  );
}
