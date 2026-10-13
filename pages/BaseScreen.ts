/**
 * BaseScreen — every Screen Object in this project shares these helpers.
 *
 * ZeroHue is a single-page application; the chrome (logo, equity pill,
 * sidebar, mobile nav, footer) is rendered on every route. The locators
 * here are the contract that concrete screens (`MarketsScreen`,
 * `TradeScreen`) and standalone components reuse.
 *
 * Mobile-web notes
 *   - Selectors are written for the mobile rendering of the SPA. The
 *     "sidebar" still exists in the DOM at small viewports; tests for
 *     visibility drive the breakpoint through CSS via the responsive
 *     spec rather than a viewport-swap.
 *   - Cloudflare fronts the live site. `goto()` retries on the rate-
 *     limit page with exponential back-off so a single 429 doesn't fail
 *     a healthy suite.
 *   - Text-based locators use XPath (`contains(., "...")`) since the
 *     `:has-text()` pseudo-class is a Playwright extension, not a
 *     WebdriverIO / native browser selector.
 */
import { browser, $, $$ } from '@wdio/globals';
import { expect } from '@wdio/globals';
import { dismissDisclaimerIfPresent } from '../utils/helpers.js';

export abstract class BaseScreen {
    /** Canonical ZeroHue URL. */
    static readonly BASE_URL = 'https://zerohue.org';

    /** Maximum retries for transient Cloudflare rate-limit responses. */
    static readonly MAX_NAV_RETRIES = 4;
    /** Initial wait between nav retries; doubled each attempt (10s, 20s, 40s, 80s). */
    static readonly NAV_RETRY_DELAY_MS = 10_000;

    constructor() {
        // No-op: subclasses override goto().
    }

    /** Open a relative path against the ZeroHue base URL. */
    async open(path = '/markets'): Promise<void> {
        await this.goto(path);
    }

    /**
     * Navigate to the supplied path, retrying on Cloudflare rate-limit
     * responses with exponential back-off.
     */
    async goto(path = '/markets'): Promise<void> {
        const cleaned = path.startsWith('/') ? path : `/${path}`;
        const absolute = new URL(
            cleaned,
            BaseScreen.BASE_URL.endsWith('/') ? BaseScreen.BASE_URL : BaseScreen.BASE_URL + '/',
        ).toString();

        for (let attempt = 0; attempt < BaseScreen.MAX_NAV_RETRIES; attempt++) {
            try {
                await browser.url(absolute);
            } catch {
                // fall through to the rate-limit / retry check below
            }
            if (!(await BaseScreen.isRateLimited())) {
                return;
            }
            const backoff = BaseScreen.NAV_RETRY_DELAY_MS * Math.pow(2, attempt);
            // eslint-disable-next-line no-console
            console.warn(
                `[BaseScreen] Rate-limited on attempt ${attempt + 1}/${BaseScreen.MAX_NAV_RETRIES}; backing off ${backoff / 1000}s`,
            );
            await browser.pause(backoff);
        }
    }

    /** True when the Cloudflare 1015 rate-limit page is visible. */
    static async isRateLimited(): Promise<boolean> {
        const blocked = $('//*[contains(., "Error 1015") or contains(., "being rate limited")]');
        try {
            return await blocked.isDisplayed();
        } catch {
            return false;
        }
    }

    /** Wait until the page title contains the given fragment. */
    async waitForTitleContains(fragment: string): Promise<void> {
        await browser.waitUntil(
            async () => (await browser.getTitle()).toLowerCase().includes(fragment.toLowerCase()),
            { timeout: 15_000, interval: 200 },
        );
    }

    /**
     * Wait until the current browser URL matches a regular expression.
     *
     * WDIO v9 removed the `browser.waitForUrl` helper, so we poll via
     * `waitUntil` instead. Default timeout matches the rest of the suite.
     */
    async waitForUrlMatches(regex: RegExp, timeoutMs = 15_000): Promise<void> {
        await browser.waitUntil(
            async () => regex.test(await browser.getUrl()),
            { timeout: timeoutMs, interval: 250 },
        );
    }

    /** Dismiss the on-entry disclaimer modal if it's on screen. */
    async dismissDisclaimer(): Promise<void> {
        await dismissDisclaimerIfPresent();
    }

    // -------------------------------------------------------------------------
    // Chrome locators — every screen renders these.
    // -------------------------------------------------------------------------

    /** Site wordmark / logo at the top of the sidebar `<aside>`. */
    get logoLink() {
        return $('aside [aria-label="ZeroHue Logo"]');
    }

    /** "ZEROHUE" wordmark text inside the logo link. */
    get brand() {
        return this.logoLink.$('h1');
    }

    /** Desktop sidebar primary nav container. Hidden on mobile. */
    get sidebarNav() {
        return $('nav[aria-label="Primary navigation"]');
    }

    /** Mobile bottom nav container. Visible on mobile, hidden on md+. */
    get mobileNav() {
        return $('nav[aria-label="Primary mobile navigation"]');
    }

    /** "Total Equity" pill in the sidebar (the simulated account cash). */
    get equityWidget() {
        return $$('//button[contains(., "Total Equity")]')[0];
    }

    /** Reset/seed cash button — only present after the equity panel is expanded. */
    get resetAccountButton() {
        return $('//button[contains(., "Reset Account")]');
    }

    /** Collapse/expand the sidebar. The aria-label flips between
     *  "Collapse sidebar" and "Expand sidebar" depending on state. */
    get sidebarCollapseButton() {
        return $('button[aria-label="Collapse sidebar"], button[aria-label="Expand sidebar"]');
    }

    /** "© <year> ZEROHUE" footer copy. */
    get footer() {
        return $('//*[contains(text(), "©") and contains(text(), "ZEROHUE")]');
    }

    /** "Follow on X" social link. */
    get followOnXLink() {
        return $('//a[contains(translate(., "FOLLOW ON X", "follow on x"), "follow on x")]');
    }

    /** "Join Discord" social link. */
    get joinDiscordLink() {
        return $('//a[contains(translate(., "JOIN DISCORD", "join discord"), "join discord")]');
    }

    /** Returns the named sidebar section ("Trading" / "Competition" / "Resources"). */
    getSidebarSection(name: 'Trading' | 'Competition' | 'Resources') {
        return this.sidebarNav.$(`section[aria-label="${name}"]`);
    }

    /** Assert the chrome is up: title contains ZEROHUE, logo + footer visible. */
    async expectLoaded(): Promise<void> {
        await expect(browser).toHaveTitle(/ZEROHUE/);
        await this.logoLink.waitForDisplayed();
    }
}
