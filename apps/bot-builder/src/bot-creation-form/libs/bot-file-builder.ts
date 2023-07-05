import { MikuCard } from "@mikugg/bot-utils";
import { downloadBlob, generateZipFile } from "./file-download";
import { hashBase64URI } from "./utils";

export enum BUILDING_STEPS {
  STEP_0_NOT_BUILDING = 0,
  STEP_1_GENERATING_EMBEDDINGS = 1,
  STEP_2_GENERATING_ZIP = 2,
  STEP_3_DOWNLOADING_ZIP = 3,
}

export async function hashImagesOfMikuCard(
  card: MikuCard
): Promise<MikuCard> {
  return {
    ...card,
    data: {
      ...card.data,
      extensions: {
        ...card.data.extensions,
        mikugg: {
          ...card.data.extensions.mikugg,
          profile_pic: await hashBase64URI(card.data.extensions.mikugg.profile_pic),
          backgrounds: await Promise.all(
            card.data.extensions.mikugg.backgrounds.map(async (bg) => {
              return {
                ...bg,
                source: await hashBase64URI(bg.source),
              };
            })
          ),
          emotion_groups: await Promise.all(
            card.data.extensions.mikugg.emotion_groups.map(async (emotionGroup) => {
              return {
                ...emotionGroup,
                images: await Promise.all(
                  emotionGroup.emotions.map(async (emotion) => {
                    return {
                      ...emotion,
                      sources: await Promise.all(
                        emotion.source.map(async (source) => {
                          return await hashBase64URI(source);
                        })
                      ),
                    };
                  })
                ),
              };
            })
          ),
        },
      },
    },
  };
}

export async function downloadBotFile(
  _card: MikuCard,
  setBuildingStep: (step: BUILDING_STEPS) => void
) {
  setBuildingStep(BUILDING_STEPS.STEP_1_GENERATING_EMBEDDINGS);
  const finalCard = await hashImagesOfMikuCard(_card);

  setBuildingStep(BUILDING_STEPS.STEP_2_GENERATING_ZIP);
  const images = [
    _card.data.extensions.mikugg.profile_pic,
    ..._card.data.extensions.mikugg.backgrounds
      .filter(bg => _card.data.extensions.mikugg.scenarios.some(scenario => scenario.background === bg.id))
      .map((bg) => bg.source),
    ..._card.data.extensions.mikugg.emotion_groups
      .filter(group => _card.data.extensions.mikugg.scenarios.some(scenario => scenario.emotion_group === group.id))
      .map((emotionGroup) =>
        emotionGroup.emotions.map((emotion) => emotion.source)
      )
      .flat(3),
  ];
  const blob = await generateZipFile(finalCard, images);

  await downloadBlob(blob, `${_card.data.name}_${Date.now()}.miku`);
  setBuildingStep(BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP);
}
