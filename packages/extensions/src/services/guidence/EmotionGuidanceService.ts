import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import * as Guidance from "@mikugg/guidance";
import { replaceAll } from "../../memory/strategies";

const GUIDANCE_TEMPLATE = `You're an assistant that classify the emotions of a character based on the text description of the novel.
You MUST not repeat too much the same emotion.
The emotion MUST be one from the following array:
{{emotions_string}}

{{examples}}

### Instruction:
{{query}}

### Response:
{{SEL answer options=emotions}}
`

const EXAMPLE_TEMPLATE = `### Instruction:
{{text}}

### Response:
 {{emotion}}
`

export const EmotionGuidanceServicePropTypes = {
  emotions: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      emotion: PropTypes.string.isRequired,
    }),
  ),
  query: PropTypes.string,
};

export type EmotionGuidanceServiceProps = InferProps<typeof EmotionGuidanceServicePropTypes>;

export interface EmotionGuidanceServiceConfig extends Miku.Services.ServiceConfig {
  aphroditeEndpoint: string;
  aphroditeApiKey: string;
}

export class EmotionGuidanceService extends Miku.Services.Service<string> {
  private templateProcessor: Guidance.Template.TemplateProcessor;
  protected defaultProps: InferProps<
    typeof EmotionGuidanceServicePropTypes
  > = {
    emotions: [],
    messages: [],
    query: '',
  };

  protected getPropTypes(): PropTypes.ValidationMap<any> {
    return EmotionGuidanceServicePropTypes;
  }

  constructor(config: EmotionGuidanceServiceConfig) {
    super(config);
    this.templateProcessor = new Guidance.Template.TemplateProcessor(
      new Guidance.Tokenizer.LLaMATokenizer,
      new Guidance.TokenGenerator.OpenAITokenGenerator({
        apiKey: config.aphroditeApiKey,
        baseURL: config.aphroditeEndpoint,
        model: 'default',
      })
    );
  }

  protected async computeInput(
    input: InferProps<typeof EmotionGuidanceServicePropTypes>
  ): Promise<string> {
    const emotions = (input.emotions || []) as string[];
    const messages = input.messages || [];
    const query = input.query || '';
    const examples = messages.map((message) => {
      if (message?.text && message?.emotion && emotions.includes(message?.emotion)) {
        let example = replaceAll(EXAMPLE_TEMPLATE, '{{text}}', message?.text || '');
        example = replaceAll(example, '{{emotion}}', message?.emotion || '');
        return example;
      } else {
        return '';
      }
    }).filter(_ => _).join('\n');
    const result = await this.templateProcessor.processTemplate(GUIDANCE_TEMPLATE, new Map<string, string[] | string>([
      ['emotions_string', emotions.join(', ')],
      ['examples', examples],
      ['query', query],
      ['emotions', emotions.map(e => ' ' + e)],
    ]));
    return (result.get('answer') || emotions[0]).trim();
  }

  protected async calculatePrice(
    input: InferProps<typeof EmotionGuidanceServicePropTypes>
  ): Promise<number> {
    return 0;
  }
}
