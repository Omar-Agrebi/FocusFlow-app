// Session page functionality 
const Session = {
    timer: {
        seconds: 0,
        interval: null,
        running: false
    },
    
    // Initialize session page
    init() {
        this.loadUserData(); // Load user data FIRST
        this.initForm();
        this.initTimer();
        this.setupEventListeners();
    },
    
    // Load user data IMMEDIATELY
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
    
    // Initialize form
    initForm() {
        // Initialize date time picker
        Components.initDateTimePicker('startTime');
        
        // Initialize sliders
        Components.initSlider('duration', 'durationValue', ' min');
        Components.initSlider('completion', 'completionValue', '%');
        
        // Initialize star rating
        Components.initStarRating('qualityRating', 'quality');
    },
    
    // Initialize timer
    initTimer() {
        const timerDisplay = document.getElementById('timerDisplay');
        const startBtn = document.getElementById('startTimerBtn');
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        const durationSlider = document.getElementById('duration');
        
        // Update timer display
        const updateDisplay = () => {
            if (timerDisplay) {
                timerDisplay.textContent = Utils.formatTime(this.timer.seconds);
            }
        };
        
        // Start timer
        this.startTimer = () => {
            if (this.timer.running) return;
            
            this.timer.running = true;
            if (startBtn) startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'inline-flex';
            if (stopBtn) stopBtn.style.display = 'inline-flex';
            if (timerDisplay) timerDisplay.classList.add('timer-running');
            
            this.timer.interval = setInterval(() => {
                this.timer.seconds++;
                updateDisplay();
                
                // Update duration slider based on timer
                if (durationSlider) {
                    const minutes = Math.floor(this.timer.seconds / 60);
                    if (minutes <= parseInt(durationSlider.max)) {
                        durationSlider.value = minutes;
                        const valueDisplay = document.getElementById('durationValue');
                        if (valueDisplay) valueDisplay.textContent = `${minutes} min`;
                    }
                }
            }, 1000);
            
            // Update start time to now when timer starts
            const startTimeInput = document.getElementById('startTime');
            if (startTimeInput) {
                const now = new Date();
                const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
                startTimeInput.value = localTime.toISOString().slice(0, 16);
            }
        };
        
        // Pause timer
        this.pauseTimer = () => {
            if (!this.timer.running) return;
            
            this.timer.running = false;
            clearInterval(this.timer.interval);
            if (startBtn) startBtn.style.display = 'inline-flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (timerDisplay) timerDisplay.classList.remove('timer-running');
        };
        
        // Stop timer
        this.stopTimer = () => {
            this.timer.running = false;
            clearInterval(this.timer.interval);
            if (startBtn) startBtn.style.display = 'inline-flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'none';
            if (timerDisplay) timerDisplay.classList.remove('timer-running');
            
            // Reset timer
            this.timer.seconds = 0;
            updateDisplay();
        };
        
        updateDisplay(); // Initial display
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Timer buttons
        const startBtn = document.getElementById('startTimerBtn');
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const stopBtn = document.getElementById('stopTimerBtn');
        
        if (startBtn) startBtn.addEventListener('click', this.startTimer);
        if (pauseBtn) pauseBtn.addEventListener('click', this.pauseTimer);
        if (stopBtn) stopBtn.addEventListener('click', this.stopTimer);
        
        // Form submission
        const form = document.getElementById('sessionForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSession();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }
    },
    
    // Save session - TO REAL API
    async saveSession() {
        try {
            const userId = localStorage.getItem('userId') || 1;
            
            // Get form values
            const subject = document.getElementById('subject').value;
            const startTime = document.getElementById('startTime').value;
            const durationMinutes = parseInt(document.getElementById('duration').value);
            const quality = parseInt(document.getElementById('quality').value) || null;
            const completion = parseInt(document.getElementById('completion').value) || null;
            const notes = document.getElementById('notes').value || '';
            
            // Validate
            if (!subject) {
                Utils.showNotification('Please select a subject', 'error');
                return;
            }
            
            // Calculate end time
            const startDate = new Date(startTime);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            
            // Prepare session data for API
            const sessionData = {
                user_id: userId,
                subject: subject,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                duration_minutes: durationMinutes,
                quality: quality,
                percentage_completion: completion,
                notes: notes
            };
            
            // If timer was used, use timer duration
            if (this.timer.seconds > 0) {
                const timerMinutes = Math.floor(this.timer.seconds / 60);
                if (timerMinutes > 0) {
                    sessionData.duration_minutes = timerMinutes;
                    const timerEndDate = new Date(startDate.getTime() + timerMinutes * 60000);
                    sessionData.end_time = timerEndDate.toISOString();
                }
            }
            
            Utils.showNotification('Saving session...', 'info');
            
            // CALL REAL API
            const savedSession = await API.createSession(sessionData);
            
            // Show success
            Utils.showNotification('Session saved successfully!', 'success');
            
            // Reset form
            this.resetForm();
            
            // Stop timer if running
            if (this.timer.running) {
                this.stopTimer();
            }
            
            // Optionally redirect to dashboard or history
            setTimeout(() => {
                // Update dashboard if we're still on the page
                if (typeof Dashboard !== 'undefined' && Dashboard.loadData) {
                    Dashboard.loadData();
                }
                
                // Or navigate to dashboard
                const dashboardLink = document.querySelector('.nav-link[data-page="dashboard"]');
                if (dashboardLink) {
                    dashboardLink.click();
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error saving session:', error);
            
            // Fallback to localStorage if API fails
            Utils.showNotification('API unavailable, saving locally...', 'warning');
            await this.saveSessionToLocalStorage();
        }
    },
    
    // Fallback: Save to localStorage
    async saveSessionToLocalStorage() {
        try {
            const sessions = Utils.getFromStorage('sessions', []);
            
            const sessionData = {
                id: sessions.length + 1,
                subject: document.getElementById('subject').value,
                start_time: new Date().toISOString(),
                duration_minutes: parseInt(document.getElementById('duration').value),
                quality: parseInt(document.getElementById('quality').value) || null,
                percentage_completion: parseInt(document.getElementById('completion').value) || null,
                notes: document.getElementById('notes').value || '',
                user_id: localStorage.getItem('userId') || 1
            };
            
            sessions.push(sessionData);
            Utils.saveToStorage('sessions', sessions);
            
            Utils.showNotification('Session saved locally (API unavailable)', 'success');
            this.resetForm();
            
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            Utils.showNotification('Failed to save session', 'error');
        }
    },
    
    // Reset form
    resetForm() {
        const form = document.getElementById('sessionForm');
        if (form) form.reset();
        
        // Reset timer
        if (this.timer.running) {
            this.stopTimer();
        }
        
        // Reset form to defaults
        Components.initDateTimePicker('startTime');
        
        const durationSlider = document.getElementById('duration');
        const completionSlider = document.getElementById('completion');
        
        if (durationSlider) {
            durationSlider.value = 60;
            const durationValue = document.getElementById('durationValue');
            if (durationValue) durationValue.textContent = '60 min';
        }
        
        if (completionSlider) {
            completionSlider.value = 80;
            const completionValue = document.getElementById('completionValue');
            if (completionValue) completionValue.textContent = '80%';
        }
        
        // Reset quality stars
        const qualityInput = document.getElementById('quality');
        if (qualityInput) qualityInput.value = 0;
        
        const stars = document.querySelectorAll('#qualityRating .star');
        if (stars) {
            stars.forEach(star => star.classList.remove('active'));
        }
        
        // Reset notes
        const notes = document.getElementById('notes');
        if (notes) notes.value = '';
        
        Utils.showNotification('Form reset', 'info');
    }
};

// Make Session globally available
window.Session = Session;