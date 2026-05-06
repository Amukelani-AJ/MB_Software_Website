import { useState, useEffect } from "react";
import { Plus, Search, X, Edit2, Trash2, Mail, Loader } from "lucide-react";

const BASE_URL = "https://localhost:7291/api";

const attorneyApi = {
  getAll: ()         => fetch(`${BASE_URL}/Attorney`),
  create: (data)     => fetch(`${BASE_URL}/Attorney`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  update: (id, data) => fetch(`${BASE_URL}/Attorney/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  delete: (id)       => fetch(`${BASE_URL}/Attorney/${id}`, { method: "DELETE" }),
};

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function fmtR(n) { return "R " + Number(n).toLocaleString(); }

// ── Field — at module scope so it's never recreated ──────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">
        {label} {required && <span className="text-[#8DC63F]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-[#8DC63F]/22 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-[#8DC63F]/50";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const border = type === "success" ? "border-l-[#8DC63F] border-[#8DC63F]/25" : "border-l-red-500 border-red-500/25";
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 rounded-lg border border-l-[3px] bg-[#0D1426] px-4 py-3 shadow-2xl ${border}`}>
      <span className="text-[13px] text-white">{message}</span>
      <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/30">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Attorney Form Modal ───────────────────────────────────────────────────────
function AttorneyModal({ attorney, onSave, onClose, saving }) {
  const isEdit = !!attorney;
  const [form, setForm] = useState({
    name:       attorney?.name       || "",
    email:      attorney?.email      || "",
    hourlyRate: attorney?.hourlyRate || "",
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const canSave = !saving && form.name && form.email && form.hourlyRate;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onClose}>
      <div className="w-[460px] max-w-full rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8DC63F]/12 px-6 py-5">
          <div>
            <h3 className="m-0 text-base font-bold text-white">{isEdit ? "Edit Attorney" : "New Attorney"}</h3>
            <p className="m-0 mt-0.5 text-xs text-white/35">
              {isEdit ? `Editing ${attorney.name}` : "Add a new attorney to the system"}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-white/35">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 p-6">
          <Field label="Full Name" required>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Amukelani Ndlovu"
            />
          </Field>
          <Field label="Email Address" required>
            <input
              className={inputCls}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="a.name@mb.co.za"
            />
          </Field>
          <Field label="Hourly Rate (R)" required>
            <input
              className={inputCls}
              type="number"
              value={form.hourlyRate}
              onChange={(e) => set("hourlyRate", e.target.value)}
              placeholder="e.g. 2200"
            />
          </Field>

          <div className="mt-1 flex gap-2.5">
            <button
              onClick={() => onSave(form)}
              disabled={!canSave}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-none py-3 text-[13px] font-bold text-[#0A0F1E] transition-opacity ${canSave ? "bg-[#8DC63F]" : "cursor-not-allowed bg-[#8DC63F]/50"}`}
            >
              {saving && <Loader className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Attorney"}
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

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ attorney, onEdit, onClose }) {
  if (!attorney) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onClose}>
      <div className="w-[440px] max-w-full overflow-hidden rounded-xl border border-[#8DC63F]/25 bg-[#0D1426]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="border-b border-[#8DC63F]/12 bg-[#080D1A] p-7">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#8DC63F] text-lg font-extrabold text-[#0A0F1E]">
                {getInitials(attorney.name)}
              </div>
              <div>
                <h3 className="m-0 text-lg font-bold text-white">{attorney.name}</h3>
                <p className="m-0 mt-1 text-xs text-[#8DC63F]">Attorney</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(attorney)}
                className="cursor-pointer rounded-md border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-3.5 py-1.5 text-xs text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
              >
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
          <div className="mb-5 flex items-center gap-2.5">
            <Mail className="h-3.5 w-3.5 text-[#8DC63F]/50" />
            <span className="text-[13px] text-white/60">{attorney.email}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/[0.07] p-3.5">
              <p className="m-0 mb-1 text-[10px] uppercase tracking-widest text-[#8DC63F]/60">Hourly Rate</p>
              <p className="m-0 text-xl font-bold text-[#8DC63F]">{fmtR(attorney.hourlyRate)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3.5">
              <p className="m-0 mb-1 text-[10px] uppercase tracking-widest text-white/30">Attorney ID</p>
              <p className="m-0 text-xl font-bold text-white">#{attorney.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attorney Card ─────────────────────────────────────────────────────────────
function AttorneyCard({ attorney, onView, onEdit, onDelete }) {
  return (
    <div
      onClick={() => onView(attorney)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DC63F]/40"
    >
      {/* Top accent bar */}
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#8DC63F] opacity-60" />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8DC63F] text-[15px] font-extrabold text-[#0A0F1E]">
          {getInitials(attorney.name)}
        </div>
        <div>
          <p className="m-0 text-sm font-bold text-white">{attorney.name}</p>
          <p className="m-0 mt-0.5 text-[11px] text-white/40">{attorney.email}</p>
        </div>
      </div>

      <div className="mb-3.5 rounded-lg border border-[#8DC63F]/15 bg-[#8DC63F]/[0.07] px-3.5 py-2.5">
        <p className="m-0 mb-0.5 text-[10px] uppercase tracking-widest text-[#8DC63F]/60">Hourly Rate</p>
        <p className="m-0 text-lg font-bold text-[#8DC63F]">{fmtR(attorney.hourlyRate)}</p>
      </div>

      <div className="flex gap-2 border-t border-white/5 pt-3.5">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(attorney); }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-[#8DC63F]/20 bg-[#8DC63F]/[0.08] py-1.5 text-[11px] text-[#8DC63F] transition-colors hover:bg-[#8DC63F]/20"
        >
          <Edit2 className="h-[11px] w-[11px]" /> Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(attorney.id); }}
          className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5 text-[11px] text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="h-[11px] w-[11px]" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Attorneys() {
  const [attorneys,   setAttorneys]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [viewMode,    setViewMode]    = useState("grid");
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [viewTarget,  setViewTarget]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [visible,     setVisible]     = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const fetchAttorneys = async () => {
    try {
      setLoading(true); setError(null);
      const res = await attorneyApi.getAll();
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      // ── Newest first: sort by id descending so newly added appear at top ──
      setAttorneys([...data].sort((a, b) => b.id - a.id));
    } catch {
      setError("Failed to load attorneys. Make sure your API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttorneys(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, hourlyRate: parseFloat(form.hourlyRate) };
      const res = editTarget
        ? await attorneyApi.update(editTarget.id, { id: editTarget.id, ...payload })
        : await attorneyApi.create(payload);
      if (!res.ok) throw new Error();
      setToast({ message: editTarget ? "Attorney updated successfully" : "Attorney added successfully", type: "success" });
      setShowForm(false); setEditTarget(null);
      fetchAttorneys();
    } catch {
      setToast({ message: "Failed to save attorney. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attorney?")) return;
    try {
      const res = await attorneyApi.delete(id);
      if (!res.ok) throw new Error();
      setToast({ message: "Attorney deleted", type: "success" });
      fetchAttorneys();
    } catch {
      setToast({ message: "Failed to delete attorney.", type: "error" });
    }
  };

  const handleEdit = (attorney) => { setViewTarget(null); setEditTarget(attorney); setShowForm(true); };

  const filtered = attorneys.filter((a) => {
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  const show = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#080D1A]">
      <Loader className="h-8 w-8 animate-spin text-[#8DC63F]" />
      <p className="m-0 text-[13px] text-white/40">Loading attorneys...</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#080D1A] px-10">
      <X className="h-8 w-8 text-red-500" />
      <p className="m-0 text-[15px] font-semibold text-white">Could not load attorneys</p>
      <p className="m-0 text-[13px] text-white/35">{error}</p>
      <button
        onClick={fetchAttorneys}
        className="cursor-pointer rounded-lg border-none bg-[#8DC63F] px-5 py-2.5 text-[13px] font-bold text-[#0A0F1E]"
      >
        Retry
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Header */}
      <div className={`mb-6 flex items-end justify-between transition-all duration-500 ${show}`}>
        <div>
          <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">Team Management</p>
          <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">Attorneys</h2>
          <p className="m-0 mt-1 text-[13px] text-white/35">Manage attorney profiles and hourly rates</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#8DC63F] px-[18px] py-2.5 text-[13px] font-bold text-[#0A0F1E] transition-opacity hover:opacity-90"
        >
          <Plus className="h-[15px] w-[15px]" /> New Attorney
        </button>
      </div>

      {/* Summary cards */}
      <div className={`mb-5 grid grid-cols-3 gap-3.5 transition-all delay-[80ms] duration-500 ${show}`}>
        {[
          { label: "Total Attorneys", value: attorneys.length,  color: "text-white"      },
          { label: "Avg Hourly Rate", value: attorneys.length ? fmtR(Math.round(attorneys.reduce((s, a) => s + Number(a.hourlyRate), 0) / attorneys.length)) : "R 0", color: "text-[#8DC63F]" },
          { label: "Showing",         value: `${filtered.length} of ${attorneys.length}`, color: "text-blue-400" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[#8DC63F]/10 bg-[#0D1426] px-[18px] py-4">
            <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">{c.label}</p>
            <p className={`m-0 mt-1.5 text-[22px] font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`mb-5 flex items-center gap-2.5 transition-all delay-[130ms] duration-500 ${show}`}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-md border border-[#8DC63F]/20 bg-[#0D1426] py-2 pl-8 pr-3 text-xs text-white/80 outline-none placeholder:text-white/25"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-400"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        {/* View toggle */}
        <div className="ml-auto flex overflow-hidden rounded-md border border-[#8DC63F]/20 bg-[#0D1426]">
          {["grid", "table"].map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`cursor-pointer border-none px-3.5 py-2 text-xs transition-colors ${viewMode === v ? "bg-[#8DC63F] font-semibold text-[#0A0F1E]" : "bg-transparent text-white/40 hover:text-white/70"}`}
            >
              {v === "grid" ? "⊞ Grid" : "☰ Table"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 transition-all delay-[170ms] duration-500 ${show}`}>
          {filtered.length === 0
            ? <div className="col-span-full py-16 text-center text-[13px] text-white/25">No attorneys found.</div>
            : filtered.map((a) => (
              <AttorneyCard key={a.id} attorney={a} onView={setViewTarget} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          }
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-[170ms] duration-500 ${show}`}>
          <div className="grid grid-cols-[2fr_2fr_1fr_0.5fr] border-b border-white/[0.06] bg-black/20 px-5 py-3">
            {["Name", "Email", "Hourly Rate", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/30">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-white/25">No attorneys found.</div>
          ) : filtered.map((a, i) => (
            <div
              key={a.id}
              onClick={() => setViewTarget(a)}
              className={`grid cursor-pointer grid-cols-[2fr_2fr_1fr_0.5fr] items-center px-5 py-3.5 transition-colors hover:bg-[#8DC63F]/[0.04] ${i < filtered.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8DC63F] text-[11px] font-bold text-[#0A0F1E]">
                  {getInitials(a.name)}
                </div>
                <p className="m-0 text-[13px] font-semibold text-white">{a.name}</p>
              </div>
              <p className="m-0 text-xs text-white/50">{a.email}</p>
              <p className="m-0 text-[13px] font-bold text-[#8DC63F]">{fmtR(a.hourlyRate)}</p>
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEdit(a)}
                  className="cursor-pointer border-none bg-transparent p-1 text-white/30 transition-colors hover:text-[#8DC63F]"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="cursor-pointer border-none bg-transparent p-1 text-white/30 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-[#8DC63F]/10 bg-black/15 px-5 py-3">
            <span className="text-xs text-white/30">
              Showing <span className="font-semibold text-[#8DC63F]">{filtered.length}</span> of {attorneys.length} attorneys
            </span>
          </div>
        </div>
      )}

      {viewTarget && <DetailModal attorney={viewTarget} onEdit={handleEdit} onClose={() => setViewTarget(null)} />}
      {showForm   && <AttorneyModal attorney={editTarget} onSave={handleSave} onClose={() => { setShowForm(false); setEditTarget(null); }} saving={saving} />}
      {toast      && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
