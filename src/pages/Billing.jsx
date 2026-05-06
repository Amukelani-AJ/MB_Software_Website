import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Download,
  Eye,
  ChevronDown,
  X,
  Search,
} from "lucide-react";

const API = "https://localhost:7291/api";

// ── Map InvoiceDTO (PascalCase + camelCase safe) ──────────────────────────────
function mapInvoice(inv) {
  const rawId = inv.Id ?? inv.id;
  const invoiceNum = inv.InvoiceNumber ?? inv.invoiceNumber;
  const clientName = inv.ClientName ?? inv.clientName;
  const matterNum = inv.MatterNumber ?? inv.matterNumber;
  const totalAmount = inv.TotalAmount ?? inv.totalAmount ?? 0;
  const status = inv.Status ?? inv.status ?? "pending";
  const createdAt = inv.CreatedAt ?? inv.createdAt;

  const created = createdAt ? createdAt.split("T")[0] : "—";
  const dueDate = createdAt
    ? new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
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

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CLS = {
  draft: "text-white/40   bg-white/[0.06]   border border-white/10",
  sent: "text-blue-400   bg-blue-400/10    border border-blue-400/25",
  pending: "text-amber-400  bg-amber-400/10   border border-amber-400/25",
  paid: "text-[#8DC63F]  bg-[#8DC63F]/10   border border-[#8DC63F]/25",
  overdue: "text-red-400    bg-red-400/10     border border-red-400/25",
};
const getStatusCls = (s) => STATUS_CLS[s] || STATUS_CLS.draft;

const calcTotal = (inv) =>
  inv.items.length > 0
    ? inv.items.reduce((s, i) => s + i.hrs * i.rate, 0)
    : inv.totalAmount / 1.15;
const calcVAT = (inv) => calcTotal(inv) * 0.15;
const calcGrand = (inv) =>
  inv.items.length > 0 ? calcTotal(inv) + calcVAT(inv) : inv.totalAmount;
const fmtR = (n) =>
  "R " +
  Number(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ── PDF Generation (unchanged logic) ─────────────────────────────────────────
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function generateInvoicePDF(invoice) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const green = [141, 198, 63];
  const dark = [13, 20, 38];
  const white = [255, 255, 255];
  const grey = [120, 130, 150];
  const subtotal = invoice.totalAmount / 1.15;
  const vat = subtotal * 0.15;
  const grand = invoice.totalAmount;
  const fmtPDF = (n) =>
    "R " +
    Number(n)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");
  doc.setFillColor(...green);
  doc.rect(0, 0, W, 2, "F");
  doc.setFillColor(...green);
  doc.roundedRect(margin, 12, 14, 14, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("MB", margin + 7, 21, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text("MOTSOENENG BILL", margin + 17, 18);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...green);
  doc.text("ATTORNEYS & ADVISORS", margin + 17, 23);
  doc.setFontSize(7);
  doc.setTextColor(...grey);
  doc.text("Houghton Estate, Johannesburg", margin, 32);
  doc.text("info@mb.co.za  ·  +27 11 463 9401", margin, 36);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...green);
  doc.text("TAX INVOICE", W - margin, 18, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  doc.text(invoice.id, W - margin, 26, { align: "right" });
  const sc =
    {
      paid: green,
      sent: [96, 165, 250],
      overdue: [239, 68, 68],
      draft: grey,
      pending: [245, 158, 11],
    }[invoice.status || "draft"] || grey;
  doc.setFillColor(...sc);
  doc.roundedRect(W - margin - 24, 28, 24, 6, 1, 1, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text((invoice.status || "DRAFT").toUpperCase(), W - margin - 12, 32.5, {
    align: "center",
  });
  doc.setDrawColor(...green);
  doc.setLineWidth(0.3);
  doc.line(margin, 42, W - margin, 42);

  let y = 50;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grey);
  doc.text("BILL TO", margin, y);
  doc.text("INVOICE DETAILS", W / 2 + 5, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text(invoice.matter.client || "—", margin, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...green);
  doc.text(`${invoice.matter.ref} — ${invoice.matter.name}`, margin, y + 5);
  [
    ["Invoice Date", invoice.date || "—"],
    ["Due Date", invoice.due || "—"],
    ["Payment Terms", "30 days"],
  ].forEach(([l, v], i) => {
    const ry = y + i * 6;
    doc.setFontSize(7);
    doc.setTextColor(...grey);
    doc.text(l, W / 2 + 5, ry);
    doc.setTextColor(...white);
    doc.text(v, W - margin, ry, { align: "right" });
  });

  y += 22;
  doc.setFillColor(20, 30, 55);
  doc.rect(margin, y, W - margin * 2, 8, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grey);
  const cols = { desc: margin + 3, hrs: 130, rate: 155, amt: W - margin - 2 };
  doc.text("DESCRIPTION", cols.desc, y + 5);
  doc.text("HOURS", cols.hrs, y + 5, { align: "right" });
  doc.text("RATE", cols.rate, y + 5, { align: "right" });
  doc.text("AMOUNT", cols.amt, y + 5, { align: "right" });
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...white);
  doc.setFontSize(8);
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(18, 26, 48);
        doc.rect(margin, y - 3, W - margin * 2, 8, "F");
      }
      doc.text(item.desc || "—", cols.desc, y + 2);
      doc.setTextColor(...grey);
      doc.text(String(item.hrs || "—"), cols.hrs, y + 2, { align: "right" });
      doc.text(
        item.rate ? `R ${item.rate.toLocaleString()}` : "—",
        cols.rate,
        y + 2,
        { align: "right" },
      );
      doc.setTextColor(...white);
      doc.text(fmtPDF(item.hrs * item.rate), cols.amt, y + 2, {
        align: "right",
      });
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
  y += 4;
  doc.setDrawColor(...green);
  doc.setLineWidth(0.2);
  doc.line(W / 2, y, W - margin, y);
  y += 5;
  [
    [`Subtotal`, fmtPDF(subtotal)],
    [`VAT (15%)`, fmtPDF(vat)],
  ].forEach(([l, v]) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grey);
    doc.text(l, W / 2 + 5, y);
    doc.setTextColor(...white);
    doc.text(v, W - margin, y, { align: "right" });
    y += 7;
  });
  y += 2;
  doc.setFillColor(20, 40, 20);
  doc.roundedRect(W / 2, y - 5, W / 2 - margin, 12, 2, 2, "F");
  doc.setDrawColor(...green);
  doc.setLineWidth(0.4);
  doc.roundedRect(W / 2, y - 5, W / 2 - margin, 12, 2, 2, "S");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("Total Due", W / 2 + 4, y + 3);
  doc.setTextColor(...green);
  doc.setFontSize(13);
  doc.text(fmtPDF(grand), W - margin - 2, y + 3, { align: "right" });
  y = 275;
  doc.setDrawColor(...green);
  doc.setLineWidth(0.2);
  doc.line(margin, y, W - margin, y);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  doc.text(
    "Thank you for your business — Motsoeneng Bill Attorneys & Advisors",
    W / 2,
    y + 5,
    { align: "center" },
  );
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-ZA")}`,
    W / 2,
    y + 9,
    { align: "center" },
  );
  doc.save(`${invoice.id}.pdf`);
}

// ── EmailJS ───────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_33m6cea";
const EMAILJS_TEMPLATE_ID = "template_pgwizeo";
const EMAILJS_PUBLIC_KEY = "ROvym5S6ni3kVIyJI";

function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      resolve(window.emailjs);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Shared input/select classes (module scope — no focus-loss bug) ────────────
const inputCls =
  "w-full rounded-lg border border-[#8DC63F]/22 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-[#8DC63F]/50";
const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;

function FieldLabel({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">
        {label}
        {required && <span className="text-[#8DC63F]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-3 pr-8 text-xs text-white/70 outline-none"
      >
        {options.map((o) => (
          <option key={o} className="bg-[#0D1426]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
    </div>
  );
}

// ── New Invoice Modal ─────────────────────────────────────────────────────────
const INVOICE_STATUSES = ["pending", "paid", "overdue", "sent", "draft"];

function NewInvoiceModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState({
    matterId: "",
    invoiceNumber: "",
    status: "pending",
  });
  const [matters, setMatters] = useState([]);
  const [loadingMatters, setLoadingM] = useState(true);
  const [selectedMatter, setSelectedM] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isValid = form.matterId && form.invoiceNumber && form.status;

  useEffect(() => {
    fetch(`${API}/Matter`)
      .then((r) => r.json())
      .then(setMatters)
      .catch(() => setMatters([]))
      .finally(() => setLoadingM(false));
  }, []);

  const handleMatterChange = (id) => {
    set("matterId", id);
    const found = matters.find((m) => String(m.id ?? m.Id) === String(id));
    setSelectedM(found || null);
  };

  const matterActive =
    selectedMatter?.status === "Active" || selectedMatter?.Status === "Active";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-full rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8DC63F]/12 px-6 py-5">
          <div>
            <h3 className="m-0 text-base font-bold text-white">New Invoice</h3>
            <p className="m-0 mt-0.5 text-xs text-white/35">
              Link to an existing matter
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent text-white/35"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 p-6">
          {/* Invoice Number */}
          <FieldLabel label="Invoice Number" required>
            <input
              value={form.invoiceNumber}
              onChange={(e) => set("invoiceNumber", e.target.value)}
              placeholder="e.g. INV-2024-001"
              className={inputCls}
            />
          </FieldLabel>

          {/* Matter dropdown */}
          <FieldLabel label="Matter" required>
            {loadingMatters ? (
              <div className="rounded-lg border border-[#8DC63F]/22 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white/30">
                Loading matters…
              </div>
            ) : matters.length === 0 ? (
              <div className="rounded-lg border border-red-500/25 bg-[#080D1A] px-3 py-2.5 text-[13px] text-red-400">
                No matters found. Create a matter first.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={form.matterId}
                  onChange={(e) => handleMatterChange(e.target.value)}
                  className={selectCls}
                >
                  <option value="" className="bg-[#0D1426]">
                    — Select a matter —
                  </option>
                  {matters.map((m) => {
                    const id = m.id ?? m.Id;
                    const num = m.matterNumber ?? m.MatterNumber;
                    const cli = m.clientName ?? m.ClientName;
                    return (
                      <option key={id} value={id} className="bg-[#0D1426]">
                        {num} — {cli}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              </div>
            )}
          </FieldLabel>

          {/* Matter preview card */}
          {selectedMatter && (
            <div className="flex flex-col gap-1 rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/[0.06] px-3.5 py-3">
              <p className="m-0 text-[10px] uppercase tracking-widest text-white/30">
                Selected Matter
              </p>
              <p className="m-0 text-sm font-bold text-white">
                {selectedMatter.clientName ?? selectedMatter.ClientName}
              </p>
              <p className="m-0 text-xs text-[#8DC63F]/70">
                {selectedMatter.matterNumber ?? selectedMatter.MatterNumber}
                <span className="text-white/35">
                  {" "}
                  ·{" "}
                  {selectedMatter.description ??
                    selectedMatter.Description ??
                    "No description"}
                </span>
              </p>
              <span
                className={`mt-1 self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${matterActive ? "border border-[#8DC63F]/30 bg-[#8DC63F]/10 text-[#8DC63F]" : "border border-white/10 bg-white/5 text-white/40"}`}
              >
                {selectedMatter.status ?? selectedMatter.Status}
              </span>
            </div>
          )}

          {/* Status — NEW FIELD */}

          {/* Actions */}
          <div className="mt-1 flex gap-2.5">
            <button
              onClick={() => onSave(form)}
              disabled={saving || !isValid}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-none py-3 text-[13px] font-bold text-[#0A0F1E] transition-opacity ${saving || !isValid ? "cursor-not-allowed bg-[#8DC63F]/40" : "bg-[#8DC63F] hover:opacity-90"}`}
            >
              {saving ? "Creating…" : "Create Invoice"}
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-[13px] text-white/50 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Send Email Modal ──────────────────────────────────────────────────────────
function SendEmailModal({ invoice, onClose, onToast }) {
  const subtotal = invoice.totalAmount / 1.15;
  const vat = subtotal * 0.15;
  const grand = invoice.totalAmount;
  const [toEmail, setToEmail] = useState("");
  const [sending, setSending] = useState(false);
  const isValid = toEmail.includes("@");

  const handleSend = async () => {
    setSending(true);
    try {
      const ejs = await loadEmailJS();
      await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        invoice_number: invoice.id,
        client_name: invoice.matter.client,
        matter_number: invoice.matter.ref,
        invoice_date: invoice.date,
        due_date: invoice.due,
        subtotal: "R " + subtotal.toFixed(2),
        vat: "R " + vat.toFixed(2),
        total_amount: "R " + grand.toFixed(2),
        status: invoice.status,
      });
      onToast("Invoice sent to " + toEmail);
      onClose();
    } catch {
      onToast("Failed to send email. Check your EmailJS credentials.", false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-5"
      onClick={onClose}
    >
      <div
        className="w-[440px] max-w-full rounded-xl border border-blue-400/30 bg-[#0D1426]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-blue-400/15 px-6 py-5">
          <div>
            <h3 className="m-0 text-[15px] font-bold text-white">
              Send Invoice to Client
            </h3>
            <p className="m-0 mt-0.5 text-xs text-white/35">
              {invoice.id} · {invoice.matter.client}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent text-white/35"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 p-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-400/15 bg-blue-400/[0.06] p-3.5">
            {[
              ["Invoice", invoice.id],
              ["Matter", invoice.matter.ref],
              ["Due Date", invoice.due],
              ["Total Due", "R " + grand.toFixed(2)],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="m-0 mb-0.5 text-[10px] uppercase tracking-widest text-white/30">
                  {l}
                </p>
                <p
                  className={`m-0 text-xs font-semibold ${l === "Total Due" ? "text-[#8DC63F]" : "text-white"}`}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
          <FieldLabel label="Client Email Address" required>
            <input
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="client@example.com"
              type="email"
              className={inputCls}
            />
          </FieldLabel>
          <div className="flex gap-2.5">
            <button
              onClick={handleSend}
              disabled={sending || !isValid}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-none py-3 text-[13px] font-bold text-[#0A0F1E] ${sending || !isValid ? "cursor-not-allowed bg-blue-400/30" : "bg-blue-400 hover:opacity-90"}`}
            >
              {sending ? "Sending…" : "Send Invoice"}
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-[13px] text-white/50 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Invoice Detail Modal ──────────────────────────────────────────────────────
function InvoiceModal({ invoice, onClose, onDelete, onSendEmail }) {
  if (!invoice) return null;
  const sCls = getStatusCls(invoice.status);
  const subtotal = calcTotal(invoice);
  const vat = calcVAT(invoice);
  const grand = calcGrand(invoice);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-[640px] max-w-full overflow-hidden overflow-y-auto rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invoice header */}
        <div className="border-b border-[#8DC63F]/15 bg-[#080D1A] px-8 py-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#8DC63F] text-xs font-black text-[#0A0F1E]">
                  MB
                </div>
                <div>
                  <p className="m-0 text-[13px] font-bold text-white">
                    MOTSOENENG BILL
                  </p>
                  <p className="m-0 text-[10px] tracking-widest text-[#8DC63F]">
                    ATTORNEYS &amp; ADVISORS
                  </p>
                </div>
              </div>
              <p className="m-0 text-[11px] text-white/30">
                Houghton Estate, Johannesburg
              </p>
              <p className="m-0 text-[11px] text-white/30">
                info@mb.co.za · +27 11 463 9401
              </p>
            </div>
            <div className="text-right">
              <p className="m-0 text-[28px] font-extrabold tracking-tight text-[#8DC63F]">
                TAX INVOICE
              </p>
              <p className="m-0 mt-1 text-base font-semibold text-white/60">
                {invoice.id}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${sCls}`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Bill to / Invoice details */}
          <div className="mb-6 grid grid-cols-2 gap-5">
            <div>
              <p className="m-0 mb-2 text-[10px] uppercase tracking-[1.5px] text-white/30">
                Bill To
              </p>
              <p className="m-0 text-sm font-bold text-white">
                {invoice.matter.client}
              </p>
              <p className="m-0 mt-0.5 text-xs text-[#8DC63F]/60">
                {invoice.matter.ref} — {invoice.matter.name}
              </p>
            </div>
            <div>
              {[
                ["Invoice Date", invoice.date],
                ["Due Date", invoice.due],
                ["Payment Terms", "30 days"],
              ].map(([l, v]) => (
                <div key={l} className="mb-1 flex justify-between">
                  <span className="text-[11px] text-white/30">{l}</span>
                  <span className="text-[11px] font-semibold text-white">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="mb-5 overflow-hidden rounded-lg border border-white/[0.06] bg-black/20">
            <div className="grid grid-cols-[1fr_80px_100px_100px] border-b border-white/5 bg-[#8DC63F]/[0.08] px-4 py-2.5">
              {["Description", "Hours", "Rate", "Amount"].map((h) => (
                <span
                  key={h}
                  className={`text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30 ${h !== "Description" ? "text-right" : ""}`}
                >
                  {h}
                </span>
              ))}
            </div>
            {invoice.items.length > 0 ? (
              invoice.items.map((item, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_80px_100px_100px] px-4 py-3 ${i < invoice.items.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                >
                  <span className="text-[13px] text-white/75">{item.desc}</span>
                  <span className="text-right text-[13px] text-white/50">
                    {item.hrs}
                  </span>
                  <span className="text-right text-[13px] text-white/50">
                    R {item.rate.toLocaleString()}
                  </span>
                  <span className="text-right text-[13px] font-semibold text-white">
                    {fmtR(item.hrs * item.rate)}
                  </span>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-[1fr_80px_100px_100px] px-4 py-3">
                <span className="text-[13px] text-white/75">
                  Professional services — {invoice.matter.ref}
                </span>
                <span className="text-right text-[13px] text-white/50">—</span>
                <span className="text-right text-[13px] text-white/50">—</span>
                <span className="text-right text-[13px] font-semibold text-white">
                  {fmtR(subtotal)}
                </span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-[280px]">
              {[
                ["Subtotal", fmtR(subtotal)],
                ["VAT (15%)", fmtR(vat)],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between border-b border-white/5 py-2"
                >
                  <span className="text-[13px] text-white/40">{l}</span>
                  <span className="text-[13px] text-white">{v}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between rounded-lg border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-4 py-3">
                <span className="text-[15px] font-bold text-white">
                  Total Due
                </span>
                <span className="text-lg font-extrabold text-[#8DC63F]">
                  {fmtR(grand)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2.5">
            <button
              onClick={() => generateInvoicePDF(invoice)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none bg-[#8DC63F] py-3 text-[13px] font-bold text-[#0A0F1E] hover:opacity-90"
            >
              <Download className="h-[15px] w-[15px]" /> Download PDF
            </button>
            <button
              onClick={() => onSendEmail(invoice)}
              className="cursor-pointer rounded-lg border border-blue-400/25 bg-blue-400/10 px-4 py-3 text-[13px] text-blue-400 hover:bg-blue-400/20"
            >
              Send to Client
            </button>
            <button
              onClick={() => onDelete(invoice)}
              className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400 hover:bg-red-500/20"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/40 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/Invoice`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // ── Newest first: sort by rawId descending ───────────────────────────
      setInvoices(data.map(mapInvoice).sort((a, b) => b.rawId - a.rawId));
    } catch {
      setError("Could not load invoices. Make sure your API is running.");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.id}?`)) return;
    setSelected(null);
    try {
      const res = await fetch(`${API}/Invoice/${inv.rawId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => res.status);
        throw new Error(msg);
      }
      showToast("Invoice deleted.");
      fetchInvoices();
    } catch (err) {
      showToast(`Delete failed: ${err.message || "unknown error"}`, false);
    }
  };

  const handleCreateInvoice = async (form) => {
    setSavingNew(true);
    try {
      const payload = {
        matterId: parseInt(form.matterId, 10),
        invoiceNumber: form.invoiceNumber,
        status: form.status, // ← new field sent to API
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
      showToast(
        `Failed to create invoice: ${err.message || "unknown error"}`,
        false,
      );
    } finally {
      setSavingNew(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      (inv.id.toLowerCase().includes(q) ||
        inv.matter.name.toLowerCase().includes(q) ||
        inv.matter.client.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || inv.status === statusFilter)
    );
  });

  const totalBilled = invoices.reduce((s, i) => s + calcTotal(i), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + calcGrand(i), 0);
  const totalPending = invoices
    .filter((i) => ["sent", "pending"].includes(i.status))
    .reduce((s, i) => s + calcGrand(i), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + calcGrand(i), 0);

  const show = visible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-3";

  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[999] rounded-lg border px-5 py-3 text-[13px] font-semibold ${toast.ok ? "border-[#8DC63F]/40 bg-[#8DC63F]/15 text-[#8DC63F]" : "border-red-500/40 bg-red-500/15 text-red-400"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#8DC63F]/20 border-t-[#8DC63F]" />
          <p className="text-[13px] text-white/35">Loading invoices…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex h-[300px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchInvoices}
            className="cursor-pointer rounded-md border border-[#8DC63F]/30 bg-[#8DC63F]/10 px-[18px] py-2 text-xs text-[#8DC63F]"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <div
            className={`mb-6 flex items-end justify-between transition-all duration-500 ${show}`}
          >
            <div>
              <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">
                Billing Output
              </p>
              <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">
                Invoices
              </h2>
              <p className="m-0 mt-1 text-[13px] text-white/35">
                Generate and manage client invoices from approved time entries
              </p>
            </div>
            <button
              onClick={() => setShowNewInvoice(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#8DC63F] px-[18px] py-2.5 text-[13px] font-bold text-[#0A0F1E] hover:opacity-90"
            >
              <Plus className="h-[15px] w-[15px]" /> New Invoice
            </button>
          </div>

          {/* Summary cards */}
          <div
            className={`mb-6 grid grid-cols-4 gap-3.5 transition-all delay-[80ms] duration-500 ${show}`}
          >
            {[
              {
                label: "Total Billed",
                value: fmtR(totalBilled),
                color: "text-white",
                sub: "excl. VAT",
              },
              {
                label: "Collected",
                value: fmtR(totalPaid),
                color: "text-[#8DC63F]",
                sub: "incl. VAT",
              },
              {
                label: "Awaiting Payment",
                value: fmtR(totalPending),
                color: "text-blue-400",
                sub: `${invoices.filter((i) => ["sent", "pending"].includes(i.status)).length} invoices`,
              },
              {
                label: "Overdue",
                value: fmtR(totalOverdue),
                color: "text-red-400",
                sub: `${invoices.filter((i) => i.status === "overdue").length} invoices overdue`,
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-[#8DC63F]/10 bg-[#0D1426] p-[18px]"
              >
                <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">
                  {c.label}
                </p>
                <p className={`m-0 mt-1.5 text-xl font-bold ${c.color}`}>
                  {c.value}
                </p>
                <p className="m-0 mt-0.5 text-[11px] text-white/25">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            className={`mb-4 flex items-center gap-2.5 transition-all delay-[140ms] duration-500 ${show}`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice, matter or client..."
                className="w-full rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-8 pr-3 text-xs text-white/80 outline-none placeholder:text-white/25"
              />
            </div>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                "All Status",
                "draft",
                "pending",
                "sent",
                "paid",
                "overdue",
              ]}
            />
            {(search || statusFilter !== "All Status") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All Status");
                }}
                className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/20"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div
            className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-[180ms] duration-500 ${show}`}
          >
            <div className="grid grid-cols-[1fr_1.8fr_1.2fr_0.8fr_0.8fr_0.8fr_0.6fr] border-b border-white/[0.06] bg-black/20 px-5 py-3">
              {[
                "Invoice",
                "Matter / Client",
                "Date",
                "Due",
                "Total",
                "Status",
                "",
              ].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30"
                >
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-white/25">
                No invoices match your filters.
              </div>
            ) : (
              filtered.map((inv, i) => {
                const sCls = getStatusCls(inv.status);
                const total = calcGrand(inv);
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className={`grid cursor-pointer grid-cols-[1fr_1.8fr_1.2fr_0.8fr_0.8fr_0.8fr_0.6fr] items-center px-5 py-[15px] transition-colors hover:bg-[#8DC63F]/[0.04] ${i < filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/10">
                        <FileText className="h-3.5 w-3.5 text-[#8DC63F]" />
                      </div>
                      <span className="text-[13px] font-bold text-white">
                        {inv.id}
                      </span>
                    </div>
                    <div>
                      <p className="m-0 text-[13px] font-semibold text-white">
                        {inv.matter.name}
                      </p>
                      <p className="m-0 mt-0.5 text-[11px] text-white/35">
                        {inv.matter.client}
                      </p>
                    </div>
                    <p className="m-0 text-xs text-white/45">{inv.date}</p>
                    <p
                      className={`m-0 text-xs ${inv.status === "overdue" ? "text-red-400" : "text-white/45"}`}
                    >
                      {inv.due}
                    </p>
                    <p className="m-0 text-[13px] font-bold text-[#8DC63F]">
                      {fmtR(total)}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${sCls}`}
                    >
                      {inv.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(inv);
                      }}
                      className="flex cursor-pointer items-center gap-1 rounded-md border border-[#8DC63F]/20 bg-[#8DC63F]/10 px-2.5 py-1.5 text-[11px] text-[#8DC63F] hover:bg-[#8DC63F]/20"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </div>
                );
              })
            )}

            <div className="flex items-center justify-between border-t border-[#8DC63F]/10 bg-black/15 px-5 py-3">
              <span className="text-xs text-white/30">
                Showing{" "}
                <span className="font-semibold text-[#8DC63F]">
                  {filtered.length}
                </span>{" "}
                of {invoices.length} invoices
              </span>
              <span className="text-xs text-white/30">
                Total collected:{" "}
                <span className="font-semibold text-[#8DC63F]">
                  {fmtR(totalPaid)}
                </span>
              </span>
            </div>
          </div>

          <InvoiceModal
            invoice={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            onSendEmail={(inv) => {
              setEmailTarget(inv);
              setSelected(null);
            }}
          />
          {showNewInvoice && (
            <NewInvoiceModal
              onClose={() => setShowNewInvoice(false)}
              onSave={handleCreateInvoice}
              saving={savingNew}
            />
          )}
          {emailTarget && (
            <SendEmailModal
              invoice={emailTarget}
              onClose={() => setEmailTarget(null)}
              onToast={showToast}
            />
          )}
        </>
      )}
    </div>
  );
}
