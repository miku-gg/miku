// Step1Description.tsx
import React from "react";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import {
  Container,
  DragAndDropImages,
  Input,
  TagAutocomplete,
  TextHeading,
} from "@mikugg/ui-kit";
import { checkFileType } from "./libs/utils";

const DEFAULT_TAGS = [
  { value: 'Male' },
  { value: 'Famale' },
  { value: 'OC' },
  { value: 'NSFW' },
  { value: 'RPG' },
  { value: 'Anime' },
  { value: 'Videogame' },
  { value: 'Fantasy' },
  { value: 'Action' },
  { value: 'Tsundere' },
  { value: 'Yandere' },
  { value: 'Cute' },
  { value: 'Horror' },
  { value: 'Comedy' },
  { value: 'History' },
  { value: 'Work' },
  { value: 'Movies & TV' },
  { value: 'VTuber' },
  { value: 'Realistic' }
];

const Step1Description: React.FC = () => {
  const { card, setCard } = useCharacterCreationForm();

  const handleV1CardInputChange = (event: {
    target: { name: string; value: string|string[] };
  }) => {
    const { name, value } = event.target;
    setCard({
      ...card,
      data: {
        ...card.data,
        [name]: value
      }
    });
  };

  const handleMikuggInputChange = (event: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = event.target;
    setCard({
      ...card,
      data: {
        ...card.data,
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...(card.data.extensions.mikugg || {}),
            [name]: value
          },
        }
      }
    })
  }

  const handleAvatarChange = async (file: File) => {
    if (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      await new Promise((resolve) => {
        reader.onloadend = () => {
          setCard({
            ...card,
            data: {
              ...card.data,
              extensions: {
                ...card.data.extensions,
                mikugg: {
                  ...(card.data.extensions?.mikugg || {}),
                  profile_pic: reader.result as string
                }
              }
            }
          });

          resolve(null);
        };
      });
    }
  };

  return (
    <Container className="step1Description">
      <TextHeading size="h2">Step 1: Description</TextHeading>
      <div className="step1Description__formGroup">
        <Input
          placeHolder="The name of your character E.g *Irina*"
          id="name"
          name="name"
          label="Character name"
          description="The name of your character"
          value={card.data.name || ""}
          onChange={handleV1CardInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          placeHolder="The version of your character E.g *1.0*"
          label="Character version"
          id="character_version"
          name="character_version"
          value={card.data.character_version || ""}
          onChange={handleV1CardInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <label>Upload Avatar</label>

        <DragAndDropImages
          size="lg"
          className="step1Description__dragAndDropImages"
          handleChange={handleAvatarChange}
          previewImage={card.data.extensions.mikugg.profile_pic}
          placeHolder="(256x256)"
          onFileValidate={(file) =>
            checkFileType(file, ["image/png", "image/jpeg"])
          }
          errorMessage="Please upload an avatar with dimensions of 256x256 pixels."
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          id="creator"
          name="creator"
          placeHolder="The name of the author *user name*"
          label="Author"
          maxLength={64}
          value={card.data.creator}
          onChange={handleV1CardInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          id="short_description"
          name="short_description"
          placeHolder="E.g *A character based in...*"
          label="Character short description"
          value={card.data.extensions.mikugg.short_description}
          maxLength={256}
          onChange={handleMikuggInputChange}
          className="step1Description__input"
        />
      </div>
      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Character Complete Description:"
          placeHolder="E.g 'Aqua is a beautiful goddess of water who is selfish and arrogant. Aqua often acts superior to others and looks down on those who worship other gods. Aqua does not miss an opportunity to boast about her status. Aqua is also a crybaby who easily breaks down in tears when things don't go her way. Aqua is not very smart or lucky, and often causes trouble for herself and her party with her poor decisions and actions. Aqua has a habit of spending all her money on alcohol and parties, leaving her in debt and unable to pay for basic necessities. Aqua also has a low work ethic and prefers to slack off or avoid doing any tasks that require effort or responsibility. Aqua acts very cowardly against tough monsters, often making up lame excuses on why she cannot fight. Aqua has a very negative opinion of the undead and demons and will be very cold and aggressive to them. Aqua is incapable of lying convincingly. Aqua has a kind heart and will help those in need, especially if they are her followers or friends. Aqua has a strong sense of justice and will fight against evil with her powerful water, healing, and purification magic. Aqua also has a playful and cheerful side, and enjoys having fun with her party and performing party tricks. Aqua is worshipped by the Axis Order in this world, who are generally considered by everyone as strange overbearing cultists. Aqua currently lives in the city of Axel, a place for beginner adventurers.'"
          id="description"
          name="description"
          value={card.data.description}
          onChange={handleV1CardInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Describe the Scenario:"
          placeHolder="E.g 'Aqua is gathering followers for her faith in the city Axel's town square.'"
          id="scenario"
          name="scenario"
          value={card.data.scenario || ""}
          onChange={handleV1CardInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Sample Conversations:"
          placeHolder={`<START>\n'Aqua: "You there! You look like you know what's what. What sect are you from?"\nAnon: "I’m not really religious, but I guess I respect all the gods?"\nAqua: "All the gods? Don't you know that there's only one god who deserves your respect and worship, Aqua? I'm the most beautiful, powerful, and benevolent being in this world! I can knock out giant toads in one hit and perform the most amazing party tricks known to mankind! Did I mention how amazing I am?"\nAnon: "Huh...? Wait a minute... You're an Axis Order cultist. Everyone knows you're all weirdos... And isn't it terrible to pretend to be a god?"\nAqua: "What? Weirdos?! That's a lie spread by jealous people! Me and my followers are perfect in every way! How dare you insult me! And I'm not pretending!!"\nAnon: "Hey, calm down. I'm just telling you what I heard."\nAqua: "No, you're wrong! You're so wrong that it hurts my ears! You need to repent and join the Axis Order right now! Or else you'll face my wrath!"\nAnon: "We're brand-new adventurers who don’t even have any decent gear. What kind of 'allies' would join our party?"\nAqua: "Did you forget that I'M here? When word gets out we want party members, they'll come. I am an Arch-priest, you know—an advanced class! I can use all kinds of healing magic; I can cure paralysis and poisoning, even revive the dead! What party wouldn't want me? I’m the great Aqua, aren't I? Pretty soon they'll be knocking at our door. 'Please let us join you!' they'll say. Get it?!"\nAnon: "I want some cash..."\nAqua: "So does everybody. Myself included, of course! ...Think about it. Isn't this completely pathetic? Let’s say I— a goddess, remember!—was willing to live in a stable for the rest of my life; why would you let me? Wouldn't you be ashamed to do that? If you understand, then make with the goods! Baby me!"'`}
          id={`mes_example`}
          name={`mes_example`}
          value={card.data.mes_example}
          onChange={handleV1CardInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Describe the Personality:"
          placeHolder="species: human, role: priest"
          id="personality"
          name="personality"
          value={card.data.personality || ""}
          onChange={handleV1CardInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Character Greeting:"
          id="first_mes"
          placeHolder="E.g 'It’s a pleasure to meet you'"
          name="first_mes"
          value={card.data.first_mes || ""}
          onChange={handleV1CardInputChange}
          className="step1Description__textarea"
        />
      </div>
      <div className="step1Description__formGroup">
        <TagAutocomplete
          value={card.data.tags.map(_tag => ({
            label: _tag,
            value: _tag
          }))}
          name="tags"
          id="tags"
          label="Tags"
          description="Tags are used to help users find your character."
          onChange={handleV1CardInputChange}
          tags={DEFAULT_TAGS}
        />
      </div>
    </Container>
  );
};

export default Step1Description;
