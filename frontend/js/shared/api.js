const API_BASE_URL = 'http://localhost:8000';

const API = {
    async request(endpoint, options = {}) {
        let token = localStorage.getItem('token');
        if (token) {
            try {
                // If token is stringified with quotes (e.g. "token"), parse it
                if (token.startsWith('"') && token.endsWith('"')) {
                    token = JSON.parse(token);
                }
            } catch (e) {
                // Ignore parse error, use as is
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Sessions
    getSessions(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/api/sessions?${query}`);
    },

    createSession(data) {
        return this.request('/api/sessions', {
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


    // Auth
    login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    register(data) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Profile
    getProfile() {
        return this.request('/api/profile/me');
    },

    updateProfile(data) {
        return this.request('/api/profile/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Stats
    getDashboardStats() {
        return this.request('/api/stats/dashboard');
    },

    getHistoryStats() {
        return this.request('/api/stats/history');
    }
};

window.API = API;