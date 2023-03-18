import React, { createContext, useContext, useState } from "react";
import { CharacterData, validateCharacterData } from "./CharacterData";


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
    avatar: '',
    backgroundImages: [],
    scenario: '',
    greeting: '',
    sampleConversation: '',
    model: 'gpt3.5-turbo',
    voice: 'Voice1',
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