import axios from 'axios';
import { RPModelSettings } from '../data/rpModelTypes.mjs';

// Every 5 minutes
const CHECK_INTERVAL = 5 * 60 * 1000;

const modelHealth: Map<
  string,
  {
    status: boolean;
    lastCheck: Date;
    endpoint: {
      url: string;
      api_key: string;
      model: string;
    };
  }
> = new Map();

export const getModelHealth = (modelId: string): boolean => {
  const model = modelHealth.get(modelId);
  if (!model) return true;
  return model.status;
};

export const setModelHealthChecker = (modelSettings: RPModelSettings) => {
  modelHealth.set(modelSettings.id, {
    status: true,
    lastCheck: new Date(),
    endpoint: modelSettings.endpoint,
  });
};

// Health check
(async () => {
  const checkHealthObj = {
    fn: async () => {
      for (const [modelId, model] of modelHealth) {
        try {
          const healthUrl = model.endpoint.url.replace('/v1', '/health');
          const result = await axios.get(healthUrl, {});
          if (result.status !== 200) {
            model.status = false;
          } else {
            model.status = true;
          }
        } catch (error) {
          model.status = false;
        }
        model.lastCheck = new Date();
      }
      setTimeout(checkHealthObj['fn'], CHECK_INTERVAL);
    },
  };
  checkHealthObj.fn();
})();
