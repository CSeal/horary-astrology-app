// src/i18n/es.ts
// Mapa de cadenas en español. Todo texto JSX debe referenciar estas claves via t('key').
// Sin cadenas codificadas en los componentes.

const es = {
  // App name
  appName: 'AstraSk',
  appTagline: 'Haz una pregunta sincera. El cielo responderá.',

  // Home screen
  home: {
    title: 'Preguntar a las estrellas',
    inputPlaceholder: 'Haz una pregunta sincera y específica...',
    inputHint: 'Ej: ¿Recibiré la oferta de trabajo este mes?',
    submitButton: 'Preguntar a las estrellas',
    castingChart: 'Leyendo el cielo…',
    categoryLabel: 'Tipo de pregunta',
    subCategoryLabel: 'Especifica tu pregunta',
    subjectRoleLabel: 'Preguntando para',
    locationLabel: 'Detectando ubicación...',
    locationManual: '· manual',
    locationGps: '· GPS',
    locationDefault: '· predeterminado',
    locationSet: 'Toca para establecer tu ubicación',
    changeLocation: 'Cambiar',
    questionLimitBanner: 'Has alcanzado tu límite mensual de preguntas. Acceso ilimitado próximamente.',
    charCount: '{{count}} / {{max}}',
    locationDeniedPickCity: 'Acceso a ubicación denegado — elige una ciudad para continuar',
    chooseCity: 'Elegir ciudad',
    noApiKeyBanner: 'Clave API no configurada',
    noApiKeyAction: 'Configurar →',
  },

  // Subcategories per category
  subcategories: {
    will_conceive: '¿Quedaré embarazada?',
    will_have_children: '¿Tendré hijos?',
    boy_or_girl: '¿Niño o niña?',
    safe_delivery: '¿Parto seguro?',
    ivf_success: '¿Tendrá éxito la FIV?',
    marriage: '¿Habrá matrimonio?',
    fidelity: '¿Es fiel la pareja?',
    rival: '¿Hay un rival?',
    breakup: '¿Nos separaremos?',
    who_interested: '¿Quién está más interesado?',
    compatibility: '¿Somos compatibles?',
    will_marry: '¿Nos casaremos?',
    marriage_happy: '¿Matrimonio feliz?',
    reconciliation: '¿Nos reconciliaremos?',
    get_position: '¿Conseguiré el cargo?',
    project_success: '¿El proyecto tendrá éxito?',
    reputation: '¿Cuál es mi reputación?',
    authority_favorable: '¿La autoridad es favorable?',
    get_job: '¿Conseguiré el trabajo?',
    keep_job: '¿Mantendré mi trabajo?',
    gain: '¿Recibiré dinero?',
    debt_repaid: '¿Se pagará la deuda?',
    inheritance: '¿Recibiré herencia?',
    should_invest: '¿Debo invertir?',
    will_become_wealthy: '¿Me volveré próspero?',
    will_recover: '¿Me recuperaré?',
    is_dangerous: '¿La enfermedad es peligrosa?',
    nature_of_illness: '¿Naturaleza de la enfermedad?',
    treatment_good: '¿El tratamiento es bueno?',
    when_crisis: '¿Cuándo es la crisis?',
    will_find: '¿Lo encontraré?',
    where_is: '¿Dónde está?',
    who_stole: '¿Quién lo robó?',
    will_return: '¿Será devuelto?',
    stolen_or_lost: '¿Robado o perdido?',
    safe_journey: '¿Viaje seguro?',
    profitable: '¿Viaje provechoso?',
    should_emigrate: '¿Debo emigrar?',
    yes_no: 'Sí / no general',
  },

  // Subject roles — whose perspective the question is asked from
  subjectRoles: {
    self: 'Para mí',
    spouse_partner: 'Para la pareja',
    third_party_friend: 'Para un amigo',
    third_party_employer: 'Para el empleador',
    third_party_parent: 'Para el padre/madre',
    third_party_child: 'Para el hijo',
    third_party_other: 'Para otro',
  },

  // Horary question categories (POST /api/v3/horary/analyze)
  categories: {
    general: 'General',
    love: 'Amor',
    marriage: 'Matrimonio',
    career: 'Carrera',
    job: 'Trabajo',
    money: 'Dinero',
    health: 'Salud',
    pregnancy: 'Embarazo',
    fertility: 'Fertilidad',
    missing_item: 'Objeto perdido',
    travel: 'Viaje',
  },

  // Location picker (bottom sheet for manual override)
  locationPicker: {
    title: 'Establecer ubicación',
    detected: 'Detectada por GPS',
    hint: 'Usa tu ubicación actual, no la ciudad de la persona sobre quien preguntas.',
    search: 'Buscar ciudad...',
    searching: 'Buscando...',
    noResults: 'No se encontraron ciudades.',
    error: 'No se pudo buscar ahora. Verifica tu conexión.',
    useGps: 'Usar ubicación GPS',
    attribution: 'Datos © OpenStreetMap contributors',
  },

  // Verdict screen
  verdict: {
    title: 'Las Estrellas Hablan',
    summaryHeader: 'Los Planetas Dicen:',
    summaryHeaderUnclear: 'Lo que Muestra la Carta:',
    significatorsHeader: 'Significadores',
    significatorsToggle: 'Los Planetas Dicen',
    radicalityNote:
      'Esta carta no es radical — el cielo aún no está listo para responder esta pregunta. Espera un momento y pregunta de nuevo.',
    vocNote:
      'La Luna está vacía de curso. Esto suele significar que "nada saldrá del asunto" — pero la carta aún muestra la situación tal como está.',
    lowConfidenceNote:
      'La carta muestra indicaciones mixtas — trata esta respuesta como una tendencia general, no una certeza.',
    chartUnclear: 'Carta Incierta',
    backButton: 'Volver',
    // Phase 1.5 — C+ verdict layout
    backJournal: 'Crónicas',
    fullReadingTitle: 'Lectura Completa',
    chartTitle: 'Tema Horario',
    chartStrengthLabel: 'Fuerza de la Carta',
    chartStrengthStrong: 'Una carta fuerte — bien dispuesta para juzgar.',
    chartStrengthBorderline: 'Radicalidad límite — la carta es apta para juzgar, pero no con fuerza.',
    chartStrengthWeak: 'La carta es débil — interpreta el veredicto con cautela.',
    testimonyTitle: 'Testimonios',
    testimonyNeutral: '○ {{n}} neutro',
    vocMoonTitle: 'La Luna está Vacía de Curso',
    vocVoidPill: 'VACÍA',
    vocSignLabel: 'Signo',
    vocToChangeLabel: 'Para cambio de signo',
    vocNextLabel: 'Siguiente',
    vocExceptionNote: 'Se aplica una excepción. La Luna está en {{sign}} — uno de los signos de Lilly donde una Luna vacía aún puede actuar algo. Considéralo como retraso, no negación.',
    timingWhen: '¿Cuándo podría ocurrir esto?',
    timingEstimate: '≈ {{value}} {{unit}}',
    timingUnit: { days: 'días', weeks: 'semanas', months: 'meses', years: 'años' },
    timingScale: { days: 'DÍAS', weeks: 'SEM.', months: 'MESES' },
    perfectionLabel: 'Perfecciones',
    aspectApplying: 'Aplicando',
    aspectCaution: 'Precaución',
    aspectPast: 'Pasado',
    aspectApplyingSub: 'aplicando · perfecciona en {{deg}}',
    aspectPastSub: 'separando · {{deg}} atrás',
    showAllAspects: 'Mostrar los {{count}} aspectos',
    showFewerAspects: 'Mostrar menos',
    seeFullReading: 'Ver la lectura completa',
    fullReadingHint: 'Significadores · Perfecciones · Tiempo',
    askAgain: '✦ Pregunta de nuevo cuando estés listo',
    receptionTitle: 'Recepción',
    receptionMutual: 'MUTUA',
    receptionOneWay: 'UNIDIREC.',
    perfectionTitle: 'Camino de Perfección',
    perfectionEnables: 'PERMITE',
    perfectionBlocks: 'BLOQUEA',
    keyFactorsTitle: 'Factores Clave',
    radicalityChecksTitle: 'Verificaciones de Radicalidad',
    radicalityShowAll: 'mostrar todo ({{count}})',
    radicalityShowFewer: 'mostrar menos',
    radicalitySeverity: {
      severe: 'Severa',
      moderate: 'Moderada',
      mild: 'Leve',
    },
    timingBasedOn: 'Basado en: {{text}}',
    timingConfidence: {
      very_high: 'Confianza Muy Alta',
      high: 'Confianza Alta',
      medium: 'Confianza Media',
      low: 'Confianza Baja',
      very_low: 'Confianza Muy Baja',
    },
    vocTreatmentMitigated: 'VOC mitigado por aspecto aplicado',
    vocTreatmentNegation: 'VOC — la carta se inclina hacia la negación',
    vocTreatmentIgnored: 'VOC descartado — aspecto directo perfecciona',
    moonToQuesited: '☽ → {{planet}} {{aspect}} ({{deg}}°)',
    pathDirect: 'DIRECTO',
    pathSupported: 'APOYADO',
    pathChallenged: 'DESAFIADO',
    pathMixed: 'MIXTO',
  },

  // Accidental conditions (significator condition pills)
  conditions: {
    combust: 'combustión',
    cazimi: 'Cazimi',
    under_beams: 'bajo ☀',
  },

  // Aspect type names (used in AspectRow)
  aspectTypes: {
    conjunction: 'conjunción',
    opposition: 'oposición',
    trine: 'trígono',
    square: 'cuadratura',
    sextile: 'sextil',
  },

  // Journal screen
  journal: {
    title: 'Crónicas',
    emptyTitle: 'El pergamino está vacío.',
    emptySubtitle: 'Haz tu primera pregunta para comenzar tu crónica.',
    emptyButton: 'Preguntar a las estrellas',
    deleteConfirmTitle: '¿Eliminar esta lectura?',
    deleteConfirmMessage: 'Esta acción no se puede deshacer.',
    deleteConfirm: 'Eliminar',
    deleteCancel: 'Cancelar',
    deleteAction: 'Eliminar',
    outcomeLabel: 'Resultado',
    outcomeCameTrue: 'Se cumplió',
    outcomeDidNot: 'No sucedió',
    outcomePending: 'Pendiente',
  },

  // Outcome reminder push notifications
  notifications: {
    sectionTitle: 'Recordatorios de Resultado',
    enabled: 'Recordatorios',
    delayLabel: 'Recordarme después de',
    delay7: '7 días',
    delay14: '14 días',
    delay30: '30 días',
    hint: 'Te recordaremos que marques el resultado de las preguntas sin resultado registrado.',
    permissionDenied: 'Permite notificaciones en los Ajustes del dispositivo para habilitar recordatorios.',
    outcomeTitle: '¿Qué pasó?',
  },

  // Settings screen
  settings: {
    title: 'Mi almanaque',
    appVersion: 'Versión {{version}}',
    languageSection: 'IDIOMA',
    languageLabel: 'Idioma de la app',
    zodiacSection: 'ZODÍACO',
    zodiacLabel: 'Tipo de zodíaco',
    zodiacTropic: 'Tropical',
    zodiacSidereal: 'Sidéreo',
    zodiacTropicHint:
      'Estándar de la astrología occidental. Los planetas se posicionan en relación con las estaciones.',
    zodiacSiderealHint:
      'Astrología védica (Jyotish). Usa las posiciones reales de las estrellas (desplazamiento de ~23°).',
    timezoneSection: 'ZONA HORARIA',
    timezoneLabel: 'Zona horaria detectada',
    timezoneHint:
      'Solo lectura — establecida por tu dispositivo. Todas las cartas se trazan para esta zona horaria.',
    locationSection: 'UBICACIÓN',
    locationSourceLabel: 'Fuente de ubicación',
    locationSourceDevice: 'GPS del dispositivo',
    locationSourceManual: 'Establecer ciudad',
    locationDeviceHint:
      'Usa el GPS cuando preguntas; recurre a tu ciudad predeterminada si el GPS no está disponible.',
    locationManualHint: 'Siempre usa tu ciudad seleccionada para cada pregunta.',
    locationCityLabel: 'Ciudad predeterminada',
    locationNoCity: 'Ninguna ciudad seleccionada aún',
    locationChooseCity: 'Elegir ciudad',
    locationChangeCity: 'Cambiar',
    apiKeySection: 'CLAVE DE API',
    apiKeyLabel: 'Clave astrology-api.io',
    apiKeyPlaceholder: 'Introduce tu clave de API',
    apiKeySourcePersonal: 'Usando: clave personal',
    apiKeySourceDefault: 'Usando: predeterminada de la app',
    apiKeyRemove: 'Eliminar clave',
    apiKeySave: 'Guardar clave',
    apiKeyEdit: 'Editar',
    shareSection: 'COMPARTIR E INVITAR',
    inviteFriend: 'Invitar a un amigo',
    rateApp: 'Valorar AstraSk',
    inviteFriendTitle: 'Compartir AstraSk',
    inviteShareText:
      'Uso AstraSk para respuestas instantáneas de astrología horaria. Pruébalo gratis:',
  },

  // Onboarding
  onboarding: {
    step1Title: 'AstraSk',
    step1Subtitle: 'Haz una pregunta sincera. El cielo responderá.',
    step2Title: 'El Camino de una Pregunta',
    step2Point1: 'Haz una pregunta sincera y específica',
    step2Point2: 'El cielo traza tu carta horaria',
    step2Point3: 'Recibe tu veredicto al instante',
    step3Title: 'Permitir Ubicación',
    step3Body:
      'Tu ubicación exacta en el momento de preguntar forma parte de la carta horaria. Solo la usamos para trazar tu carta.',
    step3Privacy: 'Nunca almacenamos ni compartimos tus datos de ubicación.',
    step3Button: 'Permitir Ubicación',
    step3SkipButton: 'Continuar sin ubicación',
    step4Title: 'Tu Clave de API',
    step4Body:
      '¿Tienes tu propia clave de astrology-api.io? Puedes omitir esto por ahora.',
    step4Skip: 'Omitir',
    step4Enter: 'Introducir clave',
    step2HowAsk: 'Preguntar',
    step2HowCast: 'Carta',
    step2HowVerdict: 'Veredicto',
    getStarted: 'Comenzar el Viaje',
    next: 'Siguiente',
    back: 'Volver',
    skip: 'Omitir',
    finish: 'Preguntar a las estrellas',
    chronicleTitle: 'Tu Crónica',
    chronicleBody:
      'Cada pregunta es recordada. Tu crónica crece con cada lectura estelar.',
    chroniclePoint1: 'Sigue tu racha diaria',
    chroniclePoint2: 'Revisa todos los veredictos en tu diario',
    chroniclePoint3: 'Recuerda preguntas de este día, años atrás',
    apiKeyNote:
      'astrology-api.io calcula las cartas astrales. Crear una clave gratuita toma un minuto — o omítelo y usa la clave predeterminada de la app.',
  },

  // Planet names
  planets: {
    Sun: 'Sol',
    Moon: 'Luna',
    Mercury: 'Mercurio',
    Venus: 'Venus',
    Mars: 'Marte',
    Jupiter: 'Júpiter',
    Saturn: 'Saturno',
    Uranus: 'Urano',
    Neptune: 'Neptuno',
    Pluto: 'Plutón',
    NorthNode: 'Nodo Norte',
    SouthNode: 'Nodo Sur',
    Chiron: 'Quirón',
    Ascendant: 'Ascendente',
    Midheaven: 'Medio Cielo',
  },

  // Significator roles
  significatorRoles: {
    querent: 'Tú (consultante)',
    quesited: 'El objetivo (cuestionado)',
    moon: 'La Luna',
    additional: 'Adicional',
  },

  // Verdict types
  verdictTypes: {
    YES: 'SÍ',
    NO: 'NO',
    MAYBE: 'QUIZÁS',
    UNCLEAR: 'INCIERTO',
  },

  // Confidence bands
  confidence: {
    high: 'ALTA',
    medium: 'MEDIA',
    low: 'BAJA',
  },

  // Dignity labels
  dignity: {
    domicile: 'Domicilio',
    exaltation: 'Exaltación',
    detriment: 'Detrimento',
    fall: 'Caída',
  },

  // Error messages
  errors: {
    noInternet: 'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.',
    apiError: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    timeout: 'El servidor tardó demasiado en responder. Por favor, inténtalo de nuevo.',
    locationDenied: 'Se necesita acceso a la ubicación — toca para abrir Ajustes.',
    locationDetecting: 'Detectando tu ubicación...',
    emptyQuestion: 'Por favor, introduce una pregunta antes de enviar.',
    questionTooShort: 'Tu pregunta debe tener al menos {{min}} caracteres.',
    questionTooLong: 'Tu pregunta no puede superar los {{max}} caracteres.',
    invalidApiKey: 'Clave API faltante o inválida. Ve a Ajustes → Clave API.',
    rateLimited:
      'Has alcanzado el límite de solicitudes de la API. Espera antes de volver a preguntar.',
    asyncStorageError: 'No se pudieron cargar los datos guardados.',
    storageError: 'No se pudieron guardar tus datos.',
    geocodeError: 'No se pudieron buscar ciudades. Verifica tu conexión.',
  },

  // Developer debug mode (hidden behind PIN)
  debug: {
    title: 'Modo Desarrollador',
    pinHint: 'Introduce el PIN de desarrollador para continuar.',
    pinError: 'PIN incorrecto.',
    unlock: 'Desbloquear',
    stateSection: 'ESTADO',
    stateSectionHint:
      'Reinicia solo los datos locales del dispositivo — sin efectos en el servidor.',
    clearJournal: 'Borrar todas las entradas del diario',
    clearJournalHint:
      'Elimina permanentemente todas las lecturas guardadas en este dispositivo.',
    clearJournalConfirm: '¿Borrar todas las entradas del diario?',
    clearLabel: 'Borrar',
    lockLabel: 'Bloquear modo debug',
    maybeOnlyHint:
      'QUIZÁS es solo simulado — la API real devuelve sí / no / incierto / preguntar_después.',
    navigationSection: 'NAVEGACIÓN',
    navigationSectionHint:
      'Navega a estados específicos de la app sin pasos manuales.',
    resetOnboarding: 'Reiniciar incorporación',
    resetOnboardingHint:
      'Muestra el flujo de primer acceso en el próximo reinicio de la app.',
    triggerForceUpdate: 'Activar pantalla de actualización forzada',
    triggerForceUpdateHint:
      'Simula una barrera de actualización obligatoria — útil para probar la interfaz de la barrera.',
    mockApiSection: 'API SIMULADA',
    mockApiSectionHint:
      'Omite la API real — sin solicitudes de red ni créditos consumidos.',
    mockApiToggle: 'Simular respuestas de la API',
    mockApiToggleHint:
      'Devuelve un veredicto falso al instante. Elige el veredicto a continuación.',
    performanceSection: 'RENDIMIENTO',
    performanceSectionHint:
      'Ajusta el comportamiento de tiempos para una iteración de UI más rápida.',
    skipLoadingDelay: 'Omitir el retraso mínimo de carga',
    skipLoadingDelayHint:
      'Elimina la espera artificial de 1,5 s para que el resultado aparezca de inmediato.',
  },

  // Force-update gate
  forceUpdate: {
    title: 'Actualización Requerida',
    body: 'Hay una actualización crítica disponible. Actualiza la app para seguir usando AstraSk.',
    cta: 'Actualizar ahora',
  },

  // Streak badge
  streak: {
    badge_one: '🔥 {{count}} día consecutivo',
    badge_few: '🔥 {{count}} días consecutivos',
    badge_many: '🔥 {{count}} días consecutivos',
    badge_other: '🔥 {{count}} días consecutivos',
  },

  // On this day banner
  onThisDay: {
    title_one: 'En este día, hace un año',
    title_few: 'En este día, hace {{count}} años',
    title_many: 'En este día, hace {{count}} años',
    title_other: 'En este día, hace {{count}} años',
    markOutcome: 'marcar resultado',
    open: 'Abrir →',
  },

  // Statistics screen
  stats: {
    title: 'Mis Estadísticas',
    totalQuestions_one: '{{count}} pregunta',
    totalQuestions_few: '{{count}} preguntas',
    totalQuestions_many: '{{count}} preguntas',
    totalQuestions_other: '{{count}} preguntas',
    streakLabel: 'consecutivos',
    accuracyLabel: 'precisión',
    verdicts: 'Veredictos',
    outcomes: 'Resultados',
    outcomesSet: '{{set}} de {{total}} registrados',
    activity: 'Actividad (últimos 6 meses)',
    topCategories: 'Temas Principales',
    noData: 'Haz tu primera pregunta para ver estadísticas aquí.',
  },

  // Accessibility labels
  a11y: {
    askButton: 'Preguntar a las estrellas. Envía tu pregunta horaria.',
    verdictCard: 'Veredicto {{verdict}}. Confianza: {{confidence}}.',
    journalEntry:
      'Veredicto {{verdict}} para la pregunta: {{question}}. Fecha: {{date}}.',
    homeTab: 'Preguntar',
    journalTab: 'Crónicas',
    statsTab: 'Estadísticas',
    settingsTab: 'Almanaque',
    backButton: 'Volver',
    settingsIcon: 'Abrir ajustes',
    openLocationPicker: 'Cambiar ubicación',
    clearOverride: 'Restablecer a ubicación GPS',
  },
} as const;

export default es;
