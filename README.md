# 🎓 CampusPulse - Smart Academic Suite (College Project Prototype)

A modern, responsive, client-side web application prototype built for academic project presentations, evaluations, and viva demonstrations.

---

## 🚀 Quick Start: How to Launch in Your Browser

You have multiple instant ways to launch the prototype without installing external software:

### Option 1: Full-Stack Mode (Node.js Express REST API) - Recommended
1. Double-click **`start-backend.bat`** (or open terminal in `server/` and run `npm start`).
2. It boots up the Express REST API at `http://localhost:5000` with full persistent JSON data store and automatically opens the browser.

### Option 2: Direct Double-Click (Zero-Dependency Client Prototype)
1. Double-click **`index.html`** or right-click and choose **"Open with"** -> Chrome / Edge / Brave / Firefox.
2. The application will immediately load with full interactive client simulation.

### Option 3: Team Collaboration Sync (`sync.bat`)
Before making changes or pushing, double-click **`sync.bat`** to safely pull latest commits from team members with git rebase and avoid merge conflicts.

---

## 📁 Project Architecture & File Structure

```
campuspulse/
├── index.html              # Main semantic HTML5 application shell & modals
├── css/
│   └── styles.css          # Glassmorphism, animations, ID shimmer & theme variables
├── js/
│   ├── data.js             # Client fallback mock database (courses, student, events)
│   ├── api.js              # REST API bridge with graceful offline fallback
│   ├── radar.js            # Smart Student Radar & Daily Action Plan engine
│   └── app.js              # State manager, dynamic router, Chart.js engine & toasts
├── server/                 # Node.js + Express REST API Backend
│   ├── server.js           # Express app, CORS, request logger & static server
│   ├── package.json        # Express, Cors, Dotenv dependencies
│   ├── data/
│   │   ├── db.json         # Persisted database storage
│   │   └── store.js        # File-based DB read/write helper
│   └── routes/
│       ├── student.js      # Student profile & stats endpoints
│       ├── courses.js      # Courses & syllabus endpoints
│       ├── assignments.js  # Assignment CRUD & submission endpoints
│       ├── schedule.js     # Timetable endpoints
│       ├── events.js       # Campus events & RSVP endpoints
│       └── notifications.js# Alert notifications & mark-read
├── start-backend.bat       # One-click launcher for Express REST API
├── sync.bat                # Safe team git pull & rebase helper
├── serve.bat / serve.ps1   # Zero-dependency local PowerShell web server
└── README.md               # Documentation and presentation guide
```

---

## 🛠️ Technology Stack

- **Frontend**: HTML5 Semantic Layout, Tailwind CSS (via CDN), Vanilla JavaScript (ES6+).
- **Backend**: Node.js & Express REST API with full CORS support.
- **Database**: Persistent JSON document storage (`server/data/db.json`).
- **Data Visualizations**: Chart.js for real-time GPA trends and attendance analytics.
- **Icons**: Lucide Icons vector system.
- **Deployment**: Live on GitHub Pages (`https://01bhumi28.github.io/campuspulse/`).

---

## 🎓 Talking Points for Your Viva / Presentation

1. **Full-Stack RESTful Architecture**: Integrated with a Node.js Express backend offering REST endpoints for student records, assignments, and campus events, with automatic fallback for static hosting.
2. **Persistent Document Storage**: Real assignment submissions and RSVP updates are saved to the persistent database store and survive server restarts.
3. **University Compliance Logic**: Features a dynamic safe-margin skip calculator based on the official 75% attendance threshold.
4. **Team-Ready Modular Design**: Separated API routes and sync scripts allowing multiple team members to build features simultaneously.
5. **CampusPulse Smart Student Radar**: An autonomous daily assistant that ranks tasks by deadline urgency, flags subjects at attendance risk with exact consecutive-skip mathematics, and generates conflict-free daily plans around official lectures.
