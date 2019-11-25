import {bind, BindingScope, inject} from '@loopback/core';
import {K8sDeployment, K8sDeploymentRequest} from '../models';
import {KubernetesDataSource} from '../datasources';

@bind({scope: BindingScope.SINGLETON})
export class K8sDeploymentManager {
  constructor(@inject('datasources.kubernetes') private dataSource: KubernetesDataSource) {
  }

  async getDeploymentsWithName(name: string) {
    try {
      const deployment = await this.dataSource.K8sClient.apis.apps.v1.namespace(this.dataSource.defaultNamespace)
        .deployments(name)
        .get();
      const k8sDeployment = new K8sDeployment({k8sResponse: deployment.body});
      if (k8sDeployment.isValid()) {
        return k8sDeployment;
      } else {
        return null;
      }
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
      const newDeployment = new K8sDeployment({k8sResponse: deployment.body});
      if (newDeployment.isValid()) {
        return newDeployment;
      } else {
        throw new Error('Did not manage to create a kubernetes deployment');
      }
    } else {

      return existingDeployment;
    }
  }

}
