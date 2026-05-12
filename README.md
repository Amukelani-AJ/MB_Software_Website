# MB_Software_Website — Practice Intelligence Platform Frontend

The React frontend for the Practice Intelligence Platform. Built for Motsoeneng Bill Attorneys to automate time capture, manage matters and generate invoices.

---

## Tech Stack

- React 18 + Vite
- React Router v6
- Lucide React (icons)
- EmailJS (invoice email delivery)
- jsPDF (PDF invoice generation)
- PptxGenJS (presentation generation)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn
- MB_Software API running on `http://localhost:5148`

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd MB_Software_Website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The frontend will start on:

```
http://localhost:5173
```

---

## Running the Full System

Both the API and frontend must be running at the same time.

**Terminal 1 — Start the API:**
```bash
cd MB_Software
dotnet run
```

**Terminal 2 — Start the frontend:**
```bash
cd MB_Software_Website
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Views

### Attorney View
- Activity Feed — auto-captured events (documents, calls, emails, meetings, research)
- One-click assign to matter
- Narrative pre-filled, units auto-calculated
- Confirmed entries saved directly to the database via `POST /api/TimeEntry`

### Practice Manager View
- Dashboard — hours today, billable this month, active matters, pending invoices
- Monthly billing ring chart (collected vs outstanding)
- Full time entry records across all attorneys
- Matter and attorney management
- Invoice generation, PDF download and email delivery

---

## Project Structure

```
MB_Software_Website/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page-level views (Dashboard, ActivityFeed, Billing etc.)
│   ├── services/      # API call functions
│   ├── App.jsx        # Root component and routing
│   └── main.jsx       # Entry point
├── index.html
├── vite.config.js
└── package.json
```

---

## API Connection

The frontend communicates with the API at:

```
http://localhost:5148
```

Make sure the API is running before starting the frontend, otherwise data will not load.

---

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## Notes

- The Activity Feed uses simulated capture data for the prototype — in production this would be powered by Microsoft Graph API monitoring each attorney's workstation
- JWT authentication and role-based access control are planned for the production version
- Invoice emails are sent via EmailJS — configure your EmailJS service ID, template ID and public key in the relevant component

---

## Author

**Amukelani Ndlovu**  
Software Engineer Assessment — Motsoeneng Bill Attorneys  
Submitted: 7 May 2026
