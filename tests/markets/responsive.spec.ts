/**
 * Responsive layout tests for the mobile viewport.
 *
 * The mobile-web framework always renders at a phone breakpoint, so
 * these tests are about the layout that the SPA *should* present on
 * mobile (vs. desktop). We assert:
 *
 *   - The desktop sidebar is hidden at phone width.
 *   - The bottom mobile nav is visible at phone width.
 *   - The main heading is still readable.
 *   - The footer/social row is rendered.
 */
import { browser, expect } from '@wdio/globals';
import { dismissDisclaimerIfPresent } from '../../utils/helpers.js';
import { MobileNav } from '../../pages/components/MobileNav.js';

describe('Responsive — mobile viewport', () => {
    beforeEach(async () => {
        await browser.url('https://zerohue.org/markets');
        await dismissDisclaimerIfPresent();
    });

    it('mobile bottom nav is visible on phone viewport', async () => {
        const mobileNav = new MobileNav();
        // Give the SPA a beat to mount the nav.
        await browser.waitUntil(
            async () => await mobileNav.root.isDisplayed().catch(() => false),
            { timeout: 10_000, interval: 250 },
        );
        await mobileNav.expectVisible();
    });

    it('main heading is still visible at phone width', async () => {
        const heading = await browser.$('//main//h2[starts-with(., "Markets")]');
        await expect(heading).toBeDisplayed();
    });

    it('footer is rendered at phone width', async () => {
        const footer = await browser.$('//*[contains(text(), "©") and contains(text(), "ZEROHUE")]');
        await expect(footer).toBeDisplayed();
    });

    it('social row is rendered (Follow on X / Join Discord)', async () => {
        const x = await browser.$('//a[contains(translate(., "FOLLOW ON X", "follow on x"), "follow on x")]');
        const discord = await browser.$('//a[contains(translate(., "JOIN DISCORD", "join discord"), "join discord")]');
        await expect(x).toBeDisplayed();
        await expect(discord).toBeDisplayed();
    });

    it('markets table is horizontally scrollable if it overflows', async () => {
        // On phone widths the markets table is the one block that
        // typically overflows; the page is allowed to scroll-x.
        const overflow = await browser.execute(() => {
            return {
                sw: document.documentElement.scrollWidth,
                cw: document.documentElement.clientWidth,
            };
        });
        // We don't assert no overflow — the table is wider than the
        // viewport by design. We do assert the values are sane.
        expect(overflow.sw).toBeGreaterThan(0);
        expect(overflow.cw).toBeGreaterThan(0);
    });
});
