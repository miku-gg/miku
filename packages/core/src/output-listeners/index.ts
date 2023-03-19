import { ShortTermMemory } from "../memory/ShortTermMemory";

export interface OutputEnvironment {
  commandId: string
  text: string
}

export interface DialogOutputEnvironment extends OutputEnvironment {
}

export interface ActionOutputEnvironment extends OutputEnvironment {
}

export interface ContextOutputEnvironment extends OutputEnvironment {
  description: string;
  keywords: string;
}

export interface OptionsOutputEnvironment extends OutputEnvironment {
  options: string[];
}

export abstract class OutputListener<T extends OutputEnvironment, W = void>  {
  private subscriptions: Set<(result: W, output: T) => void> = new Set();
  private errorSubscription: (error: Error, el: OutputListener<T, W>) => void = () => {};

  public subscribeError(fn: (error: Error, el?: OutputListener<T, W>) => void): () => void {
    this.errorSubscription = fn;
    return () => this.errorSubscription = () => {};
  }

  protected abstract handleOutput(output: T, memory?: ShortTermMemory): Promise<W>;

  public sendOutput(output: T, memory: ShortTermMemory): void {
    this.handleOutput(output, memory)
      .then((result: W) => this.subscriptions.forEach(fn => fn(result, output)))
      .catch((error: Error) => {
        this.errorSubscription(error, this);
        this.subscriptions.forEach(fn => fn(this.getResultOnError(output), output));
      })
  }

  public subscribe(fn: (result: W, output: T) => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  public async getCost(): Promise<number> {
    return 0;
  }

  protected abstract getResultOnError(output: T): W;
}

export class SimpleListener<T extends OutputEnvironment> extends OutputListener<T, T>  {
  constructor() {
    super();
  }

  protected async handleOutput(output: T, memory?: ShortTermMemory): Promise<T> {
    return output;
  }

  protected getResultOnError(output: T) {
    return output;
  }
}