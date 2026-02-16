// frontend/js/pages/login.js
document.addEventListener('DOMContentLoaded', () => {
    // Guard: already logged in → dashboard
    if (Auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    // Check for URL parameters (e.g., after registration)
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
        Utils.showNotification('Registration successful! Please login.', 'success');
        // Clear the parameter from URL
        window.history.replaceState({}, '', window.location.pathname);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        // Validation
        if (!email || !password) {
            Utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            Utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        // Add loading class to form
        form.classList.add('loading');

        try {
            const result = await Auth.login({ email, password });

            if (result.success) {
                if (rememberMe) {
                    Utils.saveToStorage('remembered_email', email);
                } else {
                    Utils.removeFromStorage('remembered_email');
                }

                Utils.showNotification('Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);

            } else {
                Utils.showNotification(result.message || 'Login failed. Check your credentials.', 'error');
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 500);
            }
        }
        catch (error) {
            console.error('Login error:', error);
            Utils.showNotification('An unexpected error occurred', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            form.classList.remove('loading');
        }
    });

    // Load remembered email if exists
    const rememberedEmail = Utils.getFromStorage('remembered_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

    // Focus on email field on page load
    document.getElementById('email')?.focus();
});