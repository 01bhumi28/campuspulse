/**
 * CampusPulse API Client Bridge
 * Seamlessly interfaces with Node.js Express REST API with graceful offline fallback
 */

const CampusPulseAPI = {
    baseUrl: 'http://localhost:5000/api',
    isOnline: false,

    // Check backend health on startup
    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                this.isOnline = true;
                this.updateUIStatus(true);
                return true;
            }
        } catch (e) {
            // Server not running or blocked; fallback to client-side mode
            this.isOnline = false;
            this.updateUIStatus(false);
            return false;
        }
    },

    updateUIStatus(online) {
        const statusEl = document.getElementById('apiStatusBadge');
        if (statusEl) {
            if (online) {
                statusEl.innerHTML = `
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold">Node.js API Connected</span>
                `;
                statusEl.title = 'Live connection to Node.js Express REST Backend';
            } else {
                statusEl.innerHTML = `
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span class="text-indigo-600 dark:text-indigo-400 font-medium">Client Demo Mode</span>
                `;
                statusEl.title = 'Running client-side prototype. Run start-backend.bat for full REST API';
            }
        }
    },

    // Sync state with live backend
    async fetchInitialData() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/data`);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.warn('API sync failed, continuing in local mode:', e);
        }
        return null;
    },

    // Toggle event RSVP
    async toggleRsvp(eventId) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/events/${eventId}/rsvp`, { method: 'POST' });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to update RSVP via API:', e);
        }
        return null;
    },

    // Submit assignment
    async submitAssignment(assignmentId, fileName) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/assignments/${assignmentId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName })
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to submit assignment via API:', e);
        }
        return null;
    },

    // Update assignment status
    async updateAssignmentStatus(assignmentId, status) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/assignments/${assignmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to update assignment status via API:', e);
        }
        return null;
    },

    // Mark notifications read
    async markAllNotificationsRead() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/notifications/read-all`, { method: 'PUT' });
            if (res.ok) return await res.json();
        } catch (e) {
            console.error('Failed to mark notifications via API:', e);
        }
        return null;
    }
};

window.CampusPulseAPI = CampusPulseAPI;
