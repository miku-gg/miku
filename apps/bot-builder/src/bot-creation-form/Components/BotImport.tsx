import { useRef, useState } from "react";
import { MikuCard, TavernCardV2, extractCardData } from "@mikugg/bot-utils";
import { Button, Tooltip } from "@mikugg/ui-kit";
import { v4 as uuidv4 } from "uuid";

import { useCharacterCreationForm } from "../CharacterCreationFormContext";
import loadIcon from "../assets/load.svg";
import "./BotImport.scss";

type ImportFormat =
  | "tavern"
  | "tavernV2"
  | "tavernV2Data"
  | "ooba"
  | "agnai"
  | "mikuV2"
  | "mikuV1"
  | "mikuCard";

function getImportFormat(obj: any): ImportFormat {
  if (obj.kind === "character" || isNative(obj)) return "agnai";
  if ("char_name" in obj) return "ooba";
  if (obj.spec === "chara_card_v2") return "tavernV2";
  if ("post_history_instructions" in obj) return "tavernV2Data";
  if ("mes_example" in obj) return "tavern";
  if (obj.configVersion === 2) return "mikuV2";
  if ("bot_name" in obj) return "mikuV1";

  throw new Error("Unknown import format");
}

function isNative(obj: any): boolean {
  return (
    "name" in obj &&
    "persona" in obj &&
    "greeting" in obj &&
    "scenario" in obj &&
    "sampleChat" in obj
  );
}

const jsonToTavernCardV2 = (_json: any): TavernCardV2 => {
  switch (getImportFormat(_json)) {
    case "agnai":
      return {
        spec: "chara_card_v2",
        spec_version: "2.0",
        data: {
          name: String(_json.name) || "",
          description: String(_json.description) || "",
          first_mes: String(_json.greeting) || "",
          personality: String(_json.persona?.attributes?.text) || "",
          mes_example: String(_json.sampleChat) || "",
          scenario: String(_json.scenario),
          alternate_greetings: [],
          system_prompt: "",
          post_history_instructions: "",
          creator: "",
          character_version: "",
          tags: [],
          creator_notes: "",
          character_book: undefined,
          extensions: {},
        },
      };
    case "ooba":
      return {
        spec: "chara_card_v2",
        spec_version: "2.0",
        data: {
          name: String(_json.name) || "",
          description: String(_json.persona?.attributes?.text) || "",
          first_mes: String(_json.greeting) || "",
          personality: String(_json.persona?.attributes?.text) || "",
          mes_example: String(_json.sampleChat) || "",
          scenario: String(_json.scenario),
          alternate_greetings: [],
          system_prompt: "",
          post_history_instructions: "",
          creator: "",
          character_version: "",
          tags: [],
          creator_notes: "",
          character_book: undefined,
          extensions: {},
        },
      };
    case "tavern":
      return {
        spec: "chara_card_v2",
        spec_version: "2.0",
        data: {
          name: String(_json.name) || "",
          description: String(_json.persona?.description) || "",
          first_mes: String(_json.greeting) || "",
          personality: String(_json.persona?.attributes?.text) || "",
          mes_example: String(_json.sampleChat) || "",
          scenario: String(_json.scenario),
          alternate_greetings: [],
          system_prompt: "",
          post_history_instructions: "",
          creator: "",
          character_version: "",
          tags: [],
          creator_notes: "",
          character_book: undefined,
          extensions: {},
        },
      };
    case "tavernV2":
      return _json as TavernCardV2;
    case "tavernV2Data":
      return {
        spec: "chara_card_v2",
        spec_version: "2.0",
        data: _json,
      };
    default:
      throw new Error("Unknown import format");
  }
};

const tavernCardV2ToMikuCard = (json: TavernCardV2): MikuCard => {
  const default_scenario_id = uuidv4();
  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: String(json.data.name) || "",
      description: String(json.data.description) || "",
      first_mes: String(json.data.first_mes) || "",
      personality: String(json.data.personality) || "",
      mes_example: String(json.data.mes_example) || "",
      scenario: String(json.data.scenario),
      alternate_greetings: [
        ...(json.data.alternate_greetings || []).map(
          (greeting) => String(greeting) || ""
        ),
      ],
      system_prompt: String(json.data.system_prompt) || "",
      post_history_instructions:
        String(json.data.post_history_instructions) || "",
      creator: String(json.data.creator) || "",
      character_version: String(json.data.character_version) || "",
      tags: [...(json.data.tags || []).map((tag) => String(tag) || "")],
      creator_notes: String(json.data.creator_notes) || "",
      character_book: json.data.character_book
        ? {
            ...json.data.character_book,
            name: String(json.data.character_book.name) || "",
            description: String(json.data.character_book.description) || "",
            scan_depth: Number(json.data.character_book.scan_depth) || 0,
            token_budget: Number(json.data.character_book.token_budget) || 0,
            recursive_scanning:
              Boolean(json.data.character_book.recursive_scanning) || false,
            entries: json.data.character_book.entries.map((entry) => ({
              ...entry,
              keys: entry.keys.map((key) => String(key) || ""),
              content: String(entry.content) || "",
              enabled: Boolean(entry.enabled) || false,
              insertion_order: Number(entry.insertion_order) || 0,
            })),
          }
        : undefined,
      extensions: {
        ...(json.data.extensions || {}),
        mikugg: {
          ...(json.data.extensions?.mikugg || {}),
          license: json.data.extensions?.mikugg?.license || "CC BY",
          language: json.data.extensions?.mikugg?.language || "en",
          profile_pic: json.data.extensions?.mikugg?.profile_pic || "",
          short_description:
            json.data.extensions?.mikugg?.short_description || "",
          start_scenario:
            json.data.extensions?.mikugg?.start_scenario ||
            json.data.extensions?.mikugg?.scenarios?.length
              ? json.data.extensions?.mikugg?.scenarios[0].id
              : default_scenario_id,
          scenarios: json.data.extensions?.mikugg?.scenarios?.length
            ? json.data.extensions?.mikugg?.scenarios?.map((scenario) => ({
                ...scenario,
                name: String(scenario.name) || "",
                children_scenarios: scenario.children_scenarios.map(
                  (child) => String(child) || ""
                ),
                context: String(scenario.context) || "",
                trigger_suggestion_similarity:
                  String(scenario.trigger_suggestion_similarity) || "",
                trigger_action: String(scenario.trigger_action) || "",
                background: String(scenario.background) || "",
                emotion_group: String(scenario.emotion_group) || "",
                voice: String(scenario.voice) || "",
              }))
            : [
                {
                  id: default_scenario_id,
                  name: "scenario-1",
                  children_scenarios: [],
                  context: "",
                  trigger_suggestion_similarity: "",
                  trigger_action: "",
                  background: "",
                  emotion_group: "",
                  voice: "",
                },
              ],
          emotion_groups:
            json.data.extensions?.mikugg?.emotion_groups?.map((group) => ({
              ...group,
              emotions:
                group.emotions.map((emotion) => ({
                  ...emotion,
                  source: emotion.source.map((src) => String(src) || ""),
                })) || [],
            })) || [],
          backgrounds:
            json.data.extensions?.mikugg?.backgrounds?.map((bg) => ({
              ...bg,
              description: String(bg.description) || "",
              source: String(bg.source) || "",
            })) || [],
          voices: json.data.extensions?.mikugg?.voices
            ? json.data.extensions?.mikugg?.voices?.map((voice) => ({
                ...voice,
                id: String(voice.id) || "",
                provider: String(voice.provider) || "",
                provider_voice_id: String(voice.provider_voice_id) || "",
                provider_emotion: voice.provider_emotion
                  ? String(voice.provider_emotion)
                  : undefined,
                training_sample: voice.training_sample
                  ? String(voice.training_sample)
                  : undefined,
              }))
            : [
                {
                  id: "azure_tts.en-GB-SoniaNeural",
                  provider: "azure_tts",
                  provider_voice_id: "en-GB-SoniaNeural",
                  provider_emotion: "sad",
                },
              ],
        },
      },
    },
  };
};

const processJSON = (_json: object): MikuCard => {
  if (!["mikuV1", "mikuV2", "mikuCard"].includes(getImportFormat(_json))) {
    const card = jsonToTavernCardV2(_json);
    if (!card) {
      throw new Error("Invalid image");
    }
    const mikuCard = tavernCardV2ToMikuCard(card);
    // toastStore.success('Tavern card accepted')
    return mikuCard;
  } else {
    return _json as MikuCard;
  }
};

const processImage = async (file: File): Promise<MikuCard> => {
  const _json = await extractCardData(file);
  if (!_json) {
    throw new Error("Invalid image");
  }
  const mikuCard: MikuCard = processJSON(_json);
  if (!mikuCard.data.extensions.mikugg.profile_pic) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      mikuCard.data.extensions.mikugg.profile_pic = reader.result as string;
    };
    await new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(true);
      };
    });
  }
  return mikuCard;
};

const BotImport: React.FC = () => {
  const { setCard } = useCharacterCreationForm();
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = event.target.files?.[0];
    try {
      if (file) {
        if (file.name.endsWith(".png")) {
          const _card = await processImage(file);
          setCard(_card);
          setLoading(false);
        } else if (file.name.endsWith(".json")) {
          await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const loadedData = JSON.parse(e.target?.result as string);
                if (file.name.endsWith(".miku-temp.json")) {
                  const _card = loadedData as MikuCard;
                  setCard(_card);
                } else {
                  const _card = processJSON(loadedData);
                  setCard(_card);
                  resolve(true);
                }
                setLoading(false);
              } catch (e) {
                reject(e);
              }
            };
            reader.readAsText(file);
          });
        }
      }
    } catch (e) {
      alert("Error loading file");
      setLoading(false);
      console.error(e);
    }
  };

  const importBot = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="BotImport">
      <div
        id="BotImport__button"
        data-tooltip-id={`bot-import-button`}
        data-tooltip-html="From <span style='color:gray'>Miku, Agnastic, TavernAI, CAI</span><br />Formats: <span style='color:gray'>.png, .miku-temp.json, .miku (old)</span>"
        data-tooltip-varaint="dark"
      >
        <Button
          theme="transparent"
          onClick={importBot}
          iconSRC={loadIcon}
          disabled={loading}
        >
          {loading ? (
            <div className="absolute left-2 top-[0.1em]">
              <span className="loader"></span>
            </div>
          ) : (
            "Import"
          )}
        </Button>
      </div>
      <Tooltip id="bot-import-button" place="top" />
      <input
        type="file"
        accept="application/json, image/png, .miku"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileLoad}
      />
    </div>
  );
};

export default BotImport;
