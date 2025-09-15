// SignalR Client Implementation for Stocker

class StockerSignalRClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl || 'http://localhost:5104';
        this.token = token;
        this.connections = {};
        this.isConnected = false;
    }

    // Initialize all hubs
    async initializeAll() {
        await this.initializeNotificationHub();
        await this.initializeChatHub();
        await this.initializeValidationHub();
    }

    // Initialize Notification Hub
    async initializeNotificationHub() {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}/hubs/notification`, {
                accessTokenFactory: () => this.token,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Setup event handlers
        connection.on("Connected", (data) => {
            console.log("✅ Connected to Notification Hub:", data);
        });

        connection.on("ReceiveNotification", (notification) => {
            this.handleNotification(notification);
        });

        connection.on("NotificationRead", (data) => {
            console.log("Notification marked as read:", data);
        });

        connection.on("OnlineUsers", (data) => {
            console.log("Online users:", data);
        });

        // Connection state handlers
        connection.onreconnecting((error) => {
            console.warn("🔄 Reconnecting to Notification Hub...", error);
            this.updateConnectionStatus('notification', 'reconnecting');
        });

        connection.onreconnected((connectionId) => {
            console.log("✅ Reconnected to Notification Hub:", connectionId);
            this.updateConnectionStatus('notification', 'connected');
        });

        connection.onclose((error) => {
            console.error("❌ Disconnected from Notification Hub:", error);
            this.updateConnectionStatus('notification', 'disconnected');
        });

        // Start connection
        try {
            await connection.start();
            this.connections.notification = connection;
            this.updateConnectionStatus('notification', 'connected');
            console.log("✅ Notification Hub connected successfully");
        } catch (err) {
            console.error("❌ Failed to connect to Notification Hub:", err);
            setTimeout(() => this.initializeNotificationHub(), 5000);
        }
    }

    // Initialize Chat Hub
    async initializeChatHub() {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}/hubs/chat`, {
                accessTokenFactory: () => this.token,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Setup event handlers
        connection.on("ReceiveMessage", (message) => {
            this.handleChatMessage(message);
        });

        connection.on("ReceivePrivateMessage", (message) => {
            this.handlePrivateMessage(message);
        });

        connection.on("UserOnline", (user) => {
            console.log("👤 User online:", user);
            this.updateUserStatus(user.userId, 'online');
        });

        connection.on("UserOffline", (user) => {
            console.log("👤 User offline:", user);
            this.updateUserStatus(user.userId, 'offline');
        });

        connection.on("UserJoinedRoom", (data) => {
            console.log(`👥 ${data.userName} joined room ${data.roomName}`);
        });

        connection.on("UserLeftRoom", (data) => {
            console.log(`👥 ${data.userName} left room ${data.roomName}`);
        });

        connection.on("UserTyping", (data) => {
            this.showTypingIndicator(data);
        });

        connection.on("UserStoppedTyping", (data) => {
            this.hideTypingIndicator(data);
        });

        connection.on("MessageHistory", (messages) => {
            this.loadMessageHistory(messages);
        });

        connection.on("OnlineUsersList", (users) => {
            this.updateOnlineUsersList(users);
        });

        connection.on("RoomsList", (rooms) => {
            this.updateRoomsList(rooms);
        });

        connection.on("Error", (error) => {
            console.error("❌ Chat error:", error);
            this.showError(error);
        });

        // Start connection
        try {
            await connection.start();
            this.connections.chat = connection;
            this.updateConnectionStatus('chat', 'connected');
            console.log("✅ Chat Hub connected successfully");
        } catch (err) {
            console.error("❌ Failed to connect to Chat Hub:", err);
            setTimeout(() => this.initializeChatHub(), 5000);
        }
    }

    // Initialize Validation Hub
    async initializeValidationHub() {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}/hubs/validation`, {
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Setup event handlers
        connection.on("EmailValidationResult", (result) => {
            this.handleEmailValidation(result);
        });

        connection.on("TenantCodeValidationResult", (result) => {
            this.handleTenantCodeValidation(result);
        });

        connection.on("SubdomainValidationResult", (result) => {
            this.handleSubdomainValidation(result);
        });

        // Start connection
        try {
            await connection.start();
            this.connections.validation = connection;
            console.log("✅ Validation Hub connected successfully");
        } catch (err) {
            console.error("❌ Failed to connect to Validation Hub:", err);
        }
    }

    // Notification Hub Methods
    async markNotificationAsRead(notificationId) {
        if (this.connections.notification) {
            await this.connections.notification.invoke("MarkAsRead", notificationId);
        }
    }

    async getOnlineUsers() {
        if (this.connections.notification) {
            await this.connections.notification.invoke("GetOnlineUsers");
        }
    }

    async joinNotificationGroup(groupName) {
        if (this.connections.notification) {
            await this.connections.notification.invoke("JoinGroup", groupName);
        }
    }

    async leaveNotificationGroup(groupName) {
        if (this.connections.notification) {
            await this.connections.notification.invoke("LeaveGroup", groupName);
        }
    }

    // Chat Hub Methods
    async sendMessage(message, roomName = null) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("SendMessage", message, roomName);
        }
    }

    async sendPrivateMessage(targetUserId, message) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("SendPrivateMessage", targetUserId, message);
        }
    }

    async joinChatRoom(roomName) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("JoinRoom", roomName);
        }
    }

    async leaveChatRoom(roomName) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("LeaveRoom", roomName);
        }
    }

    async getChatOnlineUsers() {
        if (this.connections.chat) {
            await this.connections.chat.invoke("GetOnlineUsers");
        }
    }

    async getChatRooms() {
        if (this.connections.chat) {
            await this.connections.chat.invoke("GetRooms");
        }
    }

    async startTyping(roomName = null) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("StartTyping", roomName);
        }
    }

    async stopTyping(roomName = null) {
        if (this.connections.chat) {
            await this.connections.chat.invoke("StopTyping", roomName);
        }
    }

    // Validation Hub Methods
    async validateEmail(email) {
        if (this.connections.validation) {
            await this.connections.validation.invoke("ValidateEmail", email);
        }
    }

    async validateTenantCode(code) {
        if (this.connections.validation) {
            await this.connections.validation.invoke("ValidateTenantCode", code);
        }
    }

    async validateSubdomain(subdomain) {
        if (this.connections.validation) {
            await this.connections.validation.invoke("ValidateSubdomain", subdomain);
        }
    }

    // Handler Methods
    handleNotification(notification) {
        console.log("📬 New notification:", notification);
        
        // Show browser notification if permitted
        if (Notification.permission === "granted") {
            const browserNotif = new Notification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/images/notification-icon.png',
                badge: '/images/badge-icon.png',
                tag: notification.id,
                requireInteraction: notification.priority === 'Urgent'
            });

            browserNotif.onclick = () => {
                if (notification.actionUrl) {
                    window.open(notification.actionUrl);
                }
            };
        }

        // Show in-app notification
        this.showInAppNotification(notification);
    }

    handleChatMessage(message) {
        console.log("💬 New message:", message);
        
        // Add message to chat UI
        const messageElement = this.createMessageElement(message);
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    handlePrivateMessage(message) {
        console.log("🔒 Private message:", message);
        
        // Show private message notification
        this.showInAppNotification({
            title: `Private message from ${message.userName}`,
            message: message.message,
            type: 'info',
            priority: 'high'
        });

        // Add to private chat UI if open
        const privateChat = document.getElementById(`private-chat-${message.userId}`);
        if (privateChat) {
            const messageElement = this.createMessageElement(message);
            privateChat.appendChild(messageElement);
        }
    }

    handleEmailValidation(result) {
        console.log("✉️ Email validation result:", result);
        
        const emailInput = document.getElementById('email-input');
        const emailError = document.getElementById('email-error');
        
        if (emailInput && emailError) {
            if (result.isValid) {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
                emailError.textContent = '';
            } else {
                emailInput.classList.remove('is-valid');
                emailInput.classList.add('is-invalid');
                emailError.textContent = result.message;
            }
        }
    }

    handleTenantCodeValidation(result) {
        console.log("🏢 Tenant code validation result:", result);
        
        const codeInput = document.getElementById('tenant-code-input');
        const codeError = document.getElementById('tenant-code-error');
        
        if (codeInput && codeError) {
            if (result.isAvailable) {
                codeInput.classList.remove('is-invalid');
                codeInput.classList.add('is-valid');
                codeError.textContent = '';
            } else {
                codeInput.classList.remove('is-valid');
                codeInput.classList.add('is-invalid');
                codeError.textContent = result.message;
            }
        }
    }

    handleSubdomainValidation(result) {
        console.log("🌐 Subdomain validation result:", result);
        
        const subdomainInput = document.getElementById('subdomain-input');
        const subdomainError = document.getElementById('subdomain-error');
        
        if (subdomainInput && subdomainError) {
            if (result.isAvailable) {
                subdomainInput.classList.remove('is-invalid');
                subdomainInput.classList.add('is-valid');
                subdomainError.textContent = '';
            } else {
                subdomainInput.classList.remove('is-valid');
                subdomainInput.classList.add('is-invalid');
                subdomainError.textContent = result.message;
            }
        }
    }

    // UI Helper Methods
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.isPrivate ? 'private' : ''}`;
        div.innerHTML = `
            <div class="message-header">
                <span class="username">${message.userName}</span>
                <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="message-body">${this.escapeHtml(message.message)}</div>
        `;
        return div;
    }

    showInAppNotification(notification) {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const notif = document.createElement('div');
        notif.className = `notification notification-${notification.type || 'info'} notification-${notification.priority || 'normal'}`;
        notif.innerHTML = `
            <div class="notification-header">
                <strong>${this.escapeHtml(notification.title)}</strong>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">${this.escapeHtml(notification.message)}</div>
        `;
        
        container.appendChild(notif);
        
        // Auto-remove after 5 seconds for non-urgent notifications
        if (notification.priority !== 'urgent') {
            setTimeout(() => notif.remove(), 5000);
        }
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    updateConnectionStatus(hub, status) {
        const statusElement = document.getElementById(`${hub}-status`);
        if (statusElement) {
            statusElement.className = `status status-${status}`;
            statusElement.textContent = status;
        }
    }

    updateUserStatus(userId, status) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            userElement.classList.remove('online', 'offline');
            userElement.classList.add(status);
        }
    }

    showTypingIndicator(data) {
        const indicator = document.getElementById(`typing-${data.userId}`);
        if (indicator) {
            indicator.style.display = 'block';
            indicator.textContent = `${data.userName} is typing...`;
        }
    }

    hideTypingIndicator(data) {
        const indicator = document.getElementById(`typing-${data.userId}`);
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    loadMessageHistory(messages) {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            messages.forEach(message => {
                const messageElement = this.createMessageElement(message);
                chatContainer.appendChild(messageElement);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    updateOnlineUsersList(users) {
        const usersList = document.getElementById('online-users');
        if (usersList) {
            usersList.innerHTML = users.map(user => `
                <div class="user-item online" data-user-id="${user.userId}">
                    <span class="user-name">${user.userName}</span>
                    <span class="user-status">Online</span>
                </div>
            `).join('');
        }
    }

    updateRoomsList(rooms) {
        const roomsList = document.getElementById('chat-rooms');
        if (roomsList) {
            roomsList.innerHTML = rooms.map(room => `
                <div class="room-item" data-room="${room.Key}">
                    <span class="room-name">${room.Key}</span>
                    <span class="room-users">${room.UserCount} users</span>
                </div>
            `).join('');
        }
    }

    showError(error) {
        console.error("Error:", error);
        this.showInAppNotification({
            title: 'Error',
            message: error,
            type: 'error',
            priority: 'high'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cleanup
    async disconnect() {
        for (const [name, connection] of Object.entries(this.connections)) {
            if (connection) {
                try {
                    await connection.stop();
                    console.log(`Disconnected from ${name} hub`);
                } catch (err) {
                    console.error(`Error disconnecting from ${name} hub:`, err);
                }
            }
        }
        this.connections = {};
        this.isConnected = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockerSignalRClient;
}