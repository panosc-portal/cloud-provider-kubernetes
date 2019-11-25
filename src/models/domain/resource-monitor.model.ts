import {Entity, model, property} from '@loopback/repository';

@model()
export class ResourceMonitor extends Entity {
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
    super(data);
  }
}

export interface ResourceMonitorRelations {
  // describe navigational properties here
}

export type ResourceMonitorWithRelations = ResourceMonitor & ResourceMonitorRelations;
