import { K8sDeployment, K8sDeploymentRequest, Instance } from '../../models';
import { KubernetesDataSource } from '../../datasources';
import { logger, LoggedError } from '../../utils';
import { APPLICATION_CONFIG } from '../../application-config';
import { K8sSecretManager } from './k8s-secret.manager';

export class K8sDeploymentManager {

  private _secretManager: K8sSecretManager;

  constructor(private _dataSource: KubernetesDataSource) {
    this._secretManager = new K8sSecretManager(this._dataSource);
  }

  async getWithComputeId(computeId: string, namespace: string): Promise<K8sDeployment> {
    try {
      logger.debug(`Getting kubernetes deployment '${computeId}' in namespace '${namespace}'`);
      const deployment = await this._dataSource.getDeployment(computeId, namespace);
      const podList = await this._dataSource.getPodsForDeployment(computeId, namespace);

      const k8sDeployment = new K8sDeployment(computeId, deployment, podList);

      if (k8sDeployment.isValid()) {
        logger.debug(`Got kubernetes deployment '${computeId}' in namespace '${namespace}'`);
        return k8sDeployment;
      
      } else {
        throw new LoggedError(`Kubernetes deployment with compute Id '${computeId}' is not valid`);
      }

    } catch (error) {
      if (error.statusCode === 404) {
        logger.debug(`Kubernetes deployment '${computeId}' in namespace '${namespace}' does not exist`);
        return null;

      } else {
        throw new LoggedError(`Failed to get kubernetes deployment with compute Id '${computeId}': ${error.message}`);
      }
    }
  }

  async create(instance: Instance, computeId: string, namespace: string): Promise<K8sDeployment> {
    try {
      const image = instance.image;
      const flavour = instance.flavour;

      // Determine if an image pull secret is needed
      const secretName = await this._secretManager.processSecretForRepository(image.repository, namespace); 

      const deploymentRequest = new K8sDeploymentRequest({name: computeId, image: image, flavour: flavour, imagePullSecret: secretName});

      logger.debug(`Creating kubernetes deployment for instance '${instance.id}' (${instance.name}) with computeId '${computeId}' in namespace '${namespace}'`);
      const deployment = await this._dataSource.createDeployment(deploymentRequest, namespace);
      const podList = await this._dataSource.getPodsForDeployment(deploymentRequest.name, namespace);

      const newDeployment = new K8sDeployment(deploymentRequest.name, deployment, podList);

      if (newDeployment.isValid()) {
        logger.debug(`Kubernetes deployment for instance '${instance.id}' ('${instance.name}') with computeId '${computeId}' created successfully`);
        return newDeployment;

      } else {
        throw new LoggedError(`Kubernetes deployment for instance '${instance.id}' (${instance.name}) with compute Id '${computeId}' is not valid`);
      }

    } catch (error) {
      throw new LoggedError(`Failed to create k8s deployment for instance '${instance.id}' (${instance.name}) with compute Id '${computeId}': ${error.message}`);
    }
  }

  async deleteWithComputeId(computeId: string, namespace: string): Promise<boolean> {
    try {
      logger.debug(`Deleting kubernetes deployment '${computeId}' from namespace '${namespace}'`);    
      await this._dataSource.deleteDeployment(computeId, namespace);
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

  async cleanup(validInstances: {namespace: string, computeId: string}[]): Promise<number> {
    try {
      const deploymentsResponse = await this._dataSource.getAllDeploymentsWithLabelSelector(`owner=${APPLICATION_CONFIG().kubernetes.ownerLabel}`);
      const deployments = deploymentsResponse.map((deployment: any) => ({name: deployment.metadata.name, namespace: deployment.metadata.namespace}));

      const invalidDeployments = deployments.filter((deployment: any) => {
        return (validInstances.find(instance => instance.computeId === deployment.name && instance.namespace === deployment.namespace) == null);
      })

      // Delete invalid deployments
      if (invalidDeployments.length > 0) {
        logger.debug(`Cleaning k8s deployments: deleting ${invalidDeployments.length}`);
        const results = await Promise.all(invalidDeployments.map((deployment: any) => {
          return this.deleteWithComputeId(deployment.name, deployment.namespace);
        }));
        const deletedCount = results.filter(result => result === true).length;
        logger.debug(`Cleaned k8s deployments: deleted ${deletedCount}`);
  
        return deletedCount;
      }
  
    } catch (error) {
      logger.error(`Error caught while cleaning k8s deployments: ${error.message}`);
    }
    return 0;
  }
}
