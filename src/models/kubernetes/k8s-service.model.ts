import {Model, model, property} from '@loopback/repository';

@model()
export class K8sService extends Model {
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
    type: 'object',
    required: true,
  })
  port: object;

  isValid() {
    if (this.k8sResponse !== undefined) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.k8sResponse.hasOwnProperty('kind')) {
        return this.k8sResponse.kind === 'Service';
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  constructor(data?: Partial<K8sService>) {
    super(data);
  }
}

export interface K8SServiceRelations {
  // describe navigational properties here
}

export type K8SServiceWithRelations = K8sService & K8SServiceRelations;
