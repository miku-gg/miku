import React, { useState } from "react";

import {
  Carousel,
  Container,
  TextHeading,
} from "@mikugg/ui-kit";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import BotSummary from "./Components/BotSummary";
import { PreviewScenario } from "./Step3Scenarios";
import LicenseSelector from "./Components/LicenseSelector";

const Step4Preview: React.FC = () => {
  const { card, setCard } = useCharacterCreationForm();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);

  const scenarioItems = card.data.extensions.mikugg.scenarios.map(
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
        title: scenario.name,
      }
    }
  );
  
  return (
    <Container className="voiceServicesColorMap
    step4Preview">
      <TextHeading size="h2">Step 4: Finished Character</TextHeading>
      <div className="step4Preview__content">
        <BotSummary
          image={card.data.extensions.mikugg.profile_pic}
          title={card.data.name}
          description={card.data.extensions.mikugg.short_description}
          tags={[]}
          bytes={JSON.stringify(card).length}
        />
        <TextHeading size="h3">Scenarios Summary</TextHeading>
        <Carousel
          items={scenarioItems}
          onClick={(index) => {
            setSelectedScenarioIndex(index);
          }}
          selectedIndex={selectedScenarioIndex}
          isImageCarousel
          size="small"
        />
        <PreviewScenario card={card} scenarioId={card.data.extensions.mikugg.scenarios[selectedScenarioIndex].id} />
        <LicenseSelector
          value={card.data.extensions.mikugg.license}
          onChange={(value) => {
            setCard({
              ...card,
              data: {
                ...card.data,
                extensions: {
                  ...card.data.extensions,
                  mikugg: {
                    ...(card.data.extensions.mikugg || {}),
                    license: value
                  }
                }
              }
            });
          }}
        />
      </div>
    </Container>
  );
};

export default Step4Preview;
