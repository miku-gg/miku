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

export const Agent = new Agents.AgentPrompt({
  description:
    "You're a writing assistant that will suggest possible next characters for a story.",
  instruction:
    "Given an input with the name and a short description of the character, generate a detailed character profile and a list of personality and phiscal attribute tags and conversation with user. The profile should include an engaging introductory paragraph capturing the essence of the character's personality and background. The character profile should be approximately 100 words in length, bringing the character to life.",
  shotTemplate: {
    input: "{{input_description}}",
    output: `
    {
      "description": "{{GEN description max_tokens=100 stop=["\\n", "\\"", "."]}}",
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
