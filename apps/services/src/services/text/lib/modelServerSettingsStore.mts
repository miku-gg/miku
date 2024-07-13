import axios from "axios";
import {
  ModelServerSettings,
  PresetType,
  RPModelPermission,
  RPModelSettings,
  RPModelStrategy,
  RPModelTokenizers,
  validateServicesSettings,
} from "../data/rpModelTypes.mjs";
import backend_config from "../../../../backend_config.json" assert { type: "json" };

const DEFAULT_MODEL: RPModelSettings = {
  id: "RP",
  name: backend_config?.model || "",
  description: "Default model",
  new_tokens: (backend_config?.max_new_tokens as number) || 200,
  truncation_length: (backend_config?.truncation_length as number) || 8192,
  // @ts-ignore
  preset: (backend_config?.preset as PresetType) || PresetType.DIVINE_INTELECT,
  strategy:
    (backend_config?.strategy as RPModelStrategy) || RPModelStrategy.ALPACA,
  tokenizer:
    (backend_config?.tokenizer as RPModelTokenizers) || RPModelTokenizers.LLAMA,
  permission: RPModelPermission.FREE,
  model_id_for_select: null,
  cost: 0,
  endpoint: {
    url: backend_config?.apiUrl || "http://localhost:2242/v1",
    api_key: backend_config?.apiKey || "",
    model: backend_config?.model || "default",
  },
};

class ModelServerSettingsStore {
  // 5 minutes TTL
  private SETTINGS_TTL_MS = 5 * 60 * 1000;
  private settings: ModelServerSettings = {
    rp_models: [
      DEFAULT_MODEL,
      {
        ...DEFAULT_MODEL,
        id: "RP_SMART",
      },
    ],
    embedding_server: {
      url: "",
      api_key: "",
    },
  };

  public constructor() {
    this.retrieveSettings();
    setInterval(() => this.retrieveSettings(), this.SETTINGS_TTL_MS);
  }

  public getRPModels(): RPModelSettings[] {
    return this.settings?.rp_models || [];
  }

  private async retrieveSettings(): Promise<void> {
    try {
      const result = await axios.get<ModelServerSettings>(
        process.env.MODEL_SERVER_SETTINGS_URL ||
          "http://localhost:8080/settings/models",
        {
          headers: {
            authorization: `Bearer ${
              process.env.MODEL_SERVER_SETTINGS_TOKEN || ""
            }`,
          },
        }
      );

      const errors = validateServicesSettings(result.data);
      if (errors.length > 0) {
        console.error("Invalid model server settings");
        console.error(errors);
        return;
      }

      this.settings = result.data;
    } catch (error) {
      console.error("Error while fetching model server settings", error);
    }
  }
}

export default new ModelServerSettingsStore();
