import {
  Button,
  DragAndDropImages,
  Input,
  Modal,
  MusicSelector,
} from '@mikugg/ui-kit'
import { DEFAULT_MUSIC } from '@mikugg/bot-utils'
import { RootState, useAppDispatch, useAppSelector } from '../../state/store'
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
import { createSelector } from '@reduxjs/toolkit'

const selectSelectableCharacters = createSelector(
  [(state: RootState) => state.novel.characters],
  (characters) =>
    Object.values(characters).map((character) => {
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

// Definition: Defines the CreateSceneModal component
const CreateScene = () => {
  const { assetLinkLoader, servicesEndpoint } = useAppContext()

  const musicList: { name: string; source: string }[] =
    DEFAULT_MUSIC.sort().map((_name) => ({
      name: _name,
      source: assetLinkLoader(_name),
    }))

  const dispatch = useAppDispatch()

  const charactersSelected = useAppSelector(
    (state) => state.creation.scene.characters.selected
  )
  const backgroundSelected = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  const characters = useAppSelector(selectSelectableCharacters)
  const selectedMusic = useAppSelector(
    (state) => state.creation.scene.music.selected
  )
  const prompt = useAppSelector((state) => state.creation.scene.prompt.value)

  const submitScene = () => {
    const sceneId = randomUUID()
    const characters = charactersSelected
      .filter(({ id, outfit }) => id && outfit)
      .map(({ id, outfit }) => ({ id, outfit, role: randomUUID() }))
    if (!characters.length) {
      toast.error('You need to select at least one character', {
        position: 'bottom-left',
      })
      return
    }
    if (!backgroundSelected) {
      toast.error('You need to select a background', {
        position: 'bottom-left',
      })
      return
    }
    if (!prompt) {
      toast.error('You need to write a prompt', {
        position: 'bottom-left',
      })
      return
    }
    dispatch(
      addScene({
        id: sceneId,
        background: backgroundSelected,
        characters,
        prompt,
        music: selectedMusic,
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
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }))
  }

  return (
    <div className="CreateScene">
      <div className="CreateScene__form">
        <div className="CreateScene__background">
          <div className="CreateScene__background__title">Background</div>
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
          <div className="CreateScene__characters__title">Characters</div>
          <div className="CreateScene__characters__list">
            {charactersSelected.map(({ id, outfit }, index) => {
              const character = characters.find((c) => c?.id === id)
              return (
                <div
                  className="CreateScene__characters__item"
                  key={`character-${id}-${index}`}
                  onClick={() => dispatch(setCharacterModalOpened(index))}
                >
                  {character?.name ? (
                    <img
                      src={assetLinkLoader(
                        character?.outfits.find((o) => o?.id === outfit)
                          ?.image || '',
                        true
                      )}
                    />
                  ) : (
                    'Select'
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="CreateScene__music">
          <div className="CreateScene__music__title">Music</div>
          <MusicSelector
            musicList={musicList}
            selectedMusic={
              musicList.find((music) => music.name === selectedMusic) || {
                name: '',
                source: '',
              }
            }
            onChange={(value) => {
              dispatch(
                setModalSelected({
                  id: 'music',
                  selected: value.name,
                })
              )
            }}
          />
        </div>
        <div className="CreateScene__prompt">
          <div className="CreateScene__prompt__title">Scene prompt</div>
          <Input
            placeHolder="*{{user}} and Hina head to the swimming pool to have fun. It's a hot summer day but there's no people there.*"
            isTextArea
            value={prompt}
            onChange={(e) => dispatch(setPromptValue(e.target.value))}
          />
        </div>
        <div className="CreateScene__actions">
          <Button
            theme="transparent"
            onClick={() =>
              dispatch(setModalOpened({ id: 'scene', opened: false }))
            }
          >
            Cancel
          </Button>
          <Button theme="gradient" onClick={submitScene}>
            Start scene
          </Button>
        </div>
      </div>
      <CreateSceneBackgroundModal />
      <CreateSceneCharacterModal />
    </div>
  )
}

const CreateSceneBackgroundModal = () => {
  const { assetLinkLoader } = useAppContext()

  const dispatch = useAppDispatch()

  const backgroundSelectorOpened = useAppSelector(
    (state) => state.creation.scene.background.opened
  )
  const backgroundSelected = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  const backgrounds = useAppSelector((state) =>
    Array.from(new Set(state.novel.scenes.map((s) => s.background)))
  )

  return (
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
        <div className="CreateScene__selector__title">Select a background</div>
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
  )
}

const CreateSceneCharacterModal = () => {
  const { assetLinkLoader } = useAppContext()

  const dispatch = useAppDispatch()
  const characterOpenedIndex = useAppSelector(
    (state) => state.creation.scene.characters.openedIndex
  )
  const charactersSelected = useAppSelector(
    (state) => state.creation.scene.characters.selected
  )
  const characters = useAppSelector(selectSelectableCharacters)
  const selectedChar = charactersSelected[characterOpenedIndex] || null

  return (
    <Modal
      opened={characterOpenedIndex !== -1 && !!selectedChar}
      onCloseModal={() => dispatch(setCharacterModalOpened(-1))}
      shouldCloseOnOverlayClick
    >
      <div className="CreateScene__selector">
        <div className="CreateScene__selector__title">Select a character</div>
        <div className="CreateScene__selector__list">
          <div
            className={classNames('CreateScene__selector__item', {
              'CreateScene__selector__item--selected': selectedChar?.id === '',
            })}
            onClick={() => {
              dispatch(
                selectCharacter({
                  id: '',
                  outfit: '',
                  index: characterOpenedIndex,
                })
              )
            }}
          >
            No character
          </div>
          {characters
            .filter((_character) => {
              const character = charactersSelected.find(
                ({ id }) => _character?.id === id
              )
              return !character || character?.id === selectedChar?.id
            })
            .map((character) => {
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
  )
}

export default CreateScene
