/**
 * Footer — the bottom-of-page social/credit row.
 *
 * The footer renders across the SPA. On mobile the wordmark + "© <year>
 * ZEROHUE" copy stack above the social row.
 */
import { $ } from '@wdio/globals';
import { expect } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen.js';

export class Footer extends BaseScreen {
    constructor() {
        super();
    }

    /** "© <year> ZEROHUE" copy. */
    get copyright() {
        return this.footer;
    }

    /** "FOLLOW ON X" social link. */
    get followOnX() {
        return this.followOnXLink;
    }

    /** "JOIN DISCORD" social link. */
    get joinDiscord() {
        return this.joinDiscordLink;
    }

    async expectLoaded(): Promise<void> {
        await expect(this.copyright).toBeDisplayed();
        await expect(this.followOnX).toBeDisplayed();
        await expect(this.joinDiscord).toBeDisplayed();
    }
}
