# Advanced Stock Market Dashboard

A comprehensive, interactive stock market dashboard that automatically fetches stock data every 5 minutes using GitHub Actions and displays detailed financial information with interactive charts.

## Features

### 🚀 Automated Data Fetching
- **GitHub Actions**: Automatically fetches stock data every 5 minutes
- **Real-time Updates**: Data is updated continuously throughout trading hours
- **Comprehensive Data**: Fetches 100+ financial metrics for each stock

### 📊 Interactive Dashboard
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Real-time Charts**: Interactive 30-day price charts using Chart.js
- **Detailed Modals**: Click any stock for comprehensive financial analysis
- **Market Overview**: Summary cards showing gainers, losers, and total stocks

### 📈 Comprehensive Stock Data
- **Price Information**: Current price, change, day range, 52-week range
- **Financial Metrics**: P/E ratio, market cap, dividend yield, beta
- **Company Information**: Sector, industry, employees, website
- **Trading Data**: Volume, shares outstanding, institutional ownership
- **Analyst Ratings**: Target prices, recommendations, analyst opinions

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Interactive Elements**: Hover effects, smooth animations, and transitions

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

## Data Sources

All stock data is fetched from **Yahoo Finance** using the `yfinance` Python library, providing:
- Real-time and historical price data
- Comprehensive company information
- Financial ratios and metrics
- Analyst recommendations and target prices

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
Open `index.html` in your web browser to view the dashboard.

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
├── script.js               # Interactive JavaScript functionality
├── styles.css              # Custom CSS styles
├── fetch_stock_data.py     # Python script for fetching stock data
├── requirements.txt        # Python dependencies
├── README.md              # This file
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
- Historical data (30-day price chart data)

### Summary Data (`data/summary.json`)
Contains:
- Last updated timestamp
- Market summary (gainers, losers, total stocks)
- Array of all stock data

## Customization

### Adding New Stocks
Edit the `symbols` list in `fetch_stock_data.py`:
```python
symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'NEW_STOCK']
```

### Changing Update Frequency
Modify the cron schedule in `.github/workflows/fetch-stock_data.yml`:
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

- **Data Fetching**: ~30 seconds for all stocks
- **Dashboard Load**: <2 seconds
- **Auto-refresh**: Every 30 seconds
- **Chart Rendering**: <1 second

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