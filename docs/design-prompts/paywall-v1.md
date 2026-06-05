---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/monetization-spec.md, docs/design-system-brief.md, docs/html-prototype/HoraClaudeDesign.html, docs/aso-brief.md]
reviewed_by: owner-pending
stage: Phase3-Monetization-DesignPrep
date: 2026-06-04
---

# claude.ai Design Prompt — Paywall Screen (Phase 3 Monetization)

**Usage**: Copy the prompt below and paste it into claude.ai Design (or hand it to `horary-design-agent` when running `/orchestrate:design`).

---

## PROMPT (copy from here)

---

You are designing a new screen for the **Hora Horary Astrology** mobile app — a premium "Upgrade to Unlimited" paywall bottom sheet. This screen will be added to the existing interactive HTML prototype.

---

### 1. Context: Where This Screen Appears

When a user submits a horary question and the API returns HTTP 429 (monthly limit exceeded), the app shows a dismissible "coming soon" banner. **This paywall sheet replaces that "coming soon" CTA** — it slides up from the bottom when the user taps a new "Upgrade" button on the banner.

Trigger flow:
```
API returns 429
  → Home screen shows limit banner
  → Banner has "Upgrade" button (replaces current "×" dismiss)
  → Tapping "Upgrade" → Paywall sheet slides up from bottom
```

---

### 2. Design System — Cosmos Dark

Use ONLY these tokens. No new hex values.

**Backgrounds**:
- `--bg-base`: `#070714` (deepest layer, page background)
- `--bg-surface`: `#12102A` (cards, surfaces)
- `--bg-card`: `#1C1940` (elevated cards, rows)
- `--bg-overlay`: `rgba(7, 7, 20, 0.85)` (modal scrim)

**Accents**:
- `--accent-gold`: `#F5C842` (primary gold, CTAs, highlights)
- `--accent-gold-dim`: `rgba(245, 200, 66, 0.15)` (gold tint backgrounds)
- `--accent-violet`: `#8B5CF6` (secondary, feature callouts)

**Text**:
- `--text-primary`: `#E8E0F0`
- `--text-secondary`: `#9B8EB8`
- `--text-disabled`: `#4A4468`

**Verdict colors (for benefit icons)**:
- `--yes`: `#22D3A4` (green — "unlimited" benefit)

**Borders**: `--border`: `rgba(139, 92, 246, 0.15)`

**Radii**: `--radius-sm` 8px · `--radius-md` 12px · `--radius-lg` 16px · `--radius-xl` 24px · `--radius-full` 9999px

**Fonts**:
- `--font-display`: `'Cormorant Garamond'` — titles, verdict text
- `--font-body`: `'Inter'` — body, labels, CTAs

---

### 3. Screen: Paywall Bottom Sheet (`#screen-paywall`)

This is a **bottom sheet** that slides up over a darkened scrim. It should look like an iOS-style modal bottom sheet — rounded top corners, no close handle (user dismisses by tapping the × button).

**Sheet dimensions**: Full width, height ~75% of viewport. Fixed bottom sheet anchored to screen bottom.

**Scrim**: `--bg-overlay` behind the sheet.

---

#### Layout (top to bottom inside the sheet):

```
┌──────────────────────────────────────────────────────┐
│                      [ × close ]  ← top-right, 20px  │
│                                                       │
│            ✦  Hora  Unlimited                      │
│         Ask as much as the stars allow               │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  ✓  Unlimited questions every month           │   │
│  │  ✓  Full aspect perfections & timing data     │   │
│  │  ✓  Chart wheel visualization                 │   │
│  │  ✓  Deep AI narrative interpretation          │   │
│  │  ✓  Priority support                          │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │            $4.99 / month                       │   │
│  │        Cancel anytime · No commitment          │   │
│  └────────────────────────────────────────────────┘   │
│                                                       │
│  [ ✦  Upgrade to Unlimited  ]  ← primary gold CTA    │
│                                                       │
│  [ Restore Purchases ]   ← small text link            │
│                                                       │
│  Privacy · Terms · 3-day free trial included          │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

#### Element-by-element spec:

**Close button** (top-right, outside the content flow):
- `×` icon or `X` — 20px, `--text-secondary` color
- Positioned absolute top-right: `top: 16px; right: 20px`
- Annotation: `<!-- Phase 3: dismisses paywall, returns to home screen banner -->`

**Title row**:
- `✦` sparkle glyph — `--accent-gold`, 22px
- `"Hora Unlimited"` — `--font-display`, 28px, `--text-primary`, weight 600
- Both on the same line, centered
- Subtitle: `"Ask as much as the stars allow"` — `--font-body`, 15px, `--text-secondary`, centered, margin-top 6px

**Benefits list card**:
- Background: `--bg-card`, `border-radius: --radius-lg`, `border: 1px solid --border`
- Padding: 18px 20px
- Each row: `✓` checkmark in `--yes` (green) + benefit text in `--text-primary`, 15px Inter 400
- Rows separated by 14px vertical gap
- Benefits (exactly these 5, in this order):
  1. "Unlimited questions every month"
  2. "Full aspect perfections & timing data"
  3. "Chart wheel visualization"
  4. "Deep AI narrative interpretation"
  5. "Priority support"

**Pricing card**:
- Background: `--accent-gold-dim` (`rgba(245, 200, 66, 0.15)`), `border-radius: --radius-md`, `border: 1px solid --accent-gold` at 30% opacity
- Centered content:
  - Price: `"$4.99 / month"` — `--font-display`, 24px, `--accent-gold`, weight 600
  - Sub-label: `"Cancel anytime · No commitment"` — `--font-body`, 13px, `--text-secondary`

**Primary CTA button** `"Upgrade to Unlimited"`:
- Full width (minus 20px horizontal padding)
- Background: `--accent-gold`
- Text: `"✦  Upgrade to Unlimited"` — `--font-body`, 16px, `#070714` (dark text on gold), weight 600
- Height: 54px, `border-radius: --radius-full`
- Annotation: `<!-- Phase 3: triggers RevenueCat purchase flow for horary_unlimited_monthly -->`

**"Restore Purchases" link**:
- Centered text, `--font-body`, 14px, `--text-secondary`
- Annotation: `<!-- Phase 3: RevenueCat restorePurchases() -->`

**Legal footer**:
- Centered, 12px Inter, `--text-disabled`
- Text: `"Privacy Policy · Terms of Use · 3-day free trial, then $4.99/month"`

---

### 4. Modification: Home Screen Limit Banner (`#screen-home`)

Find the existing limit-reached banner in the Home screen prototype and update it:

**Current banner** (informational, dismissible):
> "You've used your 5 free questions this month. Unlimited access is coming soon."

**Updated banner** (two actions):
```
┌────────────────────────────────────────────────────┐
│  ⚠  Monthly limit reached                         │
│  You've used your 5 free questions this month.    │
│                                                    │
│  [ Upgrade to Unlimited ]   [ Not now ]           │
└────────────────────────────────────────────────────┘
```
- Banner background: `--bg-surface`, `border: 1px solid rgba(245,200,66,0.3)`, `border-radius: --radius-md`
- Header `"Monthly limit reached"`: 13px Inter 600, `--accent-gold`
- Body text: 13px Inter 400, `--text-secondary`
- `"Upgrade to Unlimited"` button: `.btn-primary` style (gold fill, dark text), 14px, height 36px
- `"Not now"` link: 13px, `--text-disabled`, dismisses banner
- Annotation: `<!-- Phase 3: "Upgrade" opens #screen-paywall sheet; "Not now" dismisses banner -->`

---

### 5. Navigation Wiring

Add the following navigation to the prototype's JS `onclick` handlers:

- Home screen "Upgrade to Unlimited" button → show `#screen-paywall` (slide-up animation or direct show)
- Paywall `×` close button → hide `#screen-paywall`, return to home
- Paywall "Upgrade to Unlimited" CTA → (prototype only) show a brief "Purchase simulated" toast then close

---

### 6. Theme Constraint Reminder

All elements use only the tokens listed in Section 2. No new hex values. No gradients except the CTA button which may use a subtle `linear-gradient(135deg, #F5C842, #D4A017)` for depth on the gold button.

---

### 7. Output

Produce a single modified `docs/html-prototype/index.html` that:
1. Contains the new `#screen-paywall` bottom sheet div
2. Contains the updated Home screen limit banner (two-action layout)
3. Contains the navigation wiring JS
4. Preserves all existing screens, CSS, and JS unchanged
5. All new elements are annotated with `<!-- Phase 3: -->`

Do NOT create a separate file. Output is a single modified `index.html`.

---

## END PROMPT

---

## Summary of What This Prompt Produces

| Element | Screen | Phase |
|---|---|---|
| Paywall bottom sheet | `#screen-paywall` (new) | 3 |
| "Upgrade" + "Not now" actions on limit banner | `#screen-home` (modified) | 3 |
| Navigation: banner → paywall → dismiss | JS wiring | 3 |

**Next step after design**: Add `#screen-paywall` screenshot to App Store screenshot set as Screenshot 5 (Settings screen showing the "Upgrade to Unlimited" flow), per `docs/aso-brief.md`.

---

*End of paywall-v1.md — Phase3-Monetization-DesignPrep, 2026-06-04*
