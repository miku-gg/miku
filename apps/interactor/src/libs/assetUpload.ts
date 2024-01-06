import axios from 'axios'

const MAX_FILE_SIZE = 15 * 1024 * 1024

async function dataURItoFile(dataURI: string, filename: string): Promise<File> {
  const response = await fetch(dataURI)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

export const uploadAsset = async (
  assetUploadUrl: string,
  file: File | string
): Promise<{
  fileName: string
  fileSize: number
}> => {
  try {
    try {
      if (typeof file === 'string') {
        file = await dataURItoFile(file, 'asset')
      }
      if (file.size > MAX_FILE_SIZE) {
        const fileSize2Precision = Math.round(file.size / 1024 / 1024)
          .toString()
          .slice(0, 3)
        throw `Asset is too large ${fileSize2Precision}MB`
      }
      const result = await axios.get<{ url: string; fileName: string }>(
        `${assetUploadUrl}/ask`,
        {
          params: {
            contentType: file.type,
          },
        }
      )

      await new Promise((resolve) => {
        const reader = new FileReader()

        reader.addEventListener('load', async (event) => {
          const fileData = event.target?.result
          await axios.put(result.data.url, fileData)
          resolve(true)
        })

        reader.readAsArrayBuffer(file as File)
      })

      const response = await axios<{ fileName: string; fileSize: number }>({
        method: 'POST',
        url: `${assetUploadUrl}/complete`,
        data: {
          fileName: result.data.fileName,
          contentType: file.type,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.data
    } catch (error) {
      throw 'Error uploading file'
    }
  } catch (error) {
    throw 'Error'
  }
}
