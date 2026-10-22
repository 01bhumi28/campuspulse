# 🎓 CampusPulse - Smart Academic Suite (College Project Prototype)

A modern, responsive, client-side web application prototype built for academic project presentations, evaluations, and viva demonstrations.

---

## 🚀 Quick Start: How to Launch in Your Browser

You have multiple instant ways to launch the prototype without installing external software:

### Option 1: Direct Double-Click (Easiest & Fastest)
1. Navigate to the project folder (`d:\ANTIGRAVITY\`).
2. Simply double-click **`index.html`** or right-click and choose **"Open with"** -> **Google Chrome / Microsoft Edge / Brave / Firefox**.
3. The application will immediately load and be completely interactive.

### Option 2: One-Click Local Server (`serve.bat`)
1. Double-click the included **`serve.bat`** file in the project folder.
2. It automatically launches a local HTTP web server at `http://localhost:8000` using Windows PowerShell's built-in networking (zero external dependencies required) and automatically opens your browser!

### Option 3: PowerShell Command
Open PowerShell inside the folder and run:
```powershell
Start-Process "index.html"
```
Or to run with the built-in HTTP server:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

---

## ✨ Key Features & Demo Checklist (For Project Evaluators / Viva)

| Feature | Description | How to Test in Demo |
| :--- | :--- | :--- |
| 📊 **Command Center Dashboard** | Overview of GPA, attendance rate, degree credits, and upcoming assignments with Chart.js visualization. | Click **Dashboard** in the sidebar. Hover over the GPA chart. |
| 📚 **Course Hub & Syllabus** | Enrolled subjects with credit count, professor details, and progress bars. | Click **Course Hub**, filter by *Core* / *AI Specialization*, and click **"Syllabus"**. |
| 📋 **Interactive Kanban Board** | 4-stage assignment tracker (Pending, In Progress, Submitted, Graded). | Click **Assignments**, then click **"Submit Work"** or **"Submit"** on any task to test simulated file upload. |
| 📅 **Weekly Timetable** | Day-by-day class schedule with room allocations and lecture type tags. | Click **Lecture Timetable**, switch days between Monday through Friday. |
| 🧮 **Attendance & Skip Calculator** | Subject-wise breakdown plus an interactive calculator that computes exactly how many classes you can afford to skip while staying $\ge 75\%$. | Click **Attendance & Analytics**, adjust the numbers in the calculator to see dynamic calculations. |
| 🎪 **Campus Life & Event RSVP** | Tech hackathons, guest lectures, and career expos with real-time attendee increment and celebratory toasts. | Click **Campus Life**, click **"Register & RSVP Now"** on HackNova or DeepMind Tech Talk. |
| 🪪 **Digital Holographic ID Card** | Official university student identity badge with holographic sheen, barcode, QR code, and print capability. | Click **Student ID & Profile**, then click **"Display ID Hologram"** or use the **"Print Card"** button. |
| 🔍 **Global Spotlight Search** | Fast search across courses, assignments, and campus events. | Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd>) or type in the top search bar. |
| 🎨 **Theme & Accent Customizer** | Instant Dark/Light mode toggle + dynamic color palette selector (Indigo, Emerald, Violet, Rose, Amber, Cyan). | Click the **Moon / Sun icon** in the topbar or navigate to **Prototype Settings**. |
| 🔔 **Notification Center** | Dropdown alert tray with live unread counter, badge animations, and toast notifications on all interactions. | Click the **Bell icon** in the top header. |

---

## 📁 Project Architecture & File Structure

```
d:\ANTIGRAVITY\
├── index.html          # Main semantic HTML5 application shell & modals
├── css/
│   └── styles.css      # Custom animations, glassmorphism, ID shimmer & theme variables
├── js/
│   ├── data.js         # Realistic college mock database (student, courses, events, grades)
│   └── app.js          # Reactive state manager, dynamic router, Chart.js engine & toasts
├── serve.ps1           # Built-in zero-dependency Windows HTTP web server script
├── serve.bat           # One-click Windows batch launcher
└── README.md           # Documentation and presentation guide
```

---

## 🛠️ Technology Stack

- **HTML5 & Semantic Markup**: Accessible container layouts, semantic tags.
- **Tailwind CSS (via CDN)**: Modern styling, flex/grid layouts, responsive breakpoints.
- **Vanilla JavaScript (ES6+)**: Zero build step needed, instant client-side execution.
- **Chart.js**: Dynamic, interactive canvas-based performance tracking and donut charts.
- **Lucide Icons**: Crisp vector UI icons.
- **Local Storage API**: Persists dark/light mode preference, custom accent colors, and quick notes.

---

## 🎓 Talking Points for Your Viva / Presentation

1. **Client-Side Reactive Architecture**: The application maintains a unified state object (`AppState`), which ensures that submitting an assignment or changing an RSVP immediately re-evaluates statistics across the dashboard without reloading the page.
2. **Real-World University Compliance**: Designed around actual college regulations, such as the mandatory 75% attendance threshold with automated warnings and a safe-margin skip calculator.
3. **Responsive Mobile-First Design**: Adapts cleanly from smartphone screens (collapsible navigation drawer) up to wide 4K displays.
4. **Extensible Data Schema**: The structure in `js/data.js` mimics standard RESTful API JSON responses, making it straightforward to connect to a backend like Node.js/Express, Django, or Firebase in future project phases.
