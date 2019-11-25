import {bind, BindingScope, inject} from '@loopback/core';
import {K8sServiceManagerService} from './k8s-service-manager.service';
import {K8sInstance} from '../models';
import {K8sRequestFactoryService} from './k8s-request-factory.service';
import {K8sDeploymentManagerService} from './k8s-deployment-manager.service';

@bind({scope: BindingScope.SINGLETON})
export class K8sInstanceService {

  private k8sRequestFactoryService = new K8sRequestFactoryService();

  constructor(@inject('services.K8sDeploymentManagerService') private k8sDeploymentManager: K8sDeploymentManagerService,
              @inject('services.K8sServiceManagerService') private k8sServiceManager: K8sServiceManagerService) {
  }

  async createK8sInstance(): Promise<K8sInstance> {
    const deploymentRequest = this.k8sRequestFactoryService.createK8sDeploymentRequest();
    const deployment = await this.k8sDeploymentManager.createK8sDeployment(deploymentRequest);
    const serviceRequest = this.k8sRequestFactoryService.createK8sServiceRequest();
    const service = await this.k8sServiceManager.createService(serviceRequest);
    return new K8sInstance({deployment: deployment, service: service});
  }

}
