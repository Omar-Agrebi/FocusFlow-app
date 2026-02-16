// Chatbot Manager
const Chatbot = {
    messagesContainer: null,
    messageInput: null,
    chatForm: null,
    sendBtn: null,
    typingIndicator: null,
    quickSuggestions: null,

    init() {
        // Get DOM elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickSuggestions = document.getElementById('quickSuggestions');

        // Load chat history from session storage
        this.loadChatHistory();

        // Set up event listeners
        this.setupEventListeners();

        // Load user info
        this.loadUserInfo();
    },

    setupEventListeners() {
        // Form submit
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        // Quick suggestion pills
        const suggestionPills = document.querySelectorAll('.suggestion-pill');
        suggestionPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const message = pill.getAttribute('data-message');
                this.messageInput.value = message;
                this.handleSendMessage();
            });
        });
    },

    async loadUserInfo() {
        try {
            const user = await API.get('/api/profile/me');
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');

            if (user && user.full_name) {
                const initials = user.full_name.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                userAvatar.textContent = initials;
                userName.textContent = user.full_name;
                userAvatar.classList.remove('loading-placeholder');
                userName.classList.remove('loading-placeholder');
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    },

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Disable input and button
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;

        // Add user message to UI
        this.addMessage(message, 'user');

        // Clear input
        this.messageInput.value = '';

        // Hide quick suggestions after first message
        if (this.quickSuggestions) {
            this.quickSuggestions.style.display = 'none';
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to API
            const response = await API.post('/api/chatbot/message', { message });

            // Hide typing indicator
            this.hideTypingIndicator();

            // Add bot response to UI
            if (response && response.reply) {
                this.addMessage(response.reply, 'bot');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showError('Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable input and button
            this.messageInput.disabled = false;
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    },

    addMessage(text, sender) {
        // Remove welcome message if it exists
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = text;

        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();

        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(messageContent);

        // Add to container
        this.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.scrollToBottom();

        // Save to session storage
        this.saveChatHistory();
    },

    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        this.messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();

        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    },

    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    saveChatHistory() {
        const messages = [];
        const messageElements = this.messagesContainer.querySelectorAll('.message');

        messageElements.forEach(el => {
            const text = el.querySelector('.message-text').textContent;
            const sender = el.classList.contains('user') ? 'user' : 'bot';
            const time = el.querySelector('.message-time').textContent;
            messages.push({ text, sender, time });
        });

        sessionStorage.setItem('chatHistory', JSON.stringify(messages));
    },

    loadChatHistory() {
        const history = sessionStorage.getItem('chatHistory');
        if (!history) return;

        try {
            const messages = JSON.parse(history);
            if (messages.length === 0) return;

            // Remove welcome message
            const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }

            // Hide quick suggestions
            if (this.quickSuggestions) {
                this.quickSuggestions.style.display = 'none';
            }

            // Add messages to UI
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}`;

                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';

                const messageText = document.createElement('p');
                messageText.className = 'message-text';
                messageText.textContent = msg.text;

                const messageTime = document.createElement('span');
                messageTime.className = 'message-time';
                messageTime.textContent = msg.time;

                messageContent.appendChild(messageText);
                messageContent.appendChild(messageTime);
                messageDiv.appendChild(messageContent);

                this.messagesContainer.appendChild(messageDiv);
            });

            this.scrollToBottom();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
};
