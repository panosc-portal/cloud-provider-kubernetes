import { Model, model, property} from '@loopback/repository';

@model()
export class K8sDeployment extends Model {
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
    type: 'string',
  })
  image?: string;


  constructor(data?: Partial<K8sDeployment>) {
    super(data);
  }
}

export interface K8SDeploymentRelations {
  // describe navigational properties here
}

export type K8SDeploymentWithRelations = K8sDeployment & K8SDeploymentRelations;
