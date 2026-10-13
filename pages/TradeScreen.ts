/**
 * TradeScreen — represents `/trade/<asset-slug>` (e.g. `/trade/bitcoin`).
 *
 * Layout
 *   - Header: back-to-markets button, share button, CoinMarketCap link
 *   - Sub-tabs: Chart / Trade
 *   - Asset title block: Bitcoin BTC/USD $price -change%
 *   - Order Ticket panel with Buy/Sell toggle, Market/Limit toggle,
 *     leverage input + 1x/2x/3x/5x presets, Amount (USD/BTC) with
 *     25/50/75/100% quick fills, protective orders (Take Profit / Stop
 *     Loss), confirm button.
 */
import { browser, $, $$ } from '@wdio/globals';
import { expect } from '@wdio/globals';
import { BaseScreen } from './BaseScreen.js';
import { DisclaimerModal } from './components/DisclaimerModal.js';

export class TradeScreen extends BaseScreen {
    readonly disclaimer: DisclaimerModal;

    get backToMarketsButton() {
        return $('//button[contains(@aria-label, "Back to markets") or contains(., "Back to markets")]');
    }
    get shareButton() {
        return $('//button[contains(@aria-label, "Share this asset link")]');
    }
    get coinMarketCapLink() {
        return $('//button[contains(@aria-label, "View asset on CoinMarketCap")]');
    }

    get chartTab() {
        return $$('//button[normalize-space(.)="Chart"]')[0];
    }
    get tradeTab() {
        return $$('//button[normalize-space(.)="Trade"]')[0];
    }

    get assetTitle() {
        return $$('//main//h1')[0];
    }
    get assetSymbol() {
        return $$('//main//h1/following-sibling::p[1]')[0];
    }
    get priceLabel() {
        return $$('//main//*[contains(text(), "$") and contains(translate(., "0123456789", "dddddddddd"), "d")][1]')[0];
    }

    get buyTab() {
        return $('//button[contains(@aria-label, "Select Buy order type")]');
    }
    get sellTab() {
        return $('//button[contains(@aria-label, "Select Sell order type")]');
    }
    get marketOrderTab() {
        return $('//button[contains(., "Market order")]');
    }
    get limitOrderTab() {
        return $('//button[contains(., "Limit order")]');
    }

    get leverageInput() {
        return $('input[aria-label="Leverage input"]');
    }
    get leveragePresets() {
        return $$('//button[(normalize-space(.)="1x") or (normalize-space(.)="2x") or (normalize-space(.)="3x") or (normalize-space(.)="5x")]');
    }

    get amountToggle() {
        return $$('//button[normalize-space(.)="USD" or normalize-space(.)="BTC"]');
    }
    get quickAmountButtons() {
        return $$('//button[normalize-space(.)="25%" or normalize-space(.)="50%" or normalize-space(.)="75%" or normalize-space(.)="100%"]');
    }

    get buyingPowerLabel() {
        return $$('//*[contains(translate(., "BUYING POWER", "buying power"), "buying power")]')[0];
    }
    get takeProfitField() {
        return $$('//*[contains(translate(., "TAKE PROFIT", "take profit"), "take profit")]')[0];
    }
    get stopLossField() {
        return $$('//*[contains(translate(., "STOP LOSS", "stop loss"), "stop loss")]')[0];
    }
    get notionalLabel() {
        return $$('//*[contains(translate(., "NOTIONAL", "notional"), "notional")]')[0];
    }
    get marginRequiredLabel() {
        return $$('//*[contains(translate(., "MARGIN REQUIRED", "margin required"), "margin required")]')[0];
    }
    get liquidationLabel() {
        return $$('//*[contains(translate(., "EST. LIQUIDATION", "est. liquidation"), "est. liquidation")]')[0];
    }
    get feeLabel() {
        return $$('//*[contains(translate(., "TRADING FEE", "trading fee"), "trading fee")]')[0];
    }
    get confirmButton() {
        return $$('//button[starts-with(normalize-space(.), "Confirm BUY") or starts-with(normalize-space(.), "Confirm SELL")]')[0];
    }

    constructor() {
        super();
        this.disclaimer = new DisclaimerModal();
    }

    /** Navigate by asset slug, e.g. 'bitcoin', 'ethereum'. */
    async gotoBySlug(slug: string): Promise<void> {
        await super.goto(`/trade/${slug}`);
        await this.dismissDisclaimer();

        // Wait for the hero asset name to render. Use an explicit list
        // of known names so a single regex covers all routed slugs.
        const heroNameRegex = /Bitcoin|Bitcoin Cash|Ethereum|Solana|Dogecoin|Cardano|Chainlink|Hedera|Litecoin|Avalanche|Sui|Zcash|Shiba Inu|Cronos|Polkadot|Uniswap|Aave|Near|Pepe|Internet Computer|BNB|Ripple|Hyperliquid|Stellar|Ondo|Aerodrome|Ethena|World Liberty|Cosmos|Arbitrum|Render|Aptos|Filecoin|VeChain/i;
        await browser.waitUntil(
            async () => {
                const h1s = await $$('//main//h1');
                for (const h1 of h1s) {
                    const text = ((await h1.getText()) ?? '').trim();
                    if (heroNameRegex.test(text)) return true;
                }
                return false;
            },
            { timeout: 30_000, interval: 250 },
        );
    }

    async switchToChart(): Promise<void> {
        await this.chartTab.click();
    }

    async switchToTrade(): Promise<void> {
        await this.tradeTab.click();
    }

    async selectBuy(): Promise<void> {
        await this.buyTab.click();
    }

    async selectSell(): Promise<void> {
        await this.sellTab.click();
    }

    async selectMarketOrder(): Promise<void> {
        await this.marketOrderTab.click();
    }

    async selectLimitOrder(): Promise<void> {
        await this.limitOrderTab.click();
    }

    async setLeverage(value: number): Promise<void> {
        await this.leverageInput.setValue(String(value));
    }

    async setLeveragePreset(text: '1x' | '2x' | '3x' | '5x'): Promise<void> {
        const btn = $(`//button[normalize-space(.)="${text}"]`);
        await btn.click();
    }

    async setAmountMode(mode: 'USD' | 'BTC'): Promise<void> {
        const btn = $(`//button[normalize-space(.)="${mode}"]`);
        await btn.click();
    }

    async setQuickAmount(percent: '25%' | '50%' | '75%' | '100%'): Promise<void> {
        const btn = $(`//button[normalize-space(.)="${percent}"]`);
        await btn.click();
    }

    async goBackToMarkets(): Promise<void> {
        await this.backToMarketsButton.click();
        await this.waitForUrlMatches(/\/markets/);
    }

    async expectLoaded(_symbol = 'BTC/USD'): Promise<void> {
        await expect(browser).toHaveUrl(/\/trade\//);
        await expect(browser).toHaveTitle(/BTC Trade \| ZEROHUE|Bitcoin Trade \| ZEROHUE|Trade \| ZEROHUE/);
        await this.priceLabel.waitForDisplayed();
        await this.confirmButton.waitForDisplayed();
    }
}
