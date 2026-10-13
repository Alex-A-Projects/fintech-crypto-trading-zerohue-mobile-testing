/**
 * Markets page rendering tests.
 * Verifies the hydrated DOM matches the documented layout/columns/CTA
 * surface — adapted for the mobile-web rendering of the SPA.
 */
import { browser, expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { TABLE_COLUMNS, SITE } from '../../utils/testData.js';

describe('Markets — page rendering', () => {
    let markets: MarketsScreen;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
    });

    it('navigates to /markets and shows ZEROHUE brand', async () => {
        expect((await browser.getUrl()) ?? '').toContain('/markets');
        await expect(browser).toHaveTitle(/Markets \| ZEROHUE/);
        await markets.expectLoaded();
    });

    it('shows the LIVE badge', async () => {
        const live = await browser.$('h2:has-text("Markets LIVE")');
        await expect(live).toBeDisplayed();
    });

    it('lists expected column headers in order', async () => {
        const headers = await markets.headerTexts();
        expect(headers.length).toBeGreaterThan(0);
        for (const col of TABLE_COLUMNS) {
            expect(headers).toContain(col);
        }
        // First header should be the # / Asset composite
        expect(headers[0]).toContain('#');
        expect(headers[0]).toContain('Asset');
    });

    it('table has at least 25 rows on initial render', async () => {
        const count = await markets.rowCount();
        expect(count).toBeGreaterThanOrEqual(25);
    });

    it('first row contains Bitcoin (BTC) by rank', async () => {
        const firstRow = (await markets.assetRows)[0];
        const text = (await firstRow.getText()) ?? '';
        expect(text.toUpperCase()).toMatch(/BITCOIN/);
        expect(text.toUpperCase()).toMatch(/BTC/);
        expect(text).toMatch(/\$/);
    });

    it('renders a Trade button on every row', async () => {
        const rows = await markets.assetRows;
        for (const row of rows) {
            const btn = await row.$('button:has-text("Trade")');
            await expect(btn).toBeDisplayed();
        }
    });

    it('each row carries a sparkline/mini-chart', async () => {
        const rows = await markets.rowCount();
        const svgs = await markets.sparklineCount();
        expect(svgs).toBe(rows);
    });

    it('canonical URL points at /markets', async () => {
        const canonical = await browser.$('link[rel="canonical"]');
        const href = await canonical.getAttribute('href');
        expect(href).toBe(`${SITE.url}/markets`);
    });

    it('meta description mentions "live market data"', async () => {
        const desc = await browser.$('meta[name="description"]');
        const content = (await desc.getAttribute('content')) ?? '';
        expect(content).toMatch(/Review live market data|markets|live/);
    });

    it('robots meta is noindex/follow', async () => {
        const robots = await browser.$('meta[name="robots"]');
        const content = (await robots.getAttribute('content')) ?? '';
        expect(content).toMatch(/noindex/);
    });

    it('OG image is set', async () => {
        const ogImage = await browser.$('meta[property="og:image"]');
        const content = (await ogImage.getAttribute('content')) ?? '';
        expect(content).toMatch(/social-preview\.png/);
    });

    it('markets page hero text reads "Markets"', async () => {
        const heading = await browser.$('//main//h2[starts-with(., "Markets")]');
        await expect(heading).toBeDisplayed();
    });
});
