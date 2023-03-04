import base64 from 'base-64';
import utf8 from 'utf8';

export function encode(text: string): string {
  return base64.encode(utf8.encode(text));
}

export function decode(encodedText: string): string {
  return utf8.decode(base64.decode(encodedText));
}