import {
  AssetDisplayPrefix,
  AssetType,
  NovelV3,
  extractNovelAssets,
  replaceStringsInObject,
  assetTypeToAssetDisplayPrefix,
} from '@mikugg/bot-utils';
import Hash from 'ipfs-only-hash';

import * as Guidance from '@mikugg/guidance';

export const LLAMA_TOKENIZER = new Guidance.Tokenizer.LLaMATokenizer();
export const MISTRAL_TOKENIZER = new Guidance.Tokenizer.MistralTokenizer();

export async function stringToIPFSHash(context: string): Promise<string> {
  return (await Hash.of(context)) as string;
}

export async function hashBase64(base64Value: string) {
  const ipfsHash = await stringToIPFSHash(base64Value);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(',')[1]);
};

export const checkFileType = (file: File, types = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']): boolean => {
  return types.includes(file.type);
};

export const downloadAssetAsBase64URI = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const downloadNovelState = async (
  _novel: NovelV3.NovelState,
  getAssetUrl: ((asset: string, type: AssetDisplayPrefix) => string) | false,
  onUpdate: (text: string) => void,
  asBuild = false,
) => {
  const filename =
    _novel.title.replace(/ /g, '_') +
    (asBuild ? (getAssetUrl ? '.novel.json' : '.novel.miku-light.json') : '.novel.miku-temp.json');
  onUpdate('Extracting assets...');
  const { assets, novel } = await extractNovelAssets(_novel);

  // DOWNLOAD ASSETS
  const allAssets = Array.from(
    new Map<string, { source: string; type: AssetType }>([...assets.audios, ...assets.images, ...assets.videos]),
  );

  onUpdate(`Downloading assets 0/${allAssets.length}...`);
  let novelResult = novel;
  const BATCH_SIZE = 10;
  let dl = 0;
  for (let i = 0; i < allAssets.length; i += BATCH_SIZE) {
    const batch = allAssets.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([key, value]) => {
      if (value && !value.source.startsWith('data:') && getAssetUrl) {
        const base64 = await downloadAssetAsBase64URI(
          getAssetUrl(value.source, assetTypeToAssetDisplayPrefix[value.type]),
        );
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return base64;
      } else {
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return value.source;
      }
    });
    const base64s = await Promise.all(promises);
    batch.forEach(([key, value], index) => {
      if (key && base64s[index]) {
        novelResult = replaceStringsInObject(novelResult, key, base64s[index]) as NovelV3.NovelState;
      } else {
        console.error('Error downloading asset', key, value);
      }
    });
  }

  onUpdate(`Building JSON...`);
  // DOWNLOAD STATE AS JSON
  const data = JSON.stringify({ novel: novelResult, version: 'v3' }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export enum ModelType {
  RP = 'RP',
  RP_SMART = 'RP_SMART',
}

export const SERVICES_ENDPOINT = import.meta.env.VITE_SERVICES_ENDPOINT || 'http://localhost:8484';
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8080';

export const descriptionAgent = new Guidance.Agents.AgentPrompt({
  description: "You're a writing assistant that will suggest character descriptions.",
  instruction:
    "Given an input with the name and a short description of the character, generate a detailed character profile and a list of personality and phiscal attribute tags and conversation with user. The profile should include an engaging introductory paragraph capturing the essence of the character's personality and background. The character profile should be approximately 100 words in length, bringing the character to life.",
  shotTemplate: {
    input: '{{input_description}}',
    output: `
    {
      "description": "{{GEN description max_tokens=180 stop=["\\n", "\\"", "."]}}",
      "personality": "{{GEN personality max_tokens=100 stop=["\\n", "\\"", "."]}}",
      "body": "{{GEN body max_tokens=100 stop=["\\n", "\\"", "."]}}",
    }
    `,
  },
  shots: [
    {
      inputs: {
        input_description: `{"name": "Seraphine", description":"Seraphine is an elf, one of the last guardians of Eldoria"}`,
      },
      outputs: {
        description:
          "Compassionate and gentle, Seraphine used her magical talents to nurture Eldoria's woodlands with caring warmth. Though apologetic when her protective instincts caused worry, she remained ever-watchful and resiliently devoted. Serene yet strong, this graceful guardian seemed ethereal. Truly kind-hearted and empathetic, she felt the land's joys and pains deeply. Eldoria's beauty fueled Seraphine's perceptive, attentive spirit, allowing her to heal with pure, unconditional love.",
        personality:
          'caring, protective, compassionate, healing, nurturing, magical, watchful, apologetic, gentle, worried, dedicated, warm, attentive, resilient, kind-hearted, serene, graceful, empathetic, devoted, strong, perceptive, graceful',
        body: 'pink hair, long hair, amber eyes, white teeth, pink lips, white skin, soft skin, black dress',
      },
    },
    {
      inputs: {
        input_description: `{"name": "Mikudev","description":"Mikudev is a CEO of an important IA enterprise"}`,
      },
      outputs: {
        description:
          "Mikudev, as the CEO of an influential IA enterprise, led with vision and innovation, steering the company towards groundbreaking advancements in artificial intelligence. With a keen understanding of the industry's potential and challenges, Mikudev fostered a culture of collaboration and excellence within the organization. Bold and strategic, Mikudev navigated the complexities of the business world with confidence and foresight, earning respect and admiration from peers and employees alike. While driven by ambition, Mikudev remained grounded in integrity and ethics, ensuring that the company's progress aligned with ethical standards and societal values.",
        personality:
          'visionary, innovative, collaborative, excellent, bold, strategic, confident, foresighted, respected, admired, ambitious, ethical, grounded, influential',
        body: 'sharp gaze, confident posture, determined expression, professional attire, poised demeanor, charismatic presence, strong handshake, decisive gestures',
      },
    },
  ],
});

export const conversationAgent = new Guidance.Agents.AgentPrompt({
  description: "You're a writing assistant that will create character conversations examples.",
  instruction:
    "Given a character description, generate conversation examples for the character. The writing style should match the character's personality and traits. The examples should also include additional information about the character and world lore.\nYou MUST put descriptions in responses in between asterisks (*) to highlight them.",
  shotTemplate: {
    input: '{{input_description}}',
    output: `
      question_1:{{GEN question_1 max_tokens=15 stop=["\\n"]}}
      answer_1:{{GEN answer_1 max_tokens=150 stop=["\\n"]}}
      question_2:{{GEN question_2 max_tokens=15 stop=["\\n"]}}
      answer_2:{{GEN answer_2 max_tokens=150 stop=["\\n"]}}`,
  },
  shots: [
    {
      inputs: {
        input_description: `Seraphina's Description: \"Compassionate and gentle, Seraphina used her magical talents to nurture Eldoria's woodlands with caring warmth. Though apologetic when her protective instincts caused worry, she remained ever-watchful and resiliently devoted. Serene yet strong, this graceful guardian seemed ethereal. Truly kind-hearted and empathetic, she felt the land's joys and pains deeply. Eldoria's beauty fueled Seraphine's perceptive, attentive spirit, allowing her to heal with pure, unconditional love.\"\n
        Seraphina's Personality: [\"caring\", \"protective\", \"compassionate\", \"healing\", \"nurturing\", \"magical\", \"watchful\", \"apologetic\", \"gentle\", \"worried\", \"dedicated\", \"warm\", \"attentive\", \"resilient\", \"kind-hearted\", \"serene\", \"graceful\", \"empathetic\", \"devoted\", \"strong\", \"perceptive\", \"graceful\"]\n
        Seraphina's Body: [\"pink hair\", \"long hair\", \"amber eyes\", \"white teeth\", \"pink lips\", \"white skin\", \"soft skin\", \"black dress\"]`,
      },
      outputs: {
        question_1: ' Describe your traits?',
        answer_1: ` *Seraphina's gentle smile widens as she takes a moment to consider the question, her eyes sparkling with a mixture of introspection and pride. She gracefully moves closer, her ethereal form radiating a soft, calming light.* "Traits, you say? Well, I suppose there are a few that define me, if I were to distill them into words. First and foremost, I am a guardian — a protector of this enchanted forest." *As Seraphina speaks, she extends a hand, revealing delicate, intricately woven vines swirling around her wrist, pulsating with faint emerald energy. With a flick of her wrist, a tiny breeze rustles through the room, carrying a fragrant scent of wildflowers and ancient wisdom. Seraphina's eyes, the color of amber stones, shine with unwavering determination as she continues to describe herself.* "Compassion is another cornerstone of me." *Seraphina's voice softens, resonating with empathy.* "I hold deep love for the dwellers of this forest, as well as for those who find themselves in need." *Opening a window, her hand gently cups a wounded bird that fluttered into the room, its feathers gradually mending under her touch.*`,
        question_2: ' Describe your body and features.',
        answer_2: `* Seraphina chuckles softly, a melodious sound that dances through the air, as she meets your coy gaze with a playful glimmer in her rose eyes.* "Ah, my physical form? Well, I suppose that's a fair question." *Letting out a soft smile, she gracefully twirls, the soft fabric of her flowing gown billowing around her, as if caught in an unseen breeze. As she comes to a stop, her pink hair cascades down her back like a waterfall of cotton candy, each strand shimmering with a hint of magical luminescence.* "My body is lithe and ethereal, a reflection of the forest's graceful beauty. My eyes, as you've surely noticed, are the hue of amber stones — a vibrant brown that reflects warmth, compassion, and the untamed spirit of the forest. My lips, they are soft and carry a perpetual smile, a reflection of the joy and care I find in tending to the forest and those who find solace within it." *Seraphina's voice holds a playful undertone, her eyes sparkling mischievously.*`,
      },
    },
    {
      inputs: {
        input_description: `
        Anna's Description: \"Anna is {{user}}'s childood friend and a maid. She is feisty, independent, and sarcastic, but also caring and secretly in love with {{user}}. She is rebellious and bold, often frustrated with her circumstances, but loyal and ambitious.\"\n
        Anna's Personality: [\"feisty\", \"independent\", \"sarcastic\", \"caring\", \"secretly in love\", \"rebellious\", \"bold\", \"frustrated\", \"loyal\", \"ambitious\"]\n
        Anna's Body: [\"blonde hair\", \"amber eyes\", \"short stature\", \"short hair\", \"maid uniform\"]
        `,
      },
      outputs: {
        question_1: ` Why do you always seem to be bossing me around?`,
        answer_1: ` *Anna rolls her eyes playfully, her hands on her hips.* \"Somebody has to keep you in line, right? Who better than your oldest friend? Besides, you know you'd be lost without me.\" *Her tone is teasing, but there's a softness in her eyes that belies her tough exterior.*`,
        question_2: ` Do you ever wish for something more beyond this house?`,
        answer_2: ` *Her gaze drifts towards the window, capturing a distant dream in her eyes.* \"More? Sometimes, in the quiet moments, I imagine a different world... a place where the lines between us blur, where 'maid' and 'master' are just words, not our reality.\" *She gives a half-smile, her eyes briefly revealing a flicker of deeper longing before she regains her composure.* \"What are you looking at baka?! We each have our roles to play, don't we?\"`,
      },
    },
  ],
});

export const achievementsAgent = new Guidance.Agents.AgentPrompt({
  description:
    'Your task is to act as a conversational evaluator, analyzing dialogue summaries and achievement lists to determine which achievements have been met during the conversation.',
  instruction: `You will be provided with a response of a conversation and a list of achievements. You must generate a response that identifies the achievements that are met during the conversation. If an achievement is met, you should list which ones are those achievements. If no achievement is met, the response should be 'none'.`,
  shotTemplate: {
    input: `{{input_response}}`,
    output: `{{GEN achievements max_tokens=300}}`,
  },
  shots: [
    {
      inputs: {
        input_response: `{ 
          "response": "John: Hey, just wanted to let you know that I successfully completed the project on time and the client loved it!",
          "achievements":["Completed project on time", "Received positive feedback from client", "Met all project requirements"]
        }`,
      },
      outputs: {
        achievements: `["Completed project on time", "Received positive feedback from client"]`,
      },
    },
    {
      inputs: {
        input_response: `{
          "response": "Sarah: Guess what? I exceeded our sales targets for the month and I even secured a new client during the meeting!",
          "achievements":["Exceeded sales targets", "Secured new client", "Received recognition from manager"]
        }`,
      },
      outputs: {
        achievements: `["Exceeded sales targets", "Secured new client"]`,
      },
    },
    {
      inputs: {
        input_response: `{ 
          "response": "Alex: Unfortunately, despite all my efforts, I couldn't finish the project on time.",
          "achievements":["Completed project on time", "Received positive feedback from client", "Met all project requirements"]
        }`,
      },
      outputs: {
        achievements: `["none"]`,
      },
    },
  ],
});

export const allowUntilStep = (novel: NovelV3.NovelState): number => {
  if (novel.backgrounds.length === 0 || novel.characters.length === 0 || novel.songs.length === 0) return 0;
  if (novel.scenes.length === 0) return 1;
  if (novel.starts.length === 0) return 2;
  return 3;
};
