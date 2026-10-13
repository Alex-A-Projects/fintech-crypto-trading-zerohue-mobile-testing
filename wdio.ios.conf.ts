/**
 * wdio.ios.conf.ts — drives the suite on iPhone 17 Pro (iOS 26) via
 * XCUITest + Safari. This is real mobile-web testing: the page renders
 * through Safari on the simulator, not through a desktop browser.
 *
 * Pre-requisites (not committed):
 *   - Appium server reachable at http://localhost:4723
 *   - Xcode + an iPhone 17-series simulator already booted
 *   - `appium driver install xcuitest` (one-time)
 *
 * Override the Appium endpoint with APPIUM_HOST / APPIUM_PORT.
 * Override the device with IOS_DEVICE / IOS_VERSION.
 */
import { config as sharedConfig } from './wdio.shared.conf';

export const config = {
    ...sharedConfig,
    hostname: process.env.APPIUM_HOST ?? 'localhost',
    port: Number(process.env.APPIUM_PORT ?? 4723),
    path: '/wd/hub',
    services: ['appium'],
    capabilities: [
        {
            platformName: 'iOS',
            'appium:automationName': 'XCUITest',
            'appium:browserName': 'Safari',
            'appium:deviceName': process.env.IOS_DEVICE ?? 'iPhone 17 Pro',
            'appium:platformVersion': process.env.IOS_VERSION ?? '26.0',
            'appium:udid': process.env.IOS_UDID,
            'appium:newCommandTimeout': 240,
            'appium:autoWebview': true,
            'appium:ensureWebviewsHavePages': true,
            'appium:nativeWebScreenshot': true,
            // Force the locale to en-US so the page renders the same
            // brand copy + currency formatting in every run.
            'appium:processArguments': {
                args: [
                    '-AppleLanguages',
                    '(en-US)',
                    '-AppleLocale',
                    'en_US',
                ],
            },
        },
    ],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60_000,
    },
};
