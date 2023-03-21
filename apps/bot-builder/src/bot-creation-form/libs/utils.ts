import base64 from 'base-64';
import * as dagPB from '@ipld/dag-pb';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2'
import  Hash from 'ipfs-only-hash';

export async function stringToIPFSHash(context: string): Promise<string> {
  return await Hash.of(context) as string;
}

// export async function stringToIPFSHash(content: string): Promise<string> {
//   // Convert the content string to a Uint8Array
//   const encoder = new TextEncoder();
//   const data = encoder.encode(content);

//   // Create a DAGNode with the data
//   const dagNode = dagPB.createNode(data);

//   if (!dagNode.Data) {
//     throw 'Error: DAGNode data is empty';
//   }

//   // Compute the SHA-256 multihash of the serialized DAGNode
//   const digestBytes = await sha256.digest(dagNode.Data);

//   // Create a CID with the multihash
//   const cid = CID.createV0(digestBytes);

//   // Convert the CID to a string
//   const ipfsHash = cid.toString();

//   return ipfsHash;
// }

export async function hashBase64(base64Value) {
  // Convert base64 to binary string
  const binaryString = base64.decode(base64Value);
  // Compute the IPFS hash of the binary string
  const ipfsHash = await stringToIPFSHash(binaryString);
  return ipfsHash;
}

export const hashBase64URI = async (base64Content: string): Promise<string> => {
  return hashBase64(base64Content.split(',')[1]);
}

export const checkImageDimensionsAndType = (file: File, types = ['image/png'], width=256, height=256): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve(img.width === width && img.height === height && (!types || types.includes(file.type)));
    };
  });
}