# Advanced Stock Market Dashboard

A comprehensive, interactive stock market dashboard that automatically fetches stock data every 5 minutes using GitHub Actions and displays detailed financial information with interactive charts, technical analysis, and advanced market insights.

## 🚀 **Major Enhancements in This Version**

### **📊 Advanced Analytics & Technical Indicators**
- **Technical Analysis**: RSI, MACD, Bollinger Bands, Moving Averages
- **Market Sentiment**: Real-time sentiment analysis and market breadth
- **Sector Rotation**: Track sector performance and rotation patterns
- **Risk-Return Analysis**: Scatter plots showing risk vs return relationships
- **Correlation Matrix**: Visualize stock correlations and relationships

### **🎯 Portfolio & Watchlist Management**
- **Personal Portfolio**: Track your holdings with gain/loss calculations
- **Custom Watchlists**: Create and manage multiple watchlists
- **Portfolio Analytics**: Real-time portfolio performance tracking
- **Price Alerts**: Notifications for significant price movements

### **📈 Enhanced Data & Charts**
- **60-Day Historical Data**: Extended price history for better analysis
- **Advanced Charts**: Interactive charts with technical indicators
- **Volume Analysis**: Volume patterns and unusual activity detection
- **Earnings Data**: Earnings dates, estimates, and historical performance

### **🔍 Advanced Search & Filtering**
- **Real-time Search**: Search by symbol or company name
- **Smart Filtering**: Filter by gainers, losers, watchlist, portfolio
- **Multi-column Sorting**: Sort by any metric (price, volume, market cap, etc.)
- **Sector Analysis**: Filter and analyze by sector performance

### **📱 Enhanced User Experience**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle themes with persistent preferences
- **Auto-refresh**: Data updates every 30 seconds
- **Interactive Modals**: Detailed stock information with charts
- **Notifications**: Browser and in-app notifications for alerts

## Features

### 🚀 **Automated Data Fetching**
- **GitHub Actions**: Automatically fetches stock data every 5 minutes
- **Real-time Updates**: Data is updated continuously throughout trading hours
- **Comprehensive Data**: Fetches 150+ financial metrics for each stock
- **Technical Indicators**: Calculates RSI, MACD, Bollinger Bands, and more

### 📊 **Interactive Dashboard**
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Real-time Charts**: Interactive 60-day price charts with technical indicators
- **Detailed Modals**: Click any stock for comprehensive financial analysis
- **Market Overview**: Summary cards showing gainers, losers, and total stocks
- **Advanced Analytics**: Dedicated analytics page with market insights

### 📈 **Comprehensive Stock Data**
- **Price Information**: Current price, change, day range, 52-week range
- **Financial Metrics**: P/E ratio, market cap, dividend yield, beta, enterprise value
- **Company Information**: Sector, industry, employees, website, business summary
- **Trading Data**: Volume, shares outstanding, institutional ownership, short interest
- **Analyst Ratings**: Target prices, recommendations, analyst opinions
- **Earnings Data**: Next earnings date, estimates, historical earnings
- **Technical Indicators**: RSI, MACD, moving averages, Bollinger Bands

### 🎨 **User Experience**
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Interactive Elements**: Hover effects, smooth animations, and transitions
- **Portfolio Tracking**: Personal portfolio management with P&L tracking
- **Watchlists**: Custom watchlists with real-time updates

## Supported Stocks

The dashboard currently tracks these major stocks:
- **AAPL** - Apple Inc.
- **MSFT** - Microsoft Corporation
- **GOOGL** - Alphabet Inc.
- **AMZN** - Amazon.com Inc.
- **TSLA** - Tesla Inc.
- **NVDA** - NVIDIA Corporation
- **META** - Meta Platforms Inc.
- **NFLX** - Netflix Inc.
- **AMD** - Advanced Micro Devices
- **INTC** - Intel Corporation
- **JPM** - JPMorgan Chase & Co.
- **JNJ** - Johnson & Johnson
- **V** - Visa Inc.
- **PG** - Procter & Gamble Co.
- **UNH** - UnitedHealth Group Inc.

## Data Sources

All stock data is fetched from **Yahoo Finance** using the `yfinance` Python library, providing:
- Real-time and historical price data
- Comprehensive company information
- Financial ratios and metrics
- Analyst recommendations and target prices
- Earnings data and estimates
- Technical indicators and market data

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd stock-market-dashboard
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Test the Data Fetching Script
```bash
python fetch_stock_data.py
```

### 4. View the Dashboard
Open `index.html` in your web browser to view the main dashboard.
Open `analytics.html` to view the advanced analytics page.

## GitHub Actions Configuration

The automated data fetching is configured in `.github/workflows/fetch-stock-data.yml`:

- **Schedule**: Runs every 5 minutes (`*/5 * * * *`)
- **Manual Trigger**: Can be triggered manually via GitHub Actions
- **Dependencies**: Automatically installs Python and required packages
- **Data Storage**: Saves data to `data/stocks.json` and `data/summary.json`
- **Auto-commit**: Automatically commits updated data to the repository

## File Structure

```
stock-market-dashboard/
├── index.html              # Main dashboard page
├── analytics.html          # Advanced analytics dashboard
├── script.js               # Interactive JavaScript functionality
├── analytics.js            # Analytics dashboard JavaScript
├── styles.css              # Custom CSS styles
├── fetch_stock_data.py     # Python script for fetching stock data
├── serve.py                # Local development server
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── SETUP_GUIDE.md         # Quick setup instructions
├── .github/
│   └── workflows/
│       └── fetch-stock-data.yml  # GitHub Actions workflow
└── data/
    ├── stocks.json         # Comprehensive stock data
    └── summary.json        # Market summary data
```

## Data Schema

### Stock Data (`data/stocks.json`)
Each stock contains:
- Basic info (symbol, name, sector, industry)
- Price data (current, change, ranges)
- Financial metrics (P/E, market cap, ratios)
- Trading information (volume, shares)
- Company details (employees, website, business summary)
- Historical data (60-day price chart data)
- Technical indicators (RSI, MACD, moving averages)
- Earnings data (dates, estimates, historical)

### Summary Data (`data/summary.json`)
Contains:
- Last updated timestamp
- Market summary (gainers, losers, total stocks)
- Market sentiment analysis
- Sector breakdown and performance
- Array of all stock data

## Advanced Features

### **Portfolio Management**
- Add stocks to your portfolio with share count and average price
- Real-time portfolio value and gain/loss tracking
- Portfolio performance analytics
- Export portfolio data

### **Watchlist Features**
- Create multiple watchlists
- Add/remove stocks with one click
- Watchlist performance tracking
- Custom alerts and notifications

### **Technical Analysis**
- RSI (Relative Strength Index) calculations
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands analysis
- Moving averages (SMA 20, SMA 50)
- Volume analysis and patterns

### **Market Analytics**
- Market breadth analysis
- Sector rotation tracking
- Correlation matrix visualization
- Risk-return scatter plots
- Volatility analysis
- Performance rankings

## Customization

### Adding New Stocks
Edit the `symbols` list in `fetch_stock_data.py`:
```python
symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'NEW_STOCK']
```

### Changing Update Frequency
Modify the cron schedule in `.github/workflows/fetch-stock-data.yml`:
```yaml
cron: '*/5 * * * *'  # Every 5 minutes
# cron: '0 */1 * * *'  # Every hour
# cron: '0 0 * * *'    # Daily
```

### Styling Customization
- Edit `styles.css` for custom CSS
- Modify `index.html` for layout changes
- Update `script.js` for functionality changes

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Performance

- **Data Fetching**: ~45 seconds for all stocks
- **Dashboard Load**: <2 seconds
- **Auto-refresh**: Every 30 seconds
- **Chart Rendering**: <1 second
- **Technical Indicators**: Real-time calculation

## Troubleshooting

### Data Not Updating
1. Check GitHub Actions workflow status
2. Verify yfinance library is working
3. Check for API rate limiting

### Charts Not Displaying
1. Ensure Chart.js is loaded
2. Check browser console for errors
3. Verify historical data exists

### Styling Issues
1. Clear browser cache
2. Check CSS file loading
3. Verify Tailwind CSS is accessible

### Portfolio/Watchlist Issues
1. Check browser localStorage permissions
2. Clear browser data if needed
3. Verify JavaScript is enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Open an issue on GitHub

---

**Note**: This dashboard is for educational and informational purposes only. Stock data may be delayed and should not be used as the sole basis for investment decisions.