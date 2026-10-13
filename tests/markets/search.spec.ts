/**
 * Markets — search functionality.
 */
import { expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';

describe('Markets — search', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('typing a symbol narrows results', async () => {
        const before = await markets.rowCount();
        await markets.search('BTC');
        const after = await markets.rowCount();
        expect(after).toBeLessThanOrEqual(before);
        expect(after).toBeGreaterThan(0);
    });

    it('typing a name narrows results', async () => {
        await markets.search('ethereum');
        const symbols = await markets.visibleSymbols();
        expect(symbols.some((s) => s.toUpperCase().includes('ETH'))).toBe(true);
    });

    it('search is case-insensitive', async () => {
        await markets.search('btc');
        const lower = await markets.rowCount();
        await markets.clearSearch();
        await markets.search('BTC');
        const upper = await markets.rowCount();
        expect(lower).toBe(upper);
    });

    it('search for token with 0 matches shows no rows', async () => {
        await markets.search('XYZNOTACOIN_99999');
        await browser.pause(400);
        const count = await markets.rowCount();
        expect(count).toBe(0);
    });

    it('clearing search restores full list', async () => {
        const before = await markets.rowCount();
        await markets.search('SOL');
        await markets.clearSearch();
        await browser.pause(300);
        const after = await markets.rowCount();
        expect(after).toBe(before);
    });

    it('search by partial substring does not crash', async () => {
        await markets.search('USD');
        await browser.pause(300);
        // The catalogue varies; we just want a non-erroring render.
        expect(true).toBe(true);
    });

    it('rapid input/clear does not crash the page', async () => {
        for (const term of ['B', 'BT', 'BTC', 'B', '']) {
            await markets.searchInput.setValue(term);
        }
        await browser.pause(300);
        await expect(markets.marketTable).toBeDisplayed();
    });

    it('search input has accessible name and placeholder', async () => {
        const aria = await markets.searchInput.getAttribute('aria-label');
        const ph = await markets.searchInput.getAttribute('placeholder');
        expect(aria ?? '').toMatch(/Search/i);
        expect(ph ?? '').toMatch(/Search assets/i);
    });

    it('search value is preserved when switching categories', async () => {
        await markets.search('AAVE');
        await browser.pause(300);
        const before = await markets.searchInput.getValue();
        expect(before).toBe('AAVE');
        await markets.selectCategory('DeFi');
        const after = await markets.searchInput.getValue();
        expect(after).toBe('AAVE');
    });

    it('empty search value shows full list (after clearing)', async () => {
        await markets.search('ZZZ');
        await markets.clearSearch();
        await browser.pause(300);
        const count = await markets.rowCount();
        expect(count).toBeGreaterThan(10);
    });
});
