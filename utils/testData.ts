/**
 * Test data fixtures for the zerohue.org/markets UI suite.
 * Values mirror the desktop Playwright suite so the two reports stay
 * comparable. The live site may drift — re-run the probe periodically.
 */

export const SITE = {
    url: 'https://zerohue.org',
    marketsPath: '/markets',
    brand: 'ZEROHUE',
};

export const DISCLAIMER = {
    heading: 'Before You Begin',
    items: [
        { heading: 'Educational Purpose Only' },
        { heading: 'No Financial Advice' },
        { heading: 'Regulatory Status' },
        { heading: 'Data Accuracy' },
    ],
    acceptCta: 'Open Simulator',
};

export const CATEGORIES = ['All', 'L1/L2', 'DeFi', 'Infrastructure', 'AI/DePIN', 'MEME'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIDEBAR_SECTIONS = {
    Trading: ['Markets', 'Portfolio', 'Orders', 'History'],
    Competition: ['Competition', 'Leaderboard'],
    Resources: ['FAQ', 'About'],
} as const;

export const TABLE_COLUMNS = ['# Asset', 'Price', '24h Change', '24h History', 'Action'] as const;

/** Symbols the markets table shows (top 25 by liquidity). */
export const TOP_ASSETS = [
    'BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'DOGE', 'ADA', 'BCH', 'HYPE', 'LINK',
    'XLM', 'HBAR', 'LTC', 'AVAX', 'SUI', 'ZEC', 'SHIB', 'CRO', 'WLFI', 'DOT',
    'UNI', 'AAVE', 'NEAR', 'PEPE', 'ICP',
] as const;

/**
 * URL slugs the `/trade/<slug>` route uses. The site may redirect to
 * a *different* slug than the CMC-style canonical one (e.g.
 * `/trade/internet-computer` → `/trade/icp`); the suite only asserts
 * the URL starts with `/trade/` after the navigation.
 */
export const TRADE_SLUGS = [
    'bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano', 'chainlink', 'hedera',
    'litecoin', 'avalanche', 'sui', 'zcash', 'shiba-inu', 'cronos',
    'polkadot', 'uniswap', 'aave', 'near', 'pepe', 'icp',
    'bitcoin-cash', 'hyperliquid', 'cosmos', 'stellar',
    'ondo', 'aerodrome-finance', 'ethena', 'world-liberty',
    'arbitrum', 'render', 'aptos', 'filecoin', 'vechain',
] as const;

export const LEVERAGE_PRESETS = ['1x', '2x', '3x', '5x'] as const;
export const QUICK_AMOUNTS = ['25%', '50%', '75%', '100%'] as const;

export const PROTECTIVE_ORDERS = ['TAKE PROFIT', 'STOP LOSS'] as const;

export const ORDER_DETAILS = [
    'Notional',
    'Leverage',
    'Buying Power',
    'Margin Required',
    'Est. Liquidation',
    'Trading Fee (0.10%)',
] as const;

/**
 * Viewport snapshots. The mobile-web framework always renders at the
 * phone breakpoint, but we keep the desktop/tablet values for any
 * spec that wants to assert "the layout has a mobile breakpoint" rather
 * than re-running at multiple sizes.
 */
export const VIEWPORTS = {
    desktop: { width: 1440, height: 900 },
    laptop: { width: 1280, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 393, height: 852 },
} as const;
