export const moods = ['happy', 'sad', 'neutral', 'angry', 'confused', 'surprised', 'disgusted', 'fearful', 'unchanged'] as const;
export type Mood = typeof moods[number];

export interface OutputEnvironment {
  text: string
}

export interface DialogOutputEnvironment extends OutputEnvironment {
  mood: Mood;
}

export interface ActionOutputEnvironment extends OutputEnvironment {
  mood: Mood;
}

export interface ContextOutputEnvironment extends OutputEnvironment {
  description: string;
  keywords: string;
}

export interface OptionsOutputEnvironment extends OutputEnvironment {
  options: string[];
}

export abstract class OutputListener<T extends OutputEnvironment>  {
  public abstract handleOutput(output: T): void;
}
