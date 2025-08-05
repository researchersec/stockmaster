// ===== NOTIFICATIONS MODULE =====

// Notifications State
const NotificationState = {
    notifications: [],
    isVisible: false,
    maxNotifications: 10
};

// Initialize Notifications
function initializeNotifications() {
    console.log('🔔 Initializing Notifications...');
    
    // Set up notification panel toggle
    const notificationToggle = document.getElementById('notifications-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    
    if (notificationToggle && notificationsPanel) {
        notificationToggle.addEventListener('click', () => {
            toggleNotificationsPanel();
        });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationsPanel && !notificationsPanel.contains(e.target) && 
            !notificationToggle.contains(e.target)) {
            hideNotificationsPanel();
        }
    });
    
    // Initialize with some default notifications
    showNotification('Dashboard loaded successfully!', 'success');
    showNotification('AI Insights are now active', 'info');
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const notification = {
        id: Date.now() + Math.random(),
        message: message,
        type: type,
        timestamp: new Date(),
        duration: duration
    };
    
    // Add to state
    NotificationState.notifications.unshift(notification);
    
    // Limit number of notifications
    if (NotificationState.notifications.length > NotificationState.maxNotifications) {
        NotificationState.notifications = NotificationState.notifications.slice(0, NotificationState.maxNotifications);
    }
    
    // Update UI
    updateNotificationsUI();
    
    // Show toast notification
    showToastNotification(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification.id);
        }, duration);
    }
    
    console.log(`🔔 Notification: ${message} (${type})`);
}

// Remove notification
function removeNotification(id) {
    NotificationState.notifications = NotificationState.notifications.filter(n => n.id !== id);
    updateNotificationsUI();
}

// Update notifications UI
function updateNotificationsUI() {
    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-badge');
    
    if (notificationsList) {
        notificationsList.innerHTML = '';
        
        if (NotificationState.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                    <p class="text-sm">No notifications</p>
                </div>
            `;
        } else {
            NotificationState.notifications.forEach(notification => {
                const notificationElement = createNotificationElement(notification);
                notificationsList.appendChild(notificationElement);
            });
        }
    }
    
    // Update notification count badge
    if (notificationCount) {
        const count = NotificationState.notifications.length;
        if (count > 0) {
            notificationCount.textContent = count > 99 ? '99+' : count.toString();
            notificationCount.classList.remove('hidden');
        } else {
            notificationCount.classList.add('hidden');
        }
    }
}

// Create notification element
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `p-3 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`;
    element.setAttribute('data-notification-id', notification.id);
    
    const typeIcon = getNotificationIcon(notification.type);
    const typeColor = getNotificationColor(notification.type);
    
    element.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <span class="text-lg">${typeIcon}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">${notification.message}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${formatTimestamp(notification.timestamp)}
                </p>
            </div>
            <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                    onclick="removeNotification(${notification.id})">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    return element;
}

// Show toast notification
function showToastNotification(notification) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 max-w-sm z-50 transform transition-all duration-300 translate-x-full`;
    
    const typeIcon = getNotificationIcon(notification.type);
    const typeColor = getNotificationColor(notification.type);
    
    toast.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                <span class="text-lg">${typeIcon}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">${notification.message}</p>
            </div>
            <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                    onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, notification.duration);
}

// Get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        case 'info':
        default:
            return 'ℹ️';
    }
}

// Get notification color
function getNotificationColor(type) {
    switch (type) {
        case 'success':
            return 'text-green-600';
        case 'error':
            return 'text-red-600';
        case 'warning':
            return 'text-yellow-600';
        case 'info':
        default:
            return 'text-blue-600';
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    } else {
        return timestamp.toLocaleDateString();
    }
}

// Toggle notifications panel
function toggleNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        if (NotificationState.isVisible) {
            hideNotificationsPanel();
        } else {
            showNotificationsPanel();
        }
    }
}

// Show notifications panel
function showNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        panel.classList.remove('hidden');
        NotificationState.isVisible = true;
    }
}

// Hide notifications panel
function hideNotificationsPanel() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        panel.classList.add('hidden');
        NotificationState.isVisible = false;
    }
}

// Clear all notifications
function clearAllNotifications() {
    NotificationState.notifications = [];
    updateNotificationsUI();
}

// Export functions for global access
window.showNotification = showNotification;
window.removeNotification = removeNotification;
window.clearAllNotifications = clearAllNotifications;
window.toggleNotificationsPanel = toggleNotificationsPanel;
window.initializeNotifications = initializeNotifications;