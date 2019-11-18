import { Entity, model, property} from '@loopback/repository';

@model({settings: {postgresql: {schema: 'cloud-provider-kubernetes',table:'instance_service'}}})
export class InstanceService extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: false,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  port: number;

  @property({
    type: 'number',
  })
  instance_id?: number;

  constructor(data?: Partial<InstanceService>) {
    super(data);
  }
}
export interface InstanceServiceRelations {
  // describe navigational properties here
}

export type InstanceServiceWithRelations = InstanceService & InstanceServiceRelations;
