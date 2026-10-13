/**
 * EquityWidget — the pill in the sidebar that shows the simulated
 * account cash. Clicking the pill toggles an expanded portfolio
 * panel; the "Reset Account" button inside the expanded panel
 * restores the $50,000 seed.
 */
import { $, $$ } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen.js';

export class EquityWidget extends BaseScreen {
    constructor() {
        super();
    }

    /** "TOTAL EQUITY" label inside the pill. */
    get equityLabel() {
        return $$('//*[contains(translate(., "TOTAL EQUITY", "total equity"), "total equity")]')[0];
    }

    /** "$50,000" cash indicator. */
    get cashAmount() {
        return $$('//*[contains(., "$50,000")]')[0];
    }

    /** "0.00%" delta indicator. */
    get deltaPercent() {
        return $$('//*[contains(., "0.00%")]')[0];
    }

    /** Reset/seed button — only present after the panel is expanded. */
    get resetButton() {
        return this.resetAccountButton;
    }

    async expectVisible(): Promise<void> {
        await this.equityWidget.waitForDisplayed();
    }

    async expand(): Promise<void> {
        await this.equityWidget.click();
    }
}
