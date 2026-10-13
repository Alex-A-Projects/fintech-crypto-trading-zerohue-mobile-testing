/**
 * Trade page — header and meta information.
 *
 * Verifies the navigation chrome, share affordances, asset title
 * block, and the live price label.
 */
import { browser, expect } from '@wdio/globals';
import { TradeScreen } from '../../pages/TradeScreen.js';
import { TRADE_SLUGS } from '../../utils/testData.js';

describe('Trade page — header & meta', () => {
    let trade: TradeScreen;

    beforeEach(async () => {
        trade = new TradeScreen();
        await trade.gotoBySlug('bitcoin');
    });

    it('Back to markets button is present', async () => {
        await expect(trade.backToMarketsButton).toBeDisplayed();
    });

    it('Share and CoinMarketCap buttons visible', async () => {
        await expect(trade.shareButton).toBeDisplayed();
        await expect(trade.coinMarketCapLink).toBeDisplayed();
    });

    it('Asset title block contains "Bitcoin" and a price label', async () => {
        const title = (await trade.assetTitle.getText()) ?? '';
        expect(title.toLowerCase()).toContain('bitcoin');
        await expect(trade.priceLabel).toBeDisplayed();
    });

    it('Price label looks like $X,XXX.XX', async () => {
        const text = (await trade.priceLabel.getText()) ?? '';
        expect(text).toMatch(/^\$[\d,]+\.\d{2,}$/);
    });

    it('Hero asset name renders the coin name (not just the symbol)', async () => {
        const h1s = await browser.$$('main h1');
        const found = [];
        for (const h1 of h1s) {
            const text = ((await h1.getText()) ?? '').trim();
            if (text.length > 0) found.push(text);
        }
        // We expect at least one of the H1s to be the asset name.
        const joined = found.join(' | ').toLowerCase();
        expect(joined).toContain('bitcoin');
    });

    it('Chart sub-tab is visible', async () => {
        await expect(trade.chartTab).toBeDisplayed();
    });

    it('Trade sub-tab is visible', async () => {
        await expect(trade.tradeTab).toBeDisplayed();
    });
});

describe('Trade page — multi-asset routing', () => {
    // Spot-check a handful of slugs to ensure the trade route resolves.
    for (const slug of TRADE_SLUGS.slice(0, 5)) {
        it(`trade page loads for /trade/${slug}`, async () => {
            const trade = new TradeScreen();
            await trade.gotoBySlug(slug);
            expect((await browser.getUrl()) ?? '').toMatch(new RegExp(`/trade/`));
        });
    }
});
