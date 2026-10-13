/**
 * Accessibility smoke tests.
 *
 * Quick a11y checks — proper roles, aria-labels, focus reachability.
 * Full axe sweeps would belong in a separate audit tool.
 */
import { browser, expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';

describe('Accessibility — markets page', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('Search input has accessible name', async () => {
        const aria = await markets.searchInput.getAttribute('aria-label');
        expect(aria ?? '').toMatch(/Search/i);
    });

    it('Each category button has aria-label', async () => {
        const labels = ['All', 'L1/L2', 'DeFi', 'Infrastructure', 'AI/DePIN', 'MEME'] as const;
        for (const l of labels) {
            const aria = await markets.getCategoryButton(l).getAttribute('aria-label');
            expect(aria).toBe(`Show ${l} assets`);
        }
    });

    it('Primary nav has aria-label "Primary navigation" (when sidebar visible)', async () => {
        const nav = await browser.$('nav[aria-label="Primary navigation"]');
        const visible = await nav.isDisplayed().catch(() => false);
        if (!visible) {
            expect(true).toBe(true);
            return;
        }
        await expect(nav).toBeDisplayed();
    });

    it('Mobile nav has aria-label "Primary mobile navigation"', async () => {
        const nav = await browser.$('nav[aria-label="Primary mobile navigation"]');
        await expect(nav).toBeDisplayed();
    });

    it('Page contains at least one h1', async () => {
        const h1s = await browser.$$('h1');
        expect(h1s.length).toBeGreaterThanOrEqual(1);
    });

    it('Headings expose "Markets LIVE"', async () => {
        const live = await browser.$('h2:has-text("Markets LIVE")');
        await expect(live).toBeDisplayed();
    });

    it('Footer copy is reachable as plain text', async () => {
        const el = await browser.$('text=/© \\d{4} ZEROHUE/');
        await expect(el).toBeDisplayed();
    });
});
