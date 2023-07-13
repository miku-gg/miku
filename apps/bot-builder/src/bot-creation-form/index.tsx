import React, { useRef, useState } from "react";

import {
  CharacterCreationFormProvider,
  useCharacterCreationForm,
} from "./CharacterCreationFormContext";

import { Button, TextHeading, Tooltip } from "@mikugg/ui-kit";
import { MikuCard } from "@mikugg/bot-utils";

import { validateStep } from "./libs/CharacterData";
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
import { downloadPng, BUILDING_STEPS } from "./libs/encodePNG";
import BotImport from "./Components/BotImport";

const DocIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M3 2.75A2.75 2.75 0 0 1 5.75 0h14.5a.75.75 0 0 1 .75.75v20.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1 0-1.5h5.25v-4H6A1.5 1.5 0 0 0 4.5 18v.75c0 .716.43 1.334 1.05 1.605a.75.75 0 0 1-.6 1.374A3.251 3.251 0 0 1 3 18.75ZM19.5 1.5H5.75c-.69 0-1.25.56-1.25 1.25v12.651A2.989 2.989 0 0 1 6 15h13.5Z"></path><path d="M7 18.25a.25.25 0 0 1 .25-.25h5a.25.25 0 0 1 .25.25v5.01a.25.25 0 0 1-.397.201l-2.206-1.604a.25.25 0 0 0-.294 0L7.397 23.46a.25.25 0 0 1-.397-.2v-5.01Z"></path></svg>;

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
    await downloadPng(
      JSON.stringify(card),
      card.data.extensions.mikugg.profile_pic,
      card.data.name,
      setBuildingStep
    );
  };

  return (
    <div className="characterCreationForm">
      <div className="characterCreationForm__headingContainer">
        <div className="characterCreationForm__titleContainer">
          <TextHeading size="h1">
            Create a Character
          </TextHeading>
          <a
            href="https://docs.miku.gg/guides/bots/create-bots/" target="_blank" rel="nofollow"
            className="Input__infoIcon"
            data-tooltip-id={`input-tooltip-documentation`}
            data-tooltip-content="How to use this builder?"
            data-tooltip-varaint="dark"
          >
            <DocIcon />
          </a>
          <Tooltip
            id={`input-tooltip-documentation`}
            place="bottom"
          />
        </div>
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
          {
            currentStep === 1 && <BotImport />
          }
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
          overlayClose={buildingStep === BUILDING_STEPS.STEP_5_DONE}
          onClose={() => setBuildingStep(BUILDING_STEPS.STEP_0_NOT_BUILDING)}
        >
          {buildingStep !== BUILDING_STEPS.STEP_5_DONE && (
            <div className="loading"></div>
          )}
          <div className="loading-text">
            {(function () {
              switch (buildingStep) {
                case BUILDING_STEPS.STEP_1_COMBINE_IMAGE:
                  return "Generating png image...";
                case BUILDING_STEPS.STEP_2_GENERATING_CHUNKS:
                  return "Generating chunks...";
                case BUILDING_STEPS.STEP_3_ENCODING_CHUNKS:
                  return "Encoding chunks in png...";
                case BUILDING_STEPS.STEP_4_BUILDING_DOWNLOAD_FILE:
                  return "Downloading png file...";
                case BUILDING_STEPS.STEP_5_DONE:
                  return "Bot builded successfully";
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
