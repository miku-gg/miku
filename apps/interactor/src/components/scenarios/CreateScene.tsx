import {
  Button,
  DragAndDropImages,
  Input,
  Modal,
  MusicSelector,
  Tooltip,
} from '@mikugg/ui-kit'
import { MdOutlineImageSearch } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'
import { FaCoins } from 'react-icons/fa6'
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
  setBackground,
  setMusic,
  addImportedCharacter,
  clearImportedCharacters,
  backgroundInferenceStart,
} from '../../state/slices/creationSlice'
import classNames from 'classnames'
import { interactionStart } from '../../state/slices/narrationSlice'
import { addScene } from '../../state/slices/novelSlice'
import { toast } from 'react-toastify'
import { createSelector } from '@reduxjs/toolkit'
import { Loader } from '../common/Loader'
import { useCallback, useEffect, useState } from 'react'
import {
  BackgroundResult,
  CharacterResult,
  listSearch,
  SearchType,
} from '../../libs/listSearch'
import EmotionRenderer from '../emotion-render/EmotionRenderer'
import { loadNovelFromSingleCard } from '../../libs/loadNovel'
import { userDataFetchStart } from '../../state/slices/settingsSlice'
import CreditsDisplayer from './CreditsDisplayer'
import { selectCurrentScene } from '../../state/selectors'
import { trackEvent } from '../../libs/analytics'

const selectSelectableCharacters = createSelector(
  [
    (state: RootState) => state.novel.characters,
    (state: RootState) => state.creation.importedCharacters,
  ],
  (characters, importedCharacters) =>
    [...characters, ...importedCharacters].map((character) => {
      if (!character) return null
      return {
        id: character.id,
        name: character.name,
        outfits: character.card.data.extensions.mikugg_v2.outfits,
      }
    })
)

async function dataURItoFile(dataURI: string, filename: string): Promise<File> {
  const response = await fetch(dataURI)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

// Definition: Defines the CreateSceneModal component
const CreateScene = () => {
  const { assetLinkLoader, assetUploader, servicesEndpoint, apiEndpoint } =
    useAppContext()
  const currentScene = useAppSelector(selectCurrentScene)
  const songs = useAppSelector((state) =>
    state.novel.songs.filter((song) =>
      state.novel.scenes.find((scene) => scene.musicId === song.id)
    )
  )

  const musicList: { name: string; source: string }[] = [
    ...songs.map((song) => ({
      name: song.name,
      source: assetLinkLoader(song.source),
    })),
    ...DEFAULT_MUSIC.sort().map((_name) => ({
      name: _name,
      source: assetLinkLoader(_name),
    })),
  ]

  const dispatch = useAppDispatch()

  const charactersSelected = useAppSelector(
    (state) => state.creation.scene.characters.selected
  )
  const backgroundSelectedId = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  const backgroundSelected =
    useAppSelector((state) => {
      const background =
        state.novel.backgrounds.find((b) => b.id === backgroundSelectedId) ||
        state.creation.importedBackgrounds.find(
          (b) => b.id === backgroundSelectedId
        )
      return background ? background.source.jpg : ''
    }) || backgroundSelectedId
  const characters = useAppSelector(selectSelectableCharacters)
  const selectedMusic = useAppSelector((state) => ({
    name: state.creation.scene.music.selected,
    source: state.creation.scene.music.source,
  }))
  const prompt = useAppSelector((state) => state.creation.scene.prompt.value)
  const title = useAppSelector((state) => state.creation.scene.title)
  const submitting = useAppSelector((state) => state.creation.scene.submitting)
  const importedCharacters = useAppSelector(
    (state) => state.creation.importedCharacters
  )

  const submitScene = async () => {
    const sceneId = randomUUID()
    const characters = charactersSelected
      .filter(({ id, outfit }) => id && outfit)
      .map(({ id, outfit }) => ({ id, outfit }))
    const charactersToImport = importedCharacters.filter((c) =>
      charactersSelected.find((c2) => c2.id === c.id)
    )

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
    // check if
    let _background = backgroundSelected
    let _music = selectedMusic.name
    if (
      backgroundSelected.startsWith('data:image') ||
      selectedMusic.source.startsWith('data:audio')
    ) {
      try {
        dispatch(setSubmitting(true))
        _background = backgroundSelected.startsWith('data:image')
          ? (
              await assetUploader(
                await dataURItoFile(backgroundSelected, 'asset')
              )
            ).fileName
          : backgroundSelected
        _music = selectedMusic.source.startsWith('data:audio')
          ? (
              await assetUploader(
                await dataURItoFile(selectedMusic.source, 'asset')
              )
            ).fileName
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
    dispatch(clearImportedCharacters())
    dispatch(
      addScene({
        id: sceneId,
        name: title || prompt,
        background: _background,
        newChars: charactersToImport,
        characters,
        prompt,
        music: _music,
        children: currentScene?.children || [],
      })
    )
    dispatch(
      interactionStart({
        servicesEndpoint,
        apiEndpoint,
        text: prompt,
        sceneId,
        characters: characters.map(({ id }) => id),
        selectedCharacterId: characters[0].id,
      })
    )
    dispatch(setModalOpened({ id: 'scene', opened: false }))
    dispatch(setModalOpened({ id: 'slidepanel', opened: false }))
    trackEvent('scene-create-successful')
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
                  : assetLinkLoader('default_background.png')
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
                    <EmotionRenderer
                      assetLinkLoader={assetLinkLoader}
                      assetUrl={
                        character?.outfits.find((o) => o?.id === outfit)
                          ?.emotions[0].sources.png || ''
                      }
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
      <SearchCharacterModal />
      <GenerateBackgroundModal />
    </div>
  )
}

function SearchModal<T>({
  modalId,
  searcher,
  renderResult,
}: {
  modalId: 'background' | 'characters'
  searcher: (params: {
    search: string
    skip: number
    take: number
  }) => Promise<T[]>
  renderResult: (result: T, index: number) => JSX.Element
}): JSX.Element {
  const TAKE = 10
  const dispatch = useAppDispatch()
  const { opened } = useAppSelector(
    (state) => state.creation.scene[modalId].search
  )
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<T[]>([])
  const [completed, setCompleted] = useState<boolean>(false)

  const search = useCallback(
    debounce((query: string, skip: number = 0) => {
      searcher({ search: query, skip, take: TAKE })
        .then((results) => {
          setLoading(false)
          if (results.length < TAKE) {
            setCompleted(true)
          }
          setResults((_results) => [..._results, ...results])
        })
        .catch((e) => {
          setLoading(false)
          toast.error(`Error searching ${modalId}`)
          console.error(e)
        })
    }, 500),
    [searcher]
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
      title={`Search ${modalId}`}
      onCloseModal={() =>
        dispatch(
          setModalOpened({
            id: `${modalId}-search`,
            opened: false,
          })
        )
      }
    >
      <div className="CreateScene__background-search">
        <div className="CreateScene__background-search__input">
          <Input
            placeHolder={`Search ${modalId}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading ? <Loader /> : null}
        </div>
        <div className="CreateScene__selector__list scrollbar">
          {results.map(renderResult)}
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

const SearchBackgroundModal = () => {
  const dispatch = useAppDispatch()
  const { assetLinkLoader, apiEndpoint } = useAppContext()
  const backgroundSelected = useAppSelector(
    (state) => state.creation.scene.background.selected
  )
  return (
    <SearchModal<BackgroundResult>
      modalId="background"
      searcher={(params) =>
        listSearch<BackgroundResult>(apiEndpoint, SearchType.BACKGROUND, params)
      }
      renderResult={(result: BackgroundResult, index) => {
        const backgroundURL = assetLinkLoader(result.asset, true)
        return (
          <div
            key={`background-search-${index}-${result.asset}`}
            className={classNames('CreateScene__selector__item', {
              'CreateScene__selector__item--selected':
                backgroundSelected === result.asset,
            })}
            style={{
              backgroundImage: backgroundURL.startsWith('data:')
                ? backgroundURL
                : `url(${backgroundURL})`,
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
      }}
    />
  )
}

const SearchCharacterModal = () => {
  const dispatch = useAppDispatch()
  const { assetLinkLoader, apiEndpoint, cardEndpoint } = useAppContext()
  const charactersSelected = useAppSelector(
    (state) => state.creation.scene.characters.selected
  )
  const characters = useAppSelector(selectSelectableCharacters)
  const [loadingIndex, setLoadingIndex] = useState<number>(-1)
  return (
    <SearchModal<CharacterResult>
      modalId="characters"
      searcher={(params) =>
        listSearch<CharacterResult>(
          apiEndpoint,
          SearchType.CHARACTER,
          params
        ).then((r) =>
          r.filter(
            (c) => characters.find((c2) => c2?.id === c.card) === undefined
          )
        )
      }
      renderResult={(result: CharacterResult, index) => {
        return (
          <div key={`background-search-${index}-${result.id}`}>
            <div
              className={classNames('CreateScene__selector__item', {
                'CreateScene__selector__item--selected':
                  charactersSelected.find((c) => c.id === result.id),
                'CreateScene__selector__item--loading': loadingIndex === index,
              })}
              onClick={async () => {
                setLoadingIndex(index)
                const { novel } = await loadNovelFromSingleCard({
                  cardId: result.card,
                  cardEndpoint,
                  assetLinkLoader,
                })
                setLoadingIndex(-1)
                dispatch(
                  setModalOpened({
                    id: 'characters-search',
                    opened: false,
                  })
                )
                dispatch(
                  addImportedCharacter(Object.values(novel.characters)[0]!)
                )
              }}
              data-tooltip-id={`input-tooltip-documentation`}
              data-tooltip-content={result.description}
              data-tooltip-varaint="dark"
            >
              <img src={assetLinkLoader(result.profilePic)} />
              <p className="CreateScene__selector__item-name">{result.name}</p>
              {loadingIndex === index ? <Loader /> : null}
            </div>
            <Tooltip id={`input-tooltip-documentation`} place="bottom" />
          </div>
        )
      }}
    />
  )
}
const CreateSceneBackgroundModal = () => {
  const { assetLinkLoader, isMobileApp } = useAppContext()

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
        (state: RootState) => state.novel.backgrounds,
        (state: RootState) => state.creation.importedBackgrounds,
      ],
      (scenes, backgrounds, importedBackgrounds) =>
        Array.from(
          new Set([
            ...scenes.map((s) =>
              backgrounds.find((b) => b.id === s.backgroundId)
            ),
            ...importedBackgrounds,
          ])
        )
    )
  )

  const backgroundsInferecing = useAppSelector(
    (state) => state.creation.inference.backgrounds
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
                    backgroundSelected === background?.id,
                })}
                key={`background-selector-${background?.id || index}`}
                style={{
                  backgroundImage: `url(${
                    background
                      ? background.source.jpg.startsWith('data:image')
                        ? background.source.jpg
                        : assetLinkLoader(background.source.jpg, true)
                      : ''
                  })`,
                }}
                onClick={() => {
                  dispatch(setBackground(background?.id || ''))
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
          {backgroundsInferecing.map((background) => {
            return (
              <div
                className={classNames('CreateScene__selector__item')}
                key={`background-selector-inferencing-${background.id}`}
              >
                <Loader />
              </div>
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
          {!isMobileApp && (
            <div
              className="CreateScene__selector__item CreateScene__selector__item--upload"
              onClick={() => {
                dispatch(
                  setModalOpened({
                    id: 'background-gen',
                    opened: true,
                  })
                )
              }}
            >
              <BsStars />
              <p>Generate</p>
            </div>
          )}
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
  const nsfw = useAppSelector((state) => state.settings.user.nsfw)

  return (
    <Modal
      opened={characterOpenedIndex !== -1 && !!selectedChar}
      onCloseModal={() => dispatch(setCharacterModalOpened(-1))}
      shouldCloseOnOverlayClick
    >
      <div className="CreateScene__selector">
        <div className="CreateScene__selector__title">Select a character</div>
        <div className="CreateScene__selector__list scrollbar">
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
          <div
            className="CreateScene__selector__item CreateScene__selector__item--search"
            style={{}}
            onClick={() => {
              dispatch(
                setModalOpened({
                  id: 'characters-search',
                  opened: true,
                })
              )
            }}
          >
            <MdOutlineImageSearch />
            <p>Search</p>
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
              <div
                className="CreateScene__selector__group"
                key={`character-selector-item-${character?.id}`}
              >
                <div className="CreateScene__selector__title">
                  {character?.name}
                </div>
                <div className="CreateScene__selector__list scrollbar">
                  {character?.outfits
                    .filter((outfit) => nsfw >= (outfit.nsfw || 0))
                    .map((outfit) => {
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
                          <EmotionRenderer
                            assetLinkLoader={assetLinkLoader}
                            assetUrl={outfit?.emotions[0].sources.png || ''}
                          />
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

export const GEN_BACKGROUND_COST = 20
const GenerateBackgroundModal = () => {
  const dispatch = useAppDispatch()
  const [prompt, setPrompt] = useState<string>('')
  const { apiEndpoint, servicesEndpoint } = useAppContext()
  const opened = useAppSelector(
    (state) => state.creation.scene.background.gen.opened
  )
  const { credits } = useAppSelector((state) => state.settings.user)

  useEffect(() => {
    if (opened) {
      dispatch(
        userDataFetchStart({
          apiEndpoint,
        })
      )
    }
  }, [opened, apiEndpoint, dispatch])

  return (
    <Modal
      opened={opened}
      onCloseModal={() =>
        dispatch(
          setModalOpened({
            id: 'background-gen',
            opened: false,
          })
        )
      }
    >
      <div className="CreateScene__generator">
        <div className="CreateScene__generator__header">
          <div className="CreateScene__generator__title">
            Generate a background
          </div>
          <CreditsDisplayer />
        </div>
        <div className="CreateScene__generator__text-area">
          <Input
            placeHolder="Write a prompt..."
            isTextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="CreateScene__generator__button">
          <Button
            theme="gradient"
            disabled={!prompt || credits < GEN_BACKGROUND_COST}
            onClick={async () => {
              dispatch(
                backgroundInferenceStart({
                  id: randomUUID(),
                  prompt,
                  apiEndpoint,
                  servicesEndpoint,
                })
              )
              dispatch(
                setModalOpened({
                  id: 'background-gen',
                  opened: false,
                })
              )
            }}
          >
            Generate Background{' '}
            <span>
              {GEN_BACKGROUND_COST} <FaCoins />
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateScene
