import { client } from '@/client/client.gen';

const now = new Date('2026-06-22T10:00:00Z');

const prices: Record<string, number> = {
  AAPL: 214.4,
  MSFT: 510.12,
  NVDA: 141.22,
  TSLA: 322.05,
};

const instruments = [
  { id: 'aapl', ticker: 'AAPL', name: 'Apple Inc.', market: 'stocks', currency_name: 'USD', market_cap: '3200000000000', type: 'CS', active: true, icon: null, logo: null },
  { id: 'msft', ticker: 'MSFT', name: 'Microsoft Corporation', market: 'stocks', currency_name: 'USD', market_cap: '3800000000000', type: 'CS', active: true, icon: null, logo: null },
  { id: 'nvda', ticker: 'NVDA', name: 'NVIDIA Corporation', market: 'stocks', currency_name: 'USD', market_cap: '3500000000000', type: 'CS', active: true, icon: null, logo: null },
  { id: 'tsla', ticker: 'TSLA', name: 'Tesla, Inc.', market: 'stocks', currency_name: 'USD', market_cap: '1000000000000', type: 'CS', active: true, icon: null, logo: null },
] as const;

const daily = (ticker: string) => ({
  current_price: String(prices[ticker] ?? 100),
  ticker,
  daily_summary: {
    open: String((prices[ticker] ?? 100) * 0.98),
    high: String((prices[ticker] ?? 100) * 1.02),
    low: String((prices[ticker] ?? 100) * 0.96),
    close: String(prices[ticker] ?? 100),
    volume: '12400000',
    volume_weighted_average_price: String((prices[ticker] ?? 100) * 0.995),
  },
  todays_change: '3.42',
  todays_change_percent: '1.61',
  last_updated: now.toISOString(),
});

const bars = (ticker: string) => Array.from({ length: 40 }, (_, i) => {
  const base = (prices[ticker] ?? 100) * (0.9 + i / 400);
  const day = new Date(now);
  day.setDate(day.getDate() - 40 + i);
  return {
    timestamp: day.toISOString(),
    open: base.toFixed(2),
    high: (base * 1.02).toFixed(2),
    low: (base * 0.98).toFixed(2),
    close: (base * 1.01).toFixed(2),
    volume: String(8000000 + i * 10000),
    transactions: 1000 + i,
    volume_weighted_average_price: base.toFixed(2),
  };
});

const investor = {
  id: 'demo-investor',
  clerk_id: 'demo',
  balance: '18420.00',
  blocked_funds: '0.00',
  language: 'en',
  watching_instruments: ['aapl', 'msft', 'nvda'],
};

const positions = [
  { symbol: 'AAPL', name: 'Apple Inc.', icon: null, quantity: '12', value: 2572.8, gain: 310.2, gain_percentage: 13.7, history: [{ timestamp: '2026-05-10T10:00:00Z', quantity: '12', final_transaction_value: 2572.8, final_share_price: 214.4, initial_share_price: 188.55, gain: 310.2, gain_percentage: 13.7 }] },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', icon: null, quantity: '20', value: 2824.4, gain: 426.4, gain_percentage: 17.8, history: [{ timestamp: '2026-04-17T10:00:00Z', quantity: '20', final_transaction_value: 2824.4, final_share_price: 141.22, initial_share_price: 119.9, gain: 426.4, gain_percentage: 17.8 }] },
];

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const page = <T,>(results: ReadonlyArray<T>) => ({ count: results.length, next: null, previous: null, results });

const readBody = async (request: Request) => {
  try { return await request.clone().json(); } catch { return {}; }
};

export function installMockBackend() {
  // ponytail: archive/demo mode, replace with MSW only if request assertions matter.
  client.setConfig({
    baseUrl: window.location.origin,
    fetch: async (request) => {
      const req = request instanceof Request ? request : new Request(request);
      const url = new URL(req.url);
      const path = url.pathname;

      if (req.method === 'DELETE') return new Response(null, { status: 204 });

      if (path === '/api/instruments/' || path === '/api/instruments/with-prices/') {
        const rows = instruments.map((item) => ({ ...item, price_info: daily(item.ticker), is_watched: item.ticker !== 'TSLA' }));
        return json(page(path.includes('with-prices') ? rows : instruments));
      }
      if (path === '/api/instruments/tickers/') return json({ tickers: instruments.map((i) => i.ticker) });
      if (path === '/api/instruments/detail/') {
        const ticker = url.searchParams.get('ticker') ?? 'AAPL';
        const instrument = instruments.find((i) => i.ticker === ticker) ?? instruments[0];
        return json({ ...instrument, cik: null, composite_figi: null, locale: 'us', primary_exchange: 'XNAS', share_class_figi: null, description: `${instrument.name} demo profile.`, description_pl: null, ticker_root: instrument.ticker, ticker_suffix: null, homepage_url: 'https://example.com', list_date: '1980-12-12', phone_number: null, share_class_shares_outstanding: null, sic_code: null, sic_description: null, total_employees: null, weighted_shares_outstanding: null, address: { address1: null, address2: null, city: null, state: null, postal_code: null } });
      }

      if (path === '/api/investors/me/' || path.startsWith('/api/investors/demo')) return json(investor);
      if (path === '/api/investors/deposit/') return json(await readBody(req));
      if (path === '/api/investors/deposit-history/') return json(page([{ id: 'dep-1', amount: '10000.00', deposited_at: '2026-01-03T10:00:00Z' }]));
      if (path === '/api/investors/me/account-value/') return json({ current_value: '23817.20', history: Array.from({ length: 30 }, (_, i) => ({ date: `2026-05-${String(i + 1).padStart(2, '0')}`, value: 21000 + i * 96 })) });
      if (path === '/api/investors/me/notifications/') return json([{ id: 'n-1', type: 'price_alert', message_en: 'NVDA crossed your alert price.', message_pl: 'NVDA przekroczyła cenę alertu.', sent_at: now.toISOString(), created_at: now.toISOString(), updated_at: now.toISOString() }]);
      if (path === '/api/investors/me/watched-tickers/') return json(instruments.slice(0, 3).map(({ ticker, name, icon, logo }) => ({ ticker, name, icon, logo })));
      if (path.startsWith('/api/investors/me/watched-tickers/')) return json({ is_watched: true });

      if (path === '/api/statistics/stats/') return json({ todays_gain: 162.4, total_gain: 1736.2, invested: 18000, total_value: 23817.2 });
      if (path === '/api/statistics/current-account-value/') return json({ total_account_value: 23817.2, gain: 1736.2, gain_percentage: 7.86 });
      if (path === '/api/statistics/asset-allocation/') return json({ total_value: 23817.2, total_gain_this_year: 1736.2, allocations: positions.map((p) => ({ instrument_name: p.name, instrument_ticker: p.symbol, instrument_logo: null, instrument_icon: null, value: p.value, percentage: Math.round((p.value / 5397.2) * 1000) / 10 })) });
      if (path === '/api/statistics/owned-shares/') return json(positions.map(({ name, symbol, value, gain, gain_percentage }) => ({ name, symbol, volume: symbol === 'AAPL' ? 12 : 20, value, gain, gain_percentage })));
      if (path === '/api/statistics/statistics/most-traded/') return json([{ symbol: 'AAPL', no_trades: 8, buys: 5, sells: 3, avg_gain: 48.1, avg_loss: -12.4 }, { symbol: 'NVDA', no_trades: 6, buys: 4, sells: 2, avg_gain: 71.2, avg_loss: -9.1 }]);
      if (path === '/api/statistics/statistics/trading-overview/') return json({ total_trades: 18, buys: 12, sells: 6, total_gain: 1736.2 });
      if (path === '/api/statistics/transactions-history/') return json(positions);

      if (path === '/api/prices/') return json((url.searchParams.getAll('tickers').length ? url.searchParams.getAll('tickers') : Object.keys(prices)).map(daily));
      if (path === '/api/prices/bars/') return json(bars(url.searchParams.get('ticker') ?? 'AAPL'));
      if (path === '/api/prices/price-alert/') return req.method === 'POST' ? json({ id: 'alert-1', ...(await readBody(req)), notification_config: { is_email: false, is_push: true, is_websocket: true } }, 201) : json(page([]));
      if (path.startsWith('/api/prices/price-alert/')) return json({ id: 'alert-1', instrument_name: 'Apple Inc.', instrument_ticker: 'AAPL', threshold_type: 'above', threshold_value: '220', notification_config: { id: 'cfg-1', is_email: false, is_push: true, is_websocket: true, is_active: true, created_at: now.toISOString() } });
      if (path.startsWith('/api/prices/')) return json(daily(path.split('/')[3] || 'AAPL'));

      if (path === '/api/orders/' || path === '/api/orders/limit/' || path === '/api/orders/market/') return req.method === 'GET' ? json([]) : json({ id: 'order-1', ticker: 'AAPL', detail_type: 1, detail: { detail_type: path.includes('limit') ? 'limit' : 'market', volume: '1', volume_processed: '0', is_buy: true, limit_price: '210.00' } }, 201);
      if (path === '/api/markets/status/') return json({ market: 'open', server_time: now.toISOString(), exchanges: { nasdaq: 'open', nyse: 'open', otc: 'open' }, currencies: {}, indicesGroups: {}, early_hours: false, after_hours: false });
      if (path === '/api/markets/holidays/') return json([]);
      if (path === '/api/news/') return json([{ id: 'news-1', title: 'Demo portfolio beats the market', description: 'Static archive data keeps the app browsable without a backend.', article_url: 'https://example.com', published_utc: now.toISOString(), publisher: { name: 'InvestLab Archive' }, tickers: ['AAPL', 'NVDA'], insights: [] }]);
      if (path === '/api/notifications/vapid-public-key/') return json({ public_key: 'demo' });
      if (path === '/api/chats/') return req.method === 'GET' ? json([]) : json({ id: 'chat-1', title: 'Archive chat', created_at: now.toISOString(), updated_at: now.toISOString(), message_count: 0 });
      if (path.startsWith('/api/chats/')) return json({ id: 'chat-1', title: 'Archive chat', created_at: now.toISOString(), updated_at: now.toISOString(), messages: [] });
      if (path === '/api/graph_lang/') return req.method === 'GET' ? json(page([])) : json({ id: 'flow-1', name: 'Demo strategy', raw_graph_data: {}, active: false, repeat: false });
      if (path.includes('/api/graph_lang/')) return path.endsWith('/results/') ? json(page([])) : path.endsWith('/run/') ? json({ results: [] }) : json({ id: 'flow-1', name: 'Demo strategy', raw_graph_data: {}, active: false, repeat: false });
      if (path === '/api/status/') return json({ message: 'Mock backend running' });

      return json({ OK: 'mocked' });
    },
  });
}
