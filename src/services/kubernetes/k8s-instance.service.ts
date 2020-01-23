import { bind, BindingScope, inject, lifeCycleObserver } from '@loopback/core';
import { K8sServiceManager } from './k8s-service.manager';
import { Instance, K8sInstance, K8sDeployment, K8sService } from '../../models';
import { K8sDeploymentManager } from './k8s-deployment.manager';
import { KubernetesDataSource } from '../../datasources';
import { logger, LoggedError } from '../../utils';
import { K8sNamespaceManager } from './k8s-namespace.manager';
import * as uuidv4 from 'uuid/v4';
import { APPLICATION_CONFIG } from '../../application-config';
import { K8SRequestHelperService } from './k8s-request-helper.service';
import { K8sNodeService } from './k8s-node.service';

@lifeCycleObserver('server')
@bind({ scope: BindingScope.SINGLETON })
export class K8sInstanceService {
  private _deploymentManager: K8sDeploymentManager;
  private _serviceManager: K8sServiceManager;
  private _namespaceManager: K8sNamespaceManager;
  private _nodeService:  K8sNodeService;


  private _defaultNamespace = APPLICATION_CONFIG().kubernetes.defaultNamespace;

  get defaultNamespace(): string {
    return this._defaultNamespace;
  }

  get deploymentManager(): K8sDeploymentManager {
    return this._deploymentManager;
  }

  get serviceManager(): K8sServiceManager {
    return this._serviceManager;
  }

  get namespaceManager(): K8sNamespaceManager {
    return this._namespaceManager;
  }



  constructor(@inject('datasources.kubernetes') dataSource: KubernetesDataSource) {
    this._deploymentManager = new K8sDeploymentManager(dataSource);
    this._serviceManager = new K8sServiceManager(dataSource);
    this._namespaceManager = new K8sNamespaceManager(dataSource);
    this._nodeService = new K8sNodeService(dataSource)
  }

  async get(computeId: string, namespace: string): Promise<K8sInstance> {
    let k8sInstance: K8sInstance = null;
    try {
      const deployment = await this._deploymentManager.getWithComputeId(computeId, namespace);
      const service = await this._serviceManager.getWithComputeId(computeId, namespace);

      if (deployment != null && service != null) {
        k8sInstance = new K8sInstance(deployment, service, computeId, namespace, APPLICATION_CONFIG().kubernetes.host);

      } else if (deployment == null && service != null) {
        logger.error(`Deployment missing from kubernetes instance with compute Id '${computeId}': deleting kubernetes instance`);
        await this.delete(computeId, namespace);

      } else if (deployment != null && service == null) {
        logger.error(`Service missing from kubernetes instance with compute Id '${computeId}': deleting kubernetes instance`);
        await this.delete(computeId, namespace);
      }

    } catch (error) {
      logger.error(`Failed to get kubernetes instance with compute Id '${computeId}': ${error.message}`);
    }

    return k8sInstance;
  }

  async create(instance: Instance): Promise<K8sInstance> {
    let k8sInstance: K8sInstance = null;

    if (instance.image.protocols.length === 0) {
      throw new LoggedError(`Not creating kubernetes instance for instance '${instance.id}': image does not contain any protocols`);
    }

    if (instance.user == null) {
      throw new LoggedError(`Not creating kubernetes instance for instance '${instance.id}': no user is associated to the instance`);
    }

    // Get compute Id
    const instanceComputeId = await this.UUIDGenerator(instance.name, this._defaultNamespace);
    if (instanceComputeId != null) {
      logger.debug(`Creating kubernetes instance with compute Id '${instanceComputeId}' for instance '${instance.id}'`);

      try {
        // Create namespace if required
        await this._namespaceManager.createIfNotExist(this._defaultNamespace);

        // Create deployment
        const deployment = await this._deploymentManager.create(instance, instanceComputeId, this._defaultNamespace);

        // Create service
        const service = await this._serviceManager.create(instance, instanceComputeId, this._defaultNamespace);

        const masterNode = await this._nodeService.getMaster();

        k8sInstance = new K8sInstance(deployment, service, instanceComputeId, this._defaultNamespace,  masterNode.hostname);

      } catch (error) {
        // Cleanup
        await this.delete(instanceComputeId, this._defaultNamespace);

        throw new LoggedError(`Failed to create kubernetes instance for instance '${instance.id}' ('${instance.name}'): ${error.message}`);
      }
    }

    return k8sInstance;
  }

  async delete(instanceComputeId: string, namespace: string): Promise<boolean> {
    logger.debug(`Deleting deployment and service with computeId '${instanceComputeId}'`);
    const serviceDeleted = await this._serviceManager.deleteWithComputeId(instanceComputeId, namespace);
    const deploymentDeleted = await this._deploymentManager.deleteWithComputeId(instanceComputeId, namespace);

    return serviceDeleted && deploymentDeleted;
  }

  async cleanup(validInstances: {namespace: string, computeId: string}[]): Promise<{deploymentCount: number, serviceCount: number}> {
    const deploymentCount = await this._deploymentManager.cleanup(validInstances);
    const serviceCount = await this._serviceManager.cleanup(validInstances);

    return {deploymentCount, serviceCount};
  }

  async UUIDGenerator(name: string, namespace: string) {
    let computeId = null;
    try {
      let unique = false;
      while (!unique) {
        const modifiedName = name.replace(/ /g, `-`);
        const instanceComputeId = modifiedName.toLowerCase() + '-' + uuidv4();
        logger.debug(`Determining if computeId '${instanceComputeId}' is unique`);
        const deployment = await this._deploymentManager.getWithComputeId(instanceComputeId, namespace);
        const service = await this._serviceManager.getWithComputeId(instanceComputeId, namespace);
        unique = (deployment == null && service == null);
        if (unique) {
          logger.debug(`Determined unique computeId '${instanceComputeId}'`);
          computeId = instanceComputeId;
        }
      }
    } catch (error) {
      logger.error(`Failed to get a unique kubernetes compute Id: ${error.message}`);
    }
    return computeId;
  }

  async initDefaultNamespace(): Promise<void> {
    this._defaultNamespace = APPLICATION_CONFIG().kubernetes.defaultNamespace || this.defaultNamespace;
  }

  async start(): Promise<void> {
    await this.initDefaultNamespace();
  }
}
