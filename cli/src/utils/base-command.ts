import {Command, flags} from '@oclif/command'
import Axios, { AxiosInstance } from 'axios';
import { Flavour } from '../models/flavour.model';
import { Image } from '../models/image.model';
import { Instance } from '../models/instance.model';
import { InstanceCreatorDto } from '../models/dto/instance-creator-dto.model';
import { InstanceActionDto, FlavourCreatorDto, Protocol, ImageCreatorDto } from '../models';

export abstract class BaseCommand extends Command {

  static baseFlags = {
    help: flags.help({char: 'h'}),
    url: flags.string({char: 'u', description: 'URL of the cloud provider', default: 'http://localhost:3000'}),
  }

  private _apiClient: AxiosInstance;
  private _cloudProviderUrl: string;

  protected set cloudProviderUrl(value: string) {
    this._cloudProviderUrl = value;
  }

  protected get apiClient(): AxiosInstance {
    if (this._apiClient == null) {
      this._apiClient = Axios.create({
        baseURL: `${this._cloudProviderUrl}/api/v1`,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return this._apiClient;
  }

  async getInstances(): Promise<Instance[]> {
    const response = await this.apiClient.get('instances');
    return response.data;
  }

  async createInstance(instance: InstanceCreatorDto): Promise<Instance> {
    const response = await this.apiClient.post('instances', instance);
    return response.data;
  }

  async deleteInstance(instanceId: number): Promise<Instance> {
    const response = await this.apiClient.delete(`instances/${instanceId}`);
    return response.data;
  }

  async startInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'START'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async stopInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'SHUTDOWN'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async rebootInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'REBOOT'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async getImages(): Promise<Image[]> {
    const response = await this.apiClient.get('images');
    return response.data;
  }

  async getProtocols(): Promise<Protocol[]> {
    const response = await this.apiClient.get('images/protocols');
    return response.data;
  }

  async createImage(image: ImageCreatorDto): Promise<Image> {
    const response = await this.apiClient.post('images', image);
    return response.data;
  }

  async deleteImage(imageId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`images/${imageId}`);
    return response.data;
  }

  async getFlavours(): Promise<Flavour[]> {
    const response = await this.apiClient.get('flavours');
    return response.data;
  }

  async createFlavour(flavour: FlavourCreatorDto): Promise<Flavour> {
    const response = await this.apiClient.post('flavours', flavour);
    return response.data;
  }

  async deleteFlavour(flavourId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`flavours/${flavourId}`);
    return response.data;
  }

  async getNodes(): Promise<Node[]> {
    const response = await this.apiClient.get('nodes');
    return response.data;
  }

}
