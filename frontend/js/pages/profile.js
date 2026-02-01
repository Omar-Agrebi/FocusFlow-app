// Profile page functionality
const Profile = {
    // Initialize profile page
    init() {
        this.loadUserData(); // Load user data FIRST
        this.setupEventListeners();
        this.loadProfileData(); // Then load other data
    },
    
    // Load user data IMMEDIATELY (match Dashboard pattern)
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

                // Update user header (like Dashboard does)
                this.updateUserHeader({ name: displayName });
                
                // Also update profile header with full user object
                this.updateProfileHeader(user);
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },
    
    // Update user header immediately (like Dashboard)
    updateUserHeader(user) {
        // Update user avatar in main header
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.textContent = initials;
            userAvatar.classList.remove('loading-placeholder');
        }
        
        // Update user name in main header
        const userName = document.getElementById('userName');
        if (userName && user.name) {
            userName.textContent = user.name;
            userName.classList.remove('loading-placeholder');
        }
    },
    
    // Update profile header immediately
    updateProfileHeader(user) {
        // Get display name from user object
        const displayName = user.username || user.name || user.email;
        
        if (!displayName) {
            console.warn('No display name found for user:', user);
            return;
        }
        
        // Update profile name display
        const profileNameDisplay = document.getElementById('profileNameDisplay');
        if (profileNameDisplay) {
            profileNameDisplay.textContent = displayName.split(' ')[0];
            profileNameDisplay.classList.remove('loading-placeholder');
        }
        
        // Update profile class display
        const profileClassDisplay = document.getElementById('profileClassDisplay');
        if (profileClassDisplay) {
            // Check for class or user_class property
            const userClass = user.class || user.user_class;
            if (userClass) {
                profileClassDisplay.textContent = userClass;
            } else {
                profileClassDisplay.textContent = 'Not set';
            }
            profileClassDisplay.classList.remove('loading-placeholder');
        }
        
        // Update profile email display
        const profileEmailDisplay = document.getElementById('profileEmailDisplay');
        if (profileEmailDisplay && user.email) {
            profileEmailDisplay.textContent = user.email;
            profileEmailDisplay.classList.remove('loading-placeholder');
        }
        
        // Update profile avatar
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar && displayName) {
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            profileAvatar.textContent = initials;
            profileAvatar.classList.remove('loading-placeholder');
        }
    },
    
    // Update form fields immediately
    updateFormFields(user) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileClass = document.getElementById('profileClass');
        const profileGoal = document.getElementById('profileGoal');
        
        if (profileName && user.name) profileName.value = user.name;
        if (profileEmail && user.email) profileEmail.value = user.email;
        if (profileClass && user.class) profileClass.value = user.class;
        if (profileGoal && user.studyGoal) profileGoal.value = user.studyGoal;
    },
    
    // Load profile data
    async loadProfileData() {
        try {
            // Load profile stats
            await this.loadProfileStats();
            
            // Load preferences
            await this.loadPreferences();
            
        } catch (error) {
            console.error('Error loading profile data:', error);
            Utils.showNotification('Failed to load profile data', 'error');
        }
    },
    
    // Load profile stats - FROM REAL DATA
    async loadProfileStats() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            
            // Get user profile
            const userProfile = await API.getProfile({ user_id: userId });
            
            // Get user sessions for stats
            const sessions = await API.getSessions({ user_id: userId });
            
            // Calculate stats from real data
            const stats = this.calculateProfileStats(userProfile, sessions);
            
            // Update UI
            this.updateStatsUI(stats);
            
        } catch (error) {
            console.log('Using fallback stats:', error);
            // Fallback to localStorage or default values
            const user = Auth.getCurrentUser();
            const stats = {
                weeklyGoal: user.studyGoal || 20,
                currentWeek: 0,
                goalProgress: 0,
                avgQuality: 0,
                totalSessions: 0,
                totalHours: 0
            };
            this.updateStatsUI(stats);
        }
    },
    
    // Calculate profile stats from real data
    calculateProfileStats(userProfile, sessions) {
        // This week's sessions
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        
        const thisWeekSessions = sessions.filter(session => 
            new Date(session.start_time) >= weekStart
        );
        
        const totalMinutesThisWeek = thisWeekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        const hoursThisWeek = totalMinutesThisWeek / 60;
        const weeklyGoal = userProfile.studyGoal || 20;
        
        let avgQuality = 0;
        if (sessions.length > 0) {
            avgQuality = sessions.reduce((sum, s) => sum + (s.quality || 0), 0) / sessions.length;
        }
        
        return {
            weeklyGoal: weeklyGoal,
            currentWeek: hoursThisWeek.toFixed(1),
            goalProgress: weeklyGoal > 0 ? Math.min(100, Math.round((hoursThisWeek / weeklyGoal) * 100)) : 0,
            avgQuality: avgQuality.toFixed(1),
            totalSessions: sessions.length,
            totalHours: (sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60).toFixed(1)
        };
    },
    
    // Update stats UI
    updateStatsUI(stats) {
        const goalElements = document.querySelectorAll('.stat-card:nth-child(1) .stat-value');
        const weekElements = document.querySelectorAll('.stat-card:nth-child(2) .stat-value');
        const progressElements = document.querySelectorAll('.stat-card:nth-child(3) .stat-value');
        const qualityElements = document.querySelectorAll('.stat-card:nth-child(4) .stat-value');
        
        goalElements.forEach(el => el.textContent = `${stats.weeklyGoal}h`);
        weekElements.forEach(el => el.textContent = `${stats.currentWeek}h`);
        progressElements.forEach(el => el.textContent = `${stats.goalProgress}%`);
        qualityElements.forEach(el => el.textContent = stats.avgQuality);
    },
    
    // Load preferences - FROM REAL API
    async loadPreferences() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            
            // Get user profile (which should include preferences)
            const userProfile = await API.getProfile({ user_id: userId });
            
            // Update form with real data
            this.updateProfileForm(userProfile);
            
        } catch (error) {
            console.log('Using fallback preferences:', error);
            
            // Fallback to localStorage or user data
            const user = Auth.getCurrentUser();
            
            // Update form fields if they exist
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileClass = document.getElementById('profileClass');
            const profileGoal = document.getElementById('profileGoal');
            
            if (profileName && user.name) profileName.value = user.name;
            if (profileEmail && user.email) profileEmail.value = user.email;
            if (profileClass && user.user_class) profileClass.value = user.user_class;
            if (profileGoal && user.studyGoal) profileGoal.value = user.studyGoal;
            
            // Load preferences from localStorage as fallback
            const preferences = Utils.getFromStorage('preferences', {
                focusLength: 45,
                breakReminders: 'enabled'
            });
            
            // Update sliders
            Components.initSlider('focusLength', 'focusLengthValue', ' min');
            document.getElementById('focusLength').value = preferences.focusLength;
            document.getElementById('breakReminders').value = preferences.breakReminders;
        }
    },
    
    // Update profile form with real data
    updateProfileForm(userProfile) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileClass = document.getElementById('profileClass');
        const profileGoal = document.getElementById('profileGoal');
        
        if (profileName) profileName.value = userProfile.username || '';
        if (profileEmail) profileEmail.value = userProfile.email || '';
        if (profileClass) profileClass.value = userProfile.user_class || '';
        if (profileGoal) profileGoal.value = userProfile.study_goal || 20;
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
    
    // Save profile - TO REAL API
    async saveProfile() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            
            const profileData = {
                id: userId,
                username: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                user_class: document.getElementById('profileClass').value,
                study_goal: parseInt(document.getElementById('profileGoal').value)
            };
            
            // Validate
            if (!profileData.username || !profileData.email) {
                Utils.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (!Utils.isValidEmail(profileData.email)) {
                Utils.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            if (profileData.study_goal < 1 || profileData.study_goal > 40) {
                Utils.showNotification('Study goal must be between 1 and 40 hours', 'error');
                return;
            }
            
            Utils.showNotification('Updating profile...', 'info');
            
            // CALL REAL API
            try {
                await API.updateProfile(profileData);
                
                // Update local storage
                const user = Auth.getCurrentUser();
                user.name = profileData.username;
                user.email = profileData.email;
                user.user_class = profileData.user_class;
                user.studyGoal = profileData.study_goal;
                Utils.saveToStorage('user', user);
                
                // Update UI (reload user data)
                this.loadUserData();
                Utils.showNotification('Profile updated successfully!', 'success');
                
            } catch (apiError) {
                // If API fails, save to localStorage as fallback
                console.log('API update failed, saving locally:', apiError);
                const user = Auth.getCurrentUser();
                Object.assign(user, profileData);
                Utils.saveToStorage('user', user);
                Utils.showNotification('Profile saved locally (API unavailable)', 'warning');
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
            
            Utils.showNotification('Preferences saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            Utils.showNotification('Failed to save preferences', 'error');
        }
    }
};

// Make Profile globally available
window.Profile = Profile;