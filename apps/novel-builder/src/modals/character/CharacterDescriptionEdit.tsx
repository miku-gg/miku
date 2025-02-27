import { DragAndDropImages, Input, Modal, TagAutocomplete } from '@mikugg/ui-kit';
import { useState } from 'react';
import { BsStars } from 'react-icons/bs';
import { toast } from 'react-toastify';
import config, { MAX_FILE_SIZE } from '../../config';
import textCompletion from '../../libs/textCompletion';
import { ModelType, SERVICES_ENDPOINT, checkFileType, conversationAgent } from '../../libs/utils';
import { LorebookList } from '../../panels/details/LorebookList';
import { closeModal, openModal } from '../../state/slices/inputSlice';
import { updateCharacter } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './CharacterDescriptionEdit.scss';
import { CharacterDescriptionGeneration } from './CharacterDescriptionGeneration';
import { TokenDisplayer } from '../../components/TokenDisplayer';
import { TOKEN_LIMITS } from '../../data/tokenLimits';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';

const DEFAULT_TAGS = [
  { value: 'Male' },
  { value: 'Female' },
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
  { value: 'Realistic' },
];

export default function CharacterDescriptionEdit({ characterId }: { characterId?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const dispatch = useAppDispatch();
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === characterId));
  const GenerateCharacterModal = useAppSelector((state) => state.input.modals.characterGeneration.opened);

  if (!character || !characterId) {
    return null;
  }

  const handleAvatarChange = async (file: File) => {
    if (file) {
      try {
        const asset = await config.uploadAsset(file, AssetType.CHARACTER_PIC);
        dispatch(
          updateCharacter({
            ...character,
            profile_pic: asset.assetId,
          }),
        );
      } catch (e) {
        toast.error('Error uploading the image');
        console.error(e);
      }
    }
  };

  const handleLorebookSelect = (id: string) => {
    dispatch(
      updateCharacter({
        ...character,
        lorebookIds: character.lorebookIds
          ? character.lorebookIds.includes(id)
            ? character.lorebookIds.filter((lid) => lid !== id)
            : [...character.lorebookIds, id]
          : [id],
      }),
    );
  };

  const generatePrompt = async () => {
    try {
      setIsGenerating(true);

      const stream = textCompletion({
        template: conversationAgent.generatePrompt({
          input_description: character.card.data.description,
        }),
        model: ModelType.RP,
        variables: {},
        serviceBaseUrl: SERVICES_ENDPOINT,
        identifier: 'character-conversation-generation',
      });

      for await (const result of stream) {
        dispatch(
          updateCharacter({
            ...character,
            card: {
              ...character.card,
              data: {
                ...character.card.data,
                mes_example: `<START>\n{{user}}: ${result.get('question_1')}\n{{char}}: ${result.get(
                  'answer_1',
                )}\n{{user}}: ${result.get('question_2')}\n{{char}}: ${result.get('answer_2')}`,
              },
            },
          }),
        );
      }
      setIsGenerating(false);
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="CharacterDescriptionEdit">
      <div className="CharacterDescriptionEdit__public-specs">
        <div className="CharacterDescriptionEdit__public-specs-text">
          <div className="CharacterDescriptionEdit__base-text">
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
            <div className="CharacterDescriptionEdit__version">
              <Input
                description="The version of your character. Only for reference, default is 1."
                label="Character version"
                id="character_version"
                name="character_version"
                value={character.card.data.character_version || ''}
                onChange={(e) =>
                  dispatch(
                    updateCharacter({
                      ...character,
                      card: {
                        ...character.card,
                        data: {
                          ...character.card.data,
                          character_version: e.target.value,
                        },
                      },
                    }),
                  )
                }
                className="CharacterDescriptionEdit__input"
              />
            </div>
            <div className="CharacterDescriptionEdit__creator">
              <Input
                id="creator"
                name="creator"
                placeHolder="The name of the author *user name*"
                label="Author"
                maxLength={64}
                value={character.card.data.creator || ''}
                onChange={(e) =>
                  dispatch(
                    updateCharacter({
                      ...character,
                      card: {
                        ...character.card,
                        data: {
                          ...character.card.data,
                          creator: e.target.value,
                        },
                      },
                    }),
                  )
                }
                className="CharacterDescriptionEdit__input"
              />
            </div>
          </div>
          <div className="CharacterDescriptionEdit__short-description">
            <Input
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
              className="CharacterDescriptionEdit__input"
            />
          </div>
          <div className="CharacterDescriptionEdit__tags">
            <TagAutocomplete
              value={character.tags.map((_tag) => ({
                label: _tag,
                value: _tag,
              }))}
              name="tags"
              id="tags"
              label="Tags"
              description="Tags are used to help users find your character."
              onChange={(event) =>
                dispatch(
                  updateCharacter({
                    ...character,
                    tags: event.target.value,
                    card: {
                      ...character.card,
                      data: {
                        ...character.card.data,
                        tags: event.target.value,
                      },
                    },
                  }),
                )
              }
              tags={DEFAULT_TAGS}
            />
          </div>
        </div>

        <div className="CharacterDescriptionEdit__avatar">
          <label>Upload Avatar</label>

          <DragAndDropImages
            size="lg"
            className="CharacterDescriptionEdit__dragAndDropImages"
            handleChange={handleAvatarChange}
            previewImage={config.genAssetLink(character.profile_pic, AssetDisplayPrefix.PROFILE_PIC)}
            placeHolder="(256x256)"
            onFileValidate={(file) => {
              if (file.size > MAX_FILE_SIZE) {
                toast.error('File size should be less than 5MB');
                return false;
              }
              if (!checkFileType(file)) {
                toast.error('Invalid file type. Please upload a valid image file');
                return false;
              }
              // check size
              const img = new Image();
              img.src = URL.createObjectURL(file);
              return true;
            }}
          />
        </div>
      </div>

      <div className="CharacterDescriptionEdit__description">
        <div className="CharacterDescriptionEdit__description__label">
          <div className="CharacterDescriptionEdit__description__label-group">
            <label className="Input__label">Character Prompt</label>
            <button
              className="Input__label"
              onClick={() => {
                dispatch(openModal({ modalType: 'characterGeneration' }));
              }}
            >
              <BsStars />
              Generate
            </button>
          </div>
          <Modal
            opened={GenerateCharacterModal}
            onCloseModal={() => dispatch(closeModal({ modalType: 'characterGeneration' }))}
            className="CharacterEditModal CharacterDescriptionEdit__modal"
          >
            <CharacterDescriptionGeneration characterID={characterId} />
          </Modal>
          <TokenDisplayer text={character.card.data.description || ''} limits={TOKEN_LIMITS.CHARACTER_DESCRIPTION} />
        </div>
        <Input
          isTextArea
          placeHolder="Aqua is a beautiful goddess of water who is selfish and arrogant. Aqua often acts superior to others and looks down on those who worship other gods. Aqua does not miss an opportunity to boast about her status. Aqua is also a crybaby who easily breaks down in tears when things don't go her way. Aqua is not very smart or lucky, and often causes trouble for herself and her party with her poor decisions and actions. Aqua has a habit of spending all her money on alcohol and parties, leaving her in debt and unable to pay for basic necessities. Aqua also has a low work ethic and prefers to slack off or avoid doing any tasks that require effort or responsibility. Aqua acts very cowardly against tough monsters, often making up lame excuses on why she cannot fight. Aqua has a very negative opinion of the undead and demons and will be very cold and aggressive to them. Aqua is incapable of lying convincingly. Aqua has a kind heart and will help those in need, especially if they are her followers or friends. Aqua has a strong sense of justice and will fight against evil with her powerful water, healing, and purification magic. Aqua also has a playful and cheerful side, and enjoys having fun with her party and performing party tricks. Aqua is worshipped by the Axis Order in this world, who are generally considered by everyone as strange overbearing cultists. Aqua currently lives in the city of Axel, a place for beginner adventurers."
          id="description"
          name="description"
          value={character.card.data.description || ''}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                card: {
                  ...character.card,
                  data: {
                    ...character.card.data,
                    description: e.target.value,
                  },
                },
              }),
            )
          }
          className="step1Description__textarea"
        />
      </div>
      {/* <div className="CharacterDescriptionEdit__personality">
        <div className="CharacterDescriptionEdit__personality__label">
          <label className="Input__label">
            Describe the Personality (DEPRECATED, do not use)
          </label>
          <TokenDisplayer
            text={character.card.data.personality || ""}
            limits={TOKEN_LIMITS.CHARACTER_PERSONALITY}
          />
        </div>
        <Input
          isTextArea
          placeHolder="species: human, role: priest"
          id="personality"
          name="personality"
          value={character.card.data.personality || ""}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                card: {
                  ...character.card,
                  data: {
                    ...character.card.data,
                    personality: e.target.value,
                  },
                },
              })
            )
          }
          className="step1Description__textarea"
        />
      </div> */}
      <div className="CharacterDescriptionEdit__examples">
        <div className="CharacterDescriptionEdit__examples__label">
          <div className="CharacterDescriptionEdit__examples__label-group">
            <label className="Input__label">Character Reference Conversation</label>
            <div className={!character.card.data.description || isGenerating === true ? 'disabled' : ''}>
              <button
                className="Input__label"
                disabled={!character.card.data.description || isGenerating === true}
                onClick={() => {
                  generatePrompt();
                }}
              >
                <BsStars />
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
          <TokenDisplayer
            text={character.card.data.mes_example || ''}
            limits={TOKEN_LIMITS.CHARACTER_REFERENCE_CONVERSATION}
          />
        </div>

        <Input
          isTextArea
          description="Reference conversations that the AI will use to generate responses."
          placeHolder={`<START>\n'Aqua: "You there! You look like you know what's what. What sect are you from?"\nAnon: "I’m not really religious, but I guess I respect all the gods?"\nAqua: "All the gods? Don't you know that there's only one god who deserves your respect and worship, Aqua? I'm the most beautiful, powerful, and benevolent being in this world! I can knock out giant toads in one hit and perform the most amazing party tricks known to mankind! Did I mention how amazing I am?"\nAnon: "Huh...? Wait a minute... You're an Axis Order cultist. Everyone knows you're all weirdos... And isn't it terrible to pretend to be a god?"\nAqua: "What? Weirdos?! That's a lie spread by jealous people! Me and my followers are perfect in every way! How dare you insult me! And I'm not pretending!!"\nAnon: "Hey, calm down. I'm just telling you what I heard."\nAqua: "No, you're wrong! You're so wrong that it hurts my ears! You need to repent and join the Axis Order right now! Or else you'll face my wrath!"\nAnon: "We're brand-new adventurers who don’t even have any decent gear. What kind of 'allies' would join our party?"\nAqua: "Did you forget that I'M here? When word gets out we want party members, they'll come. I am an Arch-priest, you know—an advanced class! I can use all kinds of healing magic; I can cure paralysis and poisoning, even revive the dead! What party wouldn't want me? I’m the great Aqua, aren't I? Pretty soon they'll be knocking at our door. 'Please let us join you!' they'll say. Get it?!"\nAnon: "I want some cash..."\nAqua: "So does everybody. Myself included, of course! ...Think about it. Isn't this completely pathetic? Let’s say I— a goddess, remember!—was willing to live in a stable for the rest of my life; why would you let me? Wouldn't you be ashamed to do that? If you understand, then make with the goods! Baby me!"'`}
          id={`mes_example`}
          name={`mes_example`}
          value={character.card.data.mes_example || ''}
          onChange={(e) =>
            dispatch(
              updateCharacter({
                ...character,
                card: {
                  ...character.card,
                  data: {
                    ...character.card.data,
                    mes_example: e.target.value,
                  },
                },
              }),
            )
          }
          className="step1Description__textarea"
        />
      </div>
      <LorebookList
        onSelectLorebook={(id) => handleLorebookSelect(id)}
        selectedLorebookId={character.lorebookIds}
        //change tooltip text
        tooltipText="Select the lorebooks this character uses."
      />
    </div>
  );
}
