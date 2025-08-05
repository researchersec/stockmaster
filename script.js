// ===== ULTIMATE STOCK DASHBOARD - ENHANCED JAVASCRIPT =====

// Global state management
const AppState = {
    stocks: [],
    summary: {},
    theme: localStorage.theme || 'light',
    sortBy: 'symbol',
    sortOrder: 'asc',
    searchQuery: '',
    viewMode: 'table',
    notifications: [],
    lastUpdate: null,
    connectionStatus: 'connected',
    marketStatus: 'open',
    aiInsights: {},
    userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ultimate Stock Dashboard Initializing...');
    
    // Initialize all modules
    initializeTheme();
    initializeParticles();
    initializeAOS();
    initializeEventListeners();
    initializePWA();
    initializeNotifications();
    initializeAIInsights();
    
    // Load initial data
    loadStockData();
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Initialize search and sort functionality
    initializeSearchAndSort();
    
    console.log('✅ Dashboard initialized successfully!');
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');
    
    // Set initial theme
    if (AppState.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        AppState.theme = 'dark';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            AppState.theme = 'dark';
            localStorage.theme = 'dark';
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            AppState.theme = 'light';
            localStorage.theme = 'light';
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
        
        // Trigger theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: AppState.theme } }));
    });
}

// Particles Background
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: '#3B82F6' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#3B82F6',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// AOS (Animate On Scroll) Initialization
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// Event Listeners
function initializeEventListeners() {
    // Modal functionality
    setupModal();
    
    // Search functionality
    const searchInput = document.getElementById('stock-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // View toggle
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', toggleViewMode);
    }
    
    // AI Insights refresh
    const refreshInsights = document.getElementById('refresh-insights');
    if (refreshInsights) {
        refreshInsights.addEventListener('click', refreshAIInsights);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window events
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('focus', handleWindowFocus);
}

// Enhanced Modal Setup
function setupModal() {
    const modal = document.getElementById('stock-modal');
    const closeModal = document.getElementById('close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Enhanced Stock Data Loading
async function loadStockData() {
    try {
        showLoadingState(true);
        
        const [stockResponse, summaryResponse] = await Promise.all([
            fetch('data/stocks.json').then(response => {
                if (!response.ok) throw new Error('Failed to fetch stock data');
                return response.json();
            }),
            fetch('data/summary.json').then(response => {
                if (!response.ok) throw new Error('Failed to fetch summary data');
                return response.json();
            })
        ]);
        
        AppState.stocks = stockResponse;
        AppState.summary = summaryResponse;
        AppState.lastUpdate = new Date();
        
        // Update UI
        displayStockTable(AppState.stocks);
        displayMarketSummary(AppState.summary);
        updateLastUpdated(AppState.summary.last_updated);
        updateConnectionStatus('connected');
        
        // Generate AI insights
        generateAIInsights();
        
        // Update next update time
        updateNextUpdateTime();
        
        showLoadingState(false);
        
        // Trigger data loaded event
        document.dispatchEvent(new CustomEvent('dataLoaded', { 
            detail: { stocks: AppState.stocks, summary: AppState.summary } 
        }));
        
    } catch (error) {
        console.error('Error loading stock data:', error);
        showErrorState('Failed to load stock data. Please try again later.');
        updateConnectionStatus('disconnected');
        showLoadingState(false);
    }
}

// Enhanced Stock Table Display
function displayStockTable(stockData) {
    const tableBody = document.getElementById('stock-table');
    if (!tableBody) return;
    
    // Apply search and sort filters
    let filteredData = applyFilters(stockData);
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center">
                    <div class="empty-state">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="text-gray-500 dark:text-gray-400">No stocks found matching your search criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach((stock, index) => {
        const changeClass = stock.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const changeIcon = stock.change_percent >= 0 ? '↗' : '↘';
        const sentimentClass = getSentimentClass(stock.change_percent);
        
        const row = document.createElement('tr');
        row.className = `hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-200 animate-fade-in`;
        row.style.animationDelay = `${index * 50}ms`;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span class="text-white font-bold text-sm">${stock.symbol.charAt(0)}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">${stock.symbol}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${stock.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-lg font-bold text-gray-900 dark:text-white">$${stock.current_price.toFixed(2)}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${stock.sector || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="text-lg font-semibold ${changeClass}">${changeIcon} ${stock.change_percent.toFixed(2)}%</span>
                    <span class="ml-2 px-2 py-1 text-xs rounded-full ${sentimentClass}">${getSentimentLabel(stock.change_percent)}</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">$${stock.change.toFixed(2)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${formatMarketCap(stock.market_cap)}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${stock.pe_ratio ? `P/E: ${stock.pe_ratio.toFixed(2)}` : 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div class="text-sm text-gray-900 dark:text-white">${stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A'}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${stock.forward_pe ? `Fwd: ${stock.forward_pe.toFixed(2)}` : ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div class="text-sm text-gray-900 dark:text-white">${formatVolume(stock.volume)}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Avg: ${formatVolume(stock.avg_volume)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center space-x-2">
                    <button onclick="showStockDetails('${stock.symbol}')" 
                            class="btn btn-primary text-xs px-3 py-1">
                        Details
                    </button>
                    <button onclick="addToWatchlist('${stock.symbol}')" 
                            class="btn btn-secondary text-xs px-3 py-1"
                            data-tooltip="Add to Watchlist">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Enhanced Market Summary Display
function displayMarketSummary(summaryData) {
    const gainersCount = document.getElementById('gainers-count');
    const losersCount = document.getElementById('losers-count');
    const totalStocks = document.getElementById('total-stocks');
    const marketCapTotal = document.getElementById('market-cap-total');
    const gainersPercent = document.getElementById('gainers-percent');
    const losersPercent = document.getElementById('losers-percent');
    
    if (gainersCount) gainersCount.textContent = summaryData.gainers || 0;
    if (losersCount) losersCount.textContent = summaryData.losers || 0;
    if (totalStocks) totalStocks.textContent = summaryData.total_stocks || 0;
    if (marketCapTotal) marketCapTotal.textContent = formatMarketCap(summaryData.total_market_cap || 0);
    
    // Calculate percentages
    const total = summaryData.total_stocks || 1;
    const gainersPct = ((summaryData.gainers || 0) / total * 100).toFixed(1);
    const losersPct = ((summaryData.losers || 0) / total * 100).toFixed(1);
    
    if (gainersPercent) gainersPercent.textContent = `+${gainersPct}%`;
    if (losersPercent) losersPercent.textContent = `-${losersPct}%`;
    
    // Update market summary text
    const marketSummary = document.getElementById('market-summary');
    if (marketSummary) {
        const avgChange = summaryData.average_change || 0;
        const changeText = avgChange >= 0 ? `+${avgChange.toFixed(2)}%` : `${avgChange.toFixed(2)}%`;
        marketSummary.textContent = `Market: ${changeText} | Vol: ${formatVolume(summaryData.total_volume || 0)}`;
    }
}

// Utility Functions
function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
}

function formatVolume(volume) {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
}

function getSentimentClass(changePercent) {
    if (changePercent >= 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (changePercent >= 2) return 'bg-green-50 text-green-700 dark:bg-green-800 dark:text-green-300';
    if (changePercent >= 0) return 'bg-blue-50 text-blue-700 dark:bg-blue-800 dark:text-blue-300';
    if (changePercent >= -2) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300';
    if (changePercent >= -5) return 'bg-red-50 text-red-700 dark:bg-red-800 dark:text-red-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

function getSentimentLabel(changePercent) {
    if (changePercent >= 5) return '🚀 Strong Buy';
    if (changePercent >= 2) return '📈 Bullish';
    if (changePercent >= 0) return '➡️ Neutral';
    if (changePercent >= -2) return '⚠️ Cautious';
    if (changePercent >= -5) return '📉 Bearish';
    return '🔥 Strong Sell';
}

// Search and Sort Functions
function applyFilters(data) {
    let filtered = [...data];
    
    // Apply search filter
    if (AppState.searchQuery) {
        const query = AppState.searchQuery.toLowerCase();
        filtered = filtered.filter(stock => 
            stock.symbol.toLowerCase().includes(query) ||
            stock.name.toLowerCase().includes(query) ||
            (stock.sector && stock.sector.toLowerCase().includes(query))
        );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
        let aVal = a[AppState.sortBy];
        let bVal = b[AppState.sortBy];
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = 0;
        if (bVal === null || bVal === undefined) bVal = 0;
        
        if (AppState.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    return filtered;
}

function handleSearch(e) {
    AppState.searchQuery = e.target.value;
    displayStockTable(AppState.stocks);
}

function handleSort(e) {
    AppState.sortBy = e.target.value;
    displayStockTable(AppState.stocks);
}

function toggleViewMode() {
    AppState.viewMode = AppState.viewMode === 'table' ? 'cards' : 'table';
    displayStockTable(AppState.stocks);
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (AppState.connectionStatus === 'connected') {
            loadStockData();
        }
    }, 30000);
    
    // Update connection status every 5 seconds
    setInterval(() => {
        updateConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');
    }, 5000);
}

// Connection Management
function updateConnectionStatus(status) {
    AppState.connectionStatus = status;
    const statusElement = document.getElementById('connection-status');
    const statusDot = document.querySelector('#connection-status').previousElementSibling;
    
    if (statusElement) {
        statusElement.textContent = status === 'connected' ? 'Live Data' : 'Offline';
    }
    
    if (statusDot) {
        statusDot.className = `w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`;
    }
}

function handleConnectionChange() {
    updateConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');
    
    if (navigator.onLine) {
        showNotification('Connection restored', 'success');
        loadStockData();
    } else {
        showNotification('Connection lost', 'error');
    }
}

// Loading and Error States
function showLoadingState(show) {
    const loadingState = document.getElementById('loading-state');
    const tableBody = document.getElementById('stock-table');
    
    if (show) {
        if (loadingState) loadingState.classList.remove('hidden');
        if (tableBody) tableBody.classList.add('hidden');
    } else {
        if (loadingState) loadingState.classList.add('hidden');
        if (tableBody) tableBody.classList.remove('hidden');
    }
}

function showErrorState(message) {
    const tableBody = document.getElementById('stock-table');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center">
                    <div class="error-state">
                        <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-red-600 dark:text-red-400">${message}</p>
                        <button onclick="loadStockData()" class="btn btn-primary mt-4">Retry</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateLastUpdated(timestamp) {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated && timestamp) {
        const date = new Date(timestamp);
        lastUpdated.textContent = `Last updated: ${date.toLocaleTimeString()}`;
    }
}

function updateNextUpdateTime() {
    const nextUpdate = document.getElementById('next-update');
    if (nextUpdate) {
        const now = new Date();
        const next = new Date(now.getTime() + 300000); // 5 minutes
        nextUpdate.textContent = `Next: ${next.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('stock-search');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl/Cmd + R for refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadStockData();
    }
    
    // Ctrl/Cmd + D for theme toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        document.getElementById('theme-toggle').click();
    }
}

// Window Focus Handler
function handleWindowFocus() {
    // Refresh data when window gains focus
    if (AppState.connectionStatus === 'connected') {
        loadStockData();
    }
}

// Export functions for global access
window.showStockDetails = showStockDetails;
window.addToWatchlist = addToWatchlist;
window.loadStockData = loadStockData;

// Stock Details Modal
function showStockDetails(symbol) {
    const stock = AppState.stocks.find(s => s.symbol === symbol);
    if (!stock) {
        showNotification('Stock not found', 'error');
        return;
    }
    
    // Update modal content
    const modal = document.getElementById('stock-modal');
    const modalSymbol = document.getElementById('modal-symbol');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalContent = document.getElementById('modal-content');
    
    if (modal && modalSymbol && modalTitle && modalSubtitle && modalContent) {
        modalSymbol.textContent = symbol;
        modalTitle.textContent = `${symbol} - ${stock.name}`;
        modalSubtitle.textContent = `Current Price: $${stock.current_price}`;
        
        modalContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Price Information</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Current Price:</span>
                                <span class="font-medium text-gray-900 dark:text-white">$${stock.current_price}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Change:</span>
                                <span class="font-medium ${getSentimentClass(stock.change_percent)}">${stock.change_percent}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Market Cap:</span>
                                <span class="font-medium text-gray-900 dark:text-white">${formatMarketCap(stock.market_cap)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Trading Information</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">Volume:</span>
                                <span class="font-medium text-gray-900 dark:text-white">${formatVolume(stock.volume)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 dark:text-gray-400">P/E Ratio:</span>
                                <span class="font-medium text-gray-900 dark:text-white">${stock.pe_ratio || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h4>
                        <div class="space-y-2">
                            <button onclick="addToWatchlist('${symbol}')" class="w-full bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors text-sm">
                                Add to Watchlist
                            </button>
                            <button onclick="refreshAIInsights()" class="w-full bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700 transition-colors text-sm">
                                Refresh AI Insights
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">AI Analysis</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            AI insights for ${symbol} will be generated based on current market data and technical indicators.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
}

// Watchlist functionality
function addToWatchlist(symbol) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        showNotification(`${symbol} added to watchlist`, 'success');
    } else {
        showNotification(`${symbol} is already in your watchlist`, 'info');
    }
}

// Initialize Search and Sort functionality
function initializeSearchAndSort() {
    console.log('🔍 Initializing Search and Sort...');
    
    // Search functionality
    const searchInput = document.getElementById('stock-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // View toggle
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', toggleViewMode);
    }
    
    // Sortable table headers
    const sortableHeaders = document.querySelectorAll('[data-sort]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            AppState.sortBy = sortBy;
            AppState.sortOrder = AppState.sortOrder === 'asc' ? 'desc' : 'asc';
            displayStockTable(AppState.stocks);
        });
    });
}
