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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock response
            const mockUser = {
                id: 1,
                name: 'Alex Smith',
                email: email,
                class: 'Grade 11',
                studyGoal: 20
            };
            
            const mockToken = 'mock-jwt-token-123456';
            
            // Save to storage
            Utils.saveToStorage('user', mockUser);
            Utils.saveToStorage('token', mockToken);
            
            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    },
    
    // Register function
    async register(name, email, password) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock response
            const mockUser = {
                id: 1,
                name: name,
                email: email,
                class: '',
                studyGoal: 20
            };
            
            const mockToken = 'mock-jwt-token-123456';
            
            // Save to storage
            Utils.saveToStorage('user', mockUser);
            Utils.saveToStorage('token', mockToken);
            
            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
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
            const currentUser = this.getCurrentUser();
            const updatedUser = { ...currentUser, ...profileData };
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update storage
            Utils.saveToStorage('user', updatedUser);
            
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { success: false, message: 'Failed to update profile.' };
        }
    }
};

// Make Auth globally available
window.Auth = Auth;