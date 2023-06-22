import React from "react";
import { Container, TextHeading } from "@mikugg/ui-kit";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";

const Step2Scenarios: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  return (
    <Container className="step2Scenarios">
      <TextHeading size="h2">Step 2: Scenarios</TextHeading>
      <div>
        {/* Scenario selector: images carousel */}
        {/* "Add screnario" button */}
      </div>
      <div>
        {/* selected scenario preview: background + emotions-carousel */}
      </div>
      <div>
        <div>
          {/* edit selected scenario toggle */}
        </div>
        <div>
          <div>
            {/* selected scenario: background select button */}
            {/* selected scenario: emotion-group select button */}
            {/* selected scenario: voice select drowpdown */}
          </div>
          <div>
            {/* selected scenario: name/id */}
            {/* selected scenario: context input */}
            {/* selected scenario: trigger_suggestion_similarity input */}
            {/* selected scenario: trigger_action input */}
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

export default Step2Scenarios;