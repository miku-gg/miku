import React, { createContext, useContext, useEffect, useState } from "react";
import { MikuCard, EMPTY_MIKU_CARD } from '@mikugg/bot-utils';


interface CharacterCreationFormContextData {
  card: MikuCard;
  setCard: React.Dispatch<React.SetStateAction<MikuCard>>;
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
  const [card, setCard] = useState<MikuCard>(EMPTY_MIKU_CARD);
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prevStep) => prevStep + 1);
  const prevStep = () => setCurrentStep((prevStep) => prevStep - 1);

  // This is a hack to prevent the user from accidentally leaving the page
  const _setCard = (...args: Parameters<typeof setCard>) => {
    if (!window.onbeforeunload) {
      window.onbeforeunload = () => true;
    }
    return setCard(...args);
  }

  return (
    <CharacterCreationFormContext.Provider
      value={{ card, setCard: _setCard, currentStep, nextStep, prevStep, setCurrentStep }}
    >
      {children}
    </CharacterCreationFormContext.Provider>
  );
};

export { CharacterCreationFormProvider, useCharacterCreationForm };