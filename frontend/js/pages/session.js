// Session page functionality
const Session = {
    timer: {
        seconds: 0,
        interval: null,
        running: false
    },
    
    // Initialize session page
    init() {
        this.loadUserData();
        this.initForm();
        this.initTimer();
        this.setupEventListeners();
    },
    
    // Load user data
    loadUserData() {
        Components.loadUserData();
    },
    
    // Initialize form
    initForm() {
        // Initialize date time picker
        Components.initDateTimePicker('startTime');
        
        // Initialize sliders
        Components.initSlider('duration', 'durationValue', ' min');
        Components.initSlider('completion', 'completionValue', '%');
        Components.initSlider('focusLength', 'focusLengthValue', ' min');
        
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
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'inline-flex';
            timerDisplay.classList.add('timer-running');
            
            this.timer.interval = setInterval(() => {
                this.timer.seconds++;
                updateDisplay();
                
                // Update duration slider
                if (durationSlider) {
                    const minutes = Math.floor(this.timer.seconds / 60);
                    if (minutes <= parseInt(durationSlider.max)) {
                        durationSlider.value = minutes;
                        document.getElementById('durationValue').textContent = `${minutes} min`;
                    }
                }
            }, 1000);
        };
        
        // Pause timer
        this.pauseTimer = () => {
            if (!this.timer.running) return;
            
            this.timer.running = false;
            clearInterval(this.timer.interval);
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            timerDisplay.classList.remove('timer-running');
        };
        
        // Stop timer
        this.stopTimer = () => {
            this.timer.running = false;
            clearInterval(this.timer.interval);
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            timerDisplay.classList.remove('timer-running');
            
            // Reset timer
            this.timer.seconds = 0;
            updateDisplay();
        };
        
        updateDisplay(); // Initial display
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Timer buttons
        document.getElementById('startTimerBtn').addEventListener('click', this.startTimer);
        document.getElementById('pauseTimerBtn').addEventListener('click', this.pauseTimer);
        document.getElementById('stopTimerBtn').addEventListener('click', this.stopTimer);
        
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
    
    // Save session
    async saveSession() {
        try {
            const form = document.getElementById('sessionForm');
            const formData = new FormData(form);
            
            const sessionData = {
                subject: document.getElementById('subject').value,
                startTime: document.getElementById('startTime').value,
                duration: parseInt(document.getElementById('duration').value),
                quality: parseInt(document.getElementById('quality').value),
                completion: parseInt(document.getElementById('completion').value),
                notes: document.getElementById('notes').value,
                timerDuration: this.timer.seconds
            };
            
            // Validate
            if (!sessionData.subject) {
                Utils.showNotification('Please select a subject', 'error');
                return;
            }
            
            if (sessionData.quality === 0) {
                Utils.showNotification('Please rate your session quality', 'error');
                return;
            }
            
            // Simulate API call
            Utils.showNotification('Saving session...', 'info');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Save to localStorage for demo
            const sessions = Utils.getFromStorage('sessions', []);
            sessionData.id = sessions.length + 1;
            sessionData.date = new Date().toISOString().split('T')[0];
            sessions.push(sessionData);
            Utils.saveToStorage('sessions', sessions);
            
            Utils.showNotification('Session saved successfully!', 'success');
            this.resetForm();
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error saving session:', error);
            Utils.showNotification('Failed to save session', 'error');
        }
    },
    
    // Reset form
    resetForm() {
        const form = document.getElementById('sessionForm');
        if (form) form.reset();
        
        // Reset timer
        this.stopTimer();
        
        // Reset sliders and star rating
        Components.initDateTimePicker('startTime');
        document.getElementById('duration').value = 60;
        document.getElementById('completion').value = 80;
        document.getElementById('quality').value = 0;
        document.getElementById('notes').value = '';
        
        // Update displays
        Components.initSlider('duration', 'durationValue', ' min');
        Components.initSlider('completion', 'completionValue', '%');
        
        // Reset stars
        document.querySelectorAll('#qualityRating .star').forEach(star => {
            star.classList.remove('active');
        });
        
        Utils.showNotification('Form reset', 'info');
    }
};

// Make Session globally available
window.Session = Session;