import { useState, useEffect } from "react";
import { Plus, Search, X, ChevronDown, Edit2, Trash2, Briefcase, Loader } from "lucide-react";

const BASE_URL = "https://localhost:7291/api";

const matterApi = {
  getAll:  ()         => fetch(`${BASE_URL}/Matter`),
  create:  (data)     => fetch(`${BASE_URL}/Matter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  update:  (id, data) => fetch(`${BASE_URL}/Matter/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  delete:  (id)       => fetch(`${BASE_URL}/Matter/${id}`, { method: "DELETE" }),
};

const STATUS_OPTIONS = ["Active", "Pending", "Closed", "Inactive"];

const STATUS_CLS = {
  Active:   "text-[#8DC63F] bg-[#8DC63F]/10 border border-[#8DC63F]/30",
  Pending:  "text-amber-400 bg-amber-400/10 border border-amber-400/30",
  Closed:   "text-white/30  bg-white/5      border border-white/10",
  Inactive: "text-white/30  bg-white/5      border border-white/10",
};
const getStatusCls = (s) => STATUS_CLS[s] || STATUS_CLS.Pending;

// ── Module-scope primitives (prevents input focus-loss bug) ───────────────────
const inputCls  = "w-full rounded-lg border border-[#8DC63F]/22 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-[#8DC63F]/50";
const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">
        {label}{required && <span className="text-[#8DC63F]"> *</span>}
      </label>
      {children}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const cls = type === "success"
    ? "border-l-[#8DC63F] border-[#8DC63F]/25"
    : "border-l-red-500 border-red-500/25";
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 rounded-lg border border-l-[3px] bg-[#0D1426] px-4 py-3 shadow-2xl ${cls}`}>
      <span className="text-[13px] text-white">{message}</span>
      <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/30">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Matter Form Modal ─────────────────────────────────────────────────────────
function MatterModal({ matter, onSave, onClose, saving }) {
  const isEdit = !!matter;
  const [form, setForm] = useState({
    matterNumber: matter?.matterNumber || "",
    clientName:   matter?.clientName   || "",
    description:  matter?.description  || "",
    status:       matter?.status       || "Active",
  });
  const set     = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const isValid = form.matterNumber && form.clientName && form.status;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onClose}>
      <div className="w-[500px] max-w-full rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8DC63F]/12 px-6 py-5">
          <div>
            <h3 className="m-0 text-base font-bold text-white">{isEdit ? "Edit Matter" : "New Matter"}</h3>
            <p className="m-0 mt-0.5 text-xs text-white/35">
              {isEdit ? `Editing ${matter.matterNumber}` : "Create a new client matter"}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/35">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 p-6">
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Matter Number" required>
              <input value={form.matterNumber} onChange={(e) => set("matterNumber", e.target.value)}
                placeholder="e.g. MAT-2024-001" className={inputCls} />
            </Field>
            <Field label="Status" required>
              <div className="relative">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectCls}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0D1426]">{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              </div>
            </Field>
          </div>

          <Field label="Client Name" required>
            <input value={form.clientName} onChange={(e) => set("clientName", e.target.value)}
              placeholder="e.g. Thandi Khumalo" className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the matter…" rows={3}
              className={`${inputCls} resize-y leading-relaxed`} />
          </Field>

          <div className="mt-1 flex gap-2.5">
            <button onClick={() => onSave(form)} disabled={!isValid || saving}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-none py-3 text-[13px] font-bold text-[#0A0F1E] transition-opacity ${!isValid || saving ? "cursor-not-allowed bg-[#8DC63F]/50" : "bg-[#8DC63F] hover:opacity-90"}`}>
              {saving && <Loader className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Matter"}
            </button>
            <button onClick={onClose}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-[13px] text-white/50 hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ matter, onEdit, onClose }) {
  if (!matter) return null;
  const sCls = getStatusCls(matter.status);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onClose}>
      <div className="w-[480px] max-w-full overflow-hidden rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="border-b border-[#8DC63F]/12 bg-[#080D1A] p-7">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#8DC63F]/25 bg-[#8DC63F]/10">
                <Briefcase className="h-5 w-5 text-[#8DC63F]" />
              </div>
              <div>
                <p className="m-0 text-[11px] uppercase tracking-widest text-[#8DC63F]/60">{matter.matterNumber}</p>
                <h3 className="m-0 mt-0.5 text-lg font-bold text-white">{matter.clientName}</h3>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(matter)}
                className="cursor-pointer rounded-md border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-3.5 py-1.5 text-xs text-[#8DC63F] hover:bg-[#8DC63F]/20">
                Edit
              </button>
              <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/30">
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${sCls}`}>
              {matter.status}
            </span>
          </div>
          {matter.description && (
            <div className="rounded-lg border border-[#8DC63F]/12 bg-white/[0.02] p-4">
              <p className="m-0 mb-1.5 text-[10px] uppercase tracking-widest text-white/30">Description</p>
              <p className="m-0 text-[13px] leading-relaxed text-white/65">{matter.description}</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-[#8DC63F]/15 bg-[#8DC63F]/[0.06] p-3.5">
              <p className="m-0 mb-1 text-[10px] uppercase tracking-widest text-[#8DC63F]/60">Matter ID</p>
              <p className="m-0 text-xl font-bold text-white">#{matter.id}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="m-0 mb-1 text-[10px] uppercase tracking-widest text-white/30">Reference</p>
              <p className="m-0 text-xl font-bold text-[#8DC63F]">{matter.matterNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Matter Card ───────────────────────────────────────────────────────────────
function MatterCard({ matter, onView, onEdit, onDelete }) {
  const sCls = getStatusCls(matter.status);
  return (
    <div onClick={() => onView(matter)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DC63F]/40">
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#8DC63F] opacity-50" />

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/10">
            <Briefcase className="h-4 w-4 text-[#8DC63F]" />
          </div>
          <div>
            <p className="m-0 text-[11px] font-semibold tracking-wide text-[#8DC63F]/70">{matter.matterNumber}</p>
            <p className="m-0 text-sm font-bold text-white">{matter.clientName}</p>
          </div>
        </div>
        <span className={`self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sCls}`}>
          {matter.status}
        </span>
      </div>

      {matter.description && (
        <p className="m-0 mb-3.5 line-clamp-2 text-xs leading-relaxed text-white/40">
          {matter.description}
        </p>
      )}

      <div className="flex gap-2 border-t border-white/5 pt-3.5">
        <button onClick={(e) => { e.stopPropagation(); onEdit(matter); }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[#8DC63F]/20 bg-[#8DC63F]/[0.08] py-1.5 text-[11px] text-[#8DC63F] hover:bg-[#8DC63F]/20">
          <Edit2 className="h-[11px] w-[11px]" /> Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(matter.id); }}
          className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20">
          <Trash2 className="h-[11px] w-[11px]" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Matters() {
  const [matters,     setMatters]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("All");
  const [viewMode,    setViewMode]    = useState("grid");
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [viewTarget,  setViewTarget]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [visible,     setVisible]     = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fetchMatters = async () => {
    try {
      setLoading(true); setError(null);
      const res = await matterApi.getAll();
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      // ── Newest first: sort by id descending ──────────────────────────────
      setMatters([...data].sort((a, b) => (b.id ?? b.Id) - (a.id ?? a.Id)));
    } catch {
      setError("Failed to load matters. Make sure your API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatters(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        matterNumber: form.matterNumber,
        clientName:   form.clientName,
        description:  form.description,
        status:       form.status,
      };
      const res = editTarget
        ? await matterApi.update(editTarget.id, { id: editTarget.id, ...payload })
        : await matterApi.create(payload);
      if (!res.ok) throw new Error();
      setToast({ message: editTarget ? "Matter updated." : "Matter created.", type: "success" });
      setShowForm(false); setEditTarget(null);
      fetchMatters();
    } catch {
      setToast({ message: "Failed to save matter.", type: "error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this matter?")) return;
    try {
      const res = await matterApi.delete(id);
      if (!res.ok) throw new Error();
      setToast({ message: "Matter deleted.", type: "success" });
      fetchMatters();
    } catch {
      setToast({ message: "Failed to delete matter.", type: "error" });
    }
  };

  const handleEdit = (m) => { setViewTarget(null); setEditTarget(m); setShowForm(true); };

  const filtered = matters.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = (m.clientName || "").toLowerCase().includes(q) || (m.matterNumber || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount  = matters.filter((m) => m.status === "Active").length;
  const pendingCount = matters.filter((m) => m.status === "Pending").length;
  const closedCount  = matters.filter((m) => m.status === "Closed").length;

  const show = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  if (loading) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#080D1A]">
      <Loader className="h-8 w-8 animate-spin text-[#8DC63F]" />
      <p className="text-[13px] text-white/40">Loading matters...</p>
    </div>
  );

  if (error) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#080D1A] px-10">
      <p className="text-[15px] font-semibold text-white">Could not load matters</p>
      <p className="text-[13px] text-white/35">{error}</p>
      <button onClick={fetchMatters}
        className="cursor-pointer rounded-lg border-none bg-[#8DC63F] px-5 py-2.5 text-[13px] font-bold text-[#0A0F1E]">
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Header */}
      <div className={`mb-6 flex items-end justify-between transition-all duration-500 ${show}`}>
        <div>
          <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">Case Management</p>
          <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">Matters</h2>
          <p className="m-0 mt-1 text-[13px] text-white/35">All client matters and their current status</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#8DC63F] px-[18px] py-2.5 text-[13px] font-bold text-[#0A0F1E] hover:opacity-90">
          <Plus className="h-[15px] w-[15px]" /> New Matter
        </button>
      </div>

      {/* Summary cards */}
      <div className={`mb-5 grid grid-cols-4 gap-3.5 transition-all delay-[80ms] duration-500 ${show}`}>
        {[
          { label: "Total Matters", value: matters.length, color: "text-white"      },
          { label: "Active",        value: activeCount,    color: "text-[#8DC63F]"  },
          { label: "Pending",       value: pendingCount,   color: "text-amber-400"  },
          { label: "Closed",        value: closedCount,    color: "text-white/30"   },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#8DC63F]/10 bg-[#0D1426] px-[18px] py-4">
            <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">{c.label}</p>
            <p className={`m-0 mt-1.5 text-[22px] font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`mb-5 flex flex-wrap items-center gap-2.5 transition-all delay-[130ms] duration-500 ${show}`}>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, matter number..."
            className="w-full rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-8 pr-3 text-xs text-white/80 outline-none placeholder:text-white/25" />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5">
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-all duration-150 ${statusFilter === s
                ? "border-[#8DC63F] bg-[#8DC63F] font-semibold text-[#0A0F1E]"
                : "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:text-white/70"
              }`}>
              {s}
            </button>
          ))}
        </div>

        {search && (
          <button onClick={() => setSearch("")}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/20">
            <X className="h-3 w-3" /> Clear
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex overflow-hidden rounded-md border border-[#8DC63F]/20 bg-[#0D1426]">
          {["grid", "table"].map((v) => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`cursor-pointer border-none px-3.5 py-2 text-xs transition-colors ${viewMode === v ? "bg-[#8DC63F] font-semibold text-[#0A0F1E]" : "bg-transparent text-white/40 hover:text-white/70"}`}>
              {v === "grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 transition-all delay-[170ms] duration-500 ${show}`}>
          {filtered.length === 0
            ? <div className="col-span-full py-16 text-center text-[13px] text-white/25">No matters found.</div>
            : filtered.map((m) => (
              <MatterCard key={m.id} matter={m} onView={setViewTarget} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          }
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-[170ms] duration-500 ${show}`}>
          <div className="grid grid-cols-[1fr_1.5fr_2fr_0.8fr_0.5fr] border-b border-white/[0.06] bg-black/20 px-5 py-3">
            {["Matter No.", "Client", "Description", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-white/25">No matters found.</div>
          ) : filtered.map((m, i) => {
            const sCls = getStatusCls(m.status);
            return (
              <div key={m.id} onClick={() => setViewTarget(m)}
                className={`grid cursor-pointer grid-cols-[1fr_1.5fr_2fr_0.8fr_0.5fr] items-center px-5 py-3.5 transition-colors hover:bg-[#8DC63F]/[0.04] ${i < filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <p className="m-0 text-xs font-semibold text-[#8DC63F]/70">{m.matterNumber}</p>
                <p className="m-0 text-[13px] font-semibold text-white">{m.clientName}</p>
                <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-white/40">{m.description || "—"}</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sCls}`}>
                  {m.status}
                </span>
                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(m)}
                    className="cursor-pointer border-none bg-transparent p-1 text-white/30 transition-colors hover:text-[#8DC63F]">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(m.id)}
                    className="cursor-pointer border-none bg-transparent p-1 text-white/30 transition-colors hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between border-t border-[#8DC63F]/10 bg-black/15 px-5 py-3">
            <span className="text-xs text-white/30">
              Showing <span className="font-semibold text-[#8DC63F]">{filtered.length}</span> of {matters.length} matters
            </span>
          </div>
        </div>
      )}

      {viewTarget && <DetailModal matter={viewTarget} onEdit={handleEdit} onClose={() => setViewTarget(null)} />}
      {showForm   && <MatterModal matter={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} saving={saving} />}
      {toast      && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
