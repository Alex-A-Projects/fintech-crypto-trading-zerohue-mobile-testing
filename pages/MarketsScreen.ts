/**
 * MarketsScreen — represents the `/markets` route.
 *
 * Layout
 *   - Header row: "Markets LIVE" + portfolio overview toggle button
 *   - Filter strip: All / L1/L2 / DeFi / Infrastructure / AI/DePIN / MEME
 *   - Search box ("Search assets…")
 *   - Table with columns: # / Asset, Price, 24h Change, 24h History, Action
 *   - Right-side panel showing portfolio summary (collapsible)
 *
 * Mobile-web adaptation
 *   - The "search" box may render as an icon at the smallest widths;
 *   the click-to-expand contract is not modelled here, but a no-op
 *   search still satisfies the suite (the input is always present in
 *   the DOM).
 */
import { browser, $, $$ } from '@wdio/globals';
import { expect } from '@wdio/globals';
import { BaseScreen } from './BaseScreen.js';
import { DisclaimerModal } from './components/DisclaimerModal.js';

export class MarketsScreen extends BaseScreen {
    readonly disclaimer: DisclaimerModal;

    /** Header heading on the markets page. */
    get pageHeading() {
        return $$('//main//h2[starts-with(., "Markets")]')[0];
    }

    /** Search input ("Search assets…"). */
    get searchInput() {
        return $('input[placeholder*="Search assets"]');
    }

    /** The first `<table>` element on the page. */
    get marketTable() {
        return $$('table')[0];
    }

    /** The column header cells. */
    get tableHeaders() {
        return this.marketTable.$$('thead th');
    }

    /** One row per visible asset. */
    get assetRows() {
        return this.marketTable.$$('tbody tr');
    }

    /** Loading skeleton / shimmer. */
    get loadingIndicator() {
        return $('[data-testid="loading"], .animate-pulse');
    }

    /** Categories in their rendered order. */
    readonly categories = ['All', 'L1/L2', 'DeFi', 'Infrastructure', 'AI/DePIN', 'MEME'] as const;
    /** Symbols the table renders in default rank order. */
    readonly expectedSymbols: ReadonlyArray<string> = [
        'BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'DOGE', 'ADA', 'BCH', 'HYPE', 'LINK',
        'XLM', 'HBAR', 'LTC', 'AVAX', 'SUI', 'ZEC', 'SHIB', 'CRO', 'WLFI', 'DOT',
        'UNI', 'AAVE', 'NEAR', 'PEPE', 'ICP',
    ];

    constructor() {
        super();
        this.disclaimer = new DisclaimerModal();
    }

    /** Navigate to /markets and wait for the table to hydrate. */
    async goto(): Promise<void> {
        await super.goto('/markets');
        await browser.waitUntil(
            async () => /\/markets/.test(await browser.getUrl()),
            { timeout: 15_000, interval: 200 },
        );
        await this.dismissDisclaimer();
        // Once dismissed the table content hydrates.
        await browser.waitUntil(
            async () => (await this.assetRows).length > 0,
            { timeout: 30_000, interval: 250 },
        );
    }

    // --- Filters -------------------------------------------------------------

    /** Tap a category filter by its visible label. */
    async selectCategory(name: string): Promise<void> {
        const btn = $(`//button[@aria-label="Show ${name} assets"]`);
        await btn.waitForDisplayed();
        await btn.click();
    }

    getCategoryButton(name: (typeof this.categories)[number]) {
        return $(`//button[@aria-label="Show ${name} assets"]`);
    }

    /**
     * Returns the symbol column from the currently visible rows.
     * Each cell renders rank/name/symbol on three visual lines; we
     * read innerText to preserve the line breaks.
     */
    async visibleSymbols(): Promise<string[]> {
        const rows = await this.assetRows;
        const out: string[] = [];
        for (const row of rows) {
            const cell = await row.$('td:first-child');
            if (!cell) continue;
            const text = await cell.getText();
            const trimmed = (text ?? '').trim();
            if (trimmed) out.push(trimmed);
        }
        return out;
    }

    /** Returns parsed price strings for the visible rows (e.g. "$82,600.01"). */
    async visiblePrices(): Promise<string[]> {
        const rows = await this.assetRows;
        const out: string[] = [];
        for (const row of rows) {
            const cells = await row.$$('td');
            const price = await cells[1]?.getText();
            out.push((price ?? '').trim());
        }
        return out;
    }

    /** Returns the 24h change text (e.g. "+1.12%") for each row. */
    async visibleChanges(): Promise<string[]> {
        const rows = await this.assetRows;
        const out: string[] = [];
        for (const row of rows) {
            const cells = await row.$$('td');
            const change = await cells[2]?.getText();
            out.push((change ?? '').trim());
        }
        return out;
    }

    /** Number of rows currently shown. */
    async rowCount(): Promise<number> {
        return (await this.assetRows).length;
    }

    /** Number of sparkline mini-charts (one per row, in the 24h History column). */
    async sparklineCount(): Promise<number> {
        // The 24h History column renders an SVG sparkline per row, but
        // the 24h Change column often renders an arrow SVG too, so a
        // naive "tbody tr svg" count is 2× the row count. Scope to
        // the history cell.
        return (await this.marketTable.$$('tbody tr td:nth-child(4) svg')).length;
    }

    // --- Search --------------------------------------------------------------

    async search(text: string): Promise<void> {
        await this.searchInput.setValue(text);
        // Debounce inside the SPA — give the in-page filter a beat.
        await browser.pause(400);
    }

    async clearSearch(): Promise<void> {
        await this.searchInput.setValue('');
        await browser.pause(400);
    }

    // --- Table headers / sort ------------------------------------------------

    /** Visible column header text. */
    async headerTexts(): Promise<string[]> {
        const ths = await this.tableHeaders;
        const out: string[] = [];
        for (const th of ths) {
            out.push(((await th.getText()) ?? '').trim());
        }
        return out;
    }

    header(name: string) {
        return this.marketTable.$(`//th[contains(., "${name}")]`);
    }

    /**
     * Click the named header. The site does not actually reorder rows
     * on header click, so 'toggle' is the only useful mode — the
     * function is kept for parity with the source suite.
     */
    async sortBy(headerName: string): Promise<void> {
        await this.header(headerName).click();
        await browser.pause(250);
    }

    async ariaSortOf(headerName: string): Promise<string | null> {
        return (await this.header(headerName)).getAttribute('aria-sort');
    }

    // --- Per-asset helpers ---------------------------------------------------

    /** Find a row by its symbol and click its Trade button. Returns the post-click URL. */
    async openTradeFor(symbol: string): Promise<string> {
        const rows = await this.assetRows;
        for (const row of rows) {
            const text = ((await row.getText()) ?? '').toUpperCase();
            if (text.includes(symbol.toUpperCase())) {
                const btn = await row.$('//button[contains(., "Trade")]');
                await btn.click();
                await this.waitForUrlMatches(/\/trade\//, 15_000);
                return (await browser.getUrl()) ?? '';
            }
        }
        throw new Error(`Symbol ${symbol} not found in markets table`);
    }

    /** Click the trade button on the Nth row (0-indexed). */
    async openTradeByIndex(index: number): Promise<string> {
        const row = (await this.assetRows)[index];
        if (!row) throw new Error(`row index ${index} out of bounds`);
        const btn = await row.$('//button[contains(., "Trade")]');
        await btn.click();
        await this.waitForUrlMatches(/\/trade\//, 15_000);
        return (await browser.getUrl()) ?? '';
    }

    // --- Assertions ----------------------------------------------------------

    async expectLoaded(): Promise<void> {
        await expect(browser).toHaveUrl(/\/markets/);
        await expect(browser).toHaveTitle(/Markets \| ZEROHUE/);
        await this.pageHeading.waitForDisplayed();
        await this.marketTable.waitForDisplayed();
        await this.searchInput.waitForDisplayed();
    }
}
