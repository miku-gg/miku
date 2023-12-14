import * as Miku from "@mikugg/core";
import PropTypes, { InferProps } from "prop-types";
import * as Guidance from "@mikugg/guidance";
import { replaceAll } from "../../memory/strategies";

const GUIDANCE_TEMPLATE = `You're an assistant that classify the emotions of a character based on the text description of the novel.
You MUST not repeat too much the same emotion. Each instruction MUST be a continuation of the previous one.
The emotion MUST be one from the following array:
[{{emotions_string}}]

Additionally, you should indicate the current pose of the character, it MUST be one from the following array:
[{{poses_string}}]

{{examples}}

### Instruction:
{{query}}

### Response:
EMOTION:{{SEL answer1 options=emotions}}
CURRENT POSE:{{SEL answer2 options=poses}}
IS PENETRATED:{{SEL answer3 options=boolean}}
`

const EXAMPLE_TEMPLATE = `### Instruction:
{{text}}

### Response:
EMOTION: {{emotion}}
CURRENT POSE: {{pose}}
`

export const EmotionGuidanceServiceInputPropTypes = {
  emotions: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ),
  poses: PropTypes.arrayOf(
    PropTypes.string.isRequired,
  ),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      emotion: PropTypes.string.isRequired,
      pose: PropTypes.string.isRequired,
      penetrated: PropTypes.bool,
    }),
  ),
  query: PropTypes.string,
};

export type EmotionGuidanceServiceInput = InferProps<typeof EmotionGuidanceServiceInputPropTypes>;
export type EmotionGuidandeServiceOutput = {
  emotion: string,
  pose: string,
  penetrated: boolean,
}

export interface EmotionGuidanceServiceConfig extends Miku.Services.ServiceConfig<EmotionGuidanceServiceInput, EmotionGuidandeServiceOutput> {
  aphroditeEndpoint: string;
  aphroditeApiKey: string;
}

export class EmotionGuidanceService extends Miku.Services.Service<EmotionGuidanceServiceInput, EmotionGuidandeServiceOutput> {
  private templateProcessor: Guidance.Template.TemplateProcessor;

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
    input: EmotionGuidanceServiceInput
  ): Promise<EmotionGuidandeServiceOutput> {
    const emotions = (input.emotions || []) as string[];
    const poses = (input.poses || []) as string[];
    const messages = input.messages || [];
    const query = input.query || '';
    const examples = messages.map((message) => {
      if (message?.text && message?.emotion && emotions.includes(message?.emotion) && message?.pose && poses.includes(message?.pose)) {
        const template = (
          EXAMPLE_TEMPLATE +
          (message?.penetrated !== undefined ? 'IS PENETRATED: {{penetrated}}' : '')
        );
        let example = replaceAll(template, '{{text}}', message?.text || '');
        example = replaceAll(example, '{{emotion}}', message?.emotion || '');
        example = replaceAll(example, '{{pose}}', message?.pose || '');
        example = replaceAll(example, '{{penetrated}}', message?.penetrated ? 'yes' : 'no');
        return example;
      } else {
        return '';
      }
    }).filter(_ => _).join('\n');
    const result = await this.templateProcessor.processTemplate(GUIDANCE_TEMPLATE, new Map<string, string[] | string>([
      ['emotions_string', emotions.join(', ')],
      ['emotions', emotions.map(e => ' ' + e)],
      ['poses_string', poses.join(', ') || ''],
      ['poses', poses.map(p => ' ' + p) || []],
      ['boolean', [' yes', ' no']],
      ['examples', examples],
      ['query', query],
    ]));
    return {
      emotion: (result.get('answer1') || emotions[0]).trim(),
      pose: (result.get('answer2') || poses[0]).trim(),
      penetrated: (result.get('answer3') || 'no').trim() === 'yes',
    };
  }

  protected override getDefaultInput(): EmotionGuidanceServiceInput {
    return {
      emotions: [],
      poses: [],
      messages: [],
      query: '',
    };
  }
  protected override getDefaultOutput(): EmotionGuidandeServiceOutput {
    return {
      emotion: '',
      pose: '',
      penetrated: false,
    };
  }

  protected override validateInput(input: EmotionGuidanceServiceInput): void {
    PropTypes.checkPropTypes(EmotionGuidanceServiceInputPropTypes, input, 'input', 'EmotionGuidanceServiceInput');
  }
}
