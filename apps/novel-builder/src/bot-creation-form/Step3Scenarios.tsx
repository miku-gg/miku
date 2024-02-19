// Step3Scenarios.tsx
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Modal,
  Button,
  Carousel,
  CheckBox,
  Container,
  ImageSlider,
  Input,
  TextHeading,
  MusicSelector,
} from "@mikugg/ui-kit";
import { MikuCard, DEFAULT_MUSIC } from "@mikugg/bot-utils";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import VoiceSelector from "./Components/VoiceSelector";
import { BackgroundIcon, SlidesIcon } from "./assets/svg";

const ASSETS_ENDPOINT =
  import.meta.env.VITE_ASSETS_ENDPOINT || "https://assets.miku.gg";

const DEFAULT_MUSIC_ITEMS: { name: string; source: string }[] =
  DEFAULT_MUSIC.sort().map((_name) => ({
    name: _name,
    source: `${ASSETS_ENDPOINT}/${_name}`,
  }));

const BackgroundSelector: React.FC<{ scenarioId: string }> = ({
  scenarioId,
}) => {
  const { card, setCard } = useCharacterCreationForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );

  return (
    <>
      <div
        className="step3Scenarios__bgedit"
        onClick={() => setModalOpened(true)}
        tabIndex={0}
        role="button"
      >
        <BackgroundIcon />
      </div>
      <Modal
        shouldCloseOnOverlayClick
        opened={modalOpened}
        onCloseModal={() => setModalOpened(false)}
        title="Select background"
      >
        <Carousel
          isImageCarousel
          items={card.data.extensions.mikugg.backgrounds.map((background) => ({
            background: background.source,
            title: background.description,
          }))}
          selectedIndex={Math.max(
            card.data.extensions.mikugg.backgrounds.findIndex(
              (background) => background.id === scenario?.background
            ),
            0
          )}
          onClick={(index) => {
            const newCard: MikuCard = { ...card };

            const scenario = newCard.data.extensions.mikugg.scenarios.find(
              (scenario) => scenario.id === scenarioId
            );

            if (scenario?.background) {
              scenario.background =
                card.data.extensions.mikugg.backgrounds[index].id;
            }

            setCard(newCard);
          }}
        />
      </Modal>
    </>
  );
};

const EmotionsSelector: React.FC<{ scenarioId: string }> = ({ scenarioId }) => {
  const { card, setCard } = useCharacterCreationForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );
  const background =
    card.data.extensions.mikugg.backgrounds.find(
      (background) => background.id === scenario?.background
    )?.source || "";

  return (
    <>
      <div
        className="step3Scenarios__emoedit"
        onClick={() => setModalOpened(true)}
        tabIndex={0}
        role="button"
      >
        <SlidesIcon />
      </div>
      <Modal
        shouldCloseOnOverlayClick
        opened={modalOpened}
        onCloseModal={() => setModalOpened(false)}
        title="Select emotion set"
      >
        <Carousel
          isImageCarousel
          items={card.data.extensions.mikugg.emotion_groups.map(
            (emotion_group) => ({
              background,
              contentImage: emotion_group.emotions[0].source[0],
              title: emotion_group.name,
            })
          )}
          selectedIndex={
            card.data.extensions.mikugg.emotion_groups.findIndex(
              (emotion_group) => emotion_group.id === scenario?.emotion_group
            ) || 0
          }
          onClick={(index) => {
            const newCard: MikuCard = { ...card };

            const scenario = newCard.data.extensions.mikugg.scenarios.find(
              (scenario) => scenario.id === scenarioId
            );

            if (scenario?.emotion_group) {
              scenario.emotion_group =
                card.data.extensions.mikugg.emotion_groups[index].id;
            }

            setCard(newCard);
          }}
        />
      </Modal>
    </>
  );
};

interface PreviewScenarioProps {
  card: MikuCard;
  scenarioId: string;
  fullWidth?: boolean;
}

export const PreviewScenario: React.FC<PreviewScenarioProps> = ({
  card,
  scenarioId,
  fullWidth,
}) => {
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>("");
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );
  if (!scenario) return null;

  const emotionGroup = card.data.extensions.mikugg.emotion_groups.find(
    (emotion_group) => emotion_group.id === scenario.emotion_group
  );
  if (!emotionGroup?.emotions.length) return null;

  const background =
    card.data.extensions.mikugg.backgrounds.find(
      (background) => background.id === scenario.background
    )?.source || "";
  if (!background) return null;

  let emotionIndex = emotionGroup.emotions.findIndex(
    (emotion) => emotion.id === selectedEmotionId
  );
  if (emotionIndex === -1) emotionIndex = 0;

  const calculateUpdatedIndex = (additional: number): void => {
    const totalImages = emotionGroup.emotions.length;
    const newIndex = (emotionIndex + additional + totalImages) % totalImages;
    const newEmotion =
      emotionGroup.emotions[newIndex] || emotionGroup.emotions[0];

    setSelectedEmotionId(newEmotion.id);
  };

  return (
    <>
      <ImageSlider
        images={emotionGroup.emotions.map((emotion) => ({
          source: emotion.source[0],
          label: emotion.id,
        }))}
        backgroundImageSource={background}
        selectedIndex={emotionIndex}
        onChange={calculateUpdatedIndex}
        fullWidth={fullWidth}
      />
      <Carousel
        items={emotionGroup.emotions.map((emotion) => ({
          title: emotion.id,
        }))}
        selectedIndex={emotionIndex}
        onClick={(index) => {
          calculateUpdatedIndex(index - emotionIndex);
        }}
      />
    </>
  );
};

const Step3Scenarios: React.FC = () => {
  const { card, setCard } = useCharacterCreationForm();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const scenarios = card.data.extensions.mikugg.scenarios;
  const selectedScenario = scenarios[selectedScenarioIndex];
  const scenarioItems = scenarios.map((scenario) => {
    const background =
      card.data.extensions.mikugg.backgrounds.find(
        (background) => background.id === scenario.background
      )?.source || "/placeholder.png";
    const contentImage =
      card.data.extensions.mikugg.emotion_groups.find(
        (emotion_group) => emotion_group.id === scenario.emotion_group
      )?.emotions[0]?.source[0] || "/placeholder.png";
    return {
      background,
      contentImage,
      title: scenario.name,
    };
  });
  scenarioItems.push({
    background: "/add-scenario.png",
    contentImage: "",
    title: "New",
  });

  const music = selectedScenario.music
    ? card.data.extensions.mikugg.sounds?.find(
        (music) => music.id === selectedScenario.music
      ) || {
        name: selectedScenario.music,
        source: `${ASSETS_ENDPOINT}/${selectedScenario.music}`,
      }
    : { name: "", source: "" };

  const handleTextChange = (event: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = event.target;
    const newCard = {
      ...card,
      data: {
        ...card.data,
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...card.data.extensions.mikugg,
            scenarios: [...card.data.extensions.mikugg.scenarios],
          },
        },
      },
    };
    newCard.data.extensions.mikugg.scenarios[selectedScenarioIndex][name] =
      value;
    setCard(newCard);
  };

  return (
    <Container className="step3Scenarios">
      <TextHeading size="h2">Step 3: Scenarios</TextHeading>
      <div>
        <Carousel
          items={scenarioItems}
          onClick={(index, arrowClick) => {
            if (index === scenarioItems.length - 1) {
              if (arrowClick) {
                setSelectedScenarioIndex(
                  selectedScenarioIndex === 0 ? scenarios.length - 1 : 0
                );
                return;
              }
              const emotion_group =
                card.data.extensions.mikugg.emotion_groups[0].id;
              let voiceId = card.data.extensions.mikugg.voices[0]?.id || "";
              let backgroundId = card.data.extensions.mikugg.backgrounds[0].id;
              if (card.data.extensions.mikugg.scenarios.length) {
                voiceId = card.data.extensions.mikugg.scenarios[0].voice || "";
                backgroundId =
                  card.data.extensions.mikugg.scenarios[0].background;
              }
              // add new scenario
              const newCard: MikuCard = {
                ...card,
                data: {
                  ...card.data,
                  extensions: {
                    ...card.data.extensions,
                    mikugg: {
                      ...card.data.extensions.mikugg,
                      scenarios: [
                        ...card.data.extensions.mikugg.scenarios,
                        {
                          id: uuidv4(),
                          name: `scenario-${scenarios.length + 1}`,
                          context: "",
                          trigger_action: "",
                          trigger_suggestion_similarity: "",
                          emotion_group,
                          background: backgroundId,
                          voice: voiceId,
                          children_scenarios: [],
                        },
                      ],
                    },
                  },
                },
              };
              setCard(newCard);
              setSelectedScenarioIndex(scenarios.length);
            } else {
              setSelectedScenarioIndex(index);
            }
          }}
          selectedIndex={selectedScenarioIndex}
          isImageCarousel
          size="small"
        />
      </div>
      <div className="step3Scenarios__preview">
        <BackgroundSelector scenarioId={scenarios[selectedScenarioIndex].id} />
        <EmotionsSelector scenarioId={scenarios[selectedScenarioIndex].id} />
        <PreviewScenario
          card={card}
          scenarioId={scenarios[selectedScenarioIndex].id}
          fullWidth
        />
      </div>
      <div className="step3Scenarios__start-and-voice">
        <div>
          <CheckBox
            id="is_default"
            name="is_default"
            label="Make primary scenario"
            value={
              card.data.extensions.mikugg.start_scenario === selectedScenario.id
            }
            onChange={(event) => {
              if (event.target.checked) {
                setCard({
                  ...card,
                  data: {
                    ...card.data,
                    extensions: {
                      ...card.data.extensions,
                      mikugg: {
                        ...card.data.extensions.mikugg,
                        start_scenario: selectedScenario.id,
                      },
                    },
                  },
                });
              } else {
                setCard({
                  ...card,
                  data: {
                    ...card.data,
                    extensions: {
                      ...card.data.extensions,
                      mikugg: {
                        ...card.data.extensions.mikugg,
                        start_scenario: scenarios.length ? scenarios[0].id : "",
                      },
                    },
                  },
                });
              }
            }}
          />
        </div>
        <div>
          <VoiceSelector
            voice={
              card.data.extensions.mikugg.voices.find(
                (voice) => voice.id === selectedScenario.voice
              ) || card.data.extensions.mikugg.voices[0]
            }
            onChange={(voice) => {
              const newCard = { ...card };
              if (
                !card.data.extensions.mikugg.voices.find(
                  (_voice) => _voice.id === voice.id
                )
              ) {
                newCard.data.extensions.mikugg.voices.push(voice);
              }
              newCard.data.extensions.mikugg.scenarios[
                selectedScenarioIndex
              ].voice = voice.id;
              newCard.data.extensions.mikugg.voices =
                newCard.data.extensions.mikugg.voices.filter((_voice) => {
                  return newCard.data.extensions.mikugg.scenarios.find(
                    (_scenario) => _scenario.voice === _voice.id
                  );
                });
              setCard(newCard);
            }}
          />
        </div>
      </div>
      <div>
        <div>{/* edit selected scenario toggle */}</div>
        <div className="step3Scenarios__scenario-text">
          <div>
            <Input
              id="name"
              name="name"
              placeHolder="school"
              label="Scenario name"
              value={selectedScenario.name}
              onChange={handleTextChange}
              maxLength={256}
            />
            <Input
              id="context"
              name="context"
              placeHolder="{{user}} and {{char}} are at the classroom working on a project."
              label="Prompt context"
              onChange={handleTextChange}
              value={selectedScenario.context}
              isTextArea
            />
          </div>
          <div>
            <Input
              id="trigger_action"
              name="trigger_action"
              placeHolder="Go to the classroom"
              label="Action text"
              onChange={handleTextChange}
              value={selectedScenario.trigger_action}
              maxLength={256}
            />
            <Input
              id="trigger_suggestion_similarity"
              name="trigger_suggestion_similarity"
              placeHolder="school, project, studying, classroom"
              label="Keywords"
              onChange={handleTextChange}
              value={selectedScenario.trigger_suggestion_similarity}
              maxLength={256}
            />
          </div>
        </div>
        <div className="step3Scenarios__scenario-music">
          <MusicSelector
            musicList={DEFAULT_MUSIC_ITEMS}
            selectedMusic={music}
            onChange={(_music, isDefault) => {
              const newCard = { ...card };
              if (isDefault) {
                newCard.data.extensions.mikugg.scenarios[
                  selectedScenarioIndex
                ].music = _music.name;
              } else if (_music.source) {
                let sound: {
                  id: string;
                  name: string;
                  source: string;
                } | null =
                  newCard.data.extensions.mikugg.sounds?.find(
                    (_sound) => _sound.name === _music.name
                  ) || null;

                if (!sound) {
                  sound = {
                    id: uuidv4(),
                    name: _music.name,
                    source: _music.source,
                  };
                }

                newCard.data.extensions.mikugg.sounds = [
                  ...(newCard.data.extensions.mikugg.sounds || []),
                  sound,
                ];
                newCard.data.extensions.mikugg.scenarios[
                  selectedScenarioIndex
                ].music = sound.id;
              } else {
                newCard.data.extensions.mikugg.scenarios[
                  selectedScenarioIndex
                ].music = "";
              }

              newCard.data.extensions.mikugg.sounds =
                newCard.data.extensions.mikugg.sounds?.filter((_music) => {
                  return (
                    newCard.data.extensions.mikugg.scenarios.find(
                      (_scenario) => _scenario.music === _music.id
                    ) ||
                    newCard.data.extensions.mikugg.emotion_groups.find(
                      (_emotion_group) =>
                        _emotion_group.emotions.find(
                          (_emotion) => _emotion.sound === _music.id
                        )
                    )
                  );
                });

              setCard(newCard);
            }}
          />
        </div>
        {scenarios.length > 1 ? (
          <div className="step3Scenarios__fields-for-multiple">
            <div className="step3Scenarios__child-scenarios">
              <TextHeading size="h3">Child scenarios</TextHeading>
              <div className="step3Scenarios__child-scenarios-list">
                {scenarios
                  .filter((_scenario) => _scenario.id !== selectedScenario.id)
                  .map((_scenario) => {
                    return (
                      <div
                        className="step3Scenarios__child-scenarios-item"
                        key={_scenario.id}
                      >
                        <CheckBox
                          label={_scenario.name}
                          value={
                            selectedScenario.children_scenarios.includes(
                              _scenario.id
                            ) ||
                            selectedScenario.children_scenarios.length === 0
                          }
                          onChange={(event) => {
                            const newCard = { ...card };
                            const scenario =
                              newCard.data.extensions.mikugg.scenarios.find(
                                (scenario) =>
                                  scenario.id === selectedScenario.id
                              );
                            if (!scenario) return;
                            if (event.target.checked) {
                              scenario.children_scenarios.push(_scenario.id);
                              if (
                                scenario.children_scenarios.length ===
                                scenarios.length - 1
                              ) {
                                scenario.children_scenarios = [];
                              }
                            } else {
                              if (scenario.children_scenarios.length === 0) {
                                scenario.children_scenarios = scenarios
                                  .filter(
                                    (_scenario) =>
                                      _scenario.id !== selectedScenario.id
                                  )
                                  .map((_scenario) => _scenario.id);
                              }
                              scenario.children_scenarios =
                                scenario.children_scenarios.filter(
                                  (id) => id !== _scenario.id
                                );
                            }
                            setCard(newCard);
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="step3Scenarios__delete">
              <Button
                theme="primary"
                onClick={() => {
                  const newCard = { ...card };
                  newCard.data.extensions.mikugg.scenarios =
                    newCard.data.extensions.mikugg.scenarios.filter(
                      (scenario) => scenario.id !== selectedScenario.id
                    );
                  if (
                    newCard.data.extensions.mikugg.start_scenario ===
                    selectedScenario.id
                  ) {
                    newCard.data.extensions.mikugg.start_scenario =
                      newCard.data.extensions.mikugg.scenarios[0].id;
                  }
                  newCard.data.extensions.mikugg.scenarios.forEach(
                    (scenario) => {
                      scenario.children_scenarios =
                        scenario.children_scenarios.filter(
                          (id) => id !== selectedScenario.id
                        );
                    }
                  );
                  setCard(newCard);
                  setSelectedScenarioIndex(0);
                }}
              >
                Delete scenario
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
};

export default Step3Scenarios;
