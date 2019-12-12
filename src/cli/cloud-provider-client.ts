import axios, {AxiosInstance} from "axios";
import { Instance, Image, Flavour } from "../models";
import { InstanceCreatorDto } from "../controllers/dto/instance-creator-dto";

export class CloudProviderClient {

  private _apiClient: AxiosInstance;

  constructor(private _providerUrl: string) {
    this._apiClient = axios.create({
      baseURL: `${this._providerUrl}/api/v1`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getInstances(): Promise<Instance[]> {
    const response = await this._apiClient.get('instances');
    return response.data;
  }

  async createInstance(instance: InstanceCreatorDto): Promise<Instance> {
    const response = await this._apiClient.post('instances', instance);
    return response.data;
  }

  async getImages(): Promise<Image[]> {
    const response = await this._apiClient.get('images');
    return response.data;
  }

  async getFlavours(): Promise<Flavour[]> {
    const response = await this._apiClient.get('flavours');
    return response.data;
  }

}