## Monetization Cycle — Phase 2 IAP + Subscription Implementation

Run this command when Phase 2 KPI gates are met and you are ready to implement monetization.
Produces a complete implementation spec, paywall UI design prompt, and sprint plan.
Never produces code — spec and plan only.

### Prerequisites check

1. Read `docs/orchestration/handoff-log.md`
2. Require Stage6-QA COMPLETE (app must be in the store or near-ready)
3. Read `docs/monetization-spec.md` — confirm it exists
4. Read `docs/kpi-and-economics.md` — confirm Phase 2 KPI gates are noted
5. If StageM5-Monetization entry exists in handoff log: warn user "Monetization spec already run. Re-run to refresh?" — stop if user says no.

### Compound V Pre-flight — launch 2 agents in PARALLEL (single message)

Call both in one message:

Agent 1 (library validator):
- subagent_type: "doc-validator"
- model: "haiku"
- prompt: "Validate these libraries against Expo SDK 55 + React Native new architecture (Fabric + TurboModules): (1) react-native-purchases (RevenueCat SDK) — current version, Expo SDK 55 compatibility, New Architecture support, StoreKit 2 vs legacy StoreKit; (2) expo-iap — availability, API surface, comparison to react-native-purchases for Expo projects; (3) Google Play Billing v5/v6 — which version does react-native-purchases support?; (4) expo-notifications — current version, EAS Push Service setup requirements. Use Context7 for each. Save to docs/superpowers/library-audit/monetization-libraries.md"

Agent 2 (domain expert):
- subagent_type: "domain-expert"
- model: "sonnet"
- prompt: "Topic: RevenueCat + App Store monetization for a spiritual/astrology app. Research: (1) RevenueCat SDK setup for Expo/React Native — required dashboard config, entitlements, API keys; (2) Apple App Store IAP guidelines for fortune-telling / astrology apps — any category-specific restrictions on subscriptions?; (3) Google Play Billing subscription requirements 2026 — mandatory fields, pricing models; (4) Optimal subscription price points for utility/spiritual apps in 2026 ($2.99 vs $4.99 vs $6.99/month); (5) Best-practice paywall UX patterns that convert without violating Apple/Google guidelines. Save to docs/superpowers/expert/monetization-brief.md"

Wait for both to complete.

### StageM5 — Monetization Spec

Call Agent:
- subagent_type: "horary-monetization-agent"
- model: "sonnet"
- prompt: "Run StageM5. Pre-flight complete. Library audit at docs/superpowers/library-audit/monetization-libraries.md. Domain brief at docs/superpowers/expert/monetization-brief.md. Today's date: [current date]."

Wait for completion. Read handoff-log.md — confirm StageM5-Monetization COMPLETE.

### Final report

Report to user:
- Monetization spec updated: `docs/monetization-spec.md`
- Paywall UI design prompt: `docs/design-prompts/paywall-screen.md`
- Phase 2 sprint plan: `docs/orchestration/phase2-monetization-plan.md`

"Next steps:
- To design paywall UI: /orchestrate:design (reads paywall-screen.md)
- To implement: run the Phase 2 sprint from phase2-monetization-plan.md
- RevenueCat setup: register app + create products in RevenueCat dashboard first"

### Commit (owner approval required)

Run `git diff --stat` and show output to owner.
Propose commit message following AstraSk conventions.
**Wait for explicit owner approval before running `git commit`. Do NOT commit automatically.**
