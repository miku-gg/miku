export enum RPModelTokenizers {
  LLAMA3 = 'llama3',
  NEMO = 'nemo',
  DEEPSEEK = 'deepseek',
  QWEN3 = 'qwen3',
  QWQ = 'qwq',
  MISTRAL_SMALL = 'mistral-small',
  LLAMA4 = 'llama4',
  GEMMA3 = 'gemma3',
  CLAUDE = 'claude',
}

export enum RPModelStrategy {
  ALPACA = 'alpaca',
  MISTRAL = 'mistral',
  METHARME = 'metharme',
  VICUNA = 'vicuna',
  LLAMA3 = 'llama3',
  CHATML = 'chatml',
  LYRA = 'lyra',
  GEMMA3 = 'gemma3',
  DEEPSEEK = 'deepseek',
  DANCHAT2 = 'danchat2',
}

export enum PresetType {
  DIVINE_INTELECT = 'DIVINE_INTELECT',
  LLAMA_PRECISE = 'LLAMA_PRECISE',
  MINIMAL_WORK = 'MINIMAL_WORK',
  STHENO_V3 = 'STHENO_V3',
  NEMO = 'NEMO',
  QWEN3_30B_NO_THINK = 'QWEN3_30B_NO_THINK',
  PERSONALITY_ENGINE = 'PERSONALITY_ENGINE',
}

export enum RPModelPermission {
  FREE = 'free',
  PREMIUM = 'premium',
  TESTER = 'tester',
}

export interface ModelEndpoint {
  url: string;
  api_key: string;
  model: string;
}

export interface RPModelSettings {
  id: string;
  name: string;
  description: string;
  new_tokens: number;
  truncation_length: number;
  preset: PresetType;
  strategy: RPModelStrategy;
  tokenizer: RPModelTokenizers;
  permission: RPModelPermission;
  model_id_for_select: string | null;
  cost: number;
  endpoint: ModelEndpoint;
  has_reasoning: boolean;
}

export interface ModelServerSettings {
  rp_models: RPModelSettings[];
  embedding_server: {
    url: string;
    api_key: string;
  };
  assistants?: {
    novel_assistant?: RPModelSettings;
    translator_assistant?: RPModelSettings;
  };
}
export interface ValidationError {
  field: string;
  message: string;
}

export const validateServicesSettings = (settings: ModelServerSettings): ValidationError[] => {
  const errors: ValidationError[] = [];

  // validate settings in the valid type first
  if (!settings) {
    errors.push({ field: 'settings', message: 'Settings not found' });
    return errors;
  }

  if (!settings.rp_models) {
    errors.push({ field: 'rp_models', message: 'RP models not found' });
    return errors;
  }

  if (!settings.embedding_server) {
    errors.push({
      field: 'embedding_server',
      message: 'Embedding server not found',
    });
    return errors;
  }

  if (settings.rp_models?.length === 0) {
    errors.push({ field: 'rp_models', message: 'No RP models' });
    return errors;
  }

  // check if all required fields are present for each rp_models
  if (
    settings.rp_models.some((model, index) => {
      if (!model) {
        errors.push({
          field: `rp_models[${index}]`,
          message: 'Model not found',
        });
        return 1;
      }

      if (!model.id) {
        errors.push({
          field: `rp_models[${index}].id`,
          message: 'ID not found',
        });
        return 1;
      }

      if (!model.name) {
        errors.push({
          field: `rp_models[${index}].name`,
          message: 'Name not found',
        });
        return 1;
      }

      if (!model.description) {
        errors.push({
          field: `rp_models[${index}].description`,
          message: 'Description not found',
        });
        return 1;
      }

      if (!model.new_tokens) {
        errors.push({
          field: `rp_models[${index}].new_tokens`,
          message: 'New tokens not found',
        });
        return 1;
      }

      if (!model.truncation_length) {
        errors.push({
          field: `rp_models[${index}].truncation_length`,
          message: 'Truncation length not found',
        });
        return 1;
      }

      if (!model.preset) {
        errors.push({
          field: `rp_models[${index}].preset`,
          message: 'Preset not found',
        });
        return 1;
      }

      if (!model.strategy) {
        errors.push({
          field: `rp_models[${index}].strategy`,
          message: 'Strategy not found',
        });
        return 1;
      }

      if (!model.tokenizer) {
        errors.push({
          field: `rp_models[${index}].tokenizer`,
          message: 'Tokenizer not found',
        });
        return 1;
      }

      if (!model.permission) {
        errors.push({
          field: `rp_models[${index}].permission`,
          message: 'Permission not found',
        });
        return 1;
      }

      if (!model.cost && model.cost !== 0) {
        errors.push({
          field: `rp_models[${index}].cost`,
          message: 'Cost not found',
        });
        return;
      }

      if (!model.endpoint) {
        errors.push({
          field: `rp_models[${index}].endpoint`,
          message: 'Endpoint not found',
        });
        return 1;
      }

      if (!model.endpoint.url) {
        errors.push({
          field: `rp_models[${index}].endpoint.url`,
          message: 'Endpoint URL not found',
        });
        return 1;
      }

      if (!model.endpoint.url) {
        errors.push({
          field: `rp_models[${index}].endpoint.url`,
          message: 'Endpoint URL not found',
        });
        return 1;
      }

      if (!model.endpoint.api_key) {
        errors.push({
          field: `rp_models[${index}].endpoint.api_key`,
          message: 'Endpoint API key not found',
        });
        return 1;
      }

      if (!model.endpoint.model) {
        errors.push({
          field: `rp_models[${index}].endpoint.model`,
          message: 'Endpoint model not found',
        });
        return 1;
      }
    })
  ) {
    return errors;
  }

  if (!settings.embedding_server.url) {
    errors.push({
      field: 'embedding_server.url',
      message: 'Embedding server URL not found',
    });
  }

  if (!settings.embedding_server.api_key) {
    errors.push({
      field: 'embedding_server.api_key',
      message: 'Embedding server API key not found',
    });
  }

  const rpModelIds = settings.rp_models.map((model) => model.id);
  if (rpModelIds.length !== new Set(rpModelIds).size) {
    errors.push({
      field: 'rp_models.id',
      message: 'Duplicate RP model IDs found',
    });
  }
  if (!rpModelIds.includes('RP')) {
    errors.push({ field: 'rp_models.id', message: 'RP model ID not found' });
  }
  if (!rpModelIds.includes('RP_SMART')) {
    errors.push({
      field: 'rp_models.id',
      message: 'RP_SMART model ID not found',
    });
  }

  settings.rp_models?.forEach((model, index) => {
    if (model?.model_id_for_select) {
      const rpSelectModel = settings.rp_models.find((m) => m.id === model.model_id_for_select);
      if (!rpSelectModel) {
        errors.push({
          field: `rp_models[${index}].model_id_for_select`,
          message: `model_id_for_select ${model.model_id_for_select} not found for model ${model.id}`,
        });
      } else if (model.permission === 'free' && rpSelectModel.permission !== 'free') {
        errors.push({
          field: `rp_models[${index}].model_id_for_select`,
          message: `model_id_for_select ${model.model_id_for_select} permission should be free for model ${model.id}`,
        });
      }
    }

    if (!Object.values(RPModelPermission).includes(model.permission)) {
      errors.push({
        field: `rp_models[${index}].permission`,
        message: `Invalid permission ${model.permission} for model ${model.id}`,
      });
    }

    if (!Object.values(RPModelTokenizers).includes(model.tokenizer)) {
      errors.push({
        field: `rp_models[${index}].tokenizer`,
        message: `Invalid tokenizer ${model.tokenizer} for model ${model.id}`,
      });
    }

    if (!Object.values(PresetType).includes(model.preset)) {
      errors.push({
        field: `rp_models[${index}].preset`,
        message: `Invalid preset ${model.preset} for model ${model.id}`,
      });
    }

    if (!Object.values(RPModelStrategy).includes(model.strategy)) {
      errors.push({
        field: `rp_models[${index}].strategy`,
        message: `Invalid strategy ${model.strategy} for model ${model.id}`,
      });
    }
  });

  return errors;
};
