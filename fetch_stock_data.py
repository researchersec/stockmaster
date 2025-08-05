import yfinance as yf
import json
from datetime import datetime, timedelta
import os

# Define the list of stock symbols
symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

# Calculate yesterday's date (assuming script runs daily)
end_date = datetime.now().date()
start_date = end_date - timedelta(days=2)  # Get data for the last trading day

# Fetch stock data
stock_data = []
for symbol in symbols:
    ticker = yf.Ticker(symbol)
    # Fetch 1-day data with 1-day interval
    hist = ticker.history(start=start_date, end=end_date, interval='1d')
    if not hist.empty:
        close = hist['Close'].iloc[-1] if len(hist) > 0 else 0
        prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else close
        change_percent = ((close - prev_close) / prev_close * 100) if prev_close != 0 else 0
        stock_data.append({
            'symbol': symbol,
            'close': close,
            'change_percent': change_percent
        })

# Save to JSON file
os.makedirs('data', exist_ok=True)
with open('data/stocks.json', 'w') as f:
    json.dump(stock_data, f, indent=2)
