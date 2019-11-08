import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {K8sServiceManager} from './k8s-service-manager.service';
import { K8sService} from '../models';
import {K8sDeploymentManager} from './k8s-deployment-manager.service';
import {K8sRequestFactory} from './k8s-request-factory.service';

@bind({scope: BindingScope.SINGLETON})
class K8sInstanceService {

  constructor(/* Add @inject to inject parameters */) {
  }

   async createK8sInstance(): Promise<K8sService> {
    //const deploymentRequest=K8sRequestFactory.createK8sDeploymentRequest();
    //await K8sDeploymentManager.createK8sDeployment(deploymentRequest);
    const serviceRequest = K8sRequestFactory.createK8sServiceRequest();
    const service  =await K8sServiceManager.createService(serviceRequest);
    return service;
  }

}

export const K8sInstanceServiceTest= new K8sInstanceService