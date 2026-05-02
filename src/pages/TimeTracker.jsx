import { useState, useEffect, useRef } from "react";
import {
  Play, Pause, Square, Plus, ChevronDown,
  Clock, Save, Trash2, CheckCircle, AlertCircle,
} from "lucide-react";

const API = "https://localhost:7291/api";
const TASK_TYPES = ["Drafting","Research","Court","Meeting","Consultation","Communication","Administration"];

function fmtTime(sec) {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
function secToHrs(sec) { return (sec / 3600).toFixed(1); }
function secToUnits(sec) { return Math.ceil(sec / 360); }
function fmtRand(n) { return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function Select({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", appearance: "none", background: "#080D1A", border: "1px solid rgba(141,198,63,0.25)", borderRadius: "7px", color: value ? "#fff" : "rgba(255,255,255,0.35)", fontSize: "13px", padding: "11px 36px 11px 14px", outline: "none", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => typeof o === "string"
          ? <option key={o} value={o} style={{ background: "#0D1426" }}>{o}</option>
          : <option key={o.id} value={o.id} style={{ background: "#0D1426" }}>{o.ref} — {o.name}</option>
        )}
      </select>
      <ChevronDown style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
    </div>
  );
}

export function TimeTracker() {
  const [elapsed, setElapsed]     = useState(0);
  const [running, setRunning]     = useState(false);
  const [paused, setPaused]       = useState(false);
  const intervalRef               = useRef(null);
  const startTimeRef              = useRef(null);

  // Form state
  const [matterId, setMatterId]   = useState("");
  const [attorneyId, setAttorneyId] = useState("");
  const [taskType, setTaskType]   = useState("");
  const [desc, setDesc]           = useState("");

  // API data
  const [matters, setMatters]     = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState(false);
  const [errorMsg, setErrorMsg]   = useState(null);
  const [visible, setVisible]     = useState(false);

  // Fetch matters and attorneys on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          fetch(`${API}/Matter`),
          fetch(`${API}/Attorney`),
        ]);
        const [m, a] = await Promise.all([mRes.json(), aRes.json()]);
        const activeMatter = (Array.isArray(m) ? m : []).filter(mx => (mx.status || "").toLowerCase() !== "closed");
        console.log("Matters loaded:", activeMatter);
        console.log("Attorneys loaded:", a);
        setMatters(activeMatter);
        setAttorneys(Array.isArray(a) ? a : []);
        // Default to first attorney
        if (a.length > 0) setAttorneyId(String(a[0].id));
      } catch (e) {
        console.error("TimeTracker fetch error:", e);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 50);
      }
    };
    fetchData();
  }, []);

  // Timer logic
  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, paused]);

  const handleStart = () => {
    if (!matterId || !taskType) return;
    if (!startTimeRef.current) startTimeRef.current = new Date();
    setRunning(true);
    setPaused(false);
    setSavedMsg(false);
    setErrorMsg(null);
  };

  const handlePause = () => { if (running) setPaused((p) => !p); };

  const handleStop = () => {
    setRunning(false);
    setPaused(false);
    clearInterval(intervalRef.current);
  };

  const handleSave = async () => {
    if (elapsed === 0 || !matterId || !taskType) return;
    const matter   = matters.find((m) => m.id === Number(matterId));
    const attorney = attorneys.find((a) => a.id === Number(attorneyId));
    const units    = secToUnits(elapsed);
    const start    = startTimeRef.current || new Date();
    const end      = new Date();
    const fmt      = (d) => d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

    const payload = {
      attorneyId: Number(attorneyId),
      matterId:   Number(matterId),
      narrative:  desc || `${taskType} — ${matter?.clientName || matter?.matterNumber}`,
      category:   taskType,
      units,
      workDate:   new Date().toISOString(),
    };

    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API}/TimeEntry`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");

      // Add to local session log for immediate feedback
      setSessions((prev) => [{
        id:       Date.now(),
        matter:   { id: matter?.id, ref: matter?.matterNumber, name: matter?.clientName, rate: attorney?.hourlyRate || 0 },
        attorney: attorney?.name || "—",
        type:     taskType,
        desc:     payload.narrative,
        elapsed,
        saved:    true,
        start:    fmt(start),
        end:      fmt(end),
      }, ...prev]);

      // Reset form
      setElapsed(0); setRunning(false); setPaused(false);
      setDesc(""); setTaskType(""); setMatterId("");
      startTimeRef.current = null;
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch {
      setErrorMsg("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => setSessions((prev) => prev.filter((s) => s.id !== id));

  const totalToday    = sessions.reduce((s, e) => s + e.elapsed, 0);
  const totalUnits    = sessions.reduce((s, e) => s + secToUnits(e.elapsed), 0);
  const totalValue    = sessions.reduce((s, e) => s + parseFloat(secToHrs(e.elapsed)) * (e.matter?.rate || 0), 0);
  const selectedMatter   = matters.find((m) => m.id === Number(matterId));
  const selectedAttorney = attorneys.find((a) => a.id === Number(attorneyId));
  const canStart      = !!(matterId && taskType);

  // Matter options shaped for Select
  const matterOptions = matters.map(m => ({ id: m.id, ref: m.matterNumber, name: m.clientName }));
  // Attorney options — use name as ref so it displays cleanly
  const attorneyOptions = attorneys.map(a => ({ id: a.id, ref: a.name, name: `R ${Number(a.hourlyRate).toLocaleString()}/hr` }));

  const r = 80; const circ = 2 * Math.PI * r;
  const pct = Math.min(elapsed / 28800, 1);

  const fadeIn = (d = 0) => ({ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${d}ms, transform 0.4s ease ${d}ms` });

  return (
    <div style={{ minHeight: "100%", background: "#080D1A", padding: "28px 32px", fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      <div style={{ ...fadeIn(0), marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", color: "#8DC63F", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>Real-Time Capture</p>
        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.5px" }}>Time Tracker</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>Start a timer, assign to a matter and save as a billable entry</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px", alignItems: "start" }}>

        {/* Left panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Ring timer */}
          <div style={{ ...fadeIn(80), background: "#0D1426", border: `1px solid ${running && !paused ? "rgba(141,198,63,0.45)" : "rgba(141,198,63,0.12)"}`, borderRadius: "12px", padding: "32px 24px", textAlign: "center", transition: "border-color 0.3s ease, box-shadow 0.3s ease", boxShadow: running && !paused ? "0 0 40px rgba(141,198,63,0.07)" : "none" }}>

            <div style={{ position: "relative", width: "200px", height: "200px", margin: "0 auto 24px" }}>
              <svg viewBox="0 0 200 200" style={{ width: "200px", height: "200px", transform: "rotate(-90deg)" }}>
                <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="100" cy="100" r={r} fill="none" stroke={paused ? "#f59e0b" : "#8DC63F"} strokeWidth="12" strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease, stroke 0.3s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "34px", fontWeight: 700, color: running ? (paused ? "#f59e0b" : "#8DC63F") : "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums", fontFamily: "'Courier New', monospace", letterSpacing: "2px", transition: "color 0.3s ease" }}>
                  {fmtTime(elapsed)}
                </span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", marginTop: "4px" }}>
                  {running ? (paused ? "PAUSED" : "RUNNING") : "STOPPED"}
                </span>
                {elapsed > 0 && (
                  <span style={{ fontSize: "12px", color: "#8DC63F", marginTop: "6px", fontWeight: 600 }}>
                    {secToUnits(elapsed)} units · {secToHrs(elapsed)} hrs
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginBottom: "20px" }}>
              <button onClick={handleStart} disabled={!canStart && !paused}
                style={{ width: "52px", height: "52px", borderRadius: "50%", border: "none", background: canStart ? "#8DC63F" : "rgba(141,198,63,0.12)", color: canStart ? "#0A0F1E" : "rgba(141,198,63,0.3)", cursor: canStart ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                <Play style={{ width: "20px", height: "20px", marginLeft: "2px" }} />
              </button>
              <button onClick={handlePause} disabled={!running}
                style={{ width: "52px", height: "52px", borderRadius: "50%", border: "1px solid rgba(245,158,11,0.4)", background: running ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)", color: running ? "#f59e0b" : "rgba(255,255,255,0.2)", cursor: running ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                <Pause style={{ width: "18px", height: "18px" }} />
              </button>
              <button onClick={handleStop} disabled={!running && elapsed === 0}
                style={{ width: "52px", height: "52px", borderRadius: "50%", border: "1px solid rgba(239,68,68,0.4)", background: running ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)", color: running || elapsed > 0 ? "#ef4444" : "rgba(255,255,255,0.2)", cursor: running || elapsed > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                <Square style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {elapsed > 0 && !running && (
              <button onClick={handleSave} disabled={saving}
                style={{ width: "100%", fontSize: "14px", fontWeight: 700, color: "#0A0F1E", background: saving ? "rgba(141,198,63,0.5)" : "#8DC63F", border: "none", borderRadius: "8px", padding: "13px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Save style={{ width: "16px", height: "16px" }} />
                {saving ? "Saving…" : `Save Entry — R ${fmtRand(parseFloat(secToHrs(elapsed)) * (selectedAttorney?.hourlyRate || 0))}`}
              </button>
            )}

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
                <AlertCircle style={{ width: "14px", height: "14px", color: "#ef4444" }} />
                <span style={{ fontSize: "12px", color: "#ef4444" }}>{errorMsg}</span>
              </div>
            )}

            {savedMsg && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
                <CheckCircle style={{ width: "14px", height: "14px", color: "#8DC63F" }} />
                <span style={{ fontSize: "12px", color: "#8DC63F" }}>Entry saved successfully</span>
              </div>
            )}
          </div>

          {/* Form */}
          <div style={{ ...fadeIn(120), background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "12px", padding: "20px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px" }}>Timer Details</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Client Matter <span style={{ color: "#8DC63F" }}>*</span></label>
                <Select value={matterId} onChange={setMatterId} options={matterOptions} placeholder={loading ? "Loading matters…" : matterOptions.length === 0 ? "No matters found" : "Select matter..."} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Attorney</label>
                <Select value={attorneyId} onChange={setAttorneyId} options={attorneyOptions} placeholder={loading ? "Loading attorneys…" : attorneyOptions.length === 0 ? "No attorneys found" : "Select attorney..."} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Task Type <span style={{ color: "#8DC63F" }}>*</span></label>
                <Select value={taskType} onChange={setTaskType} options={TASK_TYPES} placeholder="Select type..." />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of work done..." rows={2}
                  style={{ width: "100%", background: "#080D1A", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "7px", color: "rgba(255,255,255,0.8)", fontSize: "12px", padding: "10px 12px", outline: "none", fontFamily: "'Inter', sans-serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
              </div>
              {selectedMatter && elapsed > 0 && (
                <div style={{ background: "rgba(141,198,63,0.07)", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "7px", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Running total</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8DC63F" }}>R {fmtRand(parseFloat(secToHrs(elapsed)) * (selectedAttorney?.hourlyRate || 0))}</span>
                </div>
              )}
              {(!matterId || !taskType) && (
                <p style={{ fontSize: "11px", color: "rgba(245,158,11,0.7)", display: "flex", alignItems: "center", gap: "5px", margin: 0 }}>
                  <AlertCircle style={{ width: "12px", height: "12px" }} /> Select a matter and task type to enable the timer
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: sessions */}
        <div style={{ ...fadeIn(160) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
            {[
              { label: "Hours Today",   value: `${secToHrs(totalToday)} hrs`, color: "#8DC63F" },
              { label: "Total Units",   value: `${totalUnits} units`,          color: "#60a5fa" },
              { label: "Billable Value",value: `R ${fmtRand(totalValue)}`,     color: "#8DC63F" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.1)", borderRadius: "8px", padding: "16px 18px" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: c.color, margin: "6px 0 0" }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#0D1426", border: "1px solid rgba(141,198,63,0.12)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>Today's Sessions</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{sessions.length} recorded entries</p>
              </div>
              <Clock style={{ width: "16px", height: "16px", color: "rgba(141,198,63,0.5)" }} />
            </div>

            {sessions.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No sessions yet. Start your timer above.</div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: i < sessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(141,198,63,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ textAlign: "center", minWidth: "54px" }}>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.start}</p>
                    <div style={{ width: "1px", height: "10px", background: "rgba(141,198,63,0.3)", margin: "3px auto" }} />
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.end}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>{s.matter?.name}</p>
                      <span style={{ fontSize: "10px", color: "#8DC63F", background: "rgba(141,198,63,0.1)", padding: "1px 7px", borderRadius: "4px" }}>{s.type}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{s.desc}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: "3px 0 0" }}>{s.attorney}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#8DC63F", margin: 0, fontFamily: "'Courier New', monospace" }}>{fmtTime(s.elapsed)}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{secToUnits(s.elapsed)} units</p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>R {fmtRand(parseFloat(secToHrs(s.elapsed)) * (s.matter?.rate || 0))}</p>
                  </div>
                  <button onClick={() => handleDelete(s.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px", transition: "color 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")} >
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              ))
            )}

            {sessions.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(141,198,63,0.1)", background: "rgba(0,0,0,0.15)" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Total: <span style={{ color: "#8DC63F", fontWeight: 600 }}>{secToHrs(totalToday)} hrs · {totalUnits} units</span></span>
                <span style={{ fontSize: "12px", color: "#8DC63F", fontWeight: 600 }}>R {fmtRand(totalValue)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
