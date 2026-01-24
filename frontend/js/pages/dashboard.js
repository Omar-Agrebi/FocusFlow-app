// Dashboard page functionality
const Dashboard = {
    // Initialize dashboard
    init() {
        this.loadData();
        this.setupEventListeners();
    },
    
    // Load dashboard data
    async loadData() {
        try {
            // Load user data
            Components.loadUserData();
            
            // Load dashboard stats
            await this.loadStats();
            
            // Load recent sessions
            await this.loadRecentSessions();
            
            // Load weekly chart
            await this.loadWeeklyChart();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showNotification('Failed to load dashboard data', 'error');
        }
    },
    
    // Load dashboard stats - FROM REAL API
    async loadStats() {
        try {
            // TRY REAL API FIRST
            const userId = localStorage.getItem('userId') || 1;
            
            // Get stats from your backend
            const stats = await API.getDashboardStats({ user_id: userId });
            
            // Update UI with real data
            document.getElementById('totalTime').textContent = Utils.formatDuration(stats.total_time || 0);
            document.getElementById('sessionsCount').textContent = stats.sessions_count || 0;
            document.getElementById('focusScore').textContent = `${stats.avg_quality || 0}/5`;
            document.getElementById('goalProgress').textContent = `${stats.total_completion || 0}%`;
            
        } catch (error) {
            console.log('Using fallback stats calculation:', error);
            
            // FALLBACK: Calculate stats from sessions
            const userId = localStorage.getItem('userId') || 1;
            const sessions = await API.getSessions({ user_id: userId });
            
            if (sessions.length > 0) {
                const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
                const avgQuality = sessions.reduce((sum, s) => sum + (s.quality || 0), 0) / sessions.length;
                const avgCompletion = sessions.reduce((sum, s) => sum + (s.percentage_completion || 0), 0) / sessions.length;
                
                document.getElementById('totalTime').textContent = Utils.formatDuration(totalMinutes);
                document.getElementById('sessionsCount').textContent = sessions.length;
                document.getElementById('focusScore').textContent = `${avgQuality.toFixed(1)}/5`;
                document.getElementById('goalProgress').textContent = `${avgCompletion.toFixed(0)}%`;
            } else {
                // No sessions yet
                document.getElementById('totalTime').textContent = '0h';
                document.getElementById('sessionsCount').textContent = '0';
                document.getElementById('focusScore').textContent = '0/5';
                document.getElementById('goalProgress').textContent = '0%';
            }
        }
    },
    
    // Load recent sessions - FROM REAL API
    async loadRecentSessions() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            const sessions = await API.getSessions({ user_id: userId });
            
            // Get most recent 3 sessions
            const recentSessions = sessions
                .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                .slice(0, 3);
            
            // Update UI
            const container = document.getElementById('recentSessions');
            if (container) {
                if (recentSessions.length === 0) {
                    container.innerHTML = '<div class="empty-state">No sessions yet. Start your first study session!</div>';
                    return;
                }
                
                container.innerHTML = recentSessions.map(session => `
                    <div class="session-card">
                        <div class="session-header">
                            <div class="session-title">${session.subject}</div>
                            <div class="session-duration">${Utils.formatDuration(session.duration_minutes)}</div>
                        </div>
                        <div class="session-meta">
                            <span class="session-time">
                                <i class="fas fa-clock"></i> ${Utils.formatDateTime(session.start_time)}
                            </span>
                            <span class="session-quality">
                                ${Utils.generateStarRating(session.quality || 0)}
                            </span>
                        </div>
                        ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent sessions:', error);
            const container = document.getElementById('recentSessions');
            if (container) {
                container.innerHTML = '<div class="error-state">Failed to load sessions</div>';
            }
        }
    },
    
    // Load weekly chart - FROM REAL DATA
    async loadWeeklyChart() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            const sessions = await API.getSessions({ user_id: userId });
            
            if (sessions.length === 0) {
                this.renderEmptyChart();
                return;
            }
            
            // Group sessions by day of the week
            const weekData = this.calculateWeeklyData(sessions);
            
            // Update UI
            this.renderWeeklyChart(weekData);
            
        } catch (error) {
            console.error('Error loading weekly chart:', error);
            this.renderEmptyChart();
        }
    },
    
    // Calculate weekly data from sessions
    calculateWeeklyData(sessions) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekData = days.map(day => ({ day, hours: 0 }));
        
        sessions.forEach(session => {
            const date = new Date(session.start_time);
            const dayIndex = date.getDay(); // 0 = Sunday
            const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust to start with Monday
            
            const data = weekData.find(d => d.day === dayName);
            if (data) {
                data.hours += session.duration_minutes / 60;
            }
        });
        
        return weekData;
    },
    
    // Render weekly chart
    renderWeeklyChart(weekData) {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        // Find max for scaling
        const maxHours = Math.max(...weekData.map(d => d.hours), 1); // Minimum 1 hour for scaling
        
        container.innerHTML = weekData.map(data => {
            const height = (data.hours / maxHours) * 100;
            const hoursText = data.hours > 0 ? `${data.hours.toFixed(1)}h` : '';
            
            return `
                <div class="chart-column">
                    <div class="chart-bar" style="height: ${height}%">
                        ${hoursText ? `<div class="chart-value">${hoursText}</div>` : ''}
                    </div>
                    <div class="chart-label">${data.day}</div>
                </div>
            `;
        }).join('');
    },
    
    // Render empty chart
    renderEmptyChart() {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        container.innerHTML = days.map(day => `
            <div class="chart-column">
                <div class="chart-bar" style="height: 10%"></div>
                <div class="chart-label">${day}</div>
            </div>
        `).join('');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Quick action buttons
        const startSessionBtn = document.getElementById('startSessionBtn');
        if (startSessionBtn) {
            startSessionBtn.addEventListener('click', () => {
                // Navigate to log session page
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                
                document.querySelector('.nav-link[data-page="log-session"]').classList.add('active');
                document.getElementById('log-session').classList.add('active');
            });
        }
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;