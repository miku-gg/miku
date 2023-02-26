import * as MikuExtensions from '@mikugg/extensions';
import PropTypes from 'prop-types';
import servicesValidator from "./lib/ServicesValidator"

export const BotConfigPropTypes = {
  "bot_name": PropTypes.string.isRequired,
  "version": PropTypes.string.isRequired,
  "subject": PropTypes.string.isRequired,
  "profile_pic": PropTypes.string.isRequired,
  "background_pic": PropTypes.string.isRequired,
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
}

export type BotConfig = PropTypes.InferProps<typeof BotConfigPropTypes>;

export function validateBotConfig(config: BotConfig): void {
  PropTypes.checkPropTypes(BotConfigPropTypes, config, 'config', 'BotConfig');
  servicesValidator.validateProps(config.short_term_memory.service, config.short_term_memory.props);
  servicesValidator.validateProps(config.prompt_completer.service, config.prompt_completer.props);
  config.outputListeners.forEach((service) => {
    servicesValidator.validateProps(service.service, service.props);
  });
}