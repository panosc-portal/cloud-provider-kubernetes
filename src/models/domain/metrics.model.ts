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
  system?: { cpu: number; memory: number };

  @property({
    type: 'object'
  })
  images?: { count: number; usage: number };

  @property({
    type: 'object'
  })
  flavours?: { count: number; usage: number };

  constructor(data?: Partial<Metrics>) {
    Object.assign(this, data);
  }
}
