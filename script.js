document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    setupThemeToggle();
    
    // Load and display stock data
    loadStockData();
    
    // Set up modal functionality
    setupModal();
    
    // Set up portfolio and watchlist functionality
    setupPortfolioAndWatchlist();
    
    // Set up search and filtering
    setupSearchAndFilter();
    
    // Set up notifications
    setupNotifications();
    
    // Auto-refresh data every 30 seconds
    setInterval(loadStockData, 30000);
});

// Global variables
let currentStockData = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
let portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
let currentFilter = 'all';
let currentSort = { field: 'symbol', direction: 'asc' };

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');
    
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            localStorage.theme = 'light';
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    });
}

function setupModal() {
    const modal = document.getElementById('stock-modal');
    const closeModal = document.getElementById('close-modal');
    
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

function setupPortfolioAndWatchlist() {
    // Add portfolio and watchlist buttons to the header
    const headerActions = document.querySelector('.flex.items-center.space-x-4');
    if (headerActions) {
        headerActions.innerHTML += `
            <button id="watchlist-btn" class="btn-secondary text-sm">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                Watchlist (${watchlist.length})
            </button>
            <button id="portfolio-btn" class="btn-secondary text-sm">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Portfolio (${portfolio.length})
            </button>
        `;
    }

    // Add event listeners
    document.getElementById('watchlist-btn')?.addEventListener('click', showWatchlistModal);
    document.getElementById('portfolio-btn')?.addEventListener('click', showPortfolioModal);
}

function setupSearchAndFilter() {
    // Add search and filter controls
    const stockTableHeader = document.querySelector('.px-6.py-4.border-b');
    if (stockTableHeader) {
        stockTableHeader.innerHTML += `
            <div class="mt-4 flex flex-wrap gap-4 items-center">
                <div class="flex-1 min-w-64">
                    <input type="text" id="search-input" placeholder="Search stocks..." 
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                </div>
                <select id="filter-select" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="all">All Stocks</option>
                    <option value="gainers">Gainers</option>
                    <option value="losers">Losers</option>
                    <option value="watchlist">Watchlist</option>
                    <option value="portfolio">Portfolio</option>
                </select>
                <select id="sort-select" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="symbol">Sort by Symbol</option>
                    <option value="change_percent">Sort by Change %</option>
                    <option value="market_cap">Sort by Market Cap</option>
                    <option value="volume">Sort by Volume</option>
                </select>
            </div>
        `;
    }

    // Add event listeners
    document.getElementById('search-input')?.addEventListener('input', filterStocks);
    document.getElementById('filter-select')?.addEventListener('change', filterStocks);
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        currentSort.field = e.target.value;
        filterStocks();
    });
}

function setupNotifications() {
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

function loadStockData() {
    Promise.all([
        fetch('data/stocks.json').then(response => response.json()),
        fetch('data/summary.json').then(response => response.json())
    ])
    .then(([stockData, summaryData]) => {
        currentStockData = stockData;
        displayStockTable(stockData);
        displayMarketSummary(summaryData);
        updateLastUpdated(summaryData.last_updated);
        checkPriceAlerts(stockData);
    })
    .catch(error => {
        console.error('Error fetching stock data:', error);
        document.getElementById('stock-table').innerHTML = 
            '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading stock data</td></tr>';
    });
}

function displayStockTable(stockData) {
    const tableBody = document.getElementById('stock-table');
    tableBody.innerHTML = '';
    
    stockData.forEach(stock => {
        const changeClass = stock.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const changeIcon = stock.change_percent >= 0 ? '↗' : '↘';
        const isInWatchlist = watchlist.includes(stock.symbol);
        const portfolioItem = portfolio.find(p => p.symbol === stock.symbol);
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">${stock.symbol.charAt(0)}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">${stock.symbol}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${stock.name}</div>
                        <div class="flex items-center mt-1">
                            ${isInWatchlist ? '<span class="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mr-1">Watchlist</span>' : ''}
                            ${portfolioItem ? '<span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Portfolio</span>' : ''}
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">$${stock.current_price.toFixed(2)}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${stock.sector}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="text-sm font-medium ${changeClass}">${changeIcon} ${stock.change_percent.toFixed(2)}%</span>
                    <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">(${stock.change.toFixed(2)})</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${formatMarketCap(stock.market_cap)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${formatVolume(stock.volume)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="showStockDetails('${stock.symbol}')" class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        Details
                    </button>
                    <button onclick="toggleWatchlist('${stock.symbol}')" class="${isInWatchlist ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'} hover:text-yellow-600 dark:hover:text-yellow-400">
                        <svg class="w-4 h-4" fill="${isInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                    </button>
                    <button onclick="addToPortfolio('${stock.symbol}')" class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterStocks() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('filter-select')?.value || 'all';
    
    let filteredData = currentStockData.filter(stock => {
        const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm) || 
                             stock.name.toLowerCase().includes(searchTerm);
        
        let matchesFilter = true;
        switch (filterValue) {
            case 'gainers':
                matchesFilter = stock.change_percent > 0;
                break;
            case 'losers':
                matchesFilter = stock.change_percent < 0;
                break;
            case 'watchlist':
                matchesFilter = watchlist.includes(stock.symbol);
                break;
            case 'portfolio':
                matchesFilter = portfolio.some(p => p.symbol === stock.symbol);
                break;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    // Sort data
    filteredData.sort((a, b) => {
        let aVal = a[currentSort.field];
        let bVal = b[currentSort.field];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    displayStockTable(filteredData);
}

function toggleWatchlist(symbol) {
    const index = watchlist.indexOf(symbol);
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(symbol);
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    
    // Update watchlist button
    const watchlistBtn = document.getElementById('watchlist-btn');
    if (watchlistBtn) {
        watchlistBtn.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            Watchlist (${watchlist.length})
        `;
    }
    
    filterStocks();
}

function addToPortfolio(symbol) {
    const stock = currentStockData.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const shares = prompt(`How many shares of ${symbol} do you own?`);
    if (shares && !isNaN(shares) && shares > 0) {
        const portfolioItem = {
            symbol: symbol,
            shares: parseFloat(shares),
            avgPrice: parseFloat(prompt(`What was your average purchase price for ${symbol}?`) || stock.current_price),
            dateAdded: new Date().toISOString()
        };
        
        const existingIndex = portfolio.findIndex(p => p.symbol === symbol);
        if (existingIndex > -1) {
            portfolio[existingIndex] = portfolioItem;
        } else {
            portfolio.push(portfolioItem);
        }
        
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
        
        // Update portfolio button
        const portfolioBtn = document.getElementById('portfolio-btn');
        if (portfolioBtn) {
            portfolioBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Portfolio (${portfolio.length})
            `;
        }
        
        filterStocks();
    }
}

function showWatchlistModal() {
    const watchlistStocks = currentStockData.filter(stock => watchlist.includes(stock.symbol));
    showCustomModal('Watchlist', watchlistStocks, 'watchlist');
}

function showPortfolioModal() {
    const portfolioStocks = portfolio.map(item => {
        const stock = currentStockData.find(s => s.symbol === item.symbol);
        if (stock) {
            const currentValue = item.shares * stock.current_price;
            const totalCost = item.shares * item.avgPrice;
            const gainLoss = currentValue - totalCost;
            const gainLossPercent = (gainLoss / totalCost) * 100;
            
            return {
                ...stock,
                portfolioData: {
                    shares: item.shares,
                    avgPrice: item.avgPrice,
                    currentValue: currentValue,
                    totalCost: totalCost,
                    gainLoss: gainLoss,
                    gainLossPercent: gainLossPercent
                }
            };
        }
        return null;
    }).filter(Boolean);
    
    showCustomModal('Portfolio', portfolioStocks, 'portfolio');
}

function showCustomModal(title, stocks, type) {
    const modal = document.getElementById('stock-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = title;
    
    let content = `<div class="space-y-4">`;
    
    if (type === 'portfolio') {
        const totalValue = stocks.reduce((sum, stock) => sum + stock.portfolioData.currentValue, 0);
        const totalCost = stocks.reduce((sum, stock) => sum + stock.portfolioData.totalCost, 0);
        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = (totalGainLoss / totalCost) * 100;
        
        content += `
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 class="text-lg font-semibold mb-2">Portfolio Summary</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                        <p class="text-lg font-bold">$${totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
                        <p class="text-lg">$${totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Gain/Loss</p>
                        <p class="text-lg font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                            ${totalGainLoss >= 0 ? '+' : ''}$${totalGainLoss.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Gain/Loss %</p>
                        <p class="text-lg font-bold ${totalGainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                            ${totalGainLossPercent >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    stocks.forEach(stock => {
        const changeClass = stock.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const changeIcon = stock.change_percent >= 0 ? '↗' : '↘';
        
        content += `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h5 class="font-semibold">${stock.symbol} - ${stock.name}</h5>
                        <p class="text-sm text-gray-500 dark:text-gray-400">$${stock.current_price.toFixed(2)} 
                           <span class="${changeClass}">${changeIcon} ${stock.change_percent.toFixed(2)}%</span>
                        </p>
                        ${type === 'portfolio' ? `
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                ${stock.portfolioData.shares} shares @ $${stock.portfolioData.avgPrice.toFixed(2)} avg
                            </p>
                            <p class="text-sm ${stock.portfolioData.gainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${stock.portfolioData.gainLossPercent >= 0 ? '+' : ''}${stock.portfolioData.gainLossPercent.toFixed(2)}% 
                                (${stock.portfolioData.gainLoss >= 0 ? '+' : ''}$${stock.portfolioData.gainLoss.toFixed(2)})
                            </p>
                        ` : ''}
                    </div>
                    <button onclick="showStockDetails('${stock.symbol}')" class="btn-primary text-sm">
                        Details
                    </button>
                </div>
            </div>
        `;
    });
    
    content += `</div>`;
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
}

function checkPriceAlerts(stockData) {
    // Check for significant price movements and show notifications
    stockData.forEach(stock => {
        if (Math.abs(stock.change_percent) > 5) {
            showNotification(`${stock.symbol} has moved ${stock.change_percent.toFixed(2)}% today!`);
        }
    });
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Stock Alert', { body: message });
    }
    
    // Also show in-app notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

function displayMarketSummary(summaryData) {
    const marketSummary = summaryData.market_summary;
    document.getElementById('gainers-count').textContent = marketSummary.gainers;
    document.getElementById('losers-count').textContent = marketSummary.losers;
    document.getElementById('total-stocks').textContent = marketSummary.total_stocks;
    
    const summaryText = `${marketSummary.gainers} gainers, ${marketSummary.losers} losers`;
    document.getElementById('market-summary').textContent = summaryText;
}

function updateLastUpdated(timestamp) {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString();
    document.getElementById('last-updated').textContent = `Last updated: ${formattedDate}`;
}

function formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
        return `$${marketCap.toLocaleString()}`;
    }
}

function formatVolume(volume) {
    if (volume >= 1e9) {
        return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
        return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
        return `${(volume / 1e3).toFixed(2)}K`;
    } else {
        return volume.toLocaleString();
    }
}

function showStockDetails(symbol) {
    fetch('data/stocks.json')
        .then(response => response.json())
        .then(stockData => {
            const stock = stockData.find(s => s.symbol === symbol);
            if (stock) {
                displayStockModal(stock);
            }
        })
        .catch(error => {
            console.error('Error fetching stock details:', error);
        });
}

function displayStockModal(stock) {
    const modal = document.getElementById('stock-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = `${stock.symbol} - ${stock.name}`;
    
    const changeClass = stock.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const changeIcon = stock.change_percent >= 0 ? '↗' : '↘';
    
    modalContent.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Price Information -->
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3">Price Information</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                            <p class="text-xl font-bold">$${stock.current_price.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Change</p>
                            <p class="text-lg font-semibold ${changeClass}">${changeIcon} ${stock.change_percent.toFixed(2)}%</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Previous Close</p>
                            <p class="text-lg">$${stock.previous_close.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Open</p>
                            <p class="text-lg">$${stock.open.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Day Range</p>
                            <p class="text-lg">$${stock.day_low.toFixed(2)} - $${stock.day_high.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">52 Week Range</p>
                            <p class="text-lg">$${stock.fifty_two_week_low.toFixed(2)} - $${stock.fifty_two_week_high.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Company Information -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3">Company Information</h4>
                    <div class="space-y-2">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Sector</p>
                            <p class="font-medium">${stock.sector || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                            <p class="font-medium">${stock.industry || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                            <p class="font-medium">${stock.employees ? stock.employees.toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Website</p>
                            <p class="font-medium">${stock.website ? `<a href="${stock.website}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${stock.website}</a>` : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Financial Metrics -->
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3">Financial Metrics</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                            <p class="font-medium">${formatMarketCap(stock.market_cap)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">P/E Ratio</p>
                            <p class="font-medium">${stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Forward P/E</p>
                            <p class="font-medium">${stock.forward_pe ? stock.forward_pe.toFixed(2) : 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Price to Book</p>
                            <p class="font-medium">${stock.price_to_book ? stock.price_to_book.toFixed(2) : 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Dividend Yield</p>
                            <p class="font-medium">${stock.dividend_yield ? (stock.dividend_yield * 100).toFixed(2) + '%' : 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Beta</p>
                            <p class="font-medium">${stock.beta ? stock.beta.toFixed(2) : 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Trading Information -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 class="text-lg font-semibold mb-3">Trading Information</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                            <p class="font-medium">${formatVolume(stock.volume)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Avg Volume</p>
                            <p class="font-medium">${formatVolume(stock.avg_volume)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Shares Outstanding</p>
                            <p class="font-medium">${formatVolume(stock.shares_outstanding)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Float Shares</p>
                            <p class="font-medium">${formatVolume(stock.float_shares)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Price Chart -->
        ${stock.historical_data && stock.historical_data.length > 0 ? `
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-3">30-Day Price Chart</h4>
            <canvas id="price-chart" width="400" height="200"></canvas>
        </div>
        ` : ''}
        
        <!-- Business Summary -->
        ${stock.business_summary ? `
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-3">Business Summary</h4>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${stock.business_summary}</p>
        </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
    
    // Create price chart if historical data is available
    if (stock.historical_data && stock.historical_data.length > 0) {
        setTimeout(() => createPriceChart(stock.historical_data), 100);
    }
}

function createPriceChart(historicalData) {
    const ctx = document.getElementById('price-chart');
    if (!ctx) return;
    
    const labels = historicalData.map(d => d.date);
    const prices = historicalData.map(d => d.close);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Close Price',
                data: prices,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    }
                }
            }
        }
    });
}
