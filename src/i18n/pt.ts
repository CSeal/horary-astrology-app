// src/i18n/pt.ts
// Mapa de strings em português (Brasil). Todo texto JSX deve referenciar estas chaves via t('key').
// Nenhuma string codificada nos componentes.

const pt = {
  // App name
  appName: 'AstraSk',
  appTagline: 'Faça uma pergunta sincera. O céu irá responder.',

  // Home screen
  home: {
    title: 'Perguntar às estrelas',
    inputPlaceholder: 'Faça uma pergunta sincera e específica...',
    inputHint: 'Ex: Vou receber a proposta de emprego este mês?',
    submitButton: 'Perguntar às estrelas',
    castingChart: 'Lendo o céu…',
    categoryLabel: 'Tipo de pergunta',
    subCategoryLabel: 'Especifique sua pergunta',
    subjectRoleLabel: 'Perguntando para',
    locationLabel: 'Detectando localização...',
    locationManual: '· manual',
    locationGps: '· GPS',
    locationDefault: '· padrão',
    locationSet: 'Toque para definir sua localização',
    changeLocation: 'Alterar',
    questionLimitBanner: 'Você atingiu o limite mensal de perguntas. Acesso ilimitado em breve.',
    charCount: '{{count}} / {{max}}',
  },

  // Subcategories per category
  subcategories: {
    will_conceive: 'Vou engravidar?',
    will_have_children: 'Vou ter filhos?',
    boy_or_girl: 'Menino ou menina?',
    safe_delivery: 'Parto seguro?',
    ivf_success: 'A FIV vai ter sucesso?',
    marriage: 'Vai haver casamento?',
    fidelity: 'O parceiro é fiel?',
    rival: 'Há um rival?',
    breakup: 'Vamos terminar?',
    who_interested: 'Quem está mais interessado?',
    compatibility: 'Somos compatíveis?',
    will_marry: 'Vamos nos casar?',
    marriage_happy: 'Casamento feliz?',
    reconciliation: 'Vamos nos reconciliar?',
    get_position: 'Vou conseguir o cargo?',
    project_success: 'O projeto vai ter sucesso?',
    reputation: 'Qual é minha reputação?',
    authority_favorable: 'A autoridade é favorável?',
    get_job: 'Vou conseguir o emprego?',
    keep_job: 'Vou manter meu emprego?',
    gain: 'Vou receber dinheiro?',
    debt_repaid: 'A dívida será paga?',
    inheritance: 'Vou receber herança?',
    should_invest: 'Devo investir?',
    will_become_wealthy: 'Vou prosperar?',
    will_recover: 'Vou me recuperar?',
    is_dangerous: 'A doença é grave?',
    nature_of_illness: 'Natureza da doença?',
    treatment_good: 'O tratamento é bom?',
    when_crisis: 'Quando é a crise?',
    will_find: 'Vou encontrar?',
    where_is: 'Onde está?',
    who_stole: 'Quem roubou?',
    will_return: 'Será devolvido?',
    stolen_or_lost: 'Roubado ou perdido?',
    safe_journey: 'Viagem segura?',
    profitable: 'Viagem proveitosa?',
    should_emigrate: 'Devo emigrar?',
    yes_no: 'Sim / não geral',
  },

  // Subject roles — whose perspective the question is asked from
  subjectRoles: {
    self: 'Para mim',
    spouse_partner: 'Para o parceiro',
    third_party_friend: 'Para amigo',
    third_party_employer: 'Para empregador',
    third_party_parent: 'Para pai/mãe',
    third_party_child: 'Para filho',
    third_party_other: 'Para outro',
  },

  // Horary question categories (POST /api/v3/horary/analyze)
  categories: {
    general: 'Geral',
    love: 'Amor',
    marriage: 'Casamento',
    career: 'Carreira',
    job: 'Emprego',
    money: 'Dinheiro',
    health: 'Saúde',
    pregnancy: 'Gravidez',
    fertility: 'Fertilidade',
    missing_item: 'Objeto perdido',
    travel: 'Viagem',
  },

  // Location picker (bottom sheet for manual override)
  locationPicker: {
    title: 'Definir localização',
    detected: 'Detectada pelo GPS',
    hint: 'Use sua localização atual — não a cidade da pessoa sobre quem você está perguntando.',
    search: 'Buscar cidade...',
    searching: 'Buscando...',
    noResults: 'Nenhuma cidade encontrada.',
    error: 'Não foi possível buscar agora. Verifique sua conexão.',
    useGps: 'Usar localização GPS',
    attribution: 'Dados © OpenStreetMap contributors',
  },

  // Verdict screen
  verdict: {
    title: 'As Estrelas Falam',
    summaryHeader: 'Os Planetas Dizem:',
    summaryHeaderUnclear: 'O que o Mapa Mostra:',
    significatorsHeader: 'Significadores',
    significatorsToggle: 'Os Planetas Dizem',
    radicalityNote:
      'Este mapa não é radical — o céu ainda não está pronto para responder a esta pergunta. Aguarde um momento e pergunte novamente.',
    vocNote:
      'A Lua está vazia de curso. Isso geralmente significa que "nada virá do assunto" — mas o mapa ainda mostra a situação como ela está.',
    lowConfidenceNote:
      'O mapa mostra indicações mistas — trate esta resposta como uma tendência geral, não uma certeza.',
    chartUnclear: 'Mapa Incerto',
    backButton: 'Voltar',
    // Phase 1.5 — C+ verdict layout
    backJournal: 'Crônicas',
    fullReadingTitle: 'Leitura Completa',
    chartStrengthLabel: 'Força do Mapa',
    chartStrengthStrong: 'Um mapa forte — bem adequado para julgar.',
    chartStrengthBorderline: 'Radicalidade limítrofe — o mapa é adequado para julgar, mas não fortemente.',
    chartStrengthWeak: 'O mapa está fraco — leia o veredito com cautela.',
    vocMoonTitle: 'A Lua está Vazia de Curso',
    vocVoidPill: 'VAZIA',
    vocSignLabel: 'Signo',
    vocToChangeLabel: 'Para mudança de signo',
    vocNextLabel: 'Próximo',
    vocExceptionNote: 'Aplica-se uma exceção. A Lua está em {{sign}} — um dos signos de Lilly onde a Lua vazia ainda pode atuar de alguma forma. Trate como atraso, não como negação.',
    timingWhen: 'Quando isso pode acontecer?',
    timingEstimate: '≈ {{value}} {{unit}}',
    timingUnit: { days: 'dias', weeks: 'semanas', months: 'meses', years: 'anos' },
    timingScale: { days: 'DIAS', weeks: 'SEM.', months: 'MESES' },
    perfectionLabel: 'Perfeições',
    aspectApplying: 'Aplicando',
    aspectCaution: 'Cautela',
    aspectPast: 'Passado',
    aspectApplyingSub: 'aplicando · perfaz-se em {{deg}}',
    aspectPastSub: 'separando · {{deg}} no passado',
    showAllAspects: 'Mostrar todos os {{count}} aspectos',
    showFewerAspects: 'Mostrar menos',
    seeFullReading: 'Ver a leitura completa',
    fullReadingHint: 'Significadores · Perfeições · Timing',
    askAgain: '✦ Pergunte novamente quando estiver pronto',
  },

  // Aspect type names (used in AspectRow)
  aspectTypes: {
    conjunction: 'conjunção',
    opposition: 'oposição',
    trine: 'trígono',
    square: 'quadratura',
    sextile: 'sextil',
  },

  // Journal screen
  journal: {
    title: 'Crônicas',
    emptyTitle: 'O pergaminho está vazio.',
    emptySubtitle: 'Faça sua primeira pergunta para iniciar sua crônica.',
    emptyButton: 'Perguntar às estrelas',
    deleteConfirmTitle: 'Excluir esta leitura?',
    deleteConfirmMessage: 'Esta ação não pode ser desfeita.',
    deleteConfirm: 'Excluir',
    deleteCancel: 'Cancelar',
    deleteAction: 'Excluir',
  },

  // Settings screen
  settings: {
    title: 'Meu almanaque',
    appVersion: 'Versão {{version}}',
    languageSection: 'IDIOMA',
    languageLabel: 'Idioma do aplicativo',
    zodiacSection: 'ZODÍACO',
    zodiacLabel: 'Tipo de zodíaco',
    zodiacTropic: 'Tropical',
    zodiacSidereal: 'Sideral',
    zodiacTropicHint:
      'Padrão da astrologia ocidental. Os planetas são posicionados em relação às estações.',
    zodiacSiderealHint:
      'Astrologia védica (Jyotish). Usa as posições reais das estrelas (deslocamento de ~23°).',
    timezoneSection: 'FUSO HORÁRIO',
    timezoneLabel: 'Fuso horário detectado',
    timezoneHint:
      'Somente leitura — definido pelo seu dispositivo. Todos os mapas são traçados para este fuso.',
    locationSection: 'LOCALIZAÇÃO',
    locationSourceLabel: 'Fonte de localização',
    locationSourceDevice: 'GPS do dispositivo',
    locationSourceManual: 'Definir cidade',
    locationDeviceHint:
      'Usa o GPS quando você pergunta; recorre à sua cidade padrão se o GPS não estiver disponível.',
    locationManualHint: 'Sempre usa a cidade selecionada para cada pergunta.',
    locationCityLabel: 'Cidade padrão',
    locationNoCity: 'Nenhuma cidade selecionada ainda',
    locationChooseCity: 'Escolher cidade',
    locationChangeCity: 'Alterar',
    apiKeySection: 'CHAVE DE API',
    apiKeyLabel: 'Chave astrology-api.io',
    apiKeyPlaceholder: 'Insira sua chave de API',
    apiKeySourcePersonal: 'Usando: chave pessoal',
    apiKeySourceDefault: 'Usando: padrão do app',
    apiKeyRemove: 'Remover chave',
    apiKeySave: 'Salvar chave',
    apiKeyEdit: 'Editar',
    shareSection: 'COMPARTILHAR & CONVIDAR',
    inviteFriend: 'Convidar um amigo',
    rateApp: 'Avaliar o AstraSk',
    inviteFriendTitle: 'Compartilhar o AstraSk',
    inviteShareText:
      'Eu uso o AstraSk para respostas instantâneas de astrologia horária. Experimente grátis:',
  },

  // Onboarding
  onboarding: {
    step1Title: 'AstraSk',
    step1Subtitle: 'Faça uma pergunta sincera. O céu irá responder.',
    step2Title: 'O Caminho de uma Pergunta',
    step2Point1: 'Faça uma pergunta sincera e específica',
    step2Point2: 'O céu traça seu mapa horário',
    step2Point3: 'Receba seu veredicto instantaneamente',
    step3Title: 'Permitir Localização',
    step3Body:
      'Sua localização exata no momento da pergunta faz parte do mapa horário. Usamos apenas para traçar seu mapa.',
    step3Privacy: 'Nunca armazenamos ou compartilhamos seus dados de localização.',
    step3Button: 'Permitir Localização',
    step3SkipButton: 'Continuar sem localização',
    step4Title: 'Sua Chave de API',
    step4Body:
      'Você tem sua própria chave astrology-api.io? Você pode pular isso por agora.',
    step4Skip: 'Pular',
    step4Enter: 'Inserir chave',
    step2HowAsk: 'Perguntar',
    step2HowCast: 'Mapa',
    step2HowVerdict: 'Veredicto',
    getStarted: 'Iniciar a Jornada',
    next: 'Próximo',
    back: 'Voltar',
    skip: 'Pular',
    finish: 'Perguntar às estrelas',
  },

  // Planet names
  planets: {
    Sun: 'Sol',
    Moon: 'Lua',
    Mercury: 'Mercúrio',
    Venus: 'Vênus',
    Mars: 'Marte',
    Jupiter: 'Júpiter',
    Saturn: 'Saturno',
    Uranus: 'Urano',
    Neptune: 'Netuno',
    Pluto: 'Plutão',
    NorthNode: 'Nodo Norte',
    SouthNode: 'Nodo Sul',
    Chiron: 'Quíron',
    Ascendant: 'Ascendente',
    Midheaven: 'Meio do Céu',
  },

  // Significator roles
  significatorRoles: {
    querent: 'Você (consultante)',
    quesited: 'O objetivo (questionado)',
    moon: 'A Lua',
    additional: 'Adicional',
  },

  // Verdict types
  verdictTypes: {
    YES: 'SIM',
    NO: 'NÃO',
    MAYBE: 'TALVEZ',
    UNCLEAR: 'INCERTO',
  },

  // Confidence bands
  confidence: {
    high: 'ALTA',
    medium: 'MÉDIA',
    low: 'BAIXA',
  },

  // Dignity labels
  dignity: {
    domicile: 'Domicílio',
    exaltation: 'Exaltação',
    detriment: 'Detrimento',
    fall: 'Queda',
  },

  // Error messages
  errors: {
    noInternet: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
    apiError: 'Algo deu errado. Por favor, tente novamente.',
    timeout: 'O servidor demorou muito para responder. Por favor, tente novamente.',
    locationDenied: 'Acesso à localização necessário — toque para abrir as Configurações.',
    locationDetecting: 'Detectando sua localização...',
    emptyQuestion: 'Por favor, insira uma pergunta antes de enviar.',
    questionTooShort: 'Sua pergunta deve ter pelo menos {{min}} caracteres.',
    questionTooLong: 'Sua pergunta não pode exceder {{max}} caracteres.',
    rateLimited:
      'Você atingiu o limite de requisições da API. Aguarde antes de perguntar novamente.',
    asyncStorageError: 'Não foi possível carregar os dados salvos.',
    storageError: 'Não foi possível salvar seus dados.',
    geocodeError: 'Não foi possível buscar cidades. Verifique sua conexão.',
  },

  // Developer debug mode (hidden behind PIN)
  debug: {
    title: 'Modo Desenvolvedor',
    pinHint: 'Insira o PIN do desenvolvedor para continuar.',
    pinError: 'PIN incorreto.',
    unlock: 'Desbloquear',
    stateSection: 'ESTADO',
    stateSectionHint: 'Reinicia apenas os dados locais do dispositivo — sem efeitos no servidor.',
    clearJournal: 'Limpar todas as entradas do diário',
    clearJournalHint: 'Exclui permanentemente todas as leituras salvas neste dispositivo.',
    clearJournalConfirm: 'Limpar todas as entradas do diário?',
    clearLabel: 'Limpar',
    lockLabel: 'Bloquear modo debug',
    maybeOnlyHint:
      'TALVEZ é somente simulado — a API real retorna sim / não / incerto / perguntar_depois.',
    navigationSection: 'NAVEGAÇÃO',
    navigationSectionHint: 'Navegue para estados específicos do app sem etapas manuais.',
    resetOnboarding: 'Reiniciar integração',
    resetOnboardingHint: 'Mostra o fluxo de primeiro acesso na próxima reinicialização do app.',
    triggerForceUpdate: 'Acionar tela de atualização forçada',
    triggerForceUpdateHint:
      'Simula uma barreira de atualização obrigatória — útil para testar a interface da barreira.',
    mockApiSection: 'API SIMULADA',
    mockApiSectionHint:
      'Ignora a API real — sem requisições de rede ou créditos consumidos.',
    mockApiToggle: 'Simular respostas da API',
    mockApiToggleHint:
      'Retorna um veredicto falso instantaneamente. Escolha o veredicto abaixo.',
    performanceSection: 'DESEMPENHO',
    performanceSectionHint: 'Ajuste o comportamento de tempo para iteração de UI mais rápida.',
    skipLoadingDelay: 'Ignorar atraso mínimo de carregamento',
    skipLoadingDelayHint:
      'Remove a espera artificial de 1,5 s para que o resultado apareça imediatamente.',
  },

  // Force-update gate
  forceUpdate: {
    title: 'Atualização Necessária',
    body: 'Uma atualização crítica está disponível. Atualize o app para continuar usando o AstraSk.',
    cta: 'Atualizar agora',
  },

  // Accessibility labels
  a11y: {
    askButton: 'Perguntar às estrelas. Envie sua pergunta horária.',
    verdictCard: 'Veredicto {{verdict}}. Confiança: {{confidence}}.',
    journalEntry:
      'Veredicto {{verdict}} para a pergunta: {{question}}. Data: {{date}}.',
    homeTab: 'Perguntar',
    journalTab: 'Crônicas',
    settingsTab: 'Almanaque',
    backButton: 'Voltar',
    settingsIcon: 'Abrir configurações',
    openLocationPicker: 'Alterar localização',
    clearOverride: 'Redefinir para localização GPS',
  },
} as const;

export default pt;
