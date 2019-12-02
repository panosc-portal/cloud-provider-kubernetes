import { K8sDeployment, K8sDeploymentRequest } from '../models';
import { KubernetesDataSource } from '../datasources';
import { logger } from '../utils';

export class K8sDeploymentManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getDeploymentsWithName(name: string, namespace: string) {
    try {
      const deployment = await this._dataSource.K8sClient.apis.apps.v1
        .namespace(namespace)
        .deployments(name)
        .get();
      const k8sDeployment = new K8sDeployment(deployment.body);
      if (k8sDeployment.isValid()) {
        return k8sDeployment;
      } else {
        return null;
      }
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to get deployment ${name}`);
      }
    }
  }

  async createDeployment(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    try {
      const deployment = await this._dataSource.K8sClient.apis.apps.v1
        .namespaces(namespace)
        .deployments.post({ body: deploymentRequest.model });
      const newDeployment = new K8sDeployment(deployment.body);
      if (newDeployment.isValid()) {
        logger.debug('Deployment ' + newDeployment.name + ' has been created');
        return newDeployment;
      } else {
        logger.error('Did not manage to create a kubernetes deployment');
      }
    } catch (error) {
      if (error.statusCode === 409) {
        return null;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to create deployment ${deploymentRequest.name}`);
      }
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

  async deleteDeployment(name: string, namespace: string) {
    try {
      await this._dataSource.K8sClient.apis.apps.v1
        .namespaces(namespace)
        .deployments(name)
        .delete();
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return false;
      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to delete deployment ${name} `);
      }
    }
  }
}
