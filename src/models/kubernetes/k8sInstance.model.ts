import {K8sDeployment} from './k8sDeployment.model';
import {K8sService} from './k8sService.model';

export class K8sInstance  {

  deployment: K8sDeployment;

  service: K8sService;


  constructor(deployment:K8sDeployment,service:K8sService) {
    this.deployment = deployment;
    this.service = service
  }
}

