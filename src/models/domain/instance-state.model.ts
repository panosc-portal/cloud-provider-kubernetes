import {Entity, model, property} from '@loopback/repository';

@model()
export class InstanceState extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  state: ["BUILDING",
    "STARTING",
    "ACTIVE",
    "STOPPED",
    "REBOOTING",
    'ERROR'];

  @property({
    type: 'number',
    required: true,
  })
  cpu: number;

  @property({
    type: 'number',
    required: true,
  })
  memory: number;



  constructor(data?: Partial<InstanceState>) {
    super(data);
  }
}

export interface InstanceStateRelations {
  // describe navigational properties here
}

export type InstanceStateWithRelations = InstanceState & InstanceStateRelations;
