## Growth Features Implementation — Phase 1.5

Implements all Phase 1.5 growth features (FR-G01 to FR-G07 from PRD) + bug fixes.
Requires StageM4-DocRefresh COMPLETE.

### Prerequisites check
1. Read docs/orchestration/handoff-log.md — verify StageM4-DocRefresh COMPLETE
2. Read docs/viral-features-spec.md + docs/api-gap-spec.md + docs/growth-features-spec.md
3. Display feature list with effort ratings. Ask: "Implement all Phase 1.5 features? [yes / list IDs]"

### Compound V Pre-flight (Trigger 1) — launch 3 agents in PARALLEL
Agent 1 (archaeology):
- subagent_type: "code-archaeologist"
- model: "sonnet"
- prompt: "Topic: growth-feature-implementation. Produce exact File Touch Map for: (1) types/horary.ts additions (new fields: aspect_perfections, timing, lunar_rich, radicality_score, radicality_flags, dignity_score, domicile_ruler), (2) types/journal.ts additions (aspect_perfections in JournalEntry), (3) horaryMapper.ts additions, (4) VerdictCard.tsx — exact line insertion points for AspectPerfections section AND MoonDetails section (must be non-overlapping), (5) result/[id].tsx — timing section and share button placement (must be non-overlapping), (6) useHoraryQuery.ts — onSuccess review prompt trigger, (7) new files to create: AspectPerfectionRow.tsx, TimingSection.tsx, MoonDetailsPanel.tsx, ShareVerdictCard.tsx, reviewPromptService.ts. Save to docs/superpowers/archaeology/growth-impl-touchmap.md"
# Sonnet: structured code reading + File Touch Map — mechanical analysis

Agent 2 (domain expert):
- subagent_type: "domain-expert"
- model: "sonnet"
- prompt: "Topic: share card implementation + review prompt UX for mobile astrology. Confirm: (1) instagram-stories://share intent parameters and required file types, (2) react-native-view-shot captureRef usage pattern in Expo, (3) expo-store-review iOS/Android behavior, (4) AsyncStorage pattern for gating prompts. Save to docs/superpowers/expert/growth-impl-brief.md"
# Sonnet: web research + API parameter confirmation

Agent 3 (library validator):
- subagent_type: "doc-validator"
- model: "haiku"
- prompt: "Re-validate: react-native-view-shot (captureRef with Expo SDK 55 new arch), expo-sharing, expo-store-review — specifically installation steps and any known issues. Use Context7. Save to docs/superpowers/library-audit/growth-impl-libraries.md"
# Haiku: Context7-lookup, yes/no compatibility

Wait for all 3.

### Compound V Partition Review (Trigger 2)
Call Agent:
- subagent_type: "partition-reviewer"
- model: "sonnet"
- prompt: "Review the partition map from docs/superpowers/archaeology/growth-impl-touchmap.md. Partition: Task 0 (serial): types/horary.ts + types/journal.ts + horaryMapper.ts + horaryApi.ts + config.ts + i18n files. Then parallel: G1=AspectPerfectionRow+VerdictCard(toggle+aspects), G2=TimingSection+result/[id].tsx, G3=MoonDetailsPanel+VerdictCard(radicality+dignity), G4=ShareVerdictCard+result/[id].tsx+expo-sharing install, G5=reviewPromptService+useHoraryQuery+settings.tsx(invite), G6=horaryApi.ts(429)+Home screen(429 banner)+settings.tsx(disclaimer)+i18n. Verify: VerdictCard.tsx line ranges for G1 and G3 are non-overlapping. result/[id].tsx line ranges for G2 and G4 are non-overlapping. settings.tsx line ranges for G5 and G6 are non-overlapping. Return PASS or FAIL with violations."
# Sonnet: logical verification PASS/FAIL

If FAIL: resolve conflicts per violations, re-review.
If PASS: proceed to dispatch.

### Task 0 — Types + Mapper + Config fixes (SERIAL, must complete first)
Call Agent:
- subagent_type: "horary-services-agent"
- model: "sonnet"
- prompt: "Phase 1.5 Task 0 — types, mapper, and config bugfixes. (1) src/types/horary.ts: add AspectPerfectionData type, add aspect_perfections?: AspectPerfectionData[] to HoraryResponse, add timing?: TimingData[], add lunar_rich?: LunarRichData, add radicality_score?: number + radicality_flags?: string[], add dignity_score?: number + domicile_ruler?: string to SignificatorData. (2) src/types/journal.ts: add aspect_perfections?: AspectPerfectionData[] to JournalEntry. (3) src/services/horaryMapper.ts: extract all new fields; filter radicality.flags[] to only show_to_client===true entries; extract dignity_info.dignity_score + dignity_info.domicile_ruler per significator. (4) src/services/horaryApi.ts: add include_timing: true to request construction. (5) src/constants/config.ts: add 'third_party_sibling' and 'third_party_enemy' to SUBJECT_ROLES. (6) src/i18n/en.ts + ru.ts + de.ts + fr.ts + es.ts + pt.ts: add i18n keys for two new subject roles. Use docs/api-gap-spec.md for exact wire field names. Verify tsc PASS after changes."
# Sonnet: mechanical TypeScript changes, well-defined spec

Wait for completion.

### Parallel Batch G1–G6 (Trigger 3 / single message, 6 agents)
Call all 6 in one message:

G1 — AspectPerfectionRow + VerdictCard + toggle "THE PLANETS SAY":
- subagent_type: "horary-screens-agent"
- model: "sonnet"
- prompt: "FR-G04 + Design fix. (1) Create src/components/AspectPerfectionRow.tsx showing planet1, aspect_type, planet2, orb, applying/separating badge. Integrate into VerdictCard.tsx at line range from docs/superpowers/archaeology/growth-impl-touchmap.md. Show top-3 applying aspects below significators, 'Show all' expand if >3. (2) Verify 'THE PLANETS SAY' significators section is properly collapsible with Pressable header + animated chevron (Reanimated withTiming rotate, single-owner rule). If already working, add AspectPerfectionRow inside the same collapsible. Follow CLAUDE.md Reanimated 4 rules. No StyleSheet.create, all className, no hardcoded colors."

G2 — TimingSection + result/[id]:
- subagent_type: "horary-screens-agent"
- model: "sonnet"
- prompt: "FR-G05. Create src/components/TimingSection.tsx showing timing[] array: event description + date range + confidence indicator. Add to result/[id].tsx at line range from docs/superpowers/archaeology/growth-impl-touchmap.md. Only render when timing array is non-null. Follow Cosmos Dark design system. No StyleSheet.create, all className."

G3 — MoonDetailsPanel + radicality score/flags + SignificatorRow dignity fix:
- subagent_type: "horary-screens-agent"
- model: "sonnet"
- prompt: "FR-G07 + FR-G06 + BUG dignity. (1) Create src/components/MoonDetailsPanel.tsx showing lunar_rich: moon_sign, moon_house, degrees_to_void. Collapsible panel, only shown when data non-null. Add to screen per line range from touchmap. (2) Update radicality display in VerdictCard: replace boolean 'Radical' badge with mini progress bar (0–100) labeled 'Chart Strength' + chips for radicality_flags[] (already filtered show_to_client by mapper). (3) Update src/components/SignificatorRow.tsx to show domicile_ruler hint below dignity badge if non-null. Follow Cosmos Dark design system. No StyleSheet.create, all className."

G4 — ShareVerdictCard + share button:
- subagent_type: "horary-polish-agent"
- model: "opus"
- prompt: "FR-G01. Install react-native-view-shot + expo-sharing (run npx expo install). Create src/components/ShareVerdictCard.tsx — an off-screen fixed-size card (not visible in main UI) rendering verdict badge + question excerpt (≤40 chars) + 'AstraSk' + 'Ask yours: astrask.app'. Add share button (Lucide Share2 icon, gold) to result/[id].tsx header. Implement share logic: captureRef(ref, {format:'png',quality:0.95}) → base64 → try instagram-stories://share deep-link → fallback to expo-sharing Share.shareAsync. Read docs/viral-features-spec.md for exact parameters. Follow CLAUDE.md Reanimated 4 rules. No StyleSheet.create, all className."
# Opus: complex library integration (ViewShot + Instagram Stories + fallback chain). High failure cost.

G5 — ReviewPromptService + invite friend:
- subagent_type: "horary-services-agent"
- model: "sonnet"
- prompt: "FR-G02 + FR-G03. (1) Create src/services/reviewPromptService.ts: maybePrompt() checks (a) entries >= 3, (b) 7+ days since install_date in AsyncStorage, (c) 180+ days since review_prompt_state.prompted_at. Uses expo-store-review StoreReview.requestReview(). (2) Add install_date AsyncStorage write on first launch in src/app/_layout.tsx. (3) Wire reviewPromptService.maybePrompt() in src/hooks/useHoraryQuery.ts onSuccess after journal save. (4) Add 'Invite a Friend' row in src/app/(tabs)/settings.tsx using Share.share() with App Store link + UTM. Read docs/viral-features-spec.md. No StyleSheet.create, all className, all strings via t('key')."

G6 — 429 RateLimit error state + Entertainment disclaimer:
- subagent_type: "horary-screens-agent"
- model: "sonnet"
- prompt: "Two tasks. (1) In src/services/horaryApi.ts error normalization: detect HTTP 429 response → throw new RateLimitError('rate_limit'). In src/app/(tabs)/index.tsx error display: add specific case for RateLimitError showing: 'Daily limit reached. Try again tomorrow.' with a Clock icon (Lucide). This is separate from the monthly counter banner. (2) In src/app/(tabs)/settings.tsx About section: add Entertainment disclaimer row with text from t('settings.disclaimer'). Add i18n key 'settings.disclaimer' to all 6 locale files (en.ts, ru.ts, de.ts, fr.ts, es.ts, pt.ts): 'For entertainment and educational purposes only. Not a substitute for professional advice.' No StyleSheet.create, all className."

Wait for all 6 agents.

### Review + Cleanup
Run `npm run typecheck` and `npm run lint`. Fix any errors.
Run `npm test`. Confirm test count >= 54 baseline.
New tests expected for: reviewPromptService (trigger rules), horaryMapper (new field extractions), RateLimitError handling.

### Final
Run `git diff --stat` and show output.
Propose commit following AstraSk conventions.
**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**
