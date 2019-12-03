import { K8sDeploymentRequest, K8sNamespaceRequest, K8sServiceRequest } from '../models';

export class K8sRequestFactoryService {
  constructor() {}

  createK8sServiceRequest(name: string): K8sServiceRequest {
    return new K8sServiceRequest(name);
  }

  createK8sDeploymentRequest(
    name: string,
    image: string,
    cpuLimit: number,
    cpuRequest: number,
    memoryLimit: number,
    memoryRequest: number
  ): K8sDeploymentRequest {
    return new K8sDeploymentRequest(name, image, cpuLimit, cpuRequest, memoryLimit, memoryRequest);
  }

  createK8sNamespaceRequest(name: string): K8sNamespaceRequest {
    return new K8sNamespaceRequest(name);
  }
}
