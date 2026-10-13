import { browser, $$ } from '@wdio/globals';
import { DisclaimerModal } from '../pages/components/DisclaimerModal.js';

/**
 * Shared helper: dismiss the on-entry disclaimer modal if it shows up,
 * accepting it via the acknowledgement checkbox and "Open Simulator"
 * CTA. Safe to call multiple times — the second call is a no-op.
 */
export async function dismissDisclaimerIfPresent(): Promise<void> {
    const modal = new DisclaimerModal();
    const backdrop = await modal.backdrop;
    const visible = await backdrop.isDisplayed().catch(() => false);
    if (visible) {
        await modal.accept();
    }
}

/**
 * Parse a price string like "$82,600.01" / "$0.00000541" / "$1,283.22"
 * into a Number. Strips commas, leading $, and surrounding whitespace.
 */
export function parsePrice(raw: string): number {
    const trimmed = raw.trim().replace(/^\$/, '').replace(/,/g, '');
    if (!trimmed) return NaN;
    return Number(trimmed);
}

/**
 * Parse "24h Change" cells like "+1.12%" / "-0.47%".
 * Returns a signed fractional value (e.g. -0.47 → -0.0047).
 */
export function parseChangePercent(raw: string): number {
    const m = raw.trim().match(/^([+-]?[\d.]+)%$/);
    if (!m) return NaN;
    return Number(m[1]) / 100;
}

/** Assert that a price string parses and is positive. */
export function expectValidPrice(raw: string): void {
    const value = parsePrice(raw);
    if (!Number.isFinite(value)) {
        throw new Error(`price "${raw}" not finite`);
    }
    if (value <= 0) {
        throw new Error(`price "${raw}" not positive`);
    }
}

/**
 * Wait until the markets table has finished hydrating by polling for
 * at least one row. Used by tests that touch the markets table outside
 * the MarketsScreen POM.
 */
export async function waitForTable(): Promise<void> {
    await browser.waitUntil(
        async () => (await $$('table tbody tr').length) > 0,
        { timeout: 15_000, interval: 250 },
    );
}
