import { K8sDeployment, K8sDeploymentRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';

export class K8sDeploymentManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getWithComputeId(computeId: string, namespace: string): Promise<K8sDeployment> {
    try {
      const deployment = await this._dataSource.K8sClient.apis.apps.v1
        .namespace(namespace)
        .deployments(computeId)
        .get();
      const podList = await this._dataSource.K8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${computeId}` } });
      const k8sDeployment = new K8sDeployment(deployment.body,podList.body);
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
        throw new Error(`Did not manage to get deployment ${computeId}`);
      }
    }
  }

  async create(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    try {
      const deployment = await this._dataSource.K8sClient.apis.apps.v1
        .namespaces(namespace)
        .deployments.post({ body: deploymentRequest.model });
      const podList = await this._dataSource.K8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${deploymentRequest.name}` } });
      const newDeployment = new K8sDeployment(deployment.body, podList.body);
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

  async createIfNotExist(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    const deploymentName = deploymentRequest.name;
    const existingDeployment = await this.getWithComputeId(deploymentName, namespace);
    if (existingDeployment == null) {
      return this.create(deploymentRequest, namespace);
    } else {
      return existingDeployment;
    }
  }

  async deleteWithComputeId(computeId: string, namespace: string): Promise<boolean> {
    try {
      await this._dataSource.K8sClient.apis.apps.v1
        .namespaces(namespace)
        .deployments(computeId)
        .delete();
      logger.debug(`Deployment  ${computeId} has been deleted`);
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        return false;

      } else {
        logger.error(error.message);
        throw new Error(`Did not manage to delete deployment ${computeId} `);
      }
    }
  }
}
