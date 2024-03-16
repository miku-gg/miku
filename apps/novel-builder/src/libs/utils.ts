import {
  NovelV3,
  extractNovelAssets,
  replaceStringsInObject,
} from "@mikugg/bot-utils";
import Hash from "ipfs-only-hash";

export async function stringToIPFSHash(context: string): Promise<string> {
  return (await Hash.of(context)) as string;
}

export async function hashBase64(base64Value: string) {
  const ipfsHash = await stringToIPFSHash(base64Value);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(",")[1]);
};

export const checkFileType = (file: File, types = ["image/png"]): boolean => {
  return types.includes(file.type);
};

export const downloadAssetAsBase64URI = async (
  url: string
): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const downloadNovelState = async (
  _novel: NovelV3.NovelState,
  getAssetUrl: ((asset: string) => string) | false,
  onUpdate: (text: string) => void,
  asBuild = false
) => {
  const filename =
    _novel.title.replace(/ /g, "_") +
    (asBuild ? ".novel.json" : ".novel.miku-temp.json");
  onUpdate("Extracting assets...");
  const { assets, novel } = await extractNovelAssets(_novel);

  // DOWNLOAD ASSETS
  const allAssets = Array.from(
    new Map<string, string>([
      ...assets.audios,
      ...assets.images,
      ...assets.videos,
    ])
  );

  onUpdate(`Downloading assets 0/${allAssets.length}...`);
  let novelResult = novel;
  const BATCH_SIZE = 10;
  let dl = 0;
  for (let i = 0; i < allAssets.length; i += BATCH_SIZE) {
    const batch = allAssets.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async ([key, value]) => {
      if (value && !value.startsWith("data:") && getAssetUrl) {
        const base64 = await downloadAssetAsBase64URI(getAssetUrl(value));
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return base64;
      } else {
        onUpdate(`Downloading assets ${++dl}/${allAssets.length}...`);
        return value;
      }
    });
    const base64s = await Promise.all(promises);
    batch.forEach(([key, value], index) => {
      novelResult = replaceStringsInObject(
        novelResult,
        key,
        base64s[index]
      ) as NovelV3.NovelState;
    });
  }

  onUpdate(`Building JSON...`);
  // DOWNLOAD STATE AS JSON
  const data = JSON.stringify({ novel: novelResult, version: "v3" }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
