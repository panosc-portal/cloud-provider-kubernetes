import { K8sDeployment, K8sDeploymentRequest } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger } from '../../utils';

export class K8sDeploymentManager {
  constructor(private _dataSource: KubernetesDataSource) {
  }

  async getWithComputeId(computeId: string, namespace: string): Promise<K8sDeployment> {
    try {
      logger.debug(`Getting kubernetes deployment ${computeId} in namespace ${namespace}`);
      const deployment = await this._dataSource.K8sClient.apis.apps.v1.namespace(namespace).deployments(computeId).get();
      const podList = await this._dataSource.K8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${computeId}` } });
      const k8sDeployment = new K8sDeployment(computeId, deployment.body,podList.body);

      if (k8sDeployment.isValid()) {
        logger.debug(`Got kubernetes deployment '${computeId}' in namespace '${namespace}'`);
        return k8sDeployment;
      
      } else {
        logger.error(`Kubernetes deployment with compute Id '${computeId}' is not valid`);
        throw new Error(`Kubernetes deployment with compute Id '${computeId}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes deployment '${computeId}' in namespace '${namespace}' does not exist`);
        return null;

      } else {
        logger.error(`Failed to get kubernetes deployment with compute Id '${computeId}': ${error.message}`);
        throw new Error(`Failed to get kubernetes deployment with compute Id '${computeId}': ${error.message}`);
      }
    }
  }

  async create(deploymentRequest: K8sDeploymentRequest, namespace: string): Promise<K8sDeployment> {
    try {
      logger.debug(`Creating kubernetes deployment '${deploymentRequest.name}' in namespace '${namespace}'`);
      const deployment = await this._dataSource.K8sClient.apis.apps.v1.namespaces(namespace).deployments.post({ body: deploymentRequest.model });
      const podList = await this._dataSource.K8sClient.api.v1.namespaces(namespace).pods.get({ qs: { labelSelector: `app=${deploymentRequest.name}` } });

      if (deployment.body == null || podList.body == null) {
        logger.error(`Failed to create k8s deployment with compute Id ${deploymentRequest.name} because PodList body or deployment body is null`)
        throw new Error(`Failed to create k8s deployment with compute Id ${deploymentRequest.name} because PodList body or deployment body is null`)

      } else {
        const newDeployment = new K8sDeployment(deploymentRequest.name, deployment.body, podList.body);
        if (newDeployment.isValid()) {
          logger.debug(`Deployment '${newDeployment.name}' in namespace '${namespace}' has been created`);
          return newDeployment;

        } else {
          logger.error(`Kubernetes deployment with compute Id '${deploymentRequest.name}' is not valid`);
          throw new Error(`Kubernetes deployment with compute Id '${deploymentRequest.name}' is not valid`);
        }
      }

    } catch (error) {
      logger.error(`Failed to create k8s deployment with compute Id '${deploymentRequest.name}': ${error.message}`);
      throw new Error(`Failed to create k8s deployment with compute Id '${deploymentRequest.name}': ${error.message}`);
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
      logger.debug(`Deleting kubernetes deployment '${computeId}' from namespace '${namespace}'`);    
      await this._dataSource.K8sClient.apis.apps.v1.namespaces(namespace).deployments(computeId).delete();
      logger.debug(`Deployment '${computeId}' has been deleted`);
      return true;

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Deployment '${computeId}' does not exist so not deleting`);

      } else {
        logger.error(`Error deleting deployment '${computeId}': ${error.message}`);
      }
      return false;
    }
  }
}
