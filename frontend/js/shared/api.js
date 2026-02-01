const API_BASE_URL = 'http://localhost:8000';

const API = {
    async request(endpoint, options = {}) {
        const token = Utils.getFromStorage('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            if (response.status === 401) {
                // Token invalid or expired - logout user
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html?expired=true';
                return null;
            }

            const message = data?.detail || data?.message || `HTTP ${response.status}`;
            throw new Error(message);
        }

        return data;
    },


    // Sessions
    getSessions(params = {}) {
        const query = new URLSearchParams(params).toString();
        // Add trailing slash before query params
        return this.request(`/api/sessions/?${query}`);
    },

    createSession(data) {
        return this.request('/api/sessions/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSession(id, data) {
        return this.request(`/api/sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteSession(id) {
        return this.request(`/api/sessions/${id}`, {
            method: 'DELETE'
        });
    },

    // Get weekly stats
    async getWeeklyStats() {
        return this.request('/api/stats/weekly/');
    },

    // Auth
    login(credentials) {
        return this.request('/api/auth/login/', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    register(data) {
        return this.request('/api/auth/register/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Profile
    getProfile() {
        return this.request('/api/profile/');
    },

    updateProfile(data) {
        return this.request('/api/profile/', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Stats
    getDashboardStats() {
        return this.request('/api/stats/dashboard/');
    },

    getHistoryStats() {
        return this.request('/api/stats/history/');
    }
};

window.API = API;