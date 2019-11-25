import {Model, model, property} from '@loopback/repository';


@model()
export class K8sDeployment extends Model {
  @property({
    type: 'object',
    required: true,
  })
  k8sResponse: any;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  image?: string;

  isValid() {
    if (this.k8sResponse !== undefined) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.k8sResponse.hasOwnProperty('kind')) {
        return this.k8sResponse.kind === 'Deployment';
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  constructor(data ?: Partial<K8sDeployment>) {
    super(data);
  }
}

export interface K8SDeploymentRelations {
  // describe navigational properties here
}

export type K8SDeploymentWithRelations = K8sDeployment & K8SDeploymentRelations;
