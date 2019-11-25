import {bind, BindingScope, inject} from '@loopback/core';
import {K8sServiceManager} from './k8sService.manager';
import {Flavour, Image, K8sInstance} from '../models';
import {K8sRequestFactoryService} from './k8sRequestFactory.service';
import {K8sDeploymentManager} from './k8sDeployment.manager';
import {InstanceCreatorDto} from '../controllers/dto/instanceCreatorDto';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
export class K8sInstanceService {

  private _requestFactoryService = new K8sRequestFactoryService();
  private _deploymentManager: K8sDeploymentManager;
  private _serviceManager: K8sServiceManager;


  get deploymentManager(): K8sDeploymentManager {
    return this._deploymentManager;
  }

  get serviceManager(): K8sServiceManager {
    return this._serviceManager;
  }

  constructor(@inject('datasources.kubernetes') dataSource: KubernetesDataSource){
    this._deploymentManager = new K8sDeploymentManager(dataSource);
    this._serviceManager = new K8sServiceManager(dataSource);
  }

  async createK8sInstance(instanceCreator:InstanceCreatorDto,image:Image,flavour:Flavour): Promise<K8sInstance> {
    const deploymentRequest = this._requestFactoryService.createK8sDeploymentRequest(instanceCreator.name,image.name);
    const deployment = await this._deploymentManager.createDeploymentIfNotExist(deploymentRequest);
    const serviceRequest = this._requestFactoryService.createK8sServiceRequest(instanceCreator.name);
    const service = await this._serviceManager.createServiceIfNotExist(serviceRequest);
    return new K8sInstance({deployment: deployment, service: service});
  }

}
