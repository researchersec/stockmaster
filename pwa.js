// ===== PWA MODULE =====

// PWA State
const PWAState = {
    deferredPrompt: null,
    isInstalled: false,
    isOnline: navigator.onLine
};

// Initialize PWA
function initializePWA() {
    console.log('📱 Initializing PWA...');
    
    // Check if already installed
    checkInstallationStatus();
    
    // Set up install prompt
    setupInstallPrompt();
    
    // Set up online/offline detection
    setupOnlineDetection();
    
    // Set up service worker
    setupServiceWorker();
}

// Check if app is installed
function checkInstallationStatus() {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        PWAState.isInstalled = true;
        console.log('📱 App is running in standalone mode');
    }
}

// Set up install prompt
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        PWAState.deferredPrompt = e;
        
        // Show install prompt
        showInstallPrompt();
        
        console.log('📱 Install prompt ready');
    });
    
    // Handle install button click
    const installButton = document.getElementById('install-pwa');
    if (installButton) {
        installButton.addEventListener('click', installPWA);
    }
}

// Show install prompt
function showInstallPrompt() {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt && PWAState.deferredPrompt && !PWAState.isInstalled) {
        prompt.classList.remove('hidden');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            hideInstallPrompt();
        }, 10000);
    }
}

// Hide install prompt
function hideInstallPrompt() {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

// Install PWA
async function installPWA() {
    if (!PWAState.deferredPrompt) {
        console.log('📱 No install prompt available');
        return;
    }
    
    try {
        // Show the install prompt
        PWAState.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await PWAState.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('📱 PWA installed successfully');
            PWAState.isInstalled = true;
            showNotification('App installed successfully!', 'success');
        } else {
            console.log('📱 PWA installation declined');
        }
        
        // Clear the deferredPrompt
        PWAState.deferredPrompt = null;
        
        // Hide the install prompt
        hideInstallPrompt();
        
    } catch (error) {
        console.error('📱 Error installing PWA:', error);
        showNotification('Failed to install app', 'error');
    }
}

// Set up online detection
function setupOnlineDetection() {
    window.addEventListener('online', () => {
        PWAState.isOnline = true;
        updateConnectionStatus('connected');
        showNotification('Connection restored', 'success');
        console.log('🌐 Back online');
    });
    
    window.addEventListener('offline', () => {
        PWAState.isOnline = false;
        updateConnectionStatus('disconnected');
        showNotification('Connection lost', 'warning');
        console.log('🌐 Gone offline');
    });
}

// Set up service worker
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('📱 Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('New version available. Refresh to update.', 'info');
                        }
                    });
                });
            })
            .catch(error => {
                console.error('📱 Service Worker registration failed:', error);
            });
    }
}

// Update connection status
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        statusElement.textContent = status === 'connected' ? '🟢 Online' : '🔴 Offline';
        statusElement.className = status === 'connected' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400';
    }
    
    // Update AppState
    AppState.connectionStatus = status;
}

// Export functions for global access
window.installPWA = installPWA;
window.showInstallPrompt = showInstallPrompt;
window.hideInstallPrompt = hideInstallPrompt;
window.initializePWA = initializePWA;