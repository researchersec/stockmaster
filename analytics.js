document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    loadAnalyticsData();
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

function loadAnalyticsData() {
    fetch('data/stocks.json')
        .then(response => response.json())
        .then(stockData => {
            displayMarketBreadth(stockData);
            displaySectorRotation(stockData);
            displayMarketMomentum(stockData);
            createCorrelationChart(stockData);
            createRiskReturnChart(stockData);
            displayPerformanceRankings(stockData);
            displayVolatilityAnalysis(stockData);
            displayTechnicalSummary(stockData);
        })
        .catch(error => {
            console.error('Error loading analytics data:', error);
        });
}

function displayMarketBreadth(stockData) {
    const container = document.getElementById('market-breadth');
    
    const gainers = stockData.filter(s => s.change_percent > 0).length;
    const losers = stockData.filter(s => s.change_percent < 0).length;
    const unchanged = stockData.filter(s => s.change_percent === 0).length;
    const total = stockData.length;
    
    const breadthRatio = gainers / (gainers + losers);
    const breadthClass = breadthRatio > 0.6 ? 'text-green-600 dark:text-green-400' : 
                        breadthRatio < 0.4 ? 'text-red-600 dark:text-red-400' : 
                        'text-yellow-600 dark:text-yellow-400';
    
    container.innerHTML = `
        <div class="text-center">
            <div class="text-3xl font-bold ${breadthClass}">${(breadthRatio * 100).toFixed(1)}%</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Breadth Ratio</div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
            <div>
                <div class="text-lg font-semibold text-green-600 dark:text-green-400">${gainers}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Gainers</div>
            </div>
            <div>
                <div class="text-lg font-semibold text-red-600 dark:text-red-400">${losers}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Losers</div>
            </div>
            <div>
                <div class="text-lg font-semibold text-gray-600 dark:text-gray-400">${unchanged}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Unchanged</div>
            </div>
        </div>
        <div class="mt-3">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="h-2 rounded-full bg-green-500" style="width: ${(gainers/total)*100}%"></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ${gainers} of ${total} stocks advancing
            </div>
        </div>
    `;
}

function displaySectorRotation(stockData) {
    const container = document.getElementById('sector-rotation');
    
    // Group stocks by sector
    const sectors = {};
    stockData.forEach(stock => {
        const sector = stock.sector || 'Unknown';
        if (!sectors[sector]) {
            sectors[sector] = [];
        }
        sectors[sector].push(stock);
    });
    
    // Calculate sector performance
    const sectorPerformance = Object.entries(sectors).map(([sector, stocks]) => {
        const avgChange = stocks.reduce((sum, stock) => sum + stock.change_percent, 0) / stocks.length;
        const totalMarketCap = stocks.reduce((sum, stock) => sum + stock.market_cap, 0);
        return { sector, avgChange, totalMarketCap, count: stocks.length };
    }).sort((a, b) => b.avgChange - a.avgChange);
    
    container.innerHTML = sectorPerformance.map(sector => {
        const changeClass = sector.avgChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const changeIcon = sector.avgChange >= 0 ? '↗' : '↘';
        
        return `
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                    <div class="font-medium text-sm">${sector.sector}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${sector.count} stocks</div>
                </div>
                <div class="text-right">
                    <div class="font-medium text-sm ${changeClass}">${changeIcon} ${sector.avgChange.toFixed(2)}%</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">$${(sector.totalMarketCap / 1e12).toFixed(2)}T</div>
                </div>
            </div>
        `;
    }).join('');
}

function displayMarketMomentum(stockData) {
    const container = document.getElementById('market-momentum');
    
    // Calculate momentum indicators
    const avgChange = stockData.reduce((sum, stock) => sum + stock.change_percent, 0) / stockData.length;
    const avgVolume = stockData.reduce((sum, stock) => sum + stock.volume, 0) / stockData.length;
    const avgMarketCap = stockData.reduce((sum, stock) => sum + stock.market_cap, 0) / stockData.length;
    
    // Calculate momentum score
    const momentumScore = (avgChange * 0.5) + (Math.log(avgVolume / 1e6) * 0.3) + (Math.log(avgMarketCap / 1e9) * 0.2);
    
    const momentumClass = momentumScore > 0.5 ? 'text-green-600 dark:text-green-400' : 
                         momentumScore < -0.5 ? 'text-red-600 dark:text-red-400' : 
                         'text-yellow-600 dark:text-yellow-400';
    
    container.innerHTML = `
        <div class="text-center mb-4">
            <div class="text-3xl font-bold ${momentumClass}">${momentumScore.toFixed(2)}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Momentum Score</div>
        </div>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-sm">Avg Change:</span>
                <span class="text-sm font-medium ${avgChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                    ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%
                </span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm">Avg Volume:</span>
                <span class="text-sm font-medium">${formatVolume(avgVolume)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm">Avg Market Cap:</span>
                <span class="text-sm font-medium">${formatMarketCap(avgMarketCap)}</span>
            </div>
        </div>
    `;
}

function createCorrelationChart(stockData) {
    const ctx = document.getElementById('correlation-chart');
    if (!ctx) return;
    
    // Calculate correlation matrix (simplified)
    const symbols = stockData.map(s => s.symbol);
    const correlationData = [];
    
    for (let i = 0; i < symbols.length; i++) {
        for (let j = 0; j < symbols.length; j++) {
            if (i === j) {
                correlationData.push(1);
            } else {
                // Simplified correlation based on price changes
                const correlation = Math.random() * 0.8 + 0.2; // Placeholder
                correlationData.push(correlation);
            }
        }
    }
    
    new Chart(ctx, {
        type: 'heatmap',
        data: {
            labels: symbols,
            datasets: [{
                label: 'Correlation',
                data: correlationData,
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    const alpha = Math.abs(value);
                    return value > 0 ? 
                        `rgba(59, 130, 246, ${alpha})` : 
                        `rgba(239, 68, 68, ${alpha})`;
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createRiskReturnChart(stockData) {
    const ctx = document.getElementById('risk-return-chart');
    if (!ctx) return;
    
    const riskReturnData = stockData.map(stock => ({
        x: Math.abs(stock.change_percent), // Risk (volatility)
        y: stock.change_percent, // Return
        symbol: stock.symbol,
        marketCap: stock.market_cap
    }));
    
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Risk-Return',
                data: riskReturnData,
                backgroundColor: riskReturnData.map(d => 
                    d.y > 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                ),
                borderColor: riskReturnData.map(d => 
                    d.y > 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                ),
                borderWidth: 1,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = context.raw;
                            return `${data.symbol}: ${data.y.toFixed(2)}% return, ${data.x.toFixed(2)}% risk`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Risk (Volatility %)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Return (%)'
                    }
                }
            }
        }
    });
}

function displayPerformanceRankings(stockData) {
    const container = document.getElementById('performance-rankings');
    
    const sortedStocks = [...stockData].sort((a, b) => b.change_percent - a.change_percent);
    
    container.innerHTML = `
        <div class="mb-4">
            <h4 class="font-semibold text-green-600 dark:text-green-400 mb-2">Top Performers</h4>
            ${sortedStocks.slice(0, 5).map((stock, index) => `
                <div class="flex justify-between items-center p-2 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''} rounded">
                    <div class="flex items-center">
                        <span class="text-sm font-medium mr-2">${index + 1}.</span>
                        <span class="text-sm font-medium">${stock.symbol}</span>
                    </div>
                    <span class="text-sm font-medium text-green-600 dark:text-green-400">
                        +${stock.change_percent.toFixed(2)}%
                    </span>
                </div>
            `).join('')}
        </div>
        <div>
            <h4 class="font-semibold text-red-600 dark:text-red-400 mb-2">Worst Performers</h4>
            ${sortedStocks.slice(-5).reverse().map((stock, index) => `
                <div class="flex justify-between items-center p-2 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''} rounded">
                    <div class="flex items-center">
                        <span class="text-sm font-medium mr-2">${sortedStocks.length - 4 + index}.</span>
                        <span class="text-sm font-medium">${stock.symbol}</span>
                    </div>
                    <span class="text-sm font-medium text-red-600 dark:text-red-400">
                        ${stock.change_percent.toFixed(2)}%
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

function displayVolatilityAnalysis(stockData) {
    const container = document.getElementById('volatility-analysis');
    
    // Calculate volatility metrics
    const volatilities = stockData.map(stock => Math.abs(stock.change_percent));
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    const maxVolatility = Math.max(...volatilities);
    const minVolatility = Math.min(...volatilities);
    
    const highVolStocks = stockData.filter(stock => Math.abs(stock.change_percent) > avgVolatility * 1.5);
    const lowVolStocks = stockData.filter(stock => Math.abs(stock.change_percent) < avgVolatility * 0.5);
    
    container.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                    <div class="text-lg font-semibold">${avgVolatility.toFixed(2)}%</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Avg Volatility</div>
                </div>
                <div>
                    <div class="text-lg font-semibold">${maxVolatility.toFixed(2)}%</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Max Volatility</div>
                </div>
                <div>
                    <div class="text-lg font-semibold">${minVolatility.toFixed(2)}%</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Min Volatility</div>
                </div>
            </div>
            <div>
                <div class="text-sm font-medium mb-2">High Volatility Stocks (${highVolStocks.length})</div>
                <div class="space-y-1">
                    ${highVolStocks.slice(0, 3).map(stock => `
                        <div class="flex justify-between text-sm">
                            <span>${stock.symbol}</span>
                            <span class="${stock.change_percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                ${stock.change_percent >= 0 ? '+' : ''}${stock.change_percent.toFixed(2)}%
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function displayTechnicalSummary(stockData) {
    const container = document.getElementById('technical-summary');
    
    // Analyze technical indicators
    const stocksWithIndicators = stockData.filter(stock => stock.technical_indicators && Object.keys(stock.technical_indicators).length > 0);
    
    const rsiAnalysis = analyzeRSI(stocksWithIndicators);
    const macdAnalysis = analyzeMACD(stocksWithIndicators);
    const movingAverageAnalysis = analyzeMovingAverages(stocksWithIndicators);
    const volumeAnalysis = analyzeVolume(stockData);
    
    container.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-semibold mb-2">RSI Analysis</h4>
            <div class="text-sm">
                <div>Overbought: ${rsiAnalysis.overbought}</div>
                <div>Oversold: ${rsiAnalysis.oversold}</div>
                <div>Neutral: ${rsiAnalysis.neutral}</div>
            </div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-semibold mb-2">MACD Signals</h4>
            <div class="text-sm">
                <div>Bullish: ${macdAnalysis.bullish}</div>
                <div>Bearish: ${macdAnalysis.bearish}</div>
                <div>Neutral: ${macdAnalysis.neutral}</div>
            </div>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-semibold mb-2">Moving Averages</h4>
            <div class="text-sm">
                <div>Above SMA20: ${movingAverageAnalysis.aboveSMA20}</div>
                <div>Above SMA50: ${movingAverageAnalysis.aboveSMA50}</div>
                <div>Golden Cross: ${movingAverageAnalysis.goldenCross}</div>
            </div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 class="font-semibold mb-2">Volume Analysis</h4>
            <div class="text-sm">
                <div>High Volume: ${volumeAnalysis.highVolume}</div>
                <div>Low Volume: ${volumeAnalysis.lowVolume}</div>
                <div>Avg Volume: ${volumeAnalysis.avgVolume}</div>
            </div>
        </div>
    `;
}

function analyzeRSI(stocks) {
    const overbought = stocks.filter(s => s.technical_indicators.rsi > 70).length;
    const oversold = stocks.filter(s => s.technical_indicators.rsi < 30).length;
    const neutral = stocks.filter(s => s.technical_indicators.rsi >= 30 && s.technical_indicators.rsi <= 70).length;
    
    return { overbought, oversold, neutral };
}

function analyzeMACD(stocks) {
    const bullish = stocks.filter(s => s.technical_indicators.macd > 0).length;
    const bearish = stocks.filter(s => s.technical_indicators.macd < 0).length;
    const neutral = stocks.filter(s => s.technical_indicators.macd === 0).length;
    
    return { bullish, bearish, neutral };
}

function analyzeMovingAverages(stocks) {
    const aboveSMA20 = stocks.filter(s => s.current_price > s.technical_indicators.sma_20).length;
    const aboveSMA50 = stocks.filter(s => s.current_price > s.technical_indicators.sma_50).length;
    const goldenCross = stocks.filter(s => 
        s.technical_indicators.sma_20 > s.technical_indicators.sma_50
    ).length;
    
    return { aboveSMA20, aboveSMA50, goldenCross };
}

function analyzeVolume(stocks) {
    const avgVolume = stocks.reduce((sum, stock) => sum + stock.avg_volume, 0) / stocks.length;
    const highVolume = stocks.filter(s => s.volume > avgVolume * 1.5).length;
    const lowVolume = stocks.filter(s => s.volume < avgVolume * 0.5).length;
    
    return { highVolume, lowVolume, avgVolume: formatVolume(avgVolume) };
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