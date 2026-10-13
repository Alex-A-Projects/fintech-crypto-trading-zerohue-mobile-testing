/**
 * Smoke — Site boots, the live URL serves HTML, and the most-trafficked
 * routes resolve. These are intentionally fast so they double as a
 * pre-flight before opening a real run.
 */
import { browser, expect } from '@wdio/globals';
import { dismissDisclaimerIfPresent } from '../utils/helpers.js';
import { MarketsScreen } from '../pages/MarketsScreen.js';
import { TradeScreen } from '../pages/TradeScreen.js';
import { DisclaimerModal } from '../pages/components/DisclaimerModal.js';

describe('Smoke — Site boots', () => {
    it('home/markets loads and contains ZEROHUE', async () => {
        await browser.url('https://zerohue.org/markets');
        expect((await browser.getTitle()) ?? '').toMatch(/ZEROHUE/);
        expect((await browser.getUrl()) ?? '').toContain('/markets');
    });

    it('disclaimer modal is dismissable', async () => {
        await browser.url('https://zerohue.org/markets');
        await dismissDisclaimerIfPresent();
        const modal = new DisclaimerModal();
        await expect(modal.backdrop).not.toBeDisplayed();
    });

    it('markets table renders at least one row after disclaimer', async () => {
        const markets = new MarketsScreen();
        await markets.goto();
        const count = await markets.rowCount();
        expect(count).toBeGreaterThan(0);
    });

    it('trade page deep-link loads for bitcoin', async () => {
        const trade = new TradeScreen();
        await trade.gotoBySlug('bitcoin');
        await trade.expectLoaded();
        expect((await browser.getUrl()) ?? '').toContain('/trade/bitcoin');
    });
});
