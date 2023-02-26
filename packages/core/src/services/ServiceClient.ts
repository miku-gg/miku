import axios from 'axios';
import base64 from 'base-64';
import { Wallet } from '@ethersproject/wallet';

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

  constructor(serviceEndpoint: string, signer: ServiceQuerySigner) {
    this.serviceEndpoint = serviceEndpoint;
    this.signer = signer;
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
      const _query = {
        input: this.inputPropsToBase64(input),
        address: this.signer.getAddress(),
        tokenLimit,
        timestamp: Date.now(),
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
    return base64.encode(JSON.stringify(input));
  }
}