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
    questionCounter: 'Consultas a las estrellas: {{count}} / {{limit}}',
    questionLimitBanner:
      'Has usado tus {{limit}} preguntas gratuitas de este mes. Acceso ilimitado próximamente.',
    charCount: '{{count}} / {{max}}',
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
    questionCountSection: 'USO',
    questionCountLabel: 'Consultas a las estrellas',
    questionCountReset: 'Se reinicia el {{date}}',
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
    resetCounter: 'Reiniciar contador mensual → 0',
    resetCounterHint:
      'Permite probar el flujo de preguntas sin alcanzar el límite mensual.',
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

  // Accessibility labels
  a11y: {
    askButton: 'Preguntar a las estrellas. Envía tu pregunta horaria.',
    verdictCard: 'Veredicto {{verdict}}. Confianza: {{confidence}}.',
    journalEntry:
      'Veredicto {{verdict}} para la pregunta: {{question}}. Fecha: {{date}}.',
    homeTab: 'Preguntar',
    journalTab: 'Crónicas',
    settingsTab: 'Almanaque',
    backButton: 'Volver',
    settingsIcon: 'Abrir ajustes',
    openLocationPicker: 'Cambiar ubicación',
    clearOverride: 'Restablecer a ubicación GPS',
  },
} as const;

export default es;
