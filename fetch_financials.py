import json
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

# Try importing yfinance to check availability
try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
    print("[INFO] yfinance library is available.")
except ImportError:
    YFINANCE_AVAILABLE = False
    print("[WARNING] yfinance library is not installed. Will use direct Yahoo Finance API.")

MAPPING_FILE = "sector_subsector_mapping.json"
CACHE_FILE = "ticker_cache.json"
OUTPUT_FILE = "company_financials.json"

# Thread safety locks
cache_lock = threading.Lock()
print_lock = threading.Lock()
thread_local = threading.local()

def get_session():
    if not hasattr(thread_local, "session"):
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        })
        thread_local.session = session
    return thread_local.session

def get_unique_companies(mapping_path):
    if not os.path.exists(mapping_path):
        print(f"[ERROR] Mapping file '{mapping_path}' not found.")
        sys.exit(1)
        
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
        
    companies = set()
    def traverse(node):
        if isinstance(node, list):
            for item in node:
                if isinstance(item, str):
                    companies.add(item.strip())
        elif isinstance(node, dict):
            for val in node.values():
                traverse(val)
                
    traverse(mapping)
    return sorted(list(companies))

def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARNING] Failed to load cache file: {e}. Starting fresh.")
    return {}

def save_cache(cache):
    with cache_lock:
        try:
            with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2)
        except Exception as e:
            print(f"[WARNING] Failed to save cache: {e}")

def resolve_ticker(company_name):
    session = get_session()
    # Standardize and clean query
    clean_name = company_name.replace("Ltd.", "").replace("Limited", "").replace("Corp.", "").replace("Corporation", "").strip()
    clean_name = " ".join(clean_name.split())
    
    url = "https://query2.finance.yahoo.com/v1/finance/search"
    params = {
        "q": clean_name,
        "quotesCount": 3,
        "newsCount": 0
    }
    
    max_retries = 3
    backoff = 0.5
    
    for attempt in range(max_retries):
        try:
            r = session.get(url, params=params, timeout=5)
            if r.status_code == 429:
                time.sleep(backoff * 3)
                backoff *= 2
                continue
                
            if r.status_code != 200:
                time.sleep(backoff)
                backoff *= 2
                continue
                
            data = r.json()
            quotes = data.get('quotes', [])
            if quotes:
                # Prioritize NSE (.NS) or BSE (.BO) tickers
                for q in quotes:
                    symbol = q.get('symbol', '')
                    if symbol.endswith('.NS') or symbol.endswith('.BO'):
                        return symbol
                # Fallback to first symbol
                for q in quotes:
                    symbol = q.get('symbol', '')
                    if symbol:
                        return symbol
            return None
        except Exception:
            time.sleep(backoff)
            backoff *= 2
            
    return None

def fetch_financials_api(symbols):
    results = {}
    print(f"[INFO] Fetching metrics using authenticated Yahoo Finance quote API for {len(symbols)} symbols...")
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    })
    
    # 1. Perform cookie and crumb handshake
    crumb = None
    try:
        print("[INFO] Authenticating session with Yahoo Finance (cookie & crumb handshake)...")
        # Access fc.yahoo.com to set cookie
        session.get("https://fc.yahoo.com", timeout=10)
        # Fetch crumb
        crumb_res = session.get("https://query2.finance.yahoo.com/v1/test/getcrumb", timeout=10)
        if crumb_res.status_code == 200:
            crumb = crumb_res.text.strip()
            print(f"[INFO] Obtained crumb: {crumb}")
        else:
            print(f"[WARNING] Failed to obtain crumb (HTTP {crumb_res.status_code})")
    except Exception as e:
        print(f"[WARNING] Handshake failed: {e}")
        
    chunk_size = 80
    for i in range(0, len(symbols), chunk_size):
        chunk = symbols[i:i+chunk_size]
        symbol_str = ",".join(chunk)
        
        # Build URL. Keeping commas raw is essential for Yahoo Finance quote API.
        if crumb:
            url = f"https://query2.finance.yahoo.com/v7/finance/quote?symbols={symbol_str}&crumb={crumb}"
        else:
            url = f"https://query2.finance.yahoo.com/v7/finance/quote?symbols={symbol_str}"
            
        max_retries = 3
        backoff = 1
        success = False
        
        for attempt in range(max_retries):
            try:
                r = session.get(url, timeout=8)
                if r.status_code == 200:
                    data = r.json()
                    quotes = data.get('quoteResponse', {}).get('result', [])
                    for q in quotes:
                        symbol = q.get('symbol')
                        price = q.get('regularMarketPrice') or q.get('regularMarketPreviousClose')
                        cap = q.get('marketCap')
                        currency = q.get('currency', 'INR')
                        
                        results[symbol] = {
                            "price": price,
                            "market_cap": cap,
                            "currency": currency
                        }
                    success = True
                    break
                else:
                    print(f"[WARNING] Quote API HTTP {r.status_code} for batch starting with {chunk[0]}. Retrying...")
                    time.sleep(backoff)
                    backoff *= 2
            except Exception as e:
                print(f"[WARNING] Exception on quote fetch: {e}. Retrying...")
                time.sleep(backoff)
                backoff *= 2
                
        if not success:
            with print_lock:
                print(f"[ERROR] Failed to fetch quotes for batch starting with {chunk[0]}")
            
        time.sleep(0.5)
        
    return results

def main():
    print("[INFO] Loading mapping file...")
    companies = get_unique_companies(MAPPING_FILE)
    print(f"[INFO] Found {len(companies)} unique companies.")
    
    ticker_cache = load_cache()
    print(f"[INFO] Loaded {len(ticker_cache)} resolved/attempted names from cache.")
    
    # Filter out companies that need resolving
    to_resolve = [c for c in companies if c not in ticker_cache]
    print(f"[INFO] {len(to_resolve)} companies need symbol resolution.")
    
    if to_resolve:
        print("[INFO] Resolving ticker symbols concurrently (using 10 workers)...")
        resolved_count = 0
        
        def worker(company):
            symbol = resolve_ticker(company)
            with cache_lock:
                ticker_cache[company] = symbol
            return company, symbol

        # Using ThreadPoolExecutor for concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(worker, c): c for c in to_resolve}
            
            try:
                for future in as_completed(futures):
                    company, symbol = future.result()
                    resolved_count += 1
                    
                    if resolved_count % 10 == 0 or resolved_count == len(to_resolve):
                        status_str = f"Resolved: '{symbol}'" if symbol else "Failed"
                        with print_lock:
                            print(f"[PROGRESS] Resolved {resolved_count}/{len(to_resolve)}: '{company}' -> {status_str}")
                            
                    # Incremental cache save
                    if resolved_count % 50 == 0:
                        save_cache(ticker_cache)
                        
            except KeyboardInterrupt:
                print("\n[INFO] Interrupted by user. Saving cache...")
                save_cache(ticker_cache)
                sys.exit(1)
                
        save_cache(ticker_cache)
        print(f"[INFO] Completed resolution phase. Cache updated with {len(to_resolve)} new items.")
        
    # Filter resolved symbols (ignoring None values)
    resolved_symbols = [symbol for symbol in ticker_cache.values() if symbol]
    print(f"[INFO] Total resolved symbols to query: {len(resolved_symbols)}")
    
    # 2. Fetch financial data
    financials = fetch_financials_api(resolved_symbols)
    
    # 3. Merge results and generate final mapping
    output_data = {}
    for company in companies:
        symbol = ticker_cache.get(company)
        if symbol:
            data = financials.get(symbol, {"price": None, "market_cap": None, "currency": "INR"})
            output_data[company] = {
                "market_cap": data.get("market_cap")
            }
        else:
            output_data[company] = {
                "market_cap": None
            }
            
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"[SUCCESS] Financial data saved to '{OUTPUT_FILE}'.")
    print(f"Total entries processed: {len(output_data)}")

if __name__ == "__main__":
    main()
