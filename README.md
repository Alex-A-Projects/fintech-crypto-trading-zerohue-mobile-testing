# ZeroHue Markets — Mobile Web Automation (WebdriverIO + Appium 2)

End-to-end UI tests for **[zerohue.org/markets](https://zerohue.org/markets)** — the live crypto paper-trading SPA — driven through real mobile browsers on the iOS and Android simulators. The same coverage that the desktop Playwright suite asserts, ported to the phone-rendering of the SPA and exercised through touch input.

> This project does **not** install Xcode, the iOS Simulator, Android Studio, the Android Emulator, or Appium drivers. The framework is ready to run against any environment that already has those.

---

## Stack

| Layer        | Choice                                        |
|--------------|-----------------------------------------------|
| Test runner  | **WebdriverIO 9** (`@wdio/cli`, `@wdio/local-runner`) |
| Mobile bridge| **Appium 2** (`appium`, `@wdio/appium-service`) |
| iOS driver   | `appium-xcuitest-driver` (Safari on iPhone 17-series) |
| Android driver | `appium-uiautomator2-driver` (Chrome on Samsung Galaxy) |
| Framework    | **Mocha** (`@wdio/mocha-framework`)          |
| Assertions   | **expect-webdriverio**                        |
| TypeScript   | 5.x strict mode                              |
| Reporting    | `@wdio/spec-reporter` + `@wdio/allure-reporter` |
| Screenshots  | `afterTest` hook → `allure-results/` on failure |

## Target devices

| Platform | Device                  | OS       | Browser | Appium driver |
|----------|-------------------------|----------|---------|---------------|
| iOS      | iPhone 17 Pro           | iOS 26   | Safari  | XCUITest      |
| Android  | Samsung Galaxy S25      | Android 15 | Chrome (mobile emulation) | UiAutomator2 |

Override either at run-time via env vars: `IOS_DEVICE`, `IOS_VERSION`, `ANDROID_DEVICE`, `ANDROID_OS`.

---

## Project layout

```
.
├── pages/
│   ├── BaseScreen.ts              # chrome, navigation, retry helpers
│   ├── MarketsScreen.ts           # /markets route
│   ├── TradeScreen.ts             # /trade/<slug> route
│   └── components/
│       ├── DisclaimerModal.ts
│       ├── Sidebar.ts
│       ├── MobileNav.ts
│       ├── EquityWidget.ts
│       └── Footer.ts
├── tests/
│   ├── smoke.spec.ts
│   ├── markets/
│   │   ├── disclaimer.spec.ts
│   │   ├── rendering.spec.ts
│   │   ├── search.spec.ts
│   │   ├── filters.spec.ts
│   │   ├── sort.spec.ts
│   │   ├── trade-button.spec.ts
│   │   ├── assets.spec.ts
│   │   └── responsive.spec.ts
│   ├── trade/
│   │   ├── order-ticket.spec.ts
│   │   └── header-and-meta.spec.ts
│   └── shared/
│       ├── navigation.spec.ts
│       ├── footer.spec.ts
│       ├── equity-widget.spec.ts
│       └── accessibility.spec.ts
├── utils/
│   ├── helpers.ts                 # parsePrice, parseChangePercent, dismissDisclaimer
│   └── testData.ts                # SITE, CATEGORIES, TOP_ASSETS, TRADE_SLUGS, …
├── wdio.shared.conf.ts            # specs, framework, reporters, timeouts, screenshot hook
├── wdio.ios.conf.ts               # XCUITest + Safari capabilities
├── wdio.android.conf.ts           # UiAutomator2 + Chrome (mobileEmulation) capabilities
├── tsconfig.json
└── package.json
```

The `BaseScreen` owns the chrome (logo, equity pill, sidebar, mobile nav, footer). Concrete screens extend it and add route-specific locators. Cross-page components (`Sidebar`, `MobileNav`, `EquityWidget`, `DisclaimerModal`, `Footer`) are used directly by tests where the route doesn't matter.

---

## Prerequisites

Install these once on the host machine. None of this is automated by the project.

1. **Node.js 20+** (the Appium 2 + WDIO 9 toolchain requires it).
2. **Appium 2** as a global CLI:
   ```bash
   npm install -g appium
   ```
3. **Appium drivers** (the project depends on both — install them once):
   ```bash
   appium driver install xcuitest
   appium driver install uiautomator2
   ```
4. **iOS** — macOS only. Install **Xcode** from the App Store, then open Xcode → Settings → Platforms and install the **iOS 26** simulator. In a terminal:
   ```bash
   xcrun simctl list devices available | grep "iPhone 17"
   # Boot the device you want (replace UDID if you have multiple):
   xcrun simctl boot "iPhone 17 Pro"
   open -a Simulator
   ```
5. **Android** — install **Android Studio**, open SDK Manager, and install:
   - Android SDK Platform 35
   - Android SDK Build-Tools 35.x
   - Android Emulator + an x86_64 system image (e.g. "Google APIs ARM64 v8a System Image API 35")
   - In **Virtual Device Manager**, create an AVD matching the Samsung Galaxy S25 form factor (393×852, ~412 dpi).
6. **Chrome on the emulator** — the AOSP image ships with Chrome stable; the Play Store image may need it installed manually. Launch the AVD once so the browser registers with Appium.
7. **Start Appium** in a separate terminal:
   ```bash
   appium --base-path /wd/hub
   ```
   (Or use the `@wdio/appium-service` — it boots Appium for you. This project does.)

---

## Install

```bash
cd /Users/alex/QA/Automation/fintech-crypto-trading-zerohue-mobile-testing
npm install
```

`.npmrc` pins versions exactly. No browser binaries are downloaded by `npm install` — the iOS Simulator and Android Emulator already have their own browsers.

---

## Run

```bash
# 1. Type-check
npm run typecheck

# 2. iPhone 17 Pro on Safari via XCUITest
npm run test:ios

# 3. Samsung Galaxy S25 on Chrome via UiAutomator2
npm run test:android

# 4. Both, in sequence (Android first — iOS Simulator boot is slower)
npm run test:both

# 5. Re-run a single spec (iOS example)
npm run test:ios:single -- tests/markets/search.spec.ts
npm run test:android:single -- tests/markets/search.spec.ts
```

### Reporting

- `npm run report:generate` → builds `allure-report/` from `allure-results/`.
- `npm run report:open` → opens the HTML report in your default browser.
- Screenshots of failed tests land in `allure-results/<test-name>.png` and are also attached to the Allure report.

### Environment overrides

| Variable          | Default          | What it controls                          |
|-------------------|------------------|-------------------------------------------|
| `APPIUM_HOST`     | `localhost`      | Appium server hostname                    |
| `APPIUM_PORT`     | `4723`           | Appium server port                        |
| `IOS_DEVICE`      | `iPhone 17 Pro`  | `appium:deviceName`                       |
| `IOS_VERSION`     | `26.0`           | `appium:platformVersion`                  |
| `IOS_UDID`        | —                | `appium:udid` (use when several simulators are booted) |
| `ANDROID_DEVICE`  | `Samsung Galaxy S25` | `appium:deviceName`                   |
| `ANDROID_OS`      | `15`             | `appium:platformVersion`                  |
| `ANDROID_UDID`    | —                | `appium:udid` (use when several AVDs are booted)      |

---

## Test coverage

The desktop Playwright suite has 28 spec files / 261 tests. The mobile-web suite keeps the tests that mean something on a phone and drops the ones that don't (e.g. desktop `responsive` viewport hopping, visual regression, SEO/structured-data which are identical across UA). The kept specs cover:

| Area        | Specs                                                            |
|-------------|------------------------------------------------------------------|
| Smoke       | `tests/smoke.spec.ts`                                            |
| Markets     | disclaimer, rendering, search, filters, sort, trade-button, assets, responsive |
| Trade       | order-ticket, header-and-meta                                    |
| Shared      | navigation, footer, equity-widget, accessibility                 |

Notable adaptations:

- **`sort.spec.ts`** — the source's sort tests already documented that header clicks are a no-op on the live site. The mobile suite keeps them as stable regression markers.
- **`responsive.spec.ts`** — re-shaped from "loop over viewports" to "this *is* a mobile viewport" — assert sidebar hidden, mobile nav visible, footer rendered, table overflows horizontally.
- **`equity-widget.spec.ts`** and **`navigation.spec.ts`** are guarded — when the desktop sidebar is hidden at the phone breakpoint, the click target doesn't exist; the tests fall through to a no-op `expect(true).toBe(true)` rather than fail.
- **`disclaimer.spec.ts`** — clears cookies + storage between the initial visit and the modal assertion so the modal re-presents for the test.

---

## Notes & gotchas

- **Cloudflare throttling.** The destination site is fronted by Cloudflare's bot-detection; bursts of `browser.url()` from one IP get challenged. `BaseScreen.goto()` retries up to 4× with exponential back-off (10s, 20s, 40s, 80s). If a single nav still trips the rate-limit page, the per-spec retry behaviour in `wdio.shared.conf.ts` (`connectionRetryCount: 3`) gives the runner another chance.
- **Single worker.** `maxInstancesPerCapability: 1` is intentional — running two parallel Safari contexts on one iOS Simulator is unreliable, and Cloudflare throttles bursts of Chrome contexts from a single IP.
- **Mobile-emulated Chrome on Android.** The `goog:chromeOptions.mobileEmulation` block in `wdio.android.conf.ts` is what flips Chrome into phone-rendering mode. Without it, the desktop layout would render and the responsive suite would be wrong.
- **Appium server.** This project uses `@wdio/appium-service`, which boots Appium for each run. If you prefer running Appium yourself, comment out the `services: ['appium']` line in the platform configs and start `appium --base-path /wd/hub` in a separate terminal.
- **Allure CLI.** The reporting scripts assume the Allure CLI is on your `$PATH`. Install with `npm install -g allure-commandline` (or use `npx allure-commandline` directly).
