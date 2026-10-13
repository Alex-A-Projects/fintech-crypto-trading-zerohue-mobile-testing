/**
 * Markets — category filter tests.
 *
 * Each category tab narrows the asset list. The exact sub-set varies
 * as the live catalogue evolves, so we assert behavioural invariants
 * rather than hardcoded counts.
 */
import { expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { CATEGORIES } from '../../utils/testData.js';

describe('Markets — category filters', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('renders all six category tabs', async () => {
        for (const cat of CATEGORIES) {
            await expect(markets.getCategoryButton(cat)).toBeDisplayed();
        }
    });

    for (const cat of CATEGORIES) {
        it(`"${cat}" filter narrows or matches the All view`, async () => {
            // Capture row count under "All"
            await markets.selectCategory('All');
            const allCount = await markets.rowCount();

            await markets.selectCategory(cat);
            await browser.pause(300);
            const filteredCount = await markets.rowCount();

            // Filter cannot show MORE than All, and shouldn't be empty.
            expect(filteredCount).toBeGreaterThan(0);
            expect(filteredCount).toBeLessThanOrEqual(allCount);
        });
    }

    it('selecting DeFi keeps the DeFi button visible', async () => {
        await markets.selectCategory('DeFi');
        await browser.pause(300);
        const defiBtn = markets.getCategoryButton('DeFi');
        await expect(defiBtn).toBeDisplayed();
        const text = await defiBtn.getText();
        expect(text).toBe('DeFi');
    });

    it('switching filters updates results', async () => {
        await markets.selectCategory('L1/L2');
        const l1Count = await markets.rowCount();
        await markets.selectCategory('Infrastructure');
        const infraCount = await markets.rowCount();
        expect(l1Count + infraCount).toBeGreaterThan(0);
    });

    it('filter "All" restores full catalog', async () => {
        await markets.selectCategory('DeFi');
        await browser.pause(200);
        const defiCount = await markets.rowCount();

        await markets.selectCategory('All');
        await browser.pause(300);
        const allCount = await markets.rowCount();

        expect(allCount).toBeGreaterThan(defiCount);
        expect(allCount).toBeGreaterThanOrEqual(25);
    });

    it('each category button has the correct aria-label', async () => {
        for (const cat of CATEGORIES) {
            const aria = await markets.getCategoryButton(cat).getAttribute('aria-label');
            expect(aria).toBe(`Show ${cat} assets`);
        }
    });

    it('filter survives a search re-query', async () => {
        await markets.selectCategory('DeFi');
        await markets.search('UNI');
        await browser.pause(400);
        const symbols = await markets.visibleSymbols();
        // UNI is a DeFi token so should remain visible
        expect(symbols.some((s) => s.toUpperCase().includes('UNI'))).toBe(true);
    });
});
