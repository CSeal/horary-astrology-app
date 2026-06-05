---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [docs/api-gap-spec.md, docs/design-system-brief.md, docs/mvp-scope.md, docs/html-prototype/HoraClaudeDesign.html]
reviewed_by: owner-pending
stage: Phase1.5-DesignExploration
date: 2026-06-04
---

# claude.ai Design Prompt — Verdict Screen Layout (Phase 1.5 Data Density)

**Usage**: Copy the prompt below and paste it into claude.ai Design (Projects → Design).
After choosing a layout, come back and say which option you prefer — then `prototype-update-v3.md` will be written for `horary-design-agent`.

---

## PROMPT (copy from here)

---

You are redesigning the **Verdict screen** of the **Hora Horary Astrology** mobile app.

---

### 1. The Problem

After Phase 1.5, the Verdict screen will display **7–8 data blocks** that don't all fit in a comfortable scroll without feeling overwhelming:

| # | Block | Size |
|---|---|---|
| 1 | Verdict badge (YES/NO/MAYBE/UNCLEAR) + confidence band | Small |
| 2 | Radicality score bar (0–100, "Chart Strength") | Small |
| 3 | VOC Moon banner + lunar details (sign, degrees to change, exception) | Medium |
| 4 | Low-confidence banner (conditional) | Small |
| 5 | AI plain-language summary (2–4 sentences) | Medium |
| 6 | Significators (querent, quesited, Moon — sign/house/dignity/retrograde) | Medium |
| 7 | Aspect perfections (top-3 applying aspects inline + "Show all" toggle) | Medium |
| 8 | Timing indication ("When might this happen?") | Medium–Large |

The current screen is a single scroll. With all 8 blocks, it becomes too long and users miss the timing and aspects sections.

---

### 2. Design Tokens (MUST match exactly)

```
Background:     #070714  (deep space navy)
Surface card:   #0E0E1F  (slightly lighter navy)
Border:         #1E1E35
Gold accent:    #F5C842  (verdict YES, headings, icons)
Yes green:      #22D3A4
No red:         #F87171
Maybe amber:    #FCD34D
Unclear grey:   #94A3B8
Text primary:   #E8E8F0
Text secondary: #6B6B8A
Text disabled:  #3A3A5C

Typography:
  Headers:  Cormorant Garamond (serif, elegant)
  Body:     Inter (sans-serif, readable)
```

---

### 3. What to Design

Show **3 layout options** for the Verdict screen. Each option must show:
- Mobile frame (iPhone 14 Pro proportions, 390×844pt)
- Dark cosmic background
- All 8 data blocks placed somewhere
- The "Share" button (top-right nav bar icon)
- The "Back to journal" footer link

**Option A — Tabbed layout**
Verdict + Radicality + Summary stay at the top (always visible).
Below: 2 tabs — "Chart" (Significators + Aspects) and "Timing".
Tabs use gold underline indicator. Each tab scrolls independently.

**Option B — Accordion / collapsible sections**
All 8 blocks on one scroll. Significators, Aspects, and Timing are collapsible sections.
They start collapsed with a one-line preview. User taps to expand.
The top 5 blocks (verdict, radicality, VOC, confidence, summary) are always expanded.

**Option C — Two-screen flow (Verdict → Detail)**
Screen 1 (Verdict): Verdict badge + radicality bar + VOC banner + summary + "See full reading →" CTA at bottom.
Screen 2 (Full Reading): Significators + Aspects + Timing in a comfortable scroll.
The "See full reading" screen is pushed onto the navigation stack (back button in top-left).

---

### 4. For each option, annotate:

1. Where does the user's eye land first?
2. How many taps/scrolls to reach the Timing section?
3. Risk of important data being missed (low/medium/high)?
4. Is this pattern familiar from other mobile apps?

---

### 5. What NOT to change

- The verdict badge color coding (YES=green, NO=red, MAYBE=amber, UNCLEAR=grey)
- The cosmic dark background
- The serif/sans-serif typography pairing
- The gold accent color for section headers

---

## END PROMPT

---

## Next step after design review

After the owner selects a layout option, create `docs/design-prompts/prototype-update-v3.md` with:
- The chosen layout's implementation spec for `horary-design-agent`
- Exact HTML/CSS instructions for updating `docs/html-prototype/HoraClaudeDesign.html`
- Component breakdown for the Phase 1.5 implementation sprint

*End of verdict-layout-v1.md*
