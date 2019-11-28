import { K8sDeploymentRequest, K8sNamespaceRequest, K8sServiceRequest } from '../models';

export class K8sRequestFactoryService {
  constructor() {}

  createK8sServiceRequest(name: string): K8sServiceRequest {
    return new K8sServiceRequest(name);
  }

  createK8sDeploymentRequest(name: string, image: string): K8sDeploymentRequest {
    return new K8sDeploymentRequest(name, image);
  }

  createK8sNamespaceRequest(name: string): K8sNamespaceRequest {
    return new K8sNamespaceRequest(name);
  }
}
