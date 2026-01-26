// Reusable components initialization
const Components = {
    // Initialize mobile menu
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                }
            });
        }
    },
    
    // Initialize star ratings
    initStarRating(containerId, hiddenInputId) {
        const container = document.getElementById(containerId);
        const hiddenInput = document.getElementById(hiddenInputId);
        
        if (!container || !hiddenInput) return;
        
        const stars = container.querySelectorAll('.star');
        let currentRating = parseInt(hiddenInput.value) || 0;
        
        // Set initial rating
        stars.forEach(star => {
            const rating = parseInt(star.dataset.rating);
            if (rating <= currentRating) {
                star.classList.add('active');
            }
        });
        
        // Add click event listeners
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                currentRating = rating;
                hiddenInput.value = rating;
                
                // Update star display
                stars.forEach(s => {
                    const sRating = parseInt(s.dataset.rating);
                    s.classList.toggle('active', sRating <= rating);
                });
            });
            
            // Add hover effect
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    const sRating = parseInt(s.dataset.rating);
                    s.classList.toggle('hover', sRating <= rating);
                });
            });
            
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => {
                    s.classList.remove('hover');
                });
            });
        });
    },
    
    // Initialize sliders
    initSlider(sliderId, valueId, suffix = '') {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (!slider || !valueDisplay) return;
        
        const updateValue = () => {
            valueDisplay.textContent = `${slider.value}${suffix}`;
        };
        
        slider.addEventListener('input', updateValue);
        updateValue(); // Initial update
    },
    
    // Initialize date time picker with current time
    initDateTimePicker(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const now = new Date();
        const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        input.value = localTime.toISOString().slice(0, 16);
    },
    
    // Load user data into header
    loadUserData() {
        const user = Auth.getCurrentUser();
        
        // Update header
        const avatarElements = document.querySelectorAll('#userAvatar, #profileAvatar');
        const nameElements = document.querySelectorAll('#userName, #welcomeName, #profileNameDisplay');
        
        avatarElements.forEach(el => {
            if (el && user.name) {
                el.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            }
        });
        
        nameElements.forEach(el => {
            if (el && user.name) {
                el.textContent = user.name.split(' ')[0]; // First name only for welcome
            }
        });
        
        // Update profile page if exists
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileClass = document.getElementById('profileClass');
        const profileGoal = document.getElementById('profileGoal');
        const profileClassDisplay = document.getElementById('profileClassDisplay');
        const profileEmailDisplay = document.getElementById('profileEmailDisplay');
        
        if (profileName && user.name) profileName.value = user.name;
        if (profileEmail && user.email) profileEmail.value = user.email;
        if (profileClass && user.class) profileClass.value = user.class;
        if (profileGoal && user.studyGoal) profileGoal.value = user.studyGoal;
        if (profileClassDisplay && user.class) profileClassDisplay.textContent = user.class;
        if (profileEmailDisplay && user.email) profileEmailDisplay.textContent = user.email;
    }
};

// Make Components globally available
window.Components = Components;