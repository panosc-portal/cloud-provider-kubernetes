import {bind, BindingScope} from '@loopback/core';
import {K8sDeploymentRequest, K8sServiceRequest} from '../models';

@bind({scope: BindingScope.SINGLETON})
 export class K8sRequestFactoryService {
  constructor(/* Add @inject to inject parameters */) {
  }

  createK8sServiceRequest(): K8sServiceRequest {
    return new K8sServiceRequest({name:"panosctest1"});
  }

    createK8sDeploymentRequest(): K8sDeploymentRequest {
    return new K8sDeploymentRequest({name:"panosctest1",image:"danielguerra/ubuntu-xrdp"});
  }

}

