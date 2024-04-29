import { Button, Modal } from '@mikugg/ui-kit'
import { useState } from 'react'
import { IoMdShare } from 'react-icons/io'
import * as Selection from 'selection-popover'
import quotationMarks from '../../../public/images/quotation-marks.png'
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
          //tslint:disable-next-line
          for (const line of lines) {
            totalTextHeight += fontSize
          }

          const textX =
            canvas.width - characterWidth - padding + leftMargin + 20
          let textY = (canvas.height - totalTextHeight) / 2

          const boxX = canvas.width - characterWidth - padding
          const boxY = textY - boxPadding
          const boxWidth = maxWidth + leftMargin * 2
          const boxHeight = totalTextHeight + boxPadding * 2 + 10

          // Draw the background box
          ctx.fillStyle = 'rgba(23, 23, 23, 0.55)'
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

          const quotationMarks = new Image()
          quotationMarks.src = data.marks
          quotationMarks.onload = () => {
            const quotationMarksWidth = 20
            const quotationMarksHeight = 20

            const startQuotationMarksX = textX - quotationMarksWidth - 5
            const startQuotationMarksY = textY
            ctx.drawImage(
              quotationMarks,
              startQuotationMarksX,
              startQuotationMarksY,
              quotationMarksWidth,
              quotationMarksHeight
            )

            ctx.fillStyle = 'rgb(225, 138, 36)'
            textY += boxPadding
            for (const line of lines) {
              const x = textX
              const y = textY

              ctx.fillText(line.text, x, y)
              textY += fontSize
            }

            const endQuotationMarksX =
              textX + ctx.measureText(lines[lines.length - 1].text).width + 5
            const endQuotationMarksY = textY - fontSize

            ctx.save()
            ctx.translate(
              endQuotationMarksX + quotationMarksWidth,
              endQuotationMarksY
            )
            ctx.scale(-1, 1)
            ctx.drawImage(
              quotationMarks,
              0,
              0,
              quotationMarksWidth,
              quotationMarksHeight
            )
            ctx.restore()

            resolve(canvas.toDataURL('image/png'))
          }
          quotationMarks.onerror = () => {
            reject(new Error('Error loading question marks image'))
          }
        }
        character.onerror = () => {
          reject(new Error('Error loading character image'))
        }
      }
      background.onerror = () => {
        reject(new Error('Error loading background image'))
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
