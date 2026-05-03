import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Briefcase,
  FileText,
  BarChart3,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// roles: "all" = everyone, "manager" = practice manager only, "attorney" = attorney only
const NAV_SECTIONS = [
  {
    section: null,
    items: [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard", roles: "manager" }],
  },
  {
    section: "Capture",
    items: [
      { id: "activityfeed", icon: Activity,      label: "Activity Feed", roles: "all"      },
      { id: "timetracker",  icon: Clock,          label: "Time Tracker",  roles: "all"      },
    ],
  },
  {
    section: "Management",
    items: [
      { id: "timeentries", icon: ClipboardList,  label: "Time Entries",  roles: "manager"  },
      { id: "matters",     icon: Briefcase,       label: "Matters",       roles: "manager"  },
    ],
  },
  {
    section: "Finance",
    items: [
      { id: "billing",     icon: FileText,        label: "Billing",       roles: "manager"  },
      { id: "reports",     icon: BarChart3,       label: "Reports",       roles: "manager"  },
    ],
  },
  {
    section: "Admin",
    items: [{ id: "attorneys", icon: Users,       label: "Attorneys",     roles: "manager"  }],
  },
];

export function Sidebar({ collapsed, onToggle, currentPage, onPageChange, role = "manager" }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "240px",
        transition: "width 0.3s ease",
        background: "#0A0F1E",
        borderRight: "1px solid rgba(141,198,63,0.15)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "12px",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "20px 0" : "20px 20px",
          borderBottom: "1px solid rgba(141,198,63,0.15)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            flexShrink: 0,
            background: "#8DC63F",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "14px",
            color: "#0A0F1E",
            letterSpacing: "-0.5px",
            fontFamily: "'Georgia', serif",
          }}
        >
          MB
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                lineHeight: 1.1,
              }}
            >
              MOTSOENENG
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#8DC63F",
                letterSpacing: "2px",
              }}
            >
              BILL
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {/* Attorney role banner */}
        {role === "attorney" && !collapsed && (
          <div style={{ margin: "4px 4px 10px", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: "6px", padding: "8px 10px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", margin: "0 0 1px", letterSpacing: "0.5px" }}>Attorney View</p>
            <p style={{ fontSize: "10px", color: "rgba(96,165,250,0.5)", margin: 0 }}>Limited access mode</p>
          </div>
        )}
        {role === "attorney" && collapsed && (
          <div style={{ margin: "4px 8px 8px", height: "3px", background: "rgba(96,165,250,0.4)", borderRadius: "2px" }} title="Attorney View" />
        )}

      {NAV_SECTIONS.map((group, gi) => {
          // Filter items based on current role
          const visibleItems = group.items.filter(
            (item) => item.roles === "all" || item.roles === role
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={gi} style={{ marginBottom: group.section ? "6px" : "2px" }}>
            {/* Section label */}
            {group.section && !collapsed && (
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "rgba(141,198,63,0.45)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  padding: "10px 12px 4px",
                  margin: 0,
                }}
              >
                {group.section}
              </p>
            )}
            {/* Collapsed divider between sections */}
            {group.section && collapsed && (
              <div
                style={{
                  height: "1px",
                  background: "rgba(141,198,63,0.1)",
                  margin: "8px 12px 6px",
                }}
              />
            )}

            {/* Nav items */}
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : "10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "12px" : "9px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    background: active
                      ? "rgba(141,198,63,0.15)"
                      : "transparent",
                    borderLeft: active
                      ? "3px solid #8DC63F"
                      : "3px solid transparent",
                    color: active ? "#8DC63F" : "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  <Icon
                    style={{ width: "16px", height: "16px", flexShrink: 0 }}
                  />
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: active ? 600 : 400,
                        letterSpacing: "0.2px",
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div
        style={{ padding: "8px", borderTop: "1px solid rgba(141,198,63,0.15)" }}
      >
        <button
          onClick={onToggle}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,0.3)",
            transition: "all 0.15s ease",
            fontSize: "12px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
          }}
        >
          {collapsed ? (
            <ChevronRight style={{ width: "16px", height: "16px" }} />
          ) : (
            <>
              <ChevronLeft style={{ width: "16px", height: "16px" }} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
