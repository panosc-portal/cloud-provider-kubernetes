import { Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {InstanceService} from './instance-service.model';
import {Flavour} from './flavour.model';
import {Image} from './image.model';
import {InstanceState} from './instance-state.model';

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

  @hasMany(() => InstanceService, {keyTo: 'instance_id'})
  instanceServices: InstanceService[];

  @belongsTo(() => Flavour)
  flavour_id: number;

  constructor(data?: Partial<Instance>) {
    super(data);
  }
}

export interface InstanceRelations {
}

export type InstanceWithRelations = Instance & InstanceRelations;
