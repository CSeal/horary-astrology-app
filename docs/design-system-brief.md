---
created_by: claude-sonnet
updated_by: claude-sonnet
source_inputs: [prd-v1.md, mvp-scope.md, ux-flows.md, design-system-plan]
reviewed_by: owner-pending
---

# Design System Brief — AstraSk
## Horary Astrology Mobile App

*Document version: 1.0*
*Stage: Stage3-Design*
*Gate linkage: Gate 4 (UX Flows and Design Direction Approval)*

---

## 1. Design Philosophy

**"Cosmos Dark"** — celestial, premium, minimal.

Inspired by deep space photography and California product design (Linear, Vercel, Stripe). Dark by default. Every element should feel like it belongs in a planetarium app built by a team that cares deeply about craft.

### Core principles

**1. Verdict first.** The YES/NO answer is the largest, most visually dominant element on the screen. Every visual decision defers to it. Nothing competes with the verdict card.

**2. Celestial minimalism.** The dark space aesthetic is not decoration — it communicates that something real and precise is happening. Empty space is intentional. Star particles add atmosphere without clutter.

**3. Beginner confidence.** The UI must make a first-time user feel like the app is authoritative and trustworthy. This means Cormorant Garamond for mystical authority, Inter for clean modern legibility, and precise color semantics that require no explanation.

**4. California craft.** Micro-interactions matter. Button presses have tactile feedback. The loading animation feels intentional. Transitions are smooth. Nothing feels off-the-shelf.

**5. Single primary action per screen.** One gold button per screen. Supporting actions are secondary. The user always knows what to do next.

---

## 2. Color Palette

### Full Token Reference

```
Background tokens:
  --color-bg-base:         #070714    deep space black — app background
  --color-bg-surface:      #12102A    cosmos purple — card backgrounds, tab bar
  --color-bg-card:         #1C1940    elevated cards, input backgrounds
  --color-bg-overlay:      #0A091F    modal overlays, bottom sheets

Accent tokens:
  --color-accent-gold:     #F5C842    star gold — primary CTA, YES indicator glow
  --color-accent-violet:   #8B5CF6    planetary glow — loading animation, active states
  --color-accent-gold-dim: #7A6421    disabled gold states

Semantic — Verdict:
  --color-yes:             #22D3A4    teal green — YES verdict
  --color-yes-glow:        rgba(34,211,164,0.15)    YES card background glow
  --color-no:              #F87171    soft red — NO verdict
  --color-no-glow:         rgba(248,113,113,0.15)
  --color-maybe:           #FBBF24    amber — MAYBE verdict
  --color-maybe-glow:      rgba(251,191,36,0.15)
  --color-unclear:         #9B93B8    muted purple — UNCLEAR verdict
  --color-unclear-glow:    rgba(155,147,184,0.15)

Text tokens:
  --color-text-primary:    #F0EEFF    warm white — primary text
  --color-text-secondary:  #9B93B8    muted purple — subtitles, captions
  --color-text-disabled:   #4A4465    very muted — disabled states
  --color-text-inverse:    #070714    dark — text on gold buttons

Border tokens:
  --color-border:          rgba(240,238,255,0.08)    subtle dividers
  --color-border-focus:    rgba(245,200,66,0.4)      input focus ring
```

### Color Usage Rules

| Context | Token |
|---|---|
| App background | `--color-bg-base` |
| Cards, inputs | `--color-bg-card` |
| Tab bar, surfaces | `--color-bg-surface` |
| Primary CTA button | `--color-accent-gold` |
| Active tab icon | `--color-accent-gold` |
| Planet/orbit animations | `--color-accent-violet` |
| Primary body text | `--color-text-primary` |
| Labels, captions | `--color-text-secondary` |
| Placeholder text | `--color-text-disabled` |
| YES verdict | `--color-yes` with `--color-yes-glow` bg |
| NO verdict | `--color-no` with `--color-no-glow` bg |
| MAYBE verdict | `--color-maybe` with `--color-maybe-glow` bg |
| UNCLEAR verdict | `--color-unclear` with `--color-unclear-glow` bg |

---

## 3. Typography

### Font Families

```
Display:  "Cormorant Garamond"
          Weights: 400, 500, 700
          Used for: verdict text, app name, hero headings
          Tone: mystical, elegant, authoritative
          Source: Google Fonts

Body:     "Inter"
          Weights: 400, 500, 600
          Used for: all UI text, buttons, labels, body copy
          Tone: clean, legible, modern
          Source: Google Fonts

Mono:     "JetBrains Mono"
          Weight: 400
          Used for: coordinates (lat/lng), timestamps, API keys
          Tone: technical precision
          Source: Google Fonts
```

### Type Scale

| Token | Size | Family | Weight | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | Inter | 400 | Captions, timestamps |
| `--text-sm` | 13px | Inter | 400 | Secondary labels, muted text |
| `--text-base` | 15px | Inter | 400/500 | Body, list items |
| `--text-lg` | 17px | Inter | 500/600 | Section headers, button text |
| `--text-xl` | 22px | Inter | 600 | Screen titles |
| `--text-2xl` | 28px | Cormorant | 500 | Verdict text label |
| `--text-3xl` | 48px | Cormorant | 700 | YES / NO / MAYBE large display |
| `--text-hero` | 36px | Cormorant | 500 | App name in header |

### Line Heights

```
Body text:    1.6 (generous — aids readability in dark context)
Headings:     1.2 (tight — adds visual weight)
Captions:     1.4 (balanced for small sizes)
Verdict text: 1.0 (display-only, single line)
```

---

## 4. Spacing and Layout

```
Base unit: 4px
Scale:     4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

Container padding:  20px horizontal
Safe area:          Respect notch and home indicator via SafeAreaView
Screen max-width:   428px (iPhone Pro Max reference)
Content max-width:  388px (max-width minus container padding)
```

### Spacing Tokens

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon gaps, tight inline spacing |
| `--space-2` | 8px | Component internal padding |
| `--space-3` | 12px | List item gaps |
| `--space-4` | 16px | Standard section gap |
| `--space-5` | 20px | Container padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Verdict card padding |
| `--space-10` | 40px | Between major sections |
| `--space-12` | 48px | Screen vertical breathing |

---

## 5. Border Radius

```
--radius-sm:   8px      badges, small chips
--radius-md:   12px     buttons, inputs, standard cards
--radius-lg:   16px     cards
--radius-xl:   24px     verdict card
--radius-full: 9999px   pill buttons, avatar, verdict badge
```

---

## 6. Shadows and Elevation

```
--shadow-card:    0 2px 16px rgba(0,0,0,0.4)
                  Standard card elevation above background

--shadow-verdict: 0 0 40px [verdict-color-glow]
                  Color-matched glow around the verdict card
                  YES:     0 0 40px rgba(34,211,164,0.3)
                  NO:      0 0 40px rgba(248,113,113,0.3)
                  MAYBE:   0 0 40px rgba(251,191,36,0.3)
                  UNCLEAR: 0 0 40px rgba(155,147,184,0.2)

--shadow-button:  0 0 20px rgba(245,200,66,0.3)
                  Gold glow beneath the primary CTA
```

---

## 7. Component Specifications

---

### Button — Primary

```
Background:     #F5C842  (--color-accent-gold)
Text color:     #070714  (--color-text-inverse)
Font:           Inter 600, 17px
Border radius:  12px
Padding:        16px vertical, 24px horizontal
Min height:     56px
Width:          Full-width (stretch to container)
Shadow:         0 0 20px rgba(245,200,66,0.3)
Active state:   scale(0.97) + brightness(0.9), 100ms
Icon:           ✦ prefix optional (decorative, not accessible icon)
```

### Button — Secondary

```
Background:     transparent
Border:         1px solid rgba(245,200,66,0.4)
Text color:     #F5C842  (--color-accent-gold)
Font:           Inter 500, 15px
Border radius:  12px
Padding:        14px vertical, 24px horizontal
Active state:   opacity 0.7, 100ms
```

### Button — Destructive (text link)

```
Background:     none
Text color:     #F87171  (--color-no)
Font:           Inter 400, 13px
Underline:      none (tappable region must be min 44pt)
```

---

### TextInput

```
Background:     #1C1940  (--color-bg-card)
Border:         1px solid rgba(240,238,255,0.08)
Focus border:   1px solid rgba(245,200,66,0.4)
Text color:     #F0EEFF  (--color-text-primary)
Font:           Inter 400, 15px
Placeholder:    #4A4465  (--color-text-disabled)
Border radius:  12px
Padding:        16px
Min height:     48px
Multiline:      120px min (question input), grows to 180px max
Character counter: Inter 400, 11px, --color-text-secondary (right-aligned below input)
Counter at limit:  --color-no (#F87171)
```

---

### VerdictCard

```
Background:     verdict-glow color (rgba fill per verdict type)
Border:         1px solid verdict-color at 30% opacity
Border radius:  24px  (--radius-xl)
Padding:        32px  (--space-8)
Shadow:         0 0 40px verdict-color-glow (--shadow-verdict)

Verdict text:   Cormorant Garamond 700, 48px, verdict-color
Verdict label:  e.g. "YES ✦"
Confidence row: displayed below verdict text
  - Dot indicator: 5 dots (filled/empty), 10px diameter, 6px gap
  - HIGH = 5 filled, MEDIUM = 3 filled, LOW = 1–2 filled
  - Dot color: verdict-color for filled, --color-bg-card for empty
  - Confidence label: Inter 500, 13px, verdict-color
```

---

### SignificatorRow

```
Container:      background #1C1940, border-radius 12px, padding 12px 16px
Layout:         horizontal flex (symbol | name+role | sign+house | dignity badge)

Planet symbol:  24px, --color-accent-violet (#8B5CF6)
Planet name:    Inter 500, 15px, --color-text-primary
Role label:     Inter 400, 11px, --color-text-secondary, italic  (You / Your goal / The Moon)
Sign + House:   Inter 400, 13px, --color-text-secondary  (e.g. "Sagittarius · House 1")
Dignity badge:
  Domicile / Exaltation:   small pill, --color-accent-gold bg, --color-text-inverse text
  Detriment / Fall:        small pill, --color-no bg, white text
  Neutral / none:          no badge shown
Retrograde:     ℞ symbol appended to planet name, --color-no, Inter 400, 13px
```

---

### JournalItem

```
Container:      background #12102A, border-radius 12px, padding 16px
Border:         3px solid verdict-color on left edge (color-coded)
Layout:         vertical stack

Verdict badge:  pill shape, verdict-color background, --color-text-inverse text
                Inter 600, 11px, padding 4px 10px
Question text:  Inter 400, 15px, --color-text-primary, 2 lines max, ellipsis
Date:           Inter 400, 11px, --color-text-secondary
Confidence:     Inter 400, 11px, --color-text-secondary (e.g. "HIGH")
Gap:            8px between date and confidence (same row, space-between)
```

---

### Tab Bar

```
Background:     #12102A  (--color-bg-surface)
Border-top:     1px solid rgba(240,238,255,0.08)
Height:         83px (including home indicator area on iPhone)
Content height: 49px

Active icon:    --color-accent-gold (#F5C842)
Inactive icon:  --color-text-disabled (#4A4465)
Label font:     Inter 500, 11px
Active label:   --color-accent-gold
Inactive label: --color-text-disabled
Icon size:      24px
```

---

### Section Header (Settings / Significators)

```
Font:       Inter 600, 11px, letter-spacing 1.5px
Color:      --color-accent-gold (#F5C842)
Transform:  UPPERCASE
Margin:     16px top, 8px bottom
```

---

### Error / Info Banner

```
Background:     rgba(248,113,113,0.12) for errors
                rgba(251,191,36,0.12) for warnings
Border:         1px solid respective color at 30% opacity
Border radius:  12px
Padding:        12px 16px
Font:           Inter 400, 14px, --color-text-primary
Dismiss icon:   ×, --color-text-secondary, 20px
```

---

## 8. Motion and Animation

### Star Particles (CosmosBackground)

```
Count:          60 dots
Size:           1–3px diameter
Color:          white
Opacity range:  0.1–0.6 (random per particle)
Positions:      random distribution across full screen

Pulse animation:
  Property:     opacity
  Range:        particle_base_opacity * 0.3  →  particle_base_opacity
  Duration:     2–5s per particle (staggered, random)
  Easing:       ease-in-out
  Loop:         infinite, alternating

Drift animation:
  Property:     translateX + translateY
  Range:        ±3px from origin
  Duration:     8–15s per particle (staggered, random)
  Easing:       ease-in-out
  Loop:         infinite, alternating

Implementation note: Use CSS keyframes in prototype;
in React Native use Animated.loop() with Animated.sequence().
Avoid re-renders — particles are static elements, only opacity/transform animated.
```

### Loading Animation

```
Structure:      Central circle (Ascendant) + orbiting planet SVG
Orbit:          Planet rotates 360° around center on an elliptical path
Duration:       2s per revolution
Easing:         ease-in-out
Loop:           infinite

Secondary:      Trailing opacity fade on orbit path (last 120° fades to 0)
Pulsing ring:   Center circle pulses scale 0.9 → 1.1 over 1.5s, infinite

Progress bar:   Gold shimmer sweep (left to right)
  Duration:     1.5s
  Loop:         infinite
  Width:        60% of container, centered position shifts right
```

### Verdict Reveal

```
Card entrance:
  scale:        0.8 → 1.0
  opacity:      0 → 1
  duration:     400ms
  easing:       spring (tension 100, friction 14)

Glow reveal:
  box-shadow opacity: 0 → full
  duration:     600ms
  delay:        100ms after card entrance

Haptic:         medium impact on reveal (Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))
```

### Navigation Transitions

```
Push (new screen):  default Expo Router slide from right
Tab switch:         instant (no animation — standard mobile behavior)
Back:               slide out to right (default)
```

### Micro-Interactions

```
Button press:       scale(0.97), 100ms ease-out
Journal item tap:   opacity 0.7 during press, 150ms
Tab icon tap:       scale 1.0 → 1.15 → 1.0, 200ms total
Input focus:        border-color transition, 150ms ease
```

---

## 9. Iconography

```
Library:  lucide-react-native
Default size: 20px
Tab bar size: 24px
Color: context-dependent (see color tokens)
```

### Icon Map

| Purpose | Icon name | Context |
|---|---|---|
| Home / Ask tab | `Sparkles` | Tab bar, active = gold |
| Journal tab | `BookOpen` | Tab bar |
| Settings | `Settings` | Home screen header |
| Back | `ArrowLeft` | Verdict / Settings nav |
| Location | `MapPin` | Home screen location row |
| Language | `Globe` | Settings |
| API Key | `Key` | Settings |
| Edit | `Pencil` | Settings API key row |
| Delete | `Trash2` | Swipe-left reveal |
| Share | `Share2` | Verdict (Phase 2, disabled in MVP) |
| Success | `CheckCircle2` | Aspect confirmation row |
| Error | `AlertCircle` | Error banners |
| Info | `Info` | Tooltip triggers (VOC note, UNCLEAR) |
| Moon | `Moon` | Moon significator row |
| Star | `Star` | Journal entry icon |

---

## 10. Accessibility

```
Minimum text contrast ratio:  4.5:1 (WCAG AA)
Minimum tap target:           44 × 44pt (Apple HIG)
Dynamic Type:                 All text scales with iOS system font setting
Screen reader:                All interactive elements have accessibilityLabel props
Color + text:                 Verdict cards always show text labels, never color-only
Focus indicators:             --color-border-focus visible on all inputs
```

### Accessibility Labels (Key Elements)

```
Ask button:     "Ask the Stars. Submit your horary question."
Verdict card:   "[YES/NO/MAYBE/UNCLEAR] verdict. Confidence: [HIGH/MEDIUM/LOW]."
Journal entry:  "[verdict] verdict for question: [question text]. Date: [date]."
Tab bar items:  "Ask a question, tab" / "Journal, tab"
Back button:    "Go back"
Settings icon:  "Open settings"
```

---

## 11. Screen-by-Screen Design Notes

### Home (Ask)

- Star particles fill the background but must not compete visually with the input area
- Input area has a subtle inner glow: `box-shadow: inset 0 0 0 1px rgba(245,200,66,0.15)` on focus
- Location row uses MapPin icon (16px) + Inter 400, 14px for city name + 11px JetBrains Mono for coordinates
- "Questions this month: X / 5" counter is muted, bottom of content area, not in footer

### Loading

- Full-screen dark background, no tab bar
- Centered layout, vertically centered 40% from top (not exactly center — optical center)
- Question text shown in quotes below the animation (user's question, italic, muted)
- No back button — prevents partial state

### Verdict

- Question text displayed at top in italic, muted, truncated at 2 lines
- Verdict card is the visual anchor — everything else is secondary
- Significator section: collapsed by default, show "The Planets Say ▾" expand toggle
- Summary text: verbatim from API, 15px, 1.6 line height, max-width 100%
- Timestamp + location row: smallest text on screen, bottom of content

### Journal

- Month headers: uppercase, gold, letter-spaced — act as visual separators
- Entry cards: left border is the primary color signal for verdict type
- Swipe-to-delete: red "Delete" action revealed to the right of the sliding card
- Empty state: centered, with star decoration, single CTA button

### Settings

- All rows in bordered card containers (background: --color-bg-card)
- Section headers gold, uppercase, 11px — strong visual hierarchy
- Progress bar: gold fill on dark track, 8px height, border-radius full
- API key input: monospace (JetBrains Mono) for the masked dots and the key value

### Onboarding

- Full-screen, no tab bar
- Star particles at full density
- App name "AstraSk" in Cormorant Garamond 500, 48px, centered
- Step dots at bottom center: 8px circles, gold for active, muted for inactive

---

*Stage: Stage3-Design*
*Gate 4: UX flows and design direction — PASS*
