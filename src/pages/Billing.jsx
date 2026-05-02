import { useState, useEffect } from "react";
import { FileText, Plus, Download, Eye, ChevronDown, X, CheckCircle, Clock, Search } from "lucide-react";

const API = "https://localhost:7291/api";

// Map InvoiceDTO → handles both PascalCase (C# default) and camelCase
function mapInvoice(inv) {
  const rawId       = inv.Id        ?? inv.id;
  const invoiceNum  = inv.InvoiceNumber ?? inv.invoiceNumber;
  const clientName  = inv.ClientName   ?? inv.clientName;
  const matterNum   = inv.MatterNumber ?? inv.matterNumber;
  const totalAmount = inv.TotalAmount  ?? inv.totalAmount ?? 0;
  const status      = inv.Status       ?? inv.status ?? "draft";
  const createdAt   = inv.CreatedAt    ?? inv.createdAt;

  const created = createdAt ? createdAt.split("T")[0] : "—";
  const dueDate = createdAt
    ? new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : "—";
  return {
    id: invoiceNum || `INV-${rawId}`,
    rawId,
    matter: {
      name: matterNum || "—",
      client: clientName || "—",
      ref: matterNum || "—",
    },
    date: created,
    due: dueDate,
    status: status.toLowerCase(),
    totalAmount,
    items: [],
  };
}

const STATUS_STYLE = {
  draft:   { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)"  },
  sent:    { color: "#60a5fa",               bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)"  },
  paid:    { color: "#8DC63F",               bg: "rgba(141,198,63,0.1)",   border: "rgba(141,198,63,0.25)"  },
  overdue: { color: "#ef4444",               bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"   },
};
const DEFAULT_STATUS_STYLE = { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" };
function getStatusStyle(status) { return STATUS_STYLE[status] || DEFAULT_STATUS_STYLE; }

function calcTotal(inv) { return inv.items.length > 0 ? inv.items.reduce((s, i) => s + i.hrs * i.rate, 0) : inv.totalAmount / 1.15; }
function calcVAT(inv)   { return calcTotal(inv) * 0.15; }
function calcGrand(inv) { return inv.items.length > 0 ? calcTotal(inv) + calcVAT(inv) : inv.totalAmount; }
function fmtR(n)        { return "R " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

// ── PDF Generation ─────────────────────────────────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function generateInvoicePDF(invoice) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210; // A4 width
  const margin = 20;
  const green = [141, 198, 63];
  const dark  = [13, 20, 38];
  const white = [255, 255, 255];
  const grey  = [120, 130, 150];

  const subtotal = invoice.totalAmount / 1.15;
  const vat      = subtotal * 0.15;
  const grand    = invoice.totalAmount;

  const fmtPDF = (n) => "R " + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ── Background ──
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");

  // ── Green header bar ──
  doc.setFillColor(...green);
  doc.rect(0, 0, W, 2, "F");

  // ── Logo block ──
  doc.setFillColor(...green);
  doc.roundedRect(margin, 12, 14, 14, 2, 2, "F");
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("MB", margin + 7, 21, { align: "center" });

  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("MOTSOENENG BILL", margin + 17, 18);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.setTextColor(...green);
  doc.text("ATTORNEYS & ADVISORS", margin + 17, 23);

  doc.setFontSize(7); doc.setTextColor(...grey);
  doc.text("Houghton Estate, Johannesburg", margin, 32);
  doc.text("info@mb.co.za  ·  +27 11 463 9401", margin, 36);

  // ── TAX INVOICE title (right) ──
  doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.setTextColor(...green);
  doc.text("TAX INVOICE", W - margin, 18, { align: "right" });

  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  doc.text(invoice.id, W - margin, 26, { align: "right" });

  // Status badge
  const statusColors = { paid: green, sent: [96,165,250], overdue: [239,68,68], draft: grey, pending: [245,158,11] };
  const sc = statusColors[(invoice.status||"draft").toLowerCase()] || grey;
  doc.setFillColor(...sc);
  doc.roundedRect(W - margin - 24, 28, 24, 6, 1, 1, "F");
  doc.setFontSize(6); doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text((invoice.status || "DRAFT").toUpperCase(), W - margin - 12, 32.5, { align: "center" });

  // ── Divider ──
  doc.setDrawColor(...green); doc.setLineWidth(0.3);
  doc.line(margin, 42, W - margin, 42);

  // ── Bill To / Invoice Details ──
  let y = 50;
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.setTextColor(...grey);
  doc.text("BILL TO", margin, y);
  doc.text("INVOICE DETAILS", W / 2 + 5, y);

  y += 5;
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text(invoice.matter.client || "—", margin, y);

  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.setTextColor(...green);
  doc.text(`${invoice.matter.ref} — ${invoice.matter.name}`, margin, y + 5);

  // Right column — dates
  const details = [
    ["Invoice Date", invoice.date || "—"],
    ["Due Date",     invoice.due  || "—"],
    ["Payment Terms","30 days"],
  ];
  details.forEach(([label, val], i) => {
    const ry = y + i * 6;
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.setTextColor(...grey);
    doc.text(label, W / 2 + 5, ry);
    doc.setTextColor(...white);
    doc.text(val, W - margin, ry, { align: "right" });
  });

  // ── Line items table ──
  y += 22;
  doc.setFillColor(20, 30, 55);
  doc.rect(margin, y, W - margin * 2, 8, "F");
  doc.setFontSize(7); doc.setFont("helvetica", "bold");
  doc.setTextColor(...grey);
  const cols = { desc: margin + 3, hrs: 130, rate: 155, amt: W - margin - 2 };
  doc.text("DESCRIPTION", cols.desc, y + 5);
  doc.text("HOURS",  cols.hrs, y + 5, { align: "right" });
  doc.text("RATE",   cols.rate, y + 5, { align: "right" });
  doc.text("AMOUNT", cols.amt, y + 5, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...white);
  doc.setFontSize(8);

  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item, i) => {
      if (i % 2 === 1) { doc.setFillColor(18, 26, 48); doc.rect(margin, y - 3, W - margin * 2, 8, "F"); }
      doc.text(item.desc || "—", cols.desc, y + 2);
      doc.setTextColor(...grey);
      doc.text(String(item.hrs || "—"), cols.hrs, y + 2, { align: "right" });
      doc.text(item.rate ? `R ${item.rate.toLocaleString()}` : "—", cols.rate, y + 2, { align: "right" });
      doc.setTextColor(...white);
      doc.text(fmtPDF(item.hrs * item.rate), cols.amt, y + 2, { align: "right" });
      y += 8;
    });
  } else {
    doc.text(`Professional services — ${invoice.matter.ref}`, cols.desc, y + 2);
    doc.setTextColor(...grey);
    doc.text("—", cols.hrs, y + 2, { align: "right" });
    doc.text("—", cols.rate, y + 2, { align: "right" });
    doc.setTextColor(...white);
    doc.text(fmtPDF(subtotal), cols.amt, y + 2, { align: "right" });
    y += 8;
  }

  // ── Totals ──
  y += 4;
  doc.setDrawColor(...green); doc.setLineWidth(0.2);
  doc.line(W / 2, y, W - margin, y);
  y += 5;

  [[`Subtotal`, fmtPDF(subtotal)], [`VAT (15%)`, fmtPDF(vat)]].forEach(([label, val]) => {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(...grey);
    doc.text(label, W / 2 + 5, y);
    doc.setTextColor(...white);
    doc.text(val, W - margin, y, { align: "right" });
    y += 7;
  });

  // Total Due box
  y += 2;
  doc.setFillColor(20, 40, 20);
  doc.roundedRect(W / 2, y - 5, W / 2 - margin, 12, 2, 2, "F");
  doc.setDrawColor(...green); doc.setLineWidth(0.4);
  doc.roundedRect(W / 2, y - 5, W / 2 - margin, 12, 2, 2, "S");

  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("Total Due", W / 2 + 4, y + 3);
  doc.setTextColor(...green);
  doc.setFontSize(13);
  doc.text(fmtPDF(grand), W - margin - 2, y + 3, { align: "right" });

  // ── Footer ──
  y = 275;
  doc.setDrawColor(...green); doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  doc.text("Thank you for your business — Motsoeneng Bill Attorneys & Advisors", W / 2, y + 5, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleDateString("en-ZA")}`, W / 2, y + 9, { align: "center" });

  doc.save(`${invoice.id}.pdf`);
}



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

// ── Shared input style (module scope — avoids remount bug) ─────────────────────
const inputStyle = {
  width: "100%", background: "#080D1A",
  border: "1px solid rgba(141,198,63,0.22)",
  borderRadius: "7px", color: "#fff", fontSize: "13px",
  padding: "10px 12px", outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

function FieldLabel({ label, required, children }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
        {label} {required && <span style={{ color: "#8DC63F" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── New Invoice Modal ──────────────────────────────────────────────────────────
function NewInvoiceModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({ matterId: "", invoiceNumber: "" });
  const [matters, setMatters] = useState([]);
  const [loadingMatters, setLoadingMatters] = useState(true);
  const [selectedMatter, setSelectedMatter] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isValid = form.matterId && form.invoiceNumber;

  useEffect(() => {
    fetch(`${API}/Matter`)
      .then((r) => r.json())
      .then((data) => setMatters(data))
      .catch(() => setMatters([]))
      .finally(() => setLoadingMatters(false));
  }, []);

  const handleMatterChange = (id) => {
    set("matterId", id);
    const found = matters.find((m) => String(m.id) === String(id));
    setSelectedMatter(found || null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "12px", width: "480px", maxWidth: "100%", fontFamily: "'Inter', sans-serif" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(141,198,63,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>New Invoice</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>Link to an existing matter</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Invoice Number */}
          <FieldLabel label="Invoice Number" required>
            <input
              value={form.invoiceNumber}
              onChange={(e) => set("invoiceNumber", e.target.value)}
              placeholder="e.g. INV-2024-001"
              style={inputStyle}
            />
          </FieldLabel>

          {/* Matter dropdown */}
          <FieldLabel label="Matter" required>
            {loadingMatters ? (
              <div style={{ ...inputStyle, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                Loading matters…
              </div>
            ) : matters.length === 0 ? (
              <div style={{ ...inputStyle, color: "#ef4444" }}>No matters found. Create a matter first.</div>
            ) : (
              <div style={{ position: "relative" }}>
                <select
                  value={form.matterId}
                  onChange={(e) => handleMatterChange(e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "36px" }}
                >
                  <option value="" style={{ background: "#0D1426" }}>— Select a matter —</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id} style={{ background: "#0D1426" }}>
                      {m.matterNumber} — {m.clientName}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
              </div>
            )}
          </FieldLabel>

          {/* Preview card — shown once a matter is selected */}
          {selectedMatter && (
            <div style={{ background: "rgba(141,198,63,0.06)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Selected Matter</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0 }}>{selectedMatter.clientName}</p>
              <p style={{ fontSize: "12px", color: "rgba(141,198,63,0.7)", margin: 0 }}>{selectedMatter.matterNumber} · <span style={{ color: "rgba(255,255,255,0.35)" }}>{selectedMatter.description || "No description"}</span></p>
              <span style={{ alignSelf: "flex-start", fontSize: "10px", fontWeight: 600, color: selectedMatter.status === "Active" ? "#8DC63F" : "rgba(255,255,255,0.4)", background: selectedMatter.status === "Active" ? "rgba(141,198,63,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedMatter.status === "Active" ? "rgba(141,198,63,0.3)" : "rgba(255,255,255,0.1)"}`, padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", marginTop: "2px" }}>
                {selectedMatter.status}
              </span>
            </div>
          )}

          {/* Submit / Cancel */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={() => onSave(form)}
              disabled={saving || !isValid}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: saving || !isValid ? "rgba(141,198,63,0.4)" : "#8DC63F", border: "none", borderRadius: "7px", padding: "12px", cursor: saving || !isValid ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {saving ? "Creating…" : "Create Invoice"}
            </button>
            <button onClick={onClose} style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "12px 20px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Send Email Modal (EmailJS) ─────────────────────────────────────────────────
// TODO: Replace these three values with your EmailJS credentials
const EMAILJS_SERVICE_ID  = "service_33m6cea";
const EMAILJS_TEMPLATE_ID = "template_pgwizeo";
const EMAILJS_PUBLIC_KEY  = "ROvym5S6ni3kVIyJI";

function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); resolve(window.emailjs); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function SendEmailModal({ invoice, onClose, onToast }) {
  const subtotal = invoice.totalAmount / 1.15;
  const vat      = subtotal * 0.15;
  const grand    = invoice.totalAmount;

  const [toEmail, setToEmail] = useState("");
  const [sending, setSending] = useState(false);

  const isValid = toEmail.includes("@");

  const handleSend = async () => {
    setSending(true);
    try {
      const ejs = await loadEmailJS();
      await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:       toEmail,
        invoice_number: invoice.id,
        client_name:    invoice.matter.client,
        matter_number:  invoice.matter.ref,
        invoice_date:   invoice.date,
        due_date:       invoice.due,
        subtotal:       "R " + subtotal.toFixed(2),
        vat:            "R " + vat.toFixed(2),
        total_amount:   "R " + grand.toFixed(2),
        status:         invoice.status,
      });
      onToast("Invoice sent to " + toEmail);
      onClose();
    } catch (err) {
      console.error("EmailJS error:", err);
      onToast("Failed to send email. Check your EmailJS credentials.", false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0D1426", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "12px", width: "440px", maxWidth: "100%", fontFamily: "'Inter', sans-serif" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(96,165,250,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0 }}>Send Invoice to Client</h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>{invoice.id} · {invoice.matter.client}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Invoice summary */}
          <div style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: "8px", padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[["Invoice", invoice.id], ["Matter", invoice.matter.ref], ["Due Date", invoice.due], ["Total Due", "R " + grand.toFixed(2)]].map(([l, v]) => (
              <div key={l}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 2px" }}>{l}</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: l === "Total Due" ? "#8DC63F" : "#fff", margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Email input */}
          <FieldLabel label="Client Email Address" required>
            <input
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="client@example.com"
              type="email"
              style={inputStyle}
            />
          </FieldLabel>

          {EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px", padding: "10px 12px", fontSize: "11px", color: "#f59e0b", lineHeight: 1.6 }}>
              ⚠ EmailJS not configured yet. Add your Service ID, Template ID, and Public Key at the top of Billing.jsx.
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSend}
              disabled={sending || !isValid}
              style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: sending || !isValid ? "rgba(96,165,250,0.3)" : "#60a5fa", border: "none", borderRadius: "7px", padding: "12px", cursor: sending || !isValid ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {sending ? "Sending…" : "Send Invoice"}
            </button>
            <button onClick={onClose} style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "12px 20px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceModal({ invoice, onClose, onDelete, onSendEmail }) {
  if (!invoice) return null;
  const s = getStatusStyle(invoice.status);
  const subtotal = calcTotal(invoice);
  const vat = calcVAT(invoice);
  const grand = calcGrand(invoice);

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

          {/* Line items — shown if available, otherwise summary */}
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", padding: "10px 16px", background: "rgba(141,198,63,0.08)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Description", "Hours", "Rate", "Amount"].map((h) => (
                <span key={h} style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", textTransform: "uppercase", textAlign: h !== "Description" ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {invoice.items.length > 0 ? invoice.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", padding: "12px 16px", borderBottom: i < invoice.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>{item.desc}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>{item.hrs}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>R {item.rate.toLocaleString()}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", textAlign: "right" }}>{fmtR(item.hrs * item.rate)}</span>
              </div>
            )) : (
              <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 80px 100px 100px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Professional services — {invoice.matter.ref}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>—</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>—</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", textAlign: "right" }}>{fmtR(subtotal)}</span>
              </div>
            )}
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
            <button onClick={() => generateInvoicePDF(invoice)} style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Download style={{ width: "15px", height: "15px" }} /> Download PDF
            </button>
            <button onClick={() => onSendEmail(invoice)} style={{ fontSize: "13px", color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: "7px", padding: "11px 18px", cursor: "pointer" }}>
              Send to Client
            </button>
            <button onClick={() => onDelete(invoice)} style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "7px", padding: "11px 18px", cursor: "pointer" }}>
              Delete
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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/Invoice`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvoices(data.map(mapInvoice));
    } catch {
      setError("Could not load invoices. Make sure your API is running.");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.id}?`)) return;
    setSelected(null); // close modal immediately so it doesn't block
    try {
      const res = await fetch(`${API}/Invoice/${inv.rawId}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text().catch(() => res.status);
        throw new Error(msg);
      }
      showToast("Invoice deleted.");
      fetchInvoices();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(`Delete failed: ${err.message || "unknown error"}`, false);
    }
  };

  const handleCreateInvoice = async (form) => {
    setSavingNew(true);
    try {
      const payload = {
        matterId: parseInt(form.matterId, 10),
        invoiceNumber: form.invoiceNumber,
      };
      const res = await fetch(`${API}/Invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => res.status);
        throw new Error(msg);
      }
      showToast("Invoice created successfully.");
      setShowNewInvoice(false);
      fetchInvoices();
    } catch (err) {
      console.error("Create error:", err);
      showToast(`Failed to create invoice: ${err.message || "unknown error"}`, false);
    } finally {
      setSavingNew(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = inv.id.toLowerCase().includes(q) || inv.matter.name.toLowerCase().includes(q) || inv.matter.client.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBilled  = invoices.reduce((s, i) => s + calcTotal(i), 0);
  const totalPaid    = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + calcGrand(i), 0);
  const totalPending = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + calcGrand(i), 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + calcGrand(i), 0);

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.ok ? "rgba(141,198,63,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.ok ? "rgba(141,198,63,0.4)" : "rgba(239,68,68,0.4)"}`, color: toast.ok ? "#8DC63F" : "#ef4444", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(141,198,63,0.2)", borderTop: "3px solid #8DC63F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Loading invoices…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" }}>
          <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
          <button onClick={fetchInvoices} style={{ fontSize: "12px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", border: "1px solid rgba(141,198,63,0.3)", borderRadius: "6px", padding: "8px 18px", cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {!loading && !error && (<>

      {/* Header */}
      <div style={{ ...fadeIn(0), display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Billing Output</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Invoices</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Generate and manage client invoices from approved time entries</p>
        </div>
        <button onClick={() => setShowNewInvoice(true)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 18px", cursor: "pointer" }}>
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
          const s = getStatusStyle(inv.status);
          const total = calcGrand(inv);
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

      <InvoiceModal invoice={selected} onClose={() => setSelected(null)} onDelete={handleDelete} onSendEmail={(inv) => { setEmailTarget(inv); }} />
      {showNewInvoice && <NewInvoiceModal onClose={() => setShowNewInvoice(false)} onSave={handleCreateInvoice} saving={savingNew} />}
      {emailTarget && <SendEmailModal invoice={emailTarget} onClose={() => setEmailTarget(null)} onToast={showToast} />}
      </>)}
    </div>
  );
}
