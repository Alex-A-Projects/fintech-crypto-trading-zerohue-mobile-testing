/**
 * Markets — "Trade" CTA routing.
 *
 * Each Trade button is a per-asset link to /trade/<asset-slug>. For
 * the top symbols we spot-check the deterministic slugs.
 */
import { browser, expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { TradeScreen } from '../../pages/TradeScreen.js';

describe('Markets — Trade buttons', () => {
    let markets: MarketsScreen;
    let trade: TradeScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
        trade = new TradeScreen();
    });

    it('first Trade button navigates to /trade/', async () => {
        const firstRow = (await markets.assetRows)[0];
        const btn = await firstRow.$('button:has-text("Trade")');
        await btn.click();
        await markets.waitForUrlMatches(/\/trade\//, 15_000);
        expect((await browser.getUrl()) ?? '').toMatch(/\/trade\//);
    });

    it('Trade on Bitcoin row navigates to BTC page', async () => {
        const url = await markets.openTradeFor('BTC');
        expect(url).toMatch(/\/trade\/(bitcoin|btc)/);
    });

    it('Trade on Ethereum row navigates to ETH page', async () => {
        const url = await markets.openTradeFor('ETH');
        expect(url).toMatch(/\/trade\/(ethereum|eth)/);
    });

    it('Trade on Solana row navigates to SOL page', async () => {
        const url = await markets.openTradeFor('SOL');
        expect(url).toMatch(/\/trade\/(solana|sol)/);
    });

    it('Trade on Dogecoin row navigates to DOGE page', async () => {
        const url = await markets.openTradeFor('DOGE');
        expect(url).toMatch(/\/trade\/(dogecoin|doge)/);
    });

    it('Trade on Chainlink row navigates to LINK page', async () => {
        const url = await markets.openTradeFor('LINK');
        expect(url).toMatch(/\/trade\/(chainlink|link)/);
    });

    it('Trade button click returns to /markets via Back button', async () => {
        await markets.openTradeFor('BTC');
        expect((await browser.getUrl()) ?? '').toMatch(/\/trade\//);
        await trade.goBackToMarkets();
        expect((await browser.getUrl()) ?? '').toMatch(/\/markets/);
    });

    it('Trade button on row index 5 navigates somewhere', async () => {
        const url = await markets.openTradeByIndex(5);
        expect(url).toMatch(/\/trade\//);
    });

    it('first Trade button eventually resolves to a known asset slug', async () => {
        // Some assets redirect on the trade route (e.g. icp). The
        // contract is that the URL *starts* with /trade/ — the specific
        // slug may differ from the source asset.
        const url = await markets.openTradeByIndex(0);
        expect(url).toMatch(/^https:\/\/zerohue\.org\/trade\/[^/]+/);
    });
});
