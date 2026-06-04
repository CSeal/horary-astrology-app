// src/i18n/de.ts
// Deutsche Zeichenketten. Alle JSX-Texte müssen diese Schlüssel über t('key') referenzieren.
// Keine fest kodierten Zeichenketten in Komponenten.

const de = {
  // App name
  appName: 'AstraSk',
  appTagline: 'Stelle eine aufrichtige Frage. Der Himmel wird antworten.',

  // Home screen
  home: {
    title: 'Die Sterne fragen',
    inputPlaceholder: 'Stelle eine aufrichtige, konkrete Frage...',
    inputHint: 'z. B. Werde ich diesen Monat das Stellenangebot bekommen?',
    submitButton: 'Die Sterne fragen',
    castingChart: 'Den Himmel lesen…',
    categoryLabel: 'Fragentyp',
    subCategoryLabel: 'Frage präzisieren',
    subjectRoleLabel: 'Frage für',
    locationLabel: 'Standort wird ermittelt...',
    locationManual: '· manuell',
    locationGps: '· GPS',
    locationDefault: '· Standard',
    locationSet: 'Tippen, um Standort festzulegen',
    changeLocation: 'Ändern',
    questionLimitBanner: 'Du hast dein monatliches Fragenlimit erreicht. Unbegrenzter Zugang kommt bald.',
    charCount: '{{count}} / {{max}}',
  },

  // Subcategories per category
  subcategories: {
    will_conceive: 'Werde ich schwanger werden?',
    will_have_children: 'Werde ich Kinder haben?',
    boy_or_girl: 'Junge oder Mädchen?',
    safe_delivery: 'Sichere Entbindung?',
    ivf_success: 'Wird die IVF erfolgreich sein?',
    marriage: 'Wird es eine Heirat geben?',
    fidelity: 'Ist der Partner treu?',
    rival: 'Gibt es einen Rivalen?',
    breakup: 'Werden wir uns trennen?',
    who_interested: 'Wer ist mehr interessiert?',
    compatibility: 'Sind wir kompatibel?',
    will_marry: 'Werden wir heiraten?',
    marriage_happy: 'Glückliche Ehe?',
    reconciliation: 'Werden wir uns versöhnen?',
    get_position: 'Werde ich die Stelle bekommen?',
    project_success: 'Wird das Projekt erfolgreich sein?',
    reputation: 'Was ist mein Ruf?',
    authority_favorable: 'Ist die Autorität wohlgesonnen?',
    get_job: 'Werde ich die Stelle bekommen?',
    keep_job: 'Werde ich meinen Job behalten?',
    gain: 'Werde ich Geld erhalten?',
    debt_repaid: 'Wird die Schuld zurückgezahlt?',
    inheritance: 'Werde ich ein Erbe bekommen?',
    should_invest: 'Sollte ich investieren?',
    will_become_wealthy: 'Werde ich wohlhabend werden?',
    will_recover: 'Werde ich genesen?',
    is_dangerous: 'Ist die Krankheit gefährlich?',
    nature_of_illness: 'Natur der Krankheit?',
    treatment_good: 'Ist die Behandlung gut?',
    when_crisis: 'Wann ist die Krise?',
    will_find: 'Werde ich es finden?',
    where_is: 'Wo ist es?',
    who_stole: 'Wer hat es gestohlen?',
    will_return: 'Wird es zurückgegeben?',
    stolen_or_lost: 'Gestohlen oder verloren?',
    safe_journey: 'Sichere Reise?',
    profitable: 'Gewinnbringende Reise?',
    should_emigrate: 'Sollte ich auswandern?',
    yes_no: 'Allgemeines Ja / Nein',
  },

  // Subject roles — whose perspective the question is asked from
  subjectRoles: {
    self: 'Für mich selbst',
    spouse_partner: 'Für Partner',
    third_party_friend: 'Für Freund',
    third_party_employer: 'Für Arbeitgeber',
    third_party_parent: 'Für Elternteil',
    third_party_child: 'Für Kind',
    third_party_other: 'Für andere Person',
  },

  // Horary question categories (POST /api/v3/horary/analyze)
  categories: {
    general: 'Allgemein',
    love: 'Liebe',
    marriage: 'Heirat',
    career: 'Karriere',
    job: 'Beruf',
    money: 'Finanzen',
    health: 'Gesundheit',
    pregnancy: 'Schwangerschaft',
    fertility: 'Fruchtbarkeit',
    missing_item: 'Verlorener Gegenstand',
    travel: 'Reise',
  },

  // Location picker (bottom sheet for manual override)
  locationPicker: {
    title: 'Standort festlegen',
    detected: 'Per GPS ermittelt',
    hint: 'Nutze deinen aktuellen Standort — nicht den Ort der Person, über die du fragst.',
    search: 'Stadt suchen...',
    searching: 'Suche läuft...',
    noResults: 'Keine Städte gefunden.',
    error: 'Suche momentan nicht möglich. Überprüfe deine Verbindung.',
    useGps: 'GPS-Standort verwenden',
    attribution: 'Daten © OpenStreetMap-Mitwirkende',
  },

  // Verdict screen
  verdict: {
    title: 'Die Sterne sprechen',
    summaryHeader: 'Die Planeten sagen:',
    summaryHeaderUnclear: 'Was das Horoskop zeigt:',
    significatorsHeader: 'Signifikatoren',
    significatorsToggle: 'Die Planeten sagen',
    radicalityNote: 'Dieses Stundenhoroskop ist nicht radikal — der Himmel ist noch nicht bereit, diese Frage zu beantworten. Warte eine Weile und frage erneut.',
    vocNote:
      'Der Mond ist kurslos. Dies bedeutet oft „aus der Sache wird nichts" — aber das Horoskop zeigt dennoch die Situation, wie sie gerade steht.',
    lowConfidenceNote:
      'Das Horoskop zeigt gemischte Hinweise — behandle diese Antwort als allgemeine Tendenz, nicht als Gewissheit.',
    chartUnclear: 'Horoskop unklar',
    backButton: 'Zurück',
    // Phase 1.5 — C+ verdict layout
    backJournal: 'Chroniken',
    fullReadingTitle: 'Vollständige Deutung',
    chartStrengthLabel: 'Horoskop-Stärke',
    chartStrengthStrong: 'Ein starkes Horoskop — gut geeignet zur Beurteilung.',
    chartStrengthBorderline: 'Grenzwertig radikal — das Horoskop ist zur Beurteilung geeignet, aber nicht eindeutig.',
    chartStrengthWeak: 'Das Horoskop ist schwach — lies das Urteil mit Vorsicht.',
    vocMoonTitle: 'Der Mond ist kurslos',
    vocVoidPill: 'KURSLOS',
    vocSignLabel: 'Zeichen',
    vocToChangeLabel: 'Bis Zeichenwechsel',
    vocNextLabel: 'Als Nächstes',
    vocExceptionNote: 'Eine Ausnahme greift. Der Mond steht in {{sign}} — einem von Lillys Zeichen, in denen ein kursloser Mond dennoch etwas bewirken kann. Behandle es als Verzögerung, nicht als Absage.',
    timingWhen: 'Wann könnte dies geschehen?',
    timingEstimate: '≈ {{value}} {{unit}}',
    timingUnit: { days: 'Tage', weeks: 'Wochen', months: 'Monate', years: 'Jahre' },
    timingScale: { days: 'TAGE', weeks: 'WOCHEN', months: 'MONATE' },
    perfectionLabel: 'Perfektionen',
    aspectApplying: 'Anwendend',
    aspectCaution: 'Vorsicht',
    aspectPast: 'Vergangen',
    aspectApplyingSub: 'anwendend · vollendet in {{deg}}',
    aspectPastSub: 'trennend · {{deg}} vergangen',
    showAllAspects: 'Alle {{count}} Aspekte anzeigen',
    showFewerAspects: 'Weniger anzeigen',
    seeFullReading: 'Die vollständige Deutung ansehen',
    fullReadingHint: 'Signifikatoren · Perfektionen · Zeitpunkt',
    askAgain: '✦ Erneut fragen, wenn bereit',
  },

  // Aspect type names (used in AspectRow)
  aspectTypes: {
    conjunction: 'Konjunktion',
    opposition: 'Opposition',
    trine: 'Trigon',
    square: 'Quadrat',
    sextile: 'Sextil',
  },

  // Journal screen
  journal: {
    title: 'Chroniken',
    emptyTitle: 'Die Schriftrolle ist leer.',
    emptySubtitle: 'Stelle deine erste Frage, um deine Chronik zu beginnen.',
    emptyButton: 'Die Sterne fragen',
    deleteConfirmTitle: 'Diese Deutung löschen?',
    deleteConfirmMessage: 'Dies kann nicht rückgängig gemacht werden.',
    deleteConfirm: 'Löschen',
    deleteCancel: 'Abbrechen',
    deleteAction: 'Löschen',
  },

  // Settings screen
  settings: {
    title: 'Mein Almanach',
    appVersion: 'Version {{version}}',
    languageSection: 'SPRACHE',
    languageLabel: 'App-Sprache',
    zodiacSection: 'TIERKREIS',
    zodiacLabel: 'Tierkreistyp',
    zodiacTropic: 'Tropisch',
    zodiacSidereal: 'Siderisch',
    zodiacTropicHint: 'Westlicher Astrologiestandard. Planeten werden relativ zu den Jahreszeiten positioniert.',
    zodiacSiderealHint: 'Vedische (Jyotish) Astrologie. Nutzt die tatsächlichen Sternpositionen (~23° Verschiebung).',
    timezoneSection: 'ZEITZONE',
    timezoneLabel: 'Erkannte Zeitzone',
    timezoneHint: 'Schreibgeschützt — vom Gerät festgelegt. Alle Horoskope werden für diese Zeitzone erstellt.',
    locationSection: 'STANDORT',
    locationSourceLabel: 'Standortquelle',
    locationSourceDevice: 'Geräte-GPS',
    locationSourceManual: 'Stadt festlegen',
    locationDeviceHint:
      'Nutzt GPS beim Fragen; greift auf deine Standardstadt zurück, wenn GPS nicht verfügbar ist.',
    locationManualHint: 'Verwendet immer deine gewählte Stadt für jede Frage.',
    locationCityLabel: 'Standardstadt',
    locationNoCity: 'Noch keine Stadt ausgewählt',
    locationChooseCity: 'Stadt wählen',
    locationChangeCity: 'Ändern',
    apiKeySection: 'API-SCHLÜSSEL',
    apiKeyLabel: 'astrology-api.io-Schlüssel',
    apiKeyPlaceholder: 'API-Schlüssel eingeben',
    apiKeySourcePersonal: 'Verwendet: persönlicher Schlüssel',
    apiKeySourceDefault: 'Verwendet: App-Standard',
    apiKeyRemove: 'Schlüssel entfernen',
    apiKeySave: 'Schlüssel speichern',
    apiKeyEdit: 'Bearbeiten',
  },

  // Onboarding
  onboarding: {
    step1Title: 'AstraSk',
    step1Subtitle: 'Stelle eine aufrichtige Frage. Der Himmel wird antworten.',
    step2Title: 'Der Weg einer Frage',
    step2Point1: 'Stelle eine aufrichtige, konkrete Frage',
    step2Point2: 'Der Himmel erstellt dein Stundenhoroskop',
    step2Point3: 'Erhalte sofort dein Urteil',
    step3Title: 'Standort erlauben',
    step3Body:
      'Dein genauer Standort im Moment des Fragens ist Teil des Stundenhoroskops. Wir nutzen ihn nur zur Erstellung deines Horoskops.',
    step3Privacy: 'Wir speichern oder teilen deine Standortdaten niemals.',
    step3Button: 'Standort erlauben',
    step3SkipButton: 'Ohne Standort fortfahren',
    step4Title: 'Dein API-Schlüssel',
    step4Body:
      'Hast du deinen eigenen astrology-api.io-Schlüssel? Du kannst diesen Schritt überspringen.',
    step4Skip: 'Überspringen',
    step4Enter: 'Schlüssel eingeben',
    step2HowAsk: 'Fragen',
    step2HowCast: 'Horoskop',
    step2HowVerdict: 'Urteil',
    getStarted: 'Die Reise beginnen',
    next: 'Weiter',
    back: 'Zurück',
    skip: 'Überspringen',
    finish: 'Die Sterne fragen',
  },

  // Planet names
  planets: {
    Sun: 'Sonne',
    Moon: 'Mond',
    Mercury: 'Merkur',
    Venus: 'Venus',
    Mars: 'Mars',
    Jupiter: 'Jupiter',
    Saturn: 'Saturn',
    Uranus: 'Uranus',
    Neptune: 'Neptun',
    Pluto: 'Pluto',
    NorthNode: 'Nordknoten',
    SouthNode: 'Südknoten',
    Chiron: 'Chiron',
    Ascendant: 'Aszendent',
    Midheaven: 'Mitthimmel',
  },

  // Significator roles
  significatorRoles: {
    querent: 'Du (Fragesteller)',
    quesited: 'Das Ziel (Befragtes)',
    moon: 'Der Mond',
    additional: 'Zusätzlich',
  },

  // Verdict types
  verdictTypes: {
    YES: 'JA',
    NO: 'NEIN',
    MAYBE: 'VIELLEICHT',
    UNCLEAR: 'UNKLAR',
  },

  // Confidence bands
  confidence: {
    high: 'HOCH',
    medium: 'MITTEL',
    low: 'NIEDRIG',
  },

  // Dignity labels
  dignity: {
    domicile: 'Domizil',
    exaltation: 'Exaltation',
    detriment: 'Exil',
    fall: 'Fall',
  },

  // Error messages
  errors: {
    noInternet: 'Keine Internetverbindung. Bitte überprüfe dein Netzwerk und versuche es erneut.',
    apiError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    timeout: 'Der Server hat zu lange gebraucht, um zu antworten. Bitte versuche es erneut.',
    locationDenied: 'Standortzugriff erforderlich — tippe, um die Einstellungen zu öffnen.',
    locationDetecting: 'Standort wird ermittelt...',
    emptyQuestion: 'Bitte gib eine Frage ein, bevor du fragst.',
    questionTooShort: 'Deine Frage muss mindestens {{min}} Zeichen lang sein.',
    questionTooLong: 'Deine Frage darf {{max}} Zeichen nicht überschreiten.',
    rateLimited: 'Du hast das API-Ratenlimit erreicht. Bitte warte, bevor du erneut fragst.',
    asyncStorageError: 'Gespeicherte Daten konnten nicht geladen werden.',
    storageError: 'Deine Daten konnten nicht gespeichert werden.',
    geocodeError: 'Städtesuche nicht möglich. Überprüfe deine Verbindung.',
  },

  // Developer debug mode (hidden behind PIN)
  debug: {
    title: 'Entwicklermodus',
    pinHint: 'Entwickler-PIN eingeben, um fortzufahren.',
    pinError: 'Falsche PIN.',
    unlock: 'Entsperren',
    stateSection: 'ZUSTAND',
    stateSectionHint: 'Setzt nur lokale Gerätedaten zurück — keine serverseitigen Auswirkungen.',
    clearJournal: 'Alle Journaleinträge löschen',
    clearJournalHint: 'Löscht dauerhaft alle auf diesem Gerät gespeicherten Deutungen.',
    clearJournalConfirm: 'Alle Journaleinträge löschen?',
    clearLabel: 'Löschen',
    lockLabel: 'Debugmodus sperren',
    maybeOnlyHint: 'VIELLEICHT ist nur im Mock-Modus verfügbar — die echte API gibt ja / nein / unklar / später_erneut_fragen zurück.',
    navigationSection: 'NAVIGATION',
    navigationSectionHint: 'Direkt zu bestimmten App-Zuständen navigieren, ohne manuelle Schritte.',
    resetOnboarding: 'Einführung zurücksetzen',
    resetOnboardingHint: 'Zeigt den Erststart-Ablauf beim nächsten App-Neustart.',
    triggerForceUpdate: 'Pflichtupdate-Bildschirm auslösen',
    triggerForceUpdateHint: 'Simuliert ein obligatorisches Update-Gate — nützlich zum Testen der Gate-Oberfläche.',
    mockApiSection: 'MOCK-API',
    mockApiSectionHint: 'Umgeht die echte API — keine Netzwerkanfragen oder Guthaben werden verbraucht.',
    mockApiToggle: 'API-Antworten simulieren',
    mockApiToggleHint: 'Gibt sofort ein gefälschtes Urteil zurück. Wähle unten das gewünschte Urteil.',
    performanceSection: 'LEISTUNG',
    performanceSectionHint: 'Timing-Verhalten für schnellere UI-Iteration anpassen.',
    skipLoadingDelay: 'Minimale Ladezeit überspringen',
    skipLoadingDelayHint: 'Entfernt die künstliche Wartezeit von 1,5 s, damit das Ergebnis sofort erscheint.',
  },

  // Force-update gate
  forceUpdate: {
    title: 'Update erforderlich',
    body: 'Ein kritisches Update ist verfügbar. Bitte aktualisiere die App, um AstraSk weiter zu nutzen.',
    cta: 'Jetzt aktualisieren',
  },

  // Accessibility labels
  a11y: {
    askButton: 'Die Sterne fragen. Stundenhoroskop-Frage einreichen.',
    verdictCard: '{{verdict}} Urteil. Konfidenz: {{confidence}}.',
    journalEntry: '{{verdict}} Urteil für Frage: {{question}}. Datum: {{date}}.',
    homeTab: 'Fragen',
    journalTab: 'Chroniken',
    settingsTab: 'Almanach',
    backButton: 'Zurück',
    settingsIcon: 'Einstellungen öffnen',
    openLocationPicker: 'Standort ändern',
    clearOverride: 'Auf GPS-Standort zurücksetzen',
  },
} as const;

export default de;
