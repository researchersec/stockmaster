import yfinance as yf
import json
from datetime import datetime, timedelta
import os
import time
import numpy as np
import pandas as pd

# Define the list of stock symbols
symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'JPM', 'JNJ', 'V', 'PG', 'UNH']

def calculate_technical_indicators(hist_data):
    """Calculate technical indicators for the stock"""
    if len(hist_data) < 20:
        return {}
    
    df = pd.DataFrame(hist_data)
    df['close'] = pd.to_numeric(df['close'])
    df['volume'] = pd.to_numeric(df['volume'])
    
    indicators = {}
    
    # Moving averages
    indicators['sma_20'] = float(df['close'].rolling(window=20).mean().iloc[-1])
    indicators['sma_50'] = float(df['close'].rolling(window=50).mean().iloc[-1]) if len(df) >= 50 else None
    indicators['ema_12'] = float(df['close'].ewm(span=12).mean().iloc[-1])
    indicators['ema_26'] = float(df['close'].ewm(span=26).mean().iloc[-1])
    
    # MACD
    if indicators['ema_12'] and indicators['ema_26']:
        indicators['macd'] = indicators['ema_12'] - indicators['ema_26']
        indicators['macd_signal'] = float(df['close'].ewm(span=9).mean().iloc[-1])
        indicators['macd_histogram'] = indicators['macd'] - indicators['macd_signal']
    
    # RSI
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    indicators['rsi'] = float(100 - (100 / (1 + rs.iloc[-1])))
    
    # Bollinger Bands
    sma_20 = df['close'].rolling(window=20).mean()
    std_20 = df['close'].rolling(window=20).std()
    indicators['bb_upper'] = float(sma_20.iloc[-1] + (std_20.iloc[-1] * 2))
    indicators['bb_middle'] = float(sma_20.iloc[-1])
    indicators['bb_lower'] = float(sma_20.iloc[-1] - (std_20.iloc[-1] * 2))
    
    # Volume indicators
    indicators['volume_sma'] = float(df['volume'].rolling(window=20).mean().iloc[-1])
    indicators['volume_ratio'] = float(df['volume'].iloc[-1] / indicators['volume_sma']) if indicators['volume_sma'] > 0 else 1.0
    
    # Price momentum
    indicators['momentum'] = float(df['close'].iloc[-1] / df['close'].iloc[-5] - 1) * 100 if len(df) >= 5 else 0
    
    return indicators

def fetch_earnings_data(ticker):
    """Fetch earnings and calendar data"""
    try:
        earnings = ticker.earnings
        calendar = ticker.calendar
        
        earnings_data = {}
        if not earnings.empty:
            earnings_data = {
                'next_earnings_date': earnings.index[-1].strftime('%Y-%m-%d') if len(earnings) > 0 else None,
                'last_earnings_date': earnings.index[-2].strftime('%Y-%m-%d') if len(earnings) > 1 else None,
                'last_earnings_eps': float(earnings['Earnings'].iloc[-1]) if len(earnings) > 0 else None,
                'last_earnings_revenue': float(earnings['Revenue'].iloc[-1]) if len(earnings) > 0 else None
            }
        
        calendar_data = {}
        if not calendar.empty:
            calendar_data = {
                'next_earnings_estimate': float(calendar['Earnings Average'].iloc[0]) if len(calendar) > 0 else None,
                'next_revenue_estimate': float(calendar['Revenue Average'].iloc[0]) if len(calendar) > 0 else None,
                'next_earnings_date': calendar.index[0].strftime('%Y-%m-%d') if len(calendar) > 0 else None
            }
        
        return {**earnings_data, **calendar_data}
    except:
        return {}

def fetch_comprehensive_stock_data(symbol):
    """Fetch comprehensive stock data including company info and financial metrics"""
    try:
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        info = ticker.info
        
        # Get historical data for the last 60 days (for better technical analysis)
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=60)
        hist = ticker.history(start=start_date, end=end_date, interval='1d')
        
        # Calculate price changes
        if not hist.empty:
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - prev_close
            change_percent = ((change / prev_close) * 100) if prev_close != 0 else 0
            
            # Get 5-day, 30-day, and 60-day changes
            five_day_ago = hist['Close'].iloc[-6] if len(hist) > 5 else current_price
            thirty_day_ago = hist['Close'].iloc[-31] if len(hist) > 30 else current_price
            sixty_day_ago = hist['Close'].iloc[0] if len(hist) > 0 else current_price
            
            five_day_change = ((current_price - five_day_ago) / five_day_ago * 100) if five_day_ago != 0 else 0
            thirty_day_change = ((current_price - thirty_day_ago) / thirty_day_ago * 100) if thirty_day_ago != 0 else 0
            sixty_day_change = ((current_price - sixty_day_ago) / sixty_day_ago * 100) if sixty_day_ago != 0 else 0
            
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
            
            # Calculate technical indicators
            technical_indicators = calculate_technical_indicators(historical_data)
        else:
            current_price = info.get('currentPrice', 0)
            change = 0
            change_percent = 0
            five_day_change = 0
            thirty_day_change = 0
            sixty_day_change = 0
            historical_data = []
            technical_indicators = {}
        
        # Fetch earnings data
        earnings_data = fetch_earnings_data(ticker)
        
        # Extract key financial metrics
        stock_data = {
            'symbol': symbol,
            'name': info.get('longName', info.get('shortName', symbol)),
            'current_price': current_price,
            'change': change,
            'change_percent': change_percent,
            'five_day_change': five_day_change,
            'thirty_day_change': thirty_day_change,
            'sixty_day_change': sixty_day_change,
            'previous_close': info.get('previousClose', current_price),
            'open': info.get('open', current_price),
            'day_low': info.get('dayLow', current_price),
            'day_high': info.get('dayHigh', current_price),
            'volume': info.get('volume', 0),
            'avg_volume': info.get('averageVolume', 0),
            'market_cap': info.get('marketCap', 0),
            'enterprise_value': info.get('enterpriseValue', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'forward_pe': info.get('forwardPE', 0),
            'price_to_book': info.get('priceToBook', 0),
            'price_to_sales': info.get('priceToSalesTrailing12Months', 0),
            'dividend_yield': info.get('dividendYield', 0),
            'dividend_rate': info.get('dividendRate', 0),
            'payout_ratio': info.get('payoutRatio', 0),
            'beta': info.get('beta', 0),
            'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0),
            'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
            'fifty_day_avg': info.get('fiftyDayAverage', 0),
            'two_hundred_day_avg': info.get('twoHundredDayAverage', 0),
            'eps': info.get('trailingEps', 0),
            'forward_eps': info.get('forwardEps', 0),
            'revenue': info.get('totalRevenue', 0),
            'revenue_per_share': info.get('revenuePerShare', 0),
            'revenue_growth': info.get('revenueGrowth', 0),
            'profit_margins': info.get('profitMargins', 0),
            'operating_margins': info.get('operatingMargins', 0),
            'gross_margins': info.get('grossMargins', 0),
            'return_on_equity': info.get('returnOnEquity', 0),
            'return_on_assets': info.get('returnOnAssets', 0),
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
            'short_percent_of_float': info.get('shortPercentOfFloat', 0),
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
            'exchange': info.get('exchange', ''),
            'currency': info.get('currency', 'USD'),
            'market_state': info.get('marketState', ''),
            'regular_market_time': info.get('regularMarketTime', 0),
            'historical_data': historical_data,
            'technical_indicators': technical_indicators,
            'earnings_data': earnings_data,
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
        'unchanged': len([s for s in stock_data if s['change_percent'] == 0]),
        'total_market_cap': sum([s['market_cap'] for s in stock_data if s['market_cap']]),
        'total_volume': sum([s['volume'] for s in stock_data if s['volume']]),
        'avg_change_percent': sum([s['change_percent'] for s in stock_data]) / len(stock_data) if stock_data else 0
    },
    'sector_breakdown': {},
    'market_sentiment': {
        'bullish_stocks': len([s for s in stock_data if s['change_percent'] > 2]),
        'bearish_stocks': len([s for s in stock_data if s['change_percent'] < -2]),
        'neutral_stocks': len([s for s in stock_data if -2 <= s['change_percent'] <= 2])
    }
}

# Calculate sector breakdown
for stock in stock_data:
    sector = stock.get('sector', 'Unknown')
    if sector not in summary_data['sector_breakdown']:
        summary_data['sector_breakdown'][sector] = {
            'count': 0,
            'total_market_cap': 0,
            'avg_change': 0,
            'stocks': []
        }
    
    summary_data['sector_breakdown'][sector]['count'] += 1
    summary_data['sector_breakdown'][sector]['total_market_cap'] += stock.get('market_cap', 0)
    summary_data['sector_breakdown'][sector]['stocks'].append(stock['symbol'])

# Calculate average change per sector
for sector in summary_data['sector_breakdown']:
    sector_stocks = [s for s in stock_data if s.get('sector') == sector]
    if sector_stocks:
        summary_data['sector_breakdown'][sector]['avg_change'] = sum([s['change_percent'] for s in sector_stocks]) / len(sector_stocks)

# Save to JSON files
os.makedirs('data', exist_ok=True)
with open('data/stocks.json', 'w') as f:
    json.dump(stock_data, f, indent=2)

with open('data/summary.json', 'w') as f:
    json.dump(summary_data, f, indent=2)

print(f"Successfully fetched data for {len(stock_data)} stocks")
print(f"Market sentiment: {summary_data['market_sentiment']['bullish_stocks']} bullish, {summary_data['market_sentiment']['bearish_stocks']} bearish")
