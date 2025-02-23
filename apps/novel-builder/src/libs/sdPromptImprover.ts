import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import { callChatCompletion, FunctionDefinition } from './assistantCall';

// neutral_with_left_arm_in_belly pose2
// neutral_looking_right pose3
// neutral_looking_left post5
// waving_left_hand pose6
// hands_on_hips pose7
// full_body_girl_walking pose8
// full_body_fist_energy pose9
// full_body_explaining pose10
// wrapped_arms_crossed_legs pose13
// leaning_in_with_hand_in_legs pose14
// leaning_in_waving_hand pose15
// hands_on_hips_crossed_legs pose18
// touching_hair pose21
// princess_like_standing pose22
// moving_as_if_running pose23
export const poses: Record<string, string> = {
  neutral_with_left_arm_in_belly: 'pose2.jpg',
  neutral_looking_right: 'pose3.jpg',
  neutral_looking_left: 'pose5.jpg',
  waving_left_hand: 'pose6.jpg',
  hands_on_hips: 'pose7.jpg',
  full_body_girl_walking: 'pose8.jpg',
  full_body_fist_energy: 'pose9.jpg',
  full_body_explaining: 'pose10.jpg',
  wrapped_arms_crossed_legs: 'pose13.jpg',
  leaning_in_with_hand_in_legs: 'pose14.jpg',
  leaning_in_waving_hand: 'pose15.jpg',
  hands_on_hips_crossed_legs: 'pose18.jpg',
  touching_hair: 'pose21.jpg',
  princess_like_standing: 'pose22.jpg',
  moving_as_if_running: 'pose23.jpg',
};

class CharacterPromptGenerator {
  private functionSchema: FunctionDefinition = {
    name: 'send_stable_diffusion_prompt',
    description: 'Generates a detailed character prompt for Stable Diffusion image generation',
    parameters: {
      type: 'object',
      properties: {
        character_head: {
          type: 'string',
          description:
            'Detailed head features including face shape, eye color/style, hair color/style, facial marks, head accessories. Do not include face expressions.',
        },
        character_body: {
          type: 'string',
          description: 'Body characteristics including gender indicator (1girl/1boy), build, proportions',
        },
        character_outfit: {
          type: 'string',
          description: 'Detailed clothing and accessories from neck down, including colors and materials',
        },
        pose: {
          type: 'string',
          enum: Object.keys(poses),
          description: 'Indicate the most likely pose for the character image.',
        },
      },
      required: ['character_head', 'character_body', 'character_outfit', 'pose'],
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: async (args: {
      character_head: string;
      character_body: string;
      character_outfit: string;
      pose: string;
    }): Promise<string> => {
      return 'Success';
    },
    displayData: { isSetter: false },
  };

  private exampleConversations: ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: 'Create a prompt for a nurse character',
    },
    {
      role: 'assistant',
      content: "I'll create a detailed nurse character prompt.",
      function_call: {
        name: 'send_stable_diffusion_prompt',
        arguments: JSON.stringify({
          character_head:
            'emerald green eyes,long braided platinum blonde hair,pink hair highlights,small beauty mark under left eye,white nurse cap with red cross,pearl earrings',
          character_body: '1girl,highres,slim athletic build,medium height',
          character_outfit:
            'white starched nurse uniform dress,red cross armband,white stockings,polished white leather shoes,silver stethoscope around neck,name tag on chest pocket',
          pose: 'neutral_with_left_arm_in_belly',
        }),
      },
    },
    {
      role: 'user',
      content: 'warrior girl that looks like jinx from arcane',
    },
    {
      role: 'assistant',
      content: "I'll create a detailed prompt based on Jinx's appearance with a warrior theme.",
      function_call: {
        name: 'send_stable_diffusion_prompt',
        arguments: JSON.stringify({
          character_head:
            'large magenta pink eyes,long electric blue hair in twin braids,side-shaved undercut,scattered freckles across nose and cheeks,thin arched eyebrows,black smokey eyeshadow,small scar above right eyebrow,industrial ear piercings,black choker with metal studs',
          character_body: '1girl,highres,lean athletic build,pale skin,slender frame',
          character_outfit:
            'distressed black crop top,tactical military vest,ammunition belts crossed over chest,dark gray cargo pants with multiple pockets,heavy black combat boots with steel toe caps,fingerless leather gloves,leather straps around thighs,metal shoulder pauldron on left shoulder,utility belt with pouches,brass bullet casings as jewelry',
          pose: 'moving_as_if_running',
        }),
      },
    },
  ];

  private systemPrompt: ChatCompletionMessageParam = {
    role: 'system',
    content: `You are a specialized AI designed to generate highly detailed character prompts for Stable Diffusion image generation. Your role is to break down brief character descriptions into extremely specific prompts that ensure consistency across multiple generations.

Key requirements:
- Focus ONLY on character appearance and attire
- DO NOT include backgrounds, poses, scenes, or camera angles
- Be extremely specific with colors, materials, and details
- Use proper Stable Diffusion syntax with commas separating elements
- Include appropriate gender tags (1girl, 1boy)
- Escape special characters with double backslashes
- DO NOT include face expressions in the prompt
- Indicate the pose that best represents the character's personality

Break down all character elements into face features, body characteristics, and outfit details.`,
  };

  async generatePrompt(characterDescription: string) {
    const messages: ChatCompletionMessageParam[] = [
      this.systemPrompt,
      ...this.exampleConversations,
      {
        role: 'user',
        content: characterDescription,
      },
    ];

    try {
      const response = await callChatCompletion(
        messages,
        [{ type: 'function', function: this.functionSchema }],
        false, // parallel_tool_calls
        'required', // tool_choice
      );

      const toolCalls = response?.choices[0].message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        const args = JSON.parse(toolCall.function.arguments) as {
          character_head: string;
          character_body: string;
          character_outfit: string;
          pose: string;
        };
        return {
          success: true,
          prompt: `${args.character_head},${args.character_body},${args.character_outfit}`,
          components: args,
        };
      }

      throw new Error('No valid function call received');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Example usage:
const generator = new CharacterPromptGenerator();
export default generator;

// Generate a prompt example
//   console.log('running example');
//   const result = await generator.generatePrompt('hacker girl character');
//   console.log(result);

export const emotionSuffixPrompts: Record<string, string> = {
  angry: '(angry:1.3),',
  sad: '(sad:1.3), teary eyes, downturned mouth, looking down, (tired:1.2)',
  happy: '(happy:1.3), bright eyes, relaxed, (laughing:1.2)',
  disgusted: '(disgusted:1.3), open mouth, unhappy, glare, glaring at viewer',
  scared: '(scared:1.2), open mouth, sweaty, fearful',
  embarrased: '(embarrassed:1.3), (blushing:1.2), (looking down:1.4), nervous',
  surprised: '(surprised:1.3), open mouth, looking at viewer',
  neutral: '(relaxed:1.4), looking at viewer, calm, (slight smile:0.9)',
  confused: '(thinking:1.3), (confused:1.3)',
};

export const getPromptForEmotion = (emotion: string, headPrompt = '') => {
  if (!Object.keys(emotionSuffixPrompts).includes(emotion)) {
    throw `Invalid emotion for generation: "${emotion}"`;
  }

  return `${headPrompt},${emotionSuffixPrompts[emotion]}`;
};
