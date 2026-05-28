# Import Conventions Guide

**Updated:** 2026-05-28  
**Status:** Active - All code must follow these conventions

## Executive Summary

All internal module imports must use **absolute `@/` imports**. Relative parent imports (`../../../`) are forbidden by ESLint and should never be used.

**Key benefit:** Absolute imports are safe during refactoring — moving a file doesn't break imports.

---

## The Rule

### ✅ CORRECT: Always use absolute imports outside current directory

```ts
// ✅ These are correct
import { Button } from '@/components/ui/Button';
import { horaryApi } from '@/services/horaryApi';
import { useJournal } from '@/hooks/useJournal';
import type { HoraryRequest } from '@/types/horary';
import { colors } from '@/constants/theme';
import { useQuestionsStore } from '@/stores/questionsStore';
```

### ✅ ACCEPTABLE: Same-directory relative imports (optional)

For modules in the same directory as the importing file, you may use either absolute or relative imports:

```ts
// File: src/hooks/useJournal.ts

// ✅ Both are acceptable for same-directory
import { useDebugTrigger } from '@/hooks/useDebugTrigger';  // absolute
import { useDebugTrigger } from './useDebugTrigger';        // relative (same dir)
```

### ❌ FORBIDDEN: Relative parent imports

```ts
// ❌ Never use relative parent imports
import { Button } from '../../../components/ui/Button';     // relative parent
import { horaryApi } from '../../services/horaryApi';       // relative parent
```

**Why this is bad:**
- **Fragile:** Moving `useJournal.ts` from `src/hooks/` to `src/hooks/form/` breaks `../../` paths
- **Unreadable:** Takes mental effort to count the `../` levels and trace the path
- **Hard to maintain:** IDE refactoring tools struggle with relative paths
- **Error-prone:** Easy to get the count wrong when moving files around

---

## Path Alias Reference

The `@/` alias is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Therefore:
- `@/components/Button` → `src/components/Button`
- `@/services/horaryApi` → `src/services/horaryApi`
- `@/hooks/useJournal` → `src/hooks/useJournal`
- `@/types/horary` → `src/types/horary`

---

## ESLint Enforcement

The ESLint rule `no-restricted-imports` forbids `../**` patterns:

```bash
npm run lint    # Check for violations
npm run lint -- --fix  # Auto-fix some issues
```

If you see ESLint errors like:
```
Use absolute imports (@/) for modules outside the current directory.
Example: @/components/Foo instead of ../../../components/Foo
```

**Fix:** Replace the relative import with its absolute equivalent.

### Example Fix

**Before (ESLint error):**
```ts
import { Button } from '../../../components/ui/Button';
```

**After (lint passes):**
```ts
import { Button } from '@/components/ui/Button';
```

---

## IDE Support

Most IDEs (VS Code, WebStorm, etc.) understand the `@/` alias:

- **Auto-import suggestions** work correctly with `@/`
- **Jump to definition** (`Cmd+Click` or `Ctrl+Click`) works
- **Rename refactoring** updates all references correctly
- **Find usages** works across the codebase

**If your IDE doesn't recognize `@/`:**
1. Restart your IDE
2. Ensure `tsconfig.json` is in the project root
3. Check that your IDE's TypeScript plugin is enabled

---

## Common Patterns

### Importing from same directory
```ts
// File: src/services/horaryApi.ts
import { secureKeyService } from './secureKeyService';  // ✅ OK (same dir)
import { secureKeyService } from '@/services/secureKeyService';  // ✅ Also OK
```

### Importing from sibling directory
```ts
// File: src/hooks/useJournal.ts
import { questionsStore } from '@/stores/questionsStore';  // ✅ Correct (absolute)
import { questionsStore } from '../stores/questionsStore';  // ❌ Wrong (relative parent)
```

### Importing from nested subdirectory
```ts
// File: src/app/(tabs)/index.tsx
import { Button } from '@/components/ui/Button';        // ✅ Correct (absolute)
import { Button } from '../../../components/ui/Button';  // ❌ Wrong (relative parent)
```

### Type imports
```ts
// ✅ Use @/ for types too
import type { HoraryRequest } from '@/types/horary';
import type { JournalEntry } from '@/types/journal';
```

---

## Exceptions

### Special Case: src/tw/index.tsx

The wrapper file `src/tw/index.tsx` is allowed to import directly from `react-native` because it's the implementation layer that creates the CSS-enabled wrappers:

```ts
// src/tw/index.tsx — EXCEPTION: allowed to import from react-native
import { View, Text, ScrollView } from 'react-native';
```

This exception is enforced by ESLint configuration.

---

## Verification

**Before committing code:**

```bash
npm run lint      # ✅ Should pass with no import errors
npm run typecheck # ✅ Should pass
npm run test      # ✅ Should pass
```

All three checks must pass before your code is ready.

---

## Questions?

- **IDE not recognizing `@/`?** → Check that your IDE's TypeScript plugin is enabled
- **ESLint rule too strict?** → It's intentional; absolute imports improve maintainability
- **Need to import from parent of parent?** → Use absolute `@/` instead; the structure may indicate you should refactor
