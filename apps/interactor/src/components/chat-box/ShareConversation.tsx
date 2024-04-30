import { Button, Modal } from '@mikugg/ui-kit'
import { useState } from 'react'
import { IoMdShare } from 'react-icons/io'
import * as Selection from 'selection-popover'
import quotationMarks from '../../../public/images/quotation-marks.png'
import { useAppContext } from '../../App.context'
import { CustomEventType, postMessage } from '../../libs/stateEvents'
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
  marks: string
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
          const characterY = canvas.height - characterHeight * 0.7

          ctx.save() // Guardar el estado actual del contexto
          ctx.scale(0.8, 0.8) // Reducir la escala en un 20%
          ctx.drawImage(
            character,
            characterX,
            characterY,
            characterWidth,
            characterHeight
          )
          ctx.restore() // Restaurar el estado del contexto

          const text = data.text
          const fontSize = 24
          const padding = 10
          const leftMargin = 10
          const maxWidth =
            canvas.width - characterWidth - padding * 2 - leftMargin
          const boxPadding = 10

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

          const words = text.split(' ').slice(0, 32)
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

          const textX =
            canvas.width - characterWidth - padding + leftMargin + 20
          const boxHeight = totalTextHeight + boxPadding * 4 + 30 * 2 // textHeight + paddingTop + marksHeight + paddingBottom
          const boxY = canvas.height / 2 - boxHeight / 2

          // Calculate the dimensions of the background box
          const boxX = canvas.width - characterWidth - padding
          const boxWidth = maxWidth + leftMargin * 2

          // Draw the background box
          ctx.fillStyle = 'rgba(23, 23, 23, 0.55)'
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

          // Load and draw the quotation marks image
          const quotationMarks = new Image()
          quotationMarks.src = data.marks
          quotationMarks.onload = () => {
            const quotationMarksWidth = 30
            const quotationMarksHeight = 30

            // Draw the top quotation marks image centered horizontally within the box
            const topQuotationMarksX =
              textX + maxWidth / 2 - quotationMarksWidth
            const topQuotationMarksY = boxY + boxPadding
            ctx.drawImage(
              quotationMarks,
              topQuotationMarksX,
              topQuotationMarksY,
              quotationMarksWidth,
              quotationMarksHeight
            )

            // Draw the text on top of the background box
            ctx.fillStyle = 'rgb(225, 138, 36)'
            let currentTextY = boxY + boxPadding * 2 + quotationMarksHeight
            for (const line of lines) {
              const x = textX
              const y = currentTextY

              ctx.fillText(line.text, x, y)
              currentTextY += fontSize
            }

            // Draw the bottom quotation marks image centered horizontally within the box
            const bottomQuotationMarksX =
              textX + maxWidth / 2 - quotationMarksWidth
            const bottomQuotationMarksY =
              boxY + boxHeight - boxPadding - quotationMarksHeight
            ctx.save() // Save the current context state
            ctx.translate(
              bottomQuotationMarksX + quotationMarksWidth / 2,
              bottomQuotationMarksY + quotationMarksHeight / 2
            ) // Move to the center of the bottom quotation marks
            ctx.rotate(Math.PI) // Rotate 180 degrees
            ctx.drawImage(
              quotationMarks,
              -quotationMarksWidth / 2,
              -quotationMarksHeight / 2,
              quotationMarksWidth,
              quotationMarksHeight
            )
            ctx.restore() // Restore the context to its previous state

            const DataURL = canvas.toDataURL('image/png')

            postMessage(CustomEventType.SHARE_CONVERSATION, DataURL)

            resolve(DataURL)
          }
          quotationMarks.onerror = () => {
            reject(new Error('Error al cargar la imagen de las comillas'))
          }
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
      marks: quotationMarks,
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
          <Button theme="gradient" onClick={() => handleShare()}>
            Share
            <IoMdShare />
          </Button>
          <Selection.Arrow className="shareConversation__arrow" />
        </Selection.Content>
      </Selection.Portal>
    </Selection.Root>
  )
}
