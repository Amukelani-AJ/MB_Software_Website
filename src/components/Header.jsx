import { useState, useEffect } from "react";
import { Menu, Bell, Settings, ChevronDown } from "lucide-react";

const PAGE_META = {
  dashboard: { title: "Dashboard", sub: "Overview of your practice" },
  timetracker: {
    title: "Time Tracker",
    sub: "Capture billable time in real-time",
  },
  timeentries: { title: "Time Entries", sub: "Review and manage time logs" },
  matters: { title: "Matters", sub: "Client matter management" },
  billing: { title: "Billing", sub: "Invoices and billing outputs" },
  reports: { title: "Reports", sub: "Productivity and billing analytics" },
  attorneys: { title: "Attorneys", sub: "Attorney profiles and settings" },
  activityfeed: { title: "Activity Feed", sub: "Auto-captured activity log" },
};

export function Header({ onToggleSidebar, currentPage = "dashboard" }) {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenu] = useState(false);

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = time.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      style={{
        position: "relative",
        background: "#0D1226",
        borderBottom: "1px solid rgba(141,198,63,0.2)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Green top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, #8DC63F 0%, #6aaa1f 50%, transparent 100%)",
        }}
      />

      {/* ── Left ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(141,198,63,0.1)";
            e.currentTarget.style.color = "#8DC63F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <Menu style={{ width: "20px", height: "20px" }} />
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "32px",
            background: "rgba(141,198,63,0.2)",
          }}
        />

        {/* Page title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.3px",
                margin: 0,
              }}
            >
              {meta.title}
            </h1>
            {/* Green live pill */}
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#8DC63F",
                background: "rgba(141,198,63,0.12)",
                border: "1px solid rgba(141,198,63,0.3)",
                padding: "2px 8px",
                borderRadius: "20px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Live
            </span>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              margin: 0,
              marginTop: "1px",
            }}
          >
            {meta.sub}
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Clock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginRight: "8px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#8DC63F",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formattedTime}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {formattedDate}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "32px",
            background: "rgba(141,198,63,0.2)",
            margin: "0 4px",
          }}
        />

        {/* Notifications */}
        <button
          style={{
            position: "relative",
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(141,198,63,0.1)";
            e.currentTarget.style.color = "#8DC63F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <Bell style={{ width: "18px", height: "18px" }} />
          {/* Notification dot */}
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "7px",
              height: "7px",
              background: "#8DC63F",
              borderRadius: "50%",
              border: "2px solid #0D1226",
            }}
          />
        </button>

        {/* Settings */}
        <button
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(141,198,63,0.1)";
            e.currentTarget.style.color = "#8DC63F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <Settings style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "32px",
            background: "rgba(141,198,63,0.2)",
            margin: "0 4px",
          }}
        />

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenu(!menuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 10px 6px 6px",
              borderRadius: "8px",
              border: "none",
              background: menuOpen ? "rgba(141,198,63,0.1)" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(141,198,63,0.1)";
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#8DC63F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#0A0F1E",
                  fontFamily: "'Georgia', serif",
                }}
              >
                A
              </div>
              {/* Online dot */}
              <span
                style={{
                  position: "absolute",
                  bottom: "1px",
                  right: "1px",
                  width: "8px",
                  height: "8px",
                  background: "#8DC63F",
                  borderRadius: "50%",
                  border: "2px solid #0D1226",
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Amukelani
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(141,198,63,0.7)",
                  margin: 0,
                  letterSpacing: "0.5px",
                }}
              >
                Administrator
              </p>
            </div>

            <ChevronDown
              style={{
                width: "14px",
                height: "14px",
                color: "rgba(255,255,255,0.3)",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "200px",
                background: "#0D1226",
                border: "1px solid rgba(141,198,63,0.2)",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                zIndex: 50,
              }}
            >
              {/* Profile header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(141,198,63,0.15)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    margin: 0,
                  }}
                >
                  Amukelani
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(141,198,63,0.6)",
                    margin: "2px 0 0",
                  }}
                >
                  admin@mb.co.za
                </p>
              </div>

              {[
                { label: "Profile", icon: "👤" },
                { label: "Settings", icon: "⚙️" },
                { label: "Sign out", icon: "🚪" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setMenu(false)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(141,198,63,0.08)";
                    e.currentTarget.style.color = "#8DC63F";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
