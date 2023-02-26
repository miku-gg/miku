interface ServiceConfig {
  "service": string
  "props": object
}

interface BotConfig {
  "bot_name": string
  "version": string
  "subject": string
  "short_term_memory": {
    "service": string
    "props": {
      "prompt_context": string
      "prompt_initiator": string
      "language": 'en' | 'es'
      "subjects": string[]
      "botSubject": string
    }
  },
  "prompt_completer":  ServiceConfig,
  "commandGenerators": ServiceConfig[],
  "outputListeners":  ServiceConfig[]
}