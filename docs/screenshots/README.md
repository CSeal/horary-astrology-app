# Screenshots

Place app screenshots here after the first TestFlight / internal build.

## Required screenshots

| Filename | Screen | Notes |
|---|---|---|
| `01-splash.png` | Animated splash | Capture mid-animation if possible — zodiac clock face visible |
| `02-onboarding.png` | Onboarding Step 0 | App name + tagline on cosmic background |
| `03-home.png` | Home screen | AskForm visible, empty question field |
| `04-verdict-yes.png` | Verdict — YES | Green card, high confidence |
| `04-verdict-no.png` | Verdict — NO | Red card with significators visible |
| `05-journal.png` | Journal | At least 2–3 entries, grouped by month |
| `06-settings.png` | Settings | Language toggle, usage counter visible |

## Device specs

Use iPhone 15 Pro (or similar flagship) at 3× for App Store-quality screenshots.
Resolution: 1179 × 2556 px.

For Android: Pixel 8 Pro at the same proportional size.

## How to capture

```bash
npx expo start --device
```

Use the device's native screenshot shortcut, then export to this directory.
