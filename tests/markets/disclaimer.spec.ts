/**
 * Disclaimer Modal tests.
 *
 * The first visit per browser context shows the disclaimer modal. For
 * these tests we *want* to see the modal, so we clear cookies and
 * storage between the navigation and the assertion.
 */
import { browser, expect } from '@wdio/globals';
import { dismissDisclaimerIfPresent } from '../../utils/helpers.js';
import { DISCLAIMER } from '../../utils/testData.js';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { DisclaimerModal } from '../../pages/components/DisclaimerModal.js';

describe('Disclaimer modal — first visit', () => {
    let disclaimer: DisclaimerModal;

    beforeEach(async () => {
        // Hit /markets once, then purge all storage and cookies so the
        // modal is forced to re-present itself.
        await browser.url('https://zerohue.org/markets');
        await browser.deleteAllCookies();
        // Reload by re-navigating to the current URL (WDIO v9 has no
        // `browser.refresh()`).
        await browser.url('https://zerohue.org/markets');
        disclaimer = new DisclaimerModal();
        await disclaimer.expectVisible();
    });

    it('modal is a proper ARIA dialog with the "Before You Begin" header', async () => {
        await expect(disclaimer.shell).toHaveAttribute('role', 'dialog');
        await expect(disclaimer.heading).toBeDisplayed();
        const text = await disclaimer.heading.getText();
        expect(text).toContain(DISCLAIMER.heading);
    });

    it('lists the four standard informational headings', async () => {
        for (const item of DISCLAIMER.items) {
            const h = await browser.$(`//h3[contains(., "${item.heading}")]`);
            await h.waitForDisplayed();
        }
    });

    it('CTA is disabled until checkbox is acknowledged', async () => {
        await disclaimer.expectAcceptButtonDisabled();
        await disclaimer.acknowledge();
        await expect(disclaimer.openSimulatorButton).toBeEnabled();
    });

    it('toggling acknowledgement toggles the CTA state', async () => {
        await disclaimer.acknowledge();
        await expect(disclaimer.openSimulatorButton).toBeEnabled();
        await disclaimer.acknowledgeCheckbox.click();
        await disclaimer.expectAcceptButtonDisabled();
    });

    it('full acceptance flow closes the modal', async () => {
        await disclaimer.accept();
        await expect(disclaimer.backdrop).not.toBeDisplayed();
    });
});

describe('Disclaimer modal — already-dismissed state', () => {
    it('helper handles already-dismissed modal without error', async () => {
        const markets = new MarketsScreen();
        await markets.goto();
        await dismissDisclaimerIfPresent();
        await dismissDisclaimerIfPresent(); // second call: should be a no-op
        await markets.marketTable.waitForDisplayed();
    });
});
