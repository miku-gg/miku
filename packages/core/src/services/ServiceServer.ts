import { ServiceRequestBody } from "./ServiceClient";

export interface ServiceConfig<ServiceInputProps, ServiceOutputProps> {
  serviceId: string;
  addRoute: (
    path: string,
    cb: (body: ServiceRequestBody<ServiceInputProps>) => Promise<{ status: number; response: ServiceOutputProps }>
  ) => void;
}

export abstract class Service<ServiceInputProps, ServiceOutputProps> {
  protected serviceId: string;

  constructor(config: ServiceConfig<ServiceInputProps, ServiceOutputProps>) {
    this.serviceId = config.serviceId;
    config.addRoute(
      `/${this.serviceId}/query`,
      async (body: ServiceRequestBody<ServiceInputProps>) => {
        try {
          const output = await this.handler(body);
          return {
            status: 200,
            response: output,
          };
        } catch (error) {
          console.error(error);
          return {
            status: 400,
            message: error,
            response: this.getDefaultOutput()
          };
        }
      }
    );
  }

  public async handler(requestBody: ServiceRequestBody<ServiceInputProps>): Promise<ServiceOutputProps> {
    const input = requestBody.input;
    this.validateInput(input);

    return this.computeInput({
      ...this.getDefaultInput(),
      ...requestBody.input
    });
  }

  protected abstract validateInput(input: ServiceInputProps): void;
  protected abstract getDefaultInput(): ServiceInputProps;
  protected abstract getDefaultOutput(): ServiceOutputProps;
  protected abstract computeInput(
    input: ServiceInputProps
  ): Promise<ServiceOutputProps>;
}
