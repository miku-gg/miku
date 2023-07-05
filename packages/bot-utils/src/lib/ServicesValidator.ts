
import * as MikuExtensions from '@mikugg/extensions';
import PropTypes, { checkPropTypes } from 'prop-types';

class ServicesValidator {
  private services = new Map<MikuExtensions.Services.ServicesNames, PropTypes.ValidationMap<any>>();
  public addService(name: MikuExtensions.Services.ServicesNames, propTypes: PropTypes.ValidationMap<any>) {
    this.services.set(name, propTypes);
  }

  public getService(name: MikuExtensions.Services.ServicesNames) {
    return this.services.get(name);
  }

  public validateProps(name: MikuExtensions.Services.ServicesNames, props: object) {
    const service = this.getService(name);
    if (service) {
      checkPropTypes(service, props, 'props', name);
    } else {
      throw `Service ${name} not found`;
    }
  }
}

const servicesValidator = new ServicesValidator();

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.OpenAI,
  MikuExtensions.Services.OpenAIPromptCompleterServicePropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.Pygmalion,
  MikuExtensions.Services.PygmalionServicePropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.AzureTTS,
  MikuExtensions.Services.TTS.TTSServicePropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.ElevenLabsTTS,
  MikuExtensions.Services.TTS.TTSServicePropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.NovelAITTS,
  MikuExtensions.Services.TTS.TTSServicePropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.OpenAIEmotionInterpreter,
  MikuExtensions.Services.EmotionInterpreterPropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter,
  MikuExtensions.Services.SBertEmotionInterpreterPropTypes
);

servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.GPTShortTermMemory,
  {
    "prompt_context": PropTypes.string,
    "prompt_initiator": PropTypes.string,
    "language": PropTypes.oneOf(['en', 'es']),
    "subjects": PropTypes.arrayOf(PropTypes.string),
    "botSubject": PropTypes.string,
  }
);
servicesValidator.addService(
  MikuExtensions.Services.ServicesNames.GPTShortTermMemoryV2,
  {
    "prompt_context": PropTypes.string,
    "prompt_initiator": PropTypes.string,
    "language": PropTypes.oneOf(['en', 'es']),
    "subjects": PropTypes.arrayOf(PropTypes.string),
    "botSubject": PropTypes.string,
    "buildStrategySlug": PropTypes.string
  }
);

export default servicesValidator;