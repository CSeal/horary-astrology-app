---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/html-prototype/AstraSkClaudeDesign.html, docs/html-prototype/index.html, docs/growth-features-spec.md, docs/viral-features-spec.md, docs/api-gap-spec.md, docs/mvp-scope.md, docs/aso-brief.md, docs/design-system-brief.md]
reviewed_by: owner-pending
stage: StageM4-DocRefresh
date: 2026-06-04
---

# Design Prompt — Prototype Update v2 (horary-design-agent)

**This document is addressed to `horary-design-agent`.**
It contains a complete brief for updating the AstraSk interactive HTML prototype to reflect Phase 1.5 features (FR-G01 through FR-G07 from prd-v1.md) and Phase 2 non-monetization features that should be prototyped now for App Store screenshot readiness.

---

## Step 0 — Read Before Writing Any HTML

Before producing any output, the design agent MUST read the following files in this order:

1. `docs/html-prototype/AstraSkClaudeDesign.html` — the standalone reference design (primary visual source)
2. `docs/html-prototype/index.html` — the interactive prototype (file to update)
3. `docs/design-system-brief.md` — design tokens (colors, typography, spacing)
4. `docs/growth-features-spec.md` — Phase 1.5 feature list and rationale
5. `docs/api-gap-spec.md` — API field specs for new data sections
6. `docs/aso-brief.md` — screenshots brief, competitor feature gaps, visual direction
7. `docs/mvp-scope.md` — Phase 2 non-monetization features to prototype

The instruction to fetch and implement: **"Fetch this design file, read its readme, and implement the relevant aspects of the design: AstraSk - Standalone.html (reference: docs/html-prototype/AstraSkClaudeDesign.html)"**

---

## Step 1 — Identify Existing Screens

Read `docs/html-prototype/index.html` and produce a list of every `#screen-*` div found. The current prototype contains six screens:

| Screen ID | Screen Name | Status |
|---|---|---|
| `#screen-onboarding` | Onboarding (Welcome step) | Exists |
| `#screen-home` | Home (AskForm) | Exists |
| `#screen-loading` | Loading (orbit animation) | Exists |
| `#screen-verdict` | Verdict (result screen) | Exists |
| `#screen-journal` | Journal | Exists |
| `#screen-settings` | Settings | Exists |

---

## Step 2 — Screens to Modify (Phase 1.5 — implement soon)

All modifications must use only the existing Cosmos Dark design tokens from `docs/design-system-brief.md`. No new colors. No new fonts.

### 2A — Verdict Screen (`#screen-verdict`) — 5 modifications

The verdict screen requires the most changes. Apply all five modifications to the same screen.

#### 2A-1: Share Button in Nav Bar

**Where**: Top-right of the nav header row, alongside the existing back arrow.

**What**: Add a share icon button (`Share2` icon or an upload-arrow SVG, 20×20px, stroke-only). Use the `.nav-icon-btn` class already present in the prototype stylesheet. Color: `--text-secondary` at rest, `--text-primary` on hover.

**Behavior annotation** (comment in HTML): `<!-- Phase 1.5: triggers shareVerdictService.shareVerdict() — Instagram Stories or system share sheet -->`

**Visual**: The button sits on the right end of the nav header. The back arrow remains on the left. This matches the Share2 placeholder referenced in the design system brief.

---

#### 2A-2: Aspect Perfections Section

**Where**: Between the significators list and the summary section ("The Planets Say").

**What**: A new section showing the top-3 applying aspects between planets.

**Section header**: styled identically to the "THE PLANETS SAY" section label — uppercase, letter-spacing, `--accent-gold`, 11px Inter 600.

**Section title text**: "APPLYING ASPECTS"

**Row layout** (one row per aspect):
```
┌────────────────────────────────────────────┐
│  ☿ Mercury  △  ♀ Venus   2.3°  [applying] │
└────────────────────────────────────────────┘
```
- Left: planet1 glyph (Unicode) + planet1 name
- Center: aspect symbol (☌ ☍ △ □ ⚹) + orb degrees
- Right: planet2 glyph + planet2 name
- Far right: "applying" badge chip when applying

**Badge style**: Small pill chip. Background `rgba(34,211,164,0.12)`, text `--yes`, 11px Inter 600, `border-radius: 9999px`, padding `3px 8px`. (Same pattern as existing `.aspect-badge` class in the verdict screen styles.)

**Card background**: `--bg-card`, `border-radius: --radius-md`, `border: 1px solid --border`, padding `12px 14px`. Same as `.sig-row` in the prototype.

**"Show all" row**: If more than 3 aspects exist, show a collapsed state with a "Show all 7 aspects ›" text link at the bottom of the section. Color: `--accent-gold`, 13px Inter 500, cursor pointer.

**Prototype note**: Show 3 sample aspect rows with realistic planetary data (e.g., Sun △ Jupiter, Moon ☌ Venus applying, Mercury ⚹ Saturn).

---

#### 2A-3: Timing Indication Section

**Where**: Below aspect perfections, above the "The Planets Say" summary.

**What**: A "TIMING INDICATION" section showing when the event may occur.

**Section header**: Same style as other section labels.

**Row layout** (one row per timing item):
```
┌──────────────────────────────────────────────────┐
│  3 months   [high]                               │
│  Mercury perfects trine in Gemini                │
└──────────────────────────────────────────────────┘
```
- Top line: value + unit (large, `--text-primary`, 15px Inter 500) + confidence chip
- Bottom line: explanation text (`--text-secondary`, 13px Inter 400)

**Confidence chip colors**:
- `very_high` / `high`: background `rgba(245,200,66,0.15)`, text `--accent-gold`
- `medium`: background `rgba(251,191,36,0.15)`, text `--maybe`
- `low` / `very_low`: background transparent, text `--text-secondary`

**Card**: `--bg-card`, `border-radius: --radius-md`, `border: 1px solid --border`, padding `14px`.

**Prototype note**: Show 1 timing row with sample data: "3 months — Mercury perfects applying trine in Gemini — HIGH confidence".

---

#### 2A-4: Radicality Score Bar ("Chart Strength")

**Where**: Above or replacing the current boolean "Radical" banner. Placed just below the verdict card, before the significators section.

**What**: A horizontal mini progress bar labeled "Chart Strength" with a numeric score.

**Layout**:
```
Chart Strength                                   74 / 100
█████████████████████░░░░░                        [RADICAL]
```

- Label: "Chart Strength" — 11px Inter 600, uppercase, `--text-secondary`
- Score: "74 / 100" — 11px Inter 500, `--text-secondary`, right-aligned
- Bar track: full width, 4px height, `--bg-card`, `border-radius: 9999px`
- Bar fill: percentage of score. Color by score:
  - ≥ 70: gradient left `--accent-gold` to right `#c49b1e`
  - 50–69: `--maybe`
  - < 50: `--no`
- Below bar: radicality flags as small chips. Chip style: `--bg-surface`, `border-radius: 9999px`, padding `2px 8px`, 11px Inter 400, `--text-secondary`. Example flags: "Early Ascendant", "Moon VOC".

**Prototype note**: Show score 74, filled bar approximately 74% wide in gold, no flags (empty flags array).

---

#### 2A-5: Radicality Flags Chips

Included in 2A-4 above. The flags row sits directly below the score bar, wrapping as needed. When the flags array is empty (as in 2A-4 prototype), the chips row is hidden.

---

### 2B — Settings Screen (`#screen-settings`) — 1 modification

#### 2B-1: "Share & Invite" Section

**Where**: New settings section, placed above the existing API KEY section and below the USAGE section.

**What**: A new `.settings-section` block:

```
── SHARE & INVITE ──────────────────────────────
  [share icon]  Invite a friend            [›]
  [star icon]   Rate AstraSk              [›]
```

- Section label: "SHARE & INVITE" — same `.section-label` style (11px Inter 600, uppercase, `--accent-gold`)
- Each row uses the existing `.settings-row` + `.settings-card` pattern
- Left: icon (20×20, `--text-secondary`) + label text (15px Inter 400, `--text-primary`)
- Right: chevron-right icon (14px, `--text-disabled`)

**"Invite a friend"** row: Uses a share/upload icon SVG.
**"Rate AstraSk"** row: Uses a star outline SVG.

**Behavior annotation**:
```html
<!-- Phase 1.5: "Invite a friend" → Share.share() with UTM-tagged App Store link -->
<!-- Phase 1.5: "Rate AstraSk" → deep link to App Store page (not requestReview()) -->
```

---

### 2C — "THE PLANETS SAY" Toggle

The prototype already has a `.significators-toggle` element with a `.toggle-arrow`. Verify it is present in `#screen-verdict` and that it is visually connected to the significators list.

**If the toggle is present and functional**: no change needed. Add a comment: `<!-- GAP-8: collapsible toggle already designed — implement per api-gap-spec.md GAP-8 -->`

**If the toggle is missing or disconnected**: Add the toggle row as a `Pressable`-style div above the significators list with a chevron icon that rotates 180° on tap. The toggle controls visibility of `.sig-list`.

---

### 2D — Review Prompt: Annotation Only

The review prompt is an OS-native dialog — it has no custom UI. Add a comment annotation only, inside the `#screen-verdict` screen near the verdict card:

```html
<!-- Phase 1.5: reviewPromptService.maybePrompt() fires 2s after verdict display
     Conditions: YES or MAYBE verdict, 3+ readings, 7+ days since install,
     180+ days since last prompt. Uses expo-store-review (OS native).
     No custom modal in this screen. -->
```

---

## Step 3 — New Screens (Phase 2 non-monetization — prototype now, implement later)

These screens are prototyped now so that:
1. App Store screenshots can show them (drives conversion even before implementation)
2. Design is locked before engineering starts

Each new screen must be added as a new `<div class="screen" id="screen-...">` and linked from the existing navigation controls.

---

### 3A — Chart Wheel Screen (`#screen-chart-wheel`) — Phase 2

**Navigation**: Accessible from the verdict screen. Add a "View Chart Wheel" secondary button below the verdict card in `#screen-verdict`. Button style: `.btn-secondary`.

**Note in verdict screen**: `<!-- Phase 2: Chart Wheel screen (SVG stub exists in src/components/svg/ChartWheel.tsx) -->`

**Screen layout**:
```
┌─────────────────────────────────────────────┐
│  ← Back              Chart Wheel            │
│─────────────────────────────────────────────│
│                                             │
│         ┌────────────────────┐              │
│         │                    │              │
│         │  [Circular SVG     │              │
│         │   zodiac wheel     │              │
│         │   with 12 houses,  │              │
│         │   planet glyphs    │              │
│         │   at positions]    │              │
│         │                    │              │
│         └────────────────────┘              │
│                                             │
│   "Chart wheel — full implementation        │
│    in Phase 2"                              │
│                                             │
│   [Planet legend rows below]                │
│                                             │
└─────────────────────────────────────────────┘
```

**Wheel design**:
- Outer circle: zodiac ring with 12 signs, thin `--border` stroke
- Inner circle: house divisions (12 sectors), radial lines from center
- Planet glyphs placed on the wheel at approximate positions for the sample chart
- Use `--accent-violet` for planet glyph color, `--text-secondary` for house numbers
- Use `--accent-gold` for the ascendant line (house cusp 1)
- Label at center: "Phase 2" in 12px `--text-disabled`

**Prototype note**: Use the existing `ChartWheel` SVG stub patterns (outer/inner circles, 12 radial dividers). Show 7 classical planets at approximate positions using Unicode glyphs (☉☽☿♀♂♃♄).

---

### 3B — Full Aspects Table Screen (`#screen-aspects-table`) — Phase 2

**Navigation**: Accessible from the verdict screen "Show all aspects" expand control or a dedicated "Full Aspects Table" row below the aspects section.

**Screen layout**:
```
┌─────────────────────────────────────────────┐
│  ← Verdict          Aspects Table           │
│─────────────────────────────────────────────│
│                                             │
│   ── APPLYING ASPECTS ──────────────────    │
│   ☿ Mercury  △  ♃ Jupiter   1.8°  apply    │
│   ☽ Moon     ☌  ♀ Venus     2.3°  apply    │
│   ☉ Sun      ⚹  ♄ Saturn    3.1°  apply    │
│                                             │
│   ── SEPARATING ASPECTS ─────────────────   │
│   ♂ Mars     □  ♃ Jupiter   4.2°  sep      │
│   ☿ Mercury  ☍  ♄ Saturn    5.6°  sep      │
│                                             │
│   ── NO ASPECT ──────────────────────────   │
│   ☉ Sun — ♂ Mars  (out of orb)             │
│                                             │
└─────────────────────────────────────────────┘
```

**Row style**: Same `.aspect-row` pattern from the existing verdict screen. Applying rows have the green `.aspect-badge`, separating rows have a muted `--text-secondary` badge.

---

### 3C — Technical Breakdown Screen (`#screen-technical`) — Phase 2

**Navigation**: Accessible from the verdict screen via a "Technical Details" secondary link near the significators section.

**Screen layout**:
```
┌─────────────────────────────────────────────┐
│  ← Verdict       Technical Breakdown        │
│─────────────────────────────────────────────│
│                                             │
│   ── DIGNITY TABLE ──────────────────────   │
│   ☿ Mercury  Gemini  Domicile  score: +5   │
│   ♀ Venus    Taurus  Exaltation score: +8  │
│   ☽ Moon     Cancer  Domicile  score: +5   │
│                                             │
│   ── HOUSE POSITIONS ─────────────────────  │
│   ☉ Sun      → House 10  (Midheaven)       │
│   ☽ Moon     → House 7                     │
│   ☿ Mercury  → House 10                    │
│   ♀ Venus    → House 9                     │
│                                             │
│   ── CHART DATA ──────────────────────────  │
│   Ascendant: Virgo 14°                      │
│   MC: Gemini 10°                            │
│                                             │
└─────────────────────────────────────────────┘
```

**Table row style**: `--bg-card` card, three columns: planet glyph+name / sign+dignity / score. Uses same `.sig-row` base pattern. Dignity text colored: `--yes` for Domicile/Exaltation, `--no` for Detriment/Fall, `--text-secondary` for Peregrine.

---

### 3D — Deep Reading Mode (AI Narrative section on Verdict Screen) — Phase 2

This is not a separate screen. It is an additional collapsible section on `#screen-verdict`.

**Where**: Between the summary section and the timing section.

**Trigger annotation**: Shown only when `/ask` endpoint is used (10 credits). In Phase 2, this will be unlockable. Do not show a paywall — show a grayed "locked" state with a lock icon.

**Design: locked state** (Phase 2 prototype):
```
┌──────────────────────────────────────────────────┐
│  🔒  AI DEEP READING                    [Phase 2] │
│  Get the full AI narrative interpretation         │
│  [Unlock Deep Reading — 10 credits]               │
└──────────────────────────────────────────────────┘
```
- Background: `--bg-card` with `opacity: 0.6`
- Lock icon: 16px, `--text-disabled`
- Label: "AI DEEP READING" — section-label style
- Phase 2 badge: small chip, `--bg-surface`, `--text-disabled`, 10px
- Body text: 13px `--text-secondary`
- CTA button: `.btn-secondary` style (gold outline), label "Unlock Deep Reading — 10 credits"
- Button annotation: `<!-- Phase 2: triggers /ask endpoint (10 credits) -->`

**Design: unlocked state** (shown when `ai_summary` is present — add as a second prototype state or comment):
```
┌──────────────────────────────────────────────────┐
│  ✦  AI DEEP READING                              │
│  [Full AI narrative paragraph, 4-6 sentences]    │
│  [styled in --accent-violet heading]              │
└──────────────────────────────────────────────────┘
```
- Section header in `--accent-violet` (per api-gap-spec.md GAP-2)

---

## Step 4 — Market Research Additions (from ASO Competitor Screenshot Mining)

Source: `docs/aso-brief.md` Section 4 "Screenshots Brief" + Section 5 "What Competitors Do Badly, We Do Better".

Add these elements based on competitor feature gaps that appear in competitor screenshots 1–3 and are not yet in the prototype:

### 4A — Journal: Outcome Tags (Phase 2)

**Competitor evidence**: Horary Astrology Pro (Android) shows outcome tracking ("came true" / "didn't happen") in journal entries. This appears in their first two App Store screenshots.

**What to add**: On each journal entry card in `#screen-journal`, add an outcome tag area in the bottom-right corner:
- "Came true ✓" in `--yes` style
- "Didn't happen ✕" in `--no` style
- "Pending..." in `--text-disabled` style (default)

Add as a Phase 2 visual prototype: show 1 entry with "Came true ✓", 1 with "Pending...", 1 with "Didn't happen ✕". Add annotation: `<!-- Phase 2: outcome tracking — marks T3-03 in growth-features-spec.md -->`

### 4B — Home Screen: "Last Question" Quick-Resume (Phase 2)

**Competitor evidence**: Co-Star screenshot 2 shows a "recent reading" quick-access card on the home screen. TimePassages shows "last chart" in their second screenshot.

**What to add**: On `#screen-home`, below the question input, add a small "Continue last reading" link that appears when the journal has at least one entry:

```
┌──────────────────────────────────────────────────┐
│  Last: "Will I get the job offer?"  · 2 days ago │
│                                            View → │
└──────────────────────────────────────────────────┘
```

Style: `--bg-card` card, `border-radius: --radius-md`, 13px Inter, `--text-secondary` for label, `--text-primary` for question excerpt, `--accent-gold` for "View →".

Add annotation: `<!-- Phase 2: quick-resume last reading from home screen -->`

### 4C — Verdict Screen: Confidence Explanation Tooltip (Phase 1.5)

**Competitor evidence**: Nebula and TimePassages both show a "What does this mean?" info icon next to their confidence/accuracy indicators in screenshot 2. This is a high-conversion element for beginners.

**What to add**: Next to the confidence dots row on the verdict card, add a small `ⓘ` info icon (14px, `--text-secondary`). On tap, it shows a tooltip overlay:

```
"HIGH confidence means the planetary aspects are clear and unambiguous.
LOW confidence means the chart shows mixed testimonies."
```

Tooltip style: `--bg-overlay` background, `--text-primary` text, `border: 1px solid --border`, `border-radius: --radius-md`, 13px Inter 400. Arrow pointing to the info icon.

Add annotation: `<!-- Phase 1.5: confidence tooltip — beginner education, no i18n key yet, add verdict.confidenceTooltip -->`

---

## Step 5 — Theme Constraint

All new elements MUST use only these tokens. No new hex values are permitted:

**Backgrounds**: `--bg-base`, `--bg-surface`, `--bg-card`, `--bg-overlay`
**Accents**: `--accent-gold`, `--accent-violet`, `--accent-gold-dim`
**Verdict**: `--yes`/`--yes-glow`, `--no`/`--no-glow`, `--maybe`/`--maybe-glow`, `--unclear`/`--unclear-glow`
**Text**: `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-inverse`
**Borders**: `--border`, `--border-focus`
**Radii**: `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-full` (9999px)
**Fonts**: `--font-display` (Cormorant Garamond), `--font-body` (Inter), `--font-mono` (JetBrains Mono)

---

## Step 6 — Navigation Links

After adding all new screens, update the `onclick` navigation handlers in the prototype so that:

- Verdict screen → Chart Wheel: "View Chart Wheel" button navigates to `#screen-chart-wheel`
- Verdict screen → Aspects Table: "Show all aspects" or "Full Aspects Table" link navigates to `#screen-aspects-table`
- Verdict screen → Technical Breakdown: "Technical Details" link navigates to `#screen-technical`
- Chart Wheel / Aspects / Technical screens → back button returns to `#screen-verdict`
- Navigation screen selector (if present in the prototype) is updated with new screen options

---

## Step 7 — Output

The design agent MUST output a single updated `docs/html-prototype/index.html` file that:

1. Contains all 6 existing screens with the Phase 1.5 modifications applied (2A–2D)
2. Contains the 3 new Phase 2 screens (3A–3C) as additional `<div class="screen">` blocks
3. Contains the Deep Reading section added to the verdict screen (3D)
4. Contains the market-research additions (4A–4C)
5. Preserves all existing CSS custom properties, animations, and navigation JS unchanged
6. Passes basic HTML validation (no unclosed tags, no missing `id` attributes)
7. All new elements are annotated with their phase label: `<!-- Phase 1.5: -->` or `<!-- Phase 2: -->`

**Do NOT create a separate file.** The output is a single modified `docs/html-prototype/index.html` that the existing development workflow can diff and review.

---

## Quick Reference: Phase Summary

| Screen / Element | Phase | Priority |
|---|---|---|
| Share button in Verdict nav bar | 1.5 | SHIP before launch |
| Aspect perfections section | 1.5 | SHIP before launch |
| Timing indication section | 1.5 | SHIP before launch |
| Radicality score bar + flags | 1.5 | SHIP before launch |
| "Share & Invite" in Settings | 1.5 | SHIP before launch |
| Collapsible "THE PLANETS SAY" toggle | 1.5 | SHIP before launch |
| Confidence tooltip (ⓘ icon) | 1.5 | SHIP before launch |
| Review prompt annotation | 1.5 | Annotation only |
| Chart Wheel screen | 2 | Prototype now |
| Full Aspects Table screen | 2 | Prototype now |
| Technical Breakdown screen | 2 | Prototype now |
| Deep Reading (locked state) | 2 | Prototype now |
| Journal outcome tags | 2 | Prototype now |
| Home quick-resume last reading | 2 | Prototype now |

---

*End of prototype-update-v2.md — StageM4-DocRefresh, 2026-06-04*
