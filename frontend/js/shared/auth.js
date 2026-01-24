// Authentication module
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        const user = Utils.getFromStorage('user');
        const token = Utils.getFromStorage('token');
        return !!(user && token);
    },

    // Get current user
    getCurrentUser() {
        return Utils.getFromStorage('user', { name: 'Guest', email: '' });
    },

    // Login function
    async login(email, password) {
        try {
            const response = await API.login({ email, password });
            // TODO: Backend doesn't generate token yet, use fake one for now
            const token = response.access_token || 'fake-jwt-token-for-dev';
            Utils.saveToStorage('user', response.user || { id: response.user_id, email });
            Utils.saveToStorage('token', token);
            return { success: true, user: response.user };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: error.message || 'Login failed. Please try again.' };
        }
    },

    // Register function
    async register(name, email, password) {
        try {
            const response = await API.register({ username: name, email, password });
            // TODO: Backend doesn't generate token yet, use fake one for now
            const token = response.access_token || 'fake-jwt-token-for-dev';
            Utils.saveToStorage('user', response.user || { name: name, email });
            Utils.saveToStorage('token', token);
            return { success: true, user: response.user };
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
