/**
 * Sidebar — the desktop primary nav (Trading / Competition / Resources).
 *
 * On mobile breakpoints the sidebar is hidden via CSS (`hidden md:flex`).
 * The mobile-web suite has a separate `MobileNav` for the bottom tab
 * bar; tests for sidebar visibility belong in the responsive spec.
 */
import { $ } from '@wdio/globals';
import { expect } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen.js';

export class Sidebar extends BaseScreen {
    constructor() {
        super();
    }

    get logoLink() {
        return $('aside [aria-label="ZeroHue Logo"]');
    }

    get brand() {
        return this.logoLink.$('h1');
    }

    get marketsLink() {
        return this.sidebarNav.$('a[aria-label="Markets"]');
    }
    get portfolioLink() {
        return this.sidebarNav.$('a[aria-label="Portfolio"]');
    }
    get ordersLink() {
        return this.sidebarNav.$('a[aria-label="Orders"]');
    }
    get historyLink() {
        return this.sidebarNav.$('a[aria-label="History"]');
    }

    get competitionLink() {
        return this.sidebarNav.$('a[aria-label="Competition"]');
    }
    get leaderboardLink() {
        return this.sidebarNav.$('a[aria-label="Leaderboard"]');
    }

    get faqLink() {
        return this.sidebarNav.$('a[aria-label="FAQ"]');
    }
    get aboutLink() {
        return this.sidebarNav.$('a[aria-label="About"]');
    }

    async expectAllSectionsVisible(): Promise<void> {
        await this.getSidebarSection('Trading').waitForDisplayed();
        await this.getSidebarSection('Competition').waitForDisplayed();
        await this.getSidebarSection('Resources').waitForDisplayed();
    }

    async expectAllTradingLinks(): Promise<void> {
        await this.marketsLink.waitForDisplayed();
        await this.portfolioLink.waitForDisplayed();
        await this.ordersLink.waitForDisplayed();
        await this.historyLink.waitForDisplayed();
    }

    async expectAllCompetitionLinks(): Promise<void> {
        await this.competitionLink.waitForDisplayed();
        await this.leaderboardLink.waitForDisplayed();
    }

    async expectAllResourceLinks(): Promise<void> {
        await this.faqLink.waitForDisplayed();
        await this.aboutLink.waitForDisplayed();
    }

    /** Click the chevron — toggles the sidebar between expanded and collapsed. */
    async toggle(): Promise<void> {
        await this.sidebarCollapseButton.click();
    }
}
