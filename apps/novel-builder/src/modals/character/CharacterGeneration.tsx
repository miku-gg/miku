import { Button, Input } from "@mikugg/ui-kit";
import { BsStars } from "react-icons/bs";
import textCompletion from "../../libs/textCompletion";
import { Agent, ModelType } from "../../libs/utils";
import { updateCharacter } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";

import "./CharacterGeneration.scss";

interface CharacterGenerationProps {
  characterID: string;
}
const SERVICES_ENDPOINT =
  import.meta.env.VITE_SERVICES_ENDPOINT || "http://localhost:8484";

export const CharacterGeneration = ({
  characterID,
}: CharacterGenerationProps) => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    state.novel.characters.find((c) => c.id === characterID)
  );
  if (!character || !characterID) {
    return null;
  }
  const generatePrompt = async () => {
    try {
      const stream = textCompletion({
        template: Agent.generatePrompt({
          input_description: character.short_description,
        }),
        model: ModelType.RP,
        variables: {},
        serviceBaseUrl: SERVICES_ENDPOINT,
        identifier: "",
      });

      for await (const result of stream) {
        const prompt = Array.from(result.values()).join("");
        console.log(prompt)
      }
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
          !character.short_description && "disabled"
        }`}
      >
        <Button
          theme={!character.short_description ? "primary" : "gradient"}
          disabled={!character.short_description}
          onClick={() => {
            generatePrompt();
          }}
        >
          <BsStars />
          Generate
        </Button>
      </div>
    </div>
  );
};
