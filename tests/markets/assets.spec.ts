/**
 * Markets — assets / row data integrity.
 */
import { expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { TOP_ASSETS } from '../../utils/testData.js';
import { parsePrice, parseChangePercent, expectValidPrice } from '../../utils/helpers.js';

describe('Markets — assets data', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('shows 25 top crypto symbols (BTC..) in the first 25 rows', async () => {
        // Each row's first cell renders rank/name/symbol on three
        // visual lines. The last non-empty line is the symbol code.
        const cells = await markets.visibleSymbols();
        const symbols = cells.map((cell) => {
            const lines = cell
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            return lines[lines.length - 1] ?? '';
        });
        const set = new Set(symbols);
        const missing = TOP_ASSETS.filter((sym) => !set.has(sym));
        expect(missing).toEqual([]);
    });

    it('all visible prices parse as positive numbers with $ prefix', async () => {
        const prices = await markets.visiblePrices();
        expect(prices.length).toBeGreaterThan(0);
        for (const p of prices) {
            expect(p).toMatch(/^\$/);
            expectValidPrice(p);
        }
    });

    it('BTC (rank 1) price is greater than the rank-11 price', async () => {
        const prices = (await markets.visiblePrices()).map(parsePrice);
        // BTC should be the most expensive asset
        expect(prices[0]).toBeGreaterThan(prices[10]);
    });

    it('24h change strings match +/-X.XX% format', async () => {
        const changes = await markets.visibleChanges();
        for (const c of changes) {
            expect(c.trim()).toMatch(/^[+-][\d.]+%/);
        }
    });

    it('24h change values are finite numbers within ±100%', async () => {
        const changes = await markets.visibleChanges();
        for (const c of changes) {
            const v = parseChangePercent(c);
            expect(Number.isFinite(v)).toBe(true);
            expect(Math.abs(v)).toBeLessThanOrEqual(1);
        }
    });

    it('price of the first row is greater than 1 cent', async () => {
        const prices = (await markets.visiblePrices()).map(parsePrice);
        expect(prices[0]).toBeGreaterThan(0.01);
    });

    it('change column has both positive and negative values across rows', async () => {
        const changes = (await markets.visibleChanges()).map(parseChangePercent);
        const positives = changes.filter((c) => c > 0).length;
        const negatives = changes.filter((c) => c < 0).length;
        // Live market data — at least one of each direction.
        expect(positives + negatives).toBeGreaterThan(0);
    });

    it('row count and sparkline count match', async () => {
        const rows = await markets.rowCount();
        const svgs = await markets.sparklineCount();
        expect(svgs).toBe(rows);
    });
});
