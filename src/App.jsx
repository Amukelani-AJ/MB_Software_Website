import "./App.css";
import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ActivityFeed } from "./pages/ActivityFeed";
import { TimeTracker } from "./pages/TimeTracker";
import { TimeEntries } from "./pages/TimeEntries";
import { Matters } from "./pages/Matters";
import { Billing } from "./pages/Billing";
import { Reports } from "./pages/Reports";
import { Attorneys } from "./pages/Attorneys";

// Map route path → sidebar page id
const PATH_TO_PAGE = {
  "/":             "dashboard",
  "/activityfeed": "activityfeed",
  "/timetracker":  "timetracker",
  "/timeentries":  "timeentries",
  "/matters":      "matters",
  "/billing":      "billing",
  "/reports":      "reports",
  "/attorneys":    "attorneys",
};

// Map sidebar page id → route path
const PAGE_TO_PATH = {
  dashboard:    "/",
  activityfeed: "/activityfeed",
  timetracker:  "/timetracker",
  timeentries:  "/timeentries",
  matters:      "/matters",
  billing:      "/billing",
  reports:      "/reports",
  attorneys:    "/attorneys",
};

// Pages accessible to attorney role only
const ATTORNEY_PAGES = ["activityfeed", "timetracker"];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole]           = useState("manager"); // "manager" | "attorney"
  const location  = useLocation();
  const navigate  = useNavigate();

  const currentPage = PATH_TO_PAGE[location.pathname] || "dashboard";

  const handlePageChange = (pageId) => {
    // If attorney role tries to access a manager-only page, redirect to activity feed
    if (role === "attorney" && !ATTORNEY_PAGES.includes(pageId)) return;
    const path = PAGE_TO_PATH[pageId];
    if (path) navigate(path);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // When switching to attorney, redirect to activity feed if on a manager-only page
    if (newRole === "attorney" && !ATTORNEY_PAGES.includes(currentPage)) {
      navigate("/activityfeed");
    }
    // When switching back to manager, go to dashboard
    if (newRole === "manager") {
      navigate("/");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080D1A" }}>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        role={role}
      />

      {/* Main content column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <Header
          onToggleSidebar={() => setCollapsed((c) => !c)}
          currentPage={currentPage}
          onRoleChange={handleRoleChange}
        />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#080D1A" }}>
          <Routes>
            <Route path="/"             element={<Dashboard role={role} />} />
            <Route path="/activityfeed" element={<ActivityFeed />} />
            <Route path="/timetracker"  element={<TimeTracker />} />
            <Route path="/timeentries"  element={<TimeEntries />} />
            <Route path="/matters"      element={<Matters />} />
            <Route path="/billing"      element={<Billing />} />
            <Route path="/reports"      element={<Reports />} />
            <Route path="/attorneys"    element={<Attorneys />} />

            {/* 404 fallback */}
            <Route path="*" element={
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "'Inter', sans-serif", color: "#fff", gap: "12px" }}>
                <p style={{ fontSize: "64px", fontWeight: 800, color: "rgba(141,198,63,0.2)", margin: 0 }}>404</p>
                <p style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Page not found</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>The page you're looking for doesn't exist.</p>
                <button
                  onClick={() => navigate("/")}
                  style={{ marginTop: "8px", fontSize: "13px", fontWeight: 700, color: "#0A0F1E", background: "#8DC63F", border: "none", borderRadius: "7px", padding: "10px 20px", cursor: "pointer" }}
                >
                  Go to Dashboard
                </button>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
