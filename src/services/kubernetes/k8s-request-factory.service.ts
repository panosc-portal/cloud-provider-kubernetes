import { K8sDeploymentRequest, K8sNamespaceRequest, K8sServiceRequest, K8sDeploymentRequestConfig } from '../../models';

export class K8sRequestFactoryService {
  constructor() {
  }

  createK8sServiceRequest(name: string): K8sServiceRequest {
    return new K8sServiceRequest(name);
  }

  createK8sDeploymentRequest(config: K8sDeploymentRequestConfig): K8sDeploymentRequest {
    return new K8sDeploymentRequest(config);
  }

  createK8sNamespaceRequest(name: string): K8sNamespaceRequest {
    return new K8sNamespaceRequest(name);
  }
}
