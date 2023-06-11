import React, { createContext, useContext, useState } from "react";
import { CharacterData } from "./libs/CharacterData";


interface CharacterCreationFormContextData {
  characterData: CharacterData;
  setCharacterData: React.Dispatch<React.SetStateAction<CharacterData>>;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
}

const CharacterCreationFormContext = createContext<CharacterCreationFormContextData>(
  {} as CharacterCreationFormContextData
);

const useCharacterCreationForm = () => {
  const context = useContext(CharacterCreationFormContext);
  if (!context) {
    throw new Error('useCharacterCreationForm must be used within a CharacterCreationFormProvider');
  }
  return context;
};

const CharacterCreationFormProvider = ({ children }: {children: JSX.Element}): JSX.Element => {
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    version: '1',
    avatar: '',
    description: '',
    shortDescription: '',
    author: '',
    backgroundImages: [],
    scenario: '',
    greeting: '',
    sampleConversation: [''],
    model: 'llama-30b',
    voice: 'elevenlabs_tts.EXAVITQu4vr4xnSDxMaL',
    attributes: [
      { key: 'species', value: 'human' },
    ],
    emotionGroups: []
  });
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prevStep) => prevStep + 1);
  const prevStep = () => setCurrentStep((prevStep) => prevStep - 1);

  return (
    <CharacterCreationFormContext.Provider
      value={{ characterData, setCharacterData, currentStep, nextStep, prevStep, setCurrentStep }}
    >
      {children}
    </CharacterCreationFormContext.Provider>
  );
};

export { CharacterCreationFormProvider, useCharacterCreationForm };