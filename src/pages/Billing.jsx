import { useState, useEffect } from "react";
import { FileText, Plus, Download, Eye, ChevronDown, X, CheckCircle, Clock, Search } from "lucide-react";

const MATTERS = [
  { id: 1, ref: "MAT-2024-041", name: "Khumalo v Nedbank",   client: "Thandi Khumalo",   rate: 2200 },
  { id: 2, ref: "MAT-2024-038", name: "Dlamini Estate",       client: "Bongani Dlamini",  rate: 1800 },
  { id: 3, ref: "MAT-2024-029", name: "Transnet Arbitration", client: "Transnet SOC Ltd", rate: 2500 },
  { id: 4, ref: "MAT-2024-045", name: "Mbeki Family Trust",   client: "Nomsa Mbeki",      rate: 1800 },
  { id: 5, ref: "MAT-2024-031", name: "SARS Appeal – Venter", client: "Pieter Venter",    rate: 2000 },
];

const MOCK_INVOICES = [
  { id: "INV-0089", matter: MATTERS[0], date: "2026-04-30", due: "2026-05-30", status: "sent",     items: [{ desc: "Drafting heads of argument", hrs: 2.5, rate: 2200 }, { desc: "Court appearance – Motion court", hrs: 3.0, rate: 2200 }, { desc: "Research: credit listing case law", hrs: 0.5, rate: 2200 }] },
  { id: "INV-0088", matter: MATTERS[2], date: "2026-04-25", due: "2026-05-25", status: "paid",     items: [{ desc: "Pre-arbitration meeting", hrs: 1.5, rate: 2500 }, { desc: "Reviewing discovery documents", hrs: 3.0, rate: 2500 }] },
  { id: "INV-0087", matter: MATTERS[4], date: "2026-04-20", due: "2026-05-20", status: "overdue",  items: [{ desc: "Research: tax tribunal precedents", hrs: 1.5, rate: 2000 }, { desc: "Phone call with SARS official", hrs: 0.5, rate: 2000 }] },
  { id: "INV-0086", matter: MATTERS[1], date: "2026-04-15", due: "2026-05-15", status: "draft",    items: [{ desc: "Client consultation call", hrs: 0.5, rate: 1800 }, { desc: "Drafting letters of executorship", hrs: 1.5, rate: 1800 }] },
  { id: "INV-0085", matter: MATTERS[3], date: "2026-04-10", due: "2026-05-10", status: "paid",     items: [{ desc: "Email correspondence with client", hrs: 0.2, rate: 1800 }, { desc: "Trust deed review and annotation", hrs: 2.0, rate: 1800 }] },
];

const STATUS_STYLE = {
  draft:   { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)"  },
  sent:    { color: "#60a5fa",               bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)"  },
  paid:    { color: "#8DC63F",               bg: "rgba(141,198,63,0.1)",   border: "rgba(141,198,63,0.25)"  },
  overdue: { color: "#ef4444",               bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"   },
};

function calcTotal(items) { return items.reduce((s, i) => s + i.hrs * i.rate, 0); }
function calcVAT(items)   { return calcTotal(items) * 0.15; }
function calcGrand(items) { return calcTotal(items) + calcVAT(items); }
function fmtR(n)          { return "R " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function Select({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ appearance: "none", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.7)", fontSize: "12px", padding: "8px 32px 8px 12px", cursor: "pointer", outline: "none", fontFamily: "'Inter', sans-serif" }}>
        {options.map((o) => <option key={o} value={o} style={{ background: "#0D1426" }}>{o}</option>)}
      </select>
      <ChevronDown style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
    </div>
  );
}

function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;
  const s = STATUS_STYLE[invoice.status];
  const subtotal = calcTotal(invoice.items);
  const vat = calcVAT(invoice.items);
  const grand = calcGrand(invoice.items);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "640px", maxWidth: "100%", fontFamily: "'Inter', sans-serif", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>

        {/* Invoice header */}
        <div style={{ background: "#080D1A", padding: "28px 32px", borderBottom: "1px solid rgba(141,198,63,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "32px", height: "32px", background: "#8DC63F", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px", color: "#0A0F1E" }}>MB</div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>MOTSOENENG BILL</p>
                  <p style={{ fontSize: "10px", color: "#8DC63F", margin: 0, letterSpacing: "1px" }}>ATTORNEYS & ADVISORS</p>
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Houghton Estate, Johannesburg</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>info@mb.co.za · +27 11 463 9401</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "#8DC63F", margin: 0, letterSpacing: "-1px" }}>TAX INVOICE</p>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>{invoice.id}</p>
              <span style={{ fontSize: "11px", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginTop: "8px" }}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 32px" }}>
          {/* Bill to / Invoice details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 8px" }}>Bill To</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>{invoice.matter.client}</p>
              <p style={{ fontSize: "12px", color: "rgba(141,198,63,0.6)", margin: "3px 0 0" }}>{invoice.matter.ref} — {invoice.matter.name}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {[["Invoice Date", invoice.date], ["Due Date", invoice.due], ["Payment Terms", "30 days"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{l}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", padding: "10px 16px", background: "rgba(141,198,63,0.08)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Description", "Hours", "Rate", "Amount"].map((h) => (
                <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase", textAlign: h !== "Description" ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {invoice.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", padding: "12px 16px", borderBottom: i < invoice.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>{item.desc}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>{item.hrs}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>R {item.rate.toLocaleString()}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", textAlign: "right" }}>{fmtR(item.hrs * item.rate)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "280px" }}>
              {[["Subtotal", fmtR(subtotal)], ["VAT (15%)", fmtR(vat)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{l}</span>
                  <span style={{ fontSize: "13px", color: "#fff" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "8px", marginTop: "8px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Total Due</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#8DC63F" }}>{fmtR(grand)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            <button style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Download style={{ width: "15px", height: "15px" }} /> Download PDF
            </button>
            <button style={{ fontSize: "13px", color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: "7px", padding: "11px 18px", cursor: "pointer" }}>
              Send to Client
            </button>
            <button onClick={onClose} style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "11px 18px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Billing() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.matter.name.toLowerCase().includes(q) || inv.matter.client.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBilled  = invoices.reduce((s, i) => s + calcTotal(i.items), 0);
  const totalPaid    = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + calcGrand(i.items), 0);
  const totalPending = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + calcGrand(i.items), 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + calcGrand(i.items), 0);

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Billing Output</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Invoices</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Generate and manage client invoices from approved time entries</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
          <Plus style={{ width: "15px", height: "15px" }} /> New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ ...fadeIn(80), display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Billed",    value: fmtR(totalBilled),  color: "#fff",    sub: "excl. VAT" },
          { label: "Collected",       value: fmtR(totalPaid),    color: "#8DC63F", sub: "incl. VAT" },
          { label: "Awaiting Payment",value: fmtR(totalPending), color: "#60a5fa", sub: `${invoices.filter(i=>i.status==="sent").length} invoices sent` },
          { label: "Overdue",         value: fmtR(totalOverdue), color: "#ef4444", sub: `${invoices.filter(i=>i.status==="overdue").length} invoices overdue` },
        ].map((c) => (
          <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "18px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: c.color, margin: "6px 0 2px" }}>{c.value}</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...fadeIn(140), display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice, matter or client..."
            style={{ width: "100%", background: "#0D1426", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "8px 12px 8px 32px", outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <Select value={statusFilter} onChange={setStatusFilter} options={["All Status", "draft", "sent", "paid", "overdue"]} />
        {(search || statusFilter !== "All Status") && (
          <button onClick={() => { setSearch(""); setStatusFilter("All Status"); }}
            style={{ fontSize: "11px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <X style={{ width: "12px", height: "12px" }} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ ...fadeIn(180), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.6fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {["Invoice", "Matter / Client", "Date", "Due", "Subtotal", "Status", ""].map((h) => (
            <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No invoices match your filters.</div>
        ) : filtered.map((inv, i) => {
          const s = STATUS_STYLE[inv.status];
          const total = calcGrand(inv.items);
          return (
            <div key={inv.id}
              style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.6fr", padding: "15px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => setSelected(inv)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "7px", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText style={{ width: "14px", height: "14px", color: "#8DC63F" }} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{inv.id}</span>
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{inv.matter.name}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{inv.matter.client}</p>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{inv.date}</p>
              <p style={{ fontSize: "12px", color: inv.status === "overdue" ? "#ef4444" : "rgba(255,255,255,0.45)", margin: 0 }}>{inv.due}</p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#8DC63F", margin: 0 }}>{fmtR(total)}</p>
              <span style={{ fontSize: "10px", fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block" }}>
                {inv.status}
              </span>
              <button onClick={(e) => { e.stopPropagation(); setSelected(inv); }}
                style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}>
                <Eye style={{ width: "12px", height: "12px" }} /> View
              </button>
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Showing <span style={{ color: "#8DC63F", fontWeight: 600 }}>{filtered.length}</span> of {invoices.length} invoices</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Total collected: <span style={{ color: "#8DC63F", fontWeight: 600 }}>{fmtR(totalPaid)}</span></span>
        </div>
      </div>

      <InvoiceModal invoice={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
