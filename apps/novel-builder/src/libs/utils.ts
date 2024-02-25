import { NovelV3 } from "@mikugg/bot-utils";
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

export const downloadNovelState = (novel: NovelV3.NovelState) => {
  const filename = novel.title.replace(/ /g, "_") + ".novel.miku-temp.json";
  // DOWNLOAD STATE AS JSON
  const data = JSON.stringify({ novel, version: "v3" }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
