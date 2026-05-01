import "./App.css";
import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ActivityFeed } from "./pages/ActivityFeed";
import { TimeTracker } from "./pages/TimeTracker";
import { TimeEntries } from "./pages/TimeEntries";
import { Matters } from "./pages/Matters";
import { Billing } from "./pages/Billing";
import { Report } from "./pages/Reports";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Map URL path → currentPage id
  const pageMap = {
    "/": "dashboard",
    "/activityfeed": "activityfeed",
    "/timetracker": "timetracker",
    "/timeentries": "timeentries",
    "/matters": "matters",
    "/billing": "billing",
    "/report": "reports",
  };

  const currentPage = pageMap[location.pathname] || "dashboard";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080D1A" }}>
      
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPage={currentPage}
        onPageChange={(id) => {
          const reverseMap = {
            dashboard: "/",
            activityfeed: "/activityfeed",
            timetracker: "/timetracker",
            timeentries: "/timeentries",
            matters: "/matters",
            billing: "/billing",
            reports: "/report",
          };
          window.location.href = reverseMap[id] || "/";
        }}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Header */}
        <Header
          onToggleSidebar={() => setCollapsed(!collapsed)}
          currentPage={currentPage}
        />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#080D1A" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activityfeed" element={<ActivityFeed />} />
            <Route path="/timetracker" element={<TimeTracker />} />
            <Route path="/timeentries" element={<TimeEntries />} />
            <Route path="/matters" element={<Matters />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}

export default App;