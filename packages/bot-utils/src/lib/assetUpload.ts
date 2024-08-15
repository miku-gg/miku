import axios from 'axios';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const uploadAsset = async (
  assetUploadUrl: string,
  file: File,
): Promise<{
  fileName: string;
  fileSize: number;
}> => {
  try {
    try {
      if (file.size > MAX_FILE_SIZE) {
        const fileSize2Precision = Math.round(file.size / 1024 / 1024)
          .toString()
          .slice(0, 3);
        throw `Asset is too large ${fileSize2Precision}MB`;
      }
      const result = await axios.get<{ url: string; fileName: string }>(`${assetUploadUrl}/ask`, {
        params: {
          contentType: file.type,
        },
      });

      await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', async (event) => {
          const fileData = event.target?.result;
          try {
            await axios.put(result.data.url, fileData, {
              headers: {
                'Content-Type': 'application/octet-stream',
              },
            });
            resolve(true);
          } catch (error) {
            reject('Error uploading file');
          }
        });

        reader.readAsArrayBuffer(file as File);
      });

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
      });

      return response.data;
    } catch (error) {
      throw 'Error uploading file';
    }
  } catch (error) {
    throw 'Error';
  }
};
