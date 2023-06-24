import React from "react";

import {
  Container,
  TextHeading,
} from "@mikugg/ui-kit";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import BotSummary from "./Components/BotSummary";
import { PreviewScenario } from "./Step3Scenarios";

const Step4Preview: React.FC = () => {
  const { card } = useCharacterCreationForm();
  
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
        <PreviewScenario card={card} scenarioId={card.data.extensions.mikugg.scenarios[0].id} />
      </div>
    </Container>
  );
};

export default Step4Preview;
