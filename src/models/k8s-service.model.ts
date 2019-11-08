import {Model, model, property} from '@loopback/repository';

@model()
export class K8sService extends Model {
  @property({
    type: 'object',
    required: true,
  })
  k8sResponse: object;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'object',
    required: true,
  })
  port: object;


  constructor(data?: Partial<K8sService>) {
    super(data);
  }
}

export interface K8SServiceRelations {
  // describe navigational properties here
}

export type K8SServiceWithRelations = K8sService & K8SServiceRelations;
