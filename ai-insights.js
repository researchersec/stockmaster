// ===== AI INSIGHTS MODULE =====

// AI Insights State
const AIInsightsState = {
    lastUpdate: null,
    insights: {
        marketSentiment: null,
        topPick: null,
        riskAlert: null
    },
    isGenerating: false
};

// Initialize AI Insights
function initializeAIInsights() {
    console.log('🤖 Initializing AI Insights...');
    
    // Set up event listeners
    const refreshButton = document.getElementById('refresh-insights');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshAIInsights);
    }
    
    // Generate initial insights
    generateAIInsights();
    
    // Set up periodic refresh
    setInterval(refreshAIInsights, 300000); // Refresh every 5 minutes
}

// Generate AI Insights based on current stock data
async function generateAIInsights() {
    if (AIInsightsState.isGenerating) return;
    
    AIInsightsState.isGenerating = true;
    updateInsightsUI('Generating insights...', 'Analyzing market data...', 'Processing...');
    
    try {
        // Get current stock data
        const stockData = AppState.stocks;
        
        if (!stockData || stockData.length === 0) {
            updateInsightsUI('No data available', 'No data available', 'No data available');
            return;
        }
        
        // Analyze market sentiment
        const sentiment = analyzeMarketSentiment(stockData);
        
        // Find top pick
        const topPick = findTopPick(stockData);
        
        // Check for risks
        const riskAlert = identifyRisks(stockData);
        
        // Update state
        AIInsightsState.insights = {
            marketSentiment: sentiment,
            topPick: topPick,
            riskAlert: riskAlert
        };
        AIInsightsState.lastUpdate = new Date();
        
        // Update UI
        updateInsightsUI(sentiment, topPick, riskAlert);
        
        // Store in AppState
        AppState.aiInsights = AIInsightsState.insights;
        
        console.log('✅ AI Insights generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating AI insights:', error);
        updateInsightsUI('Error analyzing data', 'Unable to generate pick', 'Error checking risks');
    } finally {
        AIInsightsState.isGenerating = false;
    }
}

// Refresh AI Insights
async function refreshAIInsights() {
    console.log('🔄 Refreshing AI Insights...');
    await generateAIInsights();
}

// Analyze market sentiment based on stock data
function analyzeMarketSentiment(stockData) {
    const totalStocks = stockData.length;
    const positiveStocks = stockData.filter(stock => 
        parseFloat(stock.change_percent) > 0
    ).length;
    const negativeStocks = stockData.filter(stock => 
        parseFloat(stock.change_percent) < 0
    ).length;
    const neutralStocks = totalStocks - positiveStocks - negativeStocks;
    
    const positivePercentage = (positiveStocks / totalStocks) * 100;
    const negativePercentage = (negativeStocks / totalStocks) * 100;
    
    // Calculate average change
    const avgChange = stockData.reduce((sum, stock) => 
        sum + parseFloat(stock.change_percent), 0
    ) / totalStocks;
    
    let sentiment = '';
    let sentimentClass = '';
    
    if (positivePercentage > 60 && avgChange > 1) {
        sentiment = `Bullish market sentiment with ${positivePercentage.toFixed(1)}% of stocks up. Average gain: ${avgChange.toFixed(2)}%`;
        sentimentClass = 'text-green-600';
    } else if (negativePercentage > 60 && avgChange < -1) {
        sentiment = `Bearish market sentiment with ${negativePercentage.toFixed(1)}% of stocks down. Average loss: ${Math.abs(avgChange).toFixed(2)}%`;
        sentimentClass = 'text-red-600';
    } else if (Math.abs(avgChange) < 0.5) {
        sentiment = `Neutral market sentiment. Mixed performance with ${positivePercentage.toFixed(1)}% up, ${negativePercentage.toFixed(1)}% down`;
        sentimentClass = 'text-yellow-600';
    } else {
        sentiment = `Mixed market sentiment. ${positivePercentage.toFixed(1)}% positive, ${negativePercentage.toFixed(1)}% negative`;
        sentimentClass = 'text-blue-600';
    }
    
    return { text: sentiment, class: sentimentClass };
}

// Find top pick based on various metrics
function findTopPick(stockData) {
    if (!stockData || stockData.length === 0) return 'No data available';
    
    // Score stocks based on multiple factors
    const scoredStocks = stockData.map(stock => {
        let score = 0;
        
        // Price change (positive is good)
        const changePercent = parseFloat(stock.change_percent);
        score += changePercent * 2;
        
        // Volume (higher is better)
        const volume = parseFloat(stock.volume) || 0;
        const avgVolume = stockData.reduce((sum, s) => sum + (parseFloat(s.volume) || 0), 0) / stockData.length;
        if (volume > avgVolume) {
            score += 10;
        }
        
        // Market cap (prefer mid-cap stocks)
        const marketCap = parseFloat(stock.market_cap) || 0;
        if (marketCap > 1e9 && marketCap < 1e11) { // 1B to 100B
            score += 5;
        }
        
        // P/E ratio (reasonable P/E is good)
        const peRatio = parseFloat(stock.pe_ratio) || 0;
        if (peRatio > 0 && peRatio < 25) {
            score += 3;
        }
        
        return {
            symbol: stock.symbol,
            name: stock.name,
            score: score,
            changePercent: changePercent,
            price: stock.current_price
        };
    });
    
    // Sort by score and get top pick
    scoredStocks.sort((a, b) => b.score - a.score);
    const topPick = scoredStocks[0];
    
    if (topPick.score > 0) {
        return `${topPick.symbol} (${topPick.name}) - Strong momentum with ${topPick.changePercent.toFixed(2)}% gain. Current price: $${topPick.price}`;
    } else {
        return `${topPick.symbol} (${topPick.name}) - Best relative performance. Current price: $${topPick.price}`;
    }
}

// Identify potential risks in the market
function identifyRisks(stockData) {
    if (!stockData || stockData.length === 0) return 'No data available';
    
    const risks = [];
    
    // Check for high volatility
    const changes = stockData.map(stock => Math.abs(parseFloat(stock.change_percent)));
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    if (avgChange > 5) {
        risks.push('High market volatility detected');
    }
    
    // Check for stocks with extreme losses
    const bigLosers = stockData.filter(stock => 
        parseFloat(stock.change_percent) < -10
    );
    
    if (bigLosers.length > 0) {
        risks.push(`${bigLosers.length} stocks down more than 10%`);
    }
    
    // Check for low volume stocks
    const lowVolumeStocks = stockData.filter(stock => 
        parseFloat(stock.volume) < 1000000
    );
    
    if (lowVolumeStocks.length > stockData.length * 0.3) {
        risks.push('Many stocks showing low trading volume');
    }
    
    // Check for overvalued stocks (high P/E)
    const highPEStocks = stockData.filter(stock => {
        const pe = parseFloat(stock.pe_ratio);
        return pe > 50 && pe > 0;
    });
    
    if (highPEStocks.length > 0) {
        risks.push(`${highPEStocks.length} stocks with P/E ratios above 50`);
    }
    
    if (risks.length === 0) {
        return 'No significant risks detected at this time';
    }
    
    return risks.join('. ');
}

// Update the insights UI
function updateInsightsUI(sentiment, topPick, riskAlert) {
    const sentimentElement = document.getElementById('market-sentiment');
    const topPickElement = document.getElementById('top-pick');
    const riskAlertElement = document.getElementById('risk-alert');
    
    if (sentimentElement) {
        if (typeof sentiment === 'object' && sentiment.text) {
            sentimentElement.textContent = sentiment.text;
            sentimentElement.className = `text-sm ${sentiment.class}`;
        } else {
            sentimentElement.textContent = sentiment || 'Analyzing market data...';
            sentimentElement.className = 'text-sm text-gray-600 dark:text-gray-300';
        }
    }
    
    if (topPickElement) {
        topPickElement.textContent = topPick || 'Loading recommendations...';
    }
    
    if (riskAlertElement) {
        riskAlertElement.textContent = riskAlert || 'Monitoring for risks...';
    }
}

// Export functions for global access
window.generateAIInsights = generateAIInsights;
window.refreshAIInsights = refreshAIInsights;
window.initializeAIInsights = initializeAIInsights;