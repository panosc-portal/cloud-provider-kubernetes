import {Entity, model, property} from '@loopback/repository';

@model()
export class InstanceService extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  port: number;


  constructor(data?: Partial<InstanceService>) {
    super(data);
  }
}

export interface InstanceServiceRelations {
  // describe navigational properties here
}

export type InstanceServiceWithRelations = InstanceService & InstanceServiceRelations;
