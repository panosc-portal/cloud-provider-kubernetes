import {bind, /* inject, */ BindingScope, inject} from '@loopback/core';
import {K8sDeployment, K8sDeploymentRequest} from '../models';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
class K8sDeploymentManagerService {
  constructor(@inject('datasources.kubernetes')
              protected dataSource: KubernetesDataSource = new KubernetesDataSource()) {
  }

   async createK8sDeployment(deploymentRequest: K8sDeploymentRequest): Promise<K8sDeployment> {
      const deployment = await this.dataSource.K8sClient.apis.apps.v1.namespaces('visa').deployments.post({body: deploymentRequest.modal});
      return new K8sDeployment({k8sResponse:deployment.body});
  }
}

export const K8sDeploymentManager= new K8sDeploymentManagerService;
