import axios from "axios";

export interface ServiceRequestBody<ServiceInputProps> {
  input: ServiceInputProps;
}

export class ServiceClient<ServiceInputProps, ServiceOutputProps> {
  private serviceEndpoint: string;
  private serviceName: string;

  constructor(
    serviceEndpoint: string,
    serviceName: string
  ) {
    this.serviceEndpoint = serviceEndpoint;
    this.serviceName = serviceName;
  }

  public async query(
    input: ServiceInputProps
  ): Promise<ServiceOutputProps> {
    try {
      console.log(
        `%c[SERVICE REQUEST]%c ${this.serviceName}`,
        "background: #333; color: cyan",
        "color: lime",
        input,
      );

      const result = await axios.post<
        ServiceOutputProps,
        axios.AxiosResponse<ServiceOutputProps, any>,
        { input: ServiceInputProps }
      >(
        `${this.serviceEndpoint}/query`,
        { input },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        `%c[SERVICE RESPONSE]%c ${this.serviceName}`,
        "background: #333; color: #bada55",
        "color: lime",
        result
      );
      return result.data;
    } catch (error) {
      console.log(
        `%c[SERVICE ERROR]%c ${this.serviceName}`,
        "background: #333; color: crimson",
        "color: lime",
        error
      );
      throw "Error querying service";
    }
  }
}
