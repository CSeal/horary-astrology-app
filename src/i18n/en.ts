// src/i18n/en.ts
// English string map. All JSX text must reference these keys via t('key').
// No hardcoded strings in components.

const en = {
  // App name
  appName: 'AstraSk',
  appTagline: 'Ask a sincere question. The sky will answer.',

  // Home screen
  home: {
    title: 'Ask the Stars',
    inputPlaceholder: 'Ask a sincere, specific question...',
    inputHint: 'e.g. Will I get the job offer this month?',
    submitButton: 'Ask the Stars',
    castingChart: 'Casting your chart…',
    categoryLabel: 'Question type',
    subCategoryLabel: 'Specify your question',
    subjectRoleLabel: 'Asking for',
    locationLabel: 'Detecting location...',
    locationManual: '· manual',
    locationGps: '· GPS',
    locationDefault: '· default',
    locationSet: 'Tap to set your location',
    changeLocation: 'Change',
    questionCounter: 'Questions this month: {{count}} / {{limit}}',
    questionLimitBanner:
      "You've used your {{limit}} free questions this month. Unlimited access is coming soon.",
    charCount: '{{count}} / {{max}}',
  },

  // Subcategories per category
  subcategories: {
    will_conceive: 'Will I conceive?',
    will_have_children: 'Will I have children?',
    boy_or_girl: 'Boy or girl?',
    safe_delivery: 'Safe delivery?',
    ivf_success: 'Will IVF succeed?',
    marriage: 'Will there be marriage?',
    fidelity: 'Is partner faithful?',
    rival: 'Is there a rival?',
    breakup: 'Will we break up?',
    who_interested: 'Who is more interested?',
    compatibility: 'Are we compatible?',
    will_marry: 'Will we get married?',
    marriage_happy: 'Happy marriage?',
    reconciliation: 'Will we reconcile?',
    get_position: 'Will I get the position?',
    project_success: 'Will the project succeed?',
    reputation: 'What is my reputation?',
    authority_favorable: 'Is authority favorable?',
    get_job: 'Will I get the job?',
    keep_job: 'Will I keep my job?',
    gain: 'Will I receive money?',
    debt_repaid: 'Will debt be repaid?',
    inheritance: 'Will I get inheritance?',
    should_invest: 'Should I invest?',
    will_become_wealthy: 'Will I become wealthy?',
    will_recover: 'Will I recover?',
    is_dangerous: 'Is the illness dangerous?',
    nature_of_illness: 'Nature of illness?',
    treatment_good: 'Is the treatment good?',
    when_crisis: 'When is the crisis?',
    will_find: 'Will I find it?',
    where_is: 'Where is it?',
    who_stole: 'Who stole it?',
    will_return: 'Will it be returned?',
    stolen_or_lost: 'Stolen or just lost?',
    safe_journey: 'Safe journey?',
    profitable: 'Profitable journey?',
    should_emigrate: 'Should I emigrate?',
    yes_no: 'General yes / no',
  },

  // Subject roles — whose perspective the question is asked from
  subjectRoles: {
    self: 'For myself',
    spouse_partner: 'For partner',
    third_party_friend: 'For friend',
    third_party_employer: 'For employer',
    third_party_parent: 'For parent',
    third_party_child: 'For child',
    third_party_other: 'For other',
  },

  // Horary question categories (POST /api/v3/horary/analyze)
  categories: {
    general: 'General',
    love: 'Love',
    marriage: 'Marriage',
    career: 'Career',
    job: 'Job',
    money: 'Money',
    health: 'Health',
    pregnancy: 'Pregnancy',
    fertility: 'Fertility',
    missing_item: 'Lost item',
    travel: 'Travel',
  },

  // Location picker (bottom sheet for manual override)
  locationPicker: {
    title: 'Set location',
    detected: 'Detected by GPS',
    hint: 'Use your current location — not the city of the person you are asking about.',
    search: 'Search city...',
    searching: 'Searching...',
    noResults: 'No cities found.',
    error: 'Could not search right now. Check your connection.',
    useGps: 'Use GPS location',
    attribution: 'Data © OpenStreetMap contributors',
  },

  // Verdict screen
  verdict: {
    title: 'The Answer',
    summaryHeader: 'The Planets Say:',
    summaryHeaderUnclear: 'What the Chart Shows:',
    significatorsHeader: 'Significators',
    significatorsToggle: 'The Planets Say',
    radicalityNote: 'This chart is not radical — the sky is not yet ready to answer this question. Wait a while and ask again.',
    vocNote:
      "The Moon is void-of-course. This often means 'nothing will come of the matter' — but the chart still shows the situation as it stands.",
    lowConfidenceNote:
      'The chart shows mixed indications — treat this answer as a general tendency, not a certainty.',
    chartUnclear: 'Chart Unclear',
    backButton: 'Back',
  },

  // Journal screen
  journal: {
    title: 'Journal',
    emptyTitle: 'No readings yet.',
    emptySubtitle: 'Ask your first question to begin your journal.',
    emptyButton: 'Ask a Question',
    deleteConfirmTitle: 'Delete this reading?',
    deleteConfirmMessage: 'This cannot be undone.',
    deleteConfirm: 'Delete',
    deleteCancel: 'Cancel',
    deleteAction: 'Delete',
  },

  // Settings screen
  settings: {
    title: 'Settings',
    appVersion: 'Version {{version}}',
    languageSection: 'LANGUAGE',
    languageLabel: 'App Language',
    languageEn: 'English',
    languageRu: 'Русский',
    zodiacSection: 'ZODIAC',
    zodiacLabel: 'Zodiac type',
    zodiacTropic: 'Tropical',
    zodiacSidereal: 'Sidereal',
    zodiacTropicHint: 'Western astrology standard. Planets are positioned relative to the seasons.',
    zodiacSiderealHint: 'Vedic (Jyotish) astrology. Uses the actual star positions (~23° shift).',
    timezoneSection: 'TIMEZONE',
    timezoneLabel: 'Detected Timezone',
    timezoneHint: 'Read-only — set by your device. All charts are cast for this timezone.',
    locationSection: 'LOCATION',
    locationSourceLabel: 'Location source',
    locationSourceDevice: 'Device GPS',
    locationSourceManual: 'Set city',
    locationDeviceHint:
      'Uses GPS when you ask; falls back to your default city if GPS is unavailable.',
    locationManualHint: 'Always uses your selected city for every question.',
    locationCityLabel: 'Default city',
    locationNoCity: 'No city selected yet',
    locationChooseCity: 'Choose city',
    locationChangeCity: 'Change',
    apiKeySection: 'API KEY',
    apiKeyLabel: 'astrology-api.io Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeySourcePersonal: 'Using: personal key',
    apiKeySourceDefault: 'Using: app default',
    apiKeyRemove: 'Remove key',
    apiKeySave: 'Save Key',
    questionCountSection: 'USAGE',
    questionCountLabel: 'Questions this month',
    questionCountReset: 'Resets {{date}}',
  },

  // Onboarding
  onboarding: {
    step1Title: 'AstraSk',
    step1Subtitle: 'Ask a sincere question. The sky will answer.',
    step2Title: 'How It Works',
    step2Point1: 'Ask a sincere, specific question',
    step2Point2: 'The sky casts your horary chart',
    step2Point3: 'Receive your verdict instantly',
    step3Title: 'Allow Location',
    step3Body:
      'Your exact location at the moment of asking is part of the horary chart. We only use it to cast your chart.',
    step3Privacy: 'We never store or share your location data.',
    step3Button: 'Allow Location',
    step3SkipButton: 'Continue without location',
    step4Title: 'Your API Key',
    step4Body:
      'Do you have your own astrology-api.io key? You can skip this for now.',
    step4Skip: 'Skip',
    step4Enter: 'Enter Key',
    step2HowAsk: 'Ask',
    step2HowCast: 'Cast',
    step2HowVerdict: 'Verdict',
    getStarted: 'Get Started',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    finish: 'Start Asking',
  },

  // Verdict types
  verdictTypes: {
    YES: 'YES',
    NO: 'NO',
    MAYBE: 'MAYBE',
    UNCLEAR: 'UNCLEAR',
  },

  // Confidence bands
  confidence: {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  },

  // Dignity labels
  dignity: {
    domicile: 'Domicile',
    exaltation: 'Exaltation',
    detriment: 'Detriment',
    fall: 'Fall',
  },

  // Error messages
  errors: {
    noInternet: 'No internet connection. Please check your network and try again.',
    apiError: 'Something went wrong. Please try again.',
    timeout: 'The server took too long to respond. Please try again.',
    locationDenied: 'Location access needed — tap to open Settings.',
    locationDetecting: 'Detecting your location...',
    emptyQuestion: 'Please enter a question before asking.',
    questionTooShort: 'Your question must be at least {{min}} characters.',
    questionTooLong: 'Your question cannot exceed {{max}} characters.',
    rateLimited: "You've reached the API rate limit. Please wait before asking again.",
    asyncStorageError: 'Could not load saved data.',
    storageError: 'Could not save your data.',
    geocodeError: 'Could not search for cities. Check your connection.',
  },

  // Developer debug mode (hidden behind PIN)
  debug: {
    title: 'Developer Mode',
    pinHint: 'Enter developer PIN to continue.',
    pinError: 'Incorrect PIN.',
    unlock: 'Unlock',
    stateSection: 'STATE',
    stateSectionHint: 'Resets local on-device data only — no server side effects.',
    resetCounter: 'Reset monthly counter → 0',
    resetCounterHint: 'Lets you test the ask flow without hitting the monthly limit.',
    clearJournal: 'Clear all journal entries',
    clearJournalHint: 'Permanently deletes all readings saved on this device.',
    clearJournalConfirm: 'Clear all journal entries?',
    clearLabel: 'Clear',
    lockLabel: 'Lock debug mode',
    navigationSection: 'NAVIGATION',
    navigationSectionHint: 'Navigate to specific app states without manual steps.',
    resetOnboarding: 'Reset onboarding',
    resetOnboardingHint: 'Shows the first-launch flow on next app restart.',
    triggerForceUpdate: 'Trigger force-update screen',
    triggerForceUpdateHint: 'Simulates a mandatory update gate — useful for testing the gate UI.',
    mockApiSection: 'MOCK API',
    mockApiSectionHint: 'Bypasses the real API — no network requests or credits consumed.',
    mockApiToggle: 'Mock API responses',
    mockApiToggleHint: 'Returns a fake verdict instantly. Choose which verdict below.',
    performanceSection: 'PERFORMANCE',
    performanceSectionHint: 'Tune timing behaviour for faster UI iteration.',
    skipLoadingDelay: 'Skip minimum loading delay',
    skipLoadingDelayHint: 'Removes the 1.5 s artificial wait so the result appears immediately.',
  },

  // Force-update gate
  forceUpdate: {
    title: 'Update Required',
    body: 'A critical update is available. Please update the app to continue using AstraSk.',
    cta: 'Update Now',
  },

  // Accessibility labels
  a11y: {
    askButton: 'Ask the Stars. Submit your horary question.',
    verdictCard: '{{verdict}} verdict. Confidence: {{confidence}}.',
    journalEntry: '{{verdict}} verdict for question: {{question}}. Date: {{date}}.',
    homeTab: 'Ask a question, tab',
    journalTab: 'Journal, tab',
    settingsTab: 'Settings, tab',
    backButton: 'Go back',
    settingsIcon: 'Open settings',
    openLocationPicker: 'Change location',
    clearOverride: 'Reset to GPS location',
  },
} as const;

export default en;
