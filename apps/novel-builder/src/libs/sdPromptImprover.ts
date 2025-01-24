import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import { callChatCompletion, FunctionDefinition } from './assistantCall';

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
            'Detailed head features including face shape, eye color/style, hair color/style, facial marks, head accessories',
        },
        character_body: {
          type: 'string',
          description: 'Body characteristics including gender indicator (1girl/1boy), build, proportions',
        },
        character_outfit: {
          type: 'string',
          description: 'Detailed clothing and accessories from neck down, including colors and materials',
        },
      },
      required: ['character_head', 'character_body', 'character_outfit'],
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler: async (args: {
      character_head: string;
      character_body: string;
      character_outfit: string;
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
        const args = JSON.parse(toolCall.function.arguments);
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
