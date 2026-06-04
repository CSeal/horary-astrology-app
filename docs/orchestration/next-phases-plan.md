---
created_by: claude-sonnet-4-6
updated_by: claude-sonnet-4-6
source_inputs: [handoff-log.md, prd-v1.md, delivery-roadmap.md, qa-summary.md, viral-features-spec.md, growth-features-spec.md]
reviewed_by: owner-approved
date: 2026-06-04
---

# Next Phases Implementation Plan

## Контекст (что уже сделано)

| Батч | Коммит | Статус |
|---|---|---|
| Stage 1–5e MVP (foundation → screens → polish → cleanup) | multiple | ✅ |
| Stage 6 QA (71 тестов) | `c967a6b` | ✅ |
| M-cycle (market research + growth spec + API audit + doc refresh) | `ea3b8ee` | ✅ |
| Phase 1.5 Verdict C+ (FR-G04–G07 + два экрана + Settings redesign) | `6aeae17` | ✅ |
| Phase 1.5 Growth G02+G03 (review prompt + invite/rate) | `ecdb629` | ✅ |

**Текущий baseline:** typecheck ✓ lint ✓ jest 84/84

### Что отложено (не делать сейчас)
- FR-G01 Share Card — нужен dev build + физическое устройство (гайд: `docs/features/share-reading-G01-deferred.md`)
- Stage 6c Screenshots — нужен dev build
- Phase 3 Monetization — явно отложена владельцем

---

## Выбор модели

Правило простое: **сложность кода → модель**.

| Модель | Когда использовать | Примеры задач |
|---|---|---|
| **Opus** `claude-opus-4-8` | Сложный многофайловый код, архитектура, SVG-геометрия, нетривиальная логика | Chart Wheel SVG, сложный рефакторинг |
| **Sonnet** `claude-sonnet-4-6` | Средний код (1–5 файлов), документация, исследования, QA-прогоны | Outcome Tracking, Store Prep, QA, Location fallback |
| **Haiku** `claude-haiku-4-5-20251001` | Механические задачи: i18n-переводы, конфиг, мелкие правки | Перевод ключей в 5 локалей, Sentry init |

---

## Этапы реализации

```
┌─────────────────────────────────────────────────────┐
│  ЭТАП 0: QA re-run (обязательно первым)             │  ~20 мин
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌─────────────────┐       ┌─────────────────────────┐
│  ЭТАП 1:        │       │  ЭТАП 2:                │
│  Stage 6b       │       │  Outcome Tracking       │  параллельно
│  Store Prep     │       │  (Phase 2a)             │
└────────┬────────┘       └───────────┬─────────────┘
         │                            │
         │                  ┌─────────▼──────────────┐
         │                  │  ЭТАП 3:               │
         │                  │  Chart Wheel           │  после 2
         │                  │  (Phase 2b)            │
         │                  └─────────┬──────────────┘
         │                            │
         │                  ┌─────────▼──────────────┐
         │                  │  ЭТАП 4:               │
         │                  │  Manual Location +     │  после 3
         │                  │  Sentry (маленькие)    │
         │                  └─────────┬──────────────┘
         │                            │
         └────────────┬───────────────┘
                      ▼
          ┌───────────────────────┐
          │  ФИНАЛ:               │
          │  QA финальный прогон  │
          │  + Store upload       │
          └───────────────────────┘
```

---

## ЭТАП 0 — QA Re-run (обязательно первым)
> 🤖 **Модель: Sonnet** — запускает команды, читает вывод, пишет markdown-отчёты. Opus избыточен.

### Зачем
Phase 1.5 добавила 13 новых файлов и изменила 16. `qa-summary.md` и `demo-readiness.md`
устарели (написаны до C+). Нужен свежий baseline перед следующими батчами.

### Команда
```
/orchestrate:qa
```

### Входы (уже готово)
- Код после `ecdb629`
- jest baseline: 84 тестов (было 71 до Phase 1.5)

### Выходы
- `docs/qa-summary.md` — обновлённый (новый baseline: 84+ тестов, новые экраны)
- `docs/demo-readiness.md` — обновлённый (Verdict C+ экраны, Share & Invite в Settings)
- Запись `Stage6b-QARerun` в `docs/orchestration/handoff-log.md`

### Чеки приёмки
- [ ] expo doctor 19/19 ✅
- [ ] tsc --noEmit — 0 ошибок
- [ ] eslint src/ — 0 ошибок
- [ ] jest — все тесты (минимум 84) зелёные
- [ ] 6 smoke-тестов пройдены (Home → Ask → Loading → Verdict → Full Reading → Journal)
- [ ] `qa-summary.md` содержит актуальный счётчик тестов
- [ ] P0 issues: none (P1 допустимы с записью)

---

## ЭТАП 1 — Stage 6b Store Prep
> 🤖 **Модель: Sonnet** — чистая генерация текста (описания, privacy policy, ASO-копирайтинг).
> Внутри агента i18n-переводы для 6 локалей отдать **Haiku** (механический перевод).

### Зачем
Подготовить все текстовые артефакты для App Store / Play Store. Загрузка — позже
(когда будет App Store Connect account + номер ID), но всё содержимое готовим сейчас.

### Предусловие
- ЭТАП 0 завершён (QA зелёный)

### Команда
```
/orchestrate:store-prep
```

### Входы (уже готово)
- `docs/aso-brief.md` — 50 keywords, 5 кандидатов на название
- `docs/competitor-research.md` — конкуренты, дифференциаторы
- `docs/prd-v1.md` — PRD с описанием продукта
- `docs/design-system-brief.md` — визуальный стиль
- `docs/qa-summary.md` — результаты QA для reviewer notes

### Выходы
- `docs/privacy-policy.md` — текст политики конфиденциальности (для GitHub Pages)
- `docs/store-metadata.md` — локализованные описания EN/RU/DE/FR/PT/ES
  - App name (≤30 chars), subtitle (≤30 chars), description (≤4000 chars)
  - Keywords string (≤100 chars, comma-separated) — из `aso-brief.md`
  - Promotional text (≤170 chars), что нового (release notes)
- `docs/apple-privacy-labels.md` — Apple Privacy Nutrition Label ответы
- `docs/play-data-safety.md` — Google Play Data Safety form ответы
- `docs/app-reviewer-notes.md` — инструкции для ревьюера App Store (демо-доступ, описание функций)
- `docs/age-rating.md` — рекомендация возрастного рейтинга + обоснование
- Запись `Stage6b-StorePrep` в `handoff-log.md`

### Чеки приёмки
- [ ] `store-metadata.md` содержит все 6 локалей
- [ ] App name ≤ 30 символов во всех локалях
- [ ] Keywords ≤ 100 символов (comma-separated)
- [ ] Privacy policy включает: data collection, location use, API key storage, retention
- [ ] Reviewer notes содержат demo API key или инструкцию как тестировать без него
- [ ] Apple 4.3(b) compliance: описание функционального назначения (не fortune-telling)
- [ ] Age rating: 4+ с обоснованием (нет насилия, азартных игр, пользовательского контента)

### ⚠️ Требуется от владельца до загрузки
- Зарегистрировать приложение в App Store Connect → получить **numeric App Store ID**
- Заменить `APP_STORE_ID = '000000000'` в `src/constants/config.ts` на реальный ID
- Это разблокирует invite + rate ссылки (G03) и store upload

---

## ЭТАП 2 — Journal Outcome Tracking (Phase 2a)
> 🤖 **Модель: Sonnet** — средней сложности: новое поле в store, UI-компонент, AsyncStorage.
> Предсказуемый объём (5–6 файлов), нет архитектурных сложностей.
> i18n-переводы для 5 локалей: делегировать **Haiku**-агенту параллельно.

### Зачем
«Сбылось / Не сбылось / Ожидаю» на каждой записи журнала. Повышает retention —
пользователи возвращаются проверить исход. Чистый JS, нет native deps.

### Предусловие
- ЭТАП 0 завершён (QA зелёный)
- **Может идти параллельно с ЭТАПОМ 1**

### Входы (уже готово)
- `src/types/journal.ts` — `JournalEntry` интерфейс
- `src/stores/questionsStore.ts` — `addEntry`, `deleteEntry`
- `src/app/(tabs)/journal.tsx` — экран журнала
- `src/components/JournalItem.tsx` — карточка записи
- `src/app/(tabs)/result/[id]/index.tsx` — экран вердикта (Screen 1)

### Новые файлы
- (нет — всё встраивается в существующие)

### Изменения
| Файл | Изменение |
|---|---|
| `src/types/journal.ts` | Новое опциональное поле `outcome?: 'came_true' \| 'did_not_happen' \| 'pending' \| null` |
| `src/stores/questionsStore.ts` | Новый метод `updateOutcome(id, outcome)` |
| `src/services/journalService.ts` | Поддержка `updateOutcome` в AsyncStorage |
| `src/components/JournalItem.tsx` | Три кнопки исхода внизу карточки (или dropdown) |
| `src/app/(tabs)/journal.tsx` | Передать `onOutcome` колбэк в `JournalItem` |
| `src/i18n/en.ts` + 5 локалей | Ключи: `journal.outcomeCameTrue`, `journal.outcomeDidNot`, `journal.outcomePending`, `journal.outcomeLabel` |

### Дизайн UI
```
┌─────────────────────────────┐
│  YES  Will I get the job?   │
│  Jun 4 · London             │
│  ─────────────────────────  │
│  [✓ Came true] [✗ Didn't]  [… Pending]  │
└─────────────────────────────┘
```
- Активная кнопка подсвечивается (came_true → yes-цвет, did_not → no-цвет, pending → unclear)
- Состояние сохраняется немедленно в AsyncStorage
- Backward compatible: старые записи без `outcome` показывают все три кнопки

### Чеки приёмки
- [ ] Три варианта исхода отображаются на каждой записи журнала
- [ ] Выбор сохраняется после перезапуска приложения
- [ ] Активный исход визуально выделен
- [ ] Старые записи (без поля outcome) работают корректно
- [ ] i18n: все 6 локалей
- [ ] jest: тесты на `journalService.updateOutcome` + `questionsStore.updateOutcome`
- [ ] tsc + lint: 0 ошибок

---

## ЭТАП 3 — Chart Wheel (Phase 2b)
> 🤖 **Модель: Opus** — самая сложная задача в плане.
> SVG-геометрия колеса (тригонометрия, 12 домов, позиции планет по градусам),
> новый тип `ChartWheelData`, маппинг wire-данных, Reanimated-анимации.
> Sonnet здесь рискует сделать ошибки в координатах или пропустить edge-cases.

### Зачем
Визуальное колесо гороскопа — главный дифференциатор от конкурентов, которые показывают
только текст. Wire-данные (`chart_data`) уже приходят от API, но не маппятся.
`react-native-svg` уже установлен.

### Предусловие
- ЭТАП 2 завершён (или хотя бы его PR не конфликтует — разные файлы)
- Проверить: `chart_data` реально приходит в ответе от astrology-api.io (может потребоваться
  тест с реальным API ключом, не mock)

### Входы (уже готово)
- `src/types/horary.ts` — `WireChartData`, `WirePlanetaryPosition`, `WireChartData`
- `src/components/svg/ChartWheel.tsx` — заглушка (Phase 2 placeholder)
- `src/app/(tabs)/result/[id]/full.tsx` — Screen 2 (место для новой секции)
- `react-native-svg` — уже установлен

### Новые файлы
- `src/types/horary.ts` — новый тип `ChartWheelData` (маппинг из `WireChartData`)
- `src/components/svg/HoraryChartWheel.tsx` — реальный SVG-компонент

### Изменения
| Файл | Изменение |
|---|---|
| `src/types/journal.ts` | Новое опциональное поле `chart_wheel?: ChartWheelData` |
| `src/services/horaryMapper.ts` | Маппинг `raw.chart_data` → `ChartWheelData` |
| `src/hooks/useHoraryQuery.ts` | Передача `chart_wheel` в `buildJournalEntry` |
| `src/components/svg/ChartWheel.tsx` | Замена заглушки на `HoraryChartWheel` |
| `src/app/(tabs)/result/[id]/full.tsx` | Добавить секцию «Chart» с `HoraryChartWheel` |
| `src/i18n/en.ts` + 5 локалей | Ключ `verdict.chartTitle` = 'Horary Chart' |

### Что рисует колесо
```
- Внешнее кольцо: 12 знаков зодиака с глифами (♈♉♊...)
- 12 секторов домов (куспиды из house_cusps)
- Планеты по градусам (planetary_positions → позиции по колесу)
- Глиф + название планеты, цвет из theme.ts
- Аскендент помечен AC
- Размер фиксирован, scale не нужен
```

### Чеки приёмки
- [ ] Колесо отрисовывается на Screen 2 (Full Reading) для новых записей
- [ ] Старые записи (без `chart_wheel`) — колесо скрыто (graceful fallback)
- [ ] 12 домов видны
- [ ] Планеты на корректных позициях (визуально — не автотест)
- [ ] Цвета только из `theme.ts`
- [ ] Нет `StyleSheet.create`, нет inline hex
- [ ] tsc + lint: 0 ошибок
- [ ] Mapper tests: `chart_data` → `ChartWheelData` корректно

---

## ЭТАП 4 — Manual Location + Sentry (маленькие батчи)

### Предусловие
- ЭТАП 3 завершён

### 4a — Manual Location Fallback
> 🤖 **Модель: Sonnet** — небольшое изменение в одном файле, логика простая.

#### Зачем
PRD gap: при denied GPS сейчас только error state. `LocationPickerSheet` уже есть —
нужно подключить его как fallback.

#### Изменения
| Файл | Изменение |
|---|---|
| `src/app/(tabs)/index.tsx` | При `locationDenied` показывать `LocationPickerSheet` вместо error banner + кнопки «Open Settings» |
| `src/i18n/en.ts` + 5 локалей | Ключи если нужны новые |

#### Чеки
- [ ] При denied GPS открывается пикер городов
- [ ] Выбранный город используется для вопроса
- [ ] GPS-маршрут работает как раньше

### 4b — Sentry Crash Reporter
> 🤖 **Модель: Haiku** — механический setup: install, init, env var, плагин в app.json.
> Нет логики, нет архитектурных решений. Haiku справится за минуту.

#### Зачем
После запуска нужен crash reporting. Без него баги в production невидимы.

#### Что делать
```bash
npx expo install @sentry/react-native
```

#### Изменения
| Файл | Изменение |
|---|---|
| `src/app/_layout.tsx` | `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN })` |
| `.env.local.example` | Добавить `EXPO_PUBLIC_SENTRY_DSN=` |
| `app.json` | Плагин `@sentry/react-native` |

#### Чеки
- [ ] `Sentry.init` вызывается при старте
- [ ] DSN из env (не хардкод)
- [ ] В production build ошибки идут в Sentry
- [ ] В dev/test build не ломает ничего при отсутствии DSN

---

## ЭТАП ФИНАЛ — QA финальный + Store Upload
> 🤖 **Модель: Sonnet** — прогон команд + загрузка артефактов. QA-агент (`horary-qa-agent`) уже настроен.

### Предусловие
- Этапы 0–4 завершены
- `APP_STORE_ID` заменён на реальный numeric ID (`src/constants/config.ts`)
- App Store Connect account готов
- Есть demo API key, email, debug PIN, GitHub username

### Действия
1. **`/store:finalize`** ← **ОБЯЗАТЕЛЬНО первым**
   - Собирает email / demo API key / debug PIN / GitHub username
   - Заполняет плейсхолдеры в `docs/privacy-policy.md`, `docs/reviewer-notes.md`, `docs/play-data-safety.md`
   - Запускает `npm run generate:icon` + `npm run build:privacy`
   - Добавляет entertainment disclaimer в Settings screen
   - Предлагает коммит
2. `git push` → GitHub Actions деплоит privacy policy на Pages
3. Запустить `/orchestrate:qa` — финальный прогон
4. Запустить `/orchestrate:screenshots` — 30 PNG (5 × 6 локалей), нужен dev build
5. Загрузить store-drafts в App Store Connect (из `docs/store-drafts/`)
6. Загрузить скриншоты
7. Заполнить Apple Privacy Labels из `docs/apple-privacy-labels.md`
8. Submit for review

---

## Зависимости между этапами (граф)

```
ЭТАП 0 (QA re-run)
  ├──► ЭТАП 1 (Store Prep)     ← независим от 2/3/4, только от 0
  └──► ЭТАП 2 (Outcome Track)  ← параллельно с 1
         └──► ЭТАП 3 (Chart Wheel)
                └──► ЭТАП 4a (Location)
                └──► ЭТАП 4b (Sentry)
                       └──► ФИНАЛ (requires: App Store ID + dev build for screenshots)
```

### Параллельно (можно одновременно)
- ЭТАП 1 и ЭТАП 2 — разные файлы, не конфликтуют
- ЭТАП 4a и ЭТАП 4b — разные файлы, не конфликтуют

### Строго последовательно
- ЭТАП 0 → всё остальное (нужен свежий baseline)
- ЭТАП 2 → ЭТАП 3 (Outcome меняет `JournalEntry` — Chart Wheel тоже добавляет поле)
- ЭТАП 3 → ФИНАЛ (chart_data нужен в новых записях для скриншотов)

---

## Чеклист на вход в каждый этап

Перед стартом любого этапа убедиться:

```bash
npm run typecheck   # 0 ошибок
npm run lint        # 0 ошибок
npm run test        # все тесты зелёные
git status          # нет незакоммиченных изменений (чистый worktree)
```

---

## Важные константы / TODO

| Константа | Файл | Текущее значение | Заменить на |
|---|---|---|---|
| `APP_STORE_ID` | `src/constants/config.ts` | `'000000000'` | Реальный numeric ID из App Store Connect |
| iOS Signing Team | `app.json` + `ios/` | `DGAHHMV358` (personal) | AstraSk org team ID перед TestFlight |
| `EXPO_PUBLIC_SENTRY_DSN` | `.env.local` | не установлен | DSN из sentry.io после создания проекта |
| `EXPO_PUBLIC_DEBUG_PIN` | `.env.local` | не установлен (debug выключен) | PIN для QA-сборок |
