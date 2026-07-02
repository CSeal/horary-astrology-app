# App Store Connect — submission audit prompt

Read-only verification prompt for **Claude in Chrome** (browser agent), symmetric to
`play-app-content-audit-prompt.md`. Open App Store Connect (logged in), run the extension,
paste the block below. It audits every submission field for Hora against expected values and
reports ✅/❌/⚠️ + the current review status — without changing or submitting anything.

Key expected values: bundle `io.hora.app`, Apple ID 6784362149, category Lifestyle, age 4+,
Free, privacy policy `https://cseal.github.io/horary-astrology-app/privacy-policy.html`,
App Privacy = Location only (Not Linked to You, not tracking, App Functionality),
copyright `© 2026 Mykosa OÜ`, `ITSAppUsesNonExemptEncryption=false`.

```
Ты — аудитор. Проверь готовность к отправке в App Store Connect (ASC) для приложения
Hora (bundle io.hora.app, Apple ID 6784362149). ТОЛЬКО ЧТЕНИЕ.

━━━ ЖЁСТКИЕ ПРАВИЛА ━━━
• НИЧЕГО не меняй/не сохраняй/не отправляй. НЕ нажимай Save, "Add for Review",
  "Submit for Review", "Release". Открывай разделы, читай, уходи без сохранения.
• НЕ доверяй галочкам «готово» — читай реальные значения полей.
• ASC обычно на английском; даю EN-метки.

━━━ НАВИГАЦИЯ ━━━
appstoreconnect.apple.com → My Apps → Hora. Проверь: App Information,
Pricing and Availability, App Privacy (левое меню), и страницу версии iOS 1.0.

━━━ ЧТО ДОЛЖНО БЫТЬ ━━━
A. App Information
   • Category: Primary = Lifestyle
   • Content Rights: заявлено корректно (нет стороннего контента)
   • Age Rating: 4+
   • Privacy Policy URL: https://cseal.github.io/horary-astrology-app/privacy-policy.html

B. Pricing and Availability
   • Price: Free; территории выбраны (> 0)

C. App Privacy (Apple-аналог Data safety — читай дословно)
   • Privacy Policy URL присутствует
   • Data Types: собирается ТОЛЬКО Location → Precise Location и Coarse Location.
     Всё остальное (Contact Info, Identifiers, Usage Data, Diagnostics и т.д.) — НЕ собирается.
   • Для Location: Used for Tracking = NO; Linked to identity = NO (Not Linked to You);
     Purpose = App Functionality (только; не Analytics/Advertising).
   ❌ отметь лишние типы, tracking=Yes, linked=Yes, чужую цель.

D. Версия iOS 1.0
   • Version = 1.0
   • Screenshots: набор iPhone 6.9"/6.7" присутствует. iPad не требуется (supportsTablet=false).
   • Description и Keywords заполнены; Promotional Text опционально
   • Support URL: https://cseal.github.io/horary-astrology-app/support.html
   • Copyright: © 2026 Mykosa OÜ
   • Build: прикреплён билд 1.0, без ошибок
   • Локализации присутствуют (минимум English; ожидаются Russian и др.)

E. App Review Information
   • Sign-In Required: NO (keyless — работает без логина, демо-аккаунт не нужен)
   • Contact: имя, фамилия, телефон +380689204246, email заполнены
   • Notes: заполнены

F. Export Compliance
   • НЕТ жёлтого флага "Missing Compliance" у билда (ITSAppUsesNonExemptEncryption=false →
     только стандартный HTTPS, вопрос о шифровании при submit не появляется)

━━━ СТАТУС ━━━
Прочитай текущий статус версии 1.0 (Prepare for Submission / Waiting for Review /
In Review / Pending Developer Release / Ready for Sale / Rejected) и зафиксируй.

━━━ ОТЧЁТ ━━━
Таблица: | Раздел | Факт | Ожидалось | ✅/❌/⚠️ | Как исправить |
Отдельно — блок «App Privacy: дословно что стоит».
Строка статуса версии 1.0.
Итог: "ГОТОВО К SUBMIT: да/нет" + список блокеров.
Ничего не отправляй — только отчёт.
```
