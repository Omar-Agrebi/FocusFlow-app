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
            this.loadUserData();
            
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
    
    // Load user data
    loadUserData() {
        Components.loadUserData();
    },
    
    // Load dashboard stats
    async loadStats() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const stats = {
            totalTime: '4h 30m',
            sessionsCount: 5,
            focusScore: '8.5/10',
            goalProgress: '75%'
        };
        
        // Update UI
        document.getElementById('totalTime').textContent = stats.totalTime;
        document.getElementById('sessionsCount').textContent = stats.sessionsCount;
        document.getElementById('focusScore').textContent = stats.focusScore;
        document.getElementById('goalProgress').textContent = stats.goalProgress;
    },
    
    // Load recent sessions
    async loadRecentSessions() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data
        const sessions = [
            {
                id: 1,
                subject: 'Mathematics',
                duration: 90,
                startTime: new Date(Date.now() - 2 * 3600000).toISOString(),
                quality: 4,
                completion: 95,
                notes: 'Calculus problems'
            },
            {
                id: 2,
                subject: 'Science',
                duration: 60,
                startTime: new Date(Date.now() - 5 * 3600000).toISOString(),
                quality: 5,
                completion: 100,
                notes: 'Chemistry lab'
            },
            {
                id: 3,
                subject: 'Coding',
                duration: 120,
                startTime: new Date(Date.now() - 8 * 3600000).toISOString(),
                quality: 3,
                completion: 80,
                notes: 'JavaScript practice'
            }
        ];
        
        // Update UI
        const container = document.getElementById('recentSessions');
        if (container) {
            container.innerHTML = sessions.map(session => `
                <div class="session-card">
                    <div class="session-header">
                        <div class="session-title">${session.subject}</div>
                        <div class="session-duration">${Utils.formatDuration(session.duration)}</div>
                    </div>
                    <div class="session-meta">
                        <span class="session-subject">
                            <i class="fas fa-clock"></i> ${Utils.formatDateTime(session.startTime)}
                        </span>
                        <span class="session-quality">
                            <i class="fas fa-star"></i> ${session.quality}/5
                        </span>
                    </div>
                    <div class="session-notes">${session.notes}</div>
                </div>
            `).join('');
        }
    },
    
    // Load weekly chart
    async loadWeeklyChart() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data for the week
        const weekData = [
            { day: 'Mon', hours: 2.5 },
            { day: 'Tue', hours: 3.0 },
            { day: 'Wed', hours: 1.5 },
            { day: 'Thu', hours: 2.0 },
            { day: 'Fri', hours: 3.5 },
            { day: 'Sat', hours: 4.0 },
            { day: 'Sun', hours: 1.0 }
        ];
        
        // Find max for scaling
        const maxHours = Math.max(...weekData.map(d => d.hours));
        
        // Update UI
        const container = document.getElementById('weeklyChart');
        if (container) {
            container.innerHTML = weekData.map(data => {
                const height = (data.hours / maxHours) * 100;
                return `
                    <div class="chart-column">
                        <div class="chart-bar" style="height: ${height}%">
                            <div class="chart-value">${data.hours}h</div>
                        </div>
                        <div class="chart-label">${data.day}</div>
                    </div>
                `;
            }).join('');
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Quick action cards
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const url = card.getAttribute('data-url') || card.onclick.toString().match(/href='([^']+)'/)?.[1];
                if (url) {
                    window.location.href = url;
                }
            });
        });
    }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;