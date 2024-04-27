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

// Ejemplo de uso

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
          const fontSize = 20
          const padding = 10
          const maxWidth = canvas.width - characterWidth - padding * 2

          ctx.font = `${fontSize}px courier new`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillStyle = 'rgb(225, 138, 36)'
          ctx.shadowColor = 'rgb(0, 0, 0)' // Color de la sombra
          ctx.shadowOffsetX = 2 // Desplazamiento horizontal de la sombra
          ctx.shadowOffsetY = 2 // Desplazamiento vertical de la sombra
          ctx.shadowBlur = 4 // Difuminado de la sombra

          let lines = []
          let currentLine = ''
          const textX = canvas.width / 2 + padding
          let textY = padding

          const words = text.split(' ')
          for (const word of words) {
            const testLine = currentLine + word + ' '
            const metrics = ctx.measureText(testLine)
            const testWidth = metrics.width

            if (testWidth > maxWidth && currentLine.trim().length > 0) {
              lines.push({ text: currentLine.trim(), x: textX, y: textY })
              currentLine = word + ' '
              textY += fontSize
            } else {
              currentLine = testLine
            }
          }
          if (currentLine.trim().length > 0) {
            lines.push({ text: currentLine.trim(), x: textX, y: textY })
          }

          for (const line of lines) {
            const lineWidth = ctx.measureText(line.text).width
            if (line.x + lineWidth > canvas.width - padding) {
              ctx.fillText(
                line.text,
                canvas.width - padding - lineWidth,
                line.y
              )
            } else {
              ctx.fillText(line.text, line.x, line.y)
            }
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
