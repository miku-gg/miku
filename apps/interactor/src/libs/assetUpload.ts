import axios from 'axios'

function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

export const uploadAsset = async (
  asesetUploadURL: string,
  base64URI: string
): Promise<{
  fileName: string
  fileSize: number
}> => {
  try {
    try {
      const blob = dataURItoBlob(base64URI)
      // Make a POST request to the Lambda function
      const response = await axios<{ fileName: string; fileSize: number }>({
        method: 'POST',
        url: asesetUploadURL,
        data: blob,
        headers: {
          'Content-Type': blob.type,
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
