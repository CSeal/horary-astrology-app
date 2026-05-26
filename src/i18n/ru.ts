// src/i18n/ru.ts
// Russian string map. Must have parity with en.ts.

const ru = {
  appName: 'AstraSk',
  appTagline: 'Задай искренний вопрос. Небо ответит.',

  home: {
    title: 'Спроси звёзды',
    inputPlaceholder: 'Задай искренний, конкретный вопрос...',
    inputHint: 'например: Получу ли я работу в этом месяце?',
    submitButton: 'Спроси звёзды',
    locationLabel: 'Определение местоположения...',
    questionCounter: 'Вопросов в этом месяце: {{count}} / {{limit}}',
    questionLimitBanner:
      'Вы использовали {{limit}} бесплатных вопросов этого месяца. Безлимитный доступ скоро появится.',
    charCount: '{{count}} / {{max}}',
  },

  verdict: {
    title: 'Ответ',
    summaryHeader: 'Планеты говорят:',
    summaryHeaderUnclear: 'Что показывает карта:',
    significatorsHeader: 'Сигнификаторы',
    significatorsToggle: 'Планеты говорят',
    vocNote:
      'Луна в void-of-course. Обычно это означает «ничего не произойдёт» — но карта всё равно показывает текущую ситуацию.',
    lowConfidenceNote:
      'Карта показывает смешанные признаки — воспринимайте этот ответ как общую тенденцию, а не как определённость.',
    chartUnclear: 'Карта неясна',
    backButton: 'Назад',
  },

  journal: {
    title: 'Журнал',
    emptyTitle: 'Записей пока нет.',
    emptySubtitle: 'Задай первый вопрос, чтобы начать свой журнал.',
    emptyButton: 'Задать вопрос',
    deleteConfirmTitle: 'Удалить эту запись?',
    deleteConfirmMessage: 'Это действие необратимо.',
    deleteConfirm: 'Удалить',
    deleteCancel: 'Отмена',
    deleteAction: 'Удалить',
  },

  settings: {
    title: 'Настройки',
    languageSection: 'ЯЗЫК',
    languageLabel: 'Язык приложения',
    languageEn: 'English',
    languageRu: 'Русский',
    timezoneSection: 'ЧАСОВОЙ ПОЯС',
    timezoneLabel: 'Определённый часовой пояс',
    apiKeySection: 'API КЛЮЧ',
    apiKeyLabel: 'Ключ astrology-api.io',
    apiKeyPlaceholder: 'Введите ваш API ключ',
    apiKeySourcePersonal: 'Используется: личный ключ',
    apiKeySourceDefault: 'Используется: ключ приложения',
    apiKeyRemove: 'Удалить ключ',
    apiKeySave: 'Сохранить ключ',
    questionCountSection: 'ИСПОЛЬЗОВАНИЕ',
    questionCountLabel: 'Вопросов в этом месяце',
    questionCountReset: 'Сбросится {{date}}',
  },

  onboarding: {
    step1Title: 'AstraSk',
    step1Subtitle: 'Задай искренний вопрос. Небо ответит.',
    step2Title: 'Как это работает',
    step2Point1: 'Задай искренний, конкретный вопрос',
    step2Point2: 'Небо строит твою гороскопическую карту',
    step2Point3: 'Получи ответ мгновенно',
    step3Title: 'Доступ к геолокации',
    step3Body:
      'Твоё точное местоположение в момент вопроса является частью гороскопической карты. Мы используем его только для построения карты.',
    step3Button: 'Разрешить геолокацию',
    step4Title: 'Твой API ключ',
    step4Body:
      'Есть ли у тебя собственный ключ astrology-api.io? Можешь пропустить этот шаг.',
    step4Skip: 'Пропустить',
    step4Enter: 'Ввести ключ',
    getStarted: 'Начать',
    next: 'Далее',
    skip: 'Пропустить',
  },

  verdictTypes: {
    YES: 'ДА',
    NO: 'НЕТ',
    MAYBE: 'ВОЗМОЖНО',
    UNCLEAR: 'НЕЯСНО',
  },

  confidence: {
    high: 'ВЫСОКАЯ',
    medium: 'СРЕДНЯЯ',
    low: 'НИЗКАЯ',
  },

  dignity: {
    domicile: 'Домицилий',
    exaltation: 'Экзальтация',
    detriment: 'Дебилитация',
    fall: 'Падение',
  },

  errors: {
    noInternet: 'Нет подключения к интернету. Проверьте сеть и попробуйте снова.',
    apiError: 'Что-то пошло не так. Пожалуйста, попробуйте снова.',
    timeout: 'Сервер слишком долго не отвечает. Пожалуйста, попробуйте снова.',
    locationDenied: 'Нужен доступ к геолокации — нажмите, чтобы открыть Настройки.',
    locationDetecting: 'Определение местоположения...',
    emptyQuestion: 'Пожалуйста, введите вопрос перед отправкой.',
    questionTooShort: 'Вопрос должен содержать не менее {{min}} символов.',
    questionTooLong: 'Вопрос не может превышать {{max}} символов.',
    rateLimited: 'Превышен лимит запросов к API. Пожалуйста, подождите перед следующим вопросом.',
    asyncStorageError: 'Не удалось загрузить сохранённые данные.',
    storageError: 'Не удалось сохранить данные.',
  },

  a11y: {
    askButton: 'Спроси звёзды. Отправить гороскопический вопрос.',
    verdictCard: 'Приговор {{verdict}}. Уверенность: {{confidence}}.',
    journalEntry: 'Приговор {{verdict}} для вопроса: {{question}}. Дата: {{date}}.',
    homeTab: 'Задать вопрос, вкладка',
    journalTab: 'Журнал, вкладка',
    settingsTab: 'Настройки, вкладка',
    backButton: 'Назад',
    settingsIcon: 'Открыть настройки',
  },
} as const;

export default ru;
