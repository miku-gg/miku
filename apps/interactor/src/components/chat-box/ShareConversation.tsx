import { Button } from '@mikugg/ui-kit'
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
import { useCallback } from 'react'

interface ImageData {
  background: string
  character: string
  text: string
  marks: string
}

const generateImage = async (
  data: ImageData,
  assetLinkLoader: (url: string) => string
): Promise<string> => {
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
        const characterHeight = character.naturalHeight
        const characterWidth = character.naturalWidth
        const ratio = characterHeight / characterWidth
        const newheight = 697
        const newwidth = newheight / ratio
        const characterY = canvas.height - newheight / 4
        const characterX = -newwidth / 8

        ctx.save()
        ctx.scale(0.5, 0.5)
        ctx.drawImage(character, characterX, characterY, newwidth, newheight)
        ctx.restore()

        const text = data.text
        const fontSize = 32
        const padding = 10
        const leftMargin = 10
        const maxWidth = canvas.width - 192 - padding * 2 - leftMargin
        const boxPadding = 10

        ctx.font = `${fontSize}px courier new`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillStyle = 'rgb(225, 138, 36)'
        ctx.shadowColor = 'rgb(0, 0, 0)'
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 4

        const lines: { text: string }[] = []
        let currentLine = ''

        const words = text.split(' ').slice(0, 30)
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
        totalTextHeight += lines.length * fontSize

        if (totalTextHeight === fontSize) {
          totalTextHeight = fontSize + 10
        }

        const textX = canvas.width - 320 - padding + leftMargin + 20
        const boxHeight = totalTextHeight + boxPadding * 4 // textHeight + paddingTop + marksHeight + paddingBottom
        const boxY = canvas.height / 2 - boxHeight / 2

        // Calculate the dimensions of the background box
        const boxX = canvas.width - 320 - padding
        const boxWidth = maxWidth + leftMargin * 2

        // Draw the background box
        ctx.fillStyle = 'rgba(23, 23, 23, 0.55)'
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

        // Load and draw the quotation marks image
        const quotationMarks = new Image()
        quotationMarks.src = data.marks
        quotationMarks.onload = () => {
          const quotationMarksWidth = 60
          const quotationMarksHeight = 60
          ctx.globalAlpha = 0.2

          // Draw the top quotation marks image centered horizontally within the box
          const topQuotationMarksX = textX - quotationMarksWidth + 40
          const topQuotationMarksY = boxY + boxPadding
          ctx.drawImage(
            quotationMarks,
            topQuotationMarksX,
            topQuotationMarksY,
            quotationMarksWidth,
            quotationMarksHeight
          )

          const bottomQuotationMarksX =
            textX + maxWidth - quotationMarksWidth - 20
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
          // Draw the text on top of the background box
          ctx.fillStyle = 'rgb(225, 138, 36)' // Color del texto (naranja)
          let currentTextY = boxY + boxPadding * 2
          ctx.strokeStyle = 'black' // Color del borde (negro)
          ctx.lineWidth = 1 // Ancho del borde
          ctx.globalAlpha = 1

          // Iterar sobre las líneas de texto y dibujar cada línea con borde
          for (const line of lines) {
            const x = textX
            const y = currentTextY

            // Dibujar el texto con borde
            ctx.strokeText(line.text, x, y)
            ctx.fillText(line.text, x, y) // Relleno de texto

            // Actualizar la posición Y para la siguiente línea
            currentTextY += fontSize
          }

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

export const ShareConversation = ({ children }: { children: JSX.Element }) => {
  const scene = useAppSelector(selectCurrentScene)
  const backgrounds = useAppSelector((state) => state.novel.backgrounds)
  const displayCharacter = useAppSelector(selectLastSelectedCharacter)
  const { assetLinkLoader } = useAppContext()

  const backgroundImage = backgrounds.find((b) => b.id === scene?.backgroundId)

  const handleShare = useCallback(async () => {
    try {
      const text = window.getSelection()?.toString()
      await generateImage(
        {
          background: backgroundImage?.source.jpg || '',
          character: displayCharacter.image || '',
          text: text || '',
          marks: quotationMarks,
        },
        assetLinkLoader
      )
    } catch (e) {
      console.error(e)
    }
  }, [backgroundImage?.source.jpg, displayCharacter.image, assetLinkLoader])

  return (
    <Selection.Root>
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <Selection.Trigger>{children}</Selection.Trigger>
      <Selection.Portal>
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Selection.Content className="shareConversation">
          <Button theme="gradient" onClick={() => handleShare()}>
            Share
            <IoMdShare />
          </Button>
          {/* eslint-disable-next-line */}
          {/* @ts-ignore */}
          <Selection.Arrow className="shareConversation__arrow" />
        </Selection.Content>
      </Selection.Portal>
    </Selection.Root>
  )
}
