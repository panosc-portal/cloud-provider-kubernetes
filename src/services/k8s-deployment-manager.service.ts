import {bind, BindingScope, inject} from '@loopback/core';
import {K8sDeployment, K8sDeploymentRequest} from '../models';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
export class K8sDeploymentManagerService {
  constructor(@inject('datasources.kubernetes')
              protected dataSource: KubernetesDataSource = new KubernetesDataSource()) {
  }

  async getDeploymentsWithName(name: string) {
    try {
      const deployment = await this.dataSource.K8sClient.apis.apps.v1.namespace(this.dataSource.defaultNamespace)
        .deployments(name)
        .get();
      return new K8sDeployment({k8sResponse: deployment.body});
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        throw error;
      }
    }
  }

  async createK8sDeployment(deploymentRequest: K8sDeploymentRequest): Promise<K8sDeployment> {
    const deploymentName = deploymentRequest.name;
    const existingDeployment = await this.getDeploymentsWithName(deploymentName);
    if (existingDeployment == null) {
      const deployment = await this.dataSource.K8sClient.apis.apps.v1.namespaces(this.dataSource.defaultNamespace).deployments.post({body: deploymentRequest.modal});
      return new K8sDeployment({k8sResponse: deployment.body});
    } else {
      return existingDeployment;
    }
  }

}

