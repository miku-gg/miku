import { Button, Input } from '@mikugg/ui-kit';
import { BsStars } from 'react-icons/bs';
import textCompletion from '../../libs/textCompletion';
import { ModelType, SERVICES_ENDPOINT, descriptionAgent } from '../../libs/utils';
import { updateCharacter } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import { useState } from 'react';
import { closeModal } from '../../state/slices/inputSlice';
import './CharacterDescriptionGeneration.scss';

interface CharacterGenerationProps {
  characterID: string;
}

export const CharacterDescriptionGeneration = ({ characterID }: CharacterGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === characterID));
  if (!character || !characterID) {
    return null;
  }
  const generateDescriptionPrompt = async () => {
    try {
      setIsGenerating(true);

      const stream = textCompletion({
        template: descriptionAgent.generatePrompt({
          input_description: `{"name":"${character.name}", "description":"${character.short_description}"}`,
        }),
        model: ModelType.RP,
        variables: {},
        serviceBaseUrl: SERVICES_ENDPOINT,
        identifier: 'character-description-generations',
      });

      for await (const result of stream) {
        dispatch(
          updateCharacter({
            ...character,
            card: {
              ...character.card,
              data: {
                ...character.card.data,
                description:
                  `${character.name}'s Description: "${result.get('description')}"\n` +
                  `${character.name}'s Personality: [${result.get('personality')}]\n` +
                  `${character.name}'s Body: [${result.get('body')}]`,
              },
            },
          }),
        );
      }
      dispatch(closeModal({ modalType: 'characterGeneration' }));
      setIsGenerating(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isDisabled = !character.short_description || isGenerating || character.name === 'char1' || !character.name;

  return (
    <div className="CharacterGenerationModal">
      <div className="CharacterDescriptionEdit__name">
        <Input
          placeHolder="The name of your character E.g *Irina*"
          id="name"
          name="name"
          label="Character name"
          description="The name of your character"
          value={character.name || ''}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                name: e.target.value,
                card: {
                  ...character.card,
                  data: {
                    ...character.card.data,
                    name: e.target.value,
                  },
                },
              }),
            )
          }
          className="CharacterDescriptionEdit__input"
        />
      </div>
      <div className="CharacterGenerationModal__short-description">
        <Input
          isTextArea
          id="short_description"
          name="short_description"
          placeHolder="E.g *A character based in...*"
          label="Character short description"
          value={character.short_description || ''}
          maxLength={256}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                short_description: e.target.value,
              }),
            )
          }
          className="CharacterGenerationModal__textArea"
        />
      </div>
      <div className={`CharacterGenerationModal__button ${isDisabled ? 'disabled' : ''}`}>
        <Button
          theme={isDisabled ? 'primary' : 'gradient'}
          disabled={isDisabled}
          onClick={() => {
            generateDescriptionPrompt();
          }}
        >
          <BsStars />
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
};
