// History page functionality
const History = {
    currentPage: 1,
    itemsPerPage: 10,
    currentFilter: 'all',
    
    // Initialize history page
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadSessions();
    },

    // Load user data
    loadUserData() {
        try {
            const user = Auth.getCurrentUser();
            
            if (user) {
                // Update user info in header
                this.updateUserHeader(user);
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    // Update user header
    updateUserHeader(user) {
        // Update user avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.textContent = initials;
            userAvatar.classList.remove('loading-placeholder');
        }
        
        // Update user name
        const userName = document.getElementById('userName');
        if (userName && user.name) {
            userName.textContent = user.name;
            userName.classList.remove('loading-placeholder');
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
    },
    
    // Set filter
    setFilter(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.currentFilter = filter;
        this.currentPage = 1;
        this.loadSessions();
    },
    
    // Load sessions using your API.js
    async loadSessions() {
        try {
            // Show loading state
            const tableBody = document.getElementById('historyTableBody');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Loading...</td></tr>';
            
            // Get user_id - if you have auth, get from localStorage, else default to 1
            const userId = localStorage.getItem('userId') || 1;
            
            // USE YOUR API.JS - clean API call
            const sessions = await API.getSessions({ user_id: userId });
            
            // Filter sessions (client-side filtering)
            const filteredSessions = this.filterSessions(sessions);
            
            // Update stats
            this.updateStats(filteredSessions);
            
            // Render sessions
            this.renderSessions(filteredSessions);
            
            // Render pagination
            this.renderPagination(filteredSessions.length);
            
        } catch (error) {
            console.error('Error loading sessions:', error);
            Utils.showNotification('Failed to load sessions', 'error');
        }
    },
    
    // Filter sessions based on current filter
    filterSessions(sessions) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        return sessions.filter(session => {
            const sessionDate = new Date(session.start_time);
            
            switch (this.currentFilter) {
                case 'today':
                    return sessionDate >= today;
                case 'week':
                    return sessionDate >= weekStart;
                case 'month':
                    return sessionDate >= monthStart;
                case 'year':
                    return sessionDate >= yearStart;
                default:
                    return true; // 'all'
            }
        });
    },
    
    // Update stats
    updateStats(sessions) {
        if (sessions.length === 0) {
            const totalTimeElement = document.getElementById('historyTotalTime');
            const totalSessionsElement = document.getElementById('historyTotalSessions');
            const avgDurationElement = document.getElementById('historyAvgDuration');
            const avgQualityElement = document.getElementById('historyAvgQuality');
            
            if (totalTimeElement) {
                totalTimeElement.textContent = '0h';
                totalTimeElement.classList.remove('loading-placeholder');
            }
            if (totalSessionsElement) {
                totalSessionsElement.textContent = '0';
                totalSessionsElement.classList.remove('loading-placeholder');
            }
            if (avgDurationElement) {
                avgDurationElement.textContent = '0m';
                avgDurationElement.classList.remove('loading-placeholder');
            }
            if (avgQualityElement) {
                avgQualityElement.textContent = '0.0';
                avgQualityElement.classList.remove('loading-placeholder');
            }
            return;
        }
        
        const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || session.duration_minutes || 0), 0);
        const avgDuration = Math.round(totalMinutes / sessions.length);
        const avgQuality = sessions.length > 0 
            ? (sessions.reduce((sum, session) => sum + (session.quality || 0), 0) / sessions.length).toFixed(1)
            : 0;
        
        const totalTimeElement = document.getElementById('historyTotalTime');
        const totalSessionsElement = document.getElementById('historyTotalSessions');
        const avgDurationElement = document.getElementById('historyAvgDuration');
        const avgQualityElement = document.getElementById('historyAvgQuality');
        
        if (totalTimeElement) {
            totalTimeElement.textContent = Utils.formatDuration(totalMinutes);
            totalTimeElement.classList.remove('loading-placeholder');
        }
        if (totalSessionsElement) {
            totalSessionsElement.textContent = sessions.length;
            totalSessionsElement.classList.remove('loading-placeholder');
        }
        if (avgDurationElement) {
            avgDurationElement.textContent = Utils.formatDuration(avgDuration);
            avgDurationElement.classList.remove('loading-placeholder');
        }
        if (avgQualityElement) {
            avgQualityElement.textContent = avgQuality;
            avgQualityElement.classList.remove('loading-placeholder');
        }
    },
    
    // Render sessions table
    renderSessions(sessions) {
        const tableBody = document.getElementById('historyTableBody');

        if (!sessions || sessions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No sessions found</td></tr>';
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedSessions = sessions.slice(startIndex, endIndex);

        tableBody.innerHTML = paginatedSessions.map(session => `
            <tr>
                <td>${Utils.formatDate(session.start_time || session.created_at)}</td>
                <td>${session.subject || 'No Subject'}</td>
                <td>${Utils.formatDuration(session.duration || session.duration_minutes || 0)}</td>
                <td>${session.quality ? Utils.generateStarRating(session.quality) : 'N/A'}</td>
                <td>${session.completion || session.percentage_completion || 0}%</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-icon btn-sm" title="Edit" onclick="History.editSession(${session.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-sm" title="Delete" onclick="History.deleteSession(${session.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    
    // Render pagination
    renderPagination(totalItems) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        let html = '';
        
        // Previous button
        html += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="History.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${this.currentPage === i ? 'active' : ''}" 
                    onclick="History.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        html += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="History.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = html;
    },
    
    // Go to page
    goToPage(page) {
        this.currentPage = page;
        this.loadSessions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Edit session
    async editSession(id) {
        Utils.showNotification('Edit functionality coming soon!', 'info');
        // TODO: Open edit modal with session data
    },
    
    // Delete session using your API.js
    async deleteSession(id) {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }
        
        try {
            // USE YOUR API.JS
            await API.deleteSession(id);
            
            Utils.showNotification('Session deleted successfully', 'success');
            this.loadSessions(); // Refresh the list
            
        } catch (error) {
            console.error('Error deleting session:', error);
            Utils.showNotification('Failed to delete session', 'error');
        }
    }
};

// Initialize when page loads
window.History = History;
document.addEventListener('DOMContentLoaded', () => {
    History.init();
});