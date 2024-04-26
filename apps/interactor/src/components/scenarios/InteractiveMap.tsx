import { useRef, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { selectCurrentMap } from '../../state/selectors'
import { GiPathDistance } from 'react-icons/gi'
import './InteractiveMap.scss'
import { Modal } from '@mikugg/ui-kit'
import { setMapModal } from '../../state/slices/settingsSlice'

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
  const map = useAppSelector(selectCurrentMap)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offScreenCanvasRef = useRef(document.createElement('canvas'))
  const maskImagesRef = useRef(new Map<string, HTMLImageElement>())
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(
    null
  )
  const highlightedPlace = map?.places.find(
    (place) => place.id === highlightedPlaceId
  )
  console.log('canvasRef', canvasRef)

  useEffect(() => {
    if (map && canvasRef?.current) {
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
        offScreenCtx?.drawImage(maskImage, 0, 0)
        ctx?.drawImage(maskImage, 0, 0)
        if (canvas) canvas.style.opacity = '0.1'
      })
      maskImagesRef.current = maskImages

      // Set the off-screen canvas size to match the map image
      const mapImage = new Image()
      mapImage.src = map.source.png
      mapImage.onload = () => {
        offScreenCanvas.width = mapImage.width
        offScreenCanvas.height = mapImage.height
        if (canvas) canvas.width = mapImage.width
        if (canvas) canvas.height = mapImage.height
      }

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
          if (maskImage) {
            offScreenCtx?.drawImage(maskImage, 0, 0)
            const pixel = offScreenCtx?.getImageData(x, y, 1, 1).data
            if (pixel && isWhitePixel(pixel)) {
              ctx?.drawImage(maskImage, 0, 0)
              highlightedPlace = place
              break
            }
          }
        }
        console.log('highlightedPlace', highlightedPlace)

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
        if (canvas) canvas.width = window.innerWidth
        if (canvas) canvas.height = window.innerHeight
      })
    }
  }, [map, canvasRef?.current])

  return (
    <div style={{ position: 'relative' }}>
      <img src={map?.source.png} alt="Map" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'all .2s ease-out',
        }}
      ></canvas>
      {highlightedPlace ? (
        <div className="InteractiveMap__place-info">
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
