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
          // Dibujar la imagen del personaje
          ctx.drawImage(character, 0, 128, 384, 384)

          // Dibujar la caja a la derecha de la imagen
          const boxWidth = 200
          const boxHeight = 50
          const boxX = canvas.width - boxWidth - 10 // 10px de margen a la derecha
          const boxY = 10 // 10px de margen desde la parte superior
          ctx.fillStyle = 'rgba(228, 228, 228, 0.6)'
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

          // Dibujar el texto dentro de la caja
          ctx.font = '20px Arial'
          ctx.fillStyle = '#000000'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const text = data.text
          const textX = boxX + boxWidth / 2
          const textY = boxY + boxHeight / 2
          ctx.fillText(text, textX, textY)

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
