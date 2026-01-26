const API_BASE_URL = 'http://localhost:8000';

const API = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

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
                headers,
                credentials: 'include'  // Important for CORS with credentials
            });

            if (!response.ok) {
                // Try to extract error message from response
                let errorMessage = `API error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                console.error('API request failed:', errorMessage);
                throw new Error(errorMessage);
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

    // Get dashboard stats
    async getDashboardStats() {
        return this.request('/api/stats/dashboard');
    },

    // Get weekly stats
    async getWeeklyStats() {
        return this.request('/api/stats/weekly');
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
        return this.request('/api/profile');
    },

    updateProfile(data) {
        return this.request('/api/profile', {
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