# AstraSk — Documentation Index

Central navigation for all project documentation.
Update this file whenever a new doc is added or a section status changes.

---

## 1. Product

| Document | Description | Status |
|---|---|---|
| [project-brief.md](project-brief.md) | Vision, problem statement, target users | Done |
| [prd-v1.md](prd-v1.md) | Full product requirements (v1) | Done |
| [mvp-scope.md](mvp-scope.md) | MVP cutline and feature list | Done |
| [kpi-and-economics.md](kpi-and-economics.md) | Success metrics, monetization model | Done |
| [competitor-research.md](competitor-research.md) | Market landscape, differentiation | Done |

---

## 2. Design

| Document | Description | Status |
|---|---|---|
| [design-system-brief.md](design-system-brief.md) | Colors, typography, spacing tokens | Done |
| [ux-flows.md](ux-flows.md) | User journeys and screen flows | Done |
| [html-prototype/index.html](html-prototype/index.html) | Interactive HTML prototype | Done |

---

## 3. Architecture

| Document | Description | Status |
|---|---|---|
| [technical-architecture.md](technical-architecture.md) | Stack, data flow, module structure | Done |
| [api-integration-spec.md](api-integration-spec.md) | astrology-api.io endpoints, auth, error handling | Done |

---

## 4. Feature Guides

Living technical docs — one file per implemented feature.
Written and updated by `doc-writer` agent via `/doc:feature <name>`.

| Document | Feature | Status |
|---|---|---|
| [features/ask-flow.md](features/ask-flow.md) | Home → API → Verdict (core user journey) | Done |
| [features/journal.md](features/journal.md) | Journal storage, grouping, swipe-delete | Done |
| [features/onboarding.md](features/onboarding.md) | 3-step first-run onboarding | Done |
| [features/settings.md](features/settings.md) | Language, timezone, API key, usage counter | Done |
| [features/animations.md](features/animations.md) | CosmosBackground, StarField, PlanetOrbit, VerdictStar | Done |
| [features/force-update.md](features/force-update.md) | Force-update gate (remote config + version enforcement) | Done |
| [features/location-override.md](features/location-override.md) | Manual city override (per-question) via bottom sheet + Photon geocoding | Done |
| [features/debug-mode.md](features/debug-mode.md) | Hidden developer debug menu (7-tap + PIN gate, mock API, state resets) | Done |

---

## 5. Operations

| Document | Description | Status |
|---|---|---|
| [ops/environment.md](ops/environment.md) | All env vars, .env.local setup, secrets rules, EAS config | Done |
| _ops/deployment.md_ | EAS Build, App Store / Play Store release process | Planned |

---

## 6. Quality & Roadmap

| Document | Description | Status |
|---|---|---|
| [quality-gates.md](quality-gates.md) | Gate criteria and sign-off checklist | Done |
| [delivery-roadmap.md](delivery-roadmap.md) | Phase timeline and milestones | Done |

---

## 7. Orchestration (Internal)

Process artifacts — not product docs, not feature docs.

| Document | Description |
|---|---|
| [orchestration/handoff-log.md](orchestration/handoff-log.md) | Stage-by-stage completion log |
| [orchestration/plan.md](orchestration/plan.md) | Implementation partition map |
| [orchestration/command-contracts.md](orchestration/command-contracts.md) | `/orchestrate:*` command specs |
| [orchestration/gate-criteria.md](orchestration/gate-criteria.md) | Gate pass/fail rules |
| [orchestration/coding-readiness-checklist.md](orchestration/coding-readiness-checklist.md) | Pre-coding binary checklist |

---

## 8. Research & Superpowers Outputs

Auto-generated during pre-flight phases.

| Document | Description |
|---|---|
| [superpowers/expert/horary-domain-brief.md](superpowers/expert/horary-domain-brief.md) | Horary astrology domain knowledge |
| [superpowers/library-audit/2026-05-25-horary-app-stack.md](superpowers/library-audit/2026-05-25-horary-app-stack.md) | Library validation audit |
| [superpowers/library-audit/2026-05-26-force-update-feature.md](superpowers/library-audit/2026-05-26-force-update-feature.md) | Library audit for force-update |
| [superpowers/expert/2026-05-26-force-update-mobile.md](superpowers/expert/2026-05-26-force-update-mobile.md) | Domain expert: mobile force-update patterns |
| [superpowers/expert/2026-05-27-hidden-debug-mode.md](superpowers/expert/2026-05-27-hidden-debug-mode.md) | Domain expert: hidden debug-mode patterns + Apple 2.3.1 |
| [superpowers/expert/_knowledge-base/mobile-debug-mode.md](superpowers/expert/_knowledge-base/mobile-debug-mode.md) | Debug-mode KB (trigger matrix, gating layers, disclosure) |
| [superpowers/library-audit/_knowledge-base/expo-react-native.md](superpowers/library-audit/_knowledge-base/expo-react-native.md) | Cumulative library audit KB (incl. bottom-sheet + geocoding) |

---

_Maintained by `doc-writer` agent. Add new feature docs via `/doc:feature <name>`._
