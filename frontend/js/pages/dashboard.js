// Dashboard page functionality
const Dashboard = {
    // Initialize dashboard
    init() {
        this.loadUserData(); // Load user data FIRST
        this.setupEventListeners();
        this.loadDashboardData(); // Then load other data
    },

    // Setup event listeners
    setupEventListeners() {
        // Quick action cards
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url') ||
                    card.onclick?.toString().match(/href='([^']+)'/)?.[1];
                if (url) {
                    window.location.href = url;
                }
            });
        });

        // Refresh button (optional)
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }
    },

    // Load user data IMMEDIATELY (no async)
    loadUserData() {
        try {
            const user = Auth.getCurrentUser();

            if (user) {
                const displayName = user.username || user.email;

                const welcomeName = document.getElementById('welcomeName');
                if (welcomeName) {
                    welcomeName.textContent = displayName.split(' ')[0];
                    welcomeName.classList.remove('loading-placeholder');
                }

                this.updateUserHeader({ name: displayName });
            }

        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    // Update user header immediately
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

    // Load other dashboard data (stats, sessions, chart)
    async loadDashboardData() {
        try {
            // Show loading state for dynamic data
            this.showLoading(true);

            // Load data in parallel
            await Promise.all([
                this.loadDashboardStats(),
                this.loadRecentSessions(),
                this.loadWeeklyChartData()
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    },

    // Load dashboard stats from API
    async loadDashboardStats() {
        try {
            // REAL API CALL
            const stats = await API.getDashboardStats();

            // Update stats in UI
            this.updateStatsUI(stats);

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            // Show placeholder data
            this.showPlaceholderStats();
        }
    },

    // Update stats UI
    updateStatsUI(stats) {
        // Total Time Today
        const totalTimeElement = document.getElementById('totalTime');
        if (totalTimeElement && stats.total_time_today) {
            totalTimeElement.textContent = this.formatDuration(stats.total_time_today);
        }

        // Sessions Count Today
        const sessionsCountElement = document.getElementById('sessionsCount');
        if (sessionsCountElement && stats.sessions_today !== undefined) {
            sessionsCountElement.textContent = stats.sessions_today;
        }

        // Focus Score
        const focusScoreElement = document.getElementById('focusScore');
        if (focusScoreElement && stats.avg_focus_score !== undefined) {
            focusScoreElement.textContent = `${stats.avg_focus_score.toFixed(1)}/10`;
        }

        // Weekly Goal Progress
        const goalProgressElement = document.getElementById('goalProgress');
        if (goalProgressElement && stats.weekly_goal_progress !== undefined) {
            goalProgressElement.textContent = `${stats.weekly_goal_progress}%`;
        }
    },

    // Show placeholder stats if API fails
    showPlaceholderStats() {
        const stats = {
            total_time_today: 0,
            sessions_today: 0,
            avg_focus_score: 0,
            weekly_goal_progress: 0
        };

        this.updateStatsUI(stats);
    },

    // Load recent sessions from API
    async loadRecentSessions() {
        try {
            //  REAL API CALL - Get recent sessions
            const sessions = await API.getSessions({
                limit: 5,
                order_by: 'start_time',
                order_dir: 'desc'
            });

            // Update recent sessions UI
            this.updateRecentSessionsUI(sessions);

        } catch (error) {
            console.error('Error loading recent sessions:', error);
            this.showEmptyRecentSessions();
        }
    },

    // Update recent sessions UI
    updateRecentSessionsUI(sessions) {
        const container = document.getElementById('recentSessions');
        if (!container) return;

        if (!sessions || sessions.length === 0) {
            this.showEmptyRecentSessions();
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="session-card ${this.getSessionStatusClass(session)}">
                <div class="session-header">
                    <div class="session-title">${session.subject || 'No Subject'}</div>
                    <div class="session-duration">${this.formatDuration(session.duration)}</div>
                </div>
                <div class="session-meta">
                    <span class="session-time">
                        <i class="fas fa-clock"></i> 
                        ${Utils.formatDateTime(session.start_time)}
                    </span>
                    <span class="session-quality">
                        <i class="fas fa-star"></i> 
                        ${session.quality || 0}/5
                    </span>
                </div>
                ${session.notes ? `
                    <div class="session-notes">
                        <i class="fas fa-sticky-note"></i> ${session.notes}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    // Show empty state for recent sessions
    showEmptyRecentSessions() {
        const container = document.getElementById('recentSessions');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open empty-icon"></i>
                <h3>No Recent Sessions</h3>
                <p>Start your first study session to see it here!</p>
                <a href="session.html" class="btn btn-primary btn-sm" onclick="event.preventDefault(); window.location.href='session.html';">
                    <i class="fas fa-plus"></i> Start New Session
                </a>
            </div>
        `;
    },

    // Load weekly chart data from API
    async loadWeeklyChartData() {
        try {
            //  REAL API CALL - Get weekly stats
            const weeklyData = await this.getWeeklyStudyData();

            // Update chart UI
            this.updateWeeklyChartUI(weeklyData);

        } catch (error) {
            console.error('Error loading weekly chart data:', error);
            this.showEmptyChart();
        }
    },

    // Get weekly study data from API
    async getWeeklyStudyData() {
        try {
            // You might need to create a specific endpoint for weekly data
            // For now, we'll calculate from sessions
            const sessions = await API.getSessions({
                limit: 100,
                order_by: 'start_time',
                order_dir: 'desc'
            });

            return this.calculateWeeklyData(sessions);

        } catch (error) {
            console.error('Error getting weekly data:', error);
            return this.getDefaultWeeklyData();
        }
    },

    // Calculate weekly data from sessions
    calculateWeeklyData(sessions) {
        // Get last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weeklyData = days.map(day => ({ day, hours: 0 }));

        if (!sessions || sessions.length === 0) {
            return weeklyData;
        }

        // Calculate hours for each day
        sessions.forEach(session => {
            const sessionDate = new Date(session.start_time);
            const dayIndex = (sessionDate.getDay() + 6) % 7; // Monday = 0

            if (dayIndex >= 0 && dayIndex < 7) {
                weeklyData[dayIndex].hours += (session.duration || 0) / 60;
            }
        });

        return weeklyData;
    },

    // Get default weekly data (fallback)
    getDefaultWeeklyData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({ day, hours: 0 }));
    },

    // Update weekly chart UI
    updateWeeklyChartUI(weeklyData) {
        const container = document.getElementById('weeklyChart');
        if (!container) return;

        // Find max for scaling
        const maxHours = Math.max(...weeklyData.map(d => d.hours), 1); // At least 1 to avoid division by zero

        container.innerHTML = weeklyData.map(data => {
            const height = (data.hours / maxHours) * 100;
            const hoursDisplay = data.hours > 0 ? data.hours.toFixed(1) : '0';

            return `
                <div class="chart-column">
                    <div class="chart-bar" style="height: ${height}%">
                        <div class="chart-value">${hoursDisplay}h</div>
                    </div>
                    <div class="chart-label">${data.day}</div>
                </div>
            `;
        }).join('');
    },

    // Show empty chart
    showEmptyChart() {
        const container = document.getElementById('weeklyChart');
        if (!container) return;

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        container.innerHTML = days.map(day => `
            <div class="chart-column">
                <div class="chart-bar" style="height: 0%">
                    <div class="chart-value">0h</div>
                </div>
                <div class="chart-label">${day}</div>
            </div>
        `).join('');
    },

    // Format duration (helper function)
    formatDuration(minutes) {
        return Utils.formatDuration(minutes);
    },

    // Get session status class
    getSessionStatusClass(session) {
        if (session.completion >= 90) return 'completed';
        if (session.completion >= 50) return 'in-progress';
        return 'not-started';
    },

    // Show/hide loading state
    showLoading(isLoading) {
        const loadingIndicator = document.getElementById('loadingIndicator');

        if (isLoading) {
            // Create loading indicator if it doesn't exist
            if (!loadingIndicator) {
                const indicator = document.createElement('div');
                indicator.id = 'loadingIndicator';
                indicator.className = 'loading-indicator';
                indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading dashboard...';
                document.querySelector('.container').prepend(indicator);
            }
        } else {
            // Remove loading indicator
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
    },

    // Check for first login (after registration)
    checkFirstLogin() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('firstLogin') === 'true') {
            Utils.showNotification('Welcome to StudyFlow! Start tracking your study sessions.', 'success');

            // Clear the parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;