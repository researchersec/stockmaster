import yfinance as yf
import json
from datetime import datetime, timedelta
import os
import time

# Define the list of stock symbols
symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']

def fetch_comprehensive_stock_data(symbol):
    """Fetch comprehensive stock data including company info and financial metrics"""
    try:
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        info = ticker.info
        
        # Get historical data for the last 30 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        hist = ticker.history(start=start_date, end=end_date, interval='1d')
        
        # Calculate price changes
        if not hist.empty:
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - prev_close
            change_percent = ((change / prev_close) * 100) if prev_close != 0 else 0
            
            # Get 5-day and 30-day changes
            five_day_ago = hist['Close'].iloc[-6] if len(hist) > 5 else current_price
            thirty_day_ago = hist['Close'].iloc[0] if len(hist) > 0 else current_price
            
            five_day_change = ((current_price - five_day_ago) / five_day_ago * 100) if five_day_ago != 0 else 0
            thirty_day_change = ((current_price - thirty_day_ago) / thirty_day_ago * 100) if thirty_day_ago != 0 else 0
            
            # Prepare historical data for charts
            historical_data = []
            for date, row in hist.iterrows():
                historical_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume'])
                })
        else:
            current_price = info.get('currentPrice', 0)
            change = 0
            change_percent = 0
            five_day_change = 0
            thirty_day_change = 0
            historical_data = []
        
        # Extract key financial metrics
        stock_data = {
            'symbol': symbol,
            'name': info.get('longName', info.get('shortName', symbol)),
            'current_price': current_price,
            'change': change,
            'change_percent': change_percent,
            'five_day_change': five_day_change,
            'thirty_day_change': thirty_day_change,
            'previous_close': info.get('previousClose', current_price),
            'open': info.get('open', current_price),
            'day_low': info.get('dayLow', current_price),
            'day_high': info.get('dayHigh', current_price),
            'volume': info.get('volume', 0),
            'avg_volume': info.get('averageVolume', 0),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'forward_pe': info.get('forwardPE', 0),
            'price_to_book': info.get('priceToBook', 0),
            'dividend_yield': info.get('dividendYield', 0),
            'beta': info.get('beta', 0),
            'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0),
            'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
            'fifty_day_avg': info.get('fiftyDayAverage', 0),
            'two_hundred_day_avg': info.get('twoHundredDayAverage', 0),
            'eps': info.get('trailingEps', 0),
            'forward_eps': info.get('forwardEps', 0),
            'revenue': info.get('totalRevenue', 0),
            'profit_margins': info.get('profitMargins', 0),
            'return_on_equity': info.get('returnOnEquity', 0),
            'debt_to_equity': info.get('debtToEquity', 0),
            'current_ratio': info.get('currentRatio', 0),
            'quick_ratio': info.get('quickRatio', 0),
            'free_cashflow': info.get('freeCashflow', 0),
            'operating_cashflow': info.get('operatingCashflow', 0),
            'total_cash': info.get('totalCash', 0),
            'total_debt': info.get('totalDebt', 0),
            'shares_outstanding': info.get('sharesOutstanding', 0),
            'float_shares': info.get('floatShares', 0),
            'shares_short': info.get('sharesShort', 0),
            'short_ratio': info.get('shortRatio', 0),
            'held_percent_insiders': info.get('heldPercentInsiders', 0),
            'held_percent_institutions': info.get('heldPercentInstitutions', 0),
            'target_mean_price': info.get('targetMeanPrice', 0),
            'target_median_price': info.get('targetMedianPrice', 0),
            'target_high_price': info.get('targetHighPrice', 0),
            'target_low_price': info.get('targetLowPrice', 0),
            'recommendation_mean': info.get('recommendationMean', 0),
            'recommendation_key': info.get('recommendationKey', ''),
            'number_of_analyst_opinions': info.get('numberOfAnalystOpinions', 0),
            'industry': info.get('industry', ''),
            'sector': info.get('sector', ''),
            'website': info.get('website', ''),
            'business_summary': info.get('longBusinessSummary', ''),
            'employees': info.get('fullTimeEmployees', 0),
            'country': info.get('country', ''),
            'city': info.get('city', ''),
            'state': info.get('state', ''),
            'phone': info.get('phone', ''),
            'historical_data': historical_data,
            'last_updated': datetime.now().isoformat()
        }
        
        return stock_data
        
    except Exception as e:
        print(f"Error fetching data for {symbol}: {str(e)}")
        return None

# Fetch stock data for all symbols
stock_data = []
for symbol in symbols:
    print(f"Fetching data for {symbol}...")
    data = fetch_comprehensive_stock_data(symbol)
    if data:
        stock_data.append(data)
    time.sleep(1)  # Rate limiting to avoid API issues

# Create summary data for quick access
summary_data = {
    'last_updated': datetime.now().isoformat(),
    'stocks': stock_data,
    'market_summary': {
        'total_stocks': len(stock_data),
        'gainers': len([s for s in stock_data if s['change_percent'] > 0]),
        'losers': len([s for s in stock_data if s['change_percent'] < 0]),
        'unchanged': len([s for s in stock_data if s['change_percent'] == 0])
    }
}

# Save to JSON files
os.makedirs('data', exist_ok=True)
with open('data/stocks.json', 'w') as f:
    json.dump(stock_data, f, indent=2)

with open('data/summary.json', 'w') as f:
    json.dump(summary_data, f, indent=2)

print(f"Successfully fetched data for {len(stock_data)} stocks")
