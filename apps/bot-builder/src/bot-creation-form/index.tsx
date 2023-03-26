import React, { useRef, useState } from 'react';
import { CharacterCreationFormProvider, useCharacterCreationForm } from './CharacterCreationFormContext';
import { CharacterData, validateStep } from './libs/CharacterData';
import Step1Description from './Step1Description';
import Step2ModelAndVoice from './Step2ModelAndVoice';
import TopBar from './TopBar';
import Step3Expressions from './Step3Expressions';
import Step4Preview from './Step4Preview';
import './styles/main.scss';
import { BUILDING_STEPS, downloadBotFile } from './libs/bot-file-builder';
import { downloadBlob } from './libs/file-download';
import Modal from './Modal';
import { Button } from '@mikugg/ui-kit';

const save = (characterData: CharacterData) => {
  const characterDataJSON = JSON.stringify(characterData, null, 2);
  const blob = new Blob([characterDataJSON], { type: 'application/json' });
  downloadBlob(blob, `character_${characterData.name}.json`)
};

const _CharacterCreationForm: React.FC = () => {
  const { characterData, setCharacterData, currentStep, nextStep, prevStep} = useCharacterCreationForm();
  const [ buildingStep, setBuildingStep ] = useState<BUILDING_STEPS>(BUILDING_STEPS.STEP_0_NOT_BUILDING);

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, characterData);
  
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
    save(characterData);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const loadedData = JSON.parse(e.target?.result as string) as CharacterData;
        setCharacterData(loadedData);
      };
      reader.readAsText(file);
    }
  };

  const load = () => {
    fileInputRef.current?.click();
  };

  const handleBuildBot = async () => {
    await downloadBotFile(characterData, setBuildingStep)
  }

  return (
    <div className="characterCreationForm">
      <h1>Create a Character</h1>
      <TopBar steps={[1, 2, 3, 4]} />
      <div className="characterCreationForm__stepsContainer">
        {currentStep === 1 && <Step1Description />}
        {currentStep === 2 && <Step2ModelAndVoice />}
        {currentStep === 3 && <Step3Expressions />}
        {currentStep === 4 && <Step4Preview />}
      </div>
      <div className="characterCreationForm__navigationButtons">
        {currentStep > 1 && <button onClick={handleBack}>Back</button>}
        {currentStep === 4 ? (
          <Button theme='primary' onClick={handleBuildBot}>
            Build
          </Button>
        ) : (
          <Button theme='primary' onClick={handleNext}>
            Next
          </Button>
        )}
        
      </div>
      <button className="characterCreationForm__save" onClick={handleSave}>Save</button>
      <button className="characterCreationForm__load" onClick={load}>Load</button>
      <input
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileLoad}
      />
      {buildingStep > BUILDING_STEPS.STEP_0_NOT_BUILDING && (
        <Modal overlayClose={buildingStep === BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP} onClose={() => setBuildingStep(BUILDING_STEPS.STEP_0_NOT_BUILDING)}>
          {buildingStep !== BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP && <div className="loading"></div>}
          <div className="loading-text">
            {(function() {
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
