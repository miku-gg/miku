import React, { useRef, useState } from "react";

import {
  CharacterCreationFormProvider,
  useCharacterCreationForm,
} from "./CharacterCreationFormContext";

import { Button, TextHeading } from "@mikugg/ui-kit";
import { MikuCard } from "@mikugg/bot-validator";

import { validateStep } from "./libs/CharacterData";
import { BUILDING_STEPS } from "./libs/bot-file-builder";
import { downloadBlob } from "./libs/file-download";

import Modal from "./Modal";
import TopBar from "./TopBar";

import Step1Description from "./Step1Description";
import Step3Scenarios from "./Step3Scenarios";
import Step2Assets from "./Step2Assets";
import Step4Preview from "./Step4Preview";

import backIcon from "./assets/backArrow.svg";
import nextIcon from "./assets/nextArrow.svg";
import saveIcon from "./assets/save.svg";

import "./styles/main.scss";
import { downloadPng } from "./libs/encodePNG";
import BotImport from "./Components/BotImport";

const save = (card: MikuCard) => {
  const cardJSON = JSON.stringify(card, null, 2);
  const blob = new Blob([cardJSON], { type: "application/json" });
  downloadBlob(blob, `${card.data.name}.miku-temp.json`);
};

const _CharacterCreationForm: React.FC = () => {
  const { card, setCard, currentStep, nextStep, prevStep } =
    useCharacterCreationForm();
  const [buildingStep, setBuildingStep] = useState<BUILDING_STEPS>(
    BUILDING_STEPS.STEP_0_NOT_BUILDING
  );

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, card);

    if (stepErrors.length > 0) {
      // Show an alert with the error messages
      const errorMessages = stepErrors.map((error) => error.message).join("\n");
      alert(`Please fix the following errors:\n${errorMessages}`);
    } else {
      // Proceed to the next step if there are no errors
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) prevStep();
  };

  const handleSave = (event: React.MouseEvent) => {
    event.preventDefault();
    save(card);
  };

  const handleBuildBot = async () => {
    // await downloadBotFile(card, setBuildingStep);
    await downloadPng(JSON.stringify(card), card.data.extensions.mikugg.profile_pic, card.data.name);
  };

  return (
    <div className="characterCreationForm">
      <div className="characterCreationForm__headingContainer">
        <TextHeading size="h1">Create a Character</TextHeading>
        <TopBar
          steps={[
            { label: "01", description: "Description" },
            { label: "02", description: "Assets" },
            { label: "03", description: "Scenarios" },
            { label: "04", description: "Finished Character" },
          ]}
        />
      </div>
      <div className="characterCreationForm__stepsContainer">
        {currentStep === 1 && <Step1Description />}
        {currentStep === 2 && <Step2Assets />}
        {currentStep === 3 && <Step3Scenarios />}
        {currentStep === 4 && <Step4Preview />}
      </div>
      <div className="characterCreationForm__buttonsContainer">
        <div>
          <Button theme="transparent" onClick={handleSave} iconSRC={saveIcon}>
            Save
          </Button>
          <BotImport />
        </div>
        <div className="characterCreationForm__navigationButtons">
          {currentStep > 1 && (
            <Button iconSRC={backIcon} theme="transparent" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep === 4 ? (
            <Button theme="gradient" onClick={handleBuildBot}>
              Build character
            </Button>
          ) : (
            <Button
              iconSRC={nextIcon}
              iconPosition="right"
              theme="gradient"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </div>
      </div>
      {buildingStep > BUILDING_STEPS.STEP_0_NOT_BUILDING && (
        <Modal
          overlayClose={buildingStep === BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP}
          onClose={() => setBuildingStep(BUILDING_STEPS.STEP_0_NOT_BUILDING)}
        >
          {buildingStep !== BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP && (
            <div className="loading"></div>
          )}
          <div className="loading-text">
            {(function () {
              switch (buildingStep) {
                case BUILDING_STEPS.STEP_1_GENERATING_EMBEDDINGS:
                  return "Generating embeddings...";
                case BUILDING_STEPS.STEP_2_GENERATING_ZIP:
                  return "Generating .miku file...";
                case BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP:
                  return "Please download the .miku file";
                default:
                  return "Building bot...";
              }
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};

const CharacterCreationForm: React.FC = () => {
  return (
    <CharacterCreationFormProvider>
      <_CharacterCreationForm />
    </CharacterCreationFormProvider>
  );
};

export default CharacterCreationForm;
