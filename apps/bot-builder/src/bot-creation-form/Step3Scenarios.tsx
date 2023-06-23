// Step3Scenarios.tsx
import React, { useState } from "react";
import { Carousel, CheckBox, Container, ImageSlider, Input, TextHeading } from "@mikugg/ui-kit";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import { MikuCard } from "@mikugg/bot-validator";
import VoiceSelector from "./Components/VoiceSelector";
import { BackgroundIcon, SlidesIcon } from "./assets/svg";
import Modal from "./Components/Modal";

const BackgroundSelector: React.FC<{scenarioId: string}> = ({ scenarioId }) => {
  const { card, setCard } = useCharacterCreationForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );

  return (
    <>
      <div className="step3Scenarios__bgedit" onClick={() => setModalOpened(true)} tabIndex={0} role="button">
        <BackgroundIcon/>
      </div>
      <Modal
        shouldCloseOnOverlayClick
        opened={modalOpened}
        onCloseModal={() => setModalOpened(false)}
        title="Select background"
      >
        <Carousel
          isImageCarousel
          items={card.data.extensions.mikugg.backgrounds.map(
            (background) => ({
              background: background.source,
              title: background.description,
            })
          )}
          selectedIndex={
            card.data.extensions.mikugg.backgrounds.findIndex(
              (background) => background.id === scenario?.background
            ) || 0
          }
          onClick={(index) => {
            const newCard: MikuCard = { ...card };

            const scenario = newCard.data.extensions.mikugg.scenarios.find(
              (scenario) => scenario.id === scenarioId
            );

            if (scenario?.background) {
              scenario.background = card.data.extensions.mikugg.backgrounds[index].id;
            }

            setCard(newCard);
          }}
        />
      </Modal>
    </>
  )
}


const EmotionsSelector: React.FC<{scenarioId: string}> = ({ scenarioId }) => {
  const { card, setCard } = useCharacterCreationForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );
  const background = card.data.extensions.mikugg.backgrounds.find(
    (background) => background.id === scenario?.background
  )?.source || '';

  return (
    <>
      <div className="step3Scenarios__emoedit" onClick={() => setModalOpened(true)} tabIndex={0} role="button">
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
              title: emotion_group.id,
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
              scenario.emotion_group = card.data.extensions.mikugg.emotion_groups[index].id;
            }

            setCard(newCard);
          }}
        />
      </Modal>
    </>
  )
}

interface PreviewScenarioProps {
  card: MikuCard,
  scenarioId: string
}

const PreviewScenario: React.FC<PreviewScenarioProps> = ({ card, scenarioId }) => {
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>('');
  const scenario = card.data.extensions.mikugg.scenarios.find(
    (scenario) => scenario.id === scenarioId
  );
  if (!scenario) return null;

  const emotionGroup = card.data.extensions.mikugg.emotion_groups.find(
    (emotion_group) => emotion_group.id === scenario.emotion_group
  );
  if (!emotionGroup?.emotions.length) return null;

  const background = card.data.extensions.mikugg.backgrounds.find(
    (background) => background.id === scenario.background
  )?.source || '';
  if (!background) return null;

  let emotionIndex = emotionGroup.emotions.findIndex(
    (emotion) => emotion.id === selectedEmotionId
  );
  if (emotionIndex === -1) emotionIndex = 0;

  const calculateUpdatedIndex = (additional: number): void => {
    const totalImages = emotionGroup.emotions.length;
    const newIndex = (emotionIndex + additional + totalImages) % totalImages
    const newEmotion = emotionGroup.emotions[newIndex] || emotionGroup.emotions[0];

    setSelectedEmotionId(newEmotion.id);
  };

  return (
    <ImageSlider
      images={emotionGroup.emotions.map((emotion) => ({
        source: emotion.source[0],
        label: emotion.id,
      }))}
      backgroundImageSource={background}
      selectedIndex={emotionIndex}
      onChange={calculateUpdatedIndex}
      fullWidth
    />
  );
}

const Step3Scenarios: React.FC = () => {
  const { card, setCard } = useCharacterCreationForm();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const scenarios = card.data.extensions.mikugg.scenarios;
  const scenarioItems = scenarios.map(
    (scenario) => {
      const background = card.data.extensions.mikugg.backgrounds.find(
        (background) => background.id === scenario.background
      )?.source || '/placeholder.png';
      const contentImage = card.data.extensions.mikugg.emotion_groups.find(
        (emotion_group) => emotion_group.id === scenario.emotion_group
      )?.emotions[0]?.source[0] || '/placeholder.png';
      return {
        background,
        contentImage,
        title: scenario.id,
      }
    }
  );
  const selectedScenario = scenarios[selectedScenarioIndex];

  const handleTextChange = (event: {target: {name: string, value: string}}) => {
    const { name, value } = event.target;
    const newCard = {
      ...card,
      data: {
        ...card.data,
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...card.data.extensions.mikugg,
            scenarios: [
              ...card.data.extensions.mikugg.scenarios,
            ]
          }
        }
      }
    };
    newCard.data.extensions.mikugg.scenarios[selectedScenarioIndex][name] = value;
    setCard(newCard);
  };

  console.log(card.data.extensions.mikugg.backgrounds);

  scenarioItems.push({
    background: '/add-scenario.png',
    contentImage: '',
    title: 'New',
  });

  return (
    <Container className="step3Scenarios">
      <TextHeading size="h2">Step 3: Scenarios</TextHeading>
      <div>
        <Carousel
          items={scenarioItems}
          onClick={(index) => setSelectedScenarioIndex(index)}
          selectedIndex={selectedScenarioIndex}
          isImageCarousel
          size="small"
        />
      </div>
      <div className="step3Scenarios__preview">
        <BackgroundSelector scenarioId={scenarios[selectedScenarioIndex].id} />
        <EmotionsSelector scenarioId={scenarios[selectedScenarioIndex].id} />
        <PreviewScenario card={card} scenarioId={scenarios[selectedScenarioIndex].id} />
      </div>
      <div className="step3Scenarios__start-and-voice">
        <div>
          <CheckBox
            id="is_default"
            name="is_default"
            label="Make primary scenario"
            value={card.data.extensions.mikugg.start_scenario === selectedScenario.id}
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
                      }
                    }
                  }
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
                        start_scenario: scenarios.length ? scenarios[0].id : '',
                      }
                    }
                  }
                });
              }
            }}
          />
        </div>
        <div>
          <VoiceSelector
            voice={card.data.extensions.mikugg.voices.find(
              (voice) => voice.id === selectedScenario.voice
            ) || card.data.extensions.mikugg.voices[0]}
            onChange={(voice) => {
              const newCard = { ...card };
              if (!card.data.extensions.mikugg.voices.find((_voice) => _voice.id === voice.id)) {
                newCard.data.extensions.mikugg.voices.push(voice);
              }
              newCard.data.extensions.mikugg.scenarios[selectedScenarioIndex].voice = voice.id;
              setCard(newCard);
          }}
          />
        </div>
      </div>
      <div>
        <div>
          {/* edit selected scenario toggle */}
        </div>
        <div className="step3Scenarios__scenario-text">
          <div>
            <Input
              id="id"
              name="id"
              placeHolder="school"
              label="Scenario ID"
              value={selectedScenario.id}
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
              maxLength={256}
            />
          </div>
          <div>
            <Input
              id="trigger_action"
              name="trigger_action"
              placeHolder="{{user}} and {{char}} are at the classroom working on a project."
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
        <div>
          {/* selected scenario: make default */}
          {/* selected scenario: children scenarios */}
        </div>
        <div>
          <div>
            {/* selected scenario: delete */}
          </div>
          <div>
            {/* selected scenario: cancel edition (only if not new scenario) */}
            {/* selected scenario: save */}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Step3Scenarios;