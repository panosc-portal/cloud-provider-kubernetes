import { Entity, model, property} from '@loopback/repository';
import {InstanceService} from './instance-service.model';
import {Flavour} from './flavour.model';
import {Image} from './image.model';

@model({settings: {postgresql: {schema: 'cloud-provider-kubernetes'}}})
export class Instance extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property()
  image_id: Image;

  @property()
  flavour_id: Flavour;

  @property({
    type: 'string',
    required: true,
  })
  hostname: string;

  @property({
    type: 'string',
    required: true,
  })
  state: string;

  @property({
    type: 'number',
    required: true,
  })
  currentCPU: number;

  @property({
    type: 'number',
    required: true,
  })
  currentMemory: number;

  @property({
    type: 'date',
    required: true,
  })
  createdAt: string;






  constructor(data?: Partial<Instance>) {
    super(data);
  }
}

export interface InstanceRelations {
}

export type InstanceWithRelations = Instance & InstanceRelations;
