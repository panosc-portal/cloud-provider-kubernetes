import {bind, BindingScope, inject} from '@loopback/core';
import {K8sServiceManagerService} from './k8s-service-manager.service';
import {K8sInstance} from '../models';
import {K8sRequestFactoryService} from './k8s-request-factory.service';
import {K8sDeploymentManagerService} from './k8s-deployment-manager.service';

@bind({scope: BindingScope.SINGLETON})
class K8sInstanceService {

  constructor(@inject('services.K8sDeploymentManagerService')
              protected  kubernetesDeploymentManager: K8sDeploymentManagerService = new K8sDeploymentManagerService(),
              @inject('services.K8sServiceManagerService')
              protected  kubernetesServiceManager: K8sServiceManagerService = new K8sServiceManagerService(),
              @inject('services.K8sRequestFactoryService')
              protected  kubernetesFactoryService: K8sRequestFactoryService = new K8sRequestFactoryService(),
  ) {
  }

  async createK8sInstance(): Promise<K8sInstance> {
    const deploymentRequest = this.kubernetesFactoryService.createK8sDeploymentRequest();
    const deployment = await this.kubernetesDeploymentManager.createK8sDeployment(deploymentRequest);
    const serviceRequest = this.kubernetesFactoryService.createK8sServiceRequest();
    const service = await this.kubernetesServiceManager.createService(serviceRequest);
    return new K8sInstance({deployment: deployment, service: service});
  }

}

export const K8sInstanceServiceTest = new K8sInstanceService;