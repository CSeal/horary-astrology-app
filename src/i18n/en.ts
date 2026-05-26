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
    locationLabel: 'Detecting location...',
    questionCounter: 'Questions this month: {{count}} / {{limit}}',
    questionLimitBanner:
      "You've used your {{limit}} free questions this month. Unlimited access is coming soon.",
    charCount: '{{count}} / {{max}}',
  },

  // Verdict screen
  verdict: {
    title: 'The Answer',
    summaryHeader: 'The Planets Say:',
    summaryHeaderUnclear: 'What the Chart Shows:',
    significatorsHeader: 'Significators',
    significatorsToggle: 'The Planets Say',
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
    languageSection: 'LANGUAGE',
    languageLabel: 'App Language',
    languageEn: 'English',
    languageRu: 'Русский',
    timezoneSection: 'TIMEZONE',
    timezoneLabel: 'Detected Timezone',
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
    step3Button: 'Allow Location',
    step4Title: 'Your API Key',
    step4Body:
      'Do you have your own astrology-api.io key? You can skip this for now.',
    step4Skip: 'Skip',
    step4Enter: 'Enter Key',
    getStarted: 'Get Started',
    next: 'Next',
    skip: 'Skip',
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
  },
} as const;

export default en;
