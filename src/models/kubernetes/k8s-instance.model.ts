import {Model, model, property} from '@loopback/repository';
import {K8sDeployment} from './k8s-deployment.model';
import {K8sService} from './k8s-service.model';

@model()
export class K8sInstance extends Model {
  @property({
    type: 'object',
    required: true,
  })
  deployment: K8sDeployment;

  @property({
    type: 'object',
    required: true,
  })
  service: K8sService;


  constructor(data?: Partial<K8sInstance>) {
    super(data);
  }
}

export interface K8SInstanceRelations {
  // describe navigational properties herer
}

export type K8SInstanceWithRelations = K8sInstance & K8SInstanceRelations;
