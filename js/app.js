/**
 * NexusAcademic - College Prototype Application Core
 * Interactive State, Router, View Renderers & Dynamic Handlers
 */

// Global App State
const AppState = {
    data: JSON.parse(JSON.stringify(initialData)),
    currentView: 'dashboard',
    theme: localStorage.getItem('nexus_theme') || 'dark',
    accentColor: localStorage.getItem('nexus_accent') || 'indigo',
    notes: localStorage.getItem('nexus_notes') || '• Finish Cloud Computing Raft protocol report by 10 PM.\n• Review Transformers attention heads formula for CS304 test.\n• Meet Dr. Jenkins regarding Capstone proposal on Thursday.',
    attendanceCalc: {
        attended: 92,
        total: 100,
        target: 75
    },
    filterCourses: 'all',
    filterAssignments: 'all',
    selectedScheduleDay: 'Monday',
    charts: {}
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initAccent();
    initEventListeners();
    initLucide();
    renderCurrentView();
    updateNotificationBadge();

    // Auto-detect and sync with Node.js Express REST API
    if (window.CampusPulseAPI) {
        const isConnected = await window.CampusPulseAPI.checkConnection();
        if (isConnected) {
            const remoteData = await window.CampusPulseAPI.fetchInitialData();
            if (remoteData) {
                AppState.data = remoteData;
                renderCurrentView();
                updateNotificationBadge();
                showToast('API Connected', 'Live academic database synchronized via Node.js Express backend.', 'success');
            }
        }
    }
});

// Re-run Lucide icon replacement whenever DOM updates
function initLucide() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/* ==========================================================================
   Theme & Styling Engine
   ========================================================================== */
function initTheme() {
    const html = document.documentElement;
    if (AppState.theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    updateThemeToggleIcons();
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nexus_theme', AppState.theme);
    initTheme();
    // Re-render charts with updated theme colors if on analytics
    if (AppState.currentView === 'attendance' || AppState.currentView === 'dashboard') {
        renderCharts();
    }
    showToast('Theme Updated', `Switched to ${AppState.theme} mode`, 'info');
}

function updateThemeToggleIcons() {
    const isDark = AppState.theme === 'dark';
    const darkIcons = document.querySelectorAll('.theme-dark-icon');
    const lightIcons = document.querySelectorAll('.theme-light-icon');
    darkIcons.forEach(el => el.classList.toggle('hidden', isDark));
    lightIcons.forEach(el => el.classList.toggle('hidden', !isDark));
}

function initAccent() {
    document.documentElement.setAttribute('data-theme-color', AppState.accentColor);
    const colorPickers = document.querySelectorAll('.accent-picker-btn');
    colorPickers.forEach(btn => {
        const color = btn.dataset.color;
        if (color === AppState.accentColor) {
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
        } else {
            btn.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500');
        }
    });
}

function setAccentColor(color) {
    AppState.accentColor = color;
    localStorage.setItem('nexus_accent', color);
    initAccent();
    showToast('Accent Updated', `Theme palette set to ${color.toUpperCase()}`, 'success');
}

/* ==========================================================================
   Navigation & Routing
   ========================================================================== */
function navigateTo(viewName) {
    AppState.currentView = viewName;
    
    // Update active state in desktop and mobile sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.view === viewName) {
            link.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
            link.classList.remove('text-gray-600', 'hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-800/60');
        } else {
            link.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/20');
            link.classList.add('text-gray-600', 'hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-800/60');
        }
    });

    // Update Header Breadcrumb Title
    const titleMap = {
        'dashboard': 'Student Command Center',
        'courses': 'Enrolled Courses & Academic Curriculum',
        'assignments': 'Assignments & Project Trackers',
        'schedule': 'Weekly Lecture Timetable',
        'attendance': 'Attendance & Academic Analytics',
        'events': 'Campus Hub & University Life',
        'profile': 'Student Identity & Credentials',
        'settings': 'Prototype Customizer & Environment'
    };
    
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = titleMap[viewName] || 'Overview';

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Render content
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    
    if (isOpen) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar && overlay) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

/* ==========================================================================
   Main View Switcher
   ========================================================================== */
function renderCurrentView() {
    const container = document.getElementById('mainContentArea');
    if (!container) return;

    switch (AppState.currentView) {
        case 'dashboard':
            container.innerHTML = getDashboardViewHTML();
            initDashboardComponents();
            break;
        case 'courses':
            container.innerHTML = getCoursesViewHTML();
            break;
        case 'assignments':
            container.innerHTML = getAssignmentsViewHTML();
            break;
        case 'schedule':
            container.innerHTML = getScheduleViewHTML();
            break;
        case 'attendance':
            container.innerHTML = getAttendanceViewHTML();
            initAttendanceCharts();
            initAttendanceCalculator();
            break;
        case 'events':
            container.innerHTML = getEventsViewHTML();
            break;
        case 'profile':
            container.innerHTML = getProfileViewHTML();
            break;
        case 'settings':
            container.innerHTML = getSettingsViewHTML();
            break;
        default:
            container.innerHTML = `<div class="p-8 text-center text-gray-500">View under development</div>`;
    }

    initLucide();
}

/* ==========================================================================
   VIEW 1: Dashboard View HTML
   ========================================================================== */
function getDashboardViewHTML() {
    const { student, stats, courses, assignments, announcements } = AppState.data;
    
    // Calculate pending assignments count dynamically
    const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length;
    stats.find(s => s.id === 'assignments').value = `${pendingCount} Pending`;

    return `
    <div class="space-y-6">
        <!-- Welcome Hero Banner -->
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 md:p-8 shadow-xl shadow-indigo-500/10">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-indigo-100 mb-3">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        ${student.semester} • Academic Year 2026-27
                    </div>
                    <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">
                        Welcome back, ${student.name.split(' ')[0]}! 👋
                    </h1>
                    <p class="text-indigo-100/90 text-sm md:text-base mt-1 max-w-xl">
                        You have <strong class="underline decoration-amber-400 text-white font-bold">${pendingCount} active assignments</strong> this week and your overall attendance is <strong class="text-emerald-300 font-bold">${student.attendanceRate}%</strong>.
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <button onclick="openModal('quickSubmitModal')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm transition-all shadow-md active:scale-95">
                        <i data-lucide="upload-cloud" class="w-4 h-4"></i>
                        <span>Submit Work</span>
                    </button>
                    <button onclick="navigateTo('schedule')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-semibold text-sm transition-all border border-white/20 active:scale-95">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        <span>Today's Classes</span>
                    </button>
                    <button onclick="openModal('idCardModal')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 text-white backdrop-blur-md font-semibold text-sm transition-all border border-white/10 active:scale-95" title="View Digital ID">
                        <i data-lucide="id-card" class="w-4 h-4"></i>
                        <span>Digital ID</span>
                    </button>
                </div>
            </div>

            <!-- Background subtle ornament -->
            <div class="absolute -right-12 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute right-40 -top-20 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <!-- 4 KPI Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            ${stats.map(stat => `
                <div class="glass-panel rounded-2xl p-5 card-hover">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">${stat.label}</span>
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white shadow-md">
                            <i data-lucide="${stat.icon}" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="mt-3">
                        <div class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">${stat.value}</div>
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                            <span class="text-gray-500 dark:text-gray-400">${stat.sub}</span>
                            <span class="font-medium ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} flex items-center gap-1">
                                <i data-lucide="${stat.trendUp ? 'trending-up' : 'clock'}" class="w-3.5 h-3.5"></i>
                                ${stat.trend}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Main Dashboard Split Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left 2 Cols: Performance Chart & Active Courses -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Academic Performance Chart Card -->
                <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 class="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="line-chart" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                                GPA Progression & Credit Milestones
                            </h2>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Semester-wise SGPA and Cumulative CGPA trend</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                                <span class="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span> SGPA
                            </span>
                            <span class="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> CGPA
                            </span>
                        </div>
                    </div>
                    <div class="h-64 w-full">
                        <canvas id="dashboardGpaChart"></canvas>
                    </div>
                </div>

                <!-- Active Course Cards Summary -->
                <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <i data-lucide="book-open" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                                Enrolled Courses (${courses.length})
                            </h2>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quick glance at current curriculum status</p>
                        </div>
                        <button onclick="navigateTo('courses')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 group">
                            <span>View All</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${courses.slice(0, 4).map(course => `
                            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 transition-all group">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                                            ${course.code}
                                        </span>
                                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                            ${course.title}
                                        </h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${course.instructor}</p>
                                    </div>
                                    <span class="text-xs font-bold px-2 py-0.5 rounded-full ${course.attendance.percent >= 85 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'}">
                                        ${course.attendance.percent}% Attn
                                    </span>
                                </div>

                                <div class="mt-3">
                                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>Course Syllabus Progress</span>
                                        <span class="font-semibold text-gray-700 dark:text-gray-300">${course.progress}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${course.progress}%"></div>
                                    </div>
                                </div>

                                <div class="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                                        Next: ${course.nextClass}
                                    </span>
                                    <button onclick="viewCourseDetails('${course.id}')" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                                        Details
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Right 1 Col: Urgent Tasks, Quick Scratchpad & Announcements -->
            <div class="space-y-6">
                <!-- Priority Assignments -->
                <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="alert-circle" class="w-5 h-5 text-amber-500"></i>
                            Priority Tasks
                        </h2>
                        <button onclick="navigateTo('assignments')" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            All (${assignments.length})
                        </button>
                    </div>

                    <div class="space-y-3">
                        ${assignments.filter(a => a.status !== 'graded').slice(0, 3).map(asg => `
                            <div class="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                                <div class="flex items-start justify-between gap-2">
                                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">${asg.courseCode}</span>
                                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                        asg.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' :
                                        asg.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                    }">
                                        ${asg.priority.toUpperCase()}
                                    </span>
                                </div>
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mt-1 line-clamp-1">${asg.title}</h3>
                                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                        <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                                        ${asg.dueDate}
                                    </span>
                                    <button onclick="openSubmitModal('${asg.id}')" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                        ${asg.status === 'submitted' ? 'Resubmit' : 'Submit Now'}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Live Campus Notice Board -->
                <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="megaphone" class="w-5 h-5 text-purple-600 dark:text-purple-400"></i>
                            Campus Notices
                        </h2>
                        <span class="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 px-2 py-0.5 rounded font-medium">Live</span>
                    </div>

                    <div class="divide-y divide-gray-100 dark:divide-gray-800">
                        ${announcements.map(ann => `
                            <div class="py-3 first:pt-0 last:pb-0">
                                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-medium text-gray-700 dark:text-gray-300">${ann.department}</span>
                                    <span>${ann.date}</span>
                                </div>
                                <h4 class="text-xs font-bold text-gray-900 dark:text-white mt-1 hover:text-indigo-600 cursor-pointer" onclick="showAnnouncementModal('${ann.id}')">
                                    ${ann.title}
                                </h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${ann.excerpt}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Personal Quick Scratchpad -->
                <div class="glass-panel rounded-2xl p-5 card-hover">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <i data-lucide="edit-3" class="w-4 h-4 text-emerald-500"></i>
                            Student Scratchpad
                        </h2>
                        <span id="scratchpadSaveStatus" class="text-[11px] text-gray-400">Auto-saved</span>
                    </div>
                    <textarea 
                        id="scratchpadInput"
                        oninput="saveScratchpad(this.value)"
                        class="w-full h-28 text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none leading-relaxed font-mono"
                        placeholder="Jot down quick reminders, equations, or meeting notes here..."
                    >${AppState.notes}</textarea>
                </div>
            </div>
        </div>
    </div>
    `;
}

function initDashboardComponents() {
    renderGpaChart();
}

function saveScratchpad(text) {
    AppState.notes = text;
    localStorage.setItem('nexus_notes', text);
    const status = document.getElementById('scratchpadSaveStatus');
    if (status) {
        status.textContent = 'Saving...';
        setTimeout(() => {
            if (status) status.textContent = 'Saved in browser';
        }, 300);
    }
}

/* ==========================================================================
   VIEW 2: Enrolled Courses View HTML
   ========================================================================== */
function getCoursesViewHTML() {
    const { courses } = AppState.data;
    const filter = AppState.filterCourses;
    
    const filteredCourses = courses.filter(c => {
        if (filter === 'all') return true;
        if (filter === 'core') return c.department.includes('Core');
        if (filter === 'spec') return c.department.includes('Specialization');
        if (filter === 'math') return c.department.includes('Math');
        return true;
    });

    return `
    <div class="space-y-6">
        <!-- Courses Header & Controls -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Curriculum & Course Hub</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Explore syllabus modules, lecture material archives, and attendance stats.</p>
                </div>

                <!-- Filter Pills -->
                <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl overflow-x-auto text-xs font-semibold">
                    <button onclick="setCourseFilter('all')" class="px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}">All (${courses.length})</button>
                    <button onclick="setCourseFilter('core')" class="px-3 py-1.5 rounded-lg transition-all ${filter === 'core' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}">Core Subjects</button>
                    <button onclick="setCourseFilter('spec')" class="px-3 py-1.5 rounded-lg transition-all ${filter === 'spec' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}">AI Specialization</button>
                    <button onclick="setCourseFilter('math')" class="px-3 py-1.5 rounded-lg transition-all ${filter === 'math' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}">Applied Math</button>
                </div>
            </div>
        </div>

        <!-- Course Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredCourses.map(course => `
                <div class="glass-panel rounded-2xl overflow-hidden card-hover flex flex-col justify-between">
                    <div>
                        <!-- Header Banner -->
                        <div class="p-5 border-b border-gray-100 dark:border-gray-800 relative bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/20">
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <span class="px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
                                    ${course.code}
                                </span>
                                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${course.attendance.percent >= 85 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
                                    Grade ${course.currentGrade} • ${course.attendance.percent}% Attn
                                </span>
                            </div>
                            <h3 class="text-base font-bold text-gray-900 dark:text-white leading-snug">${course.title}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                                <i data-lucide="user" class="w-3.5 h-3.5 text-indigo-500"></i>
                                ${course.instructor}
                            </p>
                        </div>

                        <!-- Body Stats & Syllabus -->
                        <div class="p-5 space-y-4">
                            <div class="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div>
                                    <span class="text-gray-400 block text-[10px] uppercase font-bold">Credits</span>
                                    <span class="font-bold text-gray-800 dark:text-gray-200">${course.credits} Academic Credits</span>
                                </div>
                                <div>
                                    <span class="text-gray-400 block text-[10px] uppercase font-bold">Lecture Hall</span>
                                    <span class="font-bold text-gray-800 dark:text-gray-200">${course.room}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400 block text-[10px] uppercase font-bold">Weekly Schedule</span>
                                    <span class="font-bold text-gray-800 dark:text-gray-200">${course.days.join(', ')}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400 block text-[10px] uppercase font-bold">Timing</span>
                                    <span class="font-bold text-gray-800 dark:text-gray-200">${course.time}</span>
                                </div>
                            </div>

                            <!-- Course Modules Preview -->
                            <div>
                                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">Key Modules:</span>
                                <ul class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    ${course.syllabus.slice(0, 3).map(mod => `
                                        <li class="flex items-start gap-2">
                                            <i data-lucide="check-circle" class="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0"></i>
                                            <span class="line-clamp-1">${mod}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Action Buttons -->
                    <div class="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 mt-2">
                        <button onclick="downloadCourseNotes('${course.code}')" class="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-1.5">
                            <i data-lucide="download" class="w-3.5 h-3.5"></i>
                            <span>Notes (${course.materialsCount})</span>
                        </button>
                        <button onclick="viewCourseDetails('${course.id}')" class="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20">
                            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                            <span>Syllabus</span>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function setCourseFilter(filter) {
    AppState.filterCourses = filter;
    renderCurrentView();
}

function downloadCourseNotes(courseCode) {
    showToast('Download Triggered', `Downloading archived lecture slides for ${courseCode} (.zip)`, 'info');
}

/* ==========================================================================
   VIEW 3: Assignments & Kanban View HTML
   ========================================================================== */
function getAssignmentsViewHTML() {
    const { assignments } = AppState.data;

    const columns = [
        { id: 'pending', title: 'Pending Review', color: 'border-amber-500', badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
        { id: 'in-progress', title: 'In Progress', color: 'border-blue-500', badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
        { id: 'submitted', title: 'Submitted & Under TA Review', color: 'border-purple-500', badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
        { id: 'graded', title: 'Graded & Evaluated', color: 'border-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' }
    ];

    return `
    <div class="space-y-6">
        <!-- Assignments Header -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Assignments & Project Milestones</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Interactive Kanban workflow. Submit deliverables, test uploads, and inspect instructor rubrics.</p>
                </div>
                <button onclick="openModal('quickSubmitModal')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i>
                    <span>New Assignment Submission</span>
                </button>
            </div>
        </div>

        <!-- Kanban Board Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            ${columns.map(col => {
                const colTasks = assignments.filter(a => a.status === col.id);
                return `
                <div class="flex flex-col rounded-2xl bg-gray-100/70 dark:bg-gray-800/40 p-4 border border-gray-200/80 dark:border-gray-800">
                    <div class="flex items-center justify-between mb-3 pb-2 border-b-2 ${col.color}">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">${col.title}</h3>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}">
                            ${colTasks.length}
                        </span>
                    </div>

                    <div class="space-y-3 flex-1">
                        ${colTasks.length === 0 ? `
                            <div class="h-32 flex flex-col items-center justify-center text-center text-gray-400 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <i data-lucide="inbox" class="w-6 h-6 mb-1 opacity-50"></i>
                                <span>No items here</span>
                            </div>
                        ` : colTasks.map(task => `
                            <div class="glass-panel p-4 rounded-xl border border-gray-200 dark:border-gray-700 card-hover">
                                <div class="flex items-center justify-between text-xs mb-1.5">
                                    <span class="font-extrabold text-indigo-600 dark:text-indigo-400">${task.courseCode}</span>
                                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                        task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }">
                                        ${task.priority}
                                    </span>
                                </div>
                                <h4 class="text-xs font-bold text-gray-900 dark:text-white leading-tight mb-2">${task.title}</h4>
                                <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">${task.description}</p>

                                ${task.marksReceived !== null ? `
                                    <div class="mb-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                                        <div class="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                                            <span>Score Awarded:</span>
                                            <span>${task.marksReceived} / ${task.maxMarks}</span>
                                        </div>
                                        ${task.feedback ? `<p class="text-[10px] text-emerald-800 dark:text-emerald-400 mt-1 italic">"${task.feedback}"</p>` : ''}
                                    </div>
                                ` : ''}

                                <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                                    <span class="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                                        <i data-lucide="clock" class="w-3 h-3"></i>
                                        ${task.dueDate}
                                    </span>
                                    ${task.status !== 'graded' ? `
                                        <button onclick="openSubmitModal('${task.id}')" class="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            ${task.status === 'submitted' ? 'Resubmit' : 'Submit'}
                                        </button>
                                    ` : `
                                        <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                            <i data-lucide="check" class="w-3 h-3"></i> Final
                                        </span>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>
    `;
}

/* ==========================================================================
   VIEW 4: Weekly Schedule & Timetable View HTML
   ========================================================================== */
function getScheduleViewHTML() {
    const { schedule } = AppState.data;
    const selectedDay = AppState.selectedScheduleDay;
    const activeDaySchedule = schedule.find(s => s.day === selectedDay) || schedule[0];

    return `
    <div class="space-y-6">
        <!-- Schedule Header -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Lecture Timetable & Lab Slots</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time room allocations, lecture timings, and research group meetings.</p>
                </div>

                <!-- Day Selector Tabs -->
                <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto text-xs font-semibold">
                    ${schedule.map(d => `
                        <button onclick="selectScheduleDay('${d.day}')" class="px-3.5 py-2 rounded-lg transition-all ${d.day === selectedDay ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}">
                            ${d.day}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Timeline Schedule Grid -->
        <div class="glass-panel rounded-2xl p-6 card-hover">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div class="flex items-center gap-2">
                    <i data-lucide="calendar" class="w-5 h-5 text-indigo-600"></i>
                    <h2 class="text-base font-bold text-gray-900 dark:text-white">${selectedDay}'s Class Itinerary</h2>
                </div>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">${activeDaySchedule.items.length} sessions scheduled</span>
            </div>

            <div class="relative pl-6 md:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 md:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-950">
                ${activeDaySchedule.items.map((item, idx) => `
                    <div class="relative group">
                        <!-- Timeline Dot -->
                        <div class="absolute -left-6 md:-left-8 top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 bg-indigo-600 shadow-sm"></div>

                        <div class="p-4 md:p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                        ${item.code}
                                    </span>
                                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'Lab' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}">
                                        ${item.type}
                                    </span>
                                </div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white">${item.title}</h3>
                                <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                                        ${item.time}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-gray-400"></i>
                                        ${item.room}
                                    </span>
                                </div>
                            </div>

                            <div class="flex items-center gap-2">
                                <button onclick="showToast('Class Reminder Set', 'You will receive a notification 15 mins before ${item.code}', 'info')" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1">
                                    <i data-lucide="bell" class="w-3.5 h-3.5"></i>
                                    <span>Remind</span>
                                </button>
                                <button onclick="showToast('Room Route', 'Navigate to ${item.room}: Take West Wing Elevators to Floor 3', 'info')" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center gap-1">
                                    <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
                                    <span>Find Room</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;
}

function selectScheduleDay(day) {
    AppState.selectedScheduleDay = day;
    renderCurrentView();
}

/* ==========================================================================
   VIEW 5: Attendance & Analytics View HTML
   ========================================================================== */
function getAttendanceViewHTML() {
    const { student, courses } = AppState.data;

    return `
    <div class="space-y-6">
        <!-- Attendance Header -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Attendance & Eligibility Analytics</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Official University threshold requires <strong class="text-amber-500">75% minimum attendance</strong> to qualify for end-semester exams.</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs md:text-sm">
                        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-500"></i>
                        Status: Exam Eligible
                    </span>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Donut Chart -->
            <div class="glass-panel rounded-2xl p-6 card-hover">
                <h2 class="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-5 h-5 text-indigo-600"></i>
                    Session Breakdown
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Total 118 lectures across all courses</p>
                <div class="h-60 relative flex items-center justify-center">
                    <canvas id="attendanceDonutChart"></canvas>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        <span class="font-bold text-emerald-600 block text-base">91.2%</span>
                        <span class="text-gray-400 text-[11px]">Present</span>
                    </div>
                    <div>
                        <span class="font-bold text-amber-500 block text-base">5.0%</span>
                        <span class="text-gray-400 text-[11px]">Late</span>
                    </div>
                    <div>
                        <span class="font-bold text-rose-500 block text-base">3.8%</span>
                        <span class="text-gray-400 text-[11px]">Absent</span>
                    </div>
                </div>
            </div>

            <!-- Middle/Right Study Hours Bar Chart -->
            <div class="lg:col-span-2 glass-panel rounded-2xl p-6 card-hover">
                <div class="flex items-center justify-between mb-1">
                    <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i data-lucide="bar-chart-2" class="w-5 h-5 text-indigo-600"></i>
                        Weekly Study & Lab Hours
                    </h2>
                    <span class="text-xs text-gray-500">Target: 40 hrs/week</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Tracked library, lab, and private study sessions</p>
                <div class="h-60">
                    <canvas id="weeklyStudyChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Subject-Wise Attendance Breakdown Table & Interactive Skip Calculator -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Table of Courses Attendance -->
            <div class="lg:col-span-2 glass-panel rounded-2xl p-6 card-hover">
                <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Subject-Wise Attendance Breakdown</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider">
                                <th class="pb-3">Subject / Code</th>
                                <th class="pb-3 text-center">Attended / Total</th>
                                <th class="pb-3">Percentage</th>
                                <th class="pb-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            ${courses.map(c => `
                                <tr>
                                    <td class="py-3.5">
                                        <div class="font-bold text-gray-900 dark:text-white">${c.code}</div>
                                        <div class="text-gray-500 dark:text-gray-400 text-[11px]">${c.title}</div>
                                    </td>
                                    <td class="py-3.5 text-center font-bold text-gray-700 dark:text-gray-300">
                                        ${c.attendance.attended} / ${c.attendance.total}
                                    </td>
                                    <td class="py-3.5">
                                        <div class="flex items-center gap-2">
                                            <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div class="h-2 rounded-full ${c.attendance.percent >= 85 ? 'bg-emerald-500' : c.attendance.percent >= 75 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${c.attendance.percent}%"></div>
                                            </div>
                                            <span class="font-bold text-gray-800 dark:text-gray-200">${c.attendance.percent}%</span>
                                        </div>
                                    </td>
                                    <td class="py-3.5 text-right">
                                        <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${c.attendance.percent >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                                            ${c.attendance.percent >= 75 ? 'Eligible' : 'Critical'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- College Student Skip Calculator Widget -->
            <div class="glass-panel rounded-2xl p-6 card-hover flex flex-col justify-between">
                <div>
                    <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                        <i data-lucide="calculator" class="w-5 h-5 text-indigo-600"></i>
                        Safe Margin Calculator
                    </h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Calculate how many classes you can afford to skip while keeping your attendance above 75%.</p>

                    <div class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Classes Attended</label>
                            <input type="number" id="calcAttended" value="26" min="1" max="100" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 font-bold text-gray-900 dark:text-white" oninput="runAttendanceCalc()">
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Total Classes Conducted</label>
                            <input type="number" id="calcTotal" value="28" min="1" max="100" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 font-bold text-gray-900 dark:text-white" oninput="runAttendanceCalc()">
                        </div>
                    </div>

                    <!-- Calculated Result Callout -->
                    <div id="calcResultBox" class="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                        <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Calculation Analysis</div>
                        <div id="calcResultText" class="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            Loading calculation...
                        </div>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
                    Simulate your exam eligibility in real-time.
                </div>
            </div>
        </div>
    </div>
    `;
}

function initAttendanceCharts() {
    renderAttendanceDonut();
    renderStudyChart();
}

function initAttendanceCalculator() {
    runAttendanceCalc();
}

function runAttendanceCalc() {
    const attendedInput = document.getElementById('calcAttended');
    const totalInput = document.getElementById('calcTotal');
    const resultBox = document.getElementById('calcResultBox');
    const resultText = document.getElementById('calcResultText');
    if (!attendedInput || !totalInput || !resultBox || !resultText) return;

    const attended = parseInt(attendedInput.value) || 0;
    const total = parseInt(totalInput.value) || 1;
    
    if (attended > total) {
        resultText.textContent = "Attended classes cannot be greater than total classes.";
        resultBox.className = "mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800";
        return;
    }

    const currentPercent = ((attended / total) * 100).toFixed(1);

    if (currentPercent >= 75) {
        // Find how many you can skip: attended / (total + x) >= 0.75 => x <= (attended / 0.75) - total
        const maxTotal = Math.floor(attended / 0.75);
        const canSkip = Math.max(0, maxTotal - total);

        resultBox.className = "mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800";
        resultText.innerHTML = `
            Current attendance is <strong>${currentPercent}%</strong>. 
            You can safely miss <strong>${canSkip} more consecutive classes</strong> and still maintain the ≥75% requirement.
        `;
    } else {
        // Find how many you must attend: (attended + y) / (total + y) >= 0.75 => y >= (0.75 * total - attended) / 0.25
        const needAttend = Math.ceil((0.75 * total - attended) / 0.25);
        resultBox.className = "mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800";
        resultText.innerHTML = `
            Current attendance is <strong>${currentPercent}%</strong> (Below 75%). 
            You must attend the next <strong>${needAttend} classes consecutively</strong> without any absences to reach 75%.
        `;
    }
}

/* ==========================================================================
   VIEW 6: Campus Life & Events View HTML
   ========================================================================== */
function getEventsViewHTML() {
    const { events } = AppState.data;

    return `
    <div class="space-y-6">
        <!-- Events Header -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Campus Events & Tech Guilds</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Explore national hackathons, technical conferences, career expos, and community meetups.</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        ${events.length} Upcoming Events
                    </span>
                </div>
            </div>
        </div>

        <!-- Events Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${events.map(evt => `
                <div class="glass-panel rounded-2xl overflow-hidden card-hover flex flex-col justify-between">
                    <div>
                        <!-- Event Hero Image -->
                        <div class="h-44 w-full relative overflow-hidden bg-gray-900">
                            <img src="${evt.image}" alt="${evt.title}" class="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
                            
                            <div class="absolute top-3 left-3 flex items-center gap-2">
                                <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-md">
                                    ${evt.category}
                                </span>
                            </div>

                            <div class="absolute bottom-3 left-3 right-3 text-white">
                                <h3 class="text-base font-bold leading-tight">${evt.title}</h3>
                                <div class="flex items-center gap-3 text-xs text-gray-300 mt-1">
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-400"></i>
                                        ${evt.date}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i>
                                        ${evt.time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Event Content -->
                        <div class="p-5 space-y-3">
                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span class="flex items-center gap-1">
                                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-500"></i>
                                    ${evt.venue}
                                </span>
                                <span class="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                                    <i data-lucide="users" class="w-3.5 h-3.5"></i>
                                    ${evt.attendees} Attending
                                </span>
                            </div>

                            <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                                <span class="text-gray-400 font-bold block text-[10px] uppercase">Highlights & Awards</span>
                                <span class="font-semibold text-indigo-600 dark:text-indigo-400">${evt.prize}</span>
                            </div>

                            <div class="flex flex-wrap gap-1.5 pt-1">
                                ${evt.tags.map(tag => `
                                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        #${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Footer RSVP Action -->
                    <div class="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 mt-2">
                        <button onclick="showToast('Event Details', '${evt.title} has been bookmarked.', 'info')" class="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5">
                            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
                            <span>Share</span>
                        </button>
                        <button onclick="toggleEventRsvp('${evt.id}')" class="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            evt.isRsvpd ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                        }">
                            <i data-lucide="${evt.isRsvpd ? 'check-circle' : 'ticket'}" class="w-3.5 h-3.5"></i>
                            <span>${evt.isRsvpd ? 'Registered (RSVP Confirmed)' : 'Register & RSVP Now'}</span>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

function toggleEventRsvp(eventId) {
    const event = AppState.data.events.find(e => e.id === eventId);
    if (!event) return;

    event.isRsvpd = !event.isRsvpd;
    if (event.isRsvpd) {
        event.attendees += 1;
        showToast('RSVP Confirmed!', `You are registered for "${event.title}". Admission barcode added to notifications.`, 'success');
        
        // Add notification
        AppState.data.notifications.unshift({
            id: 'NOTIF-' + Date.now(),
            title: `RSVP: ${event.title}`,
            text: `Confirmed entry for ${event.date} at ${event.venue}.`,
            time: 'Just now',
            icon: 'ticket',
            color: 'text-emerald-500',
            unread: true
        });
        updateNotificationBadge();
    } else {
        event.attendees -= 1;
        showToast('RSVP Cancelled', `Your reservation for "${event.title}" has been withdrawn.`, 'info');
    }

    if (window.CampusPulseAPI && window.CampusPulseAPI.isOnline) {
        window.CampusPulseAPI.toggleRsvp(eventId);
    }

    renderCurrentView();
}

/* ==========================================================================
   VIEW 7: Profile & Digital ID View HTML
   ========================================================================== */
function getProfileViewHTML() {
    const { student } = AppState.data;

    return `
    <div class="space-y-6">
        <!-- Header -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Student Profile & Credentials</h1>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Official student dossier, holographic identity card, and academic standing records.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="openModal('idCardModal')" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm shadow-md shadow-indigo-500/20 transition-all">
                        <i data-lucide="qr-code" class="w-4 h-4"></i>
                        <span>Display ID Hologram</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Student Card Preview -->
            <div class="glass-panel rounded-2xl p-6 card-hover flex flex-col items-center text-center">
                <div class="relative mb-4">
                    <img src="${student.avatar}" alt="${student.name}" class="w-28 h-28 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-lg">
                    <span class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 status-beacon"></span>
                </div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">${student.name}</h2>
                <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">${student.id}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${student.major}</p>

                <div class="w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3 text-xs text-left">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Institutional Email:</span>
                        <span class="font-medium text-gray-800 dark:text-gray-200">${student.email}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Phone Contact:</span>
                        <span class="font-medium text-gray-800 dark:text-gray-200">${student.phone}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Academic Batch:</span>
                        <span class="font-medium text-gray-800 dark:text-gray-200">${student.batch}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Emergency Line:</span>
                        <span class="font-medium text-gray-800 dark:text-gray-200">${student.emergencyContact}</span>
                    </div>
                </div>
            </div>

            <!-- Right 2 Cols: Academic Standing & Editable Bio -->
            <div class="lg:col-span-2 glass-panel rounded-2xl p-6 card-hover space-y-6">
                <div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-600"></i>
                        University Registration Dossier
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <span class="text-gray-400 block text-[10px] uppercase font-bold">University & Campus</span>
                            <span class="font-bold text-gray-800 dark:text-gray-200 text-sm mt-0.5 block">${student.university}</span>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <span class="text-gray-400 block text-[10px] uppercase font-bold">Faculty & Department</span>
                            <span class="font-bold text-gray-800 dark:text-gray-200 text-sm mt-0.5 block">${student.department}</span>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <span class="text-gray-400 block text-[10px] uppercase font-bold">Current Standing</span>
                            <span class="font-bold text-emerald-600 text-sm mt-0.5 block">Good Standing (GPA ${student.gpa})</span>
                        </div>
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                            <span class="text-gray-400 block text-[10px] uppercase font-bold">Earned Credits</span>
                            <span class="font-bold text-indigo-600 text-sm mt-0.5 block">${student.totalCredits} of ${student.requiredCredits} Completed</span>
                        </div>
                    </div>
                </div>

                <!-- Fast Student Edit Form -->
                <div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <i data-lucide="edit" class="w-4 h-4 text-indigo-600"></i>
                        Update Student Contact Information
                    </h3>
                    <form onsubmit="handleProfileUpdate(event)" class="space-y-4 text-xs">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Student Name</label>
                                <input type="text" id="editStudentName" value="${student.name}" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input type="text" id="editStudentPhone" value="${student.phone}" class="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                                Save Profile Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const nameInput = document.getElementById('editStudentName');
    const phoneInput = document.getElementById('editStudentPhone');
    if (!nameInput) return;

    AppState.data.student.name = nameInput.value;
    if (phoneInput) AppState.data.student.phone = phoneInput.value;

    // Update topbar student name
    const topName = document.getElementById('topbarStudentName');
    if (topName) topName.textContent = nameInput.value;

    showToast('Profile Saved', 'Student dossier updated successfully across prototype.', 'success');
    renderCurrentView();
}

/* ==========================================================================
   VIEW 8: Settings & Customizer View HTML
   ========================================================================== */
function getSettingsViewHTML() {
    return `
    <div class="space-y-6">
        <div class="glass-panel rounded-2xl p-5 md:p-6 card-hover">
            <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">Prototype Settings & Controls</h1>
            <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize accent themes, inspect project information, and test prototype actions.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Appearance Customizer -->
            <div class="glass-panel rounded-2xl p-6 card-hover space-y-4">
                <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i data-lucide="palette" class="w-5 h-5 text-indigo-600"></i>
                    Accent Color Theme
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">Choose your favorite primary accent shade for this college project prototype.</p>

                <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                    <button onclick="setAccentColor('indigo')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="indigo">
                        <span class="w-6 h-6 rounded-full bg-indigo-600"></span>
                        <span class="text-[11px] font-semibold">Indigo</span>
                    </button>
                    <button onclick="setAccentColor('emerald')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="emerald">
                        <span class="w-6 h-6 rounded-full bg-emerald-500"></span>
                        <span class="text-[11px] font-semibold">Emerald</span>
                    </button>
                    <button onclick="setAccentColor('violet')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="violet">
                        <span class="w-6 h-6 rounded-full bg-violet-600"></span>
                        <span class="text-[11px] font-semibold">Violet</span>
                    </button>
                    <button onclick="setAccentColor('rose')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="rose">
                        <span class="w-6 h-6 rounded-full bg-rose-500"></span>
                        <span class="text-[11px] font-semibold">Rose</span>
                    </button>
                    <button onclick="setAccentColor('amber')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="amber">
                        <span class="w-6 h-6 rounded-full bg-amber-500"></span>
                        <span class="text-[11px] font-semibold">Amber</span>
                    </button>
                    <button onclick="setAccentColor('cyan')" class="accent-picker-btn p-3 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-1.5 hover:scale-105 transition-all" data-color="cyan">
                        <span class="w-6 h-6 rounded-full bg-cyan-500"></span>
                        <span class="text-[11px] font-semibold">Cyan</span>
                    </button>
                </div>
            </div>

            <!-- College Project Evaluator Guide -->
            <div class="glass-panel rounded-2xl p-6 card-hover space-y-4">
                <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i data-lucide="info" class="w-5 h-5 text-indigo-600"></i>
                    College Project Evaluation Info
                </h2>
                <div class="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <div class="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span class="text-gray-400">Project Title:</span>
                        <span class="font-bold text-gray-800 dark:text-gray-200">CampusPulse - Smart Academic Suite</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span class="text-gray-400">Architecture:</span>
                        <span class="font-bold text-gray-800 dark:text-gray-200">SPA Frontend (HTML5, Tailwind, Modular JS, Chart.js)</span>
                    </div>
                    <div class="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                        <span class="text-gray-400">Zero Dependencies:</span>
                        <span class="font-bold text-emerald-600">No npm/node install required to run</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-gray-400">Key Deliverables:</span>
                        <span class="font-bold text-indigo-600">Responsive UI, Kanban, Charts, ID Badge, Live Filter</span>
                    </div>
                </div>

                <div class="pt-2">
                    <button onclick="resetPrototypeData()" class="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all">
                        Reset Prototype to Factory Sample Data
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

function resetPrototypeData() {
    AppState.data = JSON.parse(JSON.stringify(initialData));
    localStorage.removeItem('nexus_notes');
    AppState.notes = '• Finish Cloud Computing Raft protocol report by 10 PM.\n• Review Transformers attention heads formula for CS304 test.';
    showToast('Data Reset', 'All courses, assignments, and counters reset to initial demo state.', 'info');
    renderCurrentView();
}

/* ==========================================================================
   Interactive Charts (Chart.js)
   ========================================================================== */
function renderGpaChart() {
    const ctx = document.getElementById('dashboardGpaChart');
    if (!ctx || !window.Chart) return;

    if (AppState.charts.gpa) {
        AppState.charts.gpa.destroy();
    }

    const isDark = AppState.theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    AppState.charts.gpa = new Chart(ctx, {
        type: 'line',
        data: {
            labels: AppState.data.performanceData.semesters,
            datasets: [
                {
                    label: 'Semester GPA (SGPA)',
                    data: AppState.data.performanceData.sgpa,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.35,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Cumulative GPA (CGPA)',
                    data: AppState.data.performanceData.cgpa,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.35,
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    titleColor: isDark ? '#f9fafb' : '#111827',
                    bodyColor: isDark ? '#d1d5db' : '#374151',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 4
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                },
                y: {
                    min: 3.0,
                    max: 4.0,
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, stepSize: 0.2 }
                }
            }
        }
    });
}

function renderAttendanceDonut() {
    const ctx = document.getElementById('attendanceDonutChart');
    if (!ctx || !window.Chart) return;

    if (AppState.charts.donut) {
        AppState.charts.donut.destroy();
    }

    const { present, late, absent } = AppState.data.performanceData.attendanceBreakdown;

    AppState.charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Late (Permitted)', 'Absent / Leave'],
            datasets: [{
                data: [present, late, absent],
                backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderStudyChart() {
    const ctx = document.getElementById('weeklyStudyChart');
    if (!ctx || !window.Chart) return;

    if (AppState.charts.study) {
        AppState.charts.study.destroy();
    }

    const isDark = AppState.theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const { labels, hours } = AppState.data.performanceData.weeklyStudyHours;

    AppState.charts.study = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hours Studied',
                data: hours,
                backgroundColor: '#6366f1',
                borderRadius: 8,
                hoverBackgroundColor: '#4f46e5'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
                }
            }
        }
    });
}

function renderCharts() {
    if (AppState.currentView === 'dashboard') {
        renderGpaChart();
    } else if (AppState.currentView === 'attendance') {
        renderAttendanceDonut();
        renderStudyChart();
    }
}

/* ==========================================================================
   Modals & Interactive Dialogs
   ========================================================================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    initLucide();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openSubmitModal(assignmentId) {
    const asg = AppState.data.assignments.find(a => a.id === assignmentId);
    if (asg) {
        const titleEl = document.getElementById('submitModalAssignmentTitle');
        const courseEl = document.getElementById('submitModalCourseCode');
        const inputId = document.getElementById('submitModalAsgId');
        if (titleEl) titleEl.textContent = asg.title;
        if (courseEl) courseEl.textContent = asg.courseCode;
        if (inputId) inputId.value = asg.id;
    }
    openModal('quickSubmitModal');
}

function handleAssignmentSubmission(event) {
    event.preventDefault();
    const asgId = document.getElementById('submitModalAsgId')?.value || 'ASG-101';
    const comments = document.getElementById('submitComments')?.value || '';
    const fileInput = document.getElementById('submitFileInput');
    const fileName = fileInput?.files?.[0]?.name || 'Raft_Consensus_Implementation_v1.zip';

    // Update assignment in state
    const asg = AppState.data.assignments.find(a => a.id === asgId);
    if (asg) {
        asg.status = 'submitted';
        asg.submissionFile = fileName;
        asg.feedback = 'Under evaluation by faculty evaluator.';
    }

    closeModal('quickSubmitModal');
    showToast('Assignment Submitted!', `"${fileName}" has been dispatched to teaching assistant portal.`, 'success');
    
    // Add notification
    AppState.data.notifications.unshift({
        id: 'NOTIF-' + Date.now(),
        title: `Submission Received: ${asg ? asg.courseCode : 'Assignment'}`,
        text: `File "${fileName}" successfully logged with timestamp.`,
        time: 'Just now',
        icon: 'check-circle',
        color: 'text-indigo-500',
        unread: true
    });
    updateNotificationBadge();

    // Re-render
    renderCurrentView();

    if (window.CampusPulseAPI && window.CampusPulseAPI.isOnline) {
        window.CampusPulseAPI.submitAssignment(asgId, fileName);
    }
}

function viewCourseDetails(courseId) {
    const course = AppState.data.courses.find(c => c.id === courseId);
    if (!course) return;

    const modalBody = document.getElementById('courseDetailsModalBody');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <span class="text-xs font-bold text-indigo-600 uppercase">${course.code}</span>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">${course.title}</h2>
                        <p class="text-xs text-gray-500">${course.instructor} • ${course.instructorRole}</p>
                    </div>
                    <span class="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        ${course.credits} Credits
                    </span>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Curriculum Units</h4>
                    <div class="space-y-2">
                        ${course.syllabus.map((s, idx) => `
                            <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs flex items-center gap-3">
                                <span class="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                                    0${idx + 1}
                                </span>
                                <span class="font-medium text-gray-800 dark:text-gray-200">${s}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                    <button onclick="downloadCourseNotes('${course.code}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                        Download Complete Syllabus PDF
                    </button>
                </div>
            </div>
        `;
    }
    openModal('courseDetailsModal');
}

function showAnnouncementModal(annId) {
    const ann = AppState.data.announcements.find(a => a.id === annId);
    if (!ann) return;
    showToast(ann.title, `${ann.excerpt} (${ann.department})`, 'info');
}

/* ==========================================================================
   Spotlight Quick Search Engine (Ctrl + K)
   ========================================================================== */
function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('searchResultsDropdown');
    if (!resultsContainer) return;

    if (!query || query.trim().length === 0) {
        resultsContainer.classList.add('hidden');
        return;
    }

    const q = query.toLowerCase().trim();
    
    // Search courses
    const matchedCourses = AppState.data.courses.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        c.instructor.toLowerCase().includes(q)
    );

    // Search assignments
    const matchedAssignments = AppState.data.assignments.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.courseCode.toLowerCase().includes(q)
    );

    // Search events
    const matchedEvents = AppState.data.events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q)
    );

    const totalResults = matchedCourses.length + matchedAssignments.length + matchedEvents.length;

    if (totalResults === 0) {
        resultsContainer.innerHTML = `
            <div class="p-4 text-center text-xs text-gray-500">
                No matching academic records found for "<strong class="text-gray-800 dark:text-gray-200">${query}</strong>".
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <div class="p-2 space-y-2">
                ${matchedCourses.length > 0 ? `
                    <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1">Courses</div>
                    ${matchedCourses.map(c => `
                        <div onclick="navigateTo('courses'); closeSearchDropdown()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between text-xs">
                            <div>
                                <span class="font-bold text-indigo-600 dark:text-indigo-400">${c.code}:</span>
                                <span class="text-gray-800 dark:text-gray-200 font-medium">${c.title}</span>
                            </div>
                            <span class="text-[10px] text-gray-400">${c.room}</span>
                        </div>
                    `).join('')}
                ` : ''}

                ${matchedAssignments.length > 0 ? `
                    <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1">Assignments</div>
                    ${matchedAssignments.map(a => `
                        <div onclick="navigateTo('assignments'); closeSearchDropdown()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between text-xs">
                            <div>
                                <span class="font-bold text-amber-600">${a.courseCode}:</span>
                                <span class="text-gray-800 dark:text-gray-200 font-medium">${a.title}</span>
                            </div>
                            <span class="text-[10px] text-gray-400">${a.dueDate}</span>
                        </div>
                    `).join('')}
                ` : ''}

                ${matchedEvents.length > 0 ? `
                    <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1">Campus Events</div>
                    ${matchedEvents.map(e => `
                        <div onclick="navigateTo('events'); closeSearchDropdown()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between text-xs">
                            <span class="text-gray-800 dark:text-gray-200 font-medium">${e.title}</span>
                            <span class="text-[10px] text-indigo-500 font-bold">${e.category}</span>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
    }

    resultsContainer.classList.remove('hidden');
    initLucide();
}

function closeSearchDropdown() {
    const dropdown = document.getElementById('searchResultsDropdown');
    const input = document.getElementById('globalSearchInput');
    if (dropdown) dropdown.classList.add('hidden');
    if (input) input.value = '';
}

/* ==========================================================================
   Notifications Engine
   ========================================================================== */
function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationsDropdown');
    if (!panel) return;
    panel.classList.toggle('hidden');
    renderNotificationsList();
    initLucide();
}

function renderNotificationsList() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    const notifs = AppState.data.notifications;
    if (notifs.length === 0) {
        list.innerHTML = `<div class="p-6 text-center text-xs text-gray-400">All caught up! No notifications.</div>`;
        return;
    }

    list.innerHTML = notifs.map(n => `
        <div class="p-3.5 border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-3 ${n.unread ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
            <div class="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm ${n.color}">
                <i data-lucide="${n.icon}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between text-xs mb-0.5">
                    <h4 class="font-bold text-gray-900 dark:text-white truncate">${n.title}</h4>
                    <span class="text-[10px] text-gray-400 shrink-0 ml-2">${n.time}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug">${n.text}</p>
            </div>
        </div>
    `).join('');
}

function markAllNotificationsRead() {
    AppState.data.notifications.forEach(n => n.unread = false);
    updateNotificationBadge();
    renderNotificationsList();
    showToast('Notifications Cleared', 'All alerts marked as read', 'info');

    if (window.CampusPulseAPI && window.CampusPulseAPI.isOnline) {
        window.CampusPulseAPI.markAllNotificationsRead();
    }
}

function updateNotificationBadge() {
    const unreadCount = AppState.data.notifications.filter(n => n.unread).length;
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/* ==========================================================================
   Toast Notification Banner System
   ========================================================================== */
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
    
    const iconMap = {
        'success': 'check-circle',
        'info': 'info',
        'warning': 'alert-triangle',
        'error': 'alert-circle'
    };

    const colorMap = {
        'success': 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
        'info': 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
        'warning': 'border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/60',
        'error': 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/60'
    };

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast-slide-in pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-xl shadow-black/10 max-w-sm w-full`;
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[type] || colorMap.info}">
            <i data-lucide="${iconMap[type] || 'info'}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-gray-900 dark:text-white">${title}</h5>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${message}</p>
        </div>
        <button onclick="removeToast('${toastId}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    container.appendChild(toast);
    initLucide();

    setTimeout(() => {
        removeToast(toastId);
    }, 4500);
}

function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast) return;
    toast.classList.remove('toast-slide-in');
    toast.classList.add('toast-slide-out');
    setTimeout(() => {
        toast.remove();
    }, 250);
}

/* ==========================================================================
   Global Event Listeners & Keyboard Shortcuts
   ========================================================================== */
function initEventListeners() {
    // Keyboard shortcut: Ctrl + K or / to search
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            closeSearchDropdown();
            const notificationsPanel = document.getElementById('notificationsDropdown');
            if (notificationsPanel) notificationsPanel.classList.add('hidden');
        }
    });

    // Close notifications or search when clicking outside
    document.addEventListener('click', (e) => {
        const notifContainer = document.getElementById('notificationsContainer');
        const notifPanel = document.getElementById('notificationsDropdown');
        if (notifContainer && notifPanel && !notifContainer.contains(e.target)) {
            notifPanel.classList.add('hidden');
        }

        const searchContainer = document.getElementById('searchContainer');
        const searchDropdown = document.getElementById('searchResultsDropdown');
        if (searchContainer && searchDropdown && !searchContainer.contains(e.target)) {
            searchDropdown.classList.add('hidden');
        }
    });
}
