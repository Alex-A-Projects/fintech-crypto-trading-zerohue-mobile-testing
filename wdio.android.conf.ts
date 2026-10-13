/**
 * wdio.android.conf.ts — drives the suite on a Samsung Galaxy S25
 * (Android 15) via UiAutomator2 + Chrome with mobile emulation.
 *
 * The mobileEmulation block under goog:chromeOptions is what flips
 * Chrome into phone-rendering mode: the viewport, the device pixel
 * ratio, the touch input, and the user agent all match the Galaxy S25.
 * Without mobileEmulation, Chrome would render the desktop site and
 * the responsive assertions in the suite would be wrong.
 *
 * Pre-requisites (not committed):
 *   - Appium server reachable at http://localhost:4723
 *   - An Android emulator already booted (Galaxy S25 / API 35)
 *   - `appium driver install uiautomator2` (one-time)
 *   - Chrome stable installed on the emulator (default on the AOSP
 *     image; the Play Store image may need an extra install).
 *
 * Override the Appium endpoint with APPIUM_HOST / APPIUM_PORT.
 * Override the device with ANDROID_DEVICE / ANDROID_OS.
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
            //
            // ===================
            // Browser-side
            // ===================
            // We test ZeroHue's *mobile web* app (the same HTML rendered
            // through Chrome on a phone). To swap to a native app,
            // change `browserName` to 'Application' and provide an
            // `app` capability.
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:browserName': 'Chrome',
            'appium:deviceName': process.env.ANDROID_DEVICE ?? 'Samsung Galaxy S25',
            'appium:platformVersion': process.env.ANDROID_OS ?? '15',
            'appium:udid': process.env.ANDROID_UDID,
            'appium:newCommandTimeout': 240,
            'appium:autoGrantPermissions': true,
            'appium:noReset': false,
            'appium:ensureWebviewsHavePages': true,
            'appium:nativeWebScreenshot': true,
            //
            // Mobile-emulated viewport that matches the Galaxy S25
            // (393×852 CSS px ≈ 6.2" diagonal at ~412 dpi).
            'goog:chromeOptions': {
                args: [
                    '--window-size=393,852',
                    '--force-device-scale-factor=2.625',
                ],
                mobileEmulation: {
                    deviceMetrics: {
                        width: 393,
                        height: 852,
                        pixelRatio: 2.625,
                        touch: true,
                        mobile: true,
                    },
                    userAgent:
                        'Mozilla/5.0 (Linux; Android 15; SM-S931) AppleWebKit/537.36 ' +
                        '(KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
                },
            },
        },
    ],
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60_000,
    },
};
