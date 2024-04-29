import { Modal } from '@mikugg/ui-kit'
import { useState } from 'react'
import { IoMdShare } from 'react-icons/io'
import * as Selection from 'selection-popover'
import { useAppContext } from '../../App.context'
import {
  selectCurrentScene,
  selectLastSelectedCharacter,
} from '../../state/selectors'
import { useAppSelector } from '../../state/store'
import './ShareConversation.scss'

interface ImageData {
  background: string
  character: string
  text: string
}

export const ShareConversation = ({ children }: { children: JSX.Element }) => {
  const scene = useAppSelector(selectCurrentScene)
  const backgrounds = useAppSelector((state) => state.novel.backgrounds)
  const displayCharacter = useAppSelector(selectLastSelectedCharacter)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const { assetLinkLoader } = useAppContext()

  const backgroundImage = backgrounds.find((b) => b.id === scene?.backgroundId)

  const getSelectedText = () => {
    const selectedText = window.getSelection()?.toString()
    return selectedText
  }

  const generateImage = async (data: ImageData): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Error al obtener el contexto 2D del canvas'))
        return
      }

      const background = new Image()
      background.crossOrigin = 'anonymous'
      background.src = assetLinkLoader(data.background)
      background.onload = () => {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

        const character = new Image()
        character.crossOrigin = 'anonymous'
        character.src = assetLinkLoader(data.character)
        character.onload = () => {
          const characterWidth = 256
          const characterHeight = 448
          const characterX = 0
          const characterY = canvas.height - characterHeight

          ctx.drawImage(
            character,
            characterX,
            characterY,
            characterWidth,
            characterHeight
          )

          const text = data.text
          const fontSize = 18
          const padding = 10
          const leftMargin = 10 // Added left margin
          const maxWidth =
            canvas.width - characterWidth - padding * 2 - leftMargin // Adjusted maxWidth

          ctx.font = `${fontSize}px courier new`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillStyle = 'rgb(225, 138, 36)'
          ctx.shadowColor = 'rgb(0, 0, 0)'
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          ctx.shadowBlur = 4

          let lines = []
          let currentLine = ''

          const words = text.split(' ')
          for (const word of words) {
            const testLine = currentLine + word + ' '
            const metrics = ctx.measureText(testLine)
            const testWidth = metrics.width

            if (testWidth > maxWidth && currentLine.trim().length > 0) {
              lines.push({ text: currentLine.trim() })
              currentLine = word + ' '
            } else {
              currentLine = testLine
            }
          }
          if (currentLine.trim().length > 0) {
            lines.push({ text: currentLine.trim() })
          }

          let totalTextHeight = 0
          for (const line of lines) {
            totalTextHeight += fontSize
          }

          const textX = canvas.width - characterWidth - padding + leftMargin // Adjusted textX
          let textY = (canvas.height - totalTextHeight) / 2

          for (const line of lines) {
            const x = textX
            const y = textY

            ctx.fillText(line.text, x, y)
            textY += fontSize
          }

          resolve(canvas.toDataURL('image/png'))
        }
        character.onerror = () => {
          reject(new Error('Error al cargar la imagen del personaje'))
        }
      }
      background.onerror = () => {
        reject(new Error('Error al cargar la imagen de fondo'))
      }
    })
  }

  const handleShare = async () => {
    const text = getSelectedText()
    const image = await generateImage({
      background: backgroundImage?.source.jpg || '',
      character: displayCharacter.image || '',
      text: text || '',
    })
    setGeneratedImage(image)
  }
  return (
    <Selection.Root>
      <>
        {generatedImage ? (
          <Modal
            className="shareConversation__modal"
            opened={!!generatedImage}
            onCloseModal={() => setGeneratedImage(null)}
          >
            <img src={generatedImage} />
          </Modal>
        ) : null}
      </>
      <Selection.Trigger>{children}</Selection.Trigger>
      <Selection.Portal>
        <Selection.Content className="shareConversation">
          <button onClick={() => handleShare()}>
            Share
            <IoMdShare />
          </button>
          <Selection.Arrow />
        </Selection.Content>
      </Selection.Portal>
    </Selection.Root>
  )
}
