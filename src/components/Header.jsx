import { useState, useEffect } from "react";
import { Menu, Bell, Settings, ChevronDown, Briefcase, Shield } from "lucide-react";

const PAGE_META = {
  dashboard:    { title: "Dashboard",     sub: "Overview of your practice" },
  timetracker:  { title: "Time Tracker",  sub: "Capture billable time in real-time" },
  timeentries:  { title: "Time Entries",  sub: "Review and manage time logs" },
  matters:      { title: "Matters",       sub: "Client matter management" },
  billing:      { title: "Billing",       sub: "Invoices and billing outputs" },
  reports:      { title: "Reports",       sub: "Productivity and billing analytics" },
  attorneys:    { title: "Attorneys",     sub: "Attorney profiles and settings" },
  activityfeed: { title: "Activity Feed", sub: "Auto-captured activity log" },
};

const ROLES = [
  {
    id: "manager",
    label: "Practice Manager",
    short: "Manager",
    initial: "PM",
    color: "#8DC63F",
    email: "admin@mb.co.za",
    description: "Full system access",
  },
  {
    id: "attorney",
    label: "Amukelani Ndlovu",
    short: "Attorney",
    initial: "AN",
    color: "#60a5fa",
    email: "a.ndlovu@mb.co.za",
    description: "Attorney view",
  },
];

export function Header({ onToggleSidebar, currentPage = "dashboard", onRoleChange }) {
  const [time, setTime]       = useState(new Date());
  const [menuOpen, setMenu]   = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(ROLES[0]);

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = time.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const switchRole = (role) => {
    setActiveRole(role);
    setRoleOpen(false);
    setMenu(false);
    if (onRoleChange) onRoleChange(role.id);
  };

  const isAttorney = activeRole.id === "attorney";

  return (
    <header style={{ position: "relative", background: "#0D1226", borderBottom: "1px solid rgba(141,198,63,0.2)", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 30, flexShrink: 0 }}>
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #8DC63F 0%, #6aaa1f 50%, transparent 100%)" }} />

      {/* ── Left ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onToggleSidebar}
          style={{ padding: "8px", borderRadius: "6px", border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; e.currentTarget.style.color = "#8DC63F"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          <Menu style={{ width: "20px", height: "20px" }} />
        </button>

        <div style={{ width: "1px", height: "32px", background: "rgba(141,198,63,0.2)" }} />

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", letterSpacing: "0.3px", margin: 0 }}>{meta.title}</h1>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#8DC63F", background: "rgba(141,198,63,0.12)", border: "1px solid rgba(141,198,63,0.3)", padding: "2px 8px", borderRadius: "20px", letterSpacing: "1px", textTransform: "uppercase" }}>Live</span>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "1px 0 0" }}>{meta.sub}</p>
        </div>
      </div>

      {/* ── Right ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* Role switcher pill */}
        <div style={{ position: "relative", marginRight: "4px" }}>
          <button
            onClick={() => { setRoleOpen(!roleOpen); setMenu(false); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 8px", borderRadius: "8px", border: `1px solid ${isAttorney ? "rgba(96,165,250,0.35)" : "rgba(141,198,63,0.35)"}`, background: isAttorney ? "rgba(96,165,250,0.08)" : "rgba(141,198,63,0.08)", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: activeRole.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 800, color: "#0A0F1E" }}>
              {activeRole.initial}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: activeRole.color, margin: 0, lineHeight: 1 }}>{activeRole.short}</p>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", margin: 0, letterSpacing: "0.3px" }}>{activeRole.description}</p>
            </div>
            <ChevronDown style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.3)", transform: roleOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {roleOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "240px", background: "#0D1226", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 50 }}>
              <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Switch View</p>
              </div>
              {ROLES.map((role) => {
                const active = role.id === activeRole.id;
                return (
                  <button key={role.id} onClick={() => switchRole(role)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "none", background: active ? `${role.color}10` : "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s", borderLeft: active ? `2px solid ${role.color}` : "2px solid transparent" }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${role.color}20`, border: `1px solid ${role.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: role.color, flexShrink: 0 }}>
                      {role.initial}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: active ? role.color : "#fff", margin: 0 }}>{role.label}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "1px 0 0" }}>{role.email}</p>
                    </div>
                    {active && <span style={{ fontSize: "10px", color: role.color, background: `${role.color}15`, border: `1px solid ${role.color}30`, padding: "2px 7px", borderRadius: "10px" }}>Active</span>}
                  </button>
                );
              })}
              <div style={{ padding: "8px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", margin: 0, lineHeight: 1.5 }}>
                  {isAttorney ? "⚡ Attorney view: Activity Feed focused" : "🛡 Manager view: Full system access"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clock */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#8DC63F", fontVariantNumeric: "tabular-nums" }}>{formattedTime}</span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{formattedDate}</span>
        </div>

        <div style={{ width: "1px", height: "32px", background: "rgba(141,198,63,0.2)", margin: "0 4px" }} />

        {/* Notifications */}
        <button style={{ position: "relative", padding: "8px", borderRadius: "6px", border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; e.currentTarget.style.color = "#8DC63F"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          <Bell style={{ width: "18px", height: "18px" }} />
          <span style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px", background: "#8DC63F", borderRadius: "50%", border: "2px solid #0D1226" }} />
        </button>

        {/* Settings */}
        <button style={{ padding: "8px", borderRadius: "6px", border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; e.currentTarget.style.color = "#8DC63F"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          <Settings style={{ width: "18px", height: "18px" }} />
        </button>

        <div style={{ width: "1px", height: "32px", background: "rgba(141,198,63,0.2)", margin: "0 4px" }} />

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button onClick={() => { setMenu(!menuOpen); setRoleOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px 6px 6px", borderRadius: "8px", border: "none", background: menuOpen ? "rgba(141,198,63,0.1)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; }}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ position: "relative" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: activeRole.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: "#0A0F1E", fontFamily: "'Georgia', serif", transition: "background 0.3s" }}>
                {activeRole.initial}
              </div>
              <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "8px", height: "8px", background: "#8DC63F", borderRadius: "50%", border: "2px solid #0D1226" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.2 }}>{activeRole.label.split(" ")[0]}</p>
              <p style={{ fontSize: "10px", color: `${activeRole.color}99`, margin: 0, letterSpacing: "0.5px" }}>{activeRole.short}</p>
            </div>
            <ChevronDown style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.3)", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "200px", background: "#0D1226", border: "1px solid rgba(141,198,63,0.2)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 50 }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(141,198,63,0.1)" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: 0 }}>{activeRole.label}</p>
                <p style={{ fontSize: "11px", color: `${activeRole.color}99`, margin: "2px 0 0" }}>{activeRole.email}</p>
              </div>
              {[{ label: "Profile", icon: "👤" }, { label: "Settings", icon: "⚙️" }, { label: "Sign out", icon: "🚪" }].map((item) => (
                <button key={item.label} onClick={() => setMenu(false)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: "13px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(141,198,63,0.08)"; e.currentTarget.style.color = "#8DC63F"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
