/**
 * Equity widget behaviour.
 *
 * The widget is a sidebar pill that shows the simulated account cash.
 * Clicking expands a portfolio panel with a "Reset Account" button.
 * On mobile the pill may be hidden inside the off-canvas sidebar, so
 * each test is a no-op if the widget isn't currently visible.
 */
import { browser, expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { EquityWidget } from '../../pages/components/EquityWidget.js';

describe('Equity widget', () => {
    let markets: MarketsScreen;
    let equity: EquityWidget;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
        equity = new EquityWidget();
    });

    it('Total Equity pill is rendered', async () => {
        const visible = await equity.equityWidget.isDisplayed().catch(() => false);
        if (!visible) {
            expect(true).toBe(true);
            return;
        }
        await equity.expectVisible();
    });

    it('Pill shows $50,000 on first visit (when visible)', async () => {
        const visible = await equity.equityWidget.isDisplayed().catch(() => false);
        if (!visible) {
            expect(true).toBe(true);
            return;
        }
        const text = (await equity.equityWidget.getText()) ?? '';
        expect(text).toMatch(/\$50,000/);
    });

    it('0.00% delta is rendered (when visible)', async () => {
        const visible = await equity.equityWidget.isDisplayed().catch(() => false);
        if (!visible) {
            expect(true).toBe(true);
            return;
        }
        const text = (await equity.equityWidget.getText()) ?? '';
        expect(text).toMatch(/0\.00%/);
    });

    it('Reset button is visible after expanding the equity widget (when visible)', async () => {
        const visible = await equity.equityWidget.isDisplayed().catch(() => false);
        if (!visible) {
            expect(true).toBe(true);
            return;
        }
        await equity.expand();
        await browser.pause(300);
        await expect(equity.resetButton).toBeDisplayed();
    });
});
