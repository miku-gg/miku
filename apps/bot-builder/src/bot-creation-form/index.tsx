import React, { useRef, useState } from "react";

import {
  CharacterCreationFormProvider,
  useCharacterCreationForm,
} from "./CharacterCreationFormContext";

import { Button, TextHeading } from "@mikugg/ui-kit";

import { validateStep } from "./libs/CharacterData";
import { BUILDING_STEPS, downloadBotFile } from "./libs/bot-file-builder";
import { downloadBlob } from "./libs/file-download";

import Modal from "./Modal";
import Step1Description from "./Step1Description";
// import Step2ModelAndVoice from "./Step2ModelAndVoice";
// import Step3Expressions from "./Step3Expressions";
// import Step4Preview from "./Step4Preview";
import TopBar from "./TopBar";

import backIcon from "./assets/backArrow.svg";
import loadIcon from "./assets/load.svg";
import nextIcon from "./assets/nextArrow.svg";
import saveIcon from "./assets/save.svg";

import "./styles/main.scss";
import { MikuCard } from "@mikugg/bot-validator";

const save = (card: MikuCard) => {
  const cardJSON = JSON.stringify(card, null, 2);
  const blob = new Blob([cardJSON], { type: "application/json" });
  downloadBlob(blob, `character_${card.data.name}.json`);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const loadedData = JSON.parse(
          e.target?.result as string
        ) as MikuCard;
        setCard(loadedData);
      };
      reader.readAsText(file);
    }
  };

  const load = () => {
    fileInputRef.current?.click();
  };

  const handleBuildBot = async () => {
    await downloadBotFile(card, setBuildingStep);
  };

  return (
    <div className="characterCreationForm">
      <div className="characterCreationForm__headingContainer">
        <TextHeading size="h1">Create a Character</TextHeading>
        <TopBar
          steps={[
            { label: "01", description: "Description" },
            { label: "02", description: "Prompt completion model" },
            { label: "03", description: "Emotions grup" },
            { label: "04", description: "Finished Character" },
          ]}
        />
      </div>
      <div className="characterCreationForm__stepsContainer">
        {currentStep === 1 && <Step1Description />}
        {/* {currentStep === 2 && <Step2ModelAndVoice />}
        {currentStep === 3 && <Step3Expressions />}
        {currentStep === 4 && <Step4Preview />} */}
      </div>
      <div className="characterCreationForm__buttonsContainer">
        <div>
          <Button theme="transparent" onClick={handleSave} iconSRC={saveIcon}>
            Save
          </Button>
          <Button theme="transparent" onClick={load} iconSRC={loadIcon}>
            Load
          </Button>
        </div>
        <input
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileLoad}
        />
        <div className="characterCreationForm__navigationButtons">
          {currentStep > 1 && (
            <Button iconSRC={backIcon} theme="transparent" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep === 4 ? (
            <Button theme="gradient" onClick={handleBuildBot}>
              Built character
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
