/**
 * DisclaimerModal — the on-entry modal that blocks the markets UI on
 * the first visit of a session.
 *
 * The checkbox acts as the "I have read…" acknowledgement, which then
 * enables the "Open Simulator" CTA.
 */
import { browser, $, $$ } from '@wdio/globals';
import { expect } from '@wdio/globals';

export class DisclaimerModal {
    /** Backdrop wrapper around the dialog. */
    get backdrop() {
        return $('.zh-modal-backdrop');
    }

    /** The dialog itself (role="dialog"). */
    get shell() {
        return $('[role="dialog"]');
    }

    /** "Before You Begin" heading. */
    get heading() {
        return $('//h2[contains(., "Before You Begin")]');
    }

    /** Acknowledgement checkbox (role="checkbox"). */
    get acknowledgeCheckbox() {
        return $$('[role="checkbox"]')[0];
    }

    /** "Open Simulator" CTA — disabled until the checkbox is checked. */
    get openSimulatorButton() {
        return $('//button[contains(., "Open Simulator")]');
    }

    /** Individual checklist item headings. */
    get educationalItem() {
        return $('//h3[contains(., "Educational Purpose Only")]');
    }
    get financialAdviceItem() {
        return $('//h3[contains(., "No Financial Advice")]');
    }
    get regulatoryItem() {
        return $('//h3[contains(., "Regulatory Status")]');
    }
    get accuracyItem() {
        return $('//h3[contains(., "Data Accuracy")]');
    }

    async expectVisible(): Promise<void> {
        await this.backdrop.waitForDisplayed({ timeout: 10_000 });
        await this.heading.waitForDisplayed();
        await expect(this.shell).toHaveAttribute('role', 'dialog');
    }

    async expectAllChecklistItemsVisible(): Promise<void> {
        for (const item of [
            this.educationalItem,
            this.financialAdviceItem,
            this.regulatoryItem,
            this.accuracyItem,
        ]) {
            await item.waitForDisplayed();
        }
    }

    async expectAcceptButtonDisabled(): Promise<void> {
        await expect(this.openSimulatorButton).toBeDisabled();
    }

    /** Tap the acknowledgement checkbox to enable the CTA. */
    async acknowledge(): Promise<void> {
        await this.acknowledgeCheckbox.scrollIntoView();
        await this.acknowledgeCheckbox.click();
        // Wait for the CTA to flip from disabled to enabled.
        await browser.waitUntil(
            async () => await this.openSimulatorButton.isEnabled(),
            { timeout: 5_000, interval: 100 },
        );
    }

    /** Acknowledge then close — the standard acceptance flow. */
    async accept(): Promise<void> {
        await this.acknowledge();
        await this.openSimulatorButton.click();
        await browser.waitUntil(
            async () => !(await this.backdrop.isDisplayed().catch(() => false)),
            { timeout: 10_000, interval: 100 },
        );
    }
}
