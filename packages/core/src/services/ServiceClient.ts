import axios from 'axios';
import { Wallet } from '@ethersproject/wallet';
import { encode } from './utils';

export interface ServiceRequestQuery {
  input: string;
  timestamp: number;
  tokenLimit: number;
  address: string;
}

export interface ServiceRequestBody {
  query: ServiceRequestQuery
  signature: string;
}

export class ServiceQuerySigner {
  private wallet: Wallet;

  constructor(privateKey: string) {
    this.wallet = new Wallet(privateKey);
  }

  public async signQuery(query: ServiceRequestQuery): Promise<string> {
    const _query = JSON.stringify(query);
    return await this.wallet.signMessage(_query);
  };

  public getAddress(): string {
    return this.wallet.address;
  }
}

export class ServiceClient<ServiceInputProps, ServiceOutputProps> {
  private serviceEndpoint: string;
  private signer: ServiceQuerySigner;
  private serviceName: string;

  constructor(serviceEndpoint: string, signer: ServiceQuerySigner, serviceName: string) {
    this.serviceEndpoint = serviceEndpoint;
    this.signer = signer;
    this.serviceName = serviceName;
  }

  public async getQueryCost(input: ServiceInputProps): Promise<number> {
    try {
      const result = await axios.post<{price: number}>(`${this.serviceEndpoint}/price`, {
        query: {
          input: this.inputPropsToBase64(input)
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return result.data.price
    } catch (error) {
      console.error(error);
      throw 'Error getting cost';
    }
  }

  public async query(input: ServiceInputProps, tokenLimit: number): Promise<ServiceOutputProps> {
    try {
      const metadata = {
        address: this.signer.getAddress(),
        tokenLimit,
        timestamp: Date.now(),
      };
      console.log(`%c[SERVICE REQUEST]%c ${this.serviceName}`, 'background: #333; color: #bada55', 'color: lime', input, metadata);
      const _query = {
        input: this.inputPropsToBase64(input),
        ...metadata,
      };
      const result = await axios.post<ServiceOutputProps,  axios.AxiosResponse<ServiceOutputProps, any>, ServiceRequestBody>(`${this.serviceEndpoint}/query`, {
        query: _query,
        signature: await this.signer.signQuery(_query),
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return result.data;
    } catch (error) {
      console.error(error);
      throw 'Error querying service';
    }
  }

  private inputPropsToBase64(input: ServiceInputProps): string {
    return encode(JSON.stringify(input));
  }
}