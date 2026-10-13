/**
 * wdio.shared.conf.ts — configuration shared by both platform configs.
 *
 * WebdriverIO v9 expects each platform config to extend this and pick
 * its own capabilities. This file is imported by `wdio.ios.conf.ts`
 * and `wdio.android.conf.ts`.
 *
 * What lives here:
 *   - test-runner + framework defaults
 *   - reporters (spec + allure for portfolio)
 *   - default timeouts (ZeroHue is behind Cloudflare, so connection
 *     retries are generous)
 *   - a screenshot hook that saves evidence to `allure-results/` on
 *     failure for every spec
 */
import { browser } from '@wdio/globals';
import type { Options } from '@wdio/types';

export const config: Partial<Options.Testrunner> = {
    runner: 'local',
    //
    // ========================
    // Test files / framework
    // ========================
    specs: ['./tests/**/*.spec.ts'],
    // API/DB-only specs (none today) would live under ./tests/api/** and
    // would be excluded here so the matcher stays clean.
    exclude: ['./tests/api/**/*.spec.ts'],
    // Mobile-web via Appium is single-instance per device — running two
    // parallel Safari contexts on one iOS Simulator is unreliable, so
    // we lock WDIO to a single worker.
    maxInstancesPerCapability: 1,
    //
    // ===============
    // WDIO frameworks
    // ===============
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        // Cloudflare + a streaming-price SPA can keep a single nav busy
        // for a while; 60s is the source suite's per-test budget too.
        timeout: 60_000,
    },
    //
    // ==================
    // Reporters
    // ==================
    reporters: [
        'spec',
        ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: true }],
    ],
    //
    // ===================
    // Default timeouts
    // ===================
    waitforTimeout: 10_000,
    connectionRetryTimeout: 120_000,
    // Cloudflare rate-limits bursts from a single IP. Three retries plus
    // the per-page back-off in BaseScreen.goto() is enough to absorb
    // most 429s without tripping the global setup.
    connectionRetryCount: 3,
    //
    // ===================
    // Global hooks
    // ===================
    afterTest: async function (test, _context, { error }) {
        if (error) {
            // Save a screenshot on failure so a CI run produces useful
            // evidence. Path is keyed by test name so multiple failures
            // don't overwrite each other.
            const safe = test.fullTitle.replace(/[^a-z0-9]+/gi, '_');
            await browser.saveScreenshot(`./allure-results/${safe}.png`).catch(() => undefined);
        }
    },
};
