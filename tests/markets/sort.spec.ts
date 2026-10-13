/**
 * Markets — column sort tests.
 *
 * The visible ZeroHue table is rendered in a fixed internal rank order
 * and does NOT expose `aria-sort` on its headers. Clicking a header is
 * a no-op (no row reorder). These tests verify the actual contract:
 *
 *   - Header clicks don't error.
 *   - Row order is stable across header clicks.
 *   - The default catalog is the rank order (BTC …) with at least 25
 *     rows.
 *   - 24h Change values stay within ±100% after a header click.
 */
import { expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { parseChangePercent } from '../../utils/helpers.js';
import { TOP_ASSETS } from '../../utils/testData.js';

describe('Markets — column sort', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('Price header click is a no-op (no aria-sort, no row reorder)', async () => {
        const before = await markets.visibleSymbols();
        await markets.sortBy('Price');
        await browser.pause(300);
        const after = await markets.visibleSymbols();
        expect(after).toEqual(before);
        // aria-sort should be missing on this site.
        expect(await markets.ariaSortOf('Price')).toBeNull();
    });

    it('after repeated Price clicks, BTC is still the first row', async () => {
        for (let i = 0; i < 3; i++) {
            await markets.sortBy('Price');
            await browser.pause(150);
        }
        const firstSyms = (await markets.visibleSymbols())
            .slice(0, 1)
            .map((s) =>
                s
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .pop() ?? '',
            );
        expect(firstSyms[0]).toBe('BTC');
    });

    it('# Asset header click is a no-op (no aria-sort, no row reorder)', async () => {
        const before = await markets.visibleSymbols();
        await markets.sortBy('# Asset');
        await browser.pause(300);
        const after = await markets.visibleSymbols();
        expect(after).toEqual(before);
        expect(await markets.ariaSortOf('# Asset')).toBeNull();
    });

    it('24h Change header click is a no-op (no row reorder)', async () => {
        const before = (await markets.visibleSymbols()).slice(0, 8).join('|');
        await markets.sortBy('24h Change');
        await browser.pause(300);
        const after = (await markets.visibleSymbols()).slice(0, 8).join('|');
        expect(after).toBe(before);
    });

    it('header click does not change row count', async () => {
        const before = await markets.rowCount();
        await markets.sortBy('Price');
        await markets.sortBy('24h Change');
        await markets.sortBy('# Asset');
        await browser.pause(400);
        const after = await markets.rowCount();
        expect(after).toBe(before);
        expect(after).toBeGreaterThanOrEqual(25);
    });

    it('rank-ordered catalog: BTC, ETH, BNB appear in the first three rows', async () => {
        const syms = (await markets.visibleSymbols()).map((cell) => {
            const lines = cell
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            return lines[lines.length - 1] ?? '';
        });
        expect(syms.slice(0, 3)).toEqual(['BTC', 'ETH', 'BNB']);
    });

    it('top-25 symbols appear in the first 25 rows', async () => {
        const syms = (await markets.visibleSymbols()).map((cell) => {
            const lines = cell
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            return lines[lines.length - 1] ?? '';
        });
        const set = new Set(syms.slice(0, 25));
        for (const asset of TOP_ASSETS) {
            expect(set.has(asset)).toBe(true);
        }
    });

    it('change values stay bounded after multiple header clicks', async () => {
        await markets.sortBy('24h Change');
        await markets.sortBy('24h Change');
        await markets.sortBy('24h Change');
        await browser.pause(400);
        const changes = (await markets.visibleChanges()).map(parseChangePercent);
        for (const c of changes) {
            expect(Math.abs(c)).toBeLessThan(1);
        }
    });
});
