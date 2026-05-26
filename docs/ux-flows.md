---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [project-brief.md, competitor-research.md, kpi-and-economics.md, horary-domain-brief.md]
reviewed_by: owner-pending
---

# UX Flows and Wireframes — Horary Astrology Mobile App

---

## Design Principles

1. **Celestial minimalism**: Dark background, gold/amber accents, subtle star animations. Visual quality at or above Co-Star.
2. **Verdict first**: The YES/NO verdict is the largest element on the screen. Everything else is secondary.
3. **Beginner by default**: Technical horary terms are hidden by default or followed immediately by plain-language explanations.
4. **Single primary action per screen**: Each screen has one obvious thing to do next.
5. **English by default**: All UI copy in this document is English. Russian strings are externalized to `src/i18n/ru.ts`.

---

## Section 1: User Flow Diagrams

---

### Flow 1 — First Run (Onboarding)

```
App Launch (first time)
  │
  ▼
Onboarding Screen 1 — Welcome
  │  App name + tagline + "Get Started" button
  ▼
Onboarding Screen 2 — How It Works
  │  3-step illustration: Ask → Cast → Verdict
  ▼
Onboarding Screen 3 — Location Permission
  │  Explanation: "Your location at the moment of asking is part of the chart"
  │  → [Tap "Allow Location"]
  │       ├── [Granted]  → Onboarding Screen 4 — API Key (optional)
  │       └── [Denied]   → Onboarding Screen 4 — API Key (optional)
  │                            [Location error state shown on Home later]
  ▼
Onboarding Screen 4 — API Key (optional)
  │  "Do you have your own API key?"
  │       ├── [Skip]     → Home Screen
  │       └── [Enter]    → Text input → Save to SecureStore → Home Screen
  ▼
Home Screen
  (onboarding_complete flag set in AsyncStorage; onboarding never shown again)
```

---

### Flow 2 — Ask a Question (Happy Path)

```
Home Screen
  │  User types question (5–280 chars)
  │  Location displayed: "📍 London, United Kingdom"
  │  Counter displayed: "Questions this month: 2 / 5"
  │
  ▼
[Tap "Ask the Stars"]
  │
  ▼
Check monthly counter
  │
  ├── [count < 5]
  │     │
  │     ▼
  │   Loading Screen
  │     │  Animated celestial illustration
  │     │  "Casting your chart..."
  │     │  Minimum 1.5s display
  │     │
  │     ▼
  │   API Call: POST /horary/ask
  │     │
  │     ├── [Success: 200 OK]
  │     │     │
  │     │     ▼
  │     │   Verdict Screen
  │     │     │  YES/NO/MAYBE/UNCLEAR badge + confidence
  │     │     │  Significators section
  │     │     │  Plain-language summary
  │     │     │  [auto-save to journal]
  │     │     │
  │     │     └── [Tap "Ask Another"] → Home Screen
  │     │
  │     ├── [API Error: 4xx / 5xx]
  │     │     │
  │     │     ▼
  │     │   Home Screen + Error Banner
  │     │     "Something went wrong. Please try again."
  │     │
  │     └── [Timeout: >10s]
  │           │
  │           ▼
  │         Home Screen + Timeout Banner
  │           "The server took too long. Please try again."
  │
  └── [count >= 5]
        │
        ▼
      "Coming Soon" Banner on Home Screen
        "You've used your 5 free questions this month.
         Unlimited access is coming soon."
        [No paywall. No app lockout. Banner dismisses on tap.]
```

---

### Flow 3 — Review Journal

```
Tab Bar
  │
  ▼
[Tap Journal tab]
  │
  ▼
Journal Screen
  │  Entries grouped by month (MAY 2026, APRIL 2026, ...)
  │
  ├── [Tap entry card]
  │     │
  │     ▼
  │   Verdict Screen (read-only mode)
  │     │  Full saved verdict + summary + significators
  │     │  Timestamp + question displayed
  │     │
  │     └── [Tap back (←)] → Journal Screen
  │
  ├── [Swipe left on entry]
  │     │
  │     ▼
  │   Delete action revealed
  │     │
  │     └── [Tap "Delete"]
  │           │
  │           ▼
  │         Confirmation dialog
  │           "Delete this reading? This cannot be undone."
  │           ├── [Confirm] → Entry removed → Journal Screen (updated)
  │           └── [Cancel]  → Journal Screen (unchanged)
  │
  └── [Journal is empty]
        │
        ▼
      Empty State
        "No readings yet.
         Ask your first question to begin your journal."
         [Tap "Ask a Question"] → Home Screen
```

---

### Flow 4 — Change Settings

```
Tab Bar (or Settings icon in Home header)
  │
  ▼
Settings Screen
  │
  ├── [Language Picker: EN → RU]
  │     │
  │     ▼
  │   All visible UI strings update immediately (no restart)
  │   Language preference saved to AsyncStorage
  │
  ├── [API Key section → tap edit icon]
  │     │
  │     ▼
  │   Text input becomes active (key revealed or blank)
  │     │
  │     └── [Enter key + tap "Save"]
  │           │
  │           ▼
  │         Key saved to expo-secure-store
  │         Source indicator: "Using: personal key"
  │         Success toast: "API key saved"
  │
  └── [Remove key link (if personal key stored)]
        │
        ▼
      Confirmation prompt
        "Remove your personal API key? The app will use its default key."
        ├── [Confirm] → Key deleted from SecureStore → "Using: app default"
        └── [Cancel]  → No change
```

---

### Flow 5 — Error States

```
No Internet
  │
  └── Home Screen: persistent banner at top
        "No internet connection. Check your network and try again."

Location Permission Denied
  │
  └── Home Screen: informational message below question input
        "Location access is needed to cast your chart."
        [Tap "Open Settings"] → OS Settings app → user grants permission → returns to app

API Error During Chart Cast
  │
  └── Loading Screen → Home Screen with dismissable error banner
        "Something went wrong. Please try again."
        [Dismiss × ] → banner disappears

Monthly Limit Reached
  │
  └── Home Screen: non-blocking banner (not a modal, not a blocker)
        "You've used your 5 free questions this month.
         Unlimited access is coming soon."
        [Dismiss × ] → banner disappears
```

---

## Section 2: ASCII Wireframes

All copy is in English. Dimensions are illustrative (375px wide — iPhone SE/14 form factor).

---

```
═══════════════════════════════════════════════════════════════════
SCREEN 1: HOME (ASK)
═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐
  │  ✦ AstraSk              [⚙️]   │  ← Header: app name + settings icon
  │─────────────────────────────────│
  │                                 │
  │   ✦  ✦    ·  ✦   ·    ✦  ·    │
  │  ·    ✦     ·     ✦      ·     │  ← Animated star particle background
  │     ·    ✦    ·      ✦    ·    │    (subtle; does not distract from input)
  │                                 │
  │  Ask your question              │  ← Section label (semibold, white)
  │  Be sincere and specific        │  ← Subtitle (muted, 13pt)
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │ Will I get the job      │   │  ← TextInput
  │  │ offer this month?       │   │    multiline, min 5 / max 280 chars
  │  │                         │   │    background: dark navy
  │  │                         │   │    border: subtle gold when focused
  │  └─────────────────────────┘   │
  │                           47/280│  ← Character counter (right-aligned, muted)
  │                                 │
  │  📍 London, United Kingdom      │  ← City name (white, 14pt)
  │     51.5074° N, 0.1278° W      │  ← Coords (muted, 11pt)
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │    ✦  Ask the Stars     │   │  ← Primary CTA button
  │  └─────────────────────────┘   │    Background: gold (#C9A84C)
  │                                 │    Text: deep black
  │  Questions this month: 2 / 5   │  ← Counter (muted, 12pt, bottom of content)
  │                                 │
  └─────────────────────────────────┘
         [🏠 Home]  [📖 Journal]          ← Tab bar (2 tabs only)


  — ERROR VARIANT (no internet) ——
  ┌─────────────────────────────────┐
  │  ⚠ No internet connection.      │  ← Error banner: amber background,
  │    Check your network.    [×]   │    dismissable; top of content area
  └─────────────────────────────────┘

  — ERROR VARIANT (location denied) ——
  ┌─────────────────────────────────┐
  │  📍 Location unavailable        │  ← Below question input
  │  Tap here to open Settings  →  │    muted text, tappable link
  └─────────────────────────────────┘

  — LIMIT REACHED VARIANT (5/5) ——
  ┌─────────────────────────────────┐
  │  You've used your 5 free        │  ← Non-blocking banner, gold border
  │  questions this month.    [×]   │
  │  Unlimited access coming soon.  │
  └─────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
SCREEN 2: LOADING (CASTING CHART)
═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐
  │                                 │
  │  ✦  ·    ✦    ·   ✦    ·   ✦  │
  │ ·     ✦    ·    ✦    ·    ✦   │  ← Star particles (animated, slow drift)
  │   ✦    ·      ✦    ·    ✦     │
  │                                 │
  │                                 │
  │           ☽                    │  ← Moon symbol (top)
  │          /                      │
  │         ♃  →  →  →  ◯         │  ← Jupiter applying toward Ascendant circle
  │          \                      │    (Lottie or React Native Animated)
  │           ☉                    │  ← Sun (center reference)
  │                                 │
  │                                 │
  │   Casting your chart...         │  ← Primary label (white, 18pt, semibold)
  │   Reading the celestial map     │  ← Subtitle (muted, 13pt)
  │                                 │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━      │  ← Indeterminate progress bar
  │  ←━━━━ gold pulse animation ━━→ │    (gold shimmer sweep, left to right)
  │                                 │
  │  "Will I get the job offer      │  ← User's question (quoted, muted, 13pt)
  │   this month?"                  │    Reminds user what they asked
  │                                 │
  └─────────────────────────────────┘
  (No tab bar on Loading Screen — back navigation is not available
   during the API call to prevent partial state)


═══════════════════════════════════════════════════════════════════
SCREEN 3: VERDICT
═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐
  │  ←  Back                 [↗]   │  ← Nav bar: back to Home + Share (Phase 2;
  │─────────────────────────────────│    share icon visible but disabled in MVP)
  │                                 │
  │  "Will I get the job offer      │  ← Question text (italic, muted, 13pt)
  │   this month?"                  │    Truncated to 2 lines with "..." if long
  │                                 │
  │  ╔═══════════════════════════╗  │
  │  ║                           ║  │  ← Verdict card
  │  ║      ✦   YES   ✦          ║  │    YES  → emerald green glow, #1A4D2E bg
  │  ║                           ║  │    NO   → crimson, #4D1A1A bg
  │  ║  Confidence               ║  │    MAYBE → amber, #4D3A1A bg
  │  ║  ●  ●  ●  ○  ○    HIGH   ║  │    UNCLEAR → steel blue, #1A2A3A bg
  │  ║  (5 dots: 3 filled = HIGH)║  │
  │  ║                           ║  │
  │  ╚═══════════════════════════╝  │
  │                                 │
  │  The Planets Say:               │  ← Section header (12pt, uppercase, gold)
  │  ─────────────────────────────  │
  │                                 │
  │  ♃ Jupiter    Sagittarius  H1   │  ← Querent significator row
  │    You         Domicile    ✓    │    planet symbol + name / role / sign / house
  │                                 │    dignity badge (gold for Domicile/Exaltation,
  │  ☉ Sun         Aries       H10  │    muted for neutral, red for Detriment/Fall)
  │    Your goal   Exaltation  ✓    │
  │                                 │
  │  ☽ Moon       Cancer       H3   │  ← Moon row
  │    Not void-of-course      ✓    │
  │                                 │
  │  Aspect: Jupiter ▷ trine ▷ Sun  │  ← Key aspect (applying = ▷, separating = ◁)
  │          Applying · 4.2° orb    │    orb value
  │                                 │
  │  ─────────────────────────────  │
  │                                 │
  │  "The situation is moving in    │  ← Plain-language summary
  │   your favor. Jupiter, your     │    (API summary field verbatim)
  │   significator, applies by      │    font: 15pt, 1.6 line height
  │   trine to the Sun — a strong   │
  │   positive indicator of         │
  │   success."                     │
  │                                 │
  │  May 25, 2026 · 14:32           │  ← Timestamp (muted, 12pt)
  │  📍 London, United Kingdom      │  ← Location (muted, 12pt)
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │      Ask Another        │   │  ← Secondary CTA (gold outline button)
  │  └─────────────────────────┘   │    → navigates back to Home Screen
  │                                 │
  └─────────────────────────────────┘
         [🏠 Home]  [📖 Journal]


  — VARIANT: UNCLEAR VERDICT ————
  ┌─────────────────────────────────┐
  │  ╔═══════════════════════════╗  │
  │  ║    ~  Chart Unclear  ~    ║  │  ← Distinct label (not YES/NO/MAYBE)
  │  ║                           ║  │    steel blue background
  │  ║  The chart cannot be      ║  │
  │  ║  reliably judged at this  ║  │    [ℹ] tooltip icon → explains radicality
  │  ║  time.           [ℹ]     ║  │    in beginner-friendly terms
  │  ╚═══════════════════════════╝  │
  └─────────────────────────────────┘

  — VARIANT: VOID-OF-COURSE MOON ——
  ┌─────────────────────────────────┐
  │  ☽ Moon       Void-of-Course   │
  │    ⚠ The Moon has finished its │  ← VOC note row (amber warning color)
  │      work in this sign.   [ℹ]  │    [ℹ] tappable tooltip:
  │                                 │    "Often means 'nothing will come of
  │                                 │    the matter' — but other chart factors
  │                                 │    can override this."
  └─────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
SCREEN 4: JOURNAL
═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐
  │  Journal                        │  ← Screen title (large, white)
  │─────────────────────────────────│
  │                                 │
  │  MAY 2026                       │  ← Month group header
  │  ─────────────────────────────  │    (12pt, uppercase, muted gold)
  │                                 │
  │  ┌──────────────────────────┐  │
  │  │ ✦ YES              May 25│  │  ← Entry card
  │  │ Will I get the job offer │  │    ✦ = green for YES
  │  │ this month?              │  │    ✕ = red for NO
  │  │ Confidence: HIGH    [↗]  │  │    ? = amber for MAYBE
  │  └──────────────────────────┘  │    ~ = steel blue for UNCLEAR
  │                                 │    [↗] = tap to expand
  │  ┌──────────────────────────┐  │
  │  │ ✕ NO               May 22│  │  ← Red tint border for NO verdict
  │  │ Will she call me this    │  │
  │  │ week?                    │  │
  │  │ Confidence: MEDIUM  [↗]  │  │
  │  └──────────────────────────┘  │
  │                                 │
  │  ┌──────────────────────────┐  │
  │  │ ? UNCLEAR          May 20│  │  ← Muted border for UNCLEAR
  │  │ Is this the right        │  │
  │  │ investment decision?     │  │
  │  │ Confidence: LOW     [↗]  │  │
  │  └──────────────────────────┘  │
  │                                 │
  │  APRIL 2026                     │  ← Older month group
  │  ─────────────────────────────  │
  │  ┌──────────────────────────┐  │
  │  │ ✦ YES              Apr 30│  │
  │  │ Should I accept the      │  │
  │  │ offer from Berlin?       │  │
  │  │ Confidence: HIGH    [↗]  │  │
  │  └──────────────────────────┘  │
  │                                 │
  │  ← swipe left on any card to   │  ← Gesture hint (muted, 11pt, italic)
  │    reveal delete action         │
  │                                 │
  └─────────────────────────────────┘
         [🏠 Home]  [📖 Journal]


  — SWIPE-LEFT REVEALED STATE ————
  ┌──────────────────────────────────┐
  │ ✦ YES               May 25      │
  │ Will I get the job offer this   │  ← Card slid left
  │ month?                          │
  └────────────────────────┬────────┘
                           │  DELETE  │  ← Red delete action button
                           └──────────┘

  — EMPTY STATE ————————————————
  ┌─────────────────────────────────┐
  │  Journal                        │
  │─────────────────────────────────│
  │                                 │
  │         ✦  ·  ✦  ·  ✦          │
  │                                 │
  │    No readings yet.             │  ← Empty state label (centered)
  │    Ask your first question      │
  │    to begin your journal.       │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │    Ask a Question       │   │  ← CTA button → Home tab
  │  └─────────────────────────┘   │
  │                                 │
  └─────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
SCREEN 5: SETTINGS
═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐
  │  Settings                       │  ← Screen title
  │─────────────────────────────────│
  │                                 │
  │  LANGUAGE                       │  ← Section header (12pt, uppercase, muted gold)
  │  ─────────────────────────────  │
  │  ┌─────────────────────────┐   │
  │  │ Language        [EN ▾]  │   │  ← Picker row
  │  └─────────────────────────┘   │    Options: English / Русский
  │                                 │    Change takes effect immediately
  │  LOCATION                       │
  │  ─────────────────────────────  │
  │  ┌─────────────────────────┐   │
  │  │ Detected timezone        │   │  ← Read-only display row
  │  │ Europe/London     [ℹ]   │   │    [ℹ] tooltip: "Based on your device
  │  └─────────────────────────┘   │    location and system timezone setting"
  │                                 │
  │  USAGE                          │
  │  ─────────────────────────────  │
  │  ┌─────────────────────────┐   │
  │  │ Questions this month    │   │
  │  │ ████████████░░░░  4 / 5 │   │  ← Progress bar (gold fill)
  │  │ Resets June 1, 2026     │   │  ← Reset date
  │  └─────────────────────────┘   │
  │                                 │
  │  API KEY                        │
  │  ─────────────────────────────  │
  │  ┌─────────────────────────┐   │
  │  │ ●●●●●●●●●●●●●  [✎ Edit]│   │  ← Masked key display
  │  └─────────────────────────┘   │
  │  Using: personal key            │  ← Source indicator (muted, 12pt)
  │  Remove key                     │  ← Destructive link (only shown when
  │                                 │    personal key is stored)
  │  ABOUT                          │
  │  ─────────────────────────────  │
  │  ┌─────────────────────────┐   │
  │  │ Version          1.0.0  │   │
  │  └─────────────────────────┘   │
  │  ┌─────────────────────────┐   │
  │  │ Disclaimer           →  │   │  ← "For entertainment and reflection
  │  └─────────────────────────┘   │    purposes. Not a substitute for
  │                                 │    professional advice."
  └─────────────────────────────────┘
         [🏠 Home]  [📖 Journal]


═══════════════════════════════════════════════════════════════════
SCREEN 6: ONBOARDING (FIRST RUN)
═══════════════════════════════════════════════════════════════════

  — Step 1: Welcome ——————————————
  ┌─────────────────────────────────┐
  │                                 │
  │   ✦  ·    ✦    ·   ✦    ·     │
  │  ·     ✦    ·    ✦    ·    ✦  │  ← Full-screen star field
  │   ✦    ·      ✦    ·    ✦     │
  │                                 │
  │         ✦  AstraSk  ✦          │  ← App name (large, white, centered)
  │                                 │
  │   Ask a sincere question.       │  ← Tagline (muted, italic, centered)
  │   The sky will answer.          │
  │                                 │
  │                                 │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │      Get Started   →    │   │  ← Gold CTA button
  │  └─────────────────────────┘   │
  │                                 │
  │  ○ ● ○ ○   (page dots: 4 total)│  ← Step indicator
  └─────────────────────────────────┘

  — Step 2: How It Works —————————
  ┌─────────────────────────────────┐
  │                                 │
  │  How it works                   │  ← Screen title
  │                                 │
  │  ┌─────┐  ┌─────┐  ┌─────┐    │
  │  │  ?  │→ │  ✦  │→ │ YES │    │  ← 3 icons: Question → Stars → Verdict
  │  │ Ask │  │Cast │  │     │    │    (simple celestial icons)
  │  └─────┘  └─────┘  └─────┘    │
  │                                 │
  │  1. Ask a sincere question      │  ← Numbered descriptions (one per step)
  │     about a specific matter     │
  │                                 │
  │  2. The sky is cast for this    │
  │     exact moment                │
  │                                 │
  │  3. Traditional William Lilly   │
  │     technique delivers your     │
  │     verdict in plain English    │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │         Next   →        │   │
  │  └─────────────────────────┘   │
  │  ●  ○  ○  ○                    │
  └─────────────────────────────────┘

  — Step 3: Location Permission ——
  ┌─────────────────────────────────┐
  │                                 │
  │         📍                      │  ← Location pin icon (large, centered)
  │                                 │
  │  Your location matters          │  ← Section title
  │                                 │
  │  Horary astrology requires      │  ← Explanation (15pt, readable)
  │  the exact place of asking.     │
  │  Your location at this moment   │
  │  is part of the chart itself.   │
  │                                 │
  │  We never store or share your   │  ← Privacy note (muted, 13pt)
  │  location data.                 │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │   Allow Location   →    │   │  ← Triggers iOS/Android system dialog
  │  └─────────────────────────┘   │
  │  Skip (location unavailable)    │  ← Text link (muted, smaller)
  │                                 │
  │  ○  ●  ○  ○                    │
  └─────────────────────────────────┘

  — Step 4: API Key (Optional) ———
  ┌─────────────────────────────────┐
  │                                 │
  │  Do you have your own           │  ← Title
  │  API key?                       │
  │                                 │
  │  If you have an astrology-      │  ← Explanation (muted, 13pt)
  │  api.io key, enter it here.     │
  │  Otherwise, the app provides    │
  │  its own — no key needed.       │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │ Enter API key...        │   │  ← TextInput (masked by default)
  │  └─────────────────────────┘   │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │      Start Asking  →    │   │  ← Gold CTA (skips or saves key + proceeds)
  │  └─────────────────────────┘   │
  │  Skip                           │  ← Text link
  │                                 │
  │  ○  ○  ●  ○                    │
  └─────────────────────────────────┘
```

---

## Section 3: Navigation Architecture

```
App Root (Expo Router)
  │
  ├── /onboarding         (shown once; full-screen, no tab bar)
  │     ├── /onboarding/welcome
  │     ├── /onboarding/how-it-works
  │     ├── /onboarding/location
  │     └── /onboarding/api-key
  │
  └── /(tabs)             (tab bar visible after onboarding)
        ├── /index         → Home Screen (Ask)
        ├── /journal        → Journal Screen
        └── /journal/[id]   → Verdict Screen (read-only, from journal)
        └── /verdict        → Verdict Screen (live, after API call)
        └── /settings       → Settings Screen (accessible via header icon)
```

---

## Section 4: Color Tokens (Design System Reference)

| Token | Hex | Usage |
|---|---|---|
| `color-bg-base` | `#0A0D14` | App background (deep navy-black) |
| `color-bg-card` | `#111827` | Card backgrounds |
| `color-bg-card-hover` | `#1F2937` | Card pressed state |
| `color-gold-primary` | `#C9A84C` | CTA buttons, section headers, accents |
| `color-gold-muted` | `#8B7028` | Muted gold accents |
| `color-verdict-yes` | `#1A4D2E` | YES verdict card background |
| `color-verdict-yes-glow` | `#22C55E` | YES glow / text |
| `color-verdict-no` | `#4D1A1A` | NO verdict card background |
| `color-verdict-no-glow` | `#EF4444` | NO glow / text |
| `color-verdict-maybe` | `#4D3A1A` | MAYBE verdict card background |
| `color-verdict-maybe-glow` | `#F59E0B` | MAYBE glow / text |
| `color-verdict-unclear` | `#1A2A3A` | UNCLEAR verdict card background |
| `color-verdict-unclear-glow` | `#94A3B8` | UNCLEAR glow / text |
| `color-text-primary` | `#F9FAFB` | Primary text (white) |
| `color-text-muted` | `#6B7280` | Muted/secondary text |
| `color-error` | `#EF4444` | Error states, NO verdict |
| `color-warning` | `#F59E0B` | VOC warning, MAYBE verdict |

---

*Document version: 1.0*
*Stage: Stage2-PRD*
*Gate linkage: Gate 4 (UX Flows and Design Direction Approval)*
