import {
  Button,
  DragAndDropImages,
  Input,
  Modal,
  MusicSelector,
} from '@mikugg/ui-kit'
import { MdOutlineImageSearch } from 'react-icons/md'
import { DEFAULT_MUSIC } from '@mikugg/bot-utils'
import debounce from 'lodash.debounce'
import { RootState, useAppDispatch, useAppSelector } from '../../state/store'
import { useAppContext } from '../../App.context'
import { v4 as randomUUID } from 'uuid'
import './CreateScene.scss'
import {
  addImportedBackground,
  selectCharacter,
  setCharacterModalOpened,
  setModalOpened,
  setPromptValue,
  setTitleValue,
  setSubmitting,
  removeImportedBackground,
  setSearchQuery,
  setBackground,
  setMusic,
} from '../../state/slices/creationSlice'
import classNames from 'classnames'
import { interactionStart } from '../../state/slices/narrationSlice'
import { addScene } from '../../state/slices/novelSlice'
import { toast } from 'react-toastify'
import { createSelector } from '@reduxjs/toolkit'
import { Loader } from '../common/Loader'
import { useCallback, useEffect, useState } from 'react'
import { BackgroundResult } from '../../libs/backgroundSearch'

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
  const { assetLinkLoader, assetUploader, servicesEndpoint } = useAppContext()

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
  const selectedMusic = useAppSelector((state) => ({
    name: state.creation.scene.music.selected,
    source: state.creation.scene.music.source,
  }))
  const prompt = useAppSelector((state) => state.creation.scene.prompt.value)
  const title = useAppSelector((state) => state.creation.scene.title)
  const submitting = useAppSelector((state) => state.creation.scene.submitting)

  const submitScene = async () => {
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
    let _background = backgroundSelected
    let _music = selectedMusic.name
    if (
      backgroundSelected.startsWith('data:image') ||
      selectedMusic.source.startsWith('data:audio')
    ) {
      try {
        dispatch(setSubmitting(true))
        _background = backgroundSelected.startsWith('data:image')
          ? (await assetUploader(backgroundSelected)).fileName
          : backgroundSelected
        _music = selectedMusic.source.startsWith('data:audio')
          ? (await assetUploader(selectedMusic.source)).fileName
          : selectedMusic.name
        dispatch(removeImportedBackground(backgroundSelected))
        dispatch(setBackground(_background))
        dispatch(setMusic({ name: _music, source: assetLinkLoader(_music) }))
        dispatch(setSubmitting(false))
      } catch (e) {
        dispatch(setSubmitting(false))
        toast.error(`Error uploading background: ${e}`, {
          position: 'bottom-left',
        })
        return
      }
    }
    dispatch(
      addScene({
        id: sceneId,
        background: _background,
        characters,
        prompt,
        music: _music,
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
                  ? backgroundSelected.startsWith('data:image')
                    ? backgroundSelected
                    : assetLinkLoader(backgroundSelected, true)
                  : './default_background.png'
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
          <div className="CreateScene__characters__list scrollbar">
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
            selectedMusic={selectedMusic}
            onChange={(value) => {
              dispatch(
                setMusic({
                  name: value.name,
                  source: value.source,
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
        <div className="CreateScene__prompt">
          <div className="CreateScene__prompt__title">Scene title</div>
          <Input
            placeHolder="Go to the pool"
            value={title}
            onChange={(e) => dispatch(setTitleValue(e.target.value))}
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
          <Button
            className={submitting ? 'Loader__container' : ''}
            theme={submitting ? 'transparent' : 'gradient'}
            onClick={submitScene}
            disabled={submitting}
          >
            {submitting ? <Loader /> : 'Start scene'}
          </Button>
        </div>
      </div>
      <CreateSceneBackgroundModal />
      <CreateSceneCharacterModal />
      <SearchBackgroundModal />
    </div>
  )
}

const SearchBackgroundModal = () => {
  const TAKE = 10
  const dispatch = useAppDispatch()
  const { assetLinkLoader, backgroundSearcher } = useAppContext()
  const { opened, query } = useAppSelector(
    (state) => state.creation.scene.background.search
  )
  const backgroundSelected = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<BackgroundResult[]>([])
  const [completed, setCompleted] = useState<boolean>(false)

  const search = useCallback(
    debounce((query: string, skip: number = 0) => {
      backgroundSearcher({ search: query, skip, take: TAKE })
        .then((results) => {
          setLoading(false)
          if (results.length < TAKE) {
            setCompleted(true)
          }
          setResults((_results) => [..._results, ...results])
        })
        .catch((e) => {
          setLoading(false)
          toast.error(`Error searching background`)
          console.error(e)
        })
    }, 500),
    [backgroundSearcher]
  )

  useEffect(() => {
    if (opened) {
      setCompleted(false)
      setResults([])
      setLoading(true)
      search(query, 0)
    }
  }, [query, search, opened])

  return (
    <Modal
      opened={opened}
      title="Search background"
      onCloseModal={() =>
        dispatch(
          setModalOpened({
            id: 'background-search',
            opened: false,
          })
        )
      }
    >
      <div className="CreateScene__background-search">
        <div className="CreateScene__background-search__input">
          <Input
            placeHolder="Search background..."
            value={query}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
          {loading ? <Loader /> : null}
        </div>
        <div className="CreateScene__selector__list scrollbar">
          {results.map((result, index) => {
            return (
              <div
                key={`background-search-${index}-${result.asset}`}
                className={classNames('CreateScene__selector__item', {
                  'CreateScene__selector__item--selected':
                    backgroundSelected === result.asset,
                })}
                style={{
                  backgroundImage: `url(${assetLinkLoader(
                    result.asset,
                    true
                  )})`,
                }}
                onClick={() => {
                  dispatch(setBackground(result.asset))
                  dispatch(addImportedBackground(result.asset))
                  dispatch(
                    setModalOpened({
                      id: 'background-search',
                      opened: false,
                    })
                  )
                }}
              />
            )
          })}
        </div>
        {!completed && !loading ? (
          <div className="CreateScene__background-search__load-more">
            <Button
              theme="secondary"
              onClick={() => {
                search(query, results.length)
              }}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
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
  const backgrounds = useAppSelector(
    createSelector(
      [
        (state: RootState) => state.novel.scenes,
        (state: RootState) => state.creation.importedBackgrounds,
      ],
      (scenes, importedBackgrounds) =>
        Array.from(
          new Set([...scenes.map((s) => s.background), ...importedBackgrounds])
        )
    )
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
        <div className="CreateScene__selector__list scrollbar">
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
                    background
                      ? background.startsWith('data:image')
                        ? background
                        : assetLinkLoader(background, true)
                      : ''
                  })`,
                }}
                onClick={() => {
                  dispatch(setBackground(background))
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
          <div
            className="CreateScene__selector__item CreateScene__selector__item--search"
            style={{}}
            onClick={() => {
              dispatch(
                setModalOpened({
                  id: 'background-search',
                  opened: true,
                })
              )
            }}
          >
            <MdOutlineImageSearch />
            <p>Search</p>
          </div>{' '}
          <div className="CreateScene__selector__item CreateScene__selector__item--upload">
            <DragAndDropImages
              placeHolder="Upload background"
              errorMessage="Error uploading images"
              handleChange={(file: File) => {
                // transform file to base64 string
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => {
                  const base64String = reader.result
                  if (typeof base64String === 'string') {
                    dispatch(addImportedBackground(base64String))
                    dispatch(setBackground(base64String))
                  }
                }
              }}
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
        <div className="CreateScene__selector__group">
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
              dispatch(setCharacterModalOpened(-1))
            }}
          >
            Empty
          </div>
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
              <div className="CreateScene__selector__group">
                <div className="CreateScene__selector__title">
                  {character?.name}
                </div>
                <div className="CreateScene__selector__list scrollbar">
                  {character?.outfits.map((outfit) => {
                    return (
                      <div
                        className={classNames('CreateScene__selector__item', {
                          'CreateScene__selector__item--selected':
                            selectedChar?.id === character?.id &&
                            selectedChar?.outfit === outfit?.id,
                        })}
                        key={`character-selector-${character?.id}-${outfit?.id}`}
                        onClick={() => {
                          dispatch(
                            selectCharacter({
                              id: character?.id || '',
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
            )
          })}
      </div>
    </Modal>
  )
}

export default CreateScene
