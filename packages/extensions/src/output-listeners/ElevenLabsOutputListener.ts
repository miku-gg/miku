
import axios from 'axios';
import fs from 'fs';
import * as Core from '@mikugg/core';

const TMP_AUDIO_FILE = 'temp/temp.mp3';

interface ElevenLabsOutputListenerConfig {
  apiKey: string;
  voiceId: string;
  onAudioFileSynthesized: (filename: string) => void
}

export class ElevenLabsOutputListener extends Core.OutputListeners.OutputListener<Core.OutputListeners.DialogOutputEnvironment> {
  private apiKey: string;
  private voiceId: string;
  private onAudioFileSynthesized: (filename: string) => void;
  
  constructor({apiKey, voiceId, onAudioFileSynthesized}: ElevenLabsOutputListenerConfig) {
    super();
    this.apiKey = apiKey;
    this.voiceId = voiceId;
    this.onAudioFileSynthesized = onAudioFileSynthesized;
  }

  private cleanText(text: string) {
    let cleanText = "";
    let lastOpen: undefined | string = undefined;
    for (let x = 0; x < text.length; x++)
    {
        const ch = text.charAt(x);

        if (lastOpen == '(' && ch == ')') {lastOpen = undefined; continue;}
        if (lastOpen == '[' && ch == ']') {lastOpen = undefined; continue;}
        if (lastOpen == '-' && ch == '-') {lastOpen = undefined; continue;}
        if (lastOpen == '*' && ch == '*') {lastOpen = undefined; continue;}

        if (ch == '(' || ch == '[' || ch == '-' || ch == "*") {
          lastOpen = ch;
          continue;
        }

        if (!lastOpen) {
          cleanText += ch;
        }

        
    }
    cleanText.replace(/ *\([^)]*\) */g, "");

    return cleanText;
  }

  public handleOutput(output: Core.OutputListeners.DialogOutputEnvironment): void {
    const text = this.cleanText(output.text);
    this.synthesizeAndPlay(text);
  }

  async synthesizeAndPlay(text: string): Promise<void> {
    const requestUrl = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
    await axios.post(requestUrl, { text }, {
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': this.apiKey,
      },
      'responseType': "arraybuffer"
    }).then((response) => {
      fs.writeFileSync(TMP_AUDIO_FILE, response.data);
      this.onAudioFileSynthesized(TMP_AUDIO_FILE);
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
  }
}