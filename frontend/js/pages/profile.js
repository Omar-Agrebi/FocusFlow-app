// Profile page functionality
const Profile = {
    // Initialize profile page
    init() {
        this.loadData();
        this.setupEventListeners();
    },
    
    // Load profile data
    async loadData() {
        try {
            // Load user data
            Components.loadUserData();
            
            // Load profile stats
            await this.loadProfileStats();
            
            // Load preferences
            await this.loadPreferences();
            
        } catch (error) {
            console.error('Error loading profile data:', error);
            Utils.showNotification('Failed to load profile data', 'error');
        }
    },
    
    // Load profile stats
    async loadProfileStats() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data
        const stats = {
            weeklyGoal: 20,
            currentWeek: 15,
            goalProgress: 75,
            avgQuality: 4.2
        };
        
        // Update UI if elements exist
        const goalElements = document.querySelectorAll('.stat-card:nth-child(1) .stat-value');
        const weekElements = document.querySelectorAll('.stat-card:nth-child(2) .stat-value');
        const progressElements = document.querySelectorAll('.stat-card:nth-child(3) .stat-value');
        const qualityElements = document.querySelectorAll('.stat-card:nth-child(4) .stat-value');
        
        goalElements.forEach(el => el.textContent = `${stats.weeklyGoal}h`);
        weekElements.forEach(el => el.textContent = `${stats.currentWeek}h`);
        progressElements.forEach(el => el.textContent = `${stats.goalProgress}%`);
        qualityElements.forEach(el => el.textContent = stats.avgQuality.toFixed(1));
    },
    
    // Load preferences
    async loadPreferences() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get preferences from localStorage or use defaults
        const preferences = Utils.getFromStorage('preferences', {
            focusLength: 45,
            breakReminders: 'enabled',
            notifications: 'all',
            theme: 'light'
        });
        
        // Update form
        document.getElementById('focusLength').value = preferences.focusLength;
        document.getElementById('breakReminders').value = preferences.breakReminders;
        document.getElementById('notifications').value = preferences.notifications;
        document.getElementById('theme').value = preferences.theme;
        
        // Update slider display
        Components.initSlider('focusLength', 'focusLengthValue', ' min');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProfile();
            });
        }
        
        // Preferences form
        const preferencesForm = document.getElementById('preferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.savePreferences();
            });
        }
    },
    
    // Save profile
    async saveProfile() {
        try {
            const profileData = {
                name: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                class: document.getElementById('profileClass').value,
                studyGoal: parseInt(document.getElementById('profileGoal').value)
            };
            
            // Validate
            if (!profileData.name || !profileData.email) {
                Utils.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!Utils.isValidEmail(profileData.email)) {
                Utils.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            if (profileData.studyGoal < 1 || profileData.studyGoal > 40) {
                Utils.showNotification('Study goal must be between 1 and 40 hours', 'error');
                return;
            }
            
            // Simulate API call
            Utils.showNotification('Updating profile...', 'info');
            
            const result = await Auth.updateProfile(profileData);
            
            if (result.success) {
                // Update display
                Components.loadUserData();
                Utils.showNotification('Profile updated successfully!', 'success');
            } else {
                Utils.showNotification(result.message, 'error');
            }
            
        } catch (error) {
            console.error('Error saving profile:', error);
            Utils.showNotification('Failed to update profile', 'error');
        }
    },
    
    // Save preferences
    async savePreferences() {
        try {
            const preferences = {
                focusLength: parseInt(document.getElementById('focusLength').value),
                breakReminders: document.getElementById('breakReminders').value,
                notifications: document.getElementById('notifications').value,
                theme: document.getElementById('theme').value
            };
            
            // Save to localStorage
            Utils.saveToStorage('preferences', preferences);
            
            // Apply theme if changed
            if (preferences.theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else if (preferences.theme === 'light') {
                document.body.classList.remove('dark-theme');
            } else {
                // Auto theme based on system preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.body.classList.add('dark-theme');
                } else {
                    document.body.classList.remove('dark-theme');
                }
            }
            
            Utils.showNotification('Preferences saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            Utils.showNotification('Failed to save preferences', 'error');
        }
    }
};

// Make Profile globally available
window.Profile = Profile;