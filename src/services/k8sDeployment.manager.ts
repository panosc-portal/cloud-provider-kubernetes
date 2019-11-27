import {K8sDeployment, K8sDeploymentRequest} from '../models';
import {KubernetesDataSource} from '../datasources';
import { logger } from '../utils';

export class K8sDeploymentManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getDeploymentsWithName(name: string, namespace: string) {
    try {
      const deployment = await this._dataSource.K8sClient.apis.apps.v1.namespace(namespace)
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

  async createDeployment(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    const deployment = await this._dataSource.K8sClient.apis.apps.v1.namespaces(namespace).deployments.post({body: deploymentRequest.model});
    const newDeployment = new K8sDeployment(deployment.body);
    if (newDeployment.isValid()) {
      logger.debug('Deployment ' + newDeployment.name + ' has been created');
      return newDeployment;
    } else {
      throw new Error('Did not manage to create a kubernetes deployment');
    }
  }

  async createDeploymentIfNotExist(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    const deploymentName = deploymentRequest.name;
    const existingDeployment = await this.getDeploymentsWithName(deploymentName, namespace);
    if (existingDeployment == null) {
      return this.createDeployment(deploymentRequest, namespace);
    } else {
      return existingDeployment;
    }
  }

}

