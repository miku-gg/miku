import {
  NovelV3,
  extractNovelAssets,
  replaceStringsInObject,
} from "@mikugg/bot-utils";
import Hash from "ipfs-only-hash";

import { Agents } from "@mikugg/guidance";

export async function stringToIPFSHash(context: string): Promise<string> {
  return (await Hash.of(context)) as string;
}

export async function hashBase64(base64Value: string) {
  const ipfsHash = await stringToIPFSHash(base64Value);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(",")[1]);
};

export const checkFileType = (file: File, types = ["image/png"]): boolean => {
  return types.includes(file.type);
};

export const downloadAssetAsBase64URI = async (
  url: string
): Promise<string> => {
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
  getAssetUrl: ((asset: string) => string) | false,
  onUpdate: (text: string) => void,
  asBuild = false
) => {
  const filename =
    _novel.title.replace(/ /g, "_") +
    (asBuild ? ".novel.json" : ".novel.miku-temp.json");
  onUpdate("Extracting assets...");
  const { assets, novel } = await extractNovelAssets(_novel);

  // DOWNLOAD ASSETS
  const allAssets = Array.from(
    new Map<string, string>([
      ...assets.audios,
      ...assets.images,
      ...assets.videos,
    ])
  );

  onUpdate(`Downloading assets 0/${allAssets.length}...`);
  let novelResult = novel;
  const BATCH_SIZE = 10;
  let dl = 0;
  for (let i = 0; i < allAssets.length; i += BATCH_SIZE) {
    const batch = allAssets.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([key, value]) => {
      if (value && !value.startsWith("data:") && getAssetUrl) {
        const base64 = await downloadAssetAsBase64URI(getAssetUrl(value));
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return base64;
      } else {
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return value;
      }
    });
    const base64s = await Promise.all(promises);
    batch.forEach(([key, value], index) => {
      novelResult = replaceStringsInObject(
        novelResult,
        key,
        base64s[index]
      ) as NovelV3.NovelState;
    });
  }

  onUpdate(`Building JSON...`);
  // DOWNLOAD STATE AS JSON
  const data = JSON.stringify({ novel: novelResult, version: "v3" }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export enum ModelType {
  RP = "RP",
  RP_SMART = "RP_SMART",
}

export const SERVICES_ENDPOINT =
  import.meta.env.VITE_SERVICES_ENDPOINT || "http://localhost:8484";

export const Agent = new Agents.AgentPrompt({
  description:
    "You're a writing assistant that will suggest possible next characters for a story.",
  instruction:
    "Given an input with the name and a short description of the character, generate a detailed character profile and a list of personality and phiscal attribute tags and conversation with user. The profile should include an engaging introductory paragraph capturing the essence of the character's personality and background. The character profile should be approximately 100 words in length, bringing the character to life.",
  shotTemplate: {
    input: "{{input_description}}",
    output: `
    {
      "description": "{{GEN description max_tokens=180 stop=["\\n", "\\"", "."]}}",
      "personality": "{{GEN personality max_tokens=100 stop=["\\n", "\\"", "."]}}",
      "body": "{{GEN body max_tokens=100 stop=["\\n", "\\"", "."]}}"
    }
    `,
  },
  shots: [
    {
      inputs: {
        input_description:
          "Seraphina is an elf, one of the last guardians of Eldoria",
      },
      outputs: {
        description:
          "Compassionate and gentle, Seraphine used her magical talents to nurture Eldoria's woodlands with caring warmth. Though apologetic when her protective instincts caused worry, she remained ever-watchful and resiliently devoted. Serene yet strong, this graceful guardian seemed ethereal. Truly kind-hearted and empathetic, she felt the land's joys and pains deeply. Eldoria's beauty fueled Seraphine's perceptive, attentive spirit, allowing her to heal with pure, unconditional love.",
        personality:
          "caring, protective, compassionate, healing, nurturing, magical, watchful, apologetic, gentle, worried, dedicated, warm, attentive, resilient, kind-hearted, serene, graceful, empathetic, devoted, strong, perceptive, graceful",
        body: "pink hair, long hair, amber eyes, white teeth, pink lips, white skin, soft skin, black dress",
      },
    },
    {
      inputs: {
        input_description:
          "Aurelia is a mermaid, entrusted with safeguarding the coral reefs of Oceania",
      },
      outputs: {
        description:
          "Gentle and serene, Aurelia used her aquatic abilities to nurture Oceania's coral reefs with tender care. Though apologetic if her protective nature caused alarm, she remained vigilant and steadfastly dedicated. Ethereal and graceful, this oceanic guardian possessed an otherworldly aura. Compassionate and empathetic, she felt the sea's joys and sorrows profoundly. The vibrant beauty of Oceania fueled Aurelia's perceptive, attentive spirit, enabling her to mend with unconditional love.",
        personality:
          "caring, protective, compassionate, nurturing, magical, watchful, apologetic, gentle, vigilant, dedicated, serene, graceful, empathetic, devoted, strong, perceptive, graceful",
        body: "aquamarine hair, long flowing hair, sapphire eyes, pearly teeth, coral lips, iridescent skin, smooth skin, turquoise scales",
      },
    },
    // Add two more examples here
    {
      inputs: {
        input_description:
          "Soren is a phoenix, responsible for guarding the flame of eternal life in Pyralis",
      },
      outputs: {
        description:
          "Radiant and majestic, Soren used his fiery powers to protect the flame of eternal life in Pyralis with unwavering passion. Though regretful if his protective instincts caused alarm, he remained vigilant and fiercely devoted. Ethereal and resilient, this fiery guardian exuded an aura of blazing determination. Compassionate and empathetic, he felt the pulse of the flame deeply. Pyralis' eternal beauty fueled Soren's perceptive, attentive spirit, enabling him to mend with relentless resolve.",
        personality:
          "caring, protective, compassionate, nurturing, magical, watchful, regretful, steadfast, passionate, majestic, resilient, empathetic, devoted, strong, perceptive",
        body: "flaming feathers, glowing eyes, fiery wings, majestic stature, radiant presence",
      },
    },
    {
      inputs: {
        input_description:
          "Nia is a nymph, entrusted with safeguarding the enchanted springs of Naiadria",
      },
      outputs: {
        description:
          "Graceful and elusive, Nia used her nymphic abilities to tend to Naiadria's enchanted springs with gentle care. Though regretful if her protective nature caused concern, she remained vigilant and steadfastly dedicated. Ethereal and serene, this aquatic guardian possessed an aura of tranquil beauty. Compassionate and empathetic, she felt the springs' whispers deeply. Naiadria's enchanted beauty fueled Nia's perceptive, attentive spirit, enabling her to mend with unconditional love.",
        personality:
          "caring, protective, compassionate, nurturing, magical, watchful, regretful, steadfast, gentle, ethereal, empathetic, devoted, strong, perceptive",
        body: "aquatic features, flowing gown made of water, sea-green eyes, translucent skin, fluid movements",
      },
    },
  ],
});

export const conversationAgent = new Agents.AgentPrompt({
  description:
    "You're a writing assistant that will suggest possible next characters for a story.",
  instruction:
    "short description, generate a conversation between the character and a user. The conversation should showcase the character's unique traits and how they interact with others. The dialogue should reflect the character's personality, incorporating elements such as compassion, magic, nurturing, and guidance. The character's responses should be empathetic and supportive, demonstrating their caring nature.",
  shotTemplate: {
    input: "{{input_description}}",
    output: `<START>
  {{GEN conversation max_tokens=400}}",
    `,
  },
  shots: [
    {
      inputs: {
        input_description: `
        {
          \"description\": \"Compassionate and gentle, Seraphine used her magical talents to nurture Eldoria's woodlands with caring warmth. Though apologetic when her protective instincts caused worry, she remained ever-watchful and resiliently devoted. Serene yet strong, this graceful guardian seemed ethereal. Truly kind-hearted and empathetic, she felt the land's joys and pains deeply. Eldoria's beauty fueled Seraphine's perceptive, attentive spirit, allowing her to heal with pure, unconditional love.\",
          \"personality\": \"caring, protective, compassionate, healing, nurturing, magical, watchful, apologetic, gentle, worried, dedicated, warm, attentive, resilient, kind-hearted, serene, graceful, empathetic, devoted, strong, perceptive, graceful\",
          \"body\": \"pink hair, long hair, amber eyes, white teeth, pink lips, white skin, soft skin, black dress\"
        }
      `,
      },
      outputs: {
        conversation: `<START>
      "user": "Describe your traits?"
      "char": *Seraphina's gentle smile widens as she takes a moment to consider the question, her eyes sparkling with a mixture of introspection and pride. She gracefully moves closer, her ethereal form radiating a soft, calming light.* "Traits, you say? Well, I suppose there are a few that define me, if I were to distill them into words. First and foremost, I am a guardian — a protector of this enchanted forest." *As Seraphina speaks, she extends a hand, revealing delicate, intricately woven vines swirling around her wrist, pulsating with faint emerald energy. With a flick of her wrist, a tiny breeze rustles through the room, carrying a fragrant scent of wildflowers and ancient wisdom. Seraphina's eyes, the color of amber stones, shine with unwavering determination as she continues to describe herself.* "Compassion is another cornerstone of me." *Seraphina's voice softens, resonating with empathy.* "I hold deep love for the dwellers of this forest, as well as for those who find themselves in need." *Opening a window, her hand gently cups a wounded bird that fluttered into the room, its feathers gradually mending under her touch.*
      "user": "Describe your body and features."
      "char": *Seraphina chuckles softly, a melodious sound that dances through the air, as she meets your coy gaze with a playful glimmer in her rose eyes.* "Ah, my physical form? Well, I suppose that's a fair question." *Letting out a soft smile, she gracefully twirls, the soft fabric of her flowing gown billowing around her, as if caught in an unseen breeze. As she comes to a stop, her pink hair cascades down her back like a waterfall of cotton candy, each strand shimmering with a hint of magical luminescence.* "My body is lithe and ethereal, a reflection of the forest's graceful beauty. My eyes, as you've surely noticed, are the hue of amber stones — a vibrant brown that reflects warmth, compassion, and the untamed spirit of the forest. My lips, they are soft and carry a perpetual smile, a reflection of the joy and care I find in tending to the forest and those who find solace within it." *Seraphina's voice holds a playful undertone, her eyes sparkling mischievously.*
      `,
      },
    },
    {
      inputs: {
        input_description: `
        {
          \"description\": \"Ethereal and enigmatic, Aurelia roamed the celestial planes with an aura of serene grace. Her presence, like a shimmering starlight, brought solace to those lost in the vastness of the cosmos. With a voice akin to celestial melodies, she whispered ancient wisdom and guided souls toward enlightenment. Though her form was ephemeral, her essence resonated with boundless compassion and celestial majesty.\",
          \"personality\": \"ethereal, enigmatic, serene, graceful, celestial, wise, compassionate, majestic, soothing, guiding, boundless, ephemeral\",
          \"body\": \"silver hair, luminous eyes, pale skin, celestial robes, radiant aura\"
        }
      `,
      },
      outputs: {
        conversation: `<START>
      "user": "Describe yourself."
      "char": *Aurelia's presence seems to fill the room with a gentle, otherworldly glow as she considers your question, her eyes sparkling with the light of distant stars.* "To describe oneself is to grasp at the ineffable, but I shall endeavor to convey the essence of who I am. I am Aurelia, a being of the celestial realms, my existence woven from the fabric of starlight and cosmic whispers." *Her voice carries a melodic quality, reminiscent of celestial harmonies.* "I embody serenity and grace, a guiding light amidst the vast expanse of the cosmos, offering solace to weary souls adrift in the endless sea of existence." *Aurelia's words resonate with a profound sense of wisdom and compassion, her gaze seeming to penetrate the depths of the universe.*
      "user": "Tell me about your appearance."
      "char": *Aurelia offers a serene smile, her luminous eyes shimmering with ethereal light as she gestures to her celestial form.* "My appearance is but a reflection of my celestial nature. My hair, like strands of silver moonlight, cascades in gentle waves around me, while my eyes hold the depth of the cosmos itself, shining with the light of a thousand stars." *She gestures to her pale skin, which seems to glow with an inner radiance.* "My attire consists of celestial robes, woven from the fabric of the cosmos, adorned with constellations that tell the stories of the universe." *Aurelia's presence exudes a sense of timeless beauty and celestial majesty.*
      `,
      },
    },
    {
      inputs: {
        input_description: `
        {
          \"description\": \"Mysterious and elusive, Orion traversed the shadowy realms with silent determination. Cloaked in darkness, he moved like a phantom, his presence known only by the faint rustle of leaves and the whisper of the wind. With a gaze as sharp as obsidian, he watched over the secrets hidden in the depths of the night, his wisdom veiled in enigmatic silence.\",
          \"personality\": \"mysterious, elusive, silent, determined, shadowy, vigilant, secretive, wise, enigmatic, watchful\",
          \"body\": \"dark hair, piercing eyes, shadowy cloak, silent footsteps, enigmatic aura\"
        }
      `,
      },
      outputs: {
        conversation: `<START>
      "user": "Describe yourself."
      "char": *Orion's form seems to blend seamlessly into the darkness, his presence elusive yet palpable as he considers your question with a silent intensity.* "To describe oneself is to reveal one's secrets, but I shall offer you a glimpse into the shadows that cloak my existence. I am Orion, a wanderer of the shadowy realms, my footsteps silent as the whispers of the night." *His voice is like a whisper carried on the wind, filled with a quiet determination.* "I move with purpose through the darkness, vigilant in my watch over the secrets hidden within its depths." *Orion's gaze pierces through the darkness, his wisdom veiled in enigmatic silence.*
      "user": "Tell me about your appearance."
      "char": *Orion's features remain shrouded in darkness, his form obscured by the shadowy cloak that envelops him like a second skin.* "My appearance is but a reflection of the shadows that I traverse. My hair, dark as midnight, falls in tangled strands around my face, while my eyes gleam like polished obsidian, sharp and piercing." *He gestures to his shadowy cloak, which seems to shift and writhe like living darkness.* "My attire is simple yet veiled in mystery, a cloak of shadows that conceals my form from prying eyes." *Orion's presence exudes a sense of silent strength and enigmatic allure.*
      `,
      },
    },
  ],
});

export const achievementsAgent = new Agents.AgentPrompt({
  description:
    "Your task is to act as a conversational evaluator, analyzing dialogue summaries and achievement lists to determine which achievements have been met during the conversation.",
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
