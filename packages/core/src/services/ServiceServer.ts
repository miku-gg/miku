import PropTypes, { InferProps } from "prop-types";
import { verifyMessage } from "@ethersproject/wallet";
import { ServiceRequestBody } from "./ServiceClient";
import { decode } from "./utils";

export interface ServiceConfig {
  serviceId: string;
  billingEndpoint: string;
  addRoute: (
    path: string,
    cb: (body: ServiceRequestBody) => Promise<{ status: number; response: any }>
  ) => void;
}

function asRequired(
  propTypes: PropTypes.ValidationMap<any>
): PropTypes.ValidationMap<any> {
  const propTypesRequired: PropTypes.ValidationMap<any> = {};
  Object.keys(propTypes).forEach((key) => {
    const propType = propTypes[key] as PropTypes.Requireable<any>;
    if (propType) {
      propTypesRequired[key] = propType.isRequired;
    }
  });
  return propTypesRequired;
}

export abstract class Service<Output = string> {
  protected serviceId: string;
  protected propTypes: PropTypes.ValidationMap<any>;
  protected propTypesRequired: PropTypes.ValidationMap<any>;
  protected abstract defaultProps: InferProps<typeof this.propTypes>;

  constructor(config: ServiceConfig) {
    this.propTypes = this.getPropTypes();
    this.propTypesRequired = asRequired(this.propTypes);
    this.serviceId = config.serviceId;
    config.addRoute(
      `/${this.serviceId}/price`,
      async (body: ServiceRequestBody) => {
        try {
          const price = await this.calculatePrice(
            this.inputBase64ToProps(body.query.input)
          );
          return {
            status: 200,
            response: { price },
          };
        } catch (error) {
          return {
            status: 400,
            response: "Error: " + error,
          };
        }
      }
    );
    config.addRoute(
      `/${this.serviceId}/query`,
      async (body: ServiceRequestBody) => {
        try {
          const result = await this.handler(body);
          return {
            status: 200,
            response: result,
          };
        } catch (error) {
          console.error(error);
          return {
            status: 400,
            response: "Error: " + error,
          };
        }
      }
    );
  }

  protected abstract getPropTypes(): PropTypes.ValidationMap<any>;

  private isSignarureValid(requestBody: ServiceRequestBody): boolean {
    return (
      verifyMessage(
        JSON.stringify(requestBody.query),
        requestBody.signature
      ) === requestBody.query.address
    );
  }

  public async handler(requestBody: ServiceRequestBody): Promise<Output> {
    const input = this.inputBase64ToProps(requestBody.query.input);
    if (!this.isSignarureValid(requestBody)) {
      throw "Invalid signature";
    }
    PropTypes.checkPropTypes(this.propTypes, input, "props", this.serviceId);
    // const price = await this.calculatePrice(input);
    
    // if (price > (requestBody.query.tokenLimit || 0)) {
    //   throw "Not enough tokens";
    // }

    return this.computeInput(input);
  }

  protected inputBase64ToProps(
    input: string
  ): InferProps<typeof this.propTypes> {
    const inputProps = JSON.parse(decode(input)) as InferProps<
      typeof this.propTypes
    >;

    return {
      ...this.defaultProps,
      ...inputProps,
    };
  }

  protected abstract computeInput(
    input: InferProps<typeof this.propTypes>
  ): Promise<Output>;
  protected abstract calculatePrice(
    input: InferProps<typeof this.propTypes>
  ): Promise<number>;
}
