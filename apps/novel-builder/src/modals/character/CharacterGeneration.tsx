import { Button, Input } from "@mikugg/ui-kit";
import { BsStars } from "react-icons/bs";
import textCompletion from "../../libs/textCompletion";
import { Agent, ModelType } from "../../libs/utils";
import { updateCharacter } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";

import { useState } from "react";
import { closeModal } from "../../state/slices/inputSlice";
import "./CharacterGeneration.scss";

interface CharacterGenerationProps {
  characterID: string;
}
const SERVICES_ENDPOINT =
  import.meta.env.VITE_SERVICES_ENDPOINT || "http://localhost:8484";

export const CharacterGeneration = ({
  characterID,
}: CharacterGenerationProps) => {
  const [isGeneration, setIsGeneration] = useState(false);
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    state.novel.characters.find((c) => c.id === characterID)
  );
  if (!character || !characterID) {
    return null;
  }
  const convertStreamToObject = (obj: { [k: string]: string }) => {
    const newObj: {
      description: string;
      personality: string;
      body: string;
    } = {
      description: "",
      personality: "",
      body: "",
    };
    newObj.description = `[${character.name}'s Description=${
      Object.values(obj)[0]
    }]`;
    newObj.personality = `[${character.name}'s Personality=${
      Object.values(obj)[1]
    }]`;
    newObj.body = `[${character.name}'s Body=${Object.values(obj)[2]}]`;
    return newObj;
  };
  const generatePrompt = async () => {
    try {
      let response = {};
      setIsGeneration(true);

      const stream = textCompletion({
        template: Agent.generatePrompt({
          input_description: character.short_description,
        }),
        model: ModelType.RP,
        variables: {},
        serviceBaseUrl: SERVICES_ENDPOINT,
        identifier: character.name + "-" + characterID,
      });

      for await (const result of stream) {
        const resultObject = Object.fromEntries(result);
        response = resultObject;
      }
      const result = convertStreamToObject(response);
      dispatch(
        updateCharacter({
          ...character,
          card: {
            ...character.card,
            data: {
              ...character.card.data,
              description:
                result.description +
                "\n" +
                result.personality +
                "\n" +
                result.body,
            },
          },
        })
      );
      dispatch(closeModal({ modalType: "characterGeneration" }));
      setIsGeneration(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="CharacterGenerationModal">
      <div className="CharacterGenerationModal__short-description">
        <Input
          isTextArea
          id="short_description"
          name="short_description"
          placeHolder="E.g *A character based in...*"
          label="Character short description"
          value={character.short_description || ""}
          maxLength={256}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                short_description: e.target.value,
              })
            )
          }
          className="CharacterGenerationModal__textArea"
        />
      </div>
      <div
        className={`CharacterGenerationModal__button ${
          !character.short_description || isGeneration === true
            ? "disabled"
            : ""
        }`}
      >
        <Button
          theme={
            !character.short_description && isGeneration === true
              ? "secondary"
              : "gradient"
          }
          disabled={!character.short_description && !isGeneration}
          onClick={() => {
            generatePrompt();
          }}
        >
          <BsStars />
          {isGeneration ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  );
};