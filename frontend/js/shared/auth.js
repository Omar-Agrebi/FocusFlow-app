// Authentication module
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        const user = Utils.getFromStorage('user');
        const token = localStorage.getItem('token');  // Get token as plain string
        return !!(user && token);
    },

    // Get current user
    getCurrentUser() {
        return Utils.getFromStorage('user', { name: 'Guest', email: '' });
    },

    // Login function
    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            const response = await API.login({ email, password });
            console.log('Login response:', response);
            // Backend returns { access_token, token_type, user }
            if (response.access_token && response.user) {
                Utils.saveToStorage('user', response.user);
                // Save token as plain string, not JSON
                localStorage.setItem('token', response.access_token);
                Utils.saveToStorage('userId', response.user.id);
                console.log('Login successful, user data saved');
                return { success: true, user: response.user };
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: error.message || 'Login failed. Please try again.' };
        }
    },

    // Register function
    async register(name, email, password) {
        try {
            console.log('Attempting registration for:', email);
            const response = await API.register({ name, email, password });
            console.log('Registration response:', response);
            // Backend returns { access_token, token_type, user }
            if (response.access_token && response.user) {
                Utils.saveToStorage('user', response.user);
                // Save token as plain string, not JSON
                localStorage.setItem('token', response.access_token);
                Utils.saveToStorage('userId', response.user.id);
                console.log('Registration successful, user data saved');
                return { success: true, user: response.user };
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: error.message || 'Registration failed. Please try again.' };
        }
    },

    // Logout function
    logout() {
        Utils.removeFromStorage('user');
        Utils.removeFromStorage('token');
        window.location.href = 'login.html';
    },

    // Update user profile
    async updateProfile(profileData) {
        try {
            const updatedUser = await API.updateProfile(profileData);
            Utils.saveToStorage('user', updatedUser);
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { success: false, message: error.message || 'Failed to update profile.' };
        }
    }
};

// Make Auth globally available
window.Auth = Auth;
