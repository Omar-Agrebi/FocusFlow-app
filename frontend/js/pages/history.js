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
        Components.loadUserData();
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
        
        // Search functionality (if added later)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.loadSessions();
            }, 300));
        }
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
    
    // Load sessions
    async loadSessions() {
        try {
            // Show loading state
            const tableBody = document.getElementById('historyTableBody');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Loading...</td></tr>';
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Get sessions from localStorage or use mock data
            let sessions = Utils.getFromStorage('sessions', []);
            
            // If no sessions in storage, use mock data
            if (sessions.length === 0) {
                sessions = this.getMockSessions();
                Utils.saveToStorage('sessions', sessions);
            }
            
            // Filter sessions
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
            const sessionDate = new Date(session.startTime || session.date);
            
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
            document.getElementById('historyTotalTime').textContent = '0h';
            document.getElementById('historyTotalSessions').textContent = '0';
            document.getElementById('historyAvgDuration').textContent = '0m';
            document.getElementById('historyAvgQuality').textContent = '0.0';
            return;
        }
        
        const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const avgDuration = Math.round(totalMinutes / sessions.length);
        const avgQuality = (sessions.reduce((sum, session) => sum + (session.quality || 0), 0) / sessions.length).toFixed(1);
        
        document.getElementById('historyTotalTime').textContent = Utils.formatDuration(totalMinutes);
        document.getElementById('historyTotalSessions').textContent = sessions.length;
        document.getElementById('historyAvgDuration').textContent = Utils.formatDuration(avgDuration);
        document.getElementById('historyAvgQuality').textContent = avgQuality;
    },
    
    // Render sessions table
    renderSessions(sessions) {
        const tableBody = document.getElementById('historyTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (sessions.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedSessions = sessions.slice(startIndex, endIndex);
        
        tableBody.innerHTML = paginatedSessions.map(session => `
            <tr>
                <td>${Utils.formatDate(session.date || session.startTime)}</td>
                <td>
                    <span class="subject-badge">${session.subject}</span>
                </td>
                <td class="duration-cell">${Utils.formatDuration(session.duration)}</td>
                <td class="quality-cell">
                    ${Utils.generateStarRating(session.quality)}
                </td>
                <td class="completion-cell">${session.completion}%</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-icon btn-sm" title="View details" onclick="History.viewSession(${session.id})">
                            <i class="fas fa-eye"></i>
                        </button>
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
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="page-btn ${this.currentPage === i ? 'active' : ''}" 
                        onclick="History.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<span class="page-dots">...</span>`;
            }
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
    
    // View session details
    viewSession(id) {
        Utils.showNotification(`Viewing session ${id}`, 'info');
        // In a real app, this would open a modal or redirect to a details page
    },
    
    // Edit session
    editSession(id) {
        Utils.showNotification(`Editing session ${id}`, 'info');
        // In a real app, this would redirect to edit page or open edit modal
    },
    
    // Delete session
    async deleteSession(id) {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Remove from localStorage
            let sessions = Utils.getFromStorage('sessions', []);
            sessions = sessions.filter(s => s.id !== id);
            Utils.saveToStorage('sessions', sessions);
            
            Utils.showNotification('Session deleted successfully', 'success');
            this.loadSessions();
            
        } catch (error) {
            console.error('Error deleting session:', error);
            Utils.showNotification('Failed to delete session', 'error');
        }
    },
    
    // Get mock sessions for demo
    getMockSessions() {
        const subjects = ['Mathematics', 'Science', 'Language Arts', 'History', 'Coding', 'Other'];
        const sessions = [];
        
        for (let i = 1; i <= 34; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            sessions.push({
                id: i,
                subject: subjects[Math.floor(Math.random() * subjects.length)],
                duration: [30, 45, 60, 75, 90, 120][Math.floor(Math.random() * 6)],
                startTime: date.toISOString(),
                quality: Math.floor(Math.random() * 5) + 1,
                completion: [50, 60, 75, 80, 90, 100][Math.floor(Math.random() * 6)],
                notes: ['Great session!', 'Need to review', 'Completed exercises', 'Group study', ''][Math.floor(Math.random() * 5)],
                date: date.toISOString().split('T')[0]
            });
        }
        
        return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }
};

// Make History globally available
window.History = History;