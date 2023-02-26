
export interface OutputEnvironment {
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
  private subscriptions: Set<(result: W) => void> = new Set();
  private errorSubscription: (error: Error, el: OutputListener<T, W>) => void = () => {};

  public subscribeError(fn: (error: Error, el?: OutputListener<T, W>) => void): () => void {
    this.errorSubscription = fn;
    return () => this.errorSubscription = () => {};
  }

  protected abstract handleOutput(output: T): Promise<W>;

  public sendOutput(output: T): void {
    this.handleOutput(output)
      .then((result: W) => this.subscriptions.forEach(fn => fn(result)))
      .catch((error: Error) => this.errorSubscription(error, this));
  }

  public subscribe(fn: (output: W) => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  public async getCost(): Promise<number> {
    return 0;
  }
}

export class SimpleListener<T extends OutputEnvironment> extends OutputListener<T, T>  {
  constructor() {
    super();
  }

  protected async handleOutput(output: T): Promise<T> {
    return output;
  }
}