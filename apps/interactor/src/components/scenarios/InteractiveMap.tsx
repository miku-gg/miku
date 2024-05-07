import { useRef, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { selectCurrentMap } from '../../state/selectors'
import { GiPathDistance } from 'react-icons/gi'
import './InteractiveMap.scss'
import { Modal } from '@mikugg/ui-kit'
import { setMapModal } from '../../state/slices/settingsSlice'
import { trackEvent } from '../../libs/analytics'
import { interactionStart } from '../../state/slices/narrationSlice'
import { useAppContext } from '../../App.context'

const InteractiveMapToggle = () => {
  const dispatch = useAppDispatch()
  const opened = useAppSelector((state) => state.settings.modals.map)
  const map = useAppSelector(selectCurrentMap)
  return (
    <>
      {map ? (
        <button
          className="InteractiveMap__toggle"
          onClick={() => {
            dispatch(setMapModal(true))
          }}
        >
          <GiPathDistance />
        </button>
      ) : null}
      <Modal
        className="InteractiveMap__modal"
        overlayClassName="InteractiveMap__overlay"
        opened={opened}
        title={map?.name || 'Map'}
        onCloseModal={() => {
          dispatch(setMapModal(false))
        }}
        shouldCloseOnOverlayClick
      >
        <InteractiveMapModal />
      </Modal>
    </>
  )
}

const InteractiveMapModal = () => {
  const dispatch = useAppDispatch()
  const map = useAppSelector(selectCurrentMap)
  const { servicesEndpoint, apiEndpoint } = useAppContext()
  const mapBackgroundRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offScreenCanvasRef = useRef(document.createElement('canvas'))
  const maskImagesRef = useRef(new Map<string, HTMLImageElement>())
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(
    null
  )
  const highlightedPlace = map?.places.find(
    (place) => place.id === highlightedPlaceId
  )
  const scene = useAppSelector((state) =>
    state.novel.scenes.find((scene) => scene.id === highlightedPlace?.sceneId)
  )

  useEffect(() => {
    canvasRef.current?.addEventListener('mousemove', (event) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      const x = event.clientX - (rect?.left || 0)
      const y = event.clientY - (rect?.top || 0)
      const placeDescription = document.getElementById(
        'interactive-map-place-info'
      )
      if (placeDescription) {
        placeDescription.style.top = y + 10 + 'px'
        placeDescription.style.left = x + 10 + 'px'
      }
    })
  }, [canvasRef.current])

  useEffect(() => {
    if (
      map &&
      canvasRef?.current &&
      mapBackgroundRef?.current &&
      mapBackgroundRef?.current?.height &&
      mapBackgroundRef?.current?.width
    ) {
      console.log('Map loaded')
      console.log(
        mapBackgroundRef.current.height,
        mapBackgroundRef.current.width
      )
      // eslint-disable-next-line
      // @ts-ignore
      const canvas = canvasRef?.current as HTMLCanvasElement
      const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D
      const offScreenCanvas = offScreenCanvasRef?.current
      const offScreenCtx = offScreenCanvas?.getContext('2d')

      // Load all mask images
      const maskImages = new Map<string, HTMLImageElement>()
      map.places.forEach((place) => {
        const maskImage = new Image()
        maskImage.src = place.maskSource
        maskImages.set(place.id, maskImage)
        offScreenCtx?.drawImage(
          maskImage,
          0,
          0,
          mapBackgroundRef.current?.width || 0,
          mapBackgroundRef.current?.height || 0
        )
        ctx?.drawImage(
          maskImage,
          0,
          0,
          mapBackgroundRef.current?.width || 0,
          mapBackgroundRef.current?.height || 0
        )
        if (canvas) canvas.style.opacity = '0.1'
      })
      maskImagesRef.current = maskImages

      console.log(mapBackgroundRef.current.width)
      console.log(mapBackgroundRef.current.height)

      offScreenCanvas.width = mapBackgroundRef.current.width
      offScreenCanvas.height = mapBackgroundRef.current.height
      if (canvas) canvas.width = mapBackgroundRef.current.width
      if (canvas) canvas.height = mapBackgroundRef.current.height

      const isWhitePixel = (data: Uint8ClampedArray) => {
        const tolerance = 10
        return (
          data[0] > 255 - tolerance &&
          data[1] > 255 - tolerance &&
          data[2] > 255 - tolerance
        )
      }

      canvas?.addEventListener('mousemove', (e) => {
        const x = e.offsetX
        const y = e.offsetY

        // Clear the off-screen canvas
        offScreenCtx?.clearRect(
          0,
          0,
          offScreenCanvas.width,
          offScreenCanvas.height
        )

        // Check each mask image
        let highlightedPlace: (typeof map.places)[number] | undefined
        for (const place of map.places) {
          const maskImage = maskImagesRef.current.get(place.id)
          console.log(`Checking ${place.id}`, maskImage)
          if (maskImage) {
            offScreenCtx?.drawImage(
              maskImage,
              0,
              0,
              offScreenCanvas.width,
              offScreenCanvas.height
            )
            const pixel = offScreenCtx?.getImageData(x, y, 1, 1).data
            console.log(pixel)
            if (pixel && isWhitePixel(pixel)) {
              console.log(`Highlighting ${place.id}`)
              ctx?.drawImage(
                maskImage,
                0,
                0,
                offScreenCanvas.width,
                offScreenCanvas.height
              )
              highlightedPlace = place
              break
            }
          }
        }

        if (highlightedPlace) {
          if (canvas) canvas.style.cursor = 'pointer'
          if (canvas) canvas.style.opacity = '0.4'
          if (canvas) canvas.style.filter = 'blur(5px)'
          setHighlightedPlaceId(highlightedPlace.id)
          // Increase brightness on the highlighted area
        } else {
          setHighlightedPlaceId(null)
          if (canvas) canvas.style.cursor = 'default'
          if (canvas) canvas.style.opacity = '0.1'
        }
      })

      window.addEventListener('resize', () => {
        // if (canvas) canvas.width = window.innerWidth
        // if (canvas) canvas.height = window.innerHeight
      })
    }
  }, [map, canvasRef?.current, mapBackgroundRef.current])

  return (
    <div
      className="InteractiveMap__modal-content"
      id="interactive-map-modal-content"
    >
      <img
        className="InteractiveMap__background-image"
        src={map?.source.png}
        alt="Map"
        ref={mapBackgroundRef}
      />
      <canvas
        onClick={() => {
          if (highlightedPlace && scene) {
            dispatch(setMapModal(false))
            dispatch(
              interactionStart({
                sceneId: scene.id,
                text: scene.prompt,
                apiEndpoint,
                characters: scene?.characters.map((r) => r.characterId) || [],
                servicesEndpoint,
                selectedCharacterId:
                  scene?.characters[
                    Math.floor(Math.random() * (scene?.characters.length || 0))
                  ].characterId || '',
              })
            )
            trackEvent('scene-select')
          }
        }}
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'all .2s ease-out',
        }}
      ></canvas>
      {highlightedPlace ? (
        <div
          className="InteractiveMap__place-info"
          id="interactive-map-place-info"
          style={{
            position: 'absolute',
          }}
        >
          <div className="InteractiveMap__place-info__title">
            {highlightedPlace.name}
          </div>
          <div className="InteractiveMap__place-info__description">
            {highlightedPlace.description}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default InteractiveMapToggle
