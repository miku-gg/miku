import base64 from 'base-64';
import utf8 from 'utf8';

export function parseAttributes(s: string): [string, string][] {
  return s.split('\n').map((x) => {
    const [a = '', b = ''] = x.split(': ');
    return [a.trim(), b.trim()];
  });
}

export function parseExampleMessages(s: string): string[] {
  return s
    .split('<START>\n')
    .map((x) => x.trim())
    .filter((x) => x);
}

export function encodeText(text: string): string {
  return base64.encode(utf8.encode(text));
}

export function decodeText(encodedText: string): string {
  return utf8.decode(base64.decode(encodedText));
}

export function replaceStringsInObject(obj: any, find: string, replace: string): object {
  const objString = JSON.stringify(obj);
  const replaced = objString.split(find).join(replace);
  return JSON.parse(replaced);
}
