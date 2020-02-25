import { model, property } from '@loopback/repository';

@model()
export class Metrics {
  @property({
    type: 'object'
  })
  instances?: { count: number; active: number; inactive: number };

  @property({
    type: 'object'
  })
  system?: { cpu: {total: number, available: number}; memory: {total: number, available: number} };

  @property({
    type: 'object'
  })
  images?: { count: number; usage: {imageId: number, imageName: string, instanceCount: number}[] };

  @property({
    type: 'object'
  })
  flavours?: { count: number; usage: {flavourId: number, flavourName: string, instanceCount: number}[] };

  constructor(data?: Partial<Metrics>) {
    Object.assign(this, data);
  }
}
