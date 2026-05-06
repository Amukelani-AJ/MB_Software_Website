import { useState, useEffect } from "react";
import { Search, Plus, ChevronDown, X } from "lucide-react";

const API = "https://localhost:7291/api";

const STATUSES = ["All Status", "approved", "pending", "rejected"];
const TYPES    = ["All Types", "Drafting", "Research", "Court", "Meeting", "Consultation", "Communication"];

const STATUS_CLS = {
  approved: "text-[#8DC63F] bg-[#8DC63F]/10 border border-[#8DC63F]/30",
  pending:  "text-amber-400  bg-amber-400/10  border border-amber-400/30",
  rejected: "text-red-400    bg-red-400/10    border border-red-400/30",
};

const TYPE_COLORS = {
  Drafting: "#8DC63F", Research: "#60a5fa", Court: "#a78bfa",
  Meeting: "#34d399", Consultation: "#f472b6", Communication: "#fb923c",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function mapEntry(e) {
  const id         = e.Id          ?? e.id;
  const attorneyId = e.AttorneyId  ?? e.attorneyId;
  const matterId   = e.MatterId    ?? e.matterId;
  const clientName = e.ClientName  ?? e.clientName;
  const matterNum  = e.MatterNumber ?? e.matterNumber;
  const narrative  = e.Narrative   ?? e.narrative;
  const category   = e.Category    ?? e.category;
  const units      = e.Units       ?? e.units;
  const hourlyRate = e.HourlyRate  ?? e.hourlyRate;
  const billedAmt  = e.BilledAmount ?? e.billedAmount;
  const workDate   = e.WorkDate    ?? e.workDate;
  const attName    = e.AttorneyName ?? e.attorneyName;

  return {
    id, attorneyId, matterId,
    matter:       clientName || "—",
    ref:          matterNum  || "—",
    task:         narrative  || "—",
    attorney:     attName    || "—",
    type:         category   || "Other",
    date:         workDate ? workDate.split("T")[0] : "—",
    duration:     parseFloat(((units * 6) / 60).toFixed(2)),
    units, rate: hourlyRate, billedAmount: billedAmt,
    status: "pending",
  };
}

// ── Sub-components at module scope (prevent focus-loss bug) ───────────────────
function FieldLabel({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">
        {label}{required && <span className="text-[#8DC63F]"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls    = "w-full rounded-lg border border-[#8DC63F]/22 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-[#8DC63F]/50";
const selectCls   = `${inputCls} cursor-pointer appearance-none pr-9`;

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-3 pr-8 text-xs text-white/70 outline-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function Modal({ entry, onClose, onDelete, onEdit }) {
  if (!entry) return null;
  const sCls = STATUS_CLS[entry.status] || STATUS_CLS.pending;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-[480px] max-w-[90vw] rounded-xl border border-[#8DC63F]/25 bg-[#0D1426] p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="m-0 text-base font-bold text-white">{entry.matter}</h3>
            <p className="m-0 mt-0.5 text-[11px] tracking-wide text-[#8DC63F]/60">{entry.ref}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/40">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col">
          {[
            ["Task",     entry.task],
            ["Attorney", entry.attorney],
            ["Type",     entry.type],
            ["Date",     entry.date],
            ["Duration", `${entry.duration} hrs (${entry.units} units)`],
            ["Rate",     `R ${entry.rate?.toLocaleString()} / hr`],
            ["Amount",   `R ${(entry.duration * entry.rate)?.toLocaleString()}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-white/5 py-2.5">
              <span className="text-xs text-white/35">{label}</span>
              <span className="text-xs font-semibold text-white">{val}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${sCls}`}>
            {entry.status}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="cursor-pointer rounded-md border border-[#8DC63F]/30 bg-[#8DC63F]/10 px-4 py-1.5 text-xs text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="cursor-pointer rounded-md border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Time Entry Form Modal ─────────────────────────────────────────────────────
function TimeEntryModal({ entry, onClose, onSave, saving }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    attorneyId: entry?.attorneyId || "",
    matterId:   entry?.matterId   || "",
    narrative:  entry?.task       || "",
    category:   entry?.type       || "Drafting",
    units:      entry?.units      || "",
    workDate:   entry?.date       || new Date().toISOString().split("T")[0],
  });
  const [attorneys,   setAttorneys]   = useState([]);
  const [matters,     setMatters]     = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    Promise.all([
      fetch(`${API}/Attorney`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/Matter`).then((r)   => r.json()).catch(() => []),
    ]).then(([atts, mats]) => {
      setAttorneys(atts);
      setMatters(mats);
    }).finally(() => setLoadingData(false));
  }, []);

  const isValid  = form.attorneyId && form.matterId && form.narrative && form.units && form.workDate;
  const canSave  = !saving && !loadingData && isValid;
  const hoursPreview = form.units ? ((parseInt(form.units) * 6) / 60).toFixed(2) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onClose}>
      <div
        className="max-h-[90vh] w-[520px] max-w-full overflow-y-auto rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#8DC63F]/12 bg-[#0D1426] px-6 py-5">
          <div>
            <h3 className="m-0 text-base font-bold text-white">{isEdit ? "Edit Time Entry" : "New Time Entry"}</h3>
            <p className="m-0 mt-0.5 text-xs text-white/35">{isEdit ? "Update this entry" : "Log billable time"}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/35">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 p-6">
          {loadingData ? (
            <p className="py-5 text-center text-[13px] text-white/40">Loading attorneys and matters…</p>
          ) : (
            <>
              {/* Attorney */}
              <FieldLabel label="Attorney" required>
                <div className="relative">
                  <select
                    value={form.attorneyId}
                    onChange={(e) => set("attorneyId", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select attorney —</option>
                    {attorneys.map((a) => {
                      const id   = a.Id   ?? a.id;
                      const name = a.Name ?? a.name;
                      return <option key={id} value={id} className="bg-[#0D1426]">{name}</option>;
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                </div>
              </FieldLabel>

              {/* Matter */}
              <FieldLabel label="Matter" required>
                <div className="relative">
                  <select
                    value={form.matterId}
                    onChange={(e) => set("matterId", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— Select matter —</option>
                    {matters.map((m) => {
                      const id     = m.Id           ?? m.id;
                      const num    = m.MatterNumber  ?? m.matterNumber;
                      const client = m.ClientName    ?? m.clientName;
                      return <option key={id} value={id} className="bg-[#0D1426]">{num} — {client}</option>;
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                </div>
              </FieldLabel>

              {/* Narrative */}
              <FieldLabel label="Narrative" required>
                <textarea
                  value={form.narrative}
                  onChange={(e) => set("narrative", e.target.value)}
                  placeholder="Describe the work done…"
                  rows={3}
                  className={`${inputCls} resize-y leading-relaxed`}
                />
              </FieldLabel>

              {/* Category + Units */}
              <div className="grid grid-cols-2 gap-3.5">
                <FieldLabel label="Category" required>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={selectCls}
                    >
                      {["Drafting","Research","Court","Meeting","Consultation","Communication"].map((c) => (
                        <option key={c} value={c} className="bg-[#0D1426]">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  </div>
                </FieldLabel>

                <FieldLabel label="Units (1 unit = 6 min)" required>
                  <input
                    value={form.units}
                    onChange={(e) => set("units", e.target.value)}
                    placeholder="e.g. 5"
                    type="number"
                    min="1"
                    className={inputCls}
                  />
                </FieldLabel>
              </div>

              {/* Duration preview */}
              {hoursPreview && (
                <div className="rounded-lg border border-[#8DC63F]/15 bg-[#8DC63F]/[0.06] px-3 py-2 text-xs text-[#8DC63F]/80">
                  ⏱ {hoursPreview} hours ({form.units} units × 6 min)
                </div>
              )}

              {/* Work Date */}
              <FieldLabel label="Work Date" required>
                <input
                  value={form.workDate}
                  onChange={(e) => set("workDate", e.target.value)}
                  type="date"
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </FieldLabel>
            </>
          )}

          {/* Actions */}
          <div className="mt-1 flex gap-2.5">
            <button
              onClick={() => onSave(form)}
              disabled={!canSave}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-none py-3 text-[13px] font-bold text-[#0A0F1E] transition-opacity ${canSave ? "bg-[#8DC63F]" : "cursor-not-allowed bg-[#8DC63F]/40"}`}
            >
              {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Entry")}
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

// ── Main Component ────────────────────────────────────────────────────────────
export function TimeEntries() {
  const [entries,      setEntries]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [attorney,     setAttorney]     = useState("All Attorneys");
  const [attorneyList, setAttorneyList] = useState(["All Attorneys"]);
  const [status,       setStatus]       = useState("All Status");
  const [type,         setType]         = useState("All Types");
  const [selected,     setSelected]     = useState(null);
  const [visible,      setVisible]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [saving,       setSaving]       = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API}/TimeEntry`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // ── Newest first: sort by id descending ──────────────────────────────
      const mapped = data.map(mapEntry).sort((a, b) => b.id - a.id);
      setEntries(mapped);
      const names = ["All Attorneys", ...new Set(mapped.map((e) => e.attorney).filter(Boolean))];
      setAttorneyList(names);
    } catch {
      setError("Could not load time entries. Make sure your API is running.");
    } finally {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete entry for "${entry.task}"?`)) return;
    try {
      const res = await fetch(`${API}/TimeEntry/${entry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Entry deleted.");
      setSelected(null);
      fetchEntries();
    } catch {
      showToast("Delete failed.", false);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        AttorneyId: parseInt(form.attorneyId, 10),
        MatterId:   parseInt(form.matterId,   10),
        Narrative:  form.narrative,
        Category:   form.category,
        Units:      parseInt(form.units, 10),
        WorkDate:   form.workDate,
      };
      const url    = editTarget ? `${API}/TimeEntry/${editTarget.id}` : `${API}/TimeEntry`;
      const method = editTarget ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const msg = await res.text().catch(() => res.status); throw new Error(msg); }
      showToast(editTarget ? "Entry updated." : "Entry created.");
      setShowForm(false); setEditTarget(null); setSelected(null);
      fetchEntries();
    } catch (err) {
      showToast(`Failed to save: ${err.message || "unknown error"}`, false);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.matter.toLowerCase().includes(q) || e.task.toLowerCase().includes(q) || e.ref.toLowerCase().includes(q)) &&
      (attorney === "All Attorneys" || e.attorney === attorney) &&
      (status   === "All Status"    || e.status   === status)   &&
      (type     === "All Types"     || e.type     === type)
    );
  });

  const totalHours  = filtered.reduce((s, e) => s + e.duration, 0);
  const totalUnits  = filtered.reduce((s, e) => s + e.units, 0);
  const totalValue  = filtered.reduce((s, e) => s + e.duration * e.rate, 0);
  const pendingCount = filtered.filter((e) => e.status === "pending").length;
  const hasFilters  = attorney !== "All Attorneys" || status !== "All Status" || type !== "All Types" || search;

  const show = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] rounded-lg border px-5 py-3 text-[13px] font-semibold ${toast.ok ? "border-[#8DC63F]/40 bg-[#8DC63F]/15 text-[#8DC63F]" : "border-red-500/40 bg-red-500/15 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#8DC63F]/20 border-t-[#8DC63F]" />
          <p className="text-[13px] text-white/35">Loading entries…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex h-[300px] flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchEntries}
            className="cursor-pointer rounded-md border border-[#8DC63F]/30 bg-[#8DC63F]/10 px-[18px] py-2 text-xs text-[#8DC63F]"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Header */}
          <div className={`mb-6 flex items-end justify-between transition-all duration-500 ${show}`}>
            <div>
              <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">Time Management</p>
              <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">Time Entries</h2>
              <p className="m-0 mt-1 text-[13px] text-white/35">Review, edit and approve all captured time</p>
            </div>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#8DC63F] px-4 py-2.5 text-xs font-semibold text-[#0A0F1E] transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> New Entry
            </button>
          </div>

          {/* Summary cards */}
          <div className={`mb-5 grid grid-cols-4 gap-3.5 transition-all delay-100 duration-500 ${show}`}>
            {[
              { label: "Total Hours",    value: `${totalHours.toFixed(1)} hrs`,        color: "text-[#8DC63F]" },
              { label: "Total Units",    value: `${totalUnits} units`,                 color: "text-blue-400"  },
              { label: "Total Value",    value: `R ${Math.round(totalValue).toLocaleString()}`, color: "text-[#8DC63F]" },
              { label: "Pending Review", value: `${pendingCount} entries`,             color: "text-amber-400" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-[#8DC63F]/10 bg-[#0D1426] px-[18px] py-4">
                <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">{c.label}</p>
                <p className={`m-0 mt-1.5 text-xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`mb-4 flex flex-wrap items-center gap-2.5 transition-all delay-150 duration-500 ${show}`}>
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search matter, task, ref..."
                className="w-full rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-8 pr-3 text-xs text-white/80 outline-none placeholder:text-white/25"
              />
            </div>
            <FilterSelect value={attorney} onChange={setAttorney} options={attorneyList} />
            <FilterSelect value={status}   onChange={setStatus}   options={STATUSES}     />
            <FilterSelect value={type}     onChange={setType}     options={TYPES}        />
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setAttorney("All Attorneys"); setStatus("All Status"); setType("All Types"); }}
                className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-400 transition-colors hover:bg-red-500/20"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-200 duration-500 ${show}`}>
            {/* Header row */}
            <div className="grid grid-cols-[2fr_2fr_1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.6fr] border-b border-white/[0.06] bg-black/20 px-5 py-3">
              {["Matter / Ref", "Task", "Attorney", "Date", "Duration", "Units", "Value", "Status"].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-white/25">No entries match your filters.</div>
            ) : filtered.map((entry, i) => {
              const sCls      = STATUS_CLS[entry.status] || STATUS_CLS.pending;
              const typeColor = TYPE_COLORS[entry.type]  || "#8DC63F";
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  className={`grid cursor-pointer grid-cols-[2fr_2fr_1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.6fr] items-center px-5 py-3.5 transition-colors duration-150 hover:bg-[#8DC63F]/[0.04] ${i < filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                >
                  {/* Matter */}
                  <div>
                    <p className="m-0 text-[13px] font-semibold text-white">{entry.matter}</p>
                    <p className="m-0 mt-0.5 text-[10px] tracking-wide text-[#8DC63F]/55">{entry.ref}</p>
                  </div>

                  {/* Task */}
                  <div>
                    <p className="m-0 text-xs text-white/65">{entry.task}</p>
                    <span
                      className="mt-0.5 inline-block rounded px-1.5 py-px text-[10px]"
                      style={{ color: typeColor, background: `${typeColor}18` }}
                    >
                      {entry.type}
                    </span>
                  </div>

                  {/* Attorney */}
                  <p className="m-0 text-xs text-white/50">
                    {entry.attorney.split(" ").map((w) => w[0]).join(". ")}.
                  </p>

                  {/* Date */}
                  <p className="m-0 text-xs text-white/45">
                    {new Date(entry.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                  </p>

                  {/* Duration */}
                  <p className="m-0 text-[13px] font-semibold text-[#8DC63F]">{entry.duration} hrs</p>

                  {/* Units */}
                  <p className="m-0 text-xs text-white/40">{entry.units}</p>

                  {/* Value */}
                  <p className="m-0 text-xs font-semibold text-white">
                    R {(entry.duration * entry.rate)?.toLocaleString()}
                  </p>

                  {/* Status */}
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sCls}`}>
                    {entry.status}
                  </span>
                </div>
              );
            })}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#8DC63F]/10 bg-black/15 px-5 py-3">
              <span className="text-xs text-white/30">
                Showing <span className="font-semibold text-[#8DC63F]">{filtered.length}</span> of {entries.length} entries
              </span>
              <span className="text-xs text-white/30">
                Total: <span className="font-semibold text-[#8DC63F]">R {Math.round(totalValue).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Modals */}
          <Modal
            entry={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
            onEdit={(entry) => { setEditTarget(entry); setShowForm(true); setSelected(null); }}
          />
          {showForm && (
            <TimeEntryModal
              entry={editTarget}
              onClose={() => { setShowForm(false); setEditTarget(null); }}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </>
      )}
    </div>
  );
}
