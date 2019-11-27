import {model, property} from '@loopback/repository';

@model()
export class ResourceMonitor {
  @property({
    type: 'number',
    required: true,
  })
  total: number;

  @property({
    type: 'number',
    required: true,
  })
  available: number;

  @property({
    type: 'number',
    required: true,
  })
  used: number;

  constructor(data?: Partial<ResourceMonitor>) {
    Object.assign(this, data);
  }
}
