import {bind, BindingScope, inject} from '@loopback/core';
import {K8sServiceManager} from './k8sService.manager';
import {Flavour, Image, K8sInstance} from '../models';
import {K8sRequestFactoryService} from './k8sRequestFactory.service';
import {K8sDeploymentManager} from './k8sDeployment.manager';
import {InstanceCreatorDto} from '../controllers/dto/instanceCreatorDto';

@bind({scope: BindingScope.SINGLETON})
export class K8sInstanceService {

  private k8sRequestFactoryService = new K8sRequestFactoryService();

  constructor(@inject('services.K8sDeploymentManagerService') private kubernetesDeploymentManager: K8sDeploymentManager,
              @inject('services.K8sServiceManagerService') private kubernetesServiceManager: K8sServiceManager){
  }


  async createK8sInstance(instanceCreator:InstanceCreatorDto,image:Image,flavour:Flavour): Promise<K8sInstance> {
    const deploymentRequest = this.k8sRequestFactoryService.createK8sDeploymentRequest(instanceCreator.name,image.name);
    const deployment = await this.kubernetesDeploymentManager.createK8sDeployment(deploymentRequest);
    const serviceRequest = this.k8sRequestFactoryService.createK8sServiceRequest(instanceCreator.name);
    const service = await this.kubernetesServiceManager.createService(serviceRequest);
    return new K8sInstance({deployment: deployment, service: service});
  }

}
