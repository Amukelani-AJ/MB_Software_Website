import { useState, useEffect, useRef } from "react";
import {
  Mail, Phone, FileText, Calendar, Globe,
  Clock, Zap, ChevronDown, X, Wifi, Play, SkipForward,
} from "lucide-react";

const API = "https://localhost:7291/api";

const SEED_ATTORNEYS = [
  { id: 1, name: "John Dube",        hourlyRate: 2500 },
  { id: 2, name: "Sarah Molefe",     hourlyRate: 3000 },
  { id: 3, name: "James Nkosi",      hourlyRate: 2000 },
  { id: 4, name: "Amukelani Ndlovu", hourlyRate: 2800 },
  { id: 5, name: "Sipho Mokoena",    hourlyRate: 2200 },
  { id: 6, name: "Thabo Sithole",    hourlyRate: 1800 },
  { id: 7, name: "Nomsa Dlamini",    hourlyRate: 2600 },
  { id: 8, name: "Pieter Venter",    hourlyRate: 3200 },
];

const SEED_MATTERS = [
  { id: 1,  matterNumber: "MB-2026-001", clientName: "ABC Corporation"      },
  { id: 2,  matterNumber: "MB-2026-002", clientName: "XYZ Ltd"              },
  { id: 3,  matterNumber: "MB-2026-003", clientName: "Smith vs Jones"       },
  { id: 4,  matterNumber: "MB-2026-004", clientName: "DEF Enterprises"      },
  { id: 5,  matterNumber: "MB-2026-005", clientName: "GHI Holdings"         },
  { id: 6,  matterNumber: "MB-2026-006", clientName: "Khumalo Family Trust" },
  { id: 7,  matterNumber: "MB-2026-007", clientName: "Transnet SOC Ltd"     },
  { id: 8,  matterNumber: "MB-2026-008", clientName: "Nedbank Ltd"          },
  { id: 9,  matterNumber: "MB-2026-009", clientName: "Eskom Holdings"       },
  { id: 10, matterNumber: "MB-2026-010", clientName: "Sasol Limited"        },
  { id: 11, matterNumber: "MB-2026-011", clientName: "Venter & Associates"  },
  { id: 12, matterNumber: "MB-2026-012", clientName: "Dlamini Estate"       },
  { id: 13, matterNumber: "MB-2026-013", clientName: "Mbeki Family"         },
  { id: 14, matterNumber: "MB-2026-014", clientName: "Nkosi Investments"    },
  { id: 15, matterNumber: "MB-2026-015", clientName: "Sithole Trading"      },
];

const EVENT_TEMPLATES = [
  { type: "email",    icon: Mail,     label: "Email Detected",    color: "#60a5fa", desc: "Email sent to Transnet legal team re: arbitration hearing dates",          duration: 0.1, units: 1,  attorney: SEED_ATTORNEYS[3], matter: SEED_MATTERS[6]  },
  { type: "call",     icon: Phone,    label: "Call Captured",     color: "#34d399", desc: "Outbound call to SARS official re: objection — duration 18 min",           duration: 0.3, units: 3,  attorney: SEED_ATTORNEYS[4], matter: SEED_MATTERS[10] },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "Heads_of_Argument_v4.docx — 38 mins active editing detected",              duration: 0.6, units: 6,  attorney: SEED_ATTORNEYS[3], matter: SEED_MATTERS[2]  },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",     color: "#f472b6", desc: "Calendar: Dlamini Estate — client consultation ended",                     duration: 0.5, units: 5,  attorney: SEED_ATTORNEYS[4], matter: SEED_MATTERS[11] },
  { type: "research", icon: Globe,    label: "Research Detected", color: "#fb923c", desc: "Browser: saflii.org open 45 mins — tax tribunal precedents",               duration: 0.8, units: 8,  attorney: SEED_ATTORNEYS[4], matter: SEED_MATTERS[10] },
  { type: "email",    icon: Mail,     label: "Email Detected",    color: "#60a5fa", desc: "Email reply to Mbeki Family re: trust deed amendment query",               duration: 0.1, units: 1,  attorney: SEED_ATTORNEYS[5], matter: SEED_MATTERS[12] },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "Trust_Deed_Draft_v2.docx — 52 mins of active editing",                    duration: 0.9, units: 9,  attorney: SEED_ATTORNEYS[5], matter: SEED_MATTERS[12] },
  { type: "call",     icon: Phone,    label: "Call Captured",     color: "#34d399", desc: "Inbound call from Nedbank legal — mortgage bond query, 22 min",            duration: 0.4, units: 4,  attorney: SEED_ATTORNEYS[0], matter: SEED_MATTERS[7]  },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",     color: "#f472b6", desc: "Calendar: Transnet pre-arbitration prep — 90 min session ended",           duration: 1.5, units: 15, attorney: SEED_ATTORNEYS[3], matter: SEED_MATTERS[6]  },
  { type: "research", icon: Globe,    label: "Research Detected", color: "#fb923c", desc: "Browser: judgments.co.za — credit listing case law, 31 mins",             duration: 0.5, units: 5,  attorney: SEED_ATTORNEYS[3], matter: SEED_MATTERS[2]  },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "SARS_Objection_v3.docx — 44 mins of active editing",                      duration: 0.7, units: 7,  attorney: SEED_ATTORNEYS[7], matter: SEED_MATTERS[10] },
  { type: "email",    icon: Mail,     label: "Email Detected",    color: "#60a5fa", desc: "Email sent to ABC Corporation re: shareholder agreement comments",          duration: 0.1, units: 1,  attorney: SEED_ATTORNEYS[0], matter: SEED_MATTERS[0]  },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",     color: "#f472b6", desc: "Calendar: GHI Holdings — property dispute strategy session ended",         duration: 0.5, units: 5,  attorney: SEED_ATTORNEYS[2], matter: SEED_MATTERS[4]  },
  { type: "call",     icon: Phone,    label: "Call Captured",     color: "#34d399", desc: "Outbound call to Eskom regulatory team — compliance query, 15 min",        duration: 0.3, units: 3,  attorney: SEED_ATTORNEYS[1], matter: SEED_MATTERS[8]  },
  { type: "research", icon: Globe,    label: "Research Detected", color: "#fb923c", desc: "Browser: greengazette.co.za — environmental permit regulations, 38 mins",  duration: 0.6, units: 6,  attorney: SEED_ATTORNEYS[2], matter: SEED_MATTERS[9]  },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "Labour_Court_Application.docx — 29 mins of active editing",               duration: 0.5, units: 5,  attorney: SEED_ATTORNEYS[5], matter: SEED_MATTERS[3]  },
  { type: "email",    icon: Mail,     label: "Email Detected",    color: "#60a5fa", desc: "Email to Khumalo Family Trust re: estate duty calculation update",         duration: 0.1, units: 1,  attorney: SEED_ATTORNEYS[6], matter: SEED_MATTERS[5]  },
  { type: "call",     icon: Phone,    label: "Call Captured",     color: "#34d399", desc: "Conference call with Nkosi Investments M&A team — 35 min",                 duration: 0.6, units: 6,  attorney: SEED_ATTORNEYS[7], matter: SEED_MATTERS[13] },
  { type: "research", icon: Globe,    label: "Research Detected", color: "#fb923c", desc: "Browser: cipc.co.za — company registration precedents, 22 mins",           duration: 0.4, units: 4,  attorney: SEED_ATTORNEYS[7], matter: SEED_MATTERS[13] },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "Inter_Vivos_Trust_Deed_v1.docx — 55 mins of active editing",              duration: 0.9, units: 9,  attorney: SEED_ATTORNEYS[6], matter: SEED_MATTERS[5]  },
  { type: "meeting",  icon: Calendar, label: "Meeting Ended",     color: "#f472b6", desc: "Calendar: Sithole Trading — contract negotiation session ended",           duration: 0.7, units: 7,  attorney: SEED_ATTORNEYS[5], matter: SEED_MATTERS[14] },
  { type: "email",    icon: Mail,     label: "Email Detected",    color: "#60a5fa", desc: "Email received from XYZ Ltd re: summons service confirmation",             duration: 0.1, units: 1,  attorney: SEED_ATTORNEYS[1], matter: SEED_MATTERS[1]  },
  { type: "document", icon: FileText, label: "Document Edited",   color: "#a78bfa", desc: "Particulars_of_Claim_v2.docx — 41 mins of active editing",                duration: 0.7, units: 7,  attorney: SEED_ATTORNEYS[1], matter: SEED_MATTERS[1]  },
  { type: "call",     icon: Phone,    label: "Call Captured",     color: "#34d399", desc: "Inbound call from Sasol environmental manager — 27 min",                   duration: 0.5, units: 5,  attorney: SEED_ATTORNEYS[2], matter: SEED_MATTERS[9]  },
  { type: "research", icon: Globe,    label: "Research Detected", color: "#fb923c", desc: "Browser: acts.co.za — Labour Relations Act amendments, 50 mins",           duration: 0.8, units: 8,  attorney: SEED_ATTORNEYS[4], matter: SEED_MATTERS[3]  },
];

const FILTERS = [
  { id: "all",      label: "All"       },
  { id: "pending",  label: "Pending"   },
  { id: "assigned", label: "Assigned"  },
  { id: "email",    label: "Emails"    },
  { id: "call",     label: "Calls"     },
  { id: "meeting",  label: "Meetings"  },
  { id: "document", label: "Documents" },
  { id: "research", label: "Research"  },
];

const STATUS_CLS = {
  pending:   "text-amber-400  bg-amber-400/10  border border-amber-400/25",
  assigned:  "text-[#8DC63F]  bg-[#8DC63F]/10  border border-[#8DC63F]/25",
  dismissed: "text-white/25   bg-white/[0.04]  border border-white/[0.08]",
};

// ── Shared form classes (module scope) ─────────────────────────────────────────
const inputCls  = "w-full rounded-lg border border-[#8DC63F]/25 bg-[#080D1A] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20";
const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;

// ── Assign Modal ──────────────────────────────────────────────────────────────
function AssignModal({ event, onAssign, onDismiss, matters, saving }) {
  const [matterId,  setMatterId]  = useState(event.suggestedMatterId || matters[0]?.id || "");
  const [duration,  setDuration]  = useState(event.duration);
  const [note,      setNote]      = useState(event.desc);
  const attorneyId      = event.suggestedAttorneyId;
  const units           = Math.ceil(duration * 10);
  const selectedMatter  = matters.find((m) => m.id === Number(matterId));
  const Icon            = event.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5" onClick={onDismiss}>
      <div className="w-[500px] max-w-full overflow-hidden rounded-xl border border-[#8DC63F]/30 bg-[#0D1426]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8DC63F]/12 bg-[#8DC63F]/[0.05] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ background: `${event.color}20`, borderColor: `${event.color}40` }}>
              <Icon className="h-[15px] w-[15px]" style={{ color: event.color }} />
            </div>
            <div>
              <p className="m-0 text-[13px] font-bold text-white">Assign to Matter</p>
              <p className="m-0 text-[11px] text-white/40">{event.label} · {event.attorney}</p>
            </div>
          </div>
          <button onClick={onDismiss} className="cursor-pointer border-none bg-transparent text-white/30">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Auto-detected info */}
          <div className="mb-4 rounded-lg border border-[#8DC63F]/15 bg-[#8DC63F]/[0.06] p-3.5">
            <p className="m-0 mb-1 text-[10px] uppercase tracking-[1.5px] text-[#8DC63F]/70">Auto-Detected Activity</p>
            <p className="m-0 mb-2 text-xs leading-relaxed text-white/70">{event.desc}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-wide text-white/35">DETECTED ON DEVICE OF</span>
              <span className="rounded-full border border-[#8DC63F]/25 bg-[#8DC63F]/12 px-2.5 py-0.5 text-[11px] font-bold text-[#8DC63F]">
                {event.attorney}
              </span>
            </div>
          </div>

          {/* Matter select */}
          <div className="mb-3.5">
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">
              Client Matter <span className="text-[#8DC63F]">*</span>
            </label>
            <div className="relative">
              <select value={matterId} onChange={(e) => setMatterId(e.target.value)} className={selectCls}>
                {matters.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0D1426]">
                    {m.matterNumber} — {m.clientName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            </div>
          </div>

          {/* Duration + units */}
          <div className="mb-3.5">
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">Duration (hours)</label>
            <div className="flex gap-2.5">
              <input type="number" step="0.1" min="0.1" value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0.1)}
                className={`${inputCls} flex-1`} />
              <div className="flex min-w-[90px] flex-col items-center justify-center rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/10 px-3.5 py-2">
                <p className="m-0 text-[10px] uppercase tracking-widest text-[#8DC63F]/60">Units</p>
                <p className="m-0 text-lg font-bold text-[#8DC63F]">{units}</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-white/40">Description / Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              className={`${inputCls} resize-y leading-relaxed text-white/80 text-xs`} />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={() => onAssign({ ...event, matterId: Number(matterId), attorneyId: Number(attorneyId), matter: selectedMatter, attorney: event.attorney, duration, units, note })}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-none bg-[#8DC63F] py-3 text-[13px] font-bold text-[#0A0F1E] hover:opacity-90"
            >
              {saving ? "Saving to API…" : "✓ Confirm & Save Entry"}
            </button>
            <button onClick={onDismiss}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/50 hover:bg-white/10">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feed Item ─────────────────────────────────────────────────────────────────
function FeedItem({ item, onAssign, isNew }) {
  const [highlighted, setHighlighted] = useState(isNew);
  useEffect(() => {
    if (isNew) { const t = setTimeout(() => setHighlighted(false), 2000); return () => clearTimeout(t); }
  }, [isNew]);

  const sCls = STATUS_CLS[item.status] || STATUS_CLS.dismissed;
  const Icon = item.icon;

  return (
    <div className={`flex items-start gap-3.5 border-b border-white/[0.04] px-5 py-4 transition-colors duration-1000 ${highlighted ? "bg-[#8DC63F]/[0.05]" : "bg-transparent"}`}>
      {/* Icon */}
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
        style={{ background: `${item.color}18`, borderColor: `${item.color}30` }}>
        <Icon className="h-4 w-4" style={{ color: item.color }} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-white">{item.label}</span>
          <span className="rounded px-1.5 py-px text-[10px]" style={{ color: item.color, background: `${item.color}15` }}>
            {item.type}
          </span>
          {isNew && (
            <span className="animate-pulse rounded border border-[#8DC63F]/30 bg-[#8DC63F]/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-widest text-[#8DC63F]">
              NEW
            </span>
          )}
        </div>
        <p className="m-0 mb-1.5 text-xs leading-relaxed text-white/55">{item.desc}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-white/30">{item.attorney}</span>
          <span className="text-[11px] text-white/20">·</span>
          <span className="text-[11px] text-white/30">{item.duration} hrs · {item.units} units</span>
          <span className="text-[11px] text-white/20">·</span>
          <span className="text-[11px] text-white/25">{item.timestamp}</span>
          {item.matter && (
            <>
              <span className="text-[11px] text-white/20">·</span>
              <span className="text-[11px] font-semibold text-[#8DC63F]">{item.matter.ref}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sCls}`}>
          {item.status}
        </span>
        {item.status === "pending" && (
          <button onClick={() => onAssign(item)}
            className="cursor-pointer rounded-md border-none bg-[#8DC63F] px-3 py-1.5 text-[11px] font-bold text-[#0A0F1E] hover:opacity-90 whitespace-nowrap">
            + Assign
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ActivityFeed() {
  const [feed,         setFeed]         = useState([]);
  const [newIds,       setNewIds]       = useState(new Set());
  const [assignTarget, setAssignTarget] = useState(null);
  const [simulating,   setSimulating]   = useState(false);
  const [filter,       setFilter]       = useState("all");
  const [visible,      setVisible]      = useState(false);
  const [stats,        setStats]        = useState({ total: 0, assigned: 0, pending: 0, dismissed: 0 });
  const [matters,      setMatters]      = useState([]);
  const [attorneys,    setAttorneys]    = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [apiError,     setApiError]     = useState(null);
  const poolIndex  = useRef(0);
  const intervalRef= useRef(null);
  const idCounter  = useRef(0);

  useEffect(() => {
    setMatters(SEED_MATTERS);
    setAttorneys(SEED_ATTORNEYS);
    Promise.all([
      fetch(`${API}/Matter`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/Attorney`).then((r) => r.json()).catch(() => []),
    ]).then(([mats, atts]) => {
      const mappedMatters   = mats.map((m) => ({ id: m.Id ?? m.id, matterNumber: m.MatterNumber ?? m.matterNumber ?? "—", clientName: m.ClientName ?? m.clientName ?? "—" }));
      const mappedAttorneys = atts.map((a) => ({ id: a.Id ?? a.id, name: a.Name ?? a.name ?? "—" }));
      if (mappedMatters.length   > 0) setMatters(mappedMatters);
      if (mappedAttorneys.length > 0) setAttorneys(mappedAttorneys);
    }).catch(() => {});
  }, []);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  useEffect(() => {
    setStats({
      total:     feed.length,
      assigned:  feed.filter((f) => f.status === "assigned").length,
      pending:   feed.filter((f) => f.status === "pending").length,
      dismissed: feed.filter((f) => f.status === "dismissed").length,
    });
  }, [feed]);

  const addEvent = () => {
    const template         = EVENT_TEMPLATES[poolIndex.current % EVENT_TEMPLATES.length];
    poolIndex.current     += 1;
    const now              = new Date();
    const timestamp        = now.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const id               = ++idCounter.current;
    const resolvedAttorney = template.attorney;
    const resolvedMatter   = template.matter;
    const apiAttorney      = attorneys.find((a) => a.name === resolvedAttorney?.name) || resolvedAttorney;
    const apiMatter        = matters.find((m) => m.matterNumber === resolvedMatter?.matterNumber) || resolvedMatter;

    const newEvent = {
      ...template, id, status: "pending", timestamp, matter: null,
      attorney:           resolvedAttorney?.name || "Unknown Attorney",
      suggestedAttorneyId:apiAttorney?.id || resolvedAttorney?.id || null,
      suggestedMatterId:  apiMatter?.id   || resolvedMatter?.id   || null,
    };
    setFeed((prev) => [newEvent, ...prev]);
    setNewIds((prev) => new Set([...prev, id]));
    setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 3000);
  };

  const startSimulation = () => {
    if (simulating) { clearInterval(intervalRef.current); setSimulating(false); return; }
    setSimulating(true);
    addEvent();
    intervalRef.current = setInterval(addEvent, 5000);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleAssign = async (assigned) => {
    setSaving(true);
    try {
      const payload = {
        AttorneyId: assigned.attorneyId,
        MatterId:   assigned.matterId,
        Narrative:  assigned.note,
        Category:   assigned.type.charAt(0).toUpperCase() + assigned.type.slice(1),
        Units:      assigned.units,
        WorkDate:   new Date().toISOString().split("T")[0],
      };
      const res = await fetch(`${API}/TimeEntry`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const msg = await res.text().catch(() => res.status); throw new Error(msg); }
      setFeed((prev) => prev.map((item) =>
        item.id === assigned.id
          ? { ...item, status: "assigned", matter: assigned.matter, attorney: assigned.attorney, duration: assigned.duration, units: assigned.units, desc: assigned.note }
          : item
      ));
      setAssignTarget(null);
    } catch (err) {
      alert(`Failed to save: ${err.message || "API error"}`);
    } finally { setSaving(false); }
  };

  const filtered = filter === "all" ? feed : feed.filter((f) => f.status === filter || f.type === filter);
  const show     = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3";

  return (
    <div className="min-h-full bg-[#080D1A] px-8 py-7 font-sans text-white">

      {/* Header */}
      <div className={`mb-6 flex items-end justify-between transition-all duration-500 ${show}`}>
        <div>
          <p className="m-0 text-[11px] uppercase tracking-[3px] text-[#8DC63F]">Automation Engine</p>
          <h2 className="m-0 mt-1 text-2xl font-bold tracking-tight">Activity Feed</h2>
          <p className="m-0 mt-1 text-[13px] text-white/35">Auto-captured attorney activity — review and assign to matters</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={addEvent}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#8DC63F]/20 bg-[#0D1426] px-4 py-2.5 text-xs text-white/60 hover:text-white/80">
            <SkipForward className="h-3.5 w-3.5" /> Trigger Event
          </button>
          <button onClick={startSimulation}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border-none px-5 py-2.5 text-[13px] font-bold transition-all duration-200 ${simulating
              ? "border border-red-500/40 bg-red-500/15 text-red-400"
              : "bg-[#8DC63F] text-[#0A0F1E] hover:opacity-90"
            }`}>
            {simulating ? (
              <><span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Stop Simulation</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Start Simulation</>
            )}
          </button>
        </div>
      </div>

      {/* Live indicator */}
      {simulating && (
        <div className={`mb-5 flex items-center gap-2.5 rounded-lg border border-[#8DC63F]/20 bg-[#8DC63F]/[0.06] px-4 py-2.5 transition-all duration-500 ${show}`}>
          <div className="relative h-2.5 w-2.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#8DC63F] opacity-40" />
            <span className="absolute inset-0 rounded-full bg-[#8DC63F]" />
          </div>
          <span className="text-xs font-medium text-[#8DC63F]/80">
            Simulation running — monitoring emails, calls, documents, meetings and browser activity in real time
          </span>
          <span className="ml-auto text-[11px] text-white/30">New event every 5s</span>
        </div>
      )}

      {/* Empty state */}
      {feed.length === 0 && (
        <div className={`mb-5 rounded-xl border border-dashed border-[#8DC63F]/20 bg-[#0D1426] px-10 py-16 text-center transition-all delay-100 duration-500 ${show}`}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8DC63F]/20 bg-[#8DC63F]/[0.08]">
            <Zap className="h-6 w-6 text-[#8DC63F]" />
          </div>
          <h3 className="m-0 mb-2 text-base font-bold text-white">No Activity Yet</h3>
          <p className="m-0 mx-auto mb-5 max-w-sm text-[13px] leading-relaxed text-white/35">
            Click <strong className="text-[#8DC63F]">Start Simulation</strong> to watch the system automatically detect and capture attorney activity in real time.
          </p>
          <button onClick={startSimulation}
            className="cursor-pointer rounded-lg border-none bg-[#8DC63F] px-6 py-2.5 text-[13px] font-bold text-[#0A0F1E] hover:opacity-90">
            <Play className="mr-1.5 inline h-3.5 w-3.5 align-middle" />
            Start Simulation
          </button>
        </div>
      )}

      {feed.length > 0 && (
        <>
          {/* Stats */}
          <div className={`mb-5 grid grid-cols-4 gap-3.5 transition-all delay-[80ms] duration-500 ${show}`}>
            {[
              { label: "Total Captured", value: stats.total,     color: "text-white"      },
              { label: "Pending Review", value: stats.pending,   color: "text-amber-400"  },
              { label: "Assigned",       value: stats.assigned,  color: "text-[#8DC63F]"  },
              { label: "Dismissed",      value: stats.dismissed, color: "text-white/30"   },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-[#8DC63F]/10 bg-[#0D1426] px-[18px] py-3.5">
                <p className="m-0 text-[10px] uppercase tracking-[1.5px] text-white/35">{c.label}</p>
                <p className={`m-0 mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className={`mb-4 flex flex-wrap items-center gap-1.5 transition-all delay-[120ms] duration-500 ${show}`}>
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-all duration-150 ${filter === f.id
                  ? "border-[#8DC63F] bg-[#8DC63F] font-semibold text-[#0A0F1E]"
                  : "border-white/10 bg-transparent text-white/45 hover:border-white/25 hover:text-white/70"
                }`}>
                {f.label}
              </button>
            ))}
            {stats.pending > 0 && (
              <span className="ml-auto rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-400">
                ⚠ {stats.pending} pending review
              </span>
            )}
          </div>

          {/* Feed list */}
          <div className={`overflow-hidden rounded-xl border border-[#8DC63F]/[0.12] bg-[#0D1426] transition-all delay-[160ms] duration-500 ${show}`}>
            {/* List header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Wifi className={`h-3.5 w-3.5 ${simulating ? "text-[#8DC63F]" : "text-white/20"}`} />
                <span className="text-xs font-semibold tracking-wide text-white/50">
                  {filtered.length} {filter === "all" ? "events" : filter} captured
                </span>
              </div>
              {stats.pending > 0 && (
                <button
                  onClick={() => { const first = feed.find((f) => f.status === "pending"); if (first) setAssignTarget(first); }}
                  className="cursor-pointer rounded-md border border-[#8DC63F]/25 bg-[#8DC63F]/10 px-3 py-1.5 text-[11px] font-semibold text-[#8DC63F] hover:bg-[#8DC63F]/20"
                >
                  Review Next Pending →
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-white/25">No events match this filter.</div>
            ) : filtered.map((item) => (
              <FeedItem key={item.id} item={item} isNew={newIds.has(item.id)} onAssign={setAssignTarget} />
            ))}
          </div>
        </>
      )}

      {/* API error */}
      {apiError && (
        <div className="mt-4 rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-4 py-2.5 text-xs text-amber-400">
          ⚠ {apiError}
        </div>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <AssignModal
          event={assignTarget}
          onAssign={handleAssign}
          onDismiss={() => setAssignTarget(null)}
          matters={matters}
          saving={saving}
        />
      )}
    </div>
  );
}
