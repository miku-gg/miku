import * as MikuExtensions from '@mikugg/extensions';
import PropTypes from 'prop-types';
import servicesValidator from "./lib/ServicesValidator"

// Base PropTypes
const BaseBotConfigPropTypes = {
  bot_name: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  profile_pic: PropTypes.string.isRequired,
  configVersion: PropTypes.number,
  "short_term_memory": PropTypes.shape({
    "service": PropTypes.oneOf<MikuExtensions.Services.ServicesNames>(Object.values(MikuExtensions.Services.ServicesNames)).isRequired,
    "props": PropTypes.object.isRequired,
  }).isRequired,
  "prompt_completer": PropTypes.shape({
    "service": PropTypes.oneOf<MikuExtensions.Services.ServicesNames>(Object.values(MikuExtensions.Services.ServicesNames)).isRequired,
    "props": PropTypes.object.isRequired,
  }).isRequired,
  "outputListeners": PropTypes.arrayOf(PropTypes.shape({
    "service": PropTypes.oneOf<MikuExtensions.Services.ServicesNames>(Object.values(MikuExtensions.Services.ServicesNames)).isRequired,
    "props": PropTypes.object.isRequired,
  }).isRequired).isRequired,
  description: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
};

// Version 1 PropTypes
const BotConfigV1PropTypes = {
  ...BaseBotConfigPropTypes,
  background_pic: PropTypes.string.isRequired,
};

// Version 2 PropTypes
const BotConfigV2PropTypes = {
  ...BaseBotConfigPropTypes,
  configVersion: PropTypes.oneOf([2]).isRequired,
  backgrounds: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
};

// Type Definitions
export type BotConfigV1 = PropTypes.InferProps<typeof BotConfigV1PropTypes>;
export type BotConfigV2 = PropTypes.InferProps<typeof BotConfigV2PropTypes>;
export type BotConfig = BotConfigV1 | BotConfigV2;

// Validation Function
export function validateBotConfig(config: BotConfig): void {
  servicesValidator.validateProps(config.short_term_memory.service, config.short_term_memory.props);
  servicesValidator.validateProps(config.prompt_completer.service, config.prompt_completer.props);
  config.outputListeners.forEach((service) => {
    servicesValidator.validateProps(service.service, service.props);
  });

  if (!config.configVersion) {
    PropTypes.checkPropTypes(BotConfigV1PropTypes, config, 'config', 'BotConfigV1');
  } else {
    switch (config.configVersion) {
      case 2:
        PropTypes.checkPropTypes(BotConfigV2PropTypes, config, 'config', 'BotConfigV2');
        break;
      // Add more cases for newer config versions in the future
      default:
        throw `Unsupported configVersion: ${config.configVersion}`;
    }
  }
}
