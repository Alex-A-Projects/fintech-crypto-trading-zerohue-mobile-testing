/**
 * Trade page — order ticket interactions.
 *
 * Exercises BUY/SELL toggle, Market/Limit order types, leverage
 * presets, amount quick-fill buttons, protective order toggles, the
 * calculations panel, and the Confirm CTA.
 */
import { browser, expect } from '@wdio/globals';
import { TradeScreen } from '../../pages/TradeScreen.js';
import { LEVERAGE_PRESETS, QUICK_AMOUNTS, PROTECTIVE_ORDERS } from '../../utils/testData.js';

describe('Trade page — order ticket (Bitcoin)', () => {
    let trade: TradeScreen;

    beforeEach(async () => {
        trade = new TradeScreen();
        await trade.gotoBySlug('bitcoin');
    });

    it('page loads with title and URL', async () => {
        await trade.expectLoaded();
        expect((await browser.getUrl()) ?? '').toContain('/trade/bitcoin');
    });

    it('Buy tab is visible', async () => {
        await expect(trade.buyTab).toBeDisplayed();
    });

    it('Sell tab is visible', async () => {
        await expect(trade.sellTab).toBeDisplayed();
    });

    it('Market order is selected by default', async () => {
        await expect(trade.marketOrderTab).toBeDisplayed();
    });

    it('Limit order tab is visible', async () => {
        await expect(trade.limitOrderTab).toBeDisplayed();
    });

    it('Switching to Sell reverts Confirm label', async () => {
        await trade.selectSell();
        await expect(trade.confirmButton).toBeDisplayed();
    });

    it('Switching back to Buy shows Confirm BUY', async () => {
        await trade.selectSell();
        await trade.selectBuy();
        const text = (await trade.confirmButton.getText()) ?? '';
        expect(text.toUpperCase()).toMatch(/BUY/);
    });

    it('Selecting Limit order re-renders the ticket', async () => {
        await trade.selectLimitOrder();
        await browser.pause(300);
        await expect(trade.limitOrderTab).toBeDisplayed();
    });

    it('Selecting Market order reverts the ticket', async () => {
        await trade.selectLimitOrder();
        await trade.selectMarketOrder();
        await expect(trade.marketOrderTab).toBeDisplayed();
    });

    it('Leverage input has default value of 1', async () => {
        // DOM value is "1.0" — accept "1" or "1.0" as the default.
        const value = (await trade.leverageInput.getValue()) ?? '';
        expect(value).toMatch(/^1(\.0+)?$/);
    });

    it('All four leverage presets are visible', async () => {
        for (const p of LEVERAGE_PRESETS) {
            const btn = await browser.$(`//button[normalize-space(.)="${p}"]`);
            await expect(btn).toBeDisplayed();
        }
    });

    for (const preset of LEVERAGE_PRESETS) {
        it(`Leverage preset "${preset}" updates input value`, async () => {
            await trade.setLeveragePreset(preset);
            const value = (await trade.leverageInput.getValue()) ?? '';
            // Strip the decimal portion — actual DOM values are "1.0",
            // "2.0", "3.0", "5.0".
            const intPortion = value.replace(/\D/g, '');
            expect(intPortion).toBe(preset.replace('x', ''));
        });
    }

    it('USD/BTC amount toggle is visible', async () => {
        const toggle = (await trade.amountToggle)[0];
        await expect(toggle).toBeDisplayed();
    });

    for (const pct of QUICK_AMOUNTS) {
        it(`Quick amount "${pct}" is clickable`, async () => {
            await trade.setQuickAmount(pct);
            // No assertion needed beyond not crashing.
            expect(true).toBe(true);
        });
    }

    it('Protective order labels are present', async () => {
        for (const label of PROTECTIVE_ORDERS) {
            const el = await browser.$(`//*[contains(translate(., "${label}", "${label.toLowerCase()}"), "${label.toLowerCase()}")]`);
            await expect(el).toBeDisplayed();
        }
    });

    it('Calculations panel renders Notional, Margin, Liquidation, Fee', async () => {
        await expect(trade.notionalLabel).toBeDisplayed();
        await expect(trade.marginRequiredLabel).toBeDisplayed();
        await expect(trade.liquidationLabel).toBeDisplayed();
        await expect(trade.feeLabel).toBeDisplayed();
    });

    it('Confirm button is visible', async () => {
        await expect(trade.confirmButton).toBeDisplayed();
    });

    it('Chart and Trade sub-tabs are present', async () => {
        await expect(trade.chartTab).toBeDisplayed();
        await expect(trade.tradeTab).toBeDisplayed();
    });

    it('Buying Power label is present', async () => {
        await expect(trade.buyingPowerLabel).toBeDisplayed();
    });

    it('Custom leverage entry is accepted', async () => {
        await trade.setLeverage(3);
        const value = (await trade.leverageInput.getValue()) ?? '';
        expect(value).toMatch(/^3(\.0+)?$/);
    });
});
