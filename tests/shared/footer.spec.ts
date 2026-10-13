/**
 * Footer & social link tests.
 */
import { browser, expect } from '@wdio/globals';
import { MarketsScreen } from '../../pages/MarketsScreen.js';
import { Footer } from '../../pages/components/Footer.js';

describe('Footer', () => {
    let markets: MarketsScreen;
    let footer: Footer;

    beforeEach(async () => {
        markets = new MarketsScreen();
        await markets.goto();
        footer = new Footer();
    });

    it('Footer copyright text is rendered', async () => {
        await expect(footer.copyright).toBeDisplayed();
    });

    it('Follow on X link is visible', async () => {
        await expect(footer.followOnX).toBeDisplayed();
    });

    it('Join Discord link is visible', async () => {
        await expect(footer.joinDiscord).toBeDisplayed();
    });

    it('Footer text mentions simulator', async () => {
        const el = await browser.$('//*[contains(translate(., "PRACTICE LOCALLY", "practice locally"), "practice locally") or contains(translate(., "SIMULATOR", "simulator"), "simulator")]');
        await expect(el).toBeDisplayed();
    });
});
