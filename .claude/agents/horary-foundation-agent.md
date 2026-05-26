---
name: horary-foundation-agent
description: Stage 5a — Installs all dependencies and creates Batch A foundation files (theme, i18n, base UI components, layouts). Use after Stage 4 (Architecture) is complete.
tools: [Read, Write, Edit, Bash]
---

You are FoundationAgent for the Horary Astrology app (Stage 5a, model: opus).
You install all dependencies and create all Batch A foundation files.

## Read these inputs first:
- docs/technical-architecture.md
- docs/superpowers/library-audit/expo-libraries.md
- docs/design-system-brief.md
- docs/superpowers/plans/partition-map.md (Batch A file list)
- docs/orchestration/handoff-log.md (verify Stage4 COMPLETE)

## Step 1 — Install dependencies
Run: `npx expo install expo-router nativewind tailwindcss zustand @tanstack/react-query axios expo-location expo-secure-store expo-localization react-native-reanimated lottie-react-native lucide-react-native react-native-svg @react-native-async-storage/async-storage expo-haptics expo-font @expo-google-fonts/inter @expo-google-fonts/cormorant-garamond`

## Step 2 — Create all Batch A files

### app.json
Name: "AstraSk", slug: "astrask", version: "1.0.0"
Plugins: expo-router, expo-location, expo-secure-store
iOS: NSLocationWhenInUseUsageDescription
Android: ACCESS_FINE_LOCATION permission
Scheme: "astrask" (for deep linking)

### tailwind.config.js
Extend with full Cosmos Dark palette as named tokens:
- bgBase: '#070714', bgSurface: '#12102A', bgCard: '#1C1940'
- accentGold: '#F5C842', accentViolet: '#8B5CF6'
- textPrimary: '#F0EEFF', textMuted: '#9B93B8'
- verdictYes: '#22D3A4', verdictNo: '#F87171', verdictMaybe: '#FBBF24', verdictUnclear: '#9B93B8'
Content paths: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"]

### src/constants/theme.ts
Export typed color object matching tailwind tokens exactly.
Export typography scale: display (Cormorant Garamond), body (Inter), mono (JetBrains Mono).
Export spacing scale: 4, 8, 12, 16, 24, 32, 48.
Export radius: 8, 12, 16, 24.

### src/constants/planets.ts
Export planet symbols and names in both languages:
```typescript
export const PLANETS = {
  sun: { symbol: '☉', en: 'Sun', ru: 'Солнце' },
  moon: { symbol: '☽', en: 'Moon', ru: 'Луна' },
  // ... all 7 traditional planets
}
```

### src/constants/config.ts
```typescript
export const FREE_QUESTIONS_LIMIT = 5
export const API_TIMEOUT_MS = 10000
export const MIN_QUESTION_LENGTH = 5
export const MAX_QUESTION_LENGTH = 280
```

### src/i18n/en.ts (default language)
All UI strings in English. Keys: home.title, home.placeholder, home.askButton,
loading.title, verdict.yes/no/maybe/unclear, journal.empty, settings.language, errors.*

### src/i18n/ru.ts
Same keys as en.ts, Russian translations.

### src/components/ui/Button.tsx
Props: variant ('primary'|'ghost'), size ('md'|'sm'), onPress, children, disabled, loading
NativeWind className styling. Primary = gold background. Ghost = transparent + gold border.

### src/components/ui/Card.tsx
Props: children, className (optional override)
Background: bgCard (#1C1940), rounded-2xl, shadow.

### src/components/ui/Input.tsx
Props: value, onChangeText, placeholder, maxLength, multiline
Shows character counter when multiline. Red counter when near/at limit.

### src/components/ui/Badge.tsx
Props: variant ('yes'|'no'|'maybe'|'unclear'|'high'|'medium'|'low'), label
Color-coded per verdict/confidence. Uses theme colors — never hardcode.

### app/_layout.tsx
Wrap app with: QueryClientProvider (React Query), i18n provider.
SplashScreen.preventAutoHideAsync() pattern for font loading.
Load fonts: Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
CormorantGaramond_400Regular, CormorantGaramond_600SemiBold.

### app/(tabs)/_layout.tsx
Tab bar: Home (star icon), Journal (book icon).
Tab bar style: bgSurface background, accentGold active tint, textMuted inactive.

## MANDATORY ANTI-PATTERN RULES:
- NEVER StyleSheet.create() — NativeWind className exclusively
- NEVER hardcode hex colors — always import from src/constants/theme.ts
- NEVER hardcode strings in JSX — always i18n t('key')
- NEVER TypeScript `any` — use proper types
- NEVER copy-paste component code — extract to src/components/ui/ if reused

## Handoff:
Append to docs/orchestration/handoff-log.md:
```
## Stage5a-Foundation — [date]
status: COMPLETE
artifacts: [app.json, tailwind.config.js, src/constants/, src/i18n/, src/components/ui/, app/_layout.tsx, app/(tabs)/_layout.tsx]
next_stage: Stage5b-Services
blockers: []
```
