import * as Core from '@mikugg/core';

interface SpeechToTextInput {
  data: {
    name: string;
    data: string;  
  }[]
}

interface SpeechToTextResult {
  data: string[]
  duration: number
}

export class WhisperGardioAPI extends Core.APIs.GradioAPI<SpeechToTextInput, SpeechToTextResult> {
  constructor(url: string, authKey: string) {
    super({
      name: 'whisper',
      url,
      authKey,
    });
  }
  async translate(data: string): Promise<string> {
    const prediction = await this.predict({
      data: [
        {
          name: 'audio.mp3',
          data,
        }
      ]
    });

    return prediction.data.data[0] || '';
  }
}

/*
 * WhisperGradioCommandGenerator is a command generator that generates commands from a base64 encoded audio file.
 */
export class WhisperGradioCommandGenerator extends Core.CommandGenerators.APICommandGenerator<{
  base64Input: string,
  commandType: Core.Commands.CommandType
}> {
  private api: WhisperGardioAPI;

  constructor(props: Core.CommandGenerators.APICommandGeneratorProps) {
    super(props);
    this.api = new WhisperGardioAPI(
      props.apiEndpoint,
      props.apiKey,
    )
  }
  /**
   * 
   * @param base64Input - A base64 encoded audio file.
   */
  public async generate(input: {
    base64Input: string,
    subject: string,
    commandType: Core.Commands.CommandType  
  }): Promise<Core.Commands._CommandRaw> {
    const response = await this.api.translate(input.base64Input);
    return {
      type: input.commandType,
      input: {
        text: response,
        subject: input.subject
      }
    }
  }
}
