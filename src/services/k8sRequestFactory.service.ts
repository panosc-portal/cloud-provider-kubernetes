import {K8sDeploymentRequest, K8sServiceRequest} from '../models';

export class K8sRequestFactoryService {
  constructor() {
  }

  createK8sServiceRequest(serviceName: string): K8sServiceRequest {
    return new K8sServiceRequest({name: serviceName});
  }

  createK8sDeploymentRequest(deploymentName: string, deployementImage: string): K8sDeploymentRequest {
    return new K8sDeploymentRequest({name: deploymentName, image: deployementImage});
  }

}

