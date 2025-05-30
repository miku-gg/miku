import { useRef, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectCurrentIndicators, selectCurrentMaps, selectCurrentScene } from '../../state/selectors';
import { GiPathDistance } from 'react-icons/gi';
import './InteractiveMap.scss';
import { Button, Modal } from '@mikugg/ui-kit';
import { setMapModal } from '../../state/slices/settingsSlice';
import { trackEvent } from '../../libs/analytics';
import { interactionStart, setCurrentBattle } from '../../state/slices/narrationSlice';
import { useAppContext } from '../../App.context';
import { setModalOpened } from '../../state/slices/creationSlice';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { addIndicatorToScene } from '../../state/slices/novelSlice';
import { getInitialBattleState } from '../../state/utils/battleUtils';

const isTouchScreen = window.navigator.maxTouchPoints > 0;

const InteractiveMapToggle = () => {
  const dispatch = useAppDispatch();
  const opened = useAppSelector((state) => state.settings.modals.map);
  const maps = useAppSelector(selectCurrentMaps);
  const [selectedMap, setSelectedMap] = useState<(typeof maps)[number] | null>(null);
  const { disabled: inputDisabled } = useAppSelector((state) => state.narration.input);
  const mapHash =
    (selectedMap?.id || '') +
    (selectedMap?.places.reduce((acc, place) => acc + (place.hidden ? '' : place.id || ''), '') || '');
  const [mapHighlighted, setMapHighlighted] = useState(false);

  useEffect(() => {
    if (mapHash) {
      setMapHighlighted(true);
    }
  }, [mapHash]);

  useEffect(() => {
    if (maps.length) {
      setSelectedMap(maps[0]);
    }
  }, [maps]);

  return (
    <>
      {maps.length ? (
        <button
          className={`InteractiveMap__toggle ${mapHighlighted ? 'InteractiveMap__toggle--highlighted' : ''}`}
          disabled={inputDisabled}
          onClick={() => {
            dispatch(setMapModal(true));
            setMapHighlighted(false);
          }}
        >
          <GiPathDistance />
        </button>
      ) : null}
      <Modal
        className="InteractiveMap__modal"
        overlayClassName="InteractiveMap__overlay scrollbar"
        opened={opened}
        title={selectedMap?.name || 'Map'}
        onCloseModal={() => {
          dispatch(setMapModal(false));
        }}
        shouldCloseOnOverlayClick
      >
        {maps.length > 1 ? (
          <div className="InteractiveMap__modal-map-selector">
            {maps.map((map) => (
              <div key={map.id} className="InteractiveMap__modal-map-selector__item">
                <Button
                  theme={selectedMap?.id === map.id ? 'secondary' : 'transparent'}
                  onClick={() => setSelectedMap(map)}
                >
                  {map.name}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <InteractiveMapModal
          map={
            selectedMap
              ? {
                  ...selectedMap,
                  places: selectedMap.places.filter((place) => !place.hidden),
                }
              : null
          }
        />
      </Modal>
    </>
  );
};

const InteractiveMapModal = ({
  map,
}: {
  map: {
    id: string;
    name: string;
    source: {
      png: string;
    };
    places: {
      id: string;
      name: string;
      description: string;
      maskSource: string;
      sceneId?: string;
      battleId?: string;
    }[];
  } | null;
}) => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint, apiEndpoint, assetLinkLoader } = useAppContext();
  const currentScene = useAppSelector(selectCurrentScene);
  const currentIndicators = useAppSelector(selectCurrentIndicators);
  const battles = useAppSelector((state) => state.novel.battles || []);
  const rpgConfig = useAppSelector((state) => state.novel.rpg);
  const mapBackgroundRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offScreenCanvasRef = useRef(document.createElement('canvas'));
  const maskImagesRef = useRef(new Map<string, HTMLImageElement>());
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const highlightedPlace = map?.places.find((place) => place.id === highlightedPlaceId);
  const scenes = useAppSelector((state) => state.novel.scenes);
  const scene = scenes.find((scene) => scene.id === highlightedPlace?.sceneId);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - (rect?.left || 0);
        const y = event.clientY - (rect?.top || 0);
        const placeDescription = document.getElementById('interactive-map-place-info');
        if (placeDescription) {
          placeDescription.style.top = y + 10 + 'px';
          placeDescription.style.left = x + 10 + 'px';
        }
      };

      canvas.addEventListener('mousemove', handleMouseMove);

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [canvasRef.current]);

  useEffect(() => {
    const cleanupFuncRef: {
      current: (() => void) | null;
    } = { current: null };

    const handleImageLoad = () => {
      if (
        map &&
        canvasRef?.current &&
        mapBackgroundRef?.current &&
        mapBackgroundRef?.current?.height &&
        mapBackgroundRef?.current?.width
      ) {
        // eslint-disable-next-line
        // @ts-ignore
        const canvas = canvasRef?.current as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
        const offScreenCanvas = offScreenCanvasRef?.current;
        const offScreenCtx = offScreenCanvas?.getContext('2d');

        // Load all mask images
        const maskImages = new Map<string, HTMLImageElement>();
        map.places.forEach((place) => {
          const maskImage = new Image();
          maskImage.crossOrigin = 'Anonymous';
          maskImage.src = assetLinkLoader(place.maskSource, AssetDisplayPrefix.MAP_MASK);
          maskImages.set(place.id, maskImage);
          offScreenCtx?.drawImage(
            maskImage,
            0,
            0,
            mapBackgroundRef.current?.width || 0,
            mapBackgroundRef.current?.height || 0,
          );
          ctx?.drawImage(maskImage, 0, 0, mapBackgroundRef.current?.width || 0, mapBackgroundRef.current?.height || 0);
          if (canvas) canvas.style.opacity = '0.1';
        });
        maskImagesRef.current = maskImages;

        offScreenCanvas.width = mapBackgroundRef.current.width;
        offScreenCanvas.height = mapBackgroundRef.current.height;
        if (canvas) canvas.width = mapBackgroundRef.current.width;
        if (canvas) canvas.height = mapBackgroundRef.current.height;

        const isWhitePixel = (data: Uint8ClampedArray) => {
          const tolerance = 10;
          return data[0] > 255 - tolerance && data[1] > 255 - tolerance && data[2] > 255 - tolerance;
        };

        const highlightCoord = (x: number, y: number): string | null => {
          // Clear the off-screen canvas
          offScreenCtx?.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

          // Check each mask image
          let highlightedPlace: (typeof map.places)[number] | undefined;
          for (const place of map.places) {
            const maskImage = maskImagesRef.current.get(place.id);
            if (maskImage) {
              offScreenCtx?.drawImage(maskImage, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
              const pixel = offScreenCtx?.getImageData(x, y, 1, 1).data;
              if (pixel && isWhitePixel(pixel)) {
                ctx?.drawImage(maskImage, 0, 0, offScreenCanvas.width, offScreenCanvas.height);
                highlightedPlace = place;
                break;
              }
            }
          }

          if (highlightedPlace) {
            if (canvas && highlightedPlace.sceneId !== currentScene?.id) canvas.style.cursor = 'pointer';
            if (canvas) canvas.style.opacity = '0.4';
            if (canvas) canvas.style.filter = 'blur(5px)';
            setHighlightedPlaceId(highlightedPlace.id);
            return highlightedPlace.id;
          } else {
            setHighlightedPlaceId(null);
            if (canvas) canvas.style.cursor = 'default';
            if (canvas) canvas.style.opacity = '0.1';
            return null;
          }
        };

        const handleMouseMove = (e: MouseEvent) => highlightCoord(e.offsetX, e.offsetY);
        const handleTouchEnd = (e: TouchEvent) => {
          e.preventDefault();
          const touch = e.changedTouches && e.changedTouches[0];
          highlightCoord(
            touch?.clientX - (canvas?.getBoundingClientRect().left || 0),
            touch?.clientY - (canvas?.getBoundingClientRect().top || 0),
          );
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchend', handleTouchEnd);

        cleanupFuncRef.current = () => {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('touchend', handleTouchEnd);
          maskImages.clear();
          setHighlightedPlaceId(null);
        };
      }
    };

    const imgElement = mapBackgroundRef.current;
    if (imgElement) {
      imgElement.addEventListener('load', handleImageLoad);
    }

    return () => {
      if (imgElement) {
        imgElement.removeEventListener('load', handleImageLoad);
      }
      if (cleanupFuncRef.current) {
        cleanupFuncRef.current();
        cleanupFuncRef.current = null;
      }
    };
  }, [currentScene?.id, map, assetLinkLoader]);

  const handleStartBattle = () => {
    if (highlightedPlace?.battleId) {
      dispatch(setMapModal(false));
      const battleConfig = battles.find((b) => b.battleId === highlightedPlace.battleId);
      if (battleConfig && rpgConfig) {
        const initialBattleState = getInitialBattleState(battleConfig, rpgConfig);
        dispatch(setCurrentBattle({ state: initialBattleState, isActive: true }));
        trackEvent('battle-start');
      }
    }
  };

  const handleMapClick = () => {
    if (highlightedPlace) {
      const selectedPlace = map?.places.find((p) => p.id === highlightedPlaceId);
      if (selectedPlace?.battleId) {
        handleStartBattle();
      } else if (scene && selectedPlace?.sceneId !== currentScene?.id) {
        dispatch(
          setModalOpened({
            id: 'scene-preview',
            opened: true,
            itemId: scene.id,
          }),
        );
        trackEvent('scene-select');
      }
    }
  };

  const handleGoToScene = () => {
    if (highlightedPlace && scene && highlightedPlace.sceneId !== currentScene?.id) {
      dispatch(setMapModal(false));
      currentIndicators
        ?.filter((i) => i.persistent)
        .forEach((i) => {
          dispatch(
            addIndicatorToScene({
              sceneId: scene.id,
              indicator: {
                ...i,
                initialValue: i.currentValue,
              },
            }),
          );
        });
      dispatch(
        interactionStart({
          sceneId: scene.id,
          isNewScene: true,
          text: scene.prompt,
          apiEndpoint,
          characters: scene?.characters.map((r) => r.characterId) || [],
          servicesEndpoint,
          selectedCharacterId:
            scene?.characters[Math.floor(Math.random() * (scene?.characters.length || 0))].characterId || '',
        }),
      );
      trackEvent('scene-select');
    }
  };

  return (
    <div className="InteractiveMap__modal-content" id="interactive-map-modal-content">
      <img
        className="InteractiveMap__background-image"
        src={assetLinkLoader(map?.source.png || '', AssetDisplayPrefix.MAP_IMAGE)}
        alt="Map"
        ref={mapBackgroundRef}
      />
      <canvas
        onClick={!isTouchScreen ? handleMapClick : undefined}
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'all .2s ease-out',
        }}
      ></canvas>
      {highlightedPlace ? (
        isTouchScreen ? (
          <div className="InteractiveMap__place-info InteractiveMap__place-info--mobile">
            <div className="InteractiveMap__place-info__title">{highlightedPlace.name}</div>
            <div className="InteractiveMap__place-info__description">{highlightedPlace.description}</div>
            <div>
              {highlightedPlace.battleId ? (
                <Button theme="secondary" onClick={handleStartBattle}>
                  Start Battle
                </Button>
              ) : highlightedPlace.sceneId !== currentScene?.id ? (
                <Button theme="secondary" onClick={handleGoToScene}>
                  Go to place
                </Button>
              ) : (
                <i>This is the current place</i>
              )}
            </div>
          </div>
        ) : (
          <div className="InteractiveMap__place-info" id="interactive-map-place-info">
            <div className="InteractiveMap__place-info__title">{highlightedPlace.name}</div>
            <div className="InteractiveMap__place-info__description">{highlightedPlace.description}</div>
          </div>
        )
      ) : null}
    </div>
  );
};

export default InteractiveMapToggle;
