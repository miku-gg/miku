import extract from 'png-chunks-extract'
import encode from 'png-chunks-encode'
import text from 'png-chunk-text'
import { Buffer } from 'buffer';

function combineImages(image1Base64: string, image2Url: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
      // Create img elements and load images
      const img1 = document.createElement('img');
      img1.src = image1Base64;
      await new Promise(r => img1.onload = r);

      const img2 = new Image();
      img2.src = image2Url;
      await new Promise(r => img2.onload = r);

      // Create a canvas and draw the images on it
      const canvas = document.createElement('canvas');
      canvas.width = img2.width;
      canvas.height = img2.height + img2.width;
      const ctx = canvas.getContext('2d');

      // Determine dimensions for the square crop of the first image
      const squareSize = img1.width;
      const leftOffset = (img1.width - squareSize) / 2;
      const topOffset = (img1.height - squareSize) / 2;

      // Draw first image as a square and stretch to match the width of the second image
      ctx?.drawImage(img1, leftOffset, topOffset, squareSize, squareSize, 0, 0, canvas.width, canvas.width);

      // Draw second image below the first image
      ctx?.drawImage(img2, 0, canvas.width);

      // Convert the combined image to a base64 string
      canvas.toBlob(function(blob) {
        const reader = new FileReader();
          reader.onload = function() {
              const dataUrl = reader.result as string;
              resolve(dataUrl);
          };
          if (blob) reader.readAsDataURL(blob);
      }, 'image/png');
  });
}

// stolen from agnai :v
export async function downloadPng(charJson: string, charImgUrl: string, charName: string) {
  // Create a new image element
  const imgElement = document.createElement('img')
  imgElement.setAttribute('crossorigin', 'anonymous')
  imgElement.src = await combineImages(charImgUrl, '/card-bottom.png');
  imgElement.onload = () => {
    const imgDataUrl = imgToPngDataUrl(imgElement)
    const imgBase64Data = imgDataUrl.split(',')[1]
    const imgBuffer = Buffer.from(atob(imgBase64Data), 'binary')
    
    const chunksNo_tEXt = extract(imgBuffer).filter((chunk) => chunk.name !== 'tEXt')
    const base64EncodedJson = Buffer.from(charJson, 'utf8').toString('base64')
    const lastChunkIndex = chunksNo_tEXt.length - 1
    const chunksToExport = [
      ...chunksNo_tEXt.slice(0, lastChunkIndex),
      text.encode('chara', base64EncodedJson),
      chunksNo_tEXt[lastChunkIndex],
    ]
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(new Blob([Buffer.from(encode(chunksToExport))]))
    downloadLink.download = charName + '.miku.card.png'
    downloadLink.click()
    URL.revokeObjectURL(downloadLink.href)
  }
}

function imgToPngDataUrl(imgElement: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = imgElement.naturalWidth
  canvas.height = imgElement.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(imgElement, 0, 0)
  const dataUrl = canvas.toDataURL('image/png')
  return dataUrl
}