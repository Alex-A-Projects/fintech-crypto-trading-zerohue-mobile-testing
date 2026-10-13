/**
 * MobileNav — the bottom fixed tab bar that appears on phone viewports.
 * Hidden on `md`+ breakpoints. The same primary links (Markets /
 * Portfolio / Orders / History / Competition / Leaderboard / FAQ / About)
 * are present as the desktop sidebar.
 */
import { $ } from '@wdio/globals';
import { expect } from '@wdio/globals';

export class MobileNav {
    /** Bottom nav container. */
    get root() {
        return $('nav[aria-label="Primary mobile navigation"]');
    }

    /** Every link inside the bottom nav. */
    get allLinks() {
        return this.root.$$('a');
    }

    async expectVisible(): Promise<void> {
        await expect(this.root).toBeDisplayed();
    }

    /**
     * "Hidden" here means the element is either not in the DOM or has
     * a CSS-driven `display: none` / `visibility: hidden`. expect-
     * webdriverio v4 exposes `toBeDisplayedInViewport` but not the
     * inverse; we use `not.toBeDisplayed()`.
     */
    async expectHidden(): Promise<void> {
        await expect(this.root).not.toBeDisplayed();
    }
}
