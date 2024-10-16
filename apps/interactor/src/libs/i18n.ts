import { useAppSelector } from '../state/store';

const labels: Record<string, Record<string, string>> = {
  en: {
    loading_novel: 'Loading Novel',
    settings: 'Settings',
    general_settings: 'General Settings',
    prompt_settings: 'Prompt Settings',
    your_name: 'Your name',
    custom_system_prompt: 'Custom system prompt',
    custom_system_prompt_placeholder: "Add information to always be remembered. For Example: Anon is Miku's student.",
    text_animation_speed: 'Text Animation Speed',
    text_font_size: 'Text Font Size',
    narration_voice: 'Narration Voice',
    narration_voice_description:
      'Enhances the experience by adding a narration voice audio to every response. This feature is only available for premium users.',
    autoplay: 'Autoplay',
    voice_id: 'Voice ID',
    reading_speed: 'Reading speed',
    response_format: 'Response Format',
    full_text: 'Full Text',
    vn_style: 'VN Style',
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
    presto: 'Presto',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    memory_capacity: 'Memory Capacity',
    upgrade_to_premium_for_long_term_memory: 'Upgrade to premium for long term memory and better responses.',
    free_membership: 'Free membership',
    characters_remember_last_15_messages: 'Characters remember the last 15 messages',
    characters_dont_remember_old_messages: "Characters don't remember old messages",
    long_term_memory: 'Long term memory',
    characters_have_5x_more_memory: 'Characters have 5x more memory',
    characters_remember_old_messages: 'Characters remember old messages',
    continue_as_regular: 'Continue as Regular',
    upgrade_to_premium: 'Upgrade to Premium',
    memory_options: 'Memory Options',
    configure_long_term_memory: 'Configure how you want to use long term memory.',
    standard_mode: 'Standard mode',
    ai_stores_entire_messages: 'The AI stores the entire messages',
    remembers_last_75_messages: 'Remembers the last 75 messages',
    summary_mode: 'Summary mode',
    ai_summarizes_old_messages: 'The AI summarizes old messages',
    remembers_last_900_messages: 'Remembers the last 900 messages',
    summary_settings: 'Summary settings',
    manage_edit_character_memories: 'Manage and edit character memories',
    manage_memories: 'Manage Memories',
    memories: 'Memories',
    edit_memory: 'Edit Memory',
    not_important: 'Not important',
    very_important: 'Very important',
    characters_affected: 'Characters affected',
    cancel: 'Cancel',
    delete: 'Delete',
    modify: 'Modify',
    used_memories: 'Used Memories',
    all_memories: 'All Memories',
    memories_used_by_ai: 'Memories being used by the AI for this character. Important memories will be prioritized.',
    all_memories_available: 'All memories available for this character.',
    importance: 'Importance',
    no_memories_yet: 'No memories yet',
    change_scene: 'Change Scene',
    create_scene: 'Create Scene',
    create_new_scene: 'Create new scene',
    generate_scene: 'Generate Scene',
    please_log_in_to_interact: 'Please log in to interact.',
    background: 'Background',
    select_background: 'Select background',
    characters: 'Characters',
    music: 'Music',
    scene_prompt: 'Scene prompt',
    scene_title: 'Scene title',
    start_scene: 'Start scene',
    search_backgrounds: 'Search backgrounds',
    search_characters: 'Search characters',
    upload_background: 'Upload background',
    generate: 'Generate',
    select_a_character: 'Select a character',
    empty: 'Empty',
    select_a_background: 'Select a background',
    generate_a_background: 'Generate a background',
    write_a_prompt: 'Write a prompt...',
    generate_background: 'Generate Background',
    go_to_next_scene: 'Go to next scene',
    generate_next_scene: 'Generate next scene',
    scene_suggestions: 'Scene suggestions',
    scene_generations_left: '% scene generations left today.',
    upgrade: 'Upgrade',
    get_premium_for_unlimited: 'Get premium for unlimited scene generations.',
    suggest_3_scenes: 'Suggest 3 scenes',
    describe_new_scene: 'or describe the new scene in your own words',
    generating_scene: 'Generating scene...',
    fetching_suggestions: 'Fetching suggestions...',
    edit: 'Edit',
    go_to_scene: 'Go to scene',
    history: 'History',
    load_narration_history: 'Load narration history',
    download_narration_history: 'Download narration history',
    inventory: 'Inventory',
    this_is_a_premium_only_item: 'This is a premium-only item',
    listen: 'Listen',
    this_is_a_premium_feature: 'This is a premium feature',
    free_for_a_limited_time: 'Free for a limited time',
    select: 'Select',
    type_a_message: 'Type a message...',
    hint: 'Hint:',
  },
  es: {
    loading_novel: 'Cargando Novela',
    settings: 'Configuración',
    general_settings: 'Configuración General',
    prompt_settings: 'Configuración de Indicaciones',
    your_name: 'Tu nombre',
    custom_system_prompt: 'Indicación personalizada del sistema',
    custom_system_prompt_placeholder:
      'Añade información para que siempre sea recordada. Por ejemplo: Anon es el estudiante de Miku.',
    text_animation_speed: 'Velocidad de Animación del Texto',
    text_font_size: 'Tamaño de Fuente del Texto',
    narration_voice: 'Voz de Narración',
    narration_voice_description:
      'Mejora la experiencia añadiendo audio de voz narrativa a cada respuesta. Esta función solo está disponible para usuarios premium.',
    autoplay: 'Reproducción automática',
    voice_id: 'ID de Voz',
    reading_speed: 'Velocidad de lectura',
    response_format: 'Formato de Respuesta',
    full_text: 'Texto Completo',
    vn_style: 'Estilo VN',
    slow: 'Lento',
    normal: 'Normal',
    fast: 'Rápido',
    presto: 'Presto',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    memory_capacity: 'Capacidad de Memoria',
    upgrade_to_premium_for_long_term_memory: 'Actualiza a premium para memoria a largo plazo y mejores respuestas.',
    free_membership: 'Membresía gratuita',
    characters_remember_last_15_messages: 'Los personajes recuerdan los últimos 15 mensajes',
    characters_dont_remember_old_messages: 'Los personajes no recuerdan mensajes antiguos',
    long_term_memory: 'Memoria a largo plazo',
    characters_have_5x_more_memory: 'Los personajes tienen 5 veces más memoria',
    characters_remember_old_messages: 'Los personajes recuerdan mensajes antiguos',
    continue_as_regular: 'Continuar como Regular',
    upgrade_to_premium: 'Actualizar a Premium',
    memory_options: 'Opciones de Memoria',
    configure_long_term_memory: 'Configura cómo quieres usar la memoria a largo plazo.',
    standard_mode: 'Modo estándar',
    ai_stores_entire_messages: 'La IA almacena los mensajes completos',
    remembers_last_75_messages: 'Recuerda los últimos 75 mensajes',
    summary_mode: 'Modo resumen',
    ai_summarizes_old_messages: 'La IA resume los mensajes antiguos',
    remembers_last_900_messages: 'Recuerda los últimos 900 mensajes',
    summary_settings: 'Configuración de resumen',
    manage_edit_character_memories: 'Gestionar y editar memorias de personajes',
    manage_memories: 'Gestionar Memorias',
    memories: 'Memorias',
    edit_memory: 'Editar Memoria',
    not_important: 'No importante',
    very_important: 'Muy importante',
    characters_affected: 'Personajes afectados',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    modify: 'Modificar',
    used_memories: 'Memorias Utilizadas',
    all_memories: 'Todas las Memorias',
    memories_used_by_ai:
      'Memorias siendo utilizadas por la IA para este personaje. Las memorias importantes tendrán prioridad.',
    all_memories_available: 'Todas las memorias disponibles para este personaje.',
    importance: 'Importancia',
    no_memories_yet: 'Aún no hay memorias',
    change_scene: 'Cambiar Escena',
    create_scene: 'Crear Escena',
    create_new_scene: 'Crear nueva escena',
    generate_scene: 'Generar Escena',
    please_log_in_to_interact: 'Por favor, inicia sesión para interactuar.',
    background: 'Fondo',
    select_background: 'Seleccionar fondo',
    characters: 'Personajes',
    music: 'Música',
    scene_prompt: 'Indicación de escena',
    scene_title: 'Título de la escena',
    start_scene: 'Iniciar escena',
    search_backgrounds: 'Buscar fondos',
    search_characters: 'Buscar personajes',
    upload_background: 'Subir fondo',
    generate: 'Generar',
    select_a_character: 'Seleccionar un personaje',
    empty: 'Vacío',
    select_a_background: 'Seleccionar un fondo',
    generate_a_background: 'Generar un fondo',
    write_a_prompt: 'Escribe una indicación...',
    generate_background: 'Generar Fondo',
    go_to_next_scene: 'Ir a la siguiente escena',
    generate_next_scene: 'Generar siguiente escena',
    scene_suggestions: 'Sugerencias de escena',
    scene_generations_left: '% generaciones de escena restantes hoy.',
    upgrade: 'Actualizar',
    get_premium_for_unlimited: 'Obtén premium para generaciones de escena ilimitadas.',
    suggest_3_scenes: 'Sugerir 3 escenas',
    describe_new_scene: 'o describe la nueva escena con tus propias palabras',
    generating_scene: 'Generando escena...',
    fetching_suggestions: 'Obteniendo sugerencias...',
    edit: 'Editar',
    go_to_scene: 'Ir a la escena',
    history: 'Historial',
    load_narration_history: 'Cargar historial de narración',
    download_narration_history: 'Descargar historial de narración',
    inventory: 'Inventario',
    this_is_a_premium_only_item: 'Este es un artículo solo para premium',
    listen: 'Escuchar',
    this_is_a_premium_feature: 'Esta es una característica premium',
    free_for_a_limited_time: 'Gratis por tiempo limitado',
    select: 'Seleccionar',
    type_a_message: 'Escribe un mensaje...',
    hint: 'Pista:',
  },
  pt: {
    loading_novel: 'Carregando Romance',
    settings: 'Configurações',
    general_settings: 'Configurações Gerais',
    prompt_settings: 'Configurações de Prompt',
    your_name: 'Seu nome',
    custom_system_prompt: 'Prompt personalizado do sistema',
    custom_system_prompt_placeholder:
      'Adicione informações para serem sempre lembradas. Por exemplo: Anon é estudante da Miku.',
    text_animation_speed: 'Velocidade de Animação do Texto',
    text_font_size: 'Tamanho da Fonte do Texto',
    narration_voice: 'Voz de Narração',
    narration_voice_description:
      'Melhora a experiência adicionando áudio de voz narrativa a cada resposta. Este recurso está disponível apenas para usuários premium.',
    autoplay: 'Reprodução automática',
    voice_id: 'ID da Voz',
    reading_speed: 'Velocidade de leitura',
    response_format: 'Formato de Resposta',
    full_text: 'Texto Completo',
    vn_style: 'Estilo VN',
    slow: 'Lento',
    normal: 'Normal',
    fast: 'Rápido',
    presto: 'Presto',
    small: 'Pequeno',
    medium: 'Médio',
    large: 'Grande',
    memory_capacity: 'Capacidade de Memória',
    upgrade_to_premium_for_long_term_memory: 'Atualize para premium para memória de longo prazo e melhores respostas.',
    free_membership: 'Associação gratuita',
    characters_remember_last_15_messages: 'Os personagens lembram as últimas 15 mensagens',
    characters_dont_remember_old_messages: 'Os personagens não lembram mensagens antigas',
    long_term_memory: 'Memória de longo prazo',
    characters_have_5x_more_memory: 'Os personagens têm 5 vezes mais memória',
    characters_remember_old_messages: 'Os personagens lembram mensagens antigas',
    continue_as_regular: 'Continuar como Regular',
    upgrade_to_premium: 'Atualizar para Premium',
    memory_options: 'Opções de Memória',
    configure_long_term_memory: 'Configure como você deseja usar a memória de longo prazo.',
    standard_mode: 'Modo padrão',
    ai_stores_entire_messages: 'A IA armazena as mensagens inteiras',
    remembers_last_75_messages: 'Lembra as últimas 75 mensagens',
    summary_mode: 'Modo resumo',
    ai_summarizes_old_messages: 'A IA resume mensagens antigas',
    remembers_last_900_messages: 'Lembra as últimas 900 mensagens',
    summary_settings: 'Configurações de resumo',
    manage_edit_character_memories: 'Gerenciar e editar memórias de personagens',
    manage_memories: 'Gerenciar Memórias',
    memories: 'Memórias',
    edit_memory: 'Editar Memória',
    not_important: 'Não importante',
    very_important: 'Muito importante',
    characters_affected: 'Personagens afetados',
    cancel: 'Cancelar',
    delete: 'Excluir',
    modify: 'Modificar',
    used_memories: 'Memórias Usadas',
    all_memories: 'Todas as Memórias',
    memories_used_by_ai: 'Memórias sendo usadas pela IA para este personagem. Memórias importantes terão prioridade.',
    all_memories_available: 'Todas as memórias disponíveis para este personagem.',
    importance: 'Importância',
    no_memories_yet: 'Ainda não há memórias',
    change_scene: 'Mudar Cena',
    create_scene: 'Criar Cena',
    create_new_scene: 'Criar nova cena',
    generate_scene: 'Gerar Cena',
    please_log_in_to_interact: 'Por favor, faça login para interagir.',
    background: 'Fundo',
    select_background: 'Selecionar fundo',
    characters: 'Personagens',
    music: 'Música',
    scene_prompt: 'Prompt de cena',
    scene_title: 'Título da cena',
    start_scene: 'Iniciar cena',
    search_backgrounds: 'Pesquisar fundos',
    search_characters: 'Pesquisar personagens',
    upload_background: 'Enviar fundo',
    generate: 'Gerar',
    select_a_character: 'Selecione um personagem',
    empty: 'Vazio',
    select_a_background: 'Selecione um fundo',
    generate_a_background: 'Gerar um fundo',
    write_a_prompt: 'Escreva um prompt...',
    generate_background: 'Gerar Fundo',
    go_to_next_scene: 'Ir para a próxima cena',
    generate_next_scene: 'Gerar próxima cena',
    scene_suggestions: 'Sugestões de cena',
    scene_generations_left: '% gerações de cena restantes hoje.',
    upgrade: 'Atualizar',
    get_premium_for_unlimited: 'Obtenha premium para gerações de cena ilimitadas.',
    suggest_3_scenes: 'Sugerir 3 cenas',
    describe_new_scene: 'ou descreva a nova cena com suas próprias palavras',
    generating_scene: 'Gerando cena...',
    fetching_suggestions: 'Buscando sugestões...',
    edit: 'Editar',
    go_to_scene: 'Ir para a cena',
    history: 'Histórico',
    load_narration_history: 'Carregar histórico de narração',
    download_narration_history: 'Baixar histórico de narração',
    inventory: 'Inventário',
    this_is_a_premium_only_item: 'Este é um item exclusivo para premium',
    listen: 'Ouvir',
    this_is_a_premium_feature: 'Este é um recurso premium',
    free_for_a_limited_time: 'Grátis por tempo limitado',
    select: 'Selecionar',
    type_a_message: 'Digite uma mensagem...',
    hint: 'Dica:',
  },
  de: {
    loading_novel: 'Roman wird geladen',
    settings: 'Einstellungen',
    general_settings: 'Allgemeine Einstellungen',
    prompt_settings: 'Prompt-Einstellungen',
    your_name: 'Dein Name',
    custom_system_prompt: 'Benutzerdefinierter Systemprompt',
    custom_system_prompt_placeholder:
      'Füge Informationen hinzu, die immer erinnert werden sollen. Zum Beispiel: Anon ist Mikus Schüler.',
    text_animation_speed: 'Textanimationsgeschwindigkeit',
    text_font_size: 'Textschriftgröße',
    narration_voice: 'Erzählerstimme',
    narration_voice_description:
      'Verbessert das Erlebnis durch Hinzufügen einer Erzählerstimme zu jeder Antwort. Diese Funktion ist nur für Premium-Benutzer verfügbar.',
    autoplay: 'Automatische Wiedergabe',
    voice_id: 'Stimm-ID',
    reading_speed: 'Lesegeschwindigkeit',
    response_format: 'Antwortformat',
    full_text: 'Vollständiger Text',
    vn_style: 'VN-Stil',
    slow: 'Langsam',
    normal: 'Normal',
    fast: 'Schnell',
    presto: 'Presto',
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    memory_capacity: 'Speicherkapazität',
    upgrade_to_premium_for_long_term_memory: 'Upgrade auf Premium für Langzeitgedächtnis und bessere Antworten.',
    free_membership: 'Kostenlose Mitgliedschaft',
    characters_remember_last_15_messages: 'Charaktere erinnern sich an die letzten 15 Nachrichten',
    characters_dont_remember_old_messages: 'Charaktere erinnern sich nicht an alte Nachrichten',
    long_term_memory: 'Langzeitgedächtnis',
    characters_have_5x_more_memory: 'Charaktere haben 5-mal mehr Speicher',
    characters_remember_old_messages: 'Charaktere erinnern sich an alte Nachrichten',
    continue_as_regular: 'Als Regulär fortfahren',
    upgrade_to_premium: 'Auf Premium upgraden',
    memory_options: 'Speicheroptionen',
    configure_long_term_memory: 'Konfigurieren Sie, wie Sie das Langzeitgedächtnis nutzen möchten.',
    standard_mode: 'Standardmodus',
    ai_stores_entire_messages: 'Die KI speichert die gesamten Nachrichten',
    remembers_last_75_messages: 'Erinnert sich an die letzten 75 Nachrichten',
    summary_mode: 'Zusammenfassungsmodus',
    ai_summarizes_old_messages: 'Die KI fasst alte Nachrichten zusammen',
    remembers_last_900_messages: 'Erinnert sich an die letzten 900 Nachrichten',
    summary_settings: 'Zusammenfassungseinstellungen',
    manage_edit_character_memories: 'Charaktererinnerungen verwalten und bearbeiten',
    manage_memories: 'Erinnerungen verwalten',
    memories: 'Erinnerungen',
    edit_memory: 'Erinnerung bearbeiten',
    not_important: 'Nicht wichtig',
    very_important: 'Sehr wichtig',
    characters_affected: 'Betroffene Charaktere',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    modify: 'Ändern',
    used_memories: 'Verwendete Erinnerungen',
    all_memories: 'Alle Erinnerungen',
    memories_used_by_ai:
      'Erinnerungen, die von der KI für diesen Charakter verwendet werden. Wichtige Erinnerungen werden priorisiert.',
    all_memories_available: 'Alle verfügbaren Erinnerungen für diesen Charakter.',
    importance: 'Wichtigkeit',
    no_memories_yet: 'Noch keine Erinnerungen',
    change_scene: 'Szene ändern',
    create_scene: 'Szene erstellen',
    create_new_scene: 'Neue Szene erstellen',
    generate_scene: 'Szene generieren',
    please_log_in_to_interact: 'Bitte melden Sie sich an, um zu interagieren.',
    background: 'Hintergrund',
    select_background: 'Hintergrund auswählen',
    characters: 'Charaktere',
    music: 'Musik',
    scene_prompt: 'Szenenprompt',
    scene_title: 'Szenentitel',
    start_scene: 'Szene starten',
    search_backgrounds: 'Hintergründe suchen',
    search_characters: 'Charaktere suchen',
    upload_background: 'Hintergrund hochladen',
    generate: 'Generieren',
    select_a_character: 'Wähle einen Charakter',
    empty: 'Leer',
    select_a_background: 'Wähle einen Hintergrund',
    generate_a_background: 'Generiere einen Hintergrund',
    write_a_prompt: 'Schreibe einen Prompt...',
    generate_background: 'Hintergrund generieren',
    go_to_next_scene: 'Zur nächsten Szene gehen',
    generate_next_scene: 'Nächste Szene generieren',
    scene_suggestions: 'Szenenvorschläge',
    scene_generations_left: '% Szenengenerierungen heute noch übrig.',
    upgrade: 'Upgraden',
    get_premium_for_unlimited: 'Holen Sie sich Premium für unbegrenzte Szenengenerierungen.',
    suggest_3_scenes: '3 Szenen vorschlagen',
    describe_new_scene: 'oder beschreiben Sie die neue Szene mit eigenen Worten',
    generating_scene: 'Szene wird generiert...',
    fetching_suggestions: 'Vorschläge werden abgerufen...',
    edit: 'Bearbeiten',
    go_to_scene: 'Zur Szene gehen',
    history: 'Verlauf',
    load_narration_history: 'Erzählungsverlauf laden',
    download_narration_history: 'Erzählungsverlauf herunterladen',
    inventory: 'Inventar',
    this_is_a_premium_only_item: 'Dies ist ein Premium-exklusiver Artikel',
    listen: 'Anhören',
    this_is_a_premium_feature: 'Dies ist eine Premium-Funktion',
    free_for_a_limited_time: 'Für begrenzte Zeit kostenlos',
    select: 'Auswählen',
    type_a_message: 'Schreibe eine Nachricht...',
    hint: 'Tipp:',
  },
  fr: {
    loading_novel: 'Chargement du Roman',
    settings: 'Paramètres',
    general_settings: 'Paramètres Généraux',
    prompt_settings: 'Paramètres de Prompt',
    your_name: 'Votre nom',
    custom_system_prompt: 'Prompt système personnalisé',
    custom_system_prompt_placeholder:
      "Ajoutez des informations à toujours mémoriser. Par exemple : Anon est l'élève de Miku.",
    text_animation_speed: "Vitesse d'Animation du Texte",
    text_font_size: 'Taille de Police du Texte',
    narration_voice: 'Voix de Narration',
    narration_voice_description:
      "Améliore l'expérience en ajoutant un audio de voix narrative à chaque réponse. Cette fonctionnalité est uniquement disponible pour les utilisateurs premium.",
    autoplay: 'Lecture automatique',
    voice_id: 'ID de Voix',
    reading_speed: 'Vitesse de lecture',
    response_format: 'Format de Réponse',
    full_text: 'Texte Complet',
    vn_style: 'Style VN',
    slow: 'Lent',
    normal: 'Normal',
    fast: 'Rapide',
    presto: 'Presto',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    memory_capacity: 'Capacité de Mémoire',
    upgrade_to_premium_for_long_term_memory: 'Passez à premium pour la mémoire à long terme et de meilleures réponses.',
    free_membership: 'Adhésion gratuite',
    characters_remember_last_15_messages: 'Les personnages se souviennent des 15 derniers messages',
    characters_dont_remember_old_messages: "Les personnages n'ont pas de mémoire des anciens messages",
    long_term_memory: 'Mémoire à long terme',
    characters_have_5x_more_memory: 'Les personnages ont 5 fois plus de mémoire',
    characters_remember_old_messages: 'Les personnages se souviennent des anciens messages',
    continue_as_regular: 'Continuer en tant que Membre régulier',
    upgrade_to_premium: 'Passer à Premium',
    memory_options: 'Options de Mémoire',
    configure_long_term_memory: 'Configurez la façon dont vous souhaitez utiliser la mémoire à long terme.',
    standard_mode: 'Mode standard',
    ai_stores_entire_messages: "L'IA stocke les messages entiers",
    remembers_last_75_messages: 'Se souvient des 75 derniers messages',
    summary_mode: 'Mode résumé',
    ai_summarizes_old_messages: "L'IA résume les anciens messages",
    remembers_last_900_messages: 'Se souvient des 900 derniers messages',
    summary_settings: 'Paramètres de résumé',
    manage_edit_character_memories: 'Gérer et éditer les souvenirs des personnages',
    manage_memories: 'Gérer les Souvenirs',
    memories: 'Souvenirs',
    edit_memory: 'Éditer le Souvenir',
    not_important: 'Pas important',
    very_important: 'Très important',
    characters_affected: 'Personnages affectés',
    cancel: 'Annuler',
    delete: 'Supprimer',
    modify: 'Modifier',
    used_memories: 'Souvenirs Utilisés',
    all_memories: 'Tous les Souvenirs',
    memories_used_by_ai: "Souvenirs utilisés par l'IA pour ce personnage. Les souvenirs importants seront priorisés.",
    all_memories_available: 'Tous les souvenirs disponibles pour ce personnage.',
    importance: 'Importance',
    no_memories_yet: 'Pas encore de souvenirs',
    change_scene: 'Changer de Scène',
    create_scene: 'Créer une Scène',
    create_new_scene: 'Créer une nouvelle scène',
    generate_scene: 'Générer une Scène',
    please_log_in_to_interact: 'Veuillez vous connecter pour interagir.',
    background: 'Fond',
    select_background: 'Sélectionner un fond',
    characters: 'Personnages',
    music: 'Musique',
    scene_prompt: 'Invite de scène',
    scene_title: 'Titre de la scène',
    start_scene: 'Démarrer la scène',
    search_backgrounds: 'Rechercher des fonds',
    search_characters: 'Rechercher des personnages',
    upload_background: 'Télécharger un fond',
    generate: 'Générer',
    select_a_character: 'Sélectionner un personnage',
    empty: 'Vide',
    select_a_background: 'Sélectionner un fond',
    generate_a_background: 'Générer un fond',
    write_a_prompt: 'Écrire une invite...',
    generate_background: 'Générer un Fond',
    go_to_next_scene: 'Aller à la scène suivante',
    generate_next_scene: 'Générer la scène suivante',
    scene_suggestions: 'Suggestions de scène',
    scene_generations_left: "% générations de scène restantes aujourd'hui.",
    upgrade: 'Mettre à niveau',
    get_premium_for_unlimited: 'Obtenez premium pour des générations de scène illimitées.',
    suggest_3_scenes: 'Suggérer 3 scènes',
    describe_new_scene: 'ou décrivez la nouvelle scène avec vos propres mots',
    generating_scene: 'Génération de la scène...',
    fetching_suggestions: 'Récupération des suggestions...',
    edit: 'Éditer',
    go_to_scene: 'Aller à la scène',
    history: 'Historique',
    load_narration_history: "Charger l'historique de narration",
    download_narration_history: "Télécharger l'historique de narration",
    inventory: 'Inventaire',
    this_is_a_premium_only_item: 'Cet article est réservé aux membres premium',
    listen: 'Écouter',
    this_is_a_premium_feature: 'Cette fonctionnalité est réservée aux membres premium',
    free_for_a_limited_time: 'Gratuit pour une durée limitée',
    select: 'Sélectionner',
    type_a_message: 'Tapez un message...',
    hint: 'Indice :',
  },
  ru: {
    loading_novel: 'Загрузка романа',
    settings: 'Настройки',
    general_settings: 'Общие настройки',
    prompt_settings: 'Настройки подсказок',
    your_name: 'Ваше имя',
    custom_system_prompt: 'Пользовательская системная подсказка',
    custom_system_prompt_placeholder:
      'Добавьте информацию, которую нужно всегда помнить. Например: Анон - ученик Мику.',
    text_animation_speed: 'Скорость анимации текста',
    text_font_size: 'Размер шрифта текста',
    narration_voice: 'Голос рассказчика',
    narration_voice_description:
      'Улучшает опыт, добавляя аудио голоса рассказчика к каждому ответу. Эта функция доступна только для премиум-пользователей.',
    autoplay: 'Автовоспроизведение',
    voice_id: 'ID голоса',
    reading_speed: 'Скорость чтения',
    response_format: 'Формат ответа',
    full_text: 'Полный текст',
    vn_style: 'Стиль VN',
    slow: 'Медленно',
    normal: 'Нормально',
    fast: 'Быстро',
    presto: 'Очень быстро',
    small: 'Маленький',
    medium: 'Средний',
    large: 'Большой',
    memory_capacity: 'Объем памяти',
    upgrade_to_premium_for_long_term_memory: 'Обновите до премиум для долгосрочной памяти и лучших ответов.',
    free_membership: 'Бесплатное членство',
    characters_remember_last_15_messages: 'Персонажи помнят последние 15 сообщений',
    characters_dont_remember_old_messages: 'Персонажи не помнят старые сообщения',
    long_term_memory: 'Долгосрочная память',
    characters_have_5x_more_memory: 'У персонажей в 5 раз больше памяти',
    characters_remember_old_messages: 'Персонажи помнят старые сообщения',
    continue_as_regular: 'Продолжить как обычный пользователь',
    upgrade_to_premium: 'Обновить до премиум',
    memory_options: 'Параметры памяти',
    configure_long_term_memory: 'Настройте, как вы хотите использовать долгосрочную память.',
    standard_mode: 'Стандартный режим',
    ai_stores_entire_messages: 'ИИ хранит целые сообщения',
    remembers_last_75_messages: 'Помнит последние 75 сообщений',
    summary_mode: 'Режим сводки',
    ai_summarizes_old_messages: 'ИИ суммирует старые сообщения',
    remembers_last_900_messages: 'Помнит последние 900 сообщений',
    summary_settings: 'Настройки сводки',
    manage_edit_character_memories: 'Управление и редактирование воспоминаний персонажей',
    manage_memories: 'Управление воспоминаниями',
    memories: 'Воспоминания',
    edit_memory: 'Редактировать воспоминание',
    not_important: 'Не важно',
    very_important: 'Очень важно',
    characters_affected: 'Затронутые персонажи',
    cancel: 'Отмена',
    delete: 'Удалить',
    modify: 'Изменить',
    used_memories: 'Используемые воспоминания',
    all_memories: 'Все воспоминания',
    memories_used_by_ai:
      'Воспоминания, используемые ИИ для этого персонажа. Важные воспоминания будут иметь приоритет.',
    all_memories_available: 'Все доступные воспоминания для этого персонажа.',
    importance: 'Важность',
    no_memories_yet: 'Пока нет воспоминаний',
    change_scene: 'Изменить сцену',
    create_scene: 'Создать сцену',
    create_new_scene: 'Создать новую сцену',
    generate_scene: 'Сгенерировать сцену',
    please_log_in_to_interact: 'Пожалуйста, войдите, чтобы взаимодействовать.',
    background: 'Фон',
    select_background: 'Выбрать фон',
    characters: 'Персонажи',
    music: 'Музыка',
    scene_prompt: 'Подсказка сцены',
    scene_title: 'Название сцены',
    start_scene: 'Начать сцену',
    search_backgrounds: 'Поиск фонов',
    search_characters: 'Поиск персонажей',
    upload_background: 'Загрузить фон',
    generate: 'Сгенерировать',
    select_a_character: 'Выберите персонажа',
    empty: 'Пусто',
    select_a_background: 'Выберите фон',
    generate_a_background: 'Сгенерировать фон',
    write_a_prompt: 'Напишите подсказку...',
    generate_background: 'Сгенерировать фон',
    go_to_next_scene: 'Перейти к следующей сцене',
    generate_next_scene: 'Сгенерировать следующую сцену',
    scene_suggestions: 'Предложения сцен',
    scene_generations_left: '% генераций сцен осталось сегодня.',
    upgrade: 'Обновить',
    get_premium_for_unlimited: 'Получите премиум для неограниченных генераций сцен.',
    suggest_3_scenes: 'Предложить 3 сцены',
    describe_new_scene: 'или опишите новую сцену своими словами',
    generating_scene: 'Генерация сцены...',
    fetching_suggestions: 'Получение предложений...',
    edit: 'Редактировать',
    go_to_scene: 'Перейти к сцене',
    history: 'История',
    load_narration_history: 'Загрузить историю повествования',
    download_narration_history: 'Скачать историю повествования',
    inventory: 'Инвентарь',
    this_is_a_premium_only_item: 'Это предмет только для премиум-пользователей',
    listen: 'Слушать',
    this_is_a_premium_feature: 'Это премиум-функция',
    free_for_a_limited_time: 'Бесплатно на ограниченное время',
    select: 'Выбрать',
    type_a_message: 'Введите сообщение...',
    hint: 'Подсказка:',
  },
  jp: {
    loading_novel: '小説を読み込み中',
    settings: '設定',
    general_settings: '一般設定',
    prompt_settings: 'プロンプト設定',
    your_name: 'あなたの名前',
    custom_system_prompt: 'カスタムシステムプロンプト',
    custom_system_prompt_placeholder: '常に覚えておくべき情報を追加してください。例：アノンはミクの生徒です。',
    text_animation_speed: 'テキストアニメーション速度',
    text_font_size: 'テキストフォントサイズ',
    narration_voice: 'ナレーション音声',
    narration_voice_description:
      '各応答にナレーション音声を追加して体験を向上させます。この機能はプレミアムユーザーのみ利用可能です。',
    autoplay: '自動再生',
    voice_id: '音声ID',
    reading_speed: '読み上げ速度',
    response_format: '応答フォーマット',
    full_text: '全文',
    vn_style: 'VNスタイル',
    slow: '遅い',
    normal: '普通',
    fast: '速い',
    presto: 'プレスト',
    small: '小',
    medium: '中',
    large: '大',
    memory_capacity: 'メモリ容量',
    upgrade_to_premium_for_long_term_memory: '長期記憶とより良い応答のためにプレミアムにアップグレードしてください。',
    free_membership: '無料メンバーシップ',
    characters_remember_last_15_messages: 'キャラクターは最後の15メッセージを覚えています',
    characters_dont_remember_old_messages: 'キャラクターは古いメッセージを覚えていません',
    long_term_memory: '長期記憶',
    characters_have_5x_more_memory: 'キャラクターは5倍のメモリを持っています',
    characters_remember_old_messages: 'キャラクターは古いメッセージを覚えています',
    continue_as_regular: '通常のユーザーとして続ける',
    upgrade_to_premium: 'プレミアムにアップグレード',
    memory_options: 'メモリオプション',
    configure_long_term_memory: '長期記憶の使用方法を設定します。',
    standard_mode: '標準モード',
    ai_stores_entire_messages: 'AIはメッセージ全体を保存します',
    remembers_last_75_messages: '最後の75メッセージを覚えています',
    summary_mode: '要約モード',
    ai_summarizes_old_messages: 'AIは古いメッセージを要約します',
    remembers_last_900_messages: '最後の900メッセージを覚えています',
    summary_settings: '要約設定',
    manage_edit_character_memories: 'キャラクターの記憶を管理・編集する',
    manage_memories: '記憶を管理',
    memories: '記憶',
    edit_memory: '記憶を編集',
    not_important: '重要でない',
    very_important: '非常に重要',
    characters_affected: '影響を受けるキャラクター',
    cancel: 'キャンセル',
    delete: '削除',
    modify: '修正',
    used_memories: '使用された記憶',
    all_memories: 'すべての記憶',
    memories_used_by_ai: 'このキャラクターに対してAIが使用している記憶。重要な記憶が優先されます。',
    all_memories_available: 'このキャラクターに利用可能なすべての記憶。',
    importance: '重要度',
    no_memories_yet: 'まだ記憶がありません',
    change_scene: 'シーンを変更',
    create_scene: 'シーンを作成',
    create_new_scene: '新しいシーンを作成',
    generate_scene: 'シーンを生成',
    please_log_in_to_interact: '操作するにはログインしてください。',
    background: '背景',
    select_background: '背景を選択',
    characters: 'キャラクター',
    music: '音楽',
    scene_prompt: 'シーンプロンプト',
    scene_title: 'シーンタイトル',
    start_scene: 'シーンを開始',
    search_backgrounds: '背景を検索',
    search_characters: 'キャラクターを検索',
    upload_background: '背景をアップロード',
    generate: '生成',
    select_a_character: 'キャラクターを選択',
    empty: '空',
    select_a_background: '背景を選択',
    generate_a_background: '背景を生成',
    write_a_prompt: 'プロンプトを書く...',
    generate_background: '背景を生成',
    go_to_next_scene: '次のシーンへ',
    generate_next_scene: '次のシーンを生成',
    scene_suggestions: 'シーンの提案',
    scene_generations_left: '今日残りのシーン生成回数：%',
    upgrade: 'アップグレード',
    get_premium_for_unlimited: '無制限のシーン生成のためにプレミアムを取得',
    suggest_3_scenes: '3つのシーンを提案',
    describe_new_scene: 'または新しいシーンを自分の言葉で説明してください',
    generating_scene: 'シーンを生成中...',
    fetching_suggestions: '提案を取得中...',
    edit: '編集',
    go_to_scene: 'シーンへ移動',
    history: '履歴',
    load_narration_history: 'ナレーション履歴を読み込む',
    download_narration_history: 'ナレーション履歴をダウンロード',
    inventory: 'インベントリ',
    this_is_a_premium_only_item: 'これはプレミアム限定アイテムです',
    listen: '聴く',
    this_is_a_premium_feature: 'これはプレミアム機能です',
    free_for_a_limited_time: '期間限定で無料',
    select: '選択',
    type_a_message: 'メッセージを入力...',
    hint: 'ヒント：',
  },
};

function getTranslatedLabel(language: string, labelKey: string, replacements: string[] = []) {
  let text = labels[language]?.[labelKey] || labels['en']?.[labelKey] || labelKey;
  replacements.forEach((replacement) => {
    text = text.replace('%', replacement);
  });
  return text;
}

export function useI18n() {
  const language = useAppSelector((state) => (state.novel.language || 'en').split('_')[0].toLowerCase());
  return {
    i18n: (key: string, replacements: string[] = []) => getTranslatedLabel(language, key, replacements),
  };
}
