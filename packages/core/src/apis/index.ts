import axios, { AxiosResponse } from 'axios';

export interface GradioAPIParams {
  name: string
  url: string
  authKey?: string
}

export class GradioAPI<InputType, OutputType> {
  public name: string;
  public url: string;
  private authKey: string

  constructor({ url, name, authKey }: GradioAPIParams) {
    this.name = name;
    this.url = url;
    this.authKey = authKey || '';
  }

  protected async predict(input: InputType): Promise<AxiosResponse<OutputType>> {
    return axios<OutputType>({
      url: this.url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authKey}`
      },
      data: input
    })
  }
}