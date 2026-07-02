# Google Play — App content audit prompt

Read-only verification prompt for **Claude in Chrome** (browser agent). Open Google Play
Console (logged in, app selected), run the extension, paste the block below. It audits every
"App content" declaration against the expected answers for Hora and reports ✅/❌/⚠️ — without
changing or submitting anything.

Key expected values: package `io.hora.app`, privacy policy
`https://cseal.github.io/horary-astrology-app/privacy-policy.html`, Data safety = Location only
(shared with astrology-api.io, App functionality, not tracking), rating Everyone, target 18+.

```
Ты — аудитор. Проверь раздел "App content"/"Контент приложения" в Google Play Console
для приложения Hora (пакет io.hora.app). Задача — ТОЛЬКО СВЕРКА, read-only.

━━━ ЖЁСТКИЕ ПРАВИЛА ━━━
• НИЧЕГО не меняй, не сохраняй, не нажимай Save/Сохранить, Submit, "Send for review"/
  "Отправить на проверку", "Start rollout"/"Начать развёртывание", Publish.
• Можно открывать разделы и под-страницы, чтобы прочитать значения, но выходи НАЗАД без сохранения.
• НЕ доверяй зелёному статусу "Completed"/"Готово" — он значит лишь что поля заполнены,
  а НЕ что заполнены правильно. Открывай каждый раздел и читай реальные значения.
• Если не уверен, изменит ли клик состояние — остановись и опиши в отчёте, не кликай.
• Консоль может быть на русском — ниже метки EN и RU.

━━━ НАВИГАЦИЯ ━━━
Play Console → приложение "Hora" → левое меню "Policy"/"Политика" → "App content"/
"Контент приложения". Открой каждую декларацию.

━━━ ЧТО ДОЛЖНО БЫТЬ (сверяй факт vs ожидание) ━━━
1. Privacy policy / Политика конфиденциальности
   Ровно: https://cseal.github.io/horary-astrology-app/privacy-policy.html
2. Ads / Реклама → "приложение не содержит рекламу"
3. App access / Доступ к приложению → "Все функции доступны без специального доступа" (без входа)
4. Content ratings / Возрастные рейтинги → итог Everyone/для всех/PEGI 3; категория НЕ игра;
   все ответы анкеты No, включая «делится ли геолокацией с ДРУГИМИ пользователями» = No.
   ❌ если итог Teen/Mature/12+/16+/18+.
5. Target audience / Целевая аудитория → только 18+; «привлекает детей» = No; НЕ в Families.
6. Data safety / Безопасность данных (важнейший — читай дословно):
   • Собирает или передаёт данные: Yes
   • Шифрование при передаче: Yes
   • Запрос на удаление данных: No
   • Способ создания аккаунта: «В приложении нельзя создать аккаунт»; внешний вход: No
   • Типы данных: ТОЛЬКО Location → Approximate И Precise. Всё прочее — не собирается.
   • Для обоих Location: Collected=Yes, Shared=Yes (astrology-api.io), Ephemeral=No,
     Required, Purpose(сбор+передача)=только App functionality.
   ❌ если лишние типы, цель Analytics/Advertising, «tracking», или Location не отмечена.
7. Government apps / Государственные → No
8. Financial features / Финансовые функции → нет
9. Health / Здоровье → не health
10. Advertising ID / Рекламный идентификатор → не используется (частый блокер!)
11. News/COVID (если есть) → No/No

━━━ ДОП. ПРОВЕРКА (релиз) ━━━
Production: черновик "1.0.0 (110)", versionCode 110, примечания на 7 языках
(de, en, es, fr, pt, ru, uk), стран/регионов > 0, в мастере нет меток "Ошибка".

━━━ ОТЧЁТ ━━━
Таблица: | Раздел | Факт | Ожидалось | ✅/❌/⚠️ | Как исправить |
Отдельно — блок «Data safety: дословно что стоит».
Итог: "ГОТОВО К ОТПРАВКЕ НА РЕВЬЮ: да/нет" + список блокеров.
Ничего не отправляй — только отчёт.
```
