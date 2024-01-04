import { Button, DragAndDropImages, Input, Modal } from '@mikugg/ui-kit'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { useAppContext } from '../../App.context'
import { v4 as randomUUID } from 'uuid'
import './CreateScene.scss'
import {
  selectCharacter,
  setCharacterModalOpened,
  setModalOpened,
  setModalSelected,
  setPromptValue,
} from '../../state/slices/creationSlice'
import classNames from 'classnames'
import { interactionStart } from '../../state/slices/narrationSlice'
import { addScene } from '../../state/slices/novelSlice'
import { toast } from 'react-toastify'

// Definition: Defines the CreateSceneModal component
const CreateScene = () => {
  const { assetLinkLoader, servicesEndpoint } = useAppContext()
  const dispatch = useAppDispatch()

  const opened = useAppSelector((state) => state.creation.scene.opened)
  const backgroundSelectorOpened = useAppSelector(
    (state) => state.creation.scene.background.opened
  )
  const characterOpenedIndex = useAppSelector(
    (state) => state.creation.scene.characters.openedIndex
  )
  const charactersSelected = useAppSelector(
    (state) => state.creation.scene.characters.selected
  )
  const backgroundSelected = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  const backgrounds = useAppSelector((state) =>
    Array.from(new Set(state.novel.scenes.map((s) => s.background)))
  )
  const characters = useAppSelector((state) =>
    Object.values(state.novel.characters).map((character) => {
      if (!character) return null
      return {
        id: character.id,
        name: character.name,
        outfits: Object.values(character.outfits).map((outfit) => {
          if (!outfit) return null
          return {
            id: outfit.id,
            name: outfit.name,
            image: outfit.emotions[0].source[0],
          }
        }),
      }
    })
  )
  const prompt = useAppSelector((state) => state.creation.scene.prompt.value)
  const selectedChar = charactersSelected[characterOpenedIndex] || null

  const submitScene = () => {
    const sceneId = randomUUID()
    const characters = charactersSelected
      .filter(({ id, outfit }) => id && outfit)
      .map(({ id, outfit }) => ({ id, outfit, role: randomUUID() }))
    if (!characters.length) {
      toast.error('You need to select at least one character')
      return
    }
    if (!backgroundSelected) {
      toast.error('You need to select a background')
      return
    }
    if (!prompt) {
      toast.error('You need to write a prompt')
      return
    }
    dispatch(
      addScene({
        id: sceneId,
        background: backgroundSelected,
        characters,
        prompt,
        music: '',
      })
    )
    dispatch(
      interactionStart({
        servicesEndpoint,
        text: prompt,
        sceneId,
        roles: characters.map(({ role }) => role),
        selectedRole: characters[0].role,
      })
    )
    dispatch(setModalOpened({ id: 'scene', opened: false }))
  }

  return (
    <Modal
      opened={opened}
      onCloseModal={() =>
        dispatch(
          setModalOpened({
            id: 'scene',
            opened: false,
          })
        )
      }
    >
      <div className="CreateScene">
        <div className="CreateScene__title">Create a new scene</div>
        <div className="CreateScene__form">
          <div className="CreateScene__background">
            background
            <button
              className="CreateScene__background__button"
              style={{
                backgroundImage: `url(${
                  backgroundSelected
                    ? assetLinkLoader(backgroundSelected, true)
                    : '/default_background.png'
                })`,
              }}
              onClick={() =>
                dispatch(
                  setModalOpened({
                    id: 'background',
                    opened: true,
                  })
                )
              }
            >
              {!backgroundSelected ? 'Select background' : null}
            </button>
          </div>
          <div className="CreateScene__characters">
            characters
            {charactersSelected.map(({ id, outfit }, index) => {
              const character = characters.find((c) => c?.id === id)
              return (
                <div
                  className="CreateScene__characters__item"
                  key={`character-${id}-${index}`}
                  style={
                    {
                      // backgroundImage: `url(${assetLinkLoader(
                      //   backgroundSelected,
                      //   true
                      // )})`,
                    }
                  }
                  onClick={() => dispatch(setCharacterModalOpened(index))}
                >
                  {character?.name}
                  <img
                    src={assetLinkLoader(
                      character?.outfits.find((o) => o?.id === outfit)?.image ||
                        '',
                      true
                    )}
                  />
                </div>
              )
            })}
          </div>
          <div className="CreateScene__prompt">
            <Input
              placeHolder="*{{user}} goes with Hina to a swimming pool. It's a hot summer day and they're having fun.*"
              label="Scene prompt"
              isTextArea
              value={prompt}
              onChange={(e) => dispatch(setPromptValue(e.target.value))}
            />
          </div>
          <div className="CreateScene__actions">
            <Button theme="gradient" onClick={submitScene}>
              Go to scene
            </Button>
            <Button theme="transparent">Cancel</Button>
          </div>
        </div>
      </div>
      <Modal
        opened={backgroundSelectorOpened}
        onCloseModal={() =>
          dispatch(
            setModalOpened({
              id: 'background',
              opened: false,
            })
          )
        }
      >
        <div className="CreateScene__selector">
          <div className="CreateScene__selector__title">
            Select a background
          </div>
          <div className="CreateScene__selector__list">
            {backgrounds.map((background, index) => {
              return (
                <div
                  className={classNames('CreateScene__selector__item', {
                    'CreateScene__selector__item--selected':
                      backgroundSelected === background,
                  })}
                  key={`background-selector-${index}`}
                  style={{
                    backgroundImage: `url(${
                      background ? assetLinkLoader(background, true) : ''
                    })`,
                  }}
                  onClick={() => {
                    dispatch(
                      setModalSelected({
                        id: 'background',
                        selected: background,
                      })
                    )
                    dispatch(
                      setModalOpened({
                        id: 'background',
                        opened: false,
                      })
                    )
                  }}
                />
              )
            })}
            <div className="CreateScene__selector__item CreateScene__selector__item--upload">
              <DragAndDropImages
                placeHolder="Upload background"
                errorMessage="Error uploading images"
              />
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        opened={characterOpenedIndex !== -1 && !!selectedChar}
        onCloseModal={() => dispatch(setCharacterModalOpened(-1))}
        shouldCloseOnOverlayClick
      >
        <div className="CreateScene__selector">
          <div className="CreateScene__selector__title">Select a character</div>
          <div className="CreateScene__selector__list">
            {characters.map((character) => {
              return (
                <div
                  className={classNames('CreateScene__selector__item', {
                    'CreateScene__selector__item--selected':
                      selectedChar?.id === character?.id,
                  })}
                  key={`character-selector-${character?.id}`}
                  onClick={() => {
                    dispatch(
                      selectCharacter({
                        id: character?.id || '',
                        outfit: character?.outfits[0]?.id || '',
                        index: characterOpenedIndex,
                      })
                    )
                  }}
                >
                  <img
                    src={assetLinkLoader(
                      character?.outfits[0]?.image || '',
                      true
                    )}
                  />
                </div>
              )
            })}
          </div>
          <div className="CreateScene__selector__list">
            {selectedChar?.id &&
              characters
                .find((_char) => _char?.id === selectedChar?.id)
                ?.outfits.map((outfit) => {
                  return (
                    <div
                      className={classNames('CreateScene__selector__item', {
                        'CreateScene__selector__item--selected':
                          selectedChar?.outfit === outfit?.id,
                      })}
                      key={`character-selector-${selectedChar?.id}-${outfit?.id}`}
                      onClick={() => {
                        dispatch(
                          selectCharacter({
                            id: selectedChar?.id || '',
                            outfit: outfit?.id || '',
                            index: characterOpenedIndex,
                          })
                        )
                        dispatch(setCharacterModalOpened(-1))
                      }}
                    >
                      <img src={assetLinkLoader(outfit?.image || '', true)} />
                    </div>
                  )
                })}
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

export default CreateScene
