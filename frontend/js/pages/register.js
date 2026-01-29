// Register page functionality
const Register = {
    // Initialize register page
    init() {
        this.setupEventListeners();
        this.initSlider();
        this.initPasswordStrength();
        this.loadRememberedData();
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegistration();
            });
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Password strength check
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.updatePasswordStrength();
            });
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
<<<<<<< HEAD


    },

=======
        

    },
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Initialize slider
    initSlider() {
        const slider = document.getElementById('studyGoal');
        const valueDisplay = document.getElementById('studyGoalValue');
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        if (slider && valueDisplay) {
            const updateValue = () => {
                valueDisplay.textContent = `${slider.value} hours`;
            };
<<<<<<< HEAD

=======
            
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
            slider.addEventListener('input', updateValue);
            updateValue(); // Initial update
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Initialize password strength indicator
    initPasswordStrength() {
        // Create password strength indicator if it doesn't exist
        const passwordGroup = document.getElementById('password')?.closest('.form-group');
        if (passwordGroup && !document.getElementById('passwordStrength')) {
            const strengthHTML = `
                <div class="password-strength">
                    <div>Password strength: <span id="strengthText">None</span></div>
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                </div>
            `;
            passwordGroup.insertAdjacentHTML('beforeend', strengthHTML);
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Load remembered data (like partial form saves)
    loadRememberedData() {
        // You could implement auto-save of form data here
        // For now, just focus on email field
        const savedEmail = Utils.getFromStorage('register_email_draft');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Update password strength indicator
    updatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthText = document.getElementById('strengthText');
        const strengthFill = document.getElementById('strengthFill');
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        if (!password) {
            strengthText.textContent = 'None';
            strengthFill.className = 'strength-fill';
            strengthFill.style.width = '0%';
            return;
        }
<<<<<<< HEAD

        // Calculate password strength
        let strength = 0;

        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

=======
        
        // Calculate password strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Character variety checks
        if (/[a-z]/.test(password)) strength += 1; // lowercase
        if (/[A-Z]/.test(password)) strength += 1; // uppercase
        if (/[0-9]/.test(password)) strength += 1; // numbers
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // special chars
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Determine strength level
        if (strength <= 2) {
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--danger-red)';
            strengthFill.className = 'strength-fill weak';
        } else if (strength <= 4) {
            strengthText.textContent = 'Fair';
            strengthText.style.color = 'var(--warning-orange)';
            strengthFill.className = 'strength-fill fair';
        } else {
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success-green)';
            strengthFill.className = 'strength-fill strong';
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Validate password match
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        if (confirmPassword && password !== confirmPassword) {
            confirmInput.classList.add('error');
            return false;
        } else {
            confirmInput.classList.remove('error');
            return true;
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Validate form data
    validateForm() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('terms').checked;
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Clear previous errors
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });
<<<<<<< HEAD

        let isValid = true;

=======
        
        let isValid = true;
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // First name validation
        if (!firstName) {
            document.getElementById('firstName').classList.add('error');
            isValid = false;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Last name validation
        if (!lastName) {
            document.getElementById('lastName').classList.add('error');
            isValid = false;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Email validation
        if (!email) {
            document.getElementById('email').classList.add('error');
            isValid = false;
        } else if (!Utils.isValidEmail(email)) {
            document.getElementById('email').classList.add('error');
            Utils.showNotification('Please enter a valid email address', 'error');
            return false;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Password validation
        if (password.length < 8) {
            document.getElementById('password').classList.add('error');
            Utils.showNotification('Password must be at least 8 characters long', 'error');
            return false;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Password match validation
        if (!this.validatePasswordMatch()) {
            document.getElementById('confirmPassword').classList.add('error');
            Utils.showNotification('Passwords do not match', 'error');
            return false;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Terms validation
        if (!termsChecked) {
            Utils.showNotification('You must agree to the Terms of Service', 'error');
            return false;
        }
<<<<<<< HEAD

        if (!isValid) {
            Utils.showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    },

=======
        
        if (!isValid) {
            Utils.showNotification('Please fill in all required fields', 'error');
        }
        
        return isValid;
    },
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Update slider display
    updateSliderDisplay() {
        const slider = document.getElementById('studyGoal');
        const valueDisplay = document.getElementById('studyGoalValue');
        if (slider && valueDisplay) {
            valueDisplay.textContent = `${slider.value} hours`;
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Handle registration - CORRECTED TO USE REAL API
    async handleRegistration() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }
<<<<<<< HEAD

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        // Collect form data
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const classGrade = document.getElementById('classGrade').value;
        const studyGoal = parseInt(document.getElementById('studyGoal').value);
<<<<<<< HEAD
        const birthdate = document.getElementById('birthdate').value;
        const gender = document.getElementById('gender').value;

=======
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        const userData = {
            username: `${firstName} ${lastName}`,
            email: email,
            password: password,
            user_class: classGrade,
<<<<<<< HEAD
            gender: gender,
            birthdate: birthdate
        };

=======
            gender: null,
            age: null
        };
        
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
        try {
            // Show loading
            const submitBtn = document.querySelector('#registerForm button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

            const result = await Auth.register(userData);
<<<<<<< HEAD

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                Utils.showNotification('Account created successfully! Redirecting to dashboard...', 'success');

=======
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (result.success) {
                Utils.showNotification('Account created successfully! Redirecting to dashboard...', 'success');
                
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
                // Redirect to dashboard after registration
                setTimeout(() => {
                    window.location.href = 'dashboard.html?firstLogin=true';
                }, 1500);
            } else {
                Utils.showNotification(result.message, 'error');
            }
<<<<<<< HEAD

        } catch (error) {
            console.error('Registration error:', error);
            Utils.showNotification('An unexpected error occurred during registration', 'error');

=======
            
        } catch (error) {
            console.error('Registration error:', error);
            Utils.showNotification('An unexpected error occurred during registration', 'error');
            
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
            // Reset button
            const submitBtn = document.querySelector('#registerForm button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            submitBtn.disabled = false;
        }
    },
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Load form draft
    loadFormDraft() {
        const draft = Utils.getFromStorage('register_form_draft');
        if (draft) {
            document.getElementById('firstName').value = draft.firstName || '';
            document.getElementById('lastName').value = draft.lastName || '';
            document.getElementById('email').value = draft.email || '';
            document.getElementById('classGrade').value = draft.classGrade || '';
            document.getElementById('studyGoal').value = draft.studyGoal || 15;
<<<<<<< HEAD

=======
            
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
            // Update slider display
            this.updateSliderDisplay();
        }
    }
};

// Initialize register page when DOM is loaded
<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
=======
document.addEventListener('DOMContentLoaded', function() {
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Check if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
<<<<<<< HEAD

=======
    
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    // Initialize register page
    Register.init();
});