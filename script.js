document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    setupThemeToggle();
    
    // Load and display stock data
    loadStockData();
    
    // Set up modal functionality
    setupModal();
    
    // Auto-refresh data every 30 seconds
    setInterval(loadStockData, 30000);
});

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

function loadStockData() {
    Promise.all([
        fetch('data/stocks.json').then(response => response.json()),
        fetch('data/summary.json').then(response => response.json())
    ])
    .then(([stockData, summaryData]) => {
        displayStockTable(stockData);
        displayMarketSummary(summaryData);
        updateLastUpdated(summaryData.last_updated);
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
                <button onclick="showStockDetails('${stock.symbol}')" class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                    Details
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
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
