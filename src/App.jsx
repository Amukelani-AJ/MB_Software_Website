import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ActivityFeed } from "./pages/ActivityFeed";
import { TimeTracker } from "./pages/TimeTracker";
import { TimeEntries } from "./pages/TimeEntries";
import { Matters } from "./pages/Matters";
import { Billing } from "./pages/Billing";
import { Report } from "./pages/Reports";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/activityfeed" element={<ActivityFeed/>} />
        <Route path="/timetracker" element={<TimeTracker/>} />
        <Route path="/timeentries" element={<TimeEntries/>} />
        <Route path="/matters" element={<Matters/>} />
        <Route path="/billing" element={<Billing/>} />
        <Route path="/report" element={<Report/>} />
      </Routes>
    </>
  );
}

export default App;
